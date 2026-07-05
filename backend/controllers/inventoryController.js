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

// POST /api/inventory
exports.createInventoryItem = async (req, res) => {
  try {
    const { name, category, quantity, unit } = req.body;
    if (!name || !category || quantity === undefined || !unit) {
      return res.status(400).json({ status: 'fail', message: 'Missing inventory fields.' });
    }

    const newItem = await InventoryItem.create({
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
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ status: 'fail', message: 'Quantity is required for update.' });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ status: 'fail', message: 'Inventory item not found.' });
    }

    item.quantity = quantity;
    await item.save();

    res.status(200).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
