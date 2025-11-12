import { useState } from 'react';
import { getOAuthClient } from '../lib/oauthClient';

export default function Login() {
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const client = await getOAuthClient();
      
      // Initiate login - this will redirect to Bluesky
      await client.signIn(handle, {
        signal: new AbortController().signal,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate login');
      setLoading(false);
    }
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
      <h1>Login with Bluesky</h1>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="handle" style={{ display: 'block', marginBottom: '8px' }}>
            Enter your Bluesky handle:
          </label>
          <input
            id="handle"
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="username.bsky.social"
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        {error && (
          <div style={{ 
            color: 'red', 
            marginBottom: '20px', 
            padding: '10px', 
            background: '#ffe6e6',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#0085ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Resolving...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
