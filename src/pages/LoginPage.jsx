import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import Galaxy from '../components/Galaxy';

const LoginPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <>
      {/* Container cho Galaxy làm hình nền */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100vh', 
        zIndex: 0,
        background: '#000' // Nền đen để các ngôi sao nổi bật
      }}>
        <Galaxy 
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1}
          glowIntensity={0.5}
          speed={0.5} // Chỉnh tốc độ quay chậm lại cho sang
          transparent={true}
        />
      </div>
      {showLogin ? (
        <Login onToggle={toggleForm} />
      ) : (
        <Register onToggle={toggleForm} />
      )}
    </>
  );
};

export default LoginPage;
