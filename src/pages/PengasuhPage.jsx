import { PublicLayout } from '../components/PublicLayout';
import { useData } from '../contexts/DataContext';

export function PengasuhPage() {
  const { pengasuh, loading } = useData();

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Memuat konten...</div>
      </PublicLayout>
    );
  }

  if (!pengasuh || pengasuh.length === 0) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Data Pengasuh Belum Tersedia</h2>
          <p className="text-gray-600">
            Silakan lengkapi profil pengasuh dari halaman admin agar tampil di sini.
          </p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Pengasuh & Pengajar</h1>
          <p className="text-emerald-200">Para ulama dan tenaga pendidik yang membimbing santri</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pengasuh.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-emerald-600 font-medium text-sm mb-3">{item.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{item.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
