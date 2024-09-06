const express = require('express');
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('./config/passport');
// Import routes
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const productRoute = require('./routes/product');
const bookRoutes = require('./routes/bookRoutes'); // Import book routes

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,  // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000  // Optional: Set a max age for the session cookie (e.g., 1 day)
    }
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('Failed to connect to MongoDB', err);
});

// Prevent caching
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use('/', userRoute);
app.use('/admin', adminRoute);
app.use('/', productRoute);
app.use('/admin', bookRoutes); // Use book routes for admin

const port = 3003;
app.listen(port, () => console.log(`Server running on port ${port}`));
