const InventoryItem = require('../models/InventoryItem');

// Helper: generate a unique item number like INV-2026-001
const generateItemNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  // Find the highest existing number with this year prefix
  const last = await InventoryItem.findOne({ itemNumber: new RegExp(`^${prefix}`) })
    .sort({ itemNumber: -1 })
    .select('itemNumber');

  let seq = 1;
  if (last && last.itemNumber) {
    const parts = last.itemNumber.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) seq = lastNum + 1;
  }
  return `${prefix}${String(seq).padStart(3, '0')}`;
};

// GET /api/inventory
exports.getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find().sort('name');
    res.status(200).json({ status: 'success', data: items });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/inventory
exports.createInventoryItem = async (req, res) => {
  try {
    const { name, category, quantity, unit } = req.body;
    if (!name || !category || quantity === undefined || !unit) {
      return res.status(400).json({ status: 'fail', message: 'Missing inventory fields.' });
    }

    const itemNumber = await generateItemNumber();

    const newItem = await InventoryItem.create({
      itemNumber,
      name,
      category,
      quantity,
      unit,
    });

    res.status(201).json({ status: 'success', data: newItem });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/inventory/:id
exports.updateInventoryItem = async (req, res) => {
  try {
    const { quantity, addQuantity, name, category, unit } = req.body;

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ status: 'fail', message: 'Inventory item not found.' });
    }

    if (addQuantity !== undefined) {
      item.quantity = Math.max(0, item.quantity + Number(addQuantity));
    } else if (quantity !== undefined) {
      item.quantity = Number(quantity);
    }

    if (name) item.name = name;
    if (category) item.category = category;
    if (unit) item.unit = unit;

    await item.save();

    res.status(200).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
