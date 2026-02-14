const express = require('express');
const router = express.Router();
const {
  createTopic,
  getTopicsBySubject,
  getTopic,
  updateTopic,
  deleteTopic,
} = require('../controllers/topicController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getTopicsBySubject)
  .post(protect, authorize('admin'), createTopic);

router
  .route('/:id')
  .get(protect, getTopic)
  .put(protect, authorize('admin'), updateTopic)
  .delete(protect, authorize('admin'), deleteTopic);

module.exports = router;
