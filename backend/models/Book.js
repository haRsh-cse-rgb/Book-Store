const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String },
  location: { type: String, required: true }, 
  contact: { type: String, required: true }, 
  imageUrl: { type: String }, 
  cloudinaryId: { type: String }, 
  status: {
    type: String,
    enum: ['Available', 'Rented/Exchanged'],
    default: 'Available',
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});


BookSchema.index({ title: 'text', location: 'text' });

module.exports = mongoose.model('Book', BookSchema);