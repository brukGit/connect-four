import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import { validateUsername, validatePassword } from './CredentialValidation';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';


function LoginForm() {
  const { setUsername, setSubmitted } = useContext(UserContext);
  const [username, setUsernameLocal] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsernameLocal(newUsername);
    setUsername(newUsername);
  };

  const resetLoginData = () => {
    setUsernameLocal('');
    setPassword('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (username) {
      try {
        await axios.post(`${apiUrl}/login`, { username, password });
        console.log('User logged in successfully!');
        setLoginError('');
        setSubmitted(true);
        navigate('/game');
      } catch (error) {
        if (error.response) {
          const errorMessage = error.response.data.message;
          if (errorMessage === 'User not found') {
            setLoginError('Username does not exist. Please try again.');
            resetLoginData();
          } else if (errorMessage === 'Invalid password') {
            setLoginError('Incorrect password. Please try again.');
            setPassword('');
          } else {
            console.error('Error logging in:', errorMessage);
            setLoginError('An error occurred while logging in');
          }
        } else {
          console.error('Error logging in:', error);
          setLoginError('An error occurred while logging in');
        }
      }
    } else {
      setLoginError('Please insert a valid username and password.');
    }
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  return (
    <UserContext.Consumer>
      {(context) => {
        const { setUsername, setSubmitted } = context;

        return (
          <form onSubmit={handleLogin} className='login-form'>
            <label>
              Username:
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
              />
            </label>
            <br />
            <label>
              Password:
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <br />
            <button type="submit">Log In</button>
            <button type="button" onClick={handleSignUp}>
              Sign Up
            </button>
            {loginError && <p>{loginError}</p>}
          </form>
        );
      }}
    </UserContext.Consumer>
  );
}

export default LoginForm;
