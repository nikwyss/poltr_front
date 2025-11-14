import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { listRecords } from '../../lib/agent';
import { validateProposal } from '../../lib/lexicons';
import type { ProposalRecord } from '../../lib/lexicons';

interface ProposalWithMetadata {
  uri: string;
  cid: string;
  value: ProposalRecord;
}

export default function ProposalsSearch() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<ProposalWithMetadata[]>([]);
  const [loading, setLoading] = useState(true); // loading proposals
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return; // wait for auth restoration
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadProposals();
  }, [isAuthenticated, authLoading, navigate]);

  const loadProposals = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const response = await listRecords(
        user.did,
        'app.ch.poltr.vote.proposal',
        100
      );

      // Validate and filter proposals
      const validProposals = (response.records || [])
        .filter((record: any) => {
          try {
            validateProposal(record.value);
            return true;
          } catch (err) {
            console.warn('Invalid proposal record:', record.uri, err);
            return false;
          }
        })
        .map((record: any) => ({
          uri: record.uri,
          cid: record.cid,
          value: record.value as ProposalRecord,
        }));

      setProposals(validProposals);
    } catch (err) {
      console.error('Error loading proposals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('de-CH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (authLoading) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
        Restoring session...
      </div>
    );
  }
  if (!isAuthenticated || !user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0 }}>Swiss Referendum Proposals</h1>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#0085ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Back to Home
          </button>
        </div>

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <p>Loading proposals...</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '20px',
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffcdd2'
          }}>
            <strong>Error:</strong> {error}
            <button
              onClick={loadProposals}
              style={{
                marginLeft: '20px',
                padding: '8px 16px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && proposals.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <p style={{ color: '#666', fontSize: '18px' }}>
              No proposals found. Create your first proposal!
            </p>
          </div>
        )}

        {!loading && proposals.length > 0 && (
          <div style={{
            display: 'grid',
            gap: '20px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
          }}>
            {proposals.map((proposal) => (
              <div
                key={proposal.uri}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px'
                }}>
                  <h3 style={{
                    margin: '0 0 10px 0',
                    color: '#333',
                    fontSize: '18px'
                  }}>
                    {proposal.value.title}
                  </h3>
                  {proposal.value.language && (
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '4px',
                      color: '#1976d2'
                    }}>
                      {proposal.value.language}
                    </span>
                  )}
                </div>

                {proposal.value.topic && (
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    <strong>Topic:</strong> {proposal.value.topic}
                  </div>
                )}

                {proposal.value.text && (
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '12px',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {proposal.value.text}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #eee'
                }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <strong>Vote Date:</strong><br />
                    {formatDate(proposal.value.voteDate)}
                  </div>
                  {proposal.value.officialRef && (
                    <div style={{
                      fontSize: '12px',
                      color: '#999'
                    }}>
                      Ref: {proposal.value.officialRef}
                    </div>
                  )}
                </div>

                <div style={{
                  marginTop: '12px',
                  fontSize: '11px',
                  color: '#999',
                  wordBreak: 'break-all'
                }}>
                  URI: {proposal.uri}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && proposals.length > 0 && (
          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            color: '#666'
          }}>
            Found {proposals.length} proposal{proposals.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
