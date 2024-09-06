const Category = require('../models/category');
const Book = require('../models/book');

exports.editCategory = async (req, res) => {
    try {
        const { categoryId, categoryName } = req.body;

        // Find the category by ID and update its name
        await Category.findByIdAndUpdate(categoryId, { name: categoryName });

        // Redirect back to the manage categories page
        res.redirect('manageCategories');
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).send('Internal Server Error');
    }
};

// Controller to manage categories (display categories in the table)
exports.manageCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.render('manageCategories', { categories });
    } catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).send("Server Error");
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        if (!categoryName) {
            return res.status(400).send('Category name is required');
        }

        const newCategory = new Category({ name: categoryName });
        await newCategory.save();

        res.redirect('/admin/manageCategories');
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).send('Error adding category');
    }
};

exports.addBookToCategory = async (req, res) => {
    try {
        console.log('Form Data:', req.body); 
        
        const { categoryId, bookId } = req.body;
        
        if (!categoryId || !bookId) {
            return res.status(400).send('Category ID and Book ID are required');
        }
        
        // Find the category
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        
        // Find the book
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).send('Book not found');
        }
        
        // Check if the book is already in the category
        if (!category.books.includes(bookId)) {
            // Add the book to the category
            category.books.push(bookId);
            await category.save();
        }
        
        res.redirect('/admin/manageCategories');
    } catch (error) {
        console.error('Error adding book to category:', error);
        res.status(500).send('Error adding book to category');
    }
};
exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;

        // Find the category by ID and update its deleted field to true
        await Category.findByIdAndUpdate(categoryId, { deleted: true });

        // Redirect back to the manage categories page
        res.redirect('/admin/manageCategories'); // Ensure this route is correct
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).send('Internal Server Error');
    }
};

// Controller for restoring a category
exports.restoreCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;

        console.log('Restoring category with ID:', categoryId); // Add this line

        // Find the category by ID and update its deleted field to false
        await Category.findByIdAndUpdate(categoryId, { deleted: false });

        // Redirect back to the manage categories page
        res.redirect('/admin/manageCategories');
    } catch (err) {
        console.error('Error restoring category:', err);
        res.status(500).send('Internal Server Error');
    }
};
exports.deleteBookFromCategory = async (req, res) => {
    try {
        const { categoryId, bookId } = req.body;

        if (!categoryId || !bookId) {
            return res.status(400).send('Category ID and Book ID are required');
        }

        // Find the category
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send('Category not found');
        }

        // Remove the book from the category
        category.books = category.books.filter(b => b.toString() !== bookId.toString());
        await category.save();

        res.redirect('/admin/manageCategories');
    } catch (error) {
        console.error('Error deleting book from category:', error);
        res.status(500).send('Error deleting book from category');
    }
};