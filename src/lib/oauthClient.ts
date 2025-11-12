import { BrowserOAuthClient } from '@atproto/oauth-client-browser';

let oauthClient: BrowserOAuthClient | null = null;

export async function getOAuthClient(): Promise<BrowserOAuthClient> {
  if (oauthClient) {
    return oauthClient;
  }

  // For loopback clients, embed redirect_uri and scope in client_id
  const redirectUri = 'http://127.0.0.1:5173/callback';
  const scope = 'atproto transition:generic';
  const clientId = `http://localhost?redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  oauthClient = await BrowserOAuthClient.load({
    clientId: clientId,
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
