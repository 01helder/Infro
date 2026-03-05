import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Briefcase, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'buyer' | 'creator'>('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900">Create Account</h1>
          <p className="text-gray-500">Join the digital marketplace today</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">I want to...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  role === 'buyer' ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "bg-white border-gray-200 text-gray-500"
                }`}
              >
                <UserCircle size={18} />
                <span className="text-xs font-bold">Buy</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  role === 'creator' ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "bg-white border-gray-200 text-gray-500"
                }`}
              >
                <Briefcase size={18} />
                <span className="text-xs font-bold">Sell</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating account...' : (
              <>
                Sign Up
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
