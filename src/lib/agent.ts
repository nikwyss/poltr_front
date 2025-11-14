import { getOAuthClient } from './oauthClient';
import { AtpAgent } from '@atproto/api';

/**
 * Resolve the PDS URL for a given DID
 */
async function resolvePdsUrl(did: string): Promise<string> {
  const response = await fetch(`https://plc.directory/${did}`);
  if (!response.ok) {
    throw new Error(`Failed to resolve DID: ${did}`);
  }
  const didDoc = await response.json();
  const pdsService = didDoc.service?.find((s: any) => s.type === 'AtprotoPersonalDataServer');
  if (!pdsService?.serviceEndpoint) {
    throw new Error(`No PDS service found for DID: ${did}`);
  }
  return pdsService.serviceEndpoint;
}

/**
 * Get an authenticated AT Protocol agent
 */
export async function getAuthenticatedAgent(): Promise<AtpAgent> {
  const client = await getOAuthClient();

  // Read the lightweight user snapshot set by AuthContext (non-sensitive)
  const stored = localStorage.getItem('poltr_user');
  let did: string | undefined;
  let handle: string | undefined;

  if (stored) {
    try {
      const u = JSON.parse(stored);
      did = u.did;
      handle = u.handle;
    } catch {
      // ignore parse errors; we’ll fall back to restore()
    }
  }

  // Restore the OAuth session from IndexedDB.
  // Prefer restoring with known DID; fall back to the latest session.
  let session: any = null;
  try {
    session = await client.restore(did);
  } catch {
    // If restore(did) rejects (e.g., bad DID), try generic restore
    session = await client.restore().catch(() => null);
  }

  if (!session) {
    throw new Error('No authenticated session found. Please login.');
  }

  // Derive DID/handle from session if not present in local snapshot
  did = session.did || did;
  handle = session.handle || handle;

  if (!did) {
    throw new Error('No DID available in session');
  }

  // Resolve the user’s actual PDS from DID (works for plc/web)
  const pdsUrl = await resolvePdsUrl(did);
  console.log('Using PDS:', pdsUrl, 'for DID:', did);

  const agent = new AtpAgent({ service: pdsUrl });

  // Attach session tokens if the library exposes them (shape is internal)
  if (session.accessToken) {
    agent.session = {
      did,
      handle,
      accessJwt: session.accessToken,
      refreshJwt: session.refreshToken,
    } as any;
  }

  return agent;
}

/**
 * List records of a specific collection type
 */
export async function listRecords(
  repo: string,
  collection: string,
  limit: number = 100
): Promise<any> {
  console.log('Listing records for repo:', repo, 'collection:', collection);

  if (!repo.startsWith('did:plc:') && !repo.startsWith('did:web:')) {
    throw new Error(`Invalid DID format: ${repo}. Must start with 'did:plc:' or 'did:web:'`);
  }

  const agent = await getAuthenticatedAgent();

  const response = await agent.com.atproto.repo.listRecords({
    repo,
    collection,
    limit,
  });

  return response.data;
}