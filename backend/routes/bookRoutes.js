const express = require('express');
const {
  getAllBooks,
  getMyListings,
  addBook,
  updateBook,
  updateBookStatus,
  deleteBook,
} = require('../controllers/bookController');
const upload = require('../middleware/uploadMiddleware'); 
const router = express.Router();

router.get('/', getAllBooks);


router.get('/my-listings/:userId', getMyListings);

router.post('/', upload.single('bookImage'), addBook);
router.put('/:id', upload.single('bookImage'), updateBook); 
router.put('/:id/status', updateBookStatus);
router.delete('/:id/:ownerId', deleteBook); 


module.exports = router;