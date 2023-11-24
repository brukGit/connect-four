// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://Bruk:1234567890@clusterconnectfour.r1csi5g.mongodb.net/?retryWrites=true&w=majority';
// generate a unique random token. You can use libraries like crypto or uuid for this purpose. 
const { v4: uuidv4 } = require('uuid');

function generateVerificationToken() {
  return uuidv4();
}
const nodemailer = require('nodemailer');

async function sendVerificationEmail(email, name, verificationToken, userID) {
  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "6c392985953443",
    pass: "2375c98f1aca59"
  }
});
  //<a href="http://localhost:3001/verify?token=${verificationToken}">Verify Email</a>`,
  // Compose the email
  const mailOptions = {
    from: 'abrahabiruke@gmail.com',
    to: email,
    subject: 'Email Verification for ConnectFour Game!',
    html: `<p>Hi ${name}. Please click the following link to verify your email:</p>
    <a href="http://localhost:3000/verify/${userID}/${verificationToken}">Verify Email</a>`,
           
  };

  // Send the email
  await transporter.sendMail(mailOptions);
  //
  console.log('Email sent.')
}
async function connectToMongoDB() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, socketTimeoutMS: 30000 });
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
        
        console.log('User registered.')
        console.log('verification token: ', verificationToken)
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
        res.redirect(`http://localhost:3001/success?isEmailVerified=true&token=${verificationToken}`);
      } catch (error) {
        console.log('NOT verifying.')
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'An error occurred while verifying email' });
      }
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
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
    

  } catch (error) {
    console.error('Error starting the server:', error);
  }
}

startServer();

app.get('/', (req, res) => {
  res.send('Welcome to the game app!');
});
