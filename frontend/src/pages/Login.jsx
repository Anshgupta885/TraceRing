import { useState } from 'react';
import { loginUser } from '../services/api';

function Login({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess(data);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="card mb-6" style={{ padding: '1.25rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink-900)' }}>Sign in</h2>
        <p className="annotation" style={{ color: '#a09590', marginTop: '0.5rem' }}>Access your account</p>

        {error && <div style={{ color: '#c44a2a', marginTop: '0.75rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          <input autoFocus required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input" />
          <div className="password-field-wrapper">
            <input
              required
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              aria-describedby="toggle-password"
            />
            <button
              id="toggle-password"
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="password-toggle"
              onClick={() => setShowPassword(s => !s)}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5 0-9.27-3.11-11-7 1.02-2.04 2.57-3.79 4.45-5.01" />
                  <path d="M1 1l22 22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: 'var(--ink-500)' }}>Don't have an account? </span>
              <button type="button" onClick={() => onNavigate && onNavigate('signup')} style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Sign up</button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
