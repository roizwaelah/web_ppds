import { useEffect, useState } from "react";
import { PublicLayout } from "../components/PublicLayout";
import { Hero } from "../components/Hero";
import { PojokSantri } from "../components/PojokSantri";
import { Pengumuman } from "../components/Pengumuman";
import { getArticles } from "../lib/api";

export function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getArticles(1, 6);
        setArticles(res.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  return (
    <PublicLayout>
      {/* Konten di sini otomatis akan berukuran 90% mengikuti PublicLayout */}
      <Hero />
      <Pengumuman />
      <PojokSantri articles={articles} />
    </PublicLayout>
  );
}
