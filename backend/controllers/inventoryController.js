const InventoryItem = require('../models/InventoryItem');

// GET /api/inventory
exports.getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find().sort('name');
    res.status(200).json({ status: 'success', data: items });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/inventory/barcode/:barcode
exports.getInventoryByBarcode = async (req, res) => {
  try {
    const barcode = req.params.barcode ? req.params.barcode.trim() : '';
    if (!barcode) {
      return res.status(400).json({ status: 'fail', message: 'Barcode parameter is required.' });
    }

    const item = await InventoryItem.findOne({ barcode });
    if (!item) {
      return res.status(404).json({ status: 'fail', message: `No inventory item found for barcode "${barcode}".` });
    }

    res.status(200).json({ status: 'success', data: item });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/inventory
exports.createInventoryItem = async (req, res) => {
  try {
    const { name, category, quantity, unit, barcode } = req.body;
    if (!name || !category || quantity === undefined || !unit) {
      return res.status(400).json({ status: 'fail', message: 'Missing inventory fields.' });
    }

    const newItem = await InventoryItem.create({
      name,
      category,
      quantity,
      unit,
      barcode: barcode ? barcode.trim() : '',
    });

    res.status(201).json({ status: 'success', data: newItem });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/inventory/:id
exports.updateInventoryItem = async (req, res) => {
  try {
    const { quantity, addQuantity, name, category, unit, barcode } = req.body;

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
    if (barcode !== undefined) item.barcode = barcode.trim();

    await item.save();

    res.status(200).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
