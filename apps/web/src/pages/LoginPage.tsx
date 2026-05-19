import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-form-wrap">
          <img src="/brand/logo_pln_simpp_data.png" alt="SIMPP" className="login-logo" />
          <h1 className="login-title">Dashboard Kinerja PUSMANPRO</h1>
          <p className="login-subtitle">Sistem Informasi Manajemen Proyek — PT PLN (Persero)</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@pusmanpro.pln.co.id"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kata Sandi</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Masuk…' : 'Masuk'}
            </button>
          </form>

          <div className="login-demo-hint">
            <p className="text-muted text-sm">Demo: gm@pusmanpro.pln.co.id · Pusmanpro@2026</p>
          </div>
        </div>
      </div>
      <div className="login-right">
        <img src="/brand/login_right_data.png" alt="" className="login-bg-image" />
        <div className="login-right-overlay">
          <div className="login-right-text">
            <h2>Selamat Datang di SIMPP</h2>
            <p>Monitoring & Evaluasi Kinerja Proyek PLN secara Real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
