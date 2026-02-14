const express = require('express');
const router = express.Router();
const {
  getMaterial,
  updateNotes,
  uploadFile,
  deleteFile,
  addVideo,
  deleteVideo,
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all material for a topic
router.get('/:topicId', protect, getMaterial);

// Update notes (admin only)
router.put('/:topicId/notes', protect, authorize('admin'), updateNotes);

// Upload file (admin only)
router.post(
  '/:topicId/files',
  protect,
  authorize('admin'),
  upload.single('file'),
  uploadFile
);

// Delete file (admin only)
router.delete('/:topicId/files/:fileId', protect, authorize('admin'), deleteFile);

// Add YouTube video (admin only)
router.post('/:topicId/videos', protect, authorize('admin'), addVideo);

// Delete video (admin only)
router.delete('/:topicId/videos/:videoId', protect, authorize('admin'), deleteVideo);

module.exports = router;
