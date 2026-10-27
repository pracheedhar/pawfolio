import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { api } from '../lib/api';
export default function Auth({ signup = false }) {
  const { setUser, notify } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const body = Object.fromEntries(new FormData(event.currentTarget));
    if (new TextEncoder().encode(body.password).length > 72) {
      setError('Password must be at most 72 UTF-8 bytes');
      setBusy(false);
      return;
    }
    try {
      setUser(await api(`/auth/${signup ? 'register' : 'login'}`, { method: 'POST', body }));
      notify(signup ? 'Welcome to Pawfolio' : 'Welcome back');
      const from = location.state?.from;
      navigate(
        typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
          ? from
          : '/profile',
        { replace: true },
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="py-12 min-h-[70vh] bg-[#E6F0F9]">
      <form
        onSubmit={submit}
        className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl space-y-6"
      >
        <h1 className="text-3xl font-bold">{signup ? 'Join Pawfolio' : 'Welcome back'}</h1>
        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}
        {signup && (
          <label className="block">
            Name
            <input
              name="name"
              required
              minLength={2}
              maxLength={80}
              className="block w-full border rounded-lg p-3"
              autoComplete="name"
            />
          </label>
        )}
        <label className="block">
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            className="block w-full border rounded-lg p-3"
            autoComplete="email"
          />
        </label>
        <label className="block">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            className="block w-full border rounded-lg p-3"
            autoComplete={signup ? 'new-password' : 'current-password'}
          />
        </label>
        <button
          disabled={busy}
          className="w-full rounded-full py-3 bg-[#6A92C5] text-white disabled:opacity-50"
        >
          {busy ? 'Please wait…' : signup ? 'Sign up' : 'Log in'}
        </button>
        <Link to={signup ? '/login' : '/signup'} state={location.state} className="text-[#587ea8]">
          {signup ? 'Already have an account? Log in' : 'New here? Sign up'}
        </Link>
      </form>
    </div>
  );
}
