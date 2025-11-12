import { BrowserOAuthClient } from '@atproto/oauth-client-browser';

let oauthClient: BrowserOAuthClient | null = null;

export async function getOAuthClient(): Promise<BrowserOAuthClient> {
  if (oauthClient) {
    return oauthClient;
  }

  // Get OAuth configuration from environment variables
  const redirectUri = import.meta.env.VITE_REDIRECT_URI || 'http://127.0.0.1:5173/callback';
  const clientIdBase = import.meta.env.VITE_CLIENT_ID_BASE || 'http://localhost';
  const scope = 'atproto transition:generic';
  
  // For loopback/public clients, embed redirect_uri and scope in client_id
  const clientId = `${clientIdBase}?redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  oauthClient = await BrowserOAuthClient.load({
    clientId: clientId,
    // Use bsky.social as the handle resolver
    // This resolves handles to DIDs and works with the entire ATProto federation
    handleResolver: 'https://bsky.social',
  });

  return oauthClient;
}

export async function initOAuthSession() {
  const client = await getOAuthClient();
  
  // Try to restore existing session
  try {
    const session = await client.restore(window.location.origin);
    if (session) {
      return session;
    }
  } catch (err) {
    console.log('No existing session');
  }
  
  return null;
}
