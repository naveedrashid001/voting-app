const express = require('express');
const router = express.Router();
const User = require('./../models/user'); // Make sure this path is correct
const Candidate = require('../models/candidate');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

const path = require('path');

// home page
router.get('/home', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'views', 'index.html');
        return res.sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});
// about Me
router.get('/aboutme', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'views', 'aboutme.html');
        return res.sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

// Candidate list route
router.get('/candaidatelist', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'views', 'Condaidate.html');
        return res.sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});  

// 

// go to show login form
router.get('/loginform', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'views', 'login.html');
        return res.sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

// go to select condaide form
router.get('/condaideform', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'views', 'selectCandaidate.html');
        return res.sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

// cheek admain validation
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        if (user && user.role === 'admin') {
            return true;
        }
        return false;
    } catch (err) {
        console.error(err);
        return false;
    }
}

// create candaidate 
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            console.log(req.user.id);
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        res.status(200).json({ response: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

// update candaidate data
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }
        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,
            runValidators: true,
        })
        if (!response) {
            return res.status(403).json({ message: 'candaidate id incorrect' });
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

// delete candaidate data
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }
        const candidateID = req.params.candidateID;

        const response = await Candidate.findByIdAndDelete(candidateID, {
            new: true,
            runValidators: true,
        })
        if (!response) {
            return res.status(403).json({ message: 'candaidate id incorrect' });
        }

        res.status(200).json({ message: 'candidate data deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});


router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate ID incorrect' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User ID incorrect' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin cannot vote' });
        }
        if (user.isVoted) {
            return res.status(403).json({ message: 'You cannot vote again' });
        }

        // Update candidate document
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // Update user document
        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: 'You voted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

// show vote count page 
router.get('/votecount', async (req, res) => {
    try {
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            };
        });

        // Render the count.ejs template and pass the voteRecord data
        res.render('count', { title: 'count', voteRecord: voteRecord });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});


 // vote count
//  router.get('/vote/count', async (req, res) => {
//     try {
//         // Find all candidates and sort them by voteCount in descending order
//         const candidate = await Candidate.find().sort({ voteCount: 'desc' });

//         // Map the candidates to only return their name and voteCount
//         const voteRecord = candidate.map((data) => {
//             return {
//                 party: data.party,
//                 count: data.voteCount
//             };
//         });

        
//         return res.redirect('/candidate/user/votecount');
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });


// find all candaidate
router.get('/', async (req, res) => {
    
    try {
        const candidate = await Candidate.find({}, '_id name party')
        if (!candidate) {
            return res.status(404).json({ message: 'ther is no candaidate in database' });
        }
         return res.status(200).json(candidate);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

module.exports = router;
