import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, CheckCircle, Plus, X, Target, ListChecks, Info } from 'lucide-react';

export function AdminVisiMisi() {
  const { visiMisi, updateVisiMisi } = useData();
  const [visi, setVisi] = useState(visiMisi.visi);
  const [misi, setMisi] = useState([...visiMisi.misi]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Sync when visiMisi updates from context (e.g., after reload)
  useEffect(() => {
    setVisi(visiMisi.visi || '');
    setMisi([...(visiMisi.misi || [])]);
  }, [visiMisi]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await updateVisiMisi({ visi, misi: misi.filter((m) => m.trim() !== '') });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan Visi & Misi.');
    } finally {
      setSaving(false);
    }
  };

  const MAX_MISI = 20;
  const addMisi = () => {
    if (misi.length >= MAX_MISI) return;
    setMisi([...misi, '']);
  };

  const removeMisi = (index) => setMisi(misi.filter((_, i) => i !== index));
  const updateMisi = (index, value) => {
    const updated = [...misi];
    updated[index] = value;
    setMisi(updated);
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header - Compact */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <Target className="text-emerald-600" size={19} />
            Visi & Misi
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Konfigurasi Tujuan Strategis Pesantren
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 ${
            saved 
              ? 'bg-emerald-100 text-emerald-600' 
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200 disabled:opacity-60 disabled:cursor-not-allowed'
          }`}
        >
          {saving ? <><Save size={14} /> Menyimpan...</> : saved ? <><CheckCircle size={14} /> Berhasil</> : <><Save size={14} /> Simpan</>}
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      {/* Main Grid: Visi (Kiri) & Misi (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Kolom Visi - Sticky on Desktop */}
        <div className="lg:col-span-5 lg:sticky lg:top-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                <Target size={16} />
              </div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Visi Pesantren</h2>
            </div>
            <textarea
              rows={4}
              value={visi}
              onChange={(e) => setVisi(e.target.value)}
              placeholder="Tuliskan visi utama di sini..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700 leading-relaxed resize-none"
            />
            <div className="mt-3 flex items-start gap-1.5 text-slate-400">
              <Info size={11} className="shrink-0 mt-0.5" />
              <p className="text-[9px] font-medium italic">Visi adalah tujuan jangka panjang. Usahakan singkat, padat, dan bermakna mendalam.</p>
            </div>
          </div>
        </div>

        {/* Kolom Misi - Scrollable */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                  <ListChecks size={16} />
                </div>
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Misi Pesantren</h2>
              </div>
              <button
                onClick={addMisi}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-emerald-600 text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
              >
                <Plus size={12} /> Tambah
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar">
              {misi.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Belum ada misi ditambahkan</p>
                </div>
              ) : (
                misi.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 group animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateMisi(index, e.target.value)}
                      placeholder={`Langkah misi ke-${index + 1}...`}
                      className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 text-xs shadow-sm"
                    />
                    <button
                      onClick={() => removeMisi(index)}
                      className="shrink-0 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Total: {misi.length} Point Misi
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
