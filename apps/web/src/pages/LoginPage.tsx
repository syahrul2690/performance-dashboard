import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'GM', email: 'gm@pusmanpro.pln.co.id' },
  { role: 'Sr. Manajer', email: 'srmanajer@pusmanpro.pln.co.id' },
  { role: 'Manajer', email: 'manajer@pusmanpro.pln.co.id' },
  { role: 'Asman', email: 'asman@pusmanpro.pln.co.id' },
  { role: 'Staff', email: 'staff.officer@pusmanpro.pln.co.id' },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Email atau kata sandi salah.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('Pusmanpro@2026');
    setError('');
  }

  return (
    <div className="login-screen">
      {/* LEFT — form column (47%) */}
      <div className="login-body">
        {/* Brand strip */}
        <div className="login-brand-strip">
          <img
            src="/brand/logo_pln_data.png"
            alt="PLN"
            className="login-brand-strip-pln"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <img
            src="/brand/logo_pln_simpp_data.png"
            alt="SIMPP"
            className="login-brand-strip-simpp"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* Centered form panel */}
        <div className="login-panel">
          <div className="login-card">
            <h1 className="login-headline">Dashboard Kinerja<br />PUSMANPRO</h1>
            <p className="login-subline">Sistem Informasi Manajemen Proyek — PT PLN (Persero)</p>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">Email</label>
                <div className="login-input-row">
                  <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    className={`login-input${error ? ' error' : ''}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@pusmanpro.pln.co.id"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">Kata Sandi</label>
                <div className="login-input-row">
                  <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    className={`login-input${error ? ' error' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className={`login-error-banner${error ? ' visible' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16,flexShrink:0}}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  <span className="login-spinner" style={{display:'block'}} />
                ) : (
                  <LogIn size={18} className="login-btn-icon" />
                )}
                {loading ? 'Masuk…' : 'Masuk ke Dashboard'}
              </button>
            </form>

            {/* Demo hint */}
            <div className="login-hint">
              <button
                className={`login-hint-toggle${hintOpen ? ' open' : ''}`}
                type="button"
                onClick={() => setHintOpen((v) => !v)}
              >
                <span>Demo Akun Tersedia</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron" style={{width:14,height:14,transition:'transform 0.2s',transform: hintOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <div className={`login-hint-body${hintOpen ? ' open' : ''}`}>
                <table className="login-cred-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_ACCOUNTS.map((a) => (
                      <tr key={a.email} onClick={() => fillDemo(a.email)} style={{cursor:'pointer'}}>
                        <td className="login-cred-role">{a.role}</td>
                        <td>{a.email.split('@')[0]}</td>
                        <td><code>Pusmanpro@2026</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="login-footer">
              <span>© 2026 PT PLN (Persero)</span>
              <span>SIMPP v3.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — illustration column (53%) */}
      <div className="login-illustration">
        <div className="login-illustration-inner">
          <img
            src="/brand/login_right_data.png"
            alt="PUSMANPRO Dashboard"
            className="login-illustration-logo"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
              const parent = el.parentElement!;
              parent.style.background = 'linear-gradient(135deg, #125D72 0%, #017991 50%, #0a3d52 100%)';
              parent.innerHTML = `
                <div style="text-align:center;color:#fff;padding:48px">
                  <div style="font-size:72px;opacity:0.3;margin-bottom:24px">⚡</div>
                  <h2 style="font-family:Manrope,sans-serif;font-size:32px;font-weight:700;line-height:1.2;margin-bottom:12px">
                    Monitoring &amp; Evaluasi<br/>Kinerja Proyek PLN
                  </h2>
                  <p style="font-size:16px;opacity:0.75">Real-time Performance Dashboard</p>
                </div>`;
            }}
          />
        </div>
      </div>
    </div>
  );
}
