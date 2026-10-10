
"use strict";

// 1. Store the budget and expenses using variables and an array.
let budget = 50000;

let expenses = [
    {
        id: 1,
        name: "Food",
        amount: 500,
        category: "Food",
        date: new Date().toLocaleDateString()
    },
    {
        id: 2,
        name: "Transport",
        amount: 300,
        category: "Transport",
        date: new Date().toLocaleDateString()
    }
];

let nextExpenseId = 3;

// 2. Select HTML elements using the DOM.
const budgetForm = document.getElementById("budget-form");
const budgetInput = document.getElementById("budget-input");

const expenseForm = document.getElementById("expense-form");
const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseCategory = document.getElementById("expense-category");

const categoryFilter = document.getElementById("category-filter");
const expenseList = document.getElementById("expense-list");

const totalBudgetDisplay = document.getElementById("total-budget");
const totalExpensesDisplay = document.getElementById("total-expenses");
const remainingBalanceDisplay = document.getElementById("remaining-balance");
const budgetUsedDisplay = document.getElementById("budget-used");
const progressBar = document.getElementById("progress-bar");
const budgetMessage = document.getElementById("budget-message");
const feedbackPanel = document.querySelector(".feedback-panel");
const expenseCount = document.getElementById("expense-count");

// 3. Format amounts as Kenyan shillings.
function formatMoney(amount) {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 2
    }).format(amount);
}

// 4. Calculate total expenses using a loop.
function calculateTotalExpenses() {
    let total = 0;

    for (let i = 0; i < expenses.length; i++) {
        total += expenses[i].amount;
    }

    return total;
}

// 5. Update the dashboard using DOM manipulation.
function updateDashboard() {
    const totalExpenses = calculateTotalExpenses();
    const remainingBalance = budget - totalExpenses;

    // Conditional decision making.
    let percentageUsed = 0;

    if (budget > 0) {
        percentageUsed = (totalExpenses / budget) * 100;
    }

    totalBudgetDisplay.textContent = formatMoney(budget);
    totalExpensesDisplay.textContent = formatMoney(totalExpenses);
    remainingBalanceDisplay.textContent = formatMoney(remainingBalance);
    budgetUsedDisplay.textContent = percentageUsed.toFixed(1) + "%";

    // Prevent the progress bar from exceeding its visual limit.
    const progressWidth = Math.min(Math.max(percentageUsed, 0), 100);
    progressBar.style.width = progressWidth + "%";

    // Change feedback based on the user's financial situation.
    feedbackPanel.classList.remove("warning", "danger");

    if (remainingBalance < 0) {
        budgetMessage.textContent =
            "Warning! You have exceeded your budget by " +
            formatMoney(Math.abs(remainingBalance)) + ".";
        feedbackPanel.classList.add("danger");
        remainingBalanceDisplay.style.color = "#c0392b";
        progressBar.style.backgroundColor = "#c0392b";
    } else if (percentageUsed >= 80) {
        budgetMessage.textContent =
            "Careful! You have used " + percentageUsed.toFixed(1) +
            "% of your budget. Reduce unnecessary spending.";
        feedbackPanel.classList.add("warning");
        remainingBalanceDisplay.style.color = "#d99a18";
        progressBar.style.backgroundColor = "#d99a18";
    } else {
        budgetMessage.textContent =
            "You are within your budget. Keep it up!";
        remainingBalanceDisplay.style.color = "#176b55";
        progressBar.style.backgroundColor = "#176b55";
    }

    // Use a loop to display all expense records.
    displayExpenses();
}

// 6. Display expense records in the HTML table.
function displayExpenses() {
    expenseList.replaceChildren();

    const selectedCategory = categoryFilter.value;
    let displayedCount = 0;

    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];

        // Show all records or only the selected category.
        if (
            selectedCategory !== "All" &&
            expense.category !== selectedCategory
        ) {
            continue;
        }

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = expense.name;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = expense.category;

        const amountCell = document.createElement("td");
        amountCell.textContent = formatMoney(expense.amount);

        const dateCell = document.createElement("td");
        dateCell.textContent = expense.date;

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.setAttribute("aria-label", "Delete " + expense.name);

        // Store the record ID on its delete button.
        deleteButton.dataset.id = String(expense.id);

        actionCell.appendChild(deleteButton);

        row.append(
            nameCell,
            categoryCell,
            amountCell,
            dateCell,
            actionCell
        );

        expenseList.appendChild(row);
        displayedCount++;
    }

    // Display a helpful message when no records match.
    if (displayedCount === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-state";
        cell.textContent = expenses.length === 0
            ? "No expenses yet. Add your first expense above."
            : "No expenses found in this category.";

        row.appendChild(cell);
        expenseList.appendChild(row);
    }

    expenseCount.textContent =
        displayedCount + (displayedCount === 1
            ? " expense displayed"
            : " expenses displayed");
}

// 7. Handle the budget form submission.
budgetForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const newBudget = Number(budgetInput.value);

    if (!Number.isFinite(newBudget) || newBudget <= 0) {
        alert("Please enter a budget greater than zero.");
        return;
    }

    budget = newBudget;
    updateDashboard();

    budgetInput.value = "";
});

// 8. Handle adding a new expense.
expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;

    // Validate the user's input.
    if (name === "") {
        alert("Please enter an expense name.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter an amount greater than zero.");
        return;
    }

    // Add a new record to the expenses array.
    const newExpense = {
        id: nextExpenseId++,
        name: name,
        amount: amount,
        category: category,
        date: new Date().toLocaleDateString()
    };

    expenses.push(newExpense);

    // Clear the form and refresh the dashboard.
    expenseForm.reset();
    updateDashboard();
});

// 9. Use event delegation to handle delete button clicks.
expenseList.addEventListener("click", function (event) {
    if (!event.target.matches(".delete-button")) {
        return;
    }

    const expenseId = Number(event.target.dataset.id);

    // Filter out the selected record from the array.
    expenses = expenses.filter(function (expense) {
        return expense.id !== expenseId;
    });

    updateDashboard();
});

// 10. Update the displayed records when the filter changes.
categoryFilter.addEventListener("change", function () {
    displayExpenses();
});

// 11. Render the initial dashboard when the page loads.
updateDashboard();