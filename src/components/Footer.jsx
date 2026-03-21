import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4"> {/* Padding naik dari 12 ke 16 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12"> {/* Gap naik ke 12 agar tidak rapat */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Pondok Pesantren Darussalam</h3>
              <p className="text-base text-emerald-500 font-medium">Lembaga Pendidikan Islam Terpadu</p>
            </div>
            <p className="text-[15px] text-gray-400 leading-relaxed mb-4 max-w-md">
              Pondok Pesantren Darussalam Panusupan adalah lembaga pendidikan Islam yang berkomitmen untuk membentuk
              generasi yang berakhlak mulia, berilmu pengetahuan, dan bermanfaat bagi masyarakat.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Menu Utama</h4>
            <ul className="space-y-3 text-[15px]"> {/* Jarak antar list naik */}
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Beranda</Link></li>
              <li><Link to="/profil/sekilas-pandang" className="hover:text-emerald-400 transition-colors">Profil</Link></li>
              <li><Link to="/pendidikan" className="hover:text-emerald-400 transition-colors">Pendidikan</Link></li>
              <li><Link to="/pojok-santri" className="hover:text-emerald-400 transition-colors">Pojok Santri</Link></li>
              <li><Link to="/pengumuman" className="hover:text-emerald-400 transition-colors">Pengumuman</Link></li>
              <li><Link to="/pendaftaran" className="hover:text-emerald-400 transition-colors">Pendaftaran</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Kontak Kami</h4>
            <ul className="space-y-4 text-[15px]">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 shrink-0 text-emerald-500" />
                <span className="leading-relaxed">Kandang Aur RT 04 RW 02, Panusupan, Cilongok, Banyumas, Jawa Tengah. 53162</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                <span>081 1263 0731</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0 text-emerald-500" />
                <span>ppdarsalcilongok@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-4 text-center text-[14px] text-gray-500 font-medium">
          <p>Pondok Pesantren Darussalam Panusupan &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}