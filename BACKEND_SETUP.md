# FundFlow Backend Setup Guide

## Overview

FundFlow is a financial management PWA that reads completed/paid tasks from MongoDB and calculates financial metrics.

## Environment Setup

### Required Environment Variable

Add to your Vercel project or `.env.local`:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fundflow
```

The app uses MongoDB database: `fundflow`

## MongoDB Collections

The system reads from and writes to these collections:

### Read-Only Collection
- **tasks** - Source of financial data
  - Filter: `taskStatus = "Completed"` AND `paymentReceived = true`
  - Fields used: `paymentAmount`, `yourProjectEarning`, `employeeId`

### Data Collections (Written by API)
- **employee_wallets** - Wallet balances and payouts
- **company_expenses** - Monthly company expenses (rent, parcel, internet, tools)
- **project_expenses** - Per-project expenses
- **digital_clients** - Monthly digital service clients

## API Routes

All APIs are connected with real MongoDB queries. The frontend uses SWR to fetch data automatically.

### Finance Dashboard
- **GET `/api/finance`**
  - Fetches all completed/paid tasks
  - Calculates: revenue, GST (18%), savings (10%), net profit
  - Auto-updates employee wallets
  - Returns: totalRevenue, totalGST, totalSavings, finalNetProfit, taskCount

### Employee Wallets
- **GET `/api/wallets`**
  - Returns all employee wallet balances
  - Returns employee wallets from MongoDB
  
- **POST `/api/wallets`**
  - `action: "payout"` - Record employee payout with transactionId
  - Resets wallet balance to 0 after payout

### Expenses
- **GET `/api/expenses`**
  - Returns all company-level expenses
  
- **POST `/api/expenses`**
  - Create company or project expenses
  - Types: company (rent, parcel, internet, tools), project

### Digital Services
- **GET `/api/digital-clients?month=YYYY-MM`**
  - Returns digital service clients for a specific month
  
- **POST `/api/digital-clients`**
  - Create monthly client account
  - Auto-calculates GST, savings, net profit

### Test Endpoint
- **GET `/api/test-mongo`**
  - Verifies MongoDB connection
  - Returns task, wallet, and expense counts

## Frontend Data Fetching

All pages use **SWR** for automatic data fetching from the backend:

```typescript
const { data, mutate } = useSWR('/api/endpoint', fetcher);
```

### Pages Connected to APIs

1. **Dashboard** (`/`)
   - Calls: `GET /api/finance`
   - Displays: Revenue, GST, Savings, Net Profit, Employee Earnings

2. **Wallets** (`/wallets`)
   - Calls: `GET /api/wallets`
   - Action: `POST /api/wallets` (payout)

3. **Expenses** (`/expenses`)
   - Calls: `GET /api/expenses`
   - Action: `POST /api/expenses` (add expense)

4. **Digital Services** (`/digital-services`)
   - Calls: `GET /api/digital-clients?month={currentMonth}`
   - Action: `POST /api/digital-clients` (add client)

## Financial Calculation Logic

### Per-Task Financials
```
GST = paymentAmount × 0.18
PostGST = paymentAmount - GST
Savings = PostGST × 0.10
Remaining = PostGST - Savings
NetProfit = Remaining - yourProjectEarning - projectExpenses
```

### Digital Client Financials
```
Revenue = monthlyPlan (15000 or 25000)
GST = Revenue × 0.18
PostGST = Revenue - GST
Savings = PostGST × 0.10
TotalExpenses = metaAdSpend + outsourcedVideoCost + totalSalaries
NetProfit = PostGST - Savings - TotalExpenses
```

## Debugging

### Enable MongoDB Debug Logs

The backend logs all MongoDB operations prefixed with `[v0]`:

```
[v0] DB: Found 5 completed paid tasks
[v0] Wallets API: Retrieved 2 wallets
[v0] Finance API: Calculations complete - Revenue: 50000 NetProfit: 12500
```

Check browser DevTools Console to see these logs.

### Test Connection

Visit: `https://your-domain.com/api/test-mongo`

Expected response:
```json
{
  "success": true,
  "message": "MongoDB connection working",
  "data": {
    "tasksCount": 5,
    "walletsCount": 2,
    "expensesCount": 3,
    "mongoUri": "SET"
  }
}
```

## Deployment

1. Set `MONGODB_URI` in Vercel environment variables
2. Deploy with `vercel deploy`
3. Test with `/api/test-mongo` endpoint
4. Verify Network tab shows Fetch/XHR calls in DevTools

## Error Handling

All APIs include comprehensive error handling:
- Empty collections return empty arrays
- Missing MONGODB_URI shows clear error
- Connection errors logged to console with `[v0]` prefix

All MongoDB queries are non-blocking with try-catch error handling to ensure graceful degradation.
