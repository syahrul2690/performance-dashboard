import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, LogIn, KeyRound, ChevronDown, AlertCircle,
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'General Manager', email: 'gm@pusmanpro.pln.co.id' },
  { role: 'Senior Manajer', email: 'srmanajer@pusmanpro.pln.co.id' },
  { role: 'Manajer Bidang', email: 'manajer@pusmanpro.pln.co.id' },
  { role: 'Asisten Manajer', email: 'asman@pusmanpro.pln.co.id' },
  { role: 'Staff Officer', email: 'staff.officer@pusmanpro.pln.co.id' },
];

const DEMO_PASSWORD = 'Pusmanpro@2026';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    setPassword(DEMO_PASSWORD);
    setError('');
  }

  return (
    <div className="login-screen">
      {/* LEFT — form column */}
      <div className="login-body">
        <div className="login-brand-strip">
          <img
            src="/brand/logo_pln_data.png"
            alt="PLN"
            className="login-brand-strip-pln"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="login-brand-strip-text">
            PT PLN (Persero) PUSAT MANAJEMEN PROYEK
          </span>
          <img
            src="/brand/logo_pln_simpp_data.png"
            alt="SIMPP"
            className="login-brand-strip-simpp"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        <div className="login-panel">
          <div className="login-card">
            <h1 className="login-headline">Selamat Datang!</h1>
            <p className="login-subline">
              Masuk ke Dashboard Kinerja PT PLN (Persero) PUSMANPRO
            </p>

            <div className={`login-error-banner${error ? ' visible' : ''}`}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label" htmlFor="login-email">Username</label>
                <div className="login-input-row">
                  <Mail size={18} className="login-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    className="login-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email / username LDAP anda"
                    autoComplete="email"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="login-password">Kata Sandi</label>
                <div className="login-input-row">
                  <Lock size={18} className="login-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi anda"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="login-meta-row">
                <label className="login-remember">
                  <input type="checkbox" />
                  <span>Ingat kata sandi</span>
                </label>
                <a
                  className="login-forgot"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Lupa kata sandi?
                </a>
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  <span className="login-spinner" />
                ) : (
                  <LogIn size={18} className="login-btn-icon" />
                )}
                <span>{loading ? 'Memproses…' : 'Masuk'}</span>
              </button>
            </form>

            <p className="login-register-hint">
              Belum memiliki akun?
              <a href="#" onClick={(e) => e.preventDefault()}>Daftar disini</a>
            </p>

            <div className="login-hint">
              <button
                type="button"
                className={`login-hint-toggle${hintOpen ? ' open' : ''}`}
                aria-expanded={hintOpen}
                onClick={() => setHintOpen((v) => !v)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <KeyRound size={14} />
                  Akun Demo - klik untuk isi otomatis
                </span>
                <ChevronDown
                  size={14}
                  className="chevron"
                  style={{
                    transition: 'transform 0.2s',
                    transform: hintOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              <div className={`login-hint-body${hintOpen ? ' open' : ''}`}>
                <table className="login-cred-table" aria-label="Daftar akun demo">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Password</th>
                      <th>Peran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_ACCOUNTS.map((a) => (
                      <tr
                        key={a.email}
                        onClick={() => fillDemo(a.email)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{a.email.split('@')[0]}</td>
                        <td><code>{DEMO_PASSWORD}</code></td>
                        <td className="login-cred-role">{a.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="login-footer">
              <span>&copy; 2026 PT PLN (Persero) &middot; PUSMANPRO</span>
              <span>v1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — brand illustration column */}
      <aside className="login-illustration" aria-hidden="true">
        <div className="login-illustration-inner">
          <img
            src="/brand/login_right_data.png"
            alt="SIMPP"
            className="login-illustration-logo"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <h2 className="login-illustration-tagline">SIMPP</h2>
          <p className="login-illustration-sub">
            Sistem Informasi Monitoring Penugasan dan Pelaporan
          </p>
        </div>
      </aside>
    </div>
  );
}
