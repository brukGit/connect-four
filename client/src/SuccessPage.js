import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
   
  const isEmailVerified = searchParams.get('isEmailVerified') === 'true';
  const verificationToken = searchParams.get('token');
  console.log('lelele', verificationToken);

  useEffect(() => {
    if (!isEmailVerified) {
      console.log('isEmailVerified:', isEmailVerified);

      // Perform any additional actions when email is not verified
      // For example, you can show a message or restrict access to certain features
    }
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    navigate('/game');
  };

  return (
    <div className="success-page">
      {isEmailVerified ? (
        <>
          <h1>Email Verification Successful</h1>
          <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
          <p>Your email has been successfully verified. You can now enjoy playing the game!</p>
          <button onClick={handleClick}>Continue to Game.</button>
        </>
      ) : (
        <>
          <h1>Email Verification Required</h1>
          <p>Please verify your email before accessing the game.</p>
        </>
      )}
    </div>
  );
};

export default SuccessPage;
