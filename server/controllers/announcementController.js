const Announcement = require('../models/Announcement');

// ─── POST /api/announcements ─── (Admin only)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user._id,
    });
    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/announcements ───
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/announcements/:id ─── (Admin only)
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAnnouncement, getAnnouncements, deleteAnnouncement };
