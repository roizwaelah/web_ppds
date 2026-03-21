import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmDialog } from '../components/ui/Dialog';
import {
  LayoutDashboard, FileText, Target, Users, LogOut, Menu, X,
  ChevronDown, Image, GraduationCap, BookOpen, Megaphone,
  ClipboardList, Building2, Shield, Globe
} from 'lucide-react';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({ profil: false });
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isParentActive = (children) => children?.some((c) => location.pathname === c.path);
  const toggleMenu = (key) => setExpandedMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  // Helper role check
  const level = user?.level || 0;
  const isSuperAdmin = level >= 10;
  const isAdmin = level >= 5;
  const isEditor = level >= 1;

  const sidebarItems = [
    ...(isSuperAdmin || isAdmin ? [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { label: 'Hero Slide', path: '/admin/hero-slides', icon: Image },
      {
        label: 'Profil Pondok',
        icon: Building2,
        key: 'profil',
        children: [
          { label: 'Sekilas Pandang', path: '/admin/profil/sekilas-pandang', icon: FileText },
          { label: 'Visi & Misi', path: '/admin/profil/visi-misi', icon: Target },
          { label: 'Pengasuh', path: '/admin/profil/pengasuh', icon: Users },
        ],
      },
      { label: 'Pendidikan', path: '/admin/pendidikan', icon: GraduationCap },
    ] : []),

    ...(isSuperAdmin || isAdmin || isEditor ? [
      { label: 'Pojok Santri', path: '/admin/pojok-santri', icon: BookOpen },
      { label: 'Pengumuman', path: '/admin/pengumuman', icon: Megaphone },
    ] : []),

    ...(isSuperAdmin || isAdmin ? [
      { label: 'Pendaftaran', path: '/admin/pendaftaran', icon: ClipboardList },
    ] : []),

    ...(isSuperAdmin ? [
      { label: 'Manajemen User', path: '/admin/users', icon: Shield },
    ] : []),
  ];

  return (
    <div className="h-screen bg-slate-100 flex overflow-hidden">
      {/* Sidebar Overlay - Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Balanced Size */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          w-52 lg:w-48 bg-emerald-900 text-white
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:shrink-0
        `}
      >
        {/* Logo Header */}
        <div className="h-10 flex items-center justify-between px-3 border-b border-emerald-800/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center p-0.5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-bold truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[9px] text-emerald-400 uppercase tracking-wide">{user?.role?.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-emerald-300 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {sidebarItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`
                      w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all
                      ${isParentActive(item.children)
                        ? 'bg-emerald-800/60 text-white'
                        : 'text-emerald-100/80 hover:bg-emerald-800/40'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon size={15} className={isParentActive(item.children) ? 'text-emerald-400' : ''} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronDown
                      size={11}
                      className={`transition-transform ${expandedMenus[item.key] ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div className={`
                    overflow-hidden transition-all duration-150
                    ${expandedMenus[item.key] ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}
                  `}>
                    <div className="mt-0.5 ml-2.5 pl-2.5 border-l border-emerald-700/50 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-all
                            ${isActive(child.path)
                              ? 'text-emerald-400 font-medium bg-emerald-800/30'
                              : 'text-emerald-100/60 hover:text-emerald-300'
                            }
                          `}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${isActive(child.path) ? 'bg-emerald-400' : 'bg-emerald-700'}`} />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all
                    ${isActive(item.path)
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-emerald-100/80 hover:bg-emerald-800/40'
                    }
                  `}
                >
                  <item.icon size={15} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-2 bg-emerald-950/40 border-t border-emerald-800/50 shrink-0">
          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium text-rose-400 hover:bg-rose-500/15 rounded-lg"
          >
            <LogOut size={11} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-10 bg-white border-b border-slate-200 flex items-center justify-between px-3 lg:px-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-0.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={18} />
            </button>
            <h2 className="text-xs font-semibold text-slate-500 hidden sm:block">
			  PANEL<span className="text-emerald-400 font-bold">ADMIN</span>
			</h2>
          </div>

          <Link
            to="/"
            className="flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
          >
            <Globe size={11} />
            <span className="hidden sm:inline">Visit Site</span>
          </Link>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-3 lg:p-4">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <ConfirmDialog
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => { logout(); navigate('/admin/login'); }}
        title="Akhiri Sesi?"
        message="Anda akan keluar dari panel kontrol."
        type="warning"
      />
    </div>
  );
}
