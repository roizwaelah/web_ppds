import { Menu, X, ChevronDown, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(null);

  // Definisi array objek tanpa type MenuItem[]
  const navigation = [
    { name: 'Beranda', href: '/' },
    {
      name: 'Profil',
      href: '#',
      submenu: [
        { name: 'Selayang Pandang', href: '/profil/sekilas-pandang' },
        { name: 'Visi Misi', href: '/profil/visi-misi' },
        { name: 'Pengasuh', href: '/profil/pengasuh' },
      ],
    },
    { name: 'Pendidikan', href: '/pendidikan' },
    { name: 'Pojok Santri', href: '/pojok-santri' },
    { name: 'Pengumuman', href: '/pengumuman' },
    { name: 'Pendaftaran', href: '/pendaftaran' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/header_ppds.png"
              alt="Pondok Pesantren Darussalam"
              className="h-10 md:h-14 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.submenu && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.submenu ? (
                  <span className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors flex items-center gap-1 cursor-pointer">
                    {item.name}
                    <ChevronDown className="w-4 h-4" />
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors flex items-center gap-1"
                  >
                    {item.name}
                  </Link>
                )}

                {item.submenu && activeDropdown === item.name && (
                  <div className="absolute left-0 top-full pt-2 w-64 z-60">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          to={subitem.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/admin/login"
              className="ml-2 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </div>

          <div className="md:hidden relative">
            <button
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {mobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-[200px] w-max max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-60 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.submenu ? (
                        <>
                          <button
                            onClick={() =>
                              setMobileDropdownOpen(
                                mobileDropdownOpen === item.name ? null : item.name
                              )
                            }
                            className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors flex items-center justify-between"
                          >
                            <span>{item.name}</span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                mobileDropdownOpen === item.name ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {mobileDropdownOpen === item.name && (
                            <div className="pl-4 mt-1 space-y-1 border-l-2 border-emerald-100 ml-3">
                              {item.submenu.map((subitem) => (
                                <Link
                                  key={subitem.name}
                                  to={subitem.href}
                                  onClick={() => {
                                    setMobileMenuOpen(false);
                                    setMobileDropdownOpen(null);
                                  }}
                                  className="block px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                >
                                  {subitem.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <Link
                      to="/admin/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      Login Admin
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
