const Update = require('../models/Update');


// ─── GET /api/updates ─── Latest 15 updates
const getLatestUpdates = async (req, res, next) => {
  try {
    const updates = await Update
      .find()
      .sort({ createdAt: -1 })
      .limit(15)
      .populate('topicId', 'title')
      .populate('subjectId', 'title');

    res.json(updates);
  } catch (error) {
    next(error);
  }
};


module.exports = { getLatestUpdates };
