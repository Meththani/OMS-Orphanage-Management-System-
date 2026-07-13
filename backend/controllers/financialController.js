const BankAccount = require('../models/BankAccount');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { Donation } = require('../models/Donation');

// GET /api/finances/summary
exports.getFinancialSummary = async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find();
    const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    const incomes = await Income.find();
    const expenses = await Expense.find();

    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Merge recent transactions (incomes and expenses)
    const formattedIncomes = incomes.map(inc => ({
      _id: inc._id,
      type: 'income',
      category: inc.category,
      amount: inc.amount,
      date: inc.date,
      description: `Income from ${inc.donor}`,
      ref: inc.refReceipt,
    }));

    const formattedExpenses = expenses.map(exp => ({
      _id: exp._id,
      type: 'expense',
      category: exp.category,
      amount: exp.amount,
      date: exp.date,
      description: `${exp.description} (Recorded by ${exp.staffName})`,
      ref: exp.referenceReceipt,
    }));

    const allTransactions = [...formattedIncomes, ...formattedExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10); // get top 10

    res.status(200).json({
      status: 'success',
      data: {
        totalBankBalance,
        totalIncome,
        totalExpenses,
        recentTransactions: allTransactions,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/finances/bank-accounts
exports.getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find();
    res.status(200).json({ status: 'success', data: accounts });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/finances/bank-accounts
exports.createBankAccount = async (req, res) => {
  try {
    const { accountName, bankName, accountNumber, initialBalance } = req.body;
    if (!accountName || !bankName || !accountNumber) {
      return res.status(400).json({ status: 'fail', message: 'Missing bank account fields.' });
    }

    const newAccount = await BankAccount.create({
      accountName,
      bankName,
      accountNumber,
      initialBalance: initialBalance || 0,
      balance: initialBalance || 0,
    });

    res.status(201).json({ status: 'success', data: newAccount });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// GET /api/finances/income
exports.getAllIncome = async (req, res) => {
  try {
    const incomes = await Income.find().populate('bankAccount').sort('-date');
    res.status(200).json({ status: 'success', data: incomes });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/finances/income
exports.recordIncome = async (req, res) => {
  try {
    const { category, amount, paymentMethod, donor, refReceipt, bankAccountId, proofOfReceipt } = req.body;
    if (!category || amount === undefined || !paymentMethod) {
      return res.status(400).json({ status: 'fail', message: 'Missing income fields.' });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Amount must be greater than zero.' });
    }

    if (refReceipt) {
      const refRegex = /^[a-zA-Z0-9\-_/]+$/;
      if (!refRegex.test(refReceipt)) {
        return res.status(400).json({ status: 'fail', message: 'Receipt reference can only contain alphanumeric characters, hyphens, underscores, or slashes.' });
      }
    }

    // Duplicate detection within the last 5 minutes
    const duplicate = await Income.findOne({
      category,
      amount: numericAmount,
      paymentMethod,
      donor: donor || 'Anonymous',
      refReceipt: refReceipt || null,
      date: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
    if (duplicate) {
      return res.status(409).json({ status: 'fail', message: 'A duplicate income record was recently submitted. Please wait or verify details.' });
    }

    let bankAccount = null;
    if (bankAccountId) {
      bankAccount = await BankAccount.findById(bankAccountId);
      if (!bankAccount) {
        return res.status(404).json({ status: 'fail', message: 'Bank account not found.' });
      }
    }

    const income = await Income.create({
      category,
      amount: numericAmount,
      paymentMethod,
      donor: donor || 'Anonymous',
      refReceipt,
      bankAccount: bankAccountId || null,
      proofOfReceipt: proofOfReceipt || undefined,
    });

    if (bankAccount) {
      bankAccount.balance += numericAmount;
      await bankAccount.save();
    }

    res.status(201).json({ status: 'success', data: income });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// GET /api/finances/expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().populate('bankAccount').sort('-date');
    res.status(200).json({ status: 'success', data: expenses });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/finances/expenses
exports.recordExpense = async (req, res) => {
  try {
    const { category, amount, referenceReceipt, description, bankAccountId, proofOfReceipt } = req.body;
    if (!category || amount === undefined || !description) {
      return res.status(400).json({ status: 'fail', message: 'Missing expense fields.' });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Amount must be greater than zero.' });
    }

    if (referenceReceipt) {
      const refRegex = /^[a-zA-Z0-9\-_/]+$/;
      if (!refRegex.test(referenceReceipt)) {
        return res.status(400).json({ status: 'fail', message: 'Receipt reference can only contain alphanumeric characters, hyphens, underscores, or slashes.' });
      }
    }

    // Duplicate detection within the last 5 minutes
    const duplicate = await Expense.findOne({
      category,
      amount: numericAmount,
      description,
      referenceReceipt: referenceReceipt || null,
      date: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
    if (duplicate) {
      return res.status(409).json({ status: 'fail', message: 'A duplicate expense record was recently submitted. Please wait or verify details.' });
    }

    let bankAccount = null;
    if (bankAccountId) {
      bankAccount = await BankAccount.findById(bankAccountId);
      if (!bankAccount) {
        return res.status(404).json({ status: 'fail', message: 'Bank account not found.' });
      }
      if (bankAccount.balance < numericAmount) {
        return res.status(400).json({ status: 'fail', message: 'Insufficient funds in bank account.' });
      }
    }

    const expense = await Expense.create({
      category,
      staffName: req.user.name,
      referenceReceipt,
      amount: numericAmount,
      description,
      bankAccount: bankAccountId || null,
      proofOfReceipt: proofOfReceipt || undefined,
    });

    if (bankAccount) {
      bankAccount.balance -= numericAmount;
      await bankAccount.save();
    }

    res.status(201).json({ status: 'success', data: expense });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
