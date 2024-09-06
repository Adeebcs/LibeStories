const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Otp = require('../models/otp');
const nodemailer = require('nodemailer');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'figmaacc50@gmail.com',
        pass: 'mthq poob hxtc ujdd',
    },
});

// Function to generate a random 6-digit OTP
function generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Show signup page
exports.showSignupPage = (req, res) => {
    res.render('signup', { message: "" });
};

// Register user and send OTP
exports.registerUser = async (req, res) => {
    const { first_name, last_name, username, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.render('signup', { message: "Passwords do not match" });
    }

    // Check if email or username is already registered
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.render('signup', { message: "Email or Username is already registered" });
    }

    // Generate OTP
    const otpCode = generateOtpCode();
    try {
        // Save the OTP to the database
        await Otp.create({ email, otp: otpCode });

        // Set up email options
        const mailOptions = {
            from: 'figmaacc50@gmail.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otpCode}. It is valid for 1 minute.`,
        };

        // Send the OTP via email
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to send OTP' });
            } else {
                // Store user data temporarily until OTP verification
                req.session.userData = {
                    firstName: first_name,
                    lastName: last_name,
                    username: username,
                    email: email,
                    password: password, // Store plain password temporarily
                };
                return res.status(200).render('otpVerification', { message: '' });
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error sending OTP' });
    }
};

// Verify OTP entered by the user
exports.verifyOtp = async (req, res) => {
    const { email } = req.session.userData; // Get email from session
    const otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5 + req.body.otp6; // Concatenate OTP fields

    try {
        const validOtp = await Otp.findOne({ email, otp: otp.toString() });

        if (validOtp) {
            // OTP is valid, delete the OTP now
            await Otp.deleteOne({ email, otp });

            // Create new user with stored data
            const hashedPassword = await bcrypt.hash(req.session.userData.password, 12);
            const newUser = new User({
                firstName: req.session.userData.firstName,
                lastName: req.session.userData.lastName,
                username: req.session.userData.username,
                email: req.session.userData.email,
                password: hashedPassword
            });

            await newUser.save();

            // Store user ID in session and session ID in user document
            req.session.userId = newUser._id; // Store user ID in session
            newUser.sessionId = req.sessionID; // Store session ID in user document
            await newUser.save(); // Save the updated user document

            delete req.session.userData; // Clear session data

            return res.status(200).redirect('/home'); // Redirect to success page or dashboard
        } else {
            return res.status(400).render('otpVerification', { message: 'Invalid OTP. Please try again.' });
        }
    } catch (err) {
        console.error('Error verifying OTP:', err); // Log the error
        res.status(500).json({ message: 'Error verifying OTP' });
    }
};

// Resend OTP if requested
exports.resendOtp = async (req, res) => {
    const { email } = req.session.userData; // Get the email from session
    const otpCode = generateOtpCode(); // Generate a new OTP

    try {
        // Remove any existing OTP for this email
        await Otp.deleteMany({ email });

        // Save new OTP to the database
        await Otp.create({ email, otp: otpCode });

        // Set up email options
        const mailOptions = {
            from: 'figmaacc50@gmail.com',
            to: email,
            subject: 'Your New OTP Code',
            text: `Your new OTP code is ${otpCode}. It is valid for 1 minute.`,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to resend OTP' });
            } else {
                // Reload the OTP verification page with a success message
                return res.render('otpVerification', { message: 'New OTP sent. Please check your email.' });
            }
        });
    } catch (err) {
        console.error('Error resending OTP:', err);
        res.status(500).json({ message: 'Error resending OTP' });
    }
};

// Show login page
exports.showLoginPage = (req, res) => {
    const { accountCreated } = req.query;
    let msg = "";

    if (req.session.passwordwrong) {
        msg = "Incorrect username or password";
        req.session.passwordwrong = false;
    } else if (accountCreated) {
        msg = "Account created successfully. Please login.";
    }

    res.render('login', { msg: msg });
};

// Verify user login
exports.verifyUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username or email
        const foundUser = await User.findOne({
            $or: [{ email: username }, { username: username }]
        });

        // Log the found user for debugging
        console.log('Found User:', foundUser);

        if (foundUser) {
            // Check if the user is blocked or deleted
            if (foundUser.blocked) {
                return res.render('login', { msg: "Your account is blocked. Please contact support." });
            }
            if (foundUser.deleted) {
                return res.render('login', { msg: "Your account is no longer active." });
            }

            // Compare the entered password with the hashed password
            const isMatch = await bcrypt.compare(password, foundUser.password);
            console.log('Password Match:', isMatch);

            if (isMatch) {
                // Store user ID in session and session ID in user document
                req.session.userId = foundUser._id; // Store user ID in session
                foundUser.sessionId = req.sessionID; // Store session ID in user document
                await foundUser.save(); // Save the updated user document

                // Log session data for debugging
                console.log('Session Data:', req.session);

                // Redirect to home page
                return res.redirect('/home');
            }
        }

        // If no user found or password does not match
        req.session.passwordwrong = true;
        res.redirect('/');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }
};


