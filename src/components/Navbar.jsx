import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilOpen, setProfilOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isProfilActive = location.pathname.startsWith("/profil");

  const navItems = [
    { label: "Beranda", path: "/" },
    {
      label: "Profil",
      children: [
        { label: "Sekilas Pandang", path: "/profil/sekilas-pandang" },
        { label: "Visi & Misi", path: "/profil/visi-misi" },
        { label: "Pengasuh", path: "/profil/pengasuh" },
      ],
    },
    { label: "Pendidikan", path: "/pendidikan" },
    { label: "Pojok Santri", path: "/pojok-santri" },
    { label: "Pengumuman", path: "/pengumuman" },
    { label: "Pendaftaran", path: "/pendaftaran" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              NH
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-emerald-800 leading-tight">
                Darussalam Panusupan
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">Pondok Pesantren</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => setProfilOpen(true)}
                  onMouseLeave={() => setProfilOpen(false)}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isProfilActive
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-gray-700 hover:text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${profilOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {profilOpen && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-4 py-2.5 text-sm transition-colors ${
                            isActive(child.path)
                              ? "text-emerald-700 bg-emerald-50 font-medium"
                              : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-gray-700 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2.5 pl-6 rounded-lg text-sm ${
                        isActive(child.path)
                          ? "text-emerald-700 bg-emerald-50 font-medium"
                          : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm ${
                    isActive(item.path)
                      ? "text-emerald-700 bg-emerald-50 font-medium"
                      : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
