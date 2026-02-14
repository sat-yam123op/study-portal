const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    // Rich text notes
    notes: {
      type: String,
      default: '',
    },
    // Uploaded files (pdf, images, docs)
    files: [
      {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        path: { type: String, required: true },
        mimetype: { type: String },
        size: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // YouTube video links
    videos: [
      {
        title: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for search on notes and video titles
materialSchema.index({
  notes: 'text',
  'files.originalName': 'text',
  'videos.title': 'text',
});

module.exports = mongoose.model('Material', materialSchema);
