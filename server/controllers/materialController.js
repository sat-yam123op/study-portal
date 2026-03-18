const Material = require('../models/Material');
const Update = require('../models/Update');   // NEW
const Topic = require('../models/Topic');     // NEW (for subjectId)
const fs = require('fs');
const path = require('path');


// --- Helper: get or create material for a topic ---
const getOrCreateMaterial = async (topicId) => {
  let material = await Material.findOne({ topicId });
  if (!material) {
    material = await Material.create({ topicId });
  }
  return material;
};


// --- Helper: create update record ---
const createUpdate = async (type, title, topicId) => {
  try {
    const topic = await Topic.findById(topicId).select('subjectId title');

    if (!topic) {
      console.warn(`createUpdate: topic ${topicId} not found, skipping update log`);
      return;
    }

    // Prevent duplicate update spam within 5 minutes for same title/topic pair
    const existing = await Update.findOne({
      title,
      topicId,
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) },
    });

    if (existing) {
      return;
    }

    await Update.create({
      type,
      title,
      topicId,
      subjectId: topic.subjectId,
      createdAt: new Date(),
    });
  } catch (err) {
    // Log the full error so issues are visible during development
    console.error('createUpdate failed:', err);
  }
};


// --- GET /api/materials/:topicId --- Fetch all content
const getMaterial = async (req, res, next) => {
  try {
    const material = await getOrCreateMaterial(req.params.topicId);
    const payload = material.toObject();

    // Never expose all students' private notes through this shared payload.
    delete payload.studentNotes;

    res.json(payload);
  } catch (error) {
    next(error);
  }
};


// --- GET /api/materials/:topicId/student-notes --- Fetch current student's private notes
const getStudentNotes = async (req, res, next) => {
  try {
    const material = await getOrCreateMaterial(req.params.topicId);

    const note = material.studentNotes.find(
      (n) => n.userId && n.userId.toString() === req.user.id
    );

    res.json({ content: note?.content || '', updatedAt: note?.updatedAt || null });
  } catch (error) {
    next(error);
  }
};


// --- PUT /api/materials/:topicId/student-notes --- Create/update current student's private notes
const updateStudentNotes = async (req, res, next) => {
  try {
    const { content = '' } = req.body;
    const material = await getOrCreateMaterial(req.params.topicId);

    const note = material.studentNotes.find(
      (n) => n.userId && n.userId.toString() === req.user.id
    );

    if (note) {
      note.content = content;
      note.updatedAt = new Date();
    } else {
      material.studentNotes.push({
        userId: req.user.id,
        content,
        updatedAt: new Date(),
      });
    }

    await material.save();

    const saved = material.studentNotes.find(
      (n) => n.userId && n.userId.toString() === req.user.id
    );

    res.json({ content: saved?.content || '', updatedAt: saved?.updatedAt || null });
  } catch (error) {
    next(error);
  }
};


// --- PUT /api/materials/:topicId/notes --- Add/update notes
const updateNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;

    const material = await getOrCreateMaterial(req.params.topicId);

    material.notes = notes;

    await material.save();

    // NEW: create update log (include topic name for context)
    const topic = await Topic.findById(req.params.topicId).select('title');
    await createUpdate(
      'notes',
      `Notes updated: ${topic?.title || 'Unknown topic'}`,
      req.params.topicId
    );

    res.json(material);
  } catch (error) {
    next(error);
  }
};


// --- POST /api/materials/:topicId/files --- Upload file
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const material = await getOrCreateMaterial(req.params.topicId);

    material.files.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    await material.save();

    // NEW: create update log
    await createUpdate(
      'file',
      `${req.file.originalname} uploaded`,
      req.params.topicId
    );

    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
};


// --- DELETE /api/materials/:topicId/files/:fileId --- Remove file
const deleteFile = async (req, res, next) => {
  try {
    const material = await Material.findOne({ topicId: req.params.topicId });

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const file = material.files.id(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', file.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    material.files.pull({ _id: req.params.fileId });

    await material.save();

    res.json({ message: 'File deleted', material });
  } catch (error) {
    next(error);
  }
};


// --- POST /api/materials/:topicId/videos --- Add YouTube link
const addVideo = async (req, res, next) => {
  try {
    const { title, url, description } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

    if (!youtubeRegex.test(url)) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    const material = await getOrCreateMaterial(req.params.topicId);

    material.videos.push({
      title,
      url,
      description,
    });

    await material.save();

    // NEW: create update log
    await createUpdate(
      'video',
      `Video added: ${title}`,
      req.params.topicId
    );

    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
};


// --- DELETE /api/materials/:topicId/videos/:videoId ---
const deleteVideo = async (req, res, next) => {
  try {
    const material = await Material.findOne({ topicId: req.params.topicId });

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    material.videos.pull({ _id: req.params.videoId });

    await material.save();

    res.json({ message: 'Video removed', material });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getMaterial,
  getStudentNotes,
  updateStudentNotes,
  updateNotes,
  uploadFile,
  deleteFile,
  addVideo,
  deleteVideo,
};
