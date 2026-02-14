const Material = require('../models/Material');
const fs = require('fs');
const path = require('path');

// ─── Helper: get or create material for a topic ───
const getOrCreateMaterial = async (topicId) => {
  let material = await Material.findOne({ topicId });
  if (!material) {
    material = await Material.create({ topicId });
  }
  return material;
};

// ─── GET /api/materials/:topicId ─── Fetch all content
const getMaterial = async (req, res, next) => {
  try {
    const material = await getOrCreateMaterial(req.params.topicId);
    res.json(material);
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/materials/:topicId/notes ─── Add/update notes
const updateNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const material = await getOrCreateMaterial(req.params.topicId);
    material.notes = notes;
    await material.save();
    res.json(material);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/materials/:topicId/files ─── Upload file
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
    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/materials/:topicId/files/:fileId ─── Remove file
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

    // Delete physical file
    const filePath = path.join(__dirname, '..', 'uploads', file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from array
    material.files.pull({ _id: req.params.fileId });
    await material.save();
    res.json({ message: 'File deleted', material });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/materials/:topicId/videos ─── Add YouTube link
const addVideo = async (req, res, next) => {
  try {
    const { title, url, description } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    const material = await getOrCreateMaterial(req.params.topicId);
    material.videos.push({ title, url, description });
    await material.save();
    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/materials/:topicId/videos/:videoId ───
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
  updateNotes,
  uploadFile,
  deleteFile,
  addVideo,
  deleteVideo,
};
