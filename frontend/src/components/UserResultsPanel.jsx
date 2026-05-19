function UserResultsPanel({ stats, loading, selectedSessionId, onSelectResult }) {
  const totalAnalyses = stats?.totalAnalyses || 0;
  const totalAccountsAnalyzed = stats?.totalAccountsAnalyzed || 0;
  const totalSuspiciousAccountsFlagged = stats?.totalSuspiciousAccountsFlagged || 0;
  const totalFraudRingsDetected = stats?.totalFraudRingsDetected || 0;
  const latestResults = stats?.latestResults || [];

  const cards = [
    {
      label: 'Past tests',
      value: totalAnalyses.toLocaleString(),
      note: 'uploaded and processed',
      color: 'var(--ink-900)',
    },
    {
      label: 'Accounts scanned',
      value: totalAccountsAnalyzed.toLocaleString(),
      note: 'across all tests',
      color: '#3a5a4a',
    },
    {
      label: 'Suspicious flags',
      value: totalSuspiciousAccountsFlagged.toLocaleString(),
      note: 'signals surfaced',
      color: '#c44a2a',
    },
    {
      label: 'Fraud rings',
      value: totalFraudRingsDetected.toLocaleString(),
      note: 'network structures detected',
      color: '#a06c08',
    },
  ];

  return (
    <div className="card-warm mb-8" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline', marginBottom: '1rem' }}>
        <div>
          <p className="annotation mb-2">Your past test results</p>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
            Performance history and latest analyses
          </h3>
        </div>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#a09590' }}>
          {loading ? 'Refreshing…' : 'Up to date'}
        </span>
      </div>

      {loading && !totalAnalyses ? (
        <div style={{ padding: '1rem 0', color: 'var(--ink-500)', fontFamily: "'DM Sans', sans-serif" }}>
          Loading your saved results…
        </div>
      ) : totalAnalyses === 0 ? (
        <div style={{ padding: '1rem 0', color: 'var(--ink-500)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
          No saved results yet. Upload your first CSV to start building a history of suspicious accounts, fraud rings, and dataset coverage.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: '#e8e0d8', border: '1px solid #e8e0d8', borderRadius: '4px', overflow: 'hidden' }}>
            {cards.map((card, index) => (
              <div
                key={card.label}
                className="animate-fade-up"
                style={{
                  background: 'rgba(253, 250, 245, 0.9)',
                  padding: '1.25rem',
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'both',
                }}
              >
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a09590', marginBottom: '0.5rem' }}>
                  {card.label}
                </p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: card.color, lineHeight: 1 }}>
                  {card.value}
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#a09590', marginTop: '0.375rem' }}>
                  {card.note}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <p className="annotation mb-3">Recent tests</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e0d4c4' }}>
                    {['File', 'Accounts', 'Suspicious', 'Rings', 'Processed'].map((header) => (
                      <th key={header} style={{ textAlign: 'left', padding: '0.75rem 0.5rem 0.75rem 0', color: '#a09590', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {latestResults.slice().reverse().map((item) => (
                    <tr
                      key={item.sessionId}
                      style={{
                        borderBottom: '1px solid rgba(224, 212, 196, 0.65)',
                        background: selectedSessionId === item.sessionId ? 'rgba(200, 135, 10, 0.06)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.75rem 0.5rem 0.75rem 0', color: 'var(--ink-900)' }}>
                        <button
                          type="button"
                          onClick={() => onSelectResult?.(item)}
                          style={{
                            border: 'none',
                            background: 'none',
                            padding: 0,
                            color: 'var(--amber)',
                            cursor: 'pointer',
                            font: 'inherit',
                            textAlign: 'left',
                          }}
                        >
                          {item.fileName}
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem 0.75rem 0', color: 'var(--ink-500)' }}>{item.summary.total_accounts_analyzed}</td>
                      <td style={{ padding: '0.75rem 0.5rem 0.75rem 0', color: '#c44a2a' }}>{item.summary.suspicious_accounts_flagged}</td>
                      <td style={{ padding: '0.75rem 0.5rem 0.75rem 0', color: '#a06c08' }}>{item.summary.fraud_rings_detected}</td>
                      <td style={{ padding: '0.75rem 0.5rem 0.75rem 0', color: '#a09590' }}>
                        {item.summary.processing_time_seconds}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {stats?.lastAnalyzedAt && (
              <p style={{ marginTop: '0.75rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#a09590' }}>
                Last analyzed {new Date(stats.lastAnalyzedAt).toLocaleString()}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UserResultsPanel;
