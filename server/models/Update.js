const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['file', 'note', 'video', 'topic'],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
  },
  { timestamps: true }
);

// Index for fast "latest updates" query
updateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Update', updateSchema);