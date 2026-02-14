const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Material = require('../models/Material');

// ─── POST /api/subjects ─── (Admin only)
const createSubject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const subject = await Subject.create({
      title,
      description,
      createdBy: req.user._id,
    });
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/subjects ───
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/subjects/:id ───
const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).populate(
      'createdBy',
      'name'
    );
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/subjects/:id ─── (Admin only)
const updateSubject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    );
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/subjects/:id ─── (Admin only)
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Cascade delete: topics and materials under this subject
    const topics = await Topic.find({ subjectId: subject._id });
    const topicIds = topics.map((t) => t._id);
    await Material.deleteMany({ topicId: { $in: topicIds } });
    await Topic.deleteMany({ subjectId: subject._id });
    await Subject.findByIdAndDelete(req.params.id);

    res.json({ message: 'Subject and all related data deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
};
