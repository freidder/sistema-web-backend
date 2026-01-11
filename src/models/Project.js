const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    client: { type: String, required: true },
    address: { type: String, required: true },
    sidingType: { type: String, required: true },
    area: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'finished'], default: 'pending' },
    startDate: { type: Date },
    endDate: { type: Date },
    notes: { type: String },
    photos: [{ type: String }],
    files: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
