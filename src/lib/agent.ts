import { getOAuthClient } from './oauthClient';
import { AtpAgent } from '@atproto/api';

/**
 * Resolve the PDS URL for a given DID
 */
async function resolvePdsUrl(did: string): Promise<string> {
  // Fetch the DID document from PLC directory
  const response = await fetch(`https://plc.directory/${did}`);
  
  if (!response.ok) {
    throw new Error(`Failed to resolve DID: ${did}`);
  }
  
  const didDoc = await response.json();
  
  // Find the PDS service endpoint
  const pdsService = didDoc.service?.find((s: any) => 
    s.type === 'AtprotoPersonalDataServer'
  );
  
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
  
  // Try to restore the session - pass the sub (DID) from storage
  const storedUser = sessionStorage.getItem('user');
  if (!storedUser) {
    throw new Error('No user in session');
  }
  
  const user = JSON.parse(storedUser);
  const session = await client.restore(user.did);
  
  if (!session) {
    throw new Error('Could not restore session');
  }
  
  // Resolve the user's actual PDS URL from their DID
  const pdsUrl = await resolvePdsUrl(user.did);
  console.log('Using PDS:', pdsUrl, 'for DID:', user.did);
  
  // Create an agent with the user's PDS
  const agent = new AtpAgent({
    service: pdsUrl,
  });
  
  // The session object should provide credentials
  // @ts-ignore - accessing internal session properties
  if (session.accessToken) {
    // @ts-ignore
    agent.session = {
      // @ts-ignore
      did: session.did,
      // @ts-ignore
      handle: session.handle || user.handle,
      // @ts-ignore
      accessJwt: session.accessToken,
      // @ts-ignore
      refreshJwt: session.refreshToken,
    };
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
  
  // Validate DID format
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
