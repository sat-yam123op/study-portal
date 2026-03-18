const Update = require('../models/Update');


// ─── GET /api/updates ─── Latest 10 updates
const getLatestUpdates = async (req, res, next) => {
  try {
    const updates = await Update
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('topicId', 'title')
      .populate('subjectId', 'title');

    res.json(updates);
  } catch (error) {
    next(error);
  }
};


module.exports = { getLatestUpdates };
