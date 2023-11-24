import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import { validateUsername, validatePassword, validatePhoneNumber, validateEmail } from './CredentialValidation';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
function RegisterForm() {
  const { setUsername, setSubmitted } = useContext(UserContext);
  const [username, setUsernameLocal] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [userNameTaken, setUserNameTaken] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const resetRegistrationData = () => {
    setPassword('');
    setEmail('');
    setPhoneNumber('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username && password && email) {
      const isUsernameValid = validateUsername(username);
      const isPasswordValid = validatePassword(password);
      const isEmailValid = validateEmail(email);

      if (!isUsernameValid) {
        setRegistrationError('Invalid username.\nPlease enter a username with at least 6 characters, containing only letters and numbers.');
        resetRegistrationData();
        return;
      }
      if (!isPasswordValid) {
        setRegistrationError('Invalid password. \nPassword must be at least 8 characters long and must include one uppercase letter, one lowercase letter, one digit, and one special character.');
        resetRegistrationData();
        return;
      }
      if (!isEmailValid) {
        setRegistrationError('Invalid Email. Please enter a valid email account.');
        resetRegistrationData();
        return;
      }

      navigate('/register');

      try {
        await axios.post(`${apiUrl}/register`, {
          username,
          password,
          phoneNumber,
          email,
        });
        console.log('User registered successfully!');
        setSubmitted(true);
        setUsernameLocal(username);
        setUsername(username);
        setIsEmailVerified(false);
        console.log(isEmailVerified);
        navigate('/success', { state: { isEmailVerified } });
      } catch (error) {
        if (error.response) {
          const errorMessage = error.response.data.message;
          if (errorMessage === 'Username already taken') {
            setUserNameTaken('Username already taken. Please use another one.');
            resetRegistrationData();
          }
        }
      }
    } else {
      setRegistrationError('Please insert valid credentials in all mandatory fields.');
    }
  };

  return (
    <UserContext.Consumer>
      {(context) => {
        const { setUsername, setSubmitted } = context;

        return (
          <form onSubmit={handleSubmit}>
            <label>
              Username:
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsernameLocal(e.target.value)}
              />
            </label>
            <br />
            <label>
              Password:
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setPasswordVisible(!passwordVisible)}>
                {passwordVisible ? 'Hide' : 'Show'}
              </button>
            </label>
            <br />
            <label>
              Phone Number<i>(optional)</i>:
              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </label>
            <br />
            <label>
              Email:
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <br />
            <button type="submit">Register</button>
            {userNameTaken && <p>{userNameTaken}</p>}
            {registrationError && (
              <div>
                {registrationError.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            )}
          </form>
        );
      }}
    </UserContext.Consumer>
  );
}

export default RegisterForm;
