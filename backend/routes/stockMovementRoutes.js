const express = require('express');
const {
  getMovements,
  createReceipt,
  createIssue,
  getStockReport,
} = require('../controllers/stockMovementController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('staff', 'admin'));

// GET  /api/stock-movements              — list movements (filter by type, itemId, dates)
// GET  /api/stock-movements/report       — stock report (opening/closing) for a period
// POST /api/stock-movements/receipt      — add stock receipt (GRN)
// POST /api/stock-movements/issue        — log stock issue

router.get('/report', getStockReport);
router.get('/', getMovements);
router.post('/receipt', createReceipt);
router.post('/issue', createIssue);

module.exports = router;
