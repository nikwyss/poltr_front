import { Lexicons } from '@atproto/lexicon';

// Import lexicon schemas
import proposalLexicon from '../lexicons/app.ch.poltr.vote.proposal.json';
import embedLexicon from '../lexicons/app.ch.poltr.vote.embed.json';

// Create a Lexicons instance with our custom schemas
export const lexicons = new Lexicons([
  proposalLexicon as any,
  embedLexicon as any,
]);

// TypeScript types for our lexicons
export interface ProposalRecord {
  $type: 'app.ch.poltr.vote.proposal';
  title: string;
  topic?: string;
  text?: string;
  officialRef?: string;
  voteDate: string; // ISO date string
  language?: 'de-CH' | 'fr-CH' | 'it-CH' | 'rm-CH';
  createdAt?: string;
}

export interface ProposalEmbed {
  $type: 'app.ch.poltr.vote.embed';
  proposal: ProposalView;
}

export interface ProposalView {
  uri: string; // at-uri format
  cid: string;
  title: string;
  topic?: string;
  voteDate: string;
  language?: 'de-CH' | 'fr-CH' | 'it-CH' | 'rm-CH';
}

// Validation functions
export function validateProposal(data: any): ProposalRecord {
  lexicons.assertValidRecord('app.ch.poltr.vote.proposal', data);
  return data as ProposalRecord;
}

export function validateProposalEmbed(data: any): ProposalEmbed {
  lexicons.assertValidXrpcParams('app.ch.poltr.vote.embed', data);
  return data as ProposalEmbed;
}

// Type guard functions
export function isProposalRecord(data: any): data is ProposalRecord {
  return data?.$type === 'app.ch.poltr.vote.proposal';
}

export function isProposalEmbed(data: any): data is ProposalEmbed {
  return data?.$type === 'app.ch.poltr.vote.embed';
}
