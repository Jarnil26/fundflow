# FundFlow - Finance Management PWA

A professional financial management PWA that reads from MongoDB's existing task collection and provides comprehensive financial analytics and employee wallet management.

## Core Principle

**This is a READ-ONLY financial engine.** It reads completed and paid tasks from MongoDB and calculates all financial metrics. No task creation, editing, or management features exist.

## Features

### Dashboard
- **Total Revenue** - Sum of all paymentAmount from completed, paid tasks
- **GST Tracking** - Automatic 18% calculation per task
- **Savings Account** - 10% of post-GST amount
- **Net Profit** - After employee earnings and all expenses
- **Wallet Alerts** - Shows when employee balances ≥ ₹5000
- **Company Expense Deduction** - Automatically reduces net profit

### Employee Wallets
- Fixed employees: `sanjay0206`, `bhavesh1609`
- Auto-credited with `yourProjectEarning` from each qualified task
- ≥ ₹5000 threshold alerts for payout
- Transaction ID based payout processing
- Payout history with dates

### Expense Management
- **Project Expenses** - Linked to specific tasks (stock images, outsourcing, etc.)
- **Company Expenses** - Monthly fixed costs (rent, parcel, internet, tools)
- Both reduce net profit automatically

### Digital Services
- Monthly client accounts (₹15,000 or ₹25,000 plans)
- Meta ads, video outsourcing, and 3 employee salary tracking
- Automatic GST, savings, and net profit calculation
- Monthly reset cycle

## Financial Calculations

For each qualified task (taskStatus = "Completed" AND paymentReceived = true):

```
GST = paymentAmount × 18%
Post-GST = paymentAmount − GST
Savings = Post-GST × 10%
Remaining = Post-GST − Savings
Employee Earning = yourProjectEarning (auto-credited to wallet)
Net Profit = Remaining − yourProjectEarning − projectExpenses
Final Profit = Net Profit − companyExpenses
```

## Data Source

All data comes from MongoDB collections:
- **tasks** (READ-ONLY) - Source of financial data
- **employee_wallets** - Tracks earnings and payouts
- **project_expenses** - Task-specific costs
- **company_expenses** - Fixed monthly costs
- **digital_clients** - Monthly service accounts

## API Routes

### `/api/finance` (GET)
Returns complete financial summary:
```json
{
  "totalRevenue": 0,
  "totalGST": 0,
  "totalSavings": 0,
  "totalNetProfit": 0,
  "finalNetProfit": 0,
  "companyExpenseTotal": 0,
  "walletsPending": 0,
  "employeeEarnings": {},
  "employeeWallets": [],
  "taskCount": 0
}
```

### `/api/wallets` (GET/POST)
- GET: Retrieve all or specific employee wallet
- POST: Process payouts (action: 'payout', transactionId required)

### `/api/expenses` (GET/POST)
- GET: Retrieve all company expenses
- POST: Add project or company expenses

### `/api/digital-clients` (GET/POST)
- GET: Query by month parameter
- POST: Create monthly digital client account

## Pages

- **Dashboard** (`/`) - Financial overview
- **Wallets** (`/wallets`) - Employee earnings and payouts
- **Expenses** (`/expenses`) - Project and company expense tracking
- **Digital Services** (`/digital-services`) - Monthly service client management

## Environment Variables

```
MONGODB_URI=your_mongodb_connection_string
```

## Dark Mode

Professional dark theme enabled by default with toggle in header.

## PWA Features

- Mobile-first responsive design
- Installable as PWA
- Dark professional UI
- Fast loading with SWR caching
- Manifest.json configured

## Important Rules

✅ **DO:**
- Read task collection for financial calculations
- Auto-credit employee wallets from task earnings
- Calculate GST, savings, and net profit
- Track and process payouts
- Show wallet alerts at ≥ ₹5000

❌ **DO NOT:**
- Create, edit, or manage tasks
- Show task lists or forms
- Provide task status updates
- Allow task filtering or assignment

This is purely a finance administration tool, not a project management system.
