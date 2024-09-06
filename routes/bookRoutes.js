const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const fileUpload = require('express-fileupload');
const isAdminAuthenticated = require('../middleware/adminAuth');
const addController = require('../controllers/addController');
const categoryController = require('../controllers/categoryController');
// Middleware for handling file uploads
router.use(fileUpload());

// Route for displaying the book management page
router.get('/bookManagement',isAdminAuthenticated, bookController.bookManage);

// Route for adding a new book (GET request to display the form)
router.get('/bookManagement/add',  bookController.getAddBookForm);

// Route for handling the addition of a new book (POST request)
router.post('/bookManagement/add',  addController.addBook);

// Route for editing an existing book (GET request to display the form)
router.get('/bookManagement/edit/:id',isAdminAuthenticated, bookController.getEditBookForm);

// Route for handling the update of an existing book (POST request)
router.post('/bookManagement/edit/:id', isAdminAuthenticated, bookController.editBook);

// Route for soft-deleting a book (POST request)
router.post('/bookManagement/delete/:id',isAdminAuthenticated, bookController.deleteBook);
router.post('/bookManagement/restore/:id', isAdminAuthenticated, bookController.restoreBook);

// Route to render the addCategory form
router.get('/addCategory',isAdminAuthenticated, bookController.getAddCategory);

// Route to handle form submission and add the category to the database
router.post('/addCategory', isAdminAuthenticated, bookController.postAddCategory);

// List categories and manage them
router.get('/manageCategories', categoryController.manageCategories);

// Add a new category
router.post('/manageCategories/add', categoryController.addCategory);

// Add a book to a category
router.post('/manageCategories/addBook', categoryController.addBookToCategory);

router.post('/editCategory', categoryController.editCategory);

// Route to delete a book from a category
router.post('/manageCategories/deleteBook', categoryController.deleteBookFromCategory);

router.post('/deleteCategory', categoryController.deleteCategory);
router.post('/restoreCategory', categoryController.restoreCategory);

module.exports = router;
