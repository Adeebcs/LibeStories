const isAdminAuthenticated = (req, res, next) => {
    if (req.session.admin) {
        return next(); // Admin is authenticated, proceed to the next middleware or route handler
    }
    // Admin is not authenticated, redirect to admin login page
    res.redirect('/admin');
};

module.exports = isAdminAuthenticated;