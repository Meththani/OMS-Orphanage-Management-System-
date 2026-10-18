const InventoryItem = require('../models/InventoryItem');
const StockMovement = require('../models/StockMovement');

// ─── Helper: auto-generate reference numbers ───────────────────────────────
const generateRefNumber = async (type) => {
  const year = new Date().getFullYear();
  const prefix = type === 'receipt' ? `GRN-${year}-` : `ISS-${year}-`;

  const last = await StockMovement.findOne({
    referenceNumber: new RegExp(`^${prefix}`),
    type,
  })
    .sort({ referenceNumber: -1 })
    .select('referenceNumber');

  let seq = 1;
  if (last && last.referenceNumber) {
    const parts = last.referenceNumber.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) seq = lastNum + 1;
  }
  return `${prefix}${String(seq).padStart(3, '0')}`;
};

// ─── GET /api/stock-movements ───────────────────────────────────────────────
// Query params: type, itemId, startDate, endDate
exports.getMovements = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.itemId) filter.itemId = req.query.itemId;
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const movements = await StockMovement.find(filter)
      .populate('itemId', 'itemNumber name category unit')
      .sort({ date: -1 });

    res.status(200).json({ status: 'success', data: movements });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── POST /api/stock-movements/receipt ─────────────────────────────────────
// Record a new stock receipt (GRN) — adds qty to the item
exports.createReceipt = async (req, res) => {
  try {
    const { itemId, quantity, supplier, date } = req.body;
    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ status: 'fail', message: 'itemId and quantity are required.' });
    }

    const item = await InventoryItem.findById(itemId);
    if (!item) return res.status(404).json({ status: 'fail', message: 'Inventory item not found.' });

    const stockBefore = item.quantity;
    item.quantity = item.quantity + Number(quantity);
    await item.save();

    const referenceNumber = await generateRefNumber('receipt');

    const movement = await StockMovement.create({
      referenceNumber,
      type: 'receipt',
      itemId,
      quantity: Number(quantity),
      supplier: supplier || '',
      date: date ? new Date(date) : new Date(),
      recordedBy: req.user._id,
      recordedByName: req.user.name || '',
      stockBefore,
      stockAfter: item.quantity,
    });

    res.status(201).json({ status: 'success', data: movement });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// ─── POST /api/stock-movements/issue ───────────────────────────────────────
// Record a stock issue — deducts qty from the item
exports.createIssue = async (req, res) => {
  try {
    const { itemId, quantity, issuedTo, purpose, date } = req.body;
    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ status: 'fail', message: 'itemId and quantity are required.' });
    }

    const item = await InventoryItem.findById(itemId);
    if (!item) return res.status(404).json({ status: 'fail', message: 'Inventory item not found.' });

    if (item.quantity < Number(quantity)) {
      return res.status(400).json({
        status: 'fail',
        message: `Insufficient stock. Available: ${item.quantity} ${item.unit}, Requested: ${quantity}.`,
      });
    }

    const stockBefore = item.quantity;
    item.quantity = item.quantity - Number(quantity);
    await item.save();

    const referenceNumber = await generateRefNumber('issue');

    const movement = await StockMovement.create({
      referenceNumber,
      type: 'issue',
      itemId,
      quantity: Number(quantity),
      issuedTo: issuedTo || '',
      purpose: purpose || '',
      date: date ? new Date(date) : new Date(),
      recordedBy: req.user._id,
      recordedByName: req.user.name || '',
      stockBefore,
      stockAfter: item.quantity,
    });

    res.status(201).json({ status: 'success', data: movement });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// ─── GET /api/stock-movements/report ───────────────────────────────────────
// Returns opening stock, receipts, issues, and closing stock for a period
// Query: startDate, endDate
exports.getStockReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ status: 'fail', message: 'startDate and endDate are required.' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // All items
    const items = await InventoryItem.find().sort('name');

    // All movements within the period
    const movements = await StockMovement.find({ date: { $gte: start, $lte: end } })
      .populate('itemId', 'itemNumber name category unit')
      .sort({ date: 1 });

    // All movements BEFORE the period (to calculate opening stock)
    const beforeMovements = await StockMovement.find({ date: { $lt: start } });

    // Build per-item report
    const report = items.map((item) => {
      const id = item._id.toString();

      // Opening stock = current stock - (receipts in period) + (issues in period)
      // i.e., reconstruct: current = opening + receipts - issues
      // so: opening = current - receipts + issues
      const periodReceipts = movements.filter(m => m.type === 'receipt' && m.itemId?._id?.toString() === id);
      const periodIssues = movements.filter(m => m.type === 'issue' && m.itemId?._id?.toString() === id);

      const totalReceived = periodReceipts.reduce((s, m) => s + m.quantity, 0);
      const totalIssued = periodIssues.reduce((s, m) => s + m.quantity, 0);

      // Opening stock = closing stock - received + issued
      const closingStock = item.quantity;
      const openingStock = closingStock - totalReceived + totalIssued;

      return {
        item: {
          _id: item._id,
          itemNumber: item.itemNumber,
          name: item.name,
          category: item.category,
          unit: item.unit,
          status: item.status,
        },
        openingStock: Math.max(0, openingStock),
        totalReceived,
        totalIssued,
        closingStock,
        receipts: periodReceipts,
        issues: periodIssues,
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        period: { startDate: start, endDate: end },
        report,
        movements,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
