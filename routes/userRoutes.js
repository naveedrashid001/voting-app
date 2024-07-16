const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');
const { findOne } = require('../models/candidate');
const { compare } = require('bcrypt');

// signup route
router.post('/signup', async (req, res) => {
   try {
       const data = req.body;
       const adminUser = await User.findOne({ role: "admin" });
       if (data.role === 'admin' && adminUser) {
           return res.status(404).json({ err: "admin user already exists" });
       }
       if (!data.cnicNumber.length === 13) {
           return res.status(404).json({ err: "cnicNumber must be 13 digits" });
       }
       const newUser = new User(data);
       const response = await newUser.save();
       console.log("data saved");
       const payload = {
           id: response.id
       };
    //    console.log(JSON.stringify(payload)); // Corrected line
       const token = generateToken(payload);
       console.log(token);
       res.status(200).json({ response: response, token: token });
   } catch (err) {
       console.log(err);
       res.status(500).json({ err: "Internal Server Error" });
   }
});

// login route
router.post('/login', async (req, res) => {
    try {
        const {cnicNumber, password} = req.body;
        if (!cnicNumber || !password) {
            return res.status(404).json({ err: "send cnic Number and password" });
        }
        const user = await User.findOne({cnicNumber: cnicNumber});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid CNIC Number or Password'});
        }
        console.log("data saved");
        const payload = {
            id: user.id
        };
     //    console.log(JSON.stringify(payload)); // Corrected line
        const token = generateToken(payload);
        console.log(token);
        res.status(200).json({token: token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
 });

//  profile
 router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//  user change password
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try{
        const userid = req.user.id;
        const {currentpassword, newpassword}= req.body
       
        if(!currentpassword || !newpassword){
            res.status(404).json({error: "set new password"});
        }
        const user = await  User.findById(userid)
        if(!user || !(await user.comparePassword(currentpassword)))
        {
            return  res.status(500).json({ error: 'current password are invalid' });
        }
        user.password= newpassword;
        await user.save(); 
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})
 

module.exports = router;
