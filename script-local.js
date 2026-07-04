/* ==========================================
   Expense Hub - Part 1
   Developed by Saim Amin
========================================== */

"use strict";

/* ==========================================
   Firebase Imports
========================================== */
import { auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ==========================================
   Global DOM Selectors
========================================== */
const expenseForm = document.getElementById("expenseForm");
const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");
const expenseNote = document.getElementById("expenseNote");

const expenseHistory = document.getElementById("expenseHistory");

const todayExpense = document.getElementById("todayExpense");
const monthExpense = document.getElementById("monthExpense");
const totalExpense = document.getElementById("totalExpense");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

/* ==========================================
   Local Storage Keys & Global Variables
========================================== */
const STORAGE = {
    USER: "expenseHubCurrentUser",
    EXPENSES: "expenseHubExpenses"
};

let expenses = [];
let currentUser = null;
let editExpenseId = null;

/* ==========================================
   Local Storage Management
========================================== */
function loadLocalData() {
    expenses = JSON.parse(localStorage.getItem(STORAGE.EXPENSES)) || [];
    currentUser = JSON.parse(localStorage.getItem(STORAGE.USER)) || null;
}

function saveExpenses() {
    localStorage.setItem(STORAGE.EXPENSES, JSON.stringify(expenses));
}

function saveCurrentUser() {
    localStorage.setItem(STORAGE.USER, JSON.stringify(currentUser));
}

/* ==========================================
   Helper Functions
========================================== */
function generateID() {
    return Date.now().toString() + Math.floor(Math.random() * 10000);
}

function formatCurrency(amount) {
    return "Rs. " + Number(amount).toLocaleString();
}

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

/* ==========================================
   Authentication Functions
========================================== */
async function signupUser(event) {
    if (event) event.preventDefault();

    const name = document.getElementById("fullName");
    const email = document.getElementById("signupEmail");
    const password = document.getElementById("signupPassword");

    if (!name || !email || !password) return;

    if (name.value.trim() === "" || email.value.trim() === "" || password.value.trim() === "") {
        alert("Please fill all fields.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value.trim(), password.value);
        await updateProfile(userCredential.user, { displayName: name.value.trim() });

        currentUser = {
            uid: userCredential.user.uid,
            name: name.value.trim(),
            email: email.value.trim()
        };

        saveCurrentUser();
        alert("Account created successfully.");
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
    }
}

async function loginUser(event) {
    if (event) event.preventDefault();

    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");

    if (!email || !password) return;

    if (email.value.trim() === "" || password.value.trim() === "") {
        alert("Please enter email and password.");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value.trim(), password.value);

        currentUser = {
            uid: userCredential.user.uid,
            name: userCredential.user.displayName || "User",
            email: userCredential.user.email
        };

        saveCurrentUser();
        alert("Login successful.");
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
    }
}

async function logoutUser() {
    try {
        await signOut(auth);
        currentUser = null;
        localStorage.removeItem(STORAGE.USER);
        window.location.href = "login.html";
    } catch (error) {
        alert(error.message);
    }
}

/* ==========================================
   Firebase Auth State Listener
========================================== */
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = {
            uid: user.uid,
            name: user.displayName || "User",
            email: user.email
        };
        saveCurrentUser();
        if (userName) {
            userName.textContent = currentUser.name;
        }
    } else {
        currentUser = null;
    }
});
/* ==========================================
   Expense Hub - Part 2
   Expense CRUD Operations
========================================== */

/* ==========================================
   Add / Update Expense
========================================== */
function addExpense(event) {
    event.preventDefault();

    if (!expenseName || !expenseAmount) return;

const name = expenseName.value.trim();
const amount = Number(expenseAmount.value);

const category = "General";
const date = new Date().toISOString().split("T")[0];
const note = "";

    if (name === "" || amount <= 0 || category === "" || date === "") {
        alert("Please fill all required fields correctly.");
        return;
    }

    const expense = {
        id: editExpenseId || generateID(),
        name,
        amount,
        category,
        date,
        note,
        createdAt: new Date().toISOString()
    };

    if (editExpenseId) {
        expenses = expenses.map(item => item.id === editExpenseId ? expense : item);
        editExpenseId = null;
    } else {
        expenses.unshift(expense);
    }

    saveExpenses();
    renderExpenses();
    updateSummary();
    
    expenseForm.reset();
    if (expenseDate) {
        expenseDate.value = getTodayDate();
    }
}

/* ==========================================
   Delete Expense
========================================== */
function deleteExpense(id) {
    const confirmDelete = confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;

    expenses = expenses.filter(item => item.id !== id);
    saveExpenses();
    renderExpenses();
    updateSummary();
}

/* ==========================================
   Edit Expense
========================================== */
function editExpense(id) {

    if (!expenseName || !expenseAmount) {
        window.location.href = "dashboard.html";
        return;
    }

    const expense = expenses.find(item => item.id === id);
    if (!expense) return;

    editExpenseId = expense.id;

    expenseName.value = expense.name;
    expenseAmount.value = expense.amount;

    if (expenseCategory) {
        expenseCategory.value = expense.category || "General";
    }

    if (expenseDate) {
        expenseDate.value = expense.date || getTodayDate();
    }

    if (expenseNote) {
        expenseNote.value = expense.note || "";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* ==========================================
   Render Table UI
========================================== */
function renderExpenses() {
    if (!expenseHistory) return;

    expenseHistory.innerHTML = "";

    if (expenses.length === 0) {
        expenseHistory.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">No expenses found.</td>
            </tr>
        `;
        return;
    }

    expenses.forEach(expense => {
        expenseHistory.innerHTML += `
            <tr>
                <td>${expense.name}</td>
                <td>${expense.category || "General"}</td>
                <td>${formatCurrency(expense.amount)}</td>
                <td>${expense.date}</td>
                <td>${expense.note || "-"}</td>
                <td>
                    <button class="edit-btn" onclick="editExpense('${expense.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteExpense('${expense.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
}
/* ==========================================
   Expense Hub - Part 3
   Analytics, Reports & Initialization
========================================== */

const reportPreview = document.getElementById("reportPreview");
const reportMonth = document.getElementById("reportMonth");
const reportTotal = document.getElementById("reportTotal");
const reportRecords = document.getElementById("reportRecords");
const searchExpense = document.getElementById("searchExpense");
const filterCategory = document.getElementById("filterCategory");

/* ==========================================
   Update Dashboard Cards
========================================== */
function updateSummary() {
    const today = getTodayDate();
    const currentMonth = today.slice(0, 7);

    let todayTotal = 0;
    let monthTotal = 0;
    let grandTotal = 0;

    expenses.forEach(expense => {
        grandTotal += Number(expense.amount);

        if (expense.date === today) {
            todayTotal += Number(expense.amount);
        }
        if (expense.date.startsWith(currentMonth)) {
            monthTotal += Number(expense.amount);
        }
    });

    if (todayExpense) todayExpense.textContent = formatCurrency(todayTotal);
    if (monthExpense) monthExpense.textContent = formatCurrency(monthTotal);
    if (totalExpense) totalExpense.textContent = formatCurrency(grandTotal);
}

/* ==========================================
   Search & Live Filtering
========================================== */
function filterExpenses() {
    if (!expenseHistory) return;

    const keyword = searchExpense ? searchExpense.value.toLowerCase().trim() : "";
    const category = filterCategory ? filterCategory.value : "All";

    const filtered = expenses.filter(expense => {
        const matchName = expense.name.toLowerCase().includes(keyword);
        const matchCategory = (category === "All" || expense.category === category);
        return matchName && matchCategory;
    });

    expenseHistory.innerHTML = "";

    if (filtered.length === 0) {
        expenseHistory.innerHTML = `<tr><td colspan="6" style="text-align:center;">No matching expenses found.</td></tr>`;
        return;
    }

    filtered.forEach(expense => {
        expenseHistory.innerHTML += `
            <tr>
                <td>${expense.name}</td>
                <td>${expense.category || "General"}</td>
                <td>${formatCurrency(expense.amount)}</td>
                <td>${expense.date}</td>
                <td>${expense.note || "-"}</td>
                <td>
                    <button class="edit-btn" onclick="editExpense('${expense.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteExpense('${expense.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
}

/* ==========================================
   Monthly Report Generator
========================================== */
function generateReport() {

    if (!reportPreview || !reportTotal || !reportRecords || !reportMonth) return;

    const currentMonth = new Date().toISOString().slice(0, 7);

    const monthlyExpenses = expenses.filter(expense =>
        expense.date.startsWith(currentMonth)
    );

    let total = 0;

    reportMonth.textContent = new Date().toLocaleString("en-US", {
        month: "long",
        year: "numeric"
    });

    reportRecords.textContent = monthlyExpenses.length;

    if (monthlyExpenses.length === 0) {
        reportTotal.textContent = formatCurrency(0);
        reportPreview.innerHTML = `
            <div class="history-item">
                <div class="history-left">
                    <h4>No records found.</h4>
                </div>
            </div>
        `;
        return;
    }

    let html = "";

    monthlyExpenses.forEach((expense, index) => {

        total += Number(expense.amount);

        html += `
            <div class="history-item">
                <div class="history-left">
                    <strong>${index + 1}. ${expense.name}</strong><br>
                    ${expense.date} | ${expense.category}<br>
                    ${expense.note || "-"}
                </div>

                <div class="history-right">
                    ${formatCurrency(expense.amount)}
                </div>
            </div>
        `;
    });

    reportTotal.textContent = formatCurrency(total);
    reportPreview.innerHTML = html;
}

/* ==========================================
   Export Data Functions
========================================== */
function exportCSV() {
    if (expenses.length === 0) {
        alert("No expenses available.");
        return;
    }

    let csv = "Name,Category,Amount,Date,Note\n";
    expenses.forEach(expense => {
        csv += `"${expense.name}","${expense.category}","${expense.amount}","${expense.date}","${expense.note}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ExpenseHub_Report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadPDF() {
    if (typeof window.jspdf === "undefined") {
        alert("jsPDF library not found.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("Expense Hub Report", 20, 20);

    let y = 35;
    expenses.forEach((expense, index) => {
        pdf.setFontSize(11);
        pdf.text(`${index + 1}. ${expense.date} | ${expense.name} | ${expense.category} | Rs. ${expense.amount}`, 15, y);
        y += 10;
        if (y > 270) {
            pdf.addPage();
            y = 20;
        }
    });

    pdf.save("ExpenseHub_Report.pdf");
}

function clearAllExpenses() {
    if (!confirm("Are you sure you want to delete ALL expenses permanently?")) return;

    expenses = [];
    saveExpenses();
    renderExpenses();
    updateSummary();

    if (reportRecords) reportRecords.innerHTML = "";
    if (reportTotal) reportTotal.textContent = formatCurrency(0);

    alert("All expenses deleted successfully.");
}

/* ==========================================
   Global Mapping for HTML inline onClick
========================================== */
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;
window.exportCSV = exportCSV;
window.downloadPDF = downloadPDF;
window.clearAllExpenses = clearAllExpenses;

/* ==========================================
   Event Listeners Binding
========================================== */
if (signupForm) signupForm.addEventListener("submit", signupUser);
if (loginForm) loginForm.addEventListener("submit", loginUser);
if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
if (expenseForm) expenseForm.addEventListener("submit", addExpense);
if (searchExpense) searchExpense.addEventListener("input", filterExpenses);
if (filterCategory) filterCategory.addEventListener("change", filterExpenses);

const reportButton = document.getElementById("generateReport");
if (reportButton) reportButton.addEventListener("click", generateReport);

const csvBtn = document.getElementById("exportCSV");
const pdfBtn =
    document.getElementById("downloadPDF") ||
    document.getElementById("downloadPdfBtn");

const clearBtn = document.getElementById("clearAll");

if (csvBtn) csvBtn.addEventListener("click", exportCSV);
if (pdfBtn) pdfBtn.addEventListener("click", downloadPDF);
if (clearBtn) clearBtn.addEventListener("click", clearAllExpenses);

/* ==========================================
   Final Application Initialization
========================================== */
document.addEventListener("DOMContentLoaded", () => {
    loadLocalData();
    renderExpenses();
    updateSummary();
generateReport();
    if (expenseDate) {
        expenseDate.value = getTodayDate();
    }
    console.log("Expense Hub Loaded Successfully.");
});