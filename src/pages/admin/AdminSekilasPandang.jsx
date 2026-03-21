import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, CheckCircle, Info, Layout, Eye } from 'lucide-react';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

export function AdminSekilasPandang() {
  const { sekilasPandang, updateSekilasPandang, loading } = useData();

  const defaultStats = [
    { label: 'Santri Aktif', value: '100+' },
    { label: 'Tahun Berdiri', value: '1990' },
    { label: 'Tenaga Pengajar', value: '30+' },
    { label: 'Luas Area', value: '1 Ha' },
  ];

  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  /* =============================
     Sync data dari context
  ============================== */
  useEffect(() => {
    if (!sekilasPandang) return;

    setForm({
      title: sekilasPandang.title ?? '',
      content: sekilasPandang.content ?? '',
      image: sekilasPandang.image ?? '',
      stats:
        Array.isArray(sekilasPandang.stats) &&
        sekilasPandang.stats.length > 0
          ? sekilasPandang.stats
          : defaultStats,
    });
  }, [sekilasPandang]);

  /* =============================
     Loading Guard
  ============================== */
  if (loading || !form) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 font-semibold">
        Memuat data Sekilas Pandang...
      </div>
    );
  }

  /* =============================
     Stats Handlers
  ============================== */

  const handleStatChange = (index, field, value) => {
    const updated = [...form.stats];
    updated[index][field] = value;
    setForm({ ...form, stats: updated });
  };

  const addStat = () => {
    setForm({
      ...form,
      stats: [...form.stats, { label: '', value: '' }],
    });
  };

  const removeStat = (index) => {
    const updated = form.stats.filter((_, i) => i !== index);
    setForm({ ...form, stats: updated });
  };

  /* =============================
     Save Handler
  ============================== */

  const handleSave = async () => {
    if (saving) return;

    if (!form.title.trim()) {
      alert('Judul tidak boleh kosong');
      return;
    }

    const cleanedStats = form.stats.filter(
      (s) => s.label.trim() && s.value.trim()
    );

    setSaving(true);

    try {
      await updateSekilasPandang({
        ...form,
        stats: cleanedStats,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <Layout className="text-emerald-600" size={19} />
            Sekilas Pandang
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Personalisasi narasi utama pondok pesantren
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saved || saving}
          className={`inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 ${
            saved || saving
              ? 'bg-emerald-100 text-emerald-600 cursor-default'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle size={14} /> Tersimpan
            </>
          ) : saving ? (
            <>
              <Save size={14} /> Menyimpan...
            </>
          ) : (
            <>
              <Save size={14} /> Simpan
            </>
          )}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3 flex items-center gap-1.5">
              <Eye size={11} /> Preview Gambar
            </h3>

            <ImageUpload
              label="Foto Utama Halaman"
              value={form.image}
              onChange={(url) =>
                setForm({ ...form, image: url })
              }
            />
          </div>

          <div className="bg-emerald-900 rounded-2xl p-4 text-emerald-50 shadow-lg shadow-emerald-900/20">
            <div className="flex items-center gap-1.5 mb-2">
              <Info size={14} className="text-emerald-400" />
              <h4 className="font-bold text-xs">Informasi Penulisan</h4>
            </div>
            <p className="text-[10px] leading-relaxed text-emerald-100/80 font-medium">
              Gunakan editor teks untuk menyusun narasi. Gunakan{' '}
              <strong>Tebal</strong> untuk penekanan dan bullet list untuk
              daftar sejarah atau fasilitas pesantren.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 space-y-6">
              {/* Title */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Judul Profil
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Contoh: Sejarah & Filosofi Kami"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 text-base"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Narasi Sekilas Pandang
                </label>
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <RichTextEditor
                    value={form.content}
                    onChange={(val) =>
                      setForm({ ...form, content: val })
                    }
                    placeholder="Tuliskan sejarah, visi umum, dan kehangatan pesantren..."
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Statistik Highlight
                  </label>

                  <button
                    type="button"
                    onClick={addStat}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    + Tambah
                  </button>
                </div>

                <div className="space-y-2">
                  {form.stats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl p-3"
                    >
                      <input
                        type="text"
                        placeholder="Label"
                        value={stat.label}
                        onChange={(e) =>
                          handleStatChange(index, 'label', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />

                      <input
                        type="text"
                        placeholder="Value"
                        value={stat.value}
                        onChange={(e) =>
                          handleStatChange(index, 'value', e.target.value)
                        }
                        className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />

                      <button
                        type="button"
                        onClick={() => removeStat(index)}
                        className="text-red-500 text-xs font-bold hover:text-red-600"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
              </span>
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}