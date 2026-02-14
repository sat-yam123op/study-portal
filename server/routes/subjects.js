const express = require('express');
const router = express.Router();
const {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getSubjects)
  .post(protect, authorize('admin'), createSubject);

router
  .route('/:id')
  .get(protect, getSubject)
  .put(protect, authorize('admin'), updateSubject)
  .delete(protect, authorize('admin'), deleteSubject);

module.exports = router;
