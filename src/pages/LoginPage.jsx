import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const LoginPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <>
      {showLogin ? (
        <Login onToggle={toggleForm} />
      ) : (
        <Register onToggle={toggleForm} />
      )}
    </>
  );
};

export default LoginPage;
