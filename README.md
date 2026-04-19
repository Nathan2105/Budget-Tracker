# 💰 Budget Tracker Web App

## Project Overview
This is a client-side budget tracking web application built using HTML, CSS, and JavaScript. It allows users to track income, expenses, and financial activity through a dynamic dashboard with filtering and chart visualization.

The purpose of this project is to demonstrate a complete software engineering lifecycle including design, implementation, data handling, and user authentication using front-end technologies.

---

## Features
- User authentication system (signup and login)
- Session tracking using localStorage
- Add income and expense transactions
- Categorize transactions (Food, Rent, Shopping, etc.)
- Automatic calculation of income, expenses, and net balance
- Daily, weekly, and monthly views of financial data
- Advanced filtering (date, category, status, search, month, year)
- Transaction table with delete functionality
- Dynamic chart visualization (income vs expenses vs net)
- Category breakdown summary
- Spending limit support
- Manual override system for income and expenses
- Real-time dashboard updates

---

## System Architecture
This application is fully client-side and does not use a backend server.

The system is structured into:

- validation.js → handles signup, login, and authentication logic
- script.js → core application logic, UI updates, and data processing
- Chart.js → handles graph rendering
- localStorage → persistent data storage layer

The application follows this data flow:

User Input → Transaction Object → transactions array → localStorage → UI refresh → dashboard update

---

## Data Model
Each transaction is stored as an object in the following format:

```js
{
    id: Number,
    date: "YYYY-MM-DD",
    amount: Number,
    type: "income" | "expense",
    category: String,
    status: "Success",
    description: String
}

Authentication System
Users sign up with email and password
Credentials are stored in localStorage
Login validates against stored user data
Active session is stored using:
localStorage.setItem("currentUser", email)

User-specific data is stored using:

tracker_{user}
income, expenses, spendingLimit
manual overrides for income and expenses
How the Application Works
User logs in or signs up
Transactions are loaded from localStorage
Dashboard calculates totals automatically
UI updates instantly on any change
Charts regenerate based on selected view (daily/weekly/monthly)
Filters update displayed data dynamically
Technologies Used
HTML5
CSS3
JavaScript (Vanilla)
Chart.js
localStorage API
Data Persistence

All data is stored locally in the browser using localStorage. This includes:

User accounts
Transactions
Income and expenses
Spending limits
Manual overrides
UI preferences (view mode)
Known Limitations
No backend database (data is local only)
Clearing browser storage will delete all data
No multi-device synchronization
No encryption for stored credentials
Manual overrides bypass automatic calculations
Future Improvements
Add backend system (Node.js or Firebase)
Cloud synchronization across devices
User authentication security upgrade
Export data to Excel/PDF
Budget goal tracking system
Mobile responsive redesign improvements
Conclusion

This project demonstrates a complete front-end financial tracking system with authentication, persistent storage, and real-time data visualization. It simulates real-world software engineering practices including modular design, iterative development, and user-focused feature implementation.
