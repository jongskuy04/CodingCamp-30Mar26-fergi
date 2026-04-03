# Requirements Document

## Introduction

A mobile-friendly Expense & Budget Visualizer web app that runs entirely in the browser with no backend. Users can add expense transactions with a name, amount, and category, view a scrollable list of all transactions, see their total balance update in real time, and visualize spending by category in a pie chart. The app is designed to work well on phones and small screens, adapting its layout responsively. All data is persisted in the browser's Local Storage. The app is built with HTML, CSS, and Vanilla JavaScript only, using a single CSS file and a single JavaScript file.

## Glossary

- **App**: The Expense Tracker single-page web application.
- **Transaction**: A single expense record with an item name, amount, and category.
- **Category**: A fixed label grouping transactions. Valid values are: Food, Transport, Fun.
- **Balance**: The sum of all Transaction amounts currently stored.
- **Storage**: The browser's Local Storage API used to persist all app data client-side.
- **Chart**: A pie chart rendered on an HTML canvas element showing spending distribution by category.

---

## Requirements

### Requirement 1: Add Transactions via Input Form

**User Story:** As a user, I want to fill in a form with an item name, amount, and category, so that I can record a new expense transaction.

#### Acceptance Criteria

1. THE App SHALL provide a form with three fields: Item Name (text), Amount (positive number), and Category (select with options: Food, Transport, Fun).
2. WHEN the user submits the form with all fields filled and valid, THE App SHALL save the Transaction to Storage and add it to the transaction list immediately.
3. IF the user submits the form with one or more empty fields, THEN THE App SHALL display a validation error and SHALL NOT save the Transaction.
4. WHEN a Transaction is successfully added, THE App SHALL clear the form fields so the user can enter a new transaction.

---

### Requirement 2: View and Delete Transactions

**User Story:** As a user, I want to see a scrollable list of all my transactions and be able to delete any of them, so that I can review and manage my expense history.

#### Acceptance Criteria

1. THE App SHALL display all Transactions in a scrollable list, each showing the item name, amount, and category.
2. THE App SHALL display Transactions in the order they were added, with the most recent at the top.
3. WHEN the user clicks the delete control on a Transaction, THE App SHALL remove that Transaction from Storage and from the list immediately.

---

### Requirement 3: Display Total Balance

**User Story:** As a user, I want to see my total balance at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE App SHALL display the total Balance at the top of the page, calculated as the sum of all Transaction amounts.
2. WHEN a Transaction is added, THE App SHALL recalculate and update the displayed Balance immediately without a page reload.
3. WHEN a Transaction is deleted, THE App SHALL recalculate and update the displayed Balance immediately without a page reload.

---

### Requirement 4: Visualize Spending with a Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can quickly understand how my expenses are distributed.

#### Acceptance Criteria

1. THE App SHALL render a pie Chart showing the proportion of total spending for each Category (Food, Transport, Fun).
2. WHEN a Transaction is added, THE App SHALL update the Chart immediately to reflect the new spending distribution.
3. WHEN a Transaction is deleted, THE App SHALL update the Chart immediately to reflect the updated spending distribution.
4. WHERE no Transactions exist for a Category, THE App SHALL omit that Category's segment from the Chart.

---

### Requirement 5: Persist and Restore Data

**User Story:** As a user, I want my transactions to be saved automatically, so that I do not lose my data when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN the App initializes, THE App SHALL load all Transactions from Storage and render the transaction list, Balance, and Chart with the restored data.
2. WHEN a Transaction is added or deleted, THE App SHALL write the updated Transaction list to Storage as serialized JSON before the operation is considered complete.
3. IF Storage is unavailable or a write operation fails, THEN THE App SHALL display an error message informing the user that data cannot be saved.

---

### Requirement 6: Technical Constraints

**User Story:** As a developer, I want the app to use only HTML, CSS, and Vanilla JavaScript with a minimal file structure, so that the codebase stays simple and runs in any modern browser without a build step.

#### Acceptance Criteria

1. THE App SHALL be implemented using HTML, CSS, and Vanilla JavaScript only, with no frameworks or libraries except a chart library (e.g., Chart.js) for rendering the pie Chart.
2. THE App SHALL use exactly one CSS file located inside a `css/` directory.
3. THE App SHALL use exactly one JavaScript file located inside a `js/` directory.
4. THE App SHALL persist all data exclusively in the browser's Local Storage API, with no data transmitted to or stored on any backend server.
5. THE App SHALL function correctly in current stable versions of Chrome, Firefox, Edge, and Safari.
6. THE App SHALL require no backend server and no build or test tooling to run.
7. WHERE the App is deployed as a browser extension, THE App SHALL operate correctly using the extension's local file context without requiring a remote server.

---

### Requirement 7: Non-Functional Requirements

**User Story:** As a user, I want the app to load quickly, respond without lag, and present a clean and readable interface, so that tracking expenses feels effortless and pleasant.

#### Acceptance Criteria

1. THE App SHALL present a minimal interface with only the controls and information necessary to add, view, and delete transactions.
2. WHEN the App is opened for the first time, THE App SHALL be usable without any configuration or setup steps.
3. WHEN the user interacts with any control (form submission, delete button), THE App SHALL update the UI within 100 milliseconds on a standard desktop device.
4. WHEN the App loads, THE App SHALL render the full initial UI within 2 seconds on a standard broadband connection.
5. THE App SHALL apply a consistent visual hierarchy so that the Balance, transaction list, and Chart are each clearly distinguishable from one another.
6. THE App SHALL use typography with a minimum font size of 14px for all body text to ensure readability.
7. THE App SHALL be responsive and usable on mobile devices (phones) without horizontal scrolling or overlapping elements.
8. THE App SHALL render touch targets (buttons, form controls) at a minimum size of 44x44 pixels so they can be tapped comfortably on a phone screen.
9. THE App SHALL adapt its layout to viewport widths as small as 320px.
