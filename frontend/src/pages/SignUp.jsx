// Uses local form state and navigation for the public registration screen.
import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getError } from '../services/api.js';
import api from '../services/api.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { useToast } from '../context/ToastContext.jsx';

// Validates the form, submits the registration, and redirects the new user.
export default function SignUp() {
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (form.username.trim().length < 3)
      e.username = 'Username must be at least 3 characters';
    if (!form.password) e.password = 'Password is required';
    if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/auth/signup', {
        username: form.username.trim(),
        password: form.password,
      });
      toast.success('Account created! Please log in.');
      nav('/login', { replace: true });
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 overflow-hidden">
      {/* Left brand panel */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white p-10 animate-slide-in-left relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 -left-10 w-56 h-56 bg-brand-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="flex items-center gap-3 relative">
          <div className="w-12 h-12 rounded-full bg-white/20 grid place-items-center font-bold text-xl animate-float">
            BF
          </div>
          <div>
            <p className="font-bold text-xl">Batloung Fruits</p>
            <p className="text-sm text-brand-100">Distribution Management System</p>
          </div>
        </div>

        <div className="space-y-6 relative">
          <h1 className="text-4xl font-bold leading-tight">
            Join the Batloung network today.
          </h1>
          <p className="text-brand-100 max-w-md">
            Create your account to start managing orders, stock, and vendors
            across Southern Africa.
          </p>
          <ul className="space-y-2 text-brand-100 text-sm">
            <li>✔ Free to create an account</li>
            <li>✔ Instant access after approval</li>
            <li>✔ Secure password encryption</li>
            <li>✔ Designed for distribution teams</li>
          </ul>
        </div>

        <p className="text-xs text-brand-200 relative">
          © {new Date().getFullYear()} Batloung Fruits
        </p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5 animate-slide-in-right">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-gray-800">Create account</h2>
            <p className="text-sm text-gray-500">
              Sign up to get started with Batloung
            </p>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Input
              label="Username"
              placeholder="Choose a username"
              value={form.username}
              error={errors.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <Button type="submit" className="w-full" loading={submitting}>
              Create account
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors duration-200"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}