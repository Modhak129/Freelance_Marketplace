import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const ok = await register(username, email, password, isFreelancer);
    if (ok) {
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError('Registration failed. Try different credentials.');
    }
  };

  return (
    <div className="flex justify-center items-center mt-16 px-4">
      <div className="card w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input type="text" className="form-input w-full" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="form-input w-full" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="form-input w-full" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="flex items-center">
            <input id="isFreelancer" type="checkbox" className="h-4 w-4" checked={isFreelancer} onChange={e => setIsFreelancer(e.target.checked)} />
            <label htmlFor="isFreelancer" className="ml-2 text-sm">I am a freelancer</label>
          </div>
          <button type="submit" className="btn btn-primary w-full px-4 py-2 bg-indigo-600 text-white rounded">Register</button>
        </form>
      </div>
    </div>
  );
}
