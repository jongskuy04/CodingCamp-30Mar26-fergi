# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a zero-dependency, single-page Expense & Budget Visualizer using plain HTML, CSS, and Vanilla JavaScript. Implementation follows the state → render cycle defined in the design: mutate the in-memory `transactions` array, persist to `localStorage`, then re-render all UI regions. The app uses a mobile-first responsive layout that stacks sections in a single column on small screens and centers content in a max-width container on larger ones.

## Tasks

- [x] 1. Create project file structure and HTML skeleton
  - Create `index.html` with all required elements: `#balance`, `#expense-form` (name/amount/category fields + submit), `#error-msg`, `#transaction-list` (`<ul>`), and `#chart-canvas` (`<canvas>`)
  - Add `<meta name="viewport" content="width=device-width, initial-scale=1">` to `<head>` for correct mobile rendering
  - Add `<link>` to `css/style.css` and `<script>` tags for Chart.js CDN and `js/app.js`
  - Create empty `css/style.css` and `js/app.js` placeholder files
  - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.5, 7.7, 7.8, 7.9_

- [x] 2. Implement storage layer
  - [x] 2.1 Implement `loadFromStorage()` and `saveToStorage(txns)`
    - `loadFromStorage()` reads key `"expense-tracker-transactions"` from `localStorage`, parses JSON, returns array; returns `[]` on missing key or parse error (silent recovery)
    - `saveToStorage(txns)` serializes array to JSON and writes to `localStorage`; catches quota/private-mode errors and displays message in `#error-msg`
    - _Requirements: 5.1, 5.2, 5.3_
    

  - [x] 2.2 Write property test for storage persistence round-trip
    - **Property 9: Storage persistence round-trip**
    - **Validates: Requirements 5.1, 5.2**
    - include responsesif design

- [x] 3. Implement core transaction logic
  - [x] 3.1 Implement `addTransaction(name, amount, category)`
    - Generate a unique `id` via `crypto.randomUUID()` (fallback: `Date.now().toString()`)
    - Push new Transaction object onto the module-level `transactions` array
    - Call `saveToStorage(transactions)`, then call all three render functions
    - _Requirements: 1.2, 5.2_

  - [x] 3.2 Implement `deleteTransaction(id)`
    - Filter the transaction with the matching `id` out of `transactions`
    - Call `saveToStorage(transactions)`, then call all three render functions
    - _Requirements: 2.3, 5.2_

  - [x] 3.3 Write property test for add round-trip
    - **Property 2: Transaction add round-trip**
    - **Validates: Requirements 1.2, 5.2**

  - [x] 3.4 Write property test for delete round-trip
    - **Property 6: Delete round-trip**
    - **Validates: Requirements 2.3, 5.2**

- [x] 4. Implement form validation and submit handler
  - [x] 4.1 Implement `validateForm(name, amount, category)`
    - Return an error string if name is empty, amount is non-positive or NaN, or category is empty; return `null` when all fields are valid
    - _Requirements: 1.3_

  - [x] 4.2 Implement `handleSubmit(event)`
    - Call `event.preventDefault()`, read field values, call `validateForm()`
    - On invalid: display error in `#error-msg` and return early
    - On valid: clear `#error-msg`, call `addTransaction()`, reset all form fields
    - Attach as listener to `#expense-form` submit event
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 4.3 Write property test for invalid form submissions rejected
    - **Property 1: Invalid form submissions are rejected**
    - **Validates: Requirements 1.3**

  - [x] 4.4 Write property test for form cleared after successful add
    - **Property 3: Form is cleared after successful add**
    - **Validates: Requirements 1.4**

- [x] 5. Checkpoint — verify add/delete/validation flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement render functions
  - [x] 6.1 Implement `renderList()`
    - Clear `#transaction-list`, then prepend a `<li>` for each transaction in reverse insertion order (most recent first), showing name, amount, category, and a delete button wired to `deleteTransaction(id)`
    - _Requirements: 2.1, 2.2_

  - [x] 6.2 Write property test for list renders all transaction data
    - **Property 4: List renders all transaction data**
    - **Validates: Requirements 2.1**

  - [x] 6.3 Write property test for list ordered most-recent-first
    - **Property 5: List is ordered most-recent-first**
    - **Validates: Requirements 2.2**

  - [x] 6.4 Implement `renderBalance()`
    - Sum all `transaction.amount` values and update `#balance` text content
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 6.5 Write property test for balance equals sum of all amounts
    - **Property 7: Balance equals sum of all amounts**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [x] 6.6 Implement `renderChart()`
    - Reduce `transactions` into per-category totals (`Food`, `Transport`, `Fun`); exclude categories with zero total
    - If `window.Chart` is undefined, log a console warning and return early
    - Destroy existing `chartInstance` if present, then create a new `Chart` pie instance on `#chart-canvas`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 6.7 Write property test for chart data matches category totals
    - **Property 8: Chart data matches category totals**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 7. Implement app initialization
  - Call `loadFromStorage()` on page load, assign result to `transactions`, then call `renderList()`, `renderBalance()`, and `renderChart()`
  - _Requirements: 5.1_

  - [x] 7.1 Write property test for storage persistence round-trip (reload simulation)
    - **Property 9: Storage persistence round-trip**
    - **Validates: Requirements 5.1, 5.2**

- [x] 8. Style the app with CSS
  - Write `css/style.css` with layout for the balance display, form, transaction list (scrollable), and chart canvas
  - Implement mobile-first single-column layout (balance → form → list → chart) using flexbox
  - Set max-width of 480px on the main container, centered with `margin: 0 auto`
  - Set minimum height of 44px on all buttons, inputs, and select elements (touch targets)
  - Set minimum font size of 14px for all body text
  - Ensure no horizontal overflow at 320px viewport width using `box-sizing: border-box` and `max-width: 100%`
  - Ensure the app is usable in Chrome, Firefox, Edge, and Safari without vendor-specific hacks
  - _Requirements: 6.2, 6.4, 7.6, 7.7, 7.8, 7.9_

- [x] 9. Final checkpoint — full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- No build tools, test runner, or framework should be introduced (Requirement 6.5)
- Property tests reference the correctness properties defined in `design.md`
