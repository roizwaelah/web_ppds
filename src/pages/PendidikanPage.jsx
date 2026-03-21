import { PublicLayout } from "../components/PublicLayout";
import { useData } from "../contexts/DataContext";
import {
  Book,
  GraduationCap,
  Clock,
  Award,
  Users,
  Mic,
  Heart,
  PenTool,
  Dumbbell,
  Globe,
  Monitor,
  Video,
  BookOpen,
  Trophy,
} from "lucide-react";

const iconMap = {
  Pramuka: Users,
  "Pencak Silat (Pagar Nusa)": Dumbbell,
  "Hadroh & Sholawat": Mic,
  Kaligrafi: PenTool,
  Jurnalistik: Book,
  "Muhadhoroh (Public Speaking)": Mic,
  Kewirausahaan: Heart,
  "Bahasa Asing (Arab & Inggris)": Globe,
  // Tambahan ikon sesuai permintaan
  Volly: Trophy,
  Futsal: Trophy,
  Tilawah: BookOpen,
  Komputer: Monitor,
  Multimedia: Video,
};

export function PendidikanPage() {
  const { pendidikan, loading } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const formalEducation = (pendidikan?.formal || []).slice(0, 20);
  const nonFormalEducation = (pendidikan?.nonFormal || []).slice(0, 20);
  const extracurriculars = (pendidikan?.extracurriculars || []).map((name) => ({
    name,
    icon: iconMap[name] || Book,
  }));
  const schedule = (pendidikan?.schedule || []).slice(0, 30);

  return (
    <PublicLayout>
      {/* Container utama tanpa Header & Footer manual */}
      <div className="bg-gray-50 font-sans">
        {/* Hero Section */}
        <section className="bg-emerald-900 py-10 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Pendidikan</h1>
            <p className="text-emerald-300 max-w-2xl mx-auto">
              Seimbangkan dalam kecerdasan intelektual, emosional, dan spiritual.
            </p>
          </div>
        </section>

        {/* Pendidikan Formal */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <GraduationCap className="w-8 h-8 text-emerald-600" />
                Pendidikan Formal
              </h2>
              <div className="w-20 h-1 bg-emerald-600 mx-auto"></div>
            </div>

            {formalEducation.length === 0 ? (
              <p className="text-center text-gray-500">
                Belum ada data pendidikan formal.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {formalEducation.map((edu, index) => (
                  <div
                    key={edu.id || index}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="bg-emerald-600 p-4">
                      <h3 className="text-2xl font-bold text-white text-center">
                        {edu.level}
                      </h3>
                    </div>
                    <div className="p-8">
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {edu.desc}
                      </p>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Keunggulan:
                      </h4>
                      <ul className="space-y-2">
                        {(edu.features || []).map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Pendidikan Non-Formal */}
        <section className="py-16 bg-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <Book className="w-8 h-8 text-emerald-600" />
                Pendidikan Kepesantrenan
              </h2>
              <div className="w-20 h-1 bg-emerald-600 mx-auto"></div>
            </div>

            {nonFormalEducation.length === 0 ? (
              <p className="text-center text-gray-500">
                Belum ada data pendidikan kepesantrenan.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {nonFormalEducation.map((edu, index) => {
                  const methods = Array.isArray(edu.methods)
                    ? edu.methods
                    : Array.isArray(edu.programs)
                      ? edu.programs
                      : [];

                  return (
                  <div
                    key={edu.id || index}
                    className="bg-white rounded-lg p-8 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                        <Book className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {edu.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-6">{edu.desc}</p>
                    {/* ... (isi komponen lainnya tetap sama) */}
                    {edu.levels && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Jenjang:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {edu.levels.map((lvl, i) => (
                            <span
                              key={i}
                              className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {lvl}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(edu.subjects) && edu.subjects.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Mata Pelajaran:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {edu.subjects.map((subject, i) => (
                            <span
                              key={i}
                              className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {methods.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Metode Program:
                        </h4>
                        <ul className="space-y-2">
                          {methods.map((method, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-700">
                              <Award className="w-4 h-4 text-emerald-600" />
                              <span>{method}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Ekstrakurikuler */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <Users className="w-8 h-8 text-emerald-600" />
                Ekstrakurikuler
              </h2>
              <div className="w-20 h-1 bg-emerald-600 mx-auto"></div>
            </div>
            {/* Grid Ekstrakurikuler tetap sama */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {extracurriculars.map((ekstra, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-xl p-6 text-center hover:shadow-lg transition-all group"
                >
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-600 transition-colors">
                    <ekstra.icon className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {ekstra.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Jadwal Harian */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Kedisiplinan & Rutinitas
                </h2>
                <ul className="space-y-4">
                  {schedule.map((item, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <Clock className="w-6 h-6 text-emerald-400" />
                      <div>
                        <span className="block font-bold text-emerald-400">
                          {item.time}
                        </span>
                        <span className="text-sm text-gray-300">
                          {item.activity}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
