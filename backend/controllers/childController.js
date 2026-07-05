const Child = require('../models/Child');
const MedicalRecord = require('../models/MedicalRecord');
const EducationRecord = require('../models/EducationRecord');

// POST /api/children
exports.createChild = async (req, res) => {
  try {
    const child = await Child.create(req.body);
    res.status(201).json({ status: 'success', data: child });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// GET /api/children?status=active
exports.getAllChildren = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const children = await Child.find(filter).populate('assignedStaff', 'name jobRole');
    res.status(200).json({ status: 'success', results: children.length, data: children });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/children/:id — returns the profile plus its medical/education history
exports.getChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id).populate('assignedStaff', 'name jobRole');
    if (!child) return res.status(404).json({ status: 'fail', message: 'Child not found.' });

    const [medicalRecords, educationRecords] = await Promise.all([
      MedicalRecord.find({ childID: child._id }).sort('-recordDate'),
      EducationRecord.find({ childID: child._id }),
    ]);

    res.status(200).json({ status: 'success', data: { child, medicalRecords, educationRecords } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/children/:id
exports.updateChild = async (req, res) => {
  try {
    const child = await Child.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!child) return res.status(404).json({ status: 'fail', message: 'Child not found.' });
    res.status(200).json({ status: 'success', data: child });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/children/:id/archive — soft delete, admin-only (see childRoutes.js)
exports.archiveChild = async (req, res) => {
  try {
    const child = await Child.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
    if (!child) return res.status(404).json({ status: 'fail', message: 'Child not found.' });
    res.status(200).json({ status: 'success', message: 'Child record archived.', data: child });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/children/:id/medical-records
exports.addMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.create({ ...req.body, childID: req.params.id });
    res.status(201).json({ status: 'success', data: record });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// POST /api/children/:id/education-records
exports.addEducationRecord = async (req, res) => {
  try {
    const record = await EducationRecord.create({ ...req.body, childID: req.params.id });
    res.status(201).json({ status: 'success', data: record });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/children/:id — permanent delete (admin only)
exports.deleteChild = async (req, res) => {
  try {
    const child = await Child.findByIdAndDelete(req.params.id);
    if (!child) return res.status(404).json({ status: 'fail', message: 'Child not found.' });

    // Delete associated medical and education history
    await Promise.all([
      MedicalRecord.deleteMany({ childID: child._id }),
      EducationRecord.deleteMany({ childID: child._id })
    ]);

    res.status(200).json({ status: 'success', message: 'Child record permanently deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/children/medical-records/:id
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ status: 'fail', message: 'Medical record not found.' });
    res.status(200).json({ status: 'success', message: 'Medical record deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/children/education-records/:id
exports.deleteEducationRecord = async (req, res) => {
  try {
    const record = await EducationRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ status: 'fail', message: 'Academic record not found.' });
    res.status(200).json({ status: 'success', message: 'Academic record deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
