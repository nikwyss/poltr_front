import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useEffect } from 'react';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1>Hello {user.displayName}! You did it.</h1>
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        background: '#f5f5f5', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p><strong>DID:</strong> {user.did}</p>
        <p><strong>Handle:</strong> {user.handle}</p>
      </div>
      <button
        onClick={handleLogout}
        style={{
          marginTop: '30px',
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}
