const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next(); // User is authenticated, proceed to the next middleware
    }
    res.redirect('/'); // User is not authenticated, redirect to login
};

module.exports = isAuthenticated;

