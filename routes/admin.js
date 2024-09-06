const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const adminController = require('../controllers/adminController');
const isAdminAuthenticated = require('../middleware/adminAuth');

// Route to show admin login page
router.get('/', adminAuthController.showAdminLoginPage);

// Route to handle admin login
router.post('/login', adminAuthController.verifyAdminLogin);

// Route to show admin dashboard
router.get('/dashboard', isAdminAuthenticated, adminAuthController.showAdminDashboard);

// Route to handle admin logout
router.get('/logout', isAdminAuthenticated, adminAuthController.adminLogout);

// Route to show users list
router.get('/userslist', isAdminAuthenticated, adminController.showUsersList);

// Route to show the edit user page
router.get('/edit/:id', isAdminAuthenticated, adminController.showEditUserPage);

// Route to handle the form submission for editing a user
router.post('/edit/:id', isAdminAuthenticated, adminController.updateUser);

// Route to block a user
router.get('/block/:id', isAdminAuthenticated, adminController.blockUser);



module.exports = router;
