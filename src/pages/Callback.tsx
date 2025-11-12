import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getOAuthClient } from '../lib/oauthClient';

export default function Callback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React strict mode
    if (hasProcessed.current) {
      return;
    }
    hasProcessed.current = true;

    const handleCallback = async () => {
      try {
        const client = await getOAuthClient();
        
        // Complete the OAuth callback with URLSearchParams
        // Check both hash fragment and query string
        const hashParams = window.location.hash ? window.location.hash.substring(1) : '';
        const queryParams = window.location.search ? window.location.search.substring(1) : '';
        const paramString = hashParams || queryParams;
        const params = new URLSearchParams(paramString);
        
        const result = await client.callback(params);
        
        if (!result) {
          throw new Error('No session returned from callback');
        }

        // Get session info
        const session = result.session;
        const did = session.did;
        
        // Try to get profile info
        let handle = did;
        let displayName = 'User';
        
        try {
          // The session object contains the DID, we can extract handle from it if available
          handle = did.replace('did:plc:', '').substring(0, 10) + '...';
          displayName = handle;
        } catch (e) {
          console.log('Could not fetch profile');
        }
        
        // Store user info and redirect to home
        login({
          did: did,
          handle: handle,
          displayName: displayName
        });

        navigate('/home');
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [navigate, login]);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <h1>Authentication Error</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#0085ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh'
    }}>
      <h2>Authenticating...</h2>
    </div>
  );
}
