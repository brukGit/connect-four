// Welcome.js

import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
function WelcomePage({ username, setSubmitted}) {
    const navigate = useNavigate ()
    const handleGoBack = () => {
        setSubmitted(false);
        navigate('/')
    }
    
    return (
      <div>
        <h1>Welcome to the game, {username}!</h1>
        <Link to="/" onClick={handleGoBack}>Go back</Link>
      </div>
      
    );
  }

export default WelcomePage;