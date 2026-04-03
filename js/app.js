// js/app.js

const STORAGE_KEY = "expense-tracker-transactions";

/**
 * Loads transactions from localStorage.
 * Returns an empty array if the key is absent or the stored value is invalid JSON.
 * @returns {Array} Transaction[]
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves transactions to localStorage.
 * Displays an error in #error-msg if the write fails (quota exceeded, private mode, etc.).
 * @param {Array} txns - Transaction[]
 */
function saveToStorage(txns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  } catch (err) {
    const errorEl = document.getElementById("error-msg");
    if (errorEl) {
      errorEl.textContent = "Unable to save data: storage is unavailable or full.";
    }
  }
}

// Module-level transactions array
let transactions = [];

// Current sort key: "date" | "amount" | "category"
let sortKey = "date";

// Module-level Chart.js instance (destroyed and recreated on each renderChart call)
let chartInstance = null;

/**
 * Adds a new transaction to the list, persists it, and re-renders the UI.
 * @param {string} name - Item name (non-empty)
 * @param {number} amount - Positive float
 * @param {string} category - One of "Food" | "Transport" | "Fun"
 */
function addTransaction(name, amount, category) {
  const id = (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString();

  transactions.push({ id, name, amount, category, date: new Date().toISOString() });
  saveToStorage(transactions);
  renderList();
  renderBalance();
  renderChart();
  renderMonthlySummary();
}

/**
 * Removes the transaction with the given id, persists the change, and re-renders the UI.
 * @param {string} id - The id of the transaction to remove
 */
function deleteTransaction(id) {
  transactions = transactions.filter(txn => txn.id !== id);
  saveToStorage(transactions);
  renderList();
  renderBalance();
  renderChart();
  renderMonthlySummary();
}

/**
 * Validates the form fields before submission.
 * @param {string} name - Item name
 * @param {string|number} amount - Amount value
 * @param {string} category - Selected category
 * @returns {string|null} Error message string, or null if all fields are valid
 */
function validateForm(name, amount, category) {
  if (!name.trim()) return "Item name is required.";
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) return "Amount must be a positive number.";
  if (!category) return "Please select a category.";
  return null;
}

/**
 * Handles the expense form submit event.
 * Validates inputs, shows errors, or adds the transaction and resets the form.
 * @param {Event} event
 */
function handleSubmit(event) {
  event.preventDefault();

  const nameEl = document.getElementById("item-name");
  const amountEl = document.getElementById("amount");
  const categoryEl = document.getElementById("category");
  const errorEl = document.getElementById("error-msg");

  const name = nameEl.value;
  const amount = amountEl.value;
  const category = categoryEl.value;

  const error = validateForm(name, amount, category);
  if (error) {
    errorEl.textContent = error;
    return;
  }

  errorEl.textContent = "";
  addTransaction(name.trim(), parseFloat(amount), category);
  nameEl.value = "";
  amountEl.value = "";
  categoryEl.value = "";
}

document.getElementById("expense-form").addEventListener("submit", handleSubmit);

/**
 * Formats a number as a USD currency string (e.g. 12.5 → "$12.50").
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  return "$" + value.toFixed(2);
}

/**
 * Returns a sorted copy of transactions based on the current sortKey.
 * "date" → newest first, "amount" → highest first, "category" → A-Z
 */
function getSorted() {
  const copy = transactions.slice();
  if (sortKey === "amount") {
    return copy.sort((a, b) => b.amount - a.amount);
  }
  if (sortKey === "category") {
    return copy.sort((a, b) => a.category.localeCompare(b.category));
  }
  // default: date — newest first (reverse insertion order)
  return copy.reverse();
}

/**
 * Clears and rebuilds #transaction-list from the current transactions array.
 * Transactions are displayed in reverse insertion order (most recent first).
 * Each item shows name, amount, category, and a delete button.
 */
function renderList() {
  const list = document.getElementById("transaction-list");
  list.innerHTML = "";

  getSorted().forEach(txn => {
    const li = document.createElement("li");
    li.dataset.id = txn.id;
    li.innerHTML =
      `<span class="txn-name">${txn.name}</span>` +
      `<span class="txn-amount">${formatCurrency(txn.amount)}</span>` +
      `<span class="txn-category" data-cat="${txn.category}">${txn.category}</span>` +
      `<button class="delete-btn" aria-label="Delete ${txn.name}">🗑</button>`;

    li.querySelector(".delete-btn").addEventListener("click", () => {
      deleteTransaction(txn.id);
    });

    list.appendChild(li);
  });
}

/**
 * Sums all transaction amounts and updates the #balance element.
 * Formatted as currency (e.g. $0.00).
 */
function renderBalance() {
  const total = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  document.getElementById("balance").textContent = formatCurrency(total);
}

/**
 * Aggregates transaction amounts by category and updates (or creates) the Chart.js pie chart.
 * Categories with zero total are excluded from the dataset.
 * If Chart.js is not available, logs a warning and returns early.
 */
function renderChart() {
  if (typeof window.Chart === "undefined") {
    console.warn("Chart.js is not loaded. The chart cannot be rendered.");
    return;
  }

  const totals = { Food: 0, Transport: 0, Fun: 0 };
  transactions.forEach(txn => {
    if (totals.hasOwnProperty(txn.category)) {
      totals[txn.category] += txn.amount;
    }
  });

  const labels = Object.keys(totals).filter(cat => totals[cat] > 0);
  const data = labels.map(cat => totals[cat]);

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = document.getElementById("chart-canvas").getContext("2d");
  chartInstance = new window.Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
      }]
    },
    options: {
      responsive: true
    }
  });
}

/**
 * Groups transactions by month and renders a monthly summary table.
 * Each month shows total spent and a per-category breakdown.
 */
function renderMonthlySummary() {
  const container = document.getElementById("monthly-summary");

  if (transactions.length === 0) {
    container.innerHTML = '<p class="summary-empty">No transactions yet.</p>';
    return;
  }

  // Group by "YYYY-MM"
  const months = {};
  transactions.forEach(txn => {
    const date = txn.date ? new Date(txn.date) : new Date();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!months[key]) months[key] = { total: 0, Food: 0, Transport: 0, Fun: 0 };
    months[key].total += txn.amount;
    if (months[key][txn.category] !== undefined) months[key][txn.category] += txn.amount;
  });

  // Sort months descending
  const sorted = Object.keys(months).sort((a, b) => b.localeCompare(a));

  container.innerHTML = sorted.map(key => {
    const m = months[key];
    const [year, month] = key.split("-");
    const label = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });
    const cats = ["Food", "Transport", "Fun"]
      .filter(c => m[c] > 0)
      .map(c => `<span class="summary-cat" data-cat="${c}"><span class="summary-cat-name">${c}</span><span class="summary-cat-amt">${formatCurrency(m[c])}</span></span>`)
      .join("");
    return `
      <div class="summary-month">
        <div class="summary-month-header">
          <span class="summary-month-label">${label}</span>
          <span class="summary-month-total">${formatCurrency(m.total)}</span>
        </div>
        ${cats ? `<div class="summary-cats">${cats}</div>` : ""}
      </div>`;
  }).join("");
}
transactions = loadFromStorage();
renderList();
renderBalance();
renderChart();
renderMonthlySummary();

// ── Sort controls ────────────────────────────────────────────
document.querySelectorAll(".sort-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    sortKey = btn.dataset.sort;
    document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderList();
  });
});

// ── Theme toggle ─────────────────────────────────────────────
const THEME_KEY = "expense-tracker-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("theme-toggle").textContent = theme === "dark" ? "☀️" : "🌙";
}

(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const preferred = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(preferred);
})();

document.getElementById("theme-toggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});
