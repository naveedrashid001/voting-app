const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json()); 
app.use(cookieParser());

// Set EJS as the template engine and specify views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the views directory
app.use(express.static(path.join(__dirname, 'views')));

const PORT = process.env.PORT || 3000;

// Import and use routes
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
