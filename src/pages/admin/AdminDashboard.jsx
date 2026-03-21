import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { 
  Users, FileText, Megaphone, Image, GraduationCap, 
  BookOpen, ClipboardList, ArrowRight, LayoutDashboard,
  Clock, Bell
} from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();

  const { pengasuh, pojokSantri, pengumuman, heroSlides } = useData();

  const stats = [
    { label: 'Hero Slides', value: heroSlides.length, icon: Image, color: 'bg-indigo-50 text-indigo-600', link: '/admin/hero-slides' },
    { label: 'Total Pengasuh', value: pengasuh.length, icon: Users, color: 'bg-blue-50 text-blue-600', link: '/admin/profil/pengasuh' },
    { label: 'Artikel Santri', value: pojokSantri.length, icon: BookOpen, color: 'bg-amber-50 text-amber-600', link: '/admin/pojok-santri' },
    { label: 'Pengumuman', value: pengumuman.length, icon: Megaphone, color: 'bg-rose-50 text-rose-600', link: '/admin/pengumuman' },
  ];

  const quickLinks = [
    { label: 'Hero Slides', desc: 'Banner utama', icon: Image, path: '/admin/hero-slides', color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Sekilas Pandang', desc: 'Profil utama', icon: FileText, path: '/admin/profil/sekilas-pandang', color: 'text-blue-600 bg-blue-50' },
    { label: 'Pendidikan', desc: 'Program belajar', icon: GraduationCap, path: '/admin/pendidikan', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pojok Santri', desc: 'Kelola artikel', icon: BookOpen, path: '/admin/pojok-santri', color: 'text-amber-600 bg-amber-50' },
    { label: 'Pengumuman', desc: 'Update info', icon: Megaphone, path: '/admin/pengumuman', color: 'text-purple-600 bg-purple-50' },
    { label: 'Pendaftaran', desc: 'Info PSB', icon: ClipboardList, path: '/admin/pendaftaran', color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-6 animate-in fade-in duration-700">
      {/* Welcome Header - Compact */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
            <LayoutDashboard size={16} />
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Ringkasan Panel</h1>
        </div>
        <p className="text-xs text-slate-500 font-medium ml-9">Selamat bekerja kembali, {user?.name}</p>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat) => (
          <Link 
            key={stat.label} 
            to={stat.link} 
            className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 hover:shadow-lg hover:shadow-slate-200/50 transition-all group overflow-hidden relative"
          >
            <div className={`absolute top-0 right-0 w-16 h-16 -mr-6 -mt-6 rounded-full opacity-10 ${stat.color.split(' ')[0]}`} />
            <div className="flex flex-col gap-2.5 relative z-10">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-slate-900">{stat.value}</span>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Quick Links Section */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Akses Cepat</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="bg-white rounded-xl border border-slate-100 p-3 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group flex items-center gap-3"
              >
                <div className={`p-2 rounded-lg ${item.color} shrink-0 group-hover:scale-110 transition-transform`}>
                  <item.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs group-hover:text-emerald-600 transition-colors">{item.label}</h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">{item.desc}</p>
                </div>
                <ArrowRight size={11} className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="space-y-4">
          {/* Recent Pengumuman */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg shadow-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <Bell size={14} className="text-emerald-400" />
                <h2 className="text-sm font-bold tracking-tight">Info Terbaru</h2>
              </div>
              <Link to="/admin/pengumuman" className="text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">
                Semua
              </Link>
            </div>
            <div className="space-y-3">
              {pengumuman.slice(0, 3).map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock size={9} /> {item.date}
                    </span>
                    {item.important && <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />}
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1 italic">
                    "{item.title}"
                  </h3>
                </div>
              ))}
              {pengumuman.length === 0 && (
                <p className="text-[10px] text-slate-500 text-center py-3 italic">Belum ada pengumuman.</p>
              )}
            </div>
          </div>

          {/* Recent Pojok Santri */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Karya Santri</h2>
              <Link to="/admin/pojok-santri" className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                Lihat
              </Link>
            </div>
            <div className="space-y-3">
              {pojokSantri.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <BookOpen size={13} className="text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-[10px] font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                    <p className="text-[9px] text-slate-400 font-medium">Oleh {item.author}</p>
                  </div>
                </div>
              ))}
              {pojokSantri.length === 0 && (
                <p className="text-[10px] text-slate-400 text-center py-3 italic">Belum ada artikel.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
