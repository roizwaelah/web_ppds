import { PublicLayout } from "../components/PublicLayout";
import { useData } from "../contexts/DataContext";
import { PublicRichTextRenderer } from '../components/ui/PublicRichTextRenderer';
import {
  ExternalLink,
  CheckCircle,
  FileText,
  Calendar,
  Download,
  ArrowRight,
} from "lucide-react";

export function PendaftaranPage() {
  const { pendaftaran, loading } = useData();

  const safeUrl = (url) => {
    try {
      const parsed = new URL(url);
      if (['http:', 'https:'].includes(parsed.protocol)) {
        return url;
      }
    } catch {}
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat Informasi...</p>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout>
      <div className="font-sans">
        {/* Hero Section */}
        <section className="bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-900 py-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 bg-emerald-700/50 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 border border-emerald-500/30">
              Penerimaan Santri Baru (PSB)
            </span>
            <p className="text-emerald-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Pondok Pesantren Darussalam Panusupan membuka pintu bagi calon santri yang
              ingin menimba ilmu agama dan pengetahuan umum secara seimbang.
            </p>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-12 md:py-20 -mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Kolom Kiri: Detail Informasi (Span 8) */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                  <div className="p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <FileText size={24} />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                        Informasi Pendaftaran
                      </h2>
                    </div>

                    <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                      <PublicRichTextRenderer content={pendaftaran.description} />

                      {pendaftaran.descriptionExtra && (
                        <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-emerald-500">
                          <PublicRichTextRenderer content={pendaftaran.descriptionExtra} />
                        </div>
                      )}
                    </div>

                    {/* Persyaratan Grid */}
                    <div className="mt-12">
                      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <CheckCircle className="text-emerald-500 w-6 h-6" />
                        Persyaratan Umum
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(pendaftaran.requirements || []).slice(0, 50).map((req, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-colors"
                          >
                            <span className="shrink-0 w-6 h-6 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-slate-700 font-medium text-sm leading-snug">
                              {req}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Download Brosur */}
                {pendaftaran.brochureUrl && (
                  <div className="bg-emerald-600 rounded-4xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-900/10 transition-transform hover:scale-[1.01]">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <Download size={32} />
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-xl font-black">
                          Butuh Detail Lebih Lengkap?
                        </h3>
                      </div>
                    </div>
                    <a
                      href={safeUrl(pendaftaran.brochureUrl) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-white text-emerald-700 font-black rounded-2xl hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-lg"
                    >
                      Download Brosur
                      <Download size={18} />
                    </a>
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Sidebar Sticky (Span 4) */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                {/* Card Gelombang */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <Calendar className="text-emerald-600" />
                    Jadwal Gelombang
                  </h3>

                  <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {(pendaftaran.waves || []).slice(0, 10).map((wave, index) => (
                      <div key={index} className="relative pl-10">
                        <div
                          className={`absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 transition-colors ${wave.active ? "bg-emerald-500 scale-125" : "bg-slate-300"}`}
                        ></div>
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest mb-1 ${wave.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}
                          >
                            {wave.name} {wave.active && "• Aktif"}
                          </span>
                          <p
                            className={`font-bold leading-tight ${wave.active ? "text-slate-900" : "text-slate-400"}`}
                          >
                            {wave.period}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-8 border-t border-slate-50">
                    {!pendaftaran.isOpen ? (
                      <div className="text-center p-4 bg-rose-50 rounded-2xl border border-rose-100">
                        <p className="text-rose-600 font-bold text-sm">
                          Pendaftaran saat ini sedang ditutup.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-500 mb-6 text-center leading-relaxed">
                          Siap melangkah bersama kami? Mulai pendaftaran online
                          sekarang.
                        </p>
                        <a
                          href={safeUrl(pendaftaran.registrationUrl) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 w-full bg-emerald-600 text-white font-black py-5 px-6 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl transition-all group"
                        >
                          Daftar Sekarang
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Mini Info Card */}
                <div className="bg-slate-900 rounded-4xl p-8 text-white relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <CheckCircle size={120} />
                  </div>
                  <h4 className="text-lg font-bold mb-2 relative z-10">
                    Bantuan Pendaftaran?
                  </h4>
                  <p className="text-slate-400 text-sm mb-4 relative z-10 font-medium">
                    Hubungi sekretariat PSB kami di jam kerja untuk panduan
                    pengisian formulir.
                  </p>
                  <a 
                    href="https://wa.me/6285743487277/?text=Terima%20kasih%20telah%20menghubungi%2C%0AKami%20akan%20segera%20membalas%20pesan%20anda%20%F0%9F%99%8F" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <button className="cursor-pointer text-emerald-400 font-black text-sm hover:text-emerald-300 flex items-center gap-2 relative z-10">
                      Hubungi Admin <ExternalLink size={14} />
                    </button>
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
