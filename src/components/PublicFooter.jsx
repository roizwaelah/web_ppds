import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-emerald-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                NH
              </div>
              <div>
                <h3 className="font-bold">Darussalam Panusupan</h3>
                <p className="text-emerald-300 text-xs">Pondok Pesantren</p>
              </div>
            </div>
            <p className="text-emerald-200 text-sm leading-relaxed">
              Membentuk generasi muslim yang berilmu, berakhlak mulia, dan
              berdaya saing tinggi.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Menu</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/profil/sekilas-pandang"
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  Sekilas Pandang
                </Link>
              </li>
              <li>
                <Link
                  to="/profil/visi-misi"
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  Visi & Misi
                </Link>
              </li>
              <li>
                <Link
                  to="/pendidikan"
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  Pendidikan
                </Link>
              </li>
              <li>
                <Link
                  to="/pojok-santri"
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  Pojok Santri
                </Link>
              </li>
              <li>
                <Link
                  to="/pendaftaran"
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  Pendaftaran
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="text-emerald-400 mt-0.5 shrink-0"
                />
                <span className="text-emerald-200">
                  Jl. Pesantren No. 1, Kec. Cijeruk, Kab. Bogor, Jawa Barat
                  16740
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-emerald-400 shrink-0" />
                <span className="text-emerald-200">0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-emerald-400 shrink-0" />
                <span className="text-emerald-200">
                  info@nurulhikmah.sch.id
                </span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-bold mb-4">Jam Operasional</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-400 shrink-0" />
                <span className="text-emerald-200">
                  Senin - Jumat: 08.00 - 16.00
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-400 shrink-0" />
                <span className="text-emerald-200">Sabtu: 08.00 - 12.00</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-400 shrink-0" />
                <span className="text-emerald-200">Minggu: Libur</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-700 mt-10 pt-6 text-center text-emerald-300 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Pondok Pesantren Darussalam
            Panusupan. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
