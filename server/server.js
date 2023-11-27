
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());

require('dotenv').config();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views')); // Create a 'views' folder and place your EJS files there

const MONGODB_URI = process.env.MONGODB_URI;
const MY_EMAIL = process.env.MY_EMAIL;
const NODEMAILER_USER = process.env.NODEMAILER_USER;
const NODEMAILER_PASSWORD = process.env.NODEMAILER_PASSWORD;
const NODEMAILER_HOST = process.env.NODEMAILER_HOST;
const NODEMAILER_PORT = process.env.NODEMAILER_PORT;
const PORT = process.env.PORT;

const productionUrl = "https://connect-four-pz-designs-backend.onrender.com";

// Determine the base URL based on the environment
const baseUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3001'  // Update with your actual development URL
  : productionUrl;  // Update with your actual production URL


// generate a unique random token. You can use libraries like crypto or uuid for this purpose. 
const { v4: uuidv4 } = require('uuid');

function generateVerificationToken() {
  return uuidv4();
}
const nodemailer = require('nodemailer');

async function sendVerificationEmail(email, name, verificationToken, userID) {
  try {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: NODEMAILER_HOST,
      port: NODEMAILER_PORT,
      auth: {
        user: NODEMAILER_USER,
        pass: NODEMAILER_PASSWORD,
      },
    });

    // Compose the email
    const mailOptions = {
      from: MY_EMAIL,
      to: email,
      subject: 'Email Verification for ConnectFour Game!',
      html: `<p>Hi ${name}. Please click the following link to verify your email:</p>
      <a href="${baseUrl}/verify/${userID}/${verificationToken}">Verify Email</a>`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully.');
  } catch (error) {
    // Handle the error without breaking the server
    console.error('Error sending email:', error.message);
    // You can log the error, send a notification, or take other appropriate actions
  }
}

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, socketTimeoutMS: 30000 });
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function startServer() {
  try {
    await connectToMongoDB();

    // Define the user schema
    const userSchema = new mongoose.Schema({
      username: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      phoneNumber: {
        type: String,
        required: false // Set required to false to make it optional
      },
      email: {
        type: String,
        required: true
      },
      // Email verification boolean
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
      //Add a new field verificationToken to store the generated verification token:
      verificationToken: {
        type: String,
        default: null
      },
    });

    // Create the User model
    const User = mongoose.model('User', userSchema);

    // Handle the POST request to register a new user
    app.post('/register', async (req, res) => {
      try {
        const { username, password, phoneNumber, email } = req.body;

        // Generate a verification token
        const verificationToken = generateVerificationToken();      
        // Create a new user instance
        const newUser = new User({
          username,
          password,
          phoneNumber,
          email,
          verificationToken, // Associate the verification token with the user
        });
               
        // Save the new user to the database
        const savedUser = await newUser.save();
        const userID = savedUser._id; // Assuming you're using MongoDB and the user ID is stored in _id field
        
        // console.log('User registered.')
        // console.log('verification token: ', verificationToken)
        // Send the verification email to the user
        sendVerificationEmail(email, username, verificationToken, userID);
        res.status(200).json({ message: 'User registered successfully! Please check your email to verify your account.' });
      } catch (error) {
        
        // Check if the username already exists in the database
        if(error.code === 11000 && error.keyPattern && error.keyPattern.username){
          res.status(409).json({ message: 'Username already taken' });          
        }        
        else {
          console.error('Error registering user:', error);
          res.status(500).json({ message: 'An error occurred while registering the user.', error: error.message });
        }
      }
    });
    // Handle Email verification
    app.get('/verify/:id/:token', async (req, res) => {
      console.log('Verifying Started.')
      try {
        // const verificationToken = req.query.token;
        const verificationToken = req.params.token;
        const userId = req.params.id;
        console.log('verifying..')
        // Find the user with the verification token
        const user = await User.findOne({ verificationToken });
        console.log("verif. token: ",verificationToken)
        if (!user) {
          // Handle the case where the user is not found
          console.log('token: no user found.')
          return res.status(404).json({ message: 'Invalid verification token' });

        }
    
        // Update the isEmailVerified field or remove the verification token
        user.isEmailVerified = true;
        // user.verificationToken = undefined; // Alternatively, remove the verification token field
    
        await user.save();
    
        // Redirect the user to a success page or display a success message
        // res.redirect('http://localhost:3001/success?isEmailVerified=true');
        // Redirect the user to the success page with the necessary information
        const frontendPort = process.env.NODE_ENV === 'development' ? 3001 : '';

        process.env.NODE_ENV === 'development'
        ? res.redirect(`http://localhost:${frontendPort}/success?isEmailVerified=true&token=${verificationToken}`)
        : res.redirect(`${productionUrl}/success?isEmailVerified=true&token=${verificationToken}`);
       


        
      } catch (error) {
        console.log('NOT verifying.')
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'An error occurred while verifying email' });
      }
    });
    
    //Handle success
    app.get('/success', (req, res) => {
      res.render('success', { title: 'Success', message: 'Email verification successful!' });
    });

    // Handle the POST request for user login
    app.post('/login', async (req, res) => {
      try {
        const { username, password } = req.body;

        // Check if the user exists in the database
        const user = await User.findOne({ username });

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Check if the password matches
        if (user.password !== password) {
          return res.status(401).json({ message: 'Invalid password' });
        }

        // User login successful
        res.status(200).json({ message: 'User logged in successfully!' });
      } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'An error occurred while logging in' });
      }
    });

        // Health check route
    app.get('/health', (req, res) => {
      res.status(200).render('health', { title: 'Health Check' });
    });

    // Handle the GET request for user information
    app.get('/user', async (req, res) => {
      try {
        // Retrieve the token from the request headers
        const token = req.headers.authorization.split(' ')[1];

        // Find the user based on the token
        const user = await User.findOne({ token });

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Return the user information
        res.status(200).json({ username: user.username });
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'An error occurred while fetching user information' });
      }
    });
    // Start the server and listen on the specified port
    const port = PORT || 3000;
    
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
    

  } catch (error) {
    console.error('Error starting the server:', error);
  }
}

startServer();

// Welcome page route
app.get('/', (req, res) => {
  res.render('welcome', { title: 'Welcome' });
});
