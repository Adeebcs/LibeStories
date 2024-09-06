const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const isAuthenticated = require('../middleware/auth');
const passport = require('passport');

// Define the preventLoggedInAccess middleware
const preventLoggedInAccess = (req, res, next) => {
    console.log(req.session);  // Check if session is being set correctly
    if (req.session.userId) {
        return res.redirect('/home');
    }
    next();
};
// Route to show login page
router.get('/', preventLoggedInAccess, authController.showLoginPage);

// Route to show signup page
router.get('/signup', preventLoggedInAccess, authController.showSignupPage);

// Route to handle registration
router.post('/register', authController.registerUser);

// Route to verify OTP
router.post('/verifyOtp', authController.verifyOtp);

// Route to resend OTP
router.post('/resendOtp', authController.resendOtp);



// Route to handle user login
router.post('/verify', authController.verifyUser);

// Route to show home page
router.get('/home', isAuthenticated, (req, res) => {
     // Log user ID from session
    res.render('home', { message: 'Hello, World!' }); // Render home page
});

// Route to handle logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.negotiate(err);
        }
        res.clearCookie('connect.sid', { path: '/' });
        res.redirect('/');
    });
});

// Route for Google authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    // Successful authentication
    console.log('User authenticated:', req.user); // Log the authenticated user
    req.session.user = req.user; // Set user in session
    req.session.userId = req.user._id; // Store user ID in session
    res.redirect('/home'); // Redirect to home page
});

module.exports = router;
