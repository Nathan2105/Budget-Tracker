let transactions = [
    {
        id: 1,
        date: "2025-01-14",
        amount: -440,
        status: "Success",
        type: "expense",
    },

    {
        id: 2,
        date: "2025-01-10",
        amount: -440,
        status: "Success",
        type: "expense",
    },

    {
        id: 3,
        date: "2025-01-25",
        amount: -440,
        status: "Success",
        type: "expense",
    },
];


function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("spendingLimit", spendingLimit);

    localStorage.setItem("income", monthlyIncome);
    localStorage.setItem("expenses", monthlyExpenses);
}

let manualIncomeOverride = null;
let manualExpenseOverride = null;

function loadData() {
    const storedTransactions = localStorage.getItem("transactions");
    const storedIncome = localStorage.getItem("income");
    const storedExpenses = localStorage.getItem("expenses");
    const storedLimit = localStorage.getItem("spendingLimit");

    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }

    monthlyIncome = storedIncome ? parseFloat(storedIncome) : 0;
    monthlyExpenses = storedExpenses ? parseFloat(storedExpenses) : 0;
    spendingLimit = storedLimit ? parseFloat(storedLimit) : 0;


}

let monthlyIncome = 0;
let monthlyExpenses = 0;
let spendingLimit = 0;

let currentView = "daily";
let activeCategoryFilter = "all";

let financeChart;
let currentSort = "day";
let filters = {
    date: "",
    month: "",
    year: "",
    category: "all",
    status: "all",
    search: ""
};



function parseLocalDate(dateStr) {
    return toDate(dateStr);
}


function openIncomeModal() {
    document.getElementById('incomeModal').style.display = 'block'
    document.body.style.overflow = 'hidden'
}

function openExpenseModal() {
    document.getElementById('expenseModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function toggleIncomeMenu(event) {
    event.stopPropagation();

    const menu = document.getElementById("incomeMenu");

    document.querySelectorAll(".card-menu-dropdown")
        .forEach(m => m.style.display = "none");

    // toggle current menu
    menu.style.display =
        menu.style.display === "block" ? "none" : "block";
}

// close when clicking outside (ONCE)
document.addEventListener("click", () => {
    document.querySelectorAll(".card-menu-dropdown")
        .forEach(m => m.style.display = "none");
});

function toggleExpenseMenu(event) {
    event.stopPropagation();

    const menu = document.getElementById("expenseMenu");

    document.querySelectorAll(".card-menu-dropdown")
        .forEach(m => m.style.display = "none");

    menu.style.display =
        menu.style.display === "block" ? "none" : "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';

    const today = new Date().toISOString().split('T')[0];

    if (modalId === 'incomeModal') {
        document.getElementById('incomeForm').reset();
        document.getElementById('incomeDate').value = today;
    }

    if (modalId === 'expenseModal') {
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseDate').value = today;
    }

    if (modalId === 'incomeEditModal') {
        document.getElementById('editIncomeValue').value = '';
    }
}

function toDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day); 
}

function updateDashboard() {
    const displayIncome = monthlyIncome;

    const displayExpenses = monthlyExpenses;
    console.log("Monthly Expenses:", monthlyExpenses);

    // MAIN CARDS
    document.querySelector('.income-amount').textContent =
        `$${Number(displayIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    document.querySelector('.expense-amount').textContent =
        `$${Number(displayExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

   
    // MONTHLY COMPARISONS
    
    const incomeChangeEl = document.querySelectorAll(".change")[0];
    const expenseChangeEl = document.querySelectorAll(".change")[1];

    if (incomeChangeEl) {
        const incomeComparison = getMonthlyIncomeComparison();

        incomeChangeEl.innerHTML = `
            <i class="fas fa-arrow-${incomeComparison.isUp ? "up" : "down"}"></i>
            ${incomeComparison.percentChange}% vs Last month
        `;
    }

    if (expenseChangeEl) {
        const expenseComparison = getMonthlyExpenseComparison();

        expenseChangeEl.innerHTML = `
            <i class="fas fa-arrow-${expenseComparison.isUp ? "up" : "down"}"></i>
            ${expenseComparison.percentChange}% vs Last month
        `;
    }

    
    // TOTAL EXPENSE CARD
   
    const totalExpensesEl = document.querySelector(".total-expenses");

    if (totalExpensesEl) {
        totalExpensesEl.textContent =
            `$${monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }

    
    // CURRENT MONTH 
    
    const monthLabelEl = document.querySelector('.current-month');

    if (monthLabelEl) {
        let displayDate;

        if (filters.month) {
            const [year, month] = filters.month.split("-");
            displayDate = new Date(year, month - 1);
        } else {
            displayDate = new Date();
        }

        monthLabelEl.textContent = displayDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
    }

    
    // ADD MONTH TO CARD TITLES 
    
    const monthLabels = document.querySelectorAll(".month-label");

    let displayDate;

    if (filters.month) {
        const [year, month] = filters.month.split("-");
        displayDate = new Date(year, month - 1);
    } else {
        displayDate = new Date();
    }

    const formattedMonth = displayDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric"
    });

    monthLabels.forEach(el => {
        el.textContent = `(${formattedMonth})`;
    });
}

function setLimit() {
    const value = parseFloat(document.getElementById("limitInput").value);
    if (!isNaN(value)) {
        spendingLimit = value;
        saveData();
        refreshUI();
    }
}

window.onclick = function (event) {
    const incomeModal = document.getElementById('incomeModal')
    const expenseModal = document.getElementById('expenseModal')

    if (event.target === incomeModal) {
        closeModal('incomeModal')
    }

    if (event.target === expenseModal) {
        closeModal('expenseModal')
    }
};

function applyFilters() {
    filters.date = document.getElementById("filterDate").value;
    filters.month = document.getElementById("filterMonth").value;
    filters.year = document.getElementById("filterYear").value;
    filters.search = document.getElementById("filterCategoryInput").value.toLowerCase();
    filters.status = document.getElementById("filterStatusSelect").value;

    refreshUI();
}

function clearFilters() {
    document.getElementById("filterDate").value = "";
    document.getElementById("filterMonth").value = "";
    document.getElementById("filterYear").value = "";
    document.getElementById("filterCategoryInput").value = "";
    document.getElementById("filterStatusSelect").value = "all";

    applyFilters();
}

function addIncome() {
    const amount = parseFloat(document.getElementById("incomeAmount").value);
    const category = document.getElementById("incomeCategory").value;
    const description = document.getElementById("incomeDescription").value;
    const date = document.getElementById("incomeDate").value;

    if (!amount || !category || !date) {
        alert("Please fill in all required fields");
        return;
    }

    const newTransaction = {
        id: Date.now(),
        date,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount,
        status: "Success",
        type: "income",
        description
    };

    transactions.unshift(newTransaction);

    saveData();
    refreshUI();

    closeModal("incomeModal");
    showNotification("Income added successfully", "success");
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);

    saveData();
    refreshUI();
}

function addExpense() {
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const category = document.getElementById("expenseCategory").value;
    const description = document.getElementById("expenseDescription").value;
    const date = document.getElementById("expenseDate").value;

    if (!amount || !category || !description || !date) {
        alert("Please fill in all fields");
        return;
    }

    const numAmount = Number(amount);


    // 2. Create transaction
    const newTransaction = {
        id: Date.now(),
        date,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount: -Math.abs(numAmount),
        status: "Success",
        type: "expense",
        description
    };

    // 3. Save transaction
    transactions.unshift(newTransaction);

    saveData();
    refreshUI();

    updateCategoryBreakdown(); 

    closeModal("expenseModal");
    showNotification("Expense added successfully", "success");
}

function getFilteredTransactions() {
    let filtered = [...transactions];

    const now = new Date();

    if (currentView === "weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);

        filtered = filtered.filter(t => {
            return toDate(t.date) >= weekAgo;
        });
    }

    if (currentView === "monthly") {
        filtered = filtered.filter(t => {
            const d = toDate(t.date);
            return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
            );
        });
    }

   
    // UI FILTERS
    
    if (filters.date) {
        filtered = filtered.filter(t => t.date === filters.date);
    }

    if (filters.month) {
        filtered = filtered.filter(t => t.date.slice(0, 7) === filters.month);
    }

    if (filters.year) {
        filtered = filtered.filter(t =>
            toDate(t.date).getFullYear().toString() === filters.year
        );
    }

    if (filters.category && filters.category !== "all") {
        filtered = filtered.filter(t =>
            (t.category || "").toLowerCase().trim() === filters.category.toLowerCase().trim()
        );
    }

    if (filters.status && filters.status !== "all") {
        filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        filtered = filtered.filter(t =>
            (t.category || "").toLowerCase().includes(q) ||
            (t.description || "").toLowerCase().includes(q)
        );
    }

    return filtered;
}

function filterByCategory(category) {
    activeCategoryFilter = category;
    updateTransactionsTable();
}

function refreshUI() {
    calculateTotals();
    updateDashboard();
    updateTransactionsTable();
    updateChart();
    updateCategoryBreakdown();
}

function getMonthlyDailySummary() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const summary = {};

    // initialize all days
    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

        summary[key] = {
            income: 0,
            expense: 0
        };
    }

    // fill data
    getFilteredTransactions().forEach(t => {
        const date = t.date;

        const d = toDate(t.date);
        if (d.getMonth() !== month || d.getFullYear() !== year) return;

        if (!summary[date]) return;

        if (t.type === "income") {
            summary[date].income += t.amount;
        } else {
            summary[date].expense += Math.abs(t.amount);

            if (currentView === "monthly" && filters.month) {
                filtered = filtered.filter(t => t.date.startsWith(filters.month));
            }
        }
    });

    return summary;
}

function getMonthlyOverviewArray() {
    const data = getMonthlyDailySummary();

    return Object.entries(data).map(([date, values]) => ({
        date,
        income: values.income,
        expense: values.expense
    }));
}

function renderMonthlyOverview() {
    const tbody = document.querySelector("#monthlyOverviewTable tbody");
    if (!tbody) return;

    const data = getMonthlyOverviewArray();

    tbody.innerHTML = "";

    data.forEach(day => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${new Date(day.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        })}</td>
            <td style="color:green;">+$${day.income.toFixed(2)}</td>
            <td style="color:red;">-$${day.expense.toFixed(2)}</td>
        `;

        tbody.appendChild(row);
    });
}

function calculateTotals() {
    console.log("Calculating totals for filters.month:", filters.month || "current month");

    let year, month;

    if (filters.month) {
        [year, month] = filters.month.split("-");
        year = parseInt(year);
        month = parseInt(month); 
    } else {
        const now = new Date();
        year = now.getFullYear();
        month = now.getMonth() + 1; 
    }

    const incomeTotal = transactions
        .filter(t => {
            if (t.type !== "income") return false;

            const [y, m] = t.date.split("-");

            return (
                parseInt(y) === year &&
                parseInt(m) === month
            );
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const expenseTotal = transactions
        .filter(t => {
            if (t.type !== "expense") return false;

            const [y, m] = t.date.split("-");

            return (
                parseInt(y) === year &&
                parseInt(m) === month
            );
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (manualIncomeOverride === null) {
        monthlyIncome = incomeTotal;
    }

    if (manualExpenseOverride === null) {
        monthlyExpenses = expenseTotal;
    }
}

function setSort(type) {
    currentSort = type;
    updateTransactionsTable();
}

function updateCategoryBreakdown() {
    const list = document.getElementById("categoryList");
    if (!list) return;

    const categories = [
        "Food", "Entertainment", "Shopping", "Investment",
        "Insurance", "Rent", "Vehicle", "Health",
        "Utilities", "Other"
    ];

    const totals = {};
    let totalExpenses = 0;

    categories.forEach(cat => {
        totals[cat.toLowerCase()] = 0;
    });


    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const monthlyTransactions = transactions.filter(t => {
        const d = toDate(t.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    monthlyTransactions.forEach(t => {
        if (t.type !== "expense") return;

        const amount = Math.abs(t.amount);

        const catKey = (t.category || "Other")
            .trim()
            .toLowerCase();

        if (totals[catKey] === undefined) {
            totals["other"] += amount;
        } else {
            totals[catKey] += amount;
        }

        totalExpenses += amount;
    });

    list.innerHTML = "";

    categories.forEach(category => {
        const key = category.toLowerCase();
        const amount = totals[key] || 0;

        const li = document.createElement("li");
        li.className = "expense-category";

        li.innerHTML = `
            <div class="category-info">
                <span>${category}</span>
            </div>
            <span>$${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2
        })}</span>
        `;

        list.appendChild(li);
    });

    // update total expenses 
    const totalExpensesEl = document.querySelector(".total-expenses");
    if (totalExpensesEl) {
        totalExpensesEl.textContent =
            `$${totalExpenses.toLocaleString(undefined, {
                minimumFractionDigits: 2
            })}`;
    }
}


function updateTransactionsTable() {
    const tbody = document.getElementById('transactionTableBody');
    tbody.innerHTML = '';

    let recentTransactions = getFilteredTransactions()

    if (recentTransactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No transactions found
                </td>
            </tr>
        `;
        return;
    }

    recentTransactions.sort((a, b) => {
        return parseLocalDate(b.date) - parseLocalDate(a.date);
    });


    recentTransactions = recentTransactions.slice(0, 10);

    recentTransactions.forEach(transaction => {
        const row = document.createElement('tr');

        // FIXED DATE PARSING 
        const [year, month, day] = transaction.date.split("-");
        const formattedDate = new Date(year, month - 1, day).toLocaleDateString(
            'en-US',
            { month: 'short', day: 'numeric', year: 'numeric' }
        );

        const amountDisplay =
            transaction.amount > 0
                ? `+${transaction.amount.toLocaleString()}.00`
                : `-${Math.abs(transaction.amount).toLocaleString()}.00`;

        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${transaction.category}</td>
            <td style="color:${transaction.amount > 0 ? '#10b981' : '#ef4444'}">
                ${amountDisplay}
            </td>
            <td><span class="status-success">${transaction.status}</span></td>
            <td>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function updateChart() {
    const ctx = document.getElementById("financeChart")?.getContext("2d");
    if (!ctx) return;

    let labels = [];
    let incomeData = [];
    let expenseData = [];

    const now = new Date();

  
    // DAILY → LAST 30 DAYS 
    
    if (currentView === "daily") {
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);

            const key = [
                d.getFullYear(),
                String(d.getMonth() + 1).padStart(2, "0"),
                String(d.getDate()).padStart(2, "0")
            ].join("-");

            labels.push(d.getDate()); 

            const dayTransactions = transactions.filter(t => t.date === key);

            const income = dayTransactions
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = dayTransactions
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            incomeData.push(income);
            expenseData.push(expense);
        }
    }

    
    // WEEKLY → 52 WEEKS
   
    if (currentView === "weekly") {
        const weeks = Array.from({ length: 52 }, () => ({ income: 0, expense: 0 }));

        transactions.forEach(t => {
            const d = toDate(t.date);

            if (d.getFullYear() !== now.getFullYear()) return;

            const weekIndex = getWeek(d) - 1;

            if (weekIndex >= 0 && weekIndex < 52) {
                if (t.type === "income") weeks[weekIndex].income += t.amount;
                else weeks[weekIndex].expense += Math.abs(t.amount);
            }
        });

        labels = weeks.map((_, i) => `W${i + 1}`);
        incomeData = weeks.map(w => w.income);
        expenseData = weeks.map(w => w.expense);
    }


    // MONTHLY 
    
    if (currentView === "monthly") {
        const months = Array.from({ length: 12 }, () => ({ income: 0, expense: 0 }));

        transactions.forEach(t => {
            const d = toDate(t.date);

            const diffMonths =
                (now.getFullYear() - d.getFullYear()) * 12 +
                (now.getMonth() - d.getMonth());

            if (diffMonths >= 0 && diffMonths < 12) {
                const index = 11 - diffMonths;

                if (t.type === "income") months[index].income += t.amount;
                else months[index].expense += Math.abs(t.amount);
            }
        });

        labels = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - 11 + i);
            return d.toLocaleDateString("en-US", { month: "short" });
        });

        incomeData = months.map(m => m.income);
        expenseData = months.map(m => m.expense);
    }

    // NET LINE
    
    const netData = incomeData.map((val, i) => val - (expenseData[i] || 0));

    const labelEl = document.getElementById("chartModeLabel");
    if (labelEl) {
        if (currentView === "daily") {
            labelEl.textContent = "Last 30 days";
        } else if (currentView === "weekly") {
            labelEl.textContent = "52 week overview";
        } else {
            labelEl.textContent = "Last 12 months";
        }
    }

    // RENDER
   
    if (financeChart) financeChart.destroy();

    financeChart = new Chart(ctx, {
        data: {
            labels,
            datasets: [
                {
                    type: "bar",
                    label: "Income",
                    data: incomeData,
                    backgroundColor: "#10b981",
                    borderRadius: 6
                },
                {
                    type: "bar",
                    label: "Expenses",
                    data: expenseData,
                    backgroundColor: "#ef4444",
                    borderRadius: 6
                },
                {
                    type: "line",
                    label: "Net",
                    data: netData,
                    borderColor: "#3b82f6",
                    tension: 0.4, 
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function toggleSortMenu() {
    const menu = document.getElementById("sortMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function toggleAdvancedFilter() {
    const menu = document.getElementById("advancedFilterMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}


function getWeek(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = (date - start) / (1000 * 60 * 60 * 24);
    return Math.ceil((diff + start.getDay() + 1) / 7);
}

function getYearSummary(transactions) {
    const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return income - expenses;
}

function getMonthlyIncomeComparison() {
    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let currentTotal = 0;
    let previousTotal = 0;

    transactions.forEach(t => {
        if (t.type !== "income") return;

        const d = toDate(t.date);

        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            currentTotal += t.amount;
        }

        if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
            previousTotal += t.amount;
        }
    });

    let percentChange = 0;

    if (previousTotal === 0) {
        percentChange = currentTotal > 0 ? 100 : 0;
    } else {
        percentChange =
            ((currentTotal - previousTotal) / previousTotal) * 100;
    }

    return {
        percentChange: percentChange.toFixed(1),
        isUp: percentChange >= 0
    };
}

function getMonthlyExpenseComparison() {
    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let currentTotal = 0;
    let previousTotal = 0;

    transactions.forEach(t => {
        if (t.type !== "expense") return;

        const d = toDate(t.date);

        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            currentTotal += Math.abs(t.amount);
        }

        if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
            previousTotal += Math.abs(t.amount);
        }
    });

    let percentChange = 0;

    if (previousTotal === 0) {
        percentChange = currentTotal > 0 ? 100 : 0;
    } else {
        percentChange =
            ((currentTotal - previousTotal) / previousTotal) * 100;
    }

    return {
        percentChange: percentChange.toFixed(1),
        isUp: percentChange >= 0
    };
}

function getLabelsByView() {
    const now = new Date();

    if (currentView === "daily") {
        const labels = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);

            labels.push(
                d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                })
            );
        }

        return labels;
    }

    if (currentView === "weekly") {
        return Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`);
    }

    return [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
}

function getIndexByView(date) {

    // DAILY → map to last 7 days window
    if (currentView === "daily") {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - 6);

        const diff = Math.floor((date - start) / (1000 * 60 * 60 * 24));

        return diff >= 0 && diff < 7 ? diff : -1;
    }

    // WEEKLY → proper ISO-ish week index (0–51)
    if (currentView === "weekly") {
        const start = new Date(date.getFullYear(), 0, 1);
        const diff = Math.floor((date - start) / (1000 * 60 * 60 * 24));

        return Math.min(51, Math.floor(diff / 7));
    }

    // MONTHLY → 0–11
    if (currentView === "monthly") {
        return date.getMonth();
    }

    return -1;
}





function saveExpenseEdit() {
    const value = parseFloat(document.getElementById("editExpenseValue").value);

    if (isNaN(value)) {
        alert("Enter a valid number");
        return;
    }

    manualExpenseOverride = value;

    localStorage.setItem("manualExpenseOverride", JSON.stringify(value));

    refreshUI();
    closeModal("expenseEditModal");

    showNotification("Monthly expenses updated (manual mode)", "success");
}

function resetExpenseToAuto() {
    manualExpenseOverride = null;
    localStorage.removeItem("manualExpenseOverride");

    refreshUI();

    showNotification("Switched back to automatic expenses", "success");
}

function resetExpenseToZero() {
    manualExpenseOverride = 0;
    localStorage.setItem("manualExpenseOverride", JSON.stringify(0));

    updateDashboard();
    showNotification("Expenses reset to $0", "success");
}



function showNotification(message, type = 'success') {
    const notification = document.createElement('div')
    notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1001;
    animation: slideInRight 0.3s ease;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    `

    notification.textContent = message
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

document.getElementById("viewDropdown").addEventListener("click", () => {
    const options = ["daily", "weekly", "monthly"];
    let index = options.indexOf(currentView);
    currentView = options[(index + 1) % options.length];


    if (currentView === "monthly") {
        const now = new Date();
        filters.month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    } else {
        filters.month = "";
    }

    document.getElementById("viewLabel").textContent =
        currentView.charAt(0).toUpperCase() + currentView.slice(1);

    calculateTotals();
    updateDashboard();
    updateTransactionsTable();
    updateChart();
    localStorage.setItem("view", currentView);
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {transform: translateX(100%); opacity: 0;}
        to {transform: translateX(0); opacity: 1;}
}

@keyframes slideOutRight {
    from {transform: translateX(0); opacity: 1;}
    to {transform: translateX(100%); opacity: 0;}
}
`

document.head.appendChild(style)


document.addEventListener('DOMContentLoaded', () => {
    loadData();

    currentView = localStorage.getItem("view") || "daily";

    document.getElementById("viewLabel").textContent =
        currentView.charAt(0).toUpperCase() + currentView.slice(1);

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;

    calculateTotals();
    updateDashboard();
    updateTransactionsTable();
    updateChart();
    updateCategoryBreakdown();

    const dateElement = document.getElementById("currentDate").querySelector("span");
    const now = new Date();

    dateElement.textContent = now.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
});

function exportToExcel() {
    if (!transactions.length) {
        alert("No transactions to export");
        return;
    }

    const exportData = transactions.map(t => ({
        Date: t.date,
        Category: t.category,
        Type: t.type,
        Amount: t.amount,
        Status: t.status,
        Description: t.description || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "budget-tracker.xlsx");
}
