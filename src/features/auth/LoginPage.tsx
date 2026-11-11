import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/assets/logo';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormData) {
    setLoading(true);
    try {
      await login(values);
    } catch (err: any) {
      toast.error(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left brand */}
        {/* Left Brand Area */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-white text-slate-900 border-r border-slate-100">
          
          {/* Top: Logo */}
          <div>
            <div className="text-2xl font-bold flex items-center gap-2"> 
              <Logo size={40} /> 
            </div>
          </div>

          {/* Middle: Advertising GIF / Image */}
          <div className="flex flex-1 items-center justify-center py-8">
            <img 
              src="/banner-300x300.png"
  alt="CoachDesk Education Management"
  width={250}
  height={250}  
              className="w-full-x max-w-sm rounded-xl shadow-sm border border-slate-200 object-cover"
            />
          </div>
        </div>



        {/* Right form */}
        <div className="p-10">
          <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your institute dashboard</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="owner@abc.edu" value="owner@abc.edu"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                {...register('password')}
                type="password" value="Password@123"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700">
              Forgot password?
            </Link>
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700">
              Register institute →
            </Link>
          </div>

          <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <strong>Demo:</strong> owner@abc.edu / Password@123 &nbsp;·&nbsp; super@coachdesk.in / Password@123
          </div>
        </div>
      </div>
    </div>
  );
}