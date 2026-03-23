import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import { PublicLayout } from "../components/PublicLayout";
import { Hero } from "../components/Hero";
import { Pengumuman } from "../components/Pengumuman";
import { getArticles } from "../lib/api";
import { useData } from "../contexts/DataContext";
import { stripHTML } from "../utils/text";
import { getPojokSantriPath } from "../utils/slugs";

const FALLBACK_IMAGE = "/images/placeholder.svg";

function toSafeImage(url) {
  if (!url) return FALLBACK_IMAGE;
  const normalized = String(url).trim();
  if (!normalized) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(normalized)) return FALLBACK_IMAGE;
  if (normalized.startsWith("/uploads/")) return normalized;
  if (normalized.startsWith("uploads/")) return `/${normalized}`;
  if (!normalized.includes("/")) return `/uploads/${normalized}`;
  if (normalized.startsWith("/")) return normalized;
  return FALLBACK_IMAGE;
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshPengumuman } = useData();

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesRes] = await Promise.all([
          getArticles(1, 6),
          refreshPengumuman().catch(() => null),
        ]);
        setArticles(articlesRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [refreshPengumuman]);

  useEffect(() => {
    const refreshNow = () => {
      refreshPengumuman().catch(() => {});
    };

    const intervalId = window.setInterval(refreshNow, 30000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshNow();
      }
    };

    window.addEventListener("focus", refreshNow);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshNow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refreshPengumuman]);

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
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-4xl font-black text-slate-900">
                Berita <span className="text-emerald-600">Terbaru</span>
              </h2>
              <p className="mt-2 text-slate-600">
                Tulisan dan cerita terbaru dari para santri.
              </p>
            </div>
            <Link
              to="/pojok-santri"
              className="text-emerald-700 font-semibold hover:text-emerald-800 inline-flex items-center gap-2"
            >
              Lihat Semua <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              {articles[0] ? (
                <Link
                  to={getPojokSantriPath(articles[0])}
                  className="relative block rounded-2xl overflow-hidden min-h-[360px] md:min-h-[470px] group"
                >
                  <img
                    src={toSafeImage(articles[0].image)}
                    alt={articles[0].title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute left-5 right-5 bottom-5">
                    <span className="inline-block bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wide">
                      Sorotan
                    </span>
                    <h3 className="mt-3 text-white text-2xl md:text-[2.1rem] leading-tight font-extrabold group-hover:text-emerald-200 transition-colors">
                      {articles[0].title}
                    </h3>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl bg-white border border-slate-200 min-h-[360px] flex items-center justify-center text-slate-500">
                  Belum ada berita.
                </div>
              )}
            </div>

            <div className="lg:col-span-5 space-y-4">
              {articles.slice(1, 5).map((item) => (
                <Link
                  key={item.id}
                  to={getPojokSantriPath(item)}
                  className="flex gap-4 p-3 rounded-xl hover:bg-white/70 transition-colors"
                >
                  <img
                    src={toSafeImage(item.image)}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="w-40 h-24 object-cover rounded-lg shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xl font-bold text-slate-900 line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                      {stripHTML(item.content || "").slice(0, 90)}...
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <User size={12} /> {item.author || "Admin"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(item.date || item.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
