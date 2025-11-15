// test.js
const { FinanceTracker } = require("./finance-tracker.js");

console.log("=== 个人财务追踪器测试 ===\n");

const tracker = new FinanceTracker();
console.log("√ 创建财务追踪器");

tracker.addTransaction("income", 5000, "工资", "2024年1月工资");
tracker.addTransaction("income", 500, "奖金", "绩效奖金");
console.log("√ 添加2条收入记录");

tracker.addTransaction("expense", 300, "餐饮", "周末聚餐");
tracker.addTransaction("expense", 150, "交通", "地铁卡充值");
tracker.addTransaction("expense", 200, "娱乐", "电影票");
tracker.addTransaction("expense", 100, "餐饮", "工作日外卖");
console.log("√ 添加4条支出记录");

console.log("\n--- 统计信息 ---");
console.log(`总收入：￥${tracker.getTotalIncome()}`); // 5500
console.log(`总支出：￥${tracker.getTotalExpense()}`); // 750
console.log(`当前余额：￥${tracker.getBalance()}`); // 4750

console.log("\n--- 筛选功能 ---");
const food = tracker.getTransactionsByCategory("餐饮");
console.log(`餐饮支出记录数：${food.length}`); // 2
console.log(`餐饮总支出：￥${food.reduce((s, t) => s + t.amount, 0)}`); // 400

console.log("\n--- 分类支出统计 ---");
console.log(tracker.getExpenseByCategory()); // { 餐饮: 400, 交通: 150, 娱乐: 200 }

console.log("\n--- 删除功能 ---");
console.log(`删除ID为1的记录：${tracker.deleteTransaction(1) ? "成功" : "失败"}`);
console.log(`删除后余额：￥${tracker.getBalance()}`); // -250

console.log("\n--- 所有交易记录 ---");
tracker.getAllTransactions().forEach(t => console.log(t.toString()));

console.log("\n=== 测试完成 ===");