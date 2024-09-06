const Book = require('../models/book');
const Category = require('../models/category');
const sharp = require('sharp');
const path = require('path');


async function processAndSaveImage(file, filename) {
    const imagePath = path.join(__dirname, '../public/uploads', filename);
    await sharp(file.data)
        .resize(400, 400) 
        .toFile(imagePath); 
    return `/uploads/${filename}`; 
}

// Display the book management page
exports.bookManage = async (req, res) => {
    try {
        // Fetch all books, including those marked as deleted
        const books = await Book.find(); // No filter for deleted status
         
        res.render('bookManage', { books });
    } catch (error) {
        console.error('Error retrieving books:', error);
        res.status(500).send('Error retrieving books');
    }
};
// Display the form for adding a new book

    exports.getAddBookForm = async (req, res) => {
        try {
            // Fetch categories and books for dropdowns
            const categories = await Category.find({});
            const books = await Book.find({});
            res.render('addBook', { categories, books });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    };


// Display the form for editing an existing book
exports.getEditBookForm = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        const categories = await Category.find();
        const books = await Book.find();

        // Check if the book exists
        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Render the edit book form with the book data and any error message
        res.render('editBook', { book, categories, books, errorMessage: null }); // Pass errorMessage as null initially
    } catch (error) {
        console.error(error);
        res.status(500).send('Error displaying edit book form');
    }
};


exports.editBook = async (req, res) => {
    let book; // Declare book variable here

    try {
        // Find the book by ID
        const bookId = req.params.id; // Assuming the ID comes from the URL
        book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Update book details
        book.name = req.body.name;
        book.author = req.body.author;
        book.chapters = req.body.chapters;
        book.synopsis = req.body.synopsis;
        book.regular_price = req.body.regular_price;
        book.sale_price = req.body.sale_price;
        book.stock = req.body.stock;

        // Allowed image types
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif'];

        // Handle image uploads
        const uploadPath = '/uploads/';
        const processImage = async (file) => {
            if (file && allowedImageTypes.includes(file.mimetype)) {
                const fileName = Date.now() + path.basename(file.name);
                const outputPath = './public' + uploadPath + fileName;

                // Resize and crop the image
                await sharp(file.data)
                    .resize(600, 800) // Resize to 600x800
                    .toFile(outputPath);

                return uploadPath + fileName;
            } else {
                throw new Error('Invalid image type. Only JPEG, JPG, PNG, BMP, and GIF are allowed.');
            }
        };

        // Process each image if provided
        if (req.files) {
            if (req.files.image1) {
                book.image1 = await processImage(req.files.image1);
            }
            if (req.files.image2) {
                book.image2 = await processImage(req.files.image2);
            }
            if (req.files.image3) {
                book.image3 = await processImage(req.files.image3);
            }
        }

        // Update categories and related products
        book.category = req.body['category[]'] || []; // Update categories
        book.related_products = req.body['related_products[]'] || []; // Update related products

        // Save the updated book
        await book.save();

        // Update categories collection
        await Category.updateMany(
            { name: { $in: book.category } },
            { $addToSet: { books: book._id } } // Add the book ID to the books array in each selected category
        );

        res.redirect('/admin/bookManagement'); // Redirect after successful update
    } catch (err) {
        console.error(err);
        // Fetch categories and books again to pass to the view
        const categories = await Category.find();
        const books = await Book.find();
        // Render the edit form with the book data and error message
        res.render('editBook', { book, categories, books, errorMessage: err.message });
    }
};
// Handle the soft deletion of a book
exports.deleteBook = async (req, res) => {
    try {
        await Book.findByIdAndUpdate(req.params.id, { $set: { deleted: true } }); 
        res.redirect('/admin/bookManagement');
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).send('Error deleting book');
    }
};
exports.restoreBook = async (req, res) => {
    try {
        await Book.findByIdAndUpdate(req.params.id, { $set: { deleted: false } }); 
        res.redirect('/admin/bookManagement');
    } catch (error) {
        console.error('Error restoring book:', error);
        res.status(500).send('Error restoring book');
    }
};
//  render the addCategory form
exports.getAddCategory = (req, res) => {
    res.render('addCategory');
};

// handle form submission and add the category to the database
exports.postAddCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const newCategory = new Category({ name });
        await newCategory.save();
        res.redirect('/admin/bookManagement'); 
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).send('Server Error');
    }
};
