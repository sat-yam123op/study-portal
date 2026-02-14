const Topic = require('../models/Topic');
const Material = require('../models/Material');

// ─── POST /api/topics ─── (Admin only)
const createTopic = async (req, res, next) => {
  try {
    const { title, subjectId } = req.body;
    const topic = await Topic.create({ title, subjectId });

    // Auto-create an empty material document for this topic
    await Material.create({ topicId: topic._id });

    res.status(201).json(topic);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/topics?subjectId=xxx ───
const getTopicsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    if (!subjectId) {
      return res.status(400).json({ message: 'subjectId query param required' });
    }
    const topics = await Topic.find({ subjectId }).sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/topics/:id ───
const getTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('subjectId', 'title');
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/topics/:id ─── (Admin only)
const updateTopic = async (req, res, next) => {
  try {
    const { title } = req.body;
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true, runValidators: true }
    );
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/topics/:id ─── (Admin only)
const deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Cascade delete material
    await Material.deleteMany({ topicId: topic._id });
    await Topic.findByIdAndDelete(req.params.id);

    res.json({ message: 'Topic and related materials deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTopic,
  getTopicsBySubject,
  getTopic,
  updateTopic,
  deleteTopic,
};
