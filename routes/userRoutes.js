const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

//  voting dispaly page
router.get('/votingdisplay', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'views', 'votingdisplay.html');
        return res.sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

// Route to serve the signup form
router.get('/signupform', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'views', 'signup.html');
        return res.sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        console.log("Received data: ", data); // Log the received data
        
        // Check if admin user already exists if the new user is an admin
        const adminUser = await User.findOne({ role: "admin" });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ err: "Admin user already exists" });
        }

        // Check if CNIC number or email is already registered
        const existingUser = await User.findOne({ cnicNumber: data.cnicNumber });
        if (existingUser) {
            return res.status(400).json({ err: "CNIC number already registered" });
        }
        const existingEmail = await User.findOne({ email: data.email });
        if (existingEmail) {
            return res.status(400).json({ err: "Email already registered" });
        }

        // Create and save the new user
        const newUser = new User(data);
        const response = await newUser.save();
        console.log("Data saved");

        // Generate token
        const payload = { id: response.id };
        const token = generateToken(payload);

        // Set the token and user data in cookies
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
        });

        // Optionally store user data in a separate cookie (be cautious with sensitive data)
        res.cookie('userData', JSON.stringify({
            id: response.id,
            name: response.name,
            email: response.email,
            role: response.role
        }), {
            httpOnly: false, // You may want this to be accessible from JavaScript if needed
            secure: process.env.NODE_ENV === 'production',
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
        });

        // Redirect to the test page
        res.redirect('/user/test');
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ err: messages.join(', ') });
        }
        res.status(500).json({ err: "Internal Server Error" });
    }
});


// Route to serve the test.html file
router.get('/test', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'views', 'votingdisplay.html');
        return res.sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

// login route
router.post('/login', async (req, res) => {
    try {
        const { cnicNumber, password } = req.body;
        if (!cnicNumber || !password) {
            return res.status(404).json({ err: "send cnic Number and password" });
        }
        const user = await User.findOne({ cnicNumber: cnicNumber });

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid CNIC Number or Password' });
        }
        console.log("data saved");
        const payload = {
            id: user.id
        };
        //    console.log(JSON.stringify(payload)); // Corrected line
        const token = generateToken(payload);
        // Set the token in a cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year leatr the cookies expair
        });
        
        // Redirect to the test page
        res.redirect('/user/test');
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

//  profile
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const user = await User.findById(userData.id).exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.render('profile', {
            user: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// go to change password form
router.get('/changePasswordform', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'views', 'changePasswordForm.html');
        return res.sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

//  user change password
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userid = req.user.id;
        const { currentpassword, newpassword } = req.body;

        if (!currentpassword || !newpassword) {
            return res.status(400).json({ error: "Set new password" });
        }

        const user = await User.findById(userid);
        if (!user || !(await user.comparePassword(currentpassword))) {
            return res.status(404).json({ error: 'Current password is invalid' });
        }

        user.password = newpassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Logout route
router.get('/logout', (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie('authToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Optionally clear other cookies if needed
        res.clearCookie('otherCookieName', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Redirect to the homepage or a logout confirmation page
        const filePath = path.join(__dirname, '..', 'views', 'index.html');
        return res.sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//  voting dispaly page
router.get('/votingdisplay', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'views', 'votingdisplay.html');
        return res.sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

module.exports = router;

