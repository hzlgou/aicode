// finance-tracker.js
class Transaction {
  constructor(id, type, amount, category, description, date = new Date()) {
    if (!["income", "expense"].includes(type)) {
      throw new Error("Type must be 'income' or 'expense'");
    }
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }
    this.id = id;
    this.type = type;
    this.amount = amount;
    this.category = category;
    this.description = description;
    this.date = date instanceof Date && !isNaN(date) ? date : new Date();
  }

  toString() {
    const sign = this.type === "income" ? "+" : "-";
    return `[#${this.id}] ${this.type} ￥${this.amount.toFixed(2)} - ${this.category}（${this.description}）`;
  }
}

class FinanceTracker {
  constructor() {
    this.transactions = [];
    this.nextId = 1;
    this.budgets = {}; // 用于预算管理
  }

  addTransaction(type, amount, category, description) {
    const txn = new Transaction(this.nextId++, type, amount, category, description);
    this.transactions.push(txn);
    return txn;
  }

  getAllTransactions() {
    return this.transactions;
  }

  getTotalIncome() {
    return this.transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpense() {
    return this.transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getBalance() {
    return this.getTotalIncome() - this.getTotalExpense();
  }

  getTransactionsByCategory(category) {
    return this.transactions.filter(t => t.category === category);
  }

  getTransactionsByType(type) {
    return this.transactions.filter(t => t.type === type);
  }

  getExpenseByCategory() {
    return this.transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
  }

  deleteTransaction(id) {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.transactions.splice(idx, 1);
    return true;
  }

  // 进阶功能：日期范围查询
  getTransactionsByDateRange(startDate, endDate) {
    return this.transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }

  // 进阶功能：导出/导入
  exportToJSON() {
    return JSON.stringify(this.transactions, null, 2);
  }

  importFromJSON(jsonString) {
    const arr = JSON.parse(jsonString);
    this.transactions = arr.map(obj => new Transaction(
      obj.id, obj.type, obj.amount, obj.category, obj.description, new Date(obj.date)
    ));
    this.nextId = this.transactions.length ? Math.max(...this.transactions.map(t => t.id)) + 1 : 1;
  }

  // 进阶功能：预算管理
  setBudget(category, amount) {
    if (typeof amount !== "number" || amount <= 0) throw new Error("Budget must be positive");
    this.budgets[category] = amount;
  }

  checkBudget(category) {
    const budget = this.budgets[category] || 0;
    const spent = this.getTransactionsByCategory(category)
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const remaining = budget - spent;
    const percentage = budget ? Math.round((spent / budget) * 100) : 0;
    return { budget, spent, remaining, percentage };
  }

  getAllBudgetReports() {
    return Object.keys(this.budgets).map(cat => ({
      category: cat,
      ...this.checkBudget(cat)
    }));
  }

  // 进阶功能：数据可视化
  generateExpenseChart() {
    const expense = this.getExpenseByCategory();
    const total = Object.values(expense).reduce((a, b) => a + b, 0);
    if (total === 0) return "暂无支出";
    let chart = "支出分布：\n";
    for (const [cat, amt] of Object.entries(expense)) {
      const pct = Math.round((amt / total) * 100);
      chart += `${cat} ${"%".repeat(pct / 5)} ${pct}%\n`;
    }
    return chart;
  }

  getMonthlyTrend(months = 6) {
    const trend = {};
    const now = new Date();
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      trend[key] = { income: 0, expense: 0 };
    }
    this.transactions.forEach(t => {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
      if (trend[key]) {
        trend[key][t.type] += t.amount;
      }
    });
    return trend;
  }
}

module.exports = { Transaction, FinanceTracker };