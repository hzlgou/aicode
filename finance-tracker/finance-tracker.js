/****************************************************************************************
 * 文件：finance-tracker.js
 * 作者：姓名（学号：）
 * 日期：2025-11-15
 * 描述：个人财务追踪器——面向对象 + 函数式编程综合实践
 *  1. Transaction      ：单条交易记录（属性验证 + 格式化输出）
 *  2. FinanceTracker   ：交易管理、统计、筛选、预算、可视化等
 *  3. 全部使用 ES6 语法：class、箭头函数、模板字符串、解构、默认参数等
 ***************************************************************************************/

/** 交易记录类 */
class Transaction {
  /**
   * 构造一条交易
   * @param {number} id           交易唯一编号（由 FinanceTracker 递增生成）
   * @param {string} type         交易类型，必须为 "income" 或 "expense"
   * @param {number} amount       金额，必须 > 0
   * @param {string} category     分类，如"餐饮"、"交通"
   * @param {string} description  交易描述
   * @param {Date}   [date=new Date()] 交易日期，默认为当前时间
   */
  constructor(id, type, amount, category, description, date = new Date()) {
    // 1. 类型校验
    if (!["income", "expense"].includes(type)) {
      throw new Error(`[Transaction] 非法 type：${type}，必须为 "income" 或 "expense"`);
    }
    // 2. 金额校验
    if (typeof amount !== "number" || amount <= 0 || !isFinite(amount)) {
      throw new Error(`[Transaction] 非法 amount：${amount}，必须为正数`);
    }
    // 3. 日期校验
    if (!(date instanceof Date) || isNaN(date)) {
      date = new Date(); // 容错：非法日期自动重置为当前时间
    }

    /** @member {number} id 交易编号 */
    this.id = id;
    /** @member {string} type 交易类型 */
    this.type = type;
    /** @member {number} amount 交易金额（正数） */
    this.amount = amount;
    /** @member {string} category 分类 */
    this.category = category;
    /** @member {string} description 描述 */
    this.description = description;
    /** @member {Date} date 交易日期 */
    this.date = date;
  }

  /**
   * 返回易读字符串，供控制台打印
   * 格式：[#id] 收入/支出 ￥amount - category（description）
   * @returns {string} 格式化交易信息
   */
  toString() {
    const sign = this.type === "income" ? "+" : "-";
    return `[#${this.id}] ${this.type === "income" ? "收入" : "支出"} ￥${this.amount.toFixed(2)} - ${this.category}（${this.description}）`;
  }
}

/** 财务追踪器类 */
class FinanceTracker {
  /** 构造函数：初始化交易池、自增ID、预算表 */
  constructor() {
    /** @member {Transaction[]} transactions 交易列表 */
    this.transactions = [];
    /** @member {number} nextId 下一个可用ID，从1开始递增 */
    this.nextId = 1;
    /** @member {Object.<string, number>} budgets 各分类月预算，键=category，值=金额 */
    this.budgets = {};
  }

  /* ----------------------------------------------------------
   * 基础功能：增删查 + 统计
   * -------------------------------------------------------- */

  /**
   * 添加交易（外部唯一入口）
   * @param {string} type         类型，"income"/"expense"
   * @param {number} amount       金额 > 0
   * @param {string} category     分类
   * @param {string} description  描述
   * @returns {Transaction} 新建实例
   */
  addTransaction(type, amount, category, description) {
    const txn = new Transaction(this.nextId++, type, amount, category, description);
    this.transactions.push(txn);
    return txn;
  }

  /** 获取所有交易副本（防外部篡改原数组） */
  getAllTransactions() {
    return [...this.transactions];
  }

  /** 计算总收入：filter + reduce */
  getTotalIncome() {
    return this.transactions
      .filter(t => t.type === "income")   // 筛选收入
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /** 计算总支出：filter + reduce */
  getTotalExpense() {
    return this.transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /** 余额 = 收入 - 支出 */
  getBalance() {
    return this.getTotalIncome() - this.getTotalExpense();
  }

  /** 按分类名筛选交易 */
  getTransactionsByCategory(category) {
    return this.transactions.filter(t => t.category === category);
  }

  /** 按类型筛选交易 */
  getTransactionsByType(type) {
    return this.transactions.filter(t => t.type === type);
  }

  /**
   * 分类支出统计：reduce 归约成对象
   * @returns {Object}  { category: totalExpense , ... }
   */
  getExpenseByCategory() {
    return this.transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
  }

  /**
   * 根据ID删除交易
   * @param {number} id
   * @returns {boolean} true=删除成功，false=未找到
   */
  deleteTransaction(id) {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.transactions.splice(idx, 1);
    return true;
  }

  /* ----------------------------------------------------------
   * 进阶功能①：日期范围查询
   * -------------------------------------------------------- */
  /**
   * 获取指定日期区间内的交易（闭区间）
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Transaction[]}
   */
  getTransactionsByDateRange(startDate, endDate) {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new Error("[getTransactionsByDateRange] 参数必须是 Date 类型");
    }
    return this.transactions.filter(
      t => t.date >= startDate && t.date <= endDate
    );
  }

  /* ----------------------------------------------------------
   * 进阶功能②：JSON 导出/导入
   * -------------------------------------------------------- */
  /** 将全部交易序列化为 JSON 字符串（带缩进） */
  exportToJSON() {
    return JSON.stringify(this.transactions, null, 2);
  }

  /**
   * 从 JSON 字符串恢复交易（会重置当前数据）
   * @param {string} jsonString
   */
  importFromJSON(jsonString) {
    try {
      const arr = JSON.parse(jsonString);
      if (!Array.isArray(arr)) throw new Error("JSON 不是数组");
      // 重建 Transaction 实例，防止原型链断裂
      this.transactions = arr.map(
        obj => new Transaction(obj.id, obj.type, obj.amount, obj.category, obj.description, new Date(obj.date))
      );
      // 重建 nextId
      this.nextId = this.transactions.length
        ? Math.max(...this.transactions.map(t => t.id)) + 1
        : 1;
    } catch (err) {
      throw new Error(`[importFromJSON] 解析失败：${err.message}`);
    }
  }

  /* ----------------------------------------------------------
   * 进阶功能③：预算管理
   * -------------------------------------------------------- */
  /**
   * 为某分类设置月预算
   * @param {string} category
   * @param {number} amount   预算金额 > 0
   */
  setBudget(category, amount) {
    if (typeof amount !== "number" || amount <= 0)
      throw new Error("[setBudget] 预算金额必须为正数");
    this.budgets[category] = amount;
  }

  /**
   * 检查某分类预算使用情况
   * @param {string} category
   * @returns {{budget:number, spent:number, remaining:number, percentage:number}}
   */
  checkBudget(category) {
    const budget = this.budgets[category] || 0;
    const spent = this.getTransactionsByCategory(category)
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const remaining = budget - spent;
    const percentage = budget ? Math.round((spent / budget) * 100) : 0;
    return { budget, spent, remaining, percentage };
  }

  /** 获取所有已设预算的分类报告 */
  getAllBudgetReports() {
    return Object.keys(this.budgets).map(cat => ({
      category: cat,
      ...this.checkBudget(cat)
    }));
  }

  /* ----------------------------------------------------------
   * 进阶功能④：简易文本可视化
   * -------------------------------------------------------- */
  /**
   * 生成支出分布 ASCII 图表（每5%用一个%表示）
   * @returns {string}
   */
  generateExpenseChart() {
    const expenseMap = this.getExpenseByCategory();
    const total = Object.values(expenseMap).reduce((a, b) => a + b, 0);
    if (total === 0) return "暂无支出";
    let chart = "支出分布：\n";
    for (const [cat, amt] of Object.entries(expenseMap)) {
      const pct = Math.round((amt / total) * 100);
      chart += `${cat.padEnd(4)} ${"%".repeat(pct / 5)} ${pct}%\n`;
    }
    return chart;
  }

  /**
   * 最近 N 个月收支趋势（按年月分组）
   * @param {number} [months=6]
   * @returns {Object} 格式：{ "YYYY-MM": { income, expense } , ... }
   */
  getMonthlyTrend(months = 6) {
    const trend = {};
    const now = new Date();
    // 初始化最近 N 个月空壳
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      trend[key] = { income: 0, expense: 0 };
    }
    // 累加交易
    this.transactions.forEach(t => {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
      if (trend[key]) {
        trend[key][t.type] += t.amount;
      }
    });
    return trend;
  }
}

/* Node.js 环境导出模块 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Transaction, FinanceTracker };
}