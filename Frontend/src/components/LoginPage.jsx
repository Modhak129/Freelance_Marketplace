import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import "../App.css";


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ok = await login(email, password);
    if (ok) navigate('/projects');
    else setError('Invalid email or password. Please try again.');
  };

  return (
    <div className="flex justify-center items-center mt-16 px-4">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="login-label">Email</label>
            <input type="email" className="login-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="login-label">Password</label>
            <input type="password" className="login-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
}
