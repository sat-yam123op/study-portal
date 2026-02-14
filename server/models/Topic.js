const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
      maxlength: 200,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for search
topicSchema.index({ title: 'text' });

module.exports = mongoose.model('Topic', topicSchema);
