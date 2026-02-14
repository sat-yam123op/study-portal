const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Material = require('../models/Material');

// ─── GET /api/search?q=keyword ───
const search = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const regex = new RegExp(q.trim(), 'i');

    // Search across all collections in parallel
    const [subjects, topics, materials] = await Promise.all([
      Subject.find({ $or: [{ title: regex }, { description: regex }] })
        .select('title description')
        .limit(10),
      Topic.find({ title: regex })
        .populate('subjectId', 'title')
        .select('title subjectId')
        .limit(10),
      Material.find({
        $or: [
          { notes: regex },
          { 'files.originalName': regex },
          { 'videos.title': regex },
        ],
      })
        .populate('topicId', 'title subjectId')
        .select('topicId files videos')
        .limit(10),
    ]);

    res.json({ subjects, topics, materials });
  } catch (error) {
    next(error);
  }
};

module.exports = { search };
