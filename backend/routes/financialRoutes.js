const express = require('express');
const {
  getFinancialSummary,
  getBankAccounts,
  createBankAccount,
  getAllIncome,
  recordIncome,
  getAllExpenses,
  recordExpense,
} = require('../controllers/financialController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('accountant', 'admin'));

router.get('/summary', getFinancialSummary);

router.route('/bank-accounts')
  .get(getBankAccounts)
  .post(createBankAccount);

router.route('/income')
  .get(getAllIncome)
  .post(recordIncome);

router.route('/expenses')
  .get(getAllExpenses)
  .post(recordExpense);

module.exports = router;
