// Uses local form state and navigation for the authentication screen.
import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getError } from '../services/api.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { useToast } from '../context/ToastContext.jsx';

// Validates credentials, submits login, and redirects the authenticated user.
export default function Login() {
  const { user, login, loading } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(form.username.trim(), form.password);
      toast.success('Welcome back!');
      nav(loc.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 overflow-hidden">
      {/* Left brand panel - slides in from the left */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white p-10 animate-slide-in-left relative overflow-hidden">
        {/* Soft floating blob for depth */}
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
            From South African provinces to Maseru street vendors.
          </h1>
          <p className="text-brand-100 max-w-md">
            Track suppliers, stock, box sizes, orders and sales — all in one place.
          </p>
          <ul className="space-y-2 text-brand-100 text-sm">
            <li>✔ Manage suppliers across all 9 provinces</li>
            <li>✔ Track apples, bananas, oranges, mangoes, grapes</li>
            <li>✔ Small, medium and large box sizes</li>
            <li>✔ Full order lifecycle with stock control</li>
          </ul>
        </div>

        <p className="text-xs text-brand-200 relative">
          © {new Date().getFullYear()} Batloung Fruits
        </p>
      </div>

      {/* Right form - slides in from the right */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5 animate-slide-in-right">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-gray-800">Log in</h2>
            <p className="text-sm text-gray-500">Enter your credentials to continue</p>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Input
              label="Username"
              placeholder="admin"
              value={form.username}
              error={errors.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button type="submit" className="w-full" loading={submitting || loading}>
              Log in
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}