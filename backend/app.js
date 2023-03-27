const express = require('express');
const mongoose = require('mongoose');
// const sanitize = require ('express-mongo-sanitize');  // To prevent injection attacks
require('dotenv').config();  // To use environment vars (secures sensible data such as the DB connection string)

const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/user');
const sauceRoutes = require ('./routes/sauces');

const app = express();

// app.use(sanitize());
app.use(express.json());
app.use(cors());

// Declaring static path to images
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Connection to MongoDB Atlas
console.debug(process.env.MONGO_URL);
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);


module.exports = app;