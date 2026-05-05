import { Link } from "react-router-dom";
import { useEffect } from "react";
import { PublicLayout } from "../components/PublicLayout"; // Pastikan path benar
import { useData } from "../contexts/DataContext";
import { ArrowRight, Calendar, AlertCircle } from "lucide-react";
import { getPengumumanPath } from "../utils/slugs";

const stripHtml = (html = "") =>
  String(html)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const extractFirstImage = (html = "") => {
  const content = String(html);
  const decoded = content.replace(/\\(["'])/g, "$1");
  const match = decoded.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1]?.trim() || "";
};

const toAbsoluteImage = (src = "") => {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/")) return src;
  if (src.startsWith("uploads/")) return `/${src}`;
  return "";
};

export function PengumumanPage() {
  const { pengumuman, refreshPengumuman } = useData();

  useEffect(() => {
    const refreshNow = () => {
      refreshPengumuman().catch(() => {});
    };

    refreshNow();

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

  // Loading state yang disesuaikan
  if (!pengumuman) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
          Memuat konten...
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gray-50 font-sans">
        {/* Hero Section */}
        <section className="bg-emerald-900 py-10 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Pengumuman</h1>
            <p className="text-emerald-300 max-w-2xl mx-auto">
              Informasi dan pengumuman resmi Pondok Pesantren Darussalam
            </p>
          </div>
        </section>

        {/* List Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {pengumuman.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Belum ada pengumuman.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pengumuman.map((item) => (
                  <Link
                    key={item.id}
                    to={getPengumumanPath(item)}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group flex flex-col"
                  >
                    <div
                      className={`h-2 ${item.important ? "bg-red-500" : "bg-emerald-500"}`}
                    />
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {new Date(item.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        {item.important && (
                          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            <AlertCircle size={12} />
                            Penting
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-3 line-clamp-2">
                        {item.title}
                      </h3>
                      {(() => {
                        const imageSrc = toAbsoluteImage(extractFirstImage(item.content || ""));
                        const summary = stripHtml(item.content || "");
                        return (
                          <div className="flex-1 min-h-0">
                            {imageSrc && (
                              <div className="mb-3 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                <img
                                  src={imageSrc}
                                  alt={item.title}
                                  className="w-full h-44 object-cover"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <p className="text-gray-500 text-sm leading-6 line-clamp-4">
                              {summary || "Klik untuk membaca selengkapnya."}
                            </p>
                          </div>
                        );
                      })()}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1 text-emerald-600 text-sm font-medium group-hover:gap-2 transition-all">
                        Baca Selengkapnya <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
