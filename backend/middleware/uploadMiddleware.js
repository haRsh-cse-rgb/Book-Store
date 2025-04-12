const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); 

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'book-exchange-app', 
    allowed_formats: ['jpg', 'png', 'jpeg'],
    
  },
});

const upload = multer({ storage: storage });

module.exports = upload;