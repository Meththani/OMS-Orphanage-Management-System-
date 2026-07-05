const express = require('express');
const {
  createChild,
  getAllChildren,
  getChild,
  updateChild,
  archiveChild,
  addMedicalRecord,
  addEducationRecord,
  deleteChild,
  deleteMedicalRecord,
  deleteEducationRecord,
} = require('../controllers/childController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Accountant and Donor have no access to child records — financial roles
// don't need it, and donors definitely shouldn't see it.
router.use(protect, restrictTo('admin', 'staff'));

router.route('/').get(getAllChildren).post(createChild);

router.route('/:id')
  .get(getChild)
  .patch(updateChild)
  .delete(restrictTo('admin'), deleteChild);

router.patch('/:id/archive', restrictTo('admin'), archiveChild);

router.post('/:id/medical-records', addMedicalRecord);
router.post('/:id/education-records', addEducationRecord);

router.delete('/medical-records/:id', deleteMedicalRecord);
router.delete('/education-records/:id', deleteEducationRecord);

module.exports = router;
