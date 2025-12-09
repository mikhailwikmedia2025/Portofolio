import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, isMockMode } from '../supabaseClient';
import { Button } from '../components/ui/Button';

export const Login = () => {
  const [email, setEmail] = useState(isMockMode ? 'admin@lumina.com' : '');
  const [password, setPassword] = useState(isMockMode ? 'admin' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await api.auth.signIn(email, password);
      if (error) throw error;
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400 text-sm">Enter your credentials to manage your portfolio.</p>
        </div>

        {isMockMode && (
           <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs p-3 rounded-lg mb-6">
             <strong>Mock Mode Active:</strong> No backend connected.<br/>
             Use <code>admin@lumina.com</code> / <code>admin</code>
           </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-zinc-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-zinc-600 outline-none"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <Button type="submit" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>
        
        <div className="mt-6 text-center">
            <a href="/" className="text-xs text-zinc-500 hover:text-white">← Back to Portfolio</a>
        </div>
      </div>
    </div>
  );
};
