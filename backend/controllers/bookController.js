const Book = require('../models/Book');
const User = require('../models/User'); 
const cloudinary = require('../config/cloudinary');

exports.getAllBooks = async (req, res) => {
  const { title, location } = req.query;
  const query = {};

  if (title) {
    query.title = { $regex: title, $options: 'i' }; 
  }
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  try {
    const books = await Book.find(query).populate('owner', 'name email'); 
    res.json(books);
  } catch (error) {
    console.error('Get Books Error:', error.message);
    res.status(500).json({ message: 'Server error fetching books' });
  }
};


exports.getMyListings = async (req, res) => {
    try {
        const books = await Book.find({ owner: req.params.userId }).populate('owner', 'name email');
        if (!books) {
            return res.status(404).json({ message: 'No books found for this user' });
        }
        res.json(books);
    } catch (error) {
        console.error('Get My Listings Error:', error.message);
        res.status(500).json({ message: 'Server error fetching listings' });
    }
};



exports.addBook = async (req, res) => {
  const { title, author, genre, location, contact, ownerId } = req.body;

  if (!ownerId) {
      return res.status(400).json({ message: 'Owner ID is required' });
  }

  try {
    
    const ownerUser = await User.findById(ownerId);
    if (!ownerUser || ownerUser.role !== 'Owner') {
      
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(403).json({ message: 'User not authorized or not found' });
    }

    const newBook = new Book({
      title,
      author,
      genre,
      location,
      contact,
      owner: ownerId,
      imageUrl: req.file ? req.file.path : undefined, 
      cloudinaryId: req.file ? req.file.filename : undefined, 
    });

    const book = await newBook.save();
    
    await book.populate('owner', 'name email');
    res.status(201).json(book);
  } catch (error) {
    console.error('Add Book Error:', error);
     
    if (req.file) {
        try {
            await cloudinary.uploader.destroy(req.file.filename);
            console.log('Cleaned up uploaded file due to error');
        } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
        }
    }
    res.status(500).json({ message: 'Server error adding book', error: error.message });
  }
};


exports.updateBook = async (req, res) => {
    const { title, author, genre, location, contact, ownerId } = req.body;
    const bookId = req.params.id;

     if (!ownerId) {
        return res.status(400).json({ message: 'Owner ID is required for verification' });
    }

    try {
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        
        if (book.owner.toString() !== ownerId) {
            return res.status(403).json({ message: 'User not authorized to update this book' });
        }

        
        let imageUrl = book.imageUrl;
        let cloudinaryId = book.cloudinaryId;

        if (req.file) {
            
            if (book.cloudinaryId) {
                await cloudinary.uploader.destroy(book.cloudinaryId);
            }
            imageUrl = req.file.path;
            cloudinaryId = req.file.filename;
        }

        
        book.title = title || book.title;
        book.author = author || book.author;
        book.genre = genre || book.genre;
        book.location = location || book.location;
        book.contact = contact || book.contact;
        book.imageUrl = imageUrl;
        book.cloudinaryId = cloudinaryId;

        const updatedBook = await book.save();
         
        await updatedBook.populate('owner', 'name email');
        res.json(updatedBook);

    } catch (error) {
        console.error('Update Book Error:', error);
         
         if (req.file) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
                console.log('Cleaned up newly uploaded file due to update error');
            } catch (cleanupError) {
                console.error('Error cleaning up file during update error:', cleanupError);
            }
        }
        res.status(500).json({ message: 'Server error updating book', error: error.message });
    }
};



exports.updateBookStatus = async (req, res) => {
  const { status, ownerId } = req.body; 

   if (!ownerId) {
        return res.status(400).json({ message: 'Owner ID is required for verification' });
    }
  if (!['Available', 'Rented/Exchanged'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    
    if (book.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'User not authorized to change status' });
    }

    book.status = status;
    await book.save();
    
    await book.populate('owner', 'name email');
    res.json(book);
  } catch (error) {
    console.error('Update Status Error:', error.message);
    res.status(500).json({ message: 'Server error updating book status' });
  }
};


exports.deleteBook = async (req, res) => {
    const { id, ownerId } = req.params; 

    if (!ownerId) {
        return res.status(400).json({ message: 'Owner ID is required for verification' });
    }

    try {
        const book = await Book.findById(id);

        if (!book) {
        return res.status(404).json({ message: 'Book not found' });
        }

        // Authorization check
        if (book.owner.toString() !== ownerId) {
        return res.status(403).json({ message: 'User not authorized to delete this book' });
        }

        
        if (book.cloudinaryId) {
            try {
                await cloudinary.uploader.destroy(book.cloudinaryId);
            } catch (cloudinaryError) {
                console.error('Cloudinary Delete Error:', cloudinaryError);
                
            }
        }

        await book.deleteOne(); 

        res.json({ message: 'Book removed successfully' });
    } catch (error) {
        console.error('Delete Book Error:', error.message);
        res.status(500).json({ message: 'Server error deleting book' });
    }
};