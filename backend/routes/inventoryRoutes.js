const express = require('express');
const {
  getInventory,
  getInventoryByBarcode,
  createInventoryItem,
  updateInventoryItem,
} = require('../controllers/inventoryController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('staff', 'admin'));

router.get('/barcode/:barcode', getInventoryByBarcode);

router.route('/')
  .get(getInventory)
  .post(createInventoryItem);

router.route('/:id')
  .patch(updateInventoryItem);

module.exports = router;
