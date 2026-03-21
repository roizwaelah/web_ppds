import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, User, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useNotification();
  
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const success = await login(username.trim(), password);

      if (success) {
        showToast('Login berhasil! Selamat datang kembali.', 'success');
        navigate(from, { replace: true });
      } else {
        setPassword(''); // 🔥 clear password on fail
        showToast('Username atau password salah', 'error');
      }
    } catch {
      setPassword('');
      showToast('Terjadi kesalahan sistem.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[35%] bg-emerald-100 rounded-full blur-[60px] sm:blur-[100px] opacity-25 pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[35%] bg-blue-100 rounded-full blur-[60px] sm:blur-[100px] opacity-25 pointer-events-none"></div>

      <div className="w-full max-w-[340px] z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-white rounded-2xl shadow-lg shadow-slate-200/50 mb-4 group transition-transform hover:scale-105">
            <img 
              src="/logo.png" 
              alt="Logo PP Darussalam" 
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder.svg';
              }}
            />
          </div>
          <p className="text-xs font-medium text-emerald-500 mt-1.5">
            Silakan masuk ke Panel Admin
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 ring-2 ring-emerald-500 overflow-hidden p-6">
          <div className="p-5 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    maxLength={100}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium text-slate-700"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    maxLength={128}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium text-slate-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-200 mt-1.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  'Masuk ke Akun'
                )}
              </button>
            </form>
          </div>
          
          {/* Footer Back Button */}
          <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-50 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
        
        {/* Copyright */}
        <p className="text-center text-slate-400 text-[9px] sm:text-[10px] mt-7 leading-relaxed font-medium uppercase tracking-[0.12em]">
          PP Darussalam Panusupan &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
