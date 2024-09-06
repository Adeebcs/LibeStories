const { v4: uuidv4 } = require('uuid');
const path = require('path');
const Book = require('../models/book');
const Category = require('../models/category'); // Import the Category model
const sharp = require('sharp');

exports.addBook = async (req, res) => {
    try {
        // Generate a unique book_id
        const bookId = uuidv4();
        
        const uploadPath = '/uploads/';
        let image1 = '';
        let image2 = '';
        let image3 = '';

        // Allowed image types
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif'];

        if (req.files) {
            const image1File = req.files.image1;
            const image2File = req.files.image2;
            const image3File = req.files.image3;

            // Function to process and save image
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

            // Process each image
            if (image1File) {
                image1 = await processImage(image1File);
            }
            if (image2File) {
                image2 = await processImage(image2File);
            }
            if (image3File) {
                image3 = await processImage(image3File);
            }
        }

        const selectedCategories = req.body['category[]'] || []; // Get selected category names
        const selectedRelatedProducts = req.body['related_products[]'] || []; // Get selected related products

        const newBook = new Book({
            book_id: bookId,
            name: req.body.name,
            author: req.body.author,
            chapters: req.body.chapters,
            synopsis: req.body.synopsis,
            regular_price: req.body.regular_price,
            sale_price: req.body.sale_price,
            image1,
            image2,
            image3,
            discountPercentage: req.body.discountPercentage,
            catdiscountPercentage: req.body.catdiscountPercentage,
            stock: req.body.stock,
            highlights: req.body.highlights ? req.body.highlights.split(',') : [],
            category: selectedCategories, // Store selected category names
            related_products: selectedRelatedProducts // Store selected related products
        });

        await newBook.save();

        // Update categories collection
        await Category.updateMany(
            { name: { $in: selectedCategories } },
            { $addToSet: { books: newBook._id } } // Add the new book ID to the books array in each selected category
        );

        res.redirect('/admin/bookManagement');
    } catch (err) {
        console.error(err);
        // Fetch categories and books again to pass to the view
        const categories = await Category.find();
        const books = await Book.find();
        // Render the add book form with the error message
        res.render('addBook', { categories, books, errorMessage: err.message });
    }
};