import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import GamePage from './GamePage';
import SuccessPage from './SuccessPage';
import { UserContext } from './UserContext';
import logo from './assets/images/company_logo.png';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleUsernameChange = (newUsername) => {
    setUsername(newUsername);
    console.log(newUsername);
  };

  const handleSubmission = (submissionStatus) => {
    setSubmitted(submissionStatus);
  };

  return (
    <UserContext.Provider value={{ username, setSubmitted: handleSubmission, setUsername: handleUsernameChange }}>
      <Router>
        <div>
          <div className='header'>
            <img src={logo} alt="logo" />
             <h1 className='title'>Connect Four</h1>
          </div>
         
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
