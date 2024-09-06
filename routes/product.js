const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const isAuthenticated = require('../middleware/auth');

// Route to list all products
router.get('/products', isAuthenticated, productController.listProducts);

// Route to search products
router.get('/search', isAuthenticated, productController.searchProducts);

// Route to show details of a specific product
router.get('/product/:id', isAuthenticated, productController.bookDetails);
router.get('/book/:id', isAuthenticated, productController.bookDetails);

// Route to add a comment to a book
router.post('/books/:id/comment', isAuthenticated, productController.addComment);
router.get('/books/:id', isAuthenticated, productController.bookDetails);
// Route to handle comment submission



module.exports = router;
