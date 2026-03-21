import { ShieldAlert, ArrowLeft, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Forbidden() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/admin');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden animate-in fade-in duration-700">

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-50 via-white to-rose-50" />

      {/* Glow Effect */}
      <div className="absolute w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-20 -top-32 -left-32 animate-pulse" />
      <div className="absolute w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-20 -bottom-32 -right-32 animate-pulse" />

      <div className="relative z-10 max-w-lg w-full mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-2xl p-10 text-center">

          {/* Icon */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-100 flex items-center justify-center mb-6 shadow-inner animate-bounce">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
            403 — Akses Ditolak
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
            Anda tidak memiliki izin untuk mengakses halaman ini.
            Sistem keamanan membatasi akses berdasarkan tingkat otoritas akun.
          </p>

          {/* User Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Level Akun Anda
            </p>
            <p className="text-sm font-bold text-slate-800">
              {user?.role || 'Unknown'} (Level {user?.level ?? 0})
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
            <Clock size={14} />
            Redirect otomatis dalam <span className="font-bold text-emerald-600">{countdown}</span> detik
          </div>

          {/* Button */}
          <Link
            to="/admin"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
          >
            <ArrowLeft size={14} />
            Kembali Sekarang
          </Link>

        </div>
      </div>
    </div>
  );
}