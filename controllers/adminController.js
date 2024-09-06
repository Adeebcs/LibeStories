const User = require('../models/user');

// Function  fetch and render users list
exports.showUsersList = async (req, res) => {
    try {
        const users = await User.find({});
        res.render('userslist', { users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Server Error');
    }
};

// Function show the edit user page
exports.showEditUserPage = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('edituser', { user });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send('Server Error');
    }
};

// Function editing a user
exports.updateUser = async (req, res) => {
    try {
        const { username, email, phone, address } = req.body;
        await User.findByIdAndUpdate(req.params.id, {
            username,
            email,
            phone,
            address,
            updated_at: new Date()
        });
        res.redirect('/admin/userslist');
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).send('Server Error');
    }
};

exports.blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.blocked = !user.blocked; // Toggle blocked status
        await user.save();
        res.redirect('/admin/userslist');
    } catch (err) {
        console.error('Error blocking/unblocking user:', err);
        res.status(500).send('Server Error');
    }
};


