const Book = require('../models/book');
const User = require('../models/user');


exports.bookDetails = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        res.render('bookDetails', { book });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
const Category = require('../models/category'); 

exports.listProducts = async (req, res) => {
    try {
        // Only fetch categories that are not marked as deleted
        const categories = await Category.find({ deleted: false }).populate('books');
        
        // Filter out books that are marked as deleted from the categories
        categories.forEach(category => {
            category.books = category.books.filter(book => !book.deleted);
        });

        res.render('productList', { categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.redirect('/products'); 
        }

        

        // Perform case-insensitive search on the book name
        const categories = await Category.find().populate({
            path: 'books',
            match: { name: { $regex: query, $options: 'i' } }, // Case-insensitive search
        });

        // Filter out categories that have no matching books
        const filteredCategories = categories.filter(category => category.books && category.books.length > 0);

        // Log the results for debugging purposes
        console.log("Filtered Categories:", filteredCategories);

        
        res.render('productList', { categories: filteredCategories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
exports.bookDetails = async (req, res) => {
    try {
        // Fetch the book with related products populated
        const book = await Book.findById(req.params.id).populate('related_products').exec();
        
        if (!book) {
            return res.status(404).send('Book not found');
        }

        res.render('bookDetails', { book });
    } catch (error) {
        console.error('Error fetching book details:', error);
        res.status(500).send('Server Error');
    }
};
exports.addComment = async (req, res) => {
    try {
        console.log('Request body:', req.body); // Log the request body
        console.log('Request params:', req.params); // Log the request params
        console.log('User:', req.user); // Log the user object

        const bookId = req.params.id;
        const { rating, comment } = req.body;

        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).send('User not authenticated');
        }

        // Find the book by its ID
        const book = await Book.findById(bookId);

        // Log the book found
        console.log('Book found:', book);

        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Add the new comment to the book's reviews array
        book.review.push({
            user_id: req.user._id,  // Assuming user is logged in and req.user is available
            username: req.user.username,
            rating,
            comment,
        });

        // Save the updated book document
        await book.save();

        // Redirect back to the book details page
        res.redirect(`/books/${bookId}`);
    } catch (error) {
        console.error('Error adding comment:', error);  // Log the error details
        res.status(500).send('Server Error');
    }
};