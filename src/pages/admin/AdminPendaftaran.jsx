import { useState, useRef, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { 
  Save, CheckCircle, Plus, X, ExternalLink, 
  ClipboardList, Settings, FileText, Calendar, 
  Trash2, AlertCircle 
} from 'lucide-react';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

// Helper kecil untuk validasi URL
const isValidUrl = (url) => {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const getCookie = (name) => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : '';
};

export function AdminPendaftaran() {
  const { pendaftaran, updatePendaftaran } = useData();
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    isOpen: pendaftaran.isOpen,
    description: pendaftaran.description || '',
    descriptionExtra: pendaftaran.descriptionExtra || '',
    registrationUrl: pendaftaran.registrationUrl || '',
    brochureUrl: pendaftaran.brochureUrl || '',
    requirements: [...(pendaftaran.requirements || [])],
    waves: JSON.parse(JSON.stringify(pendaftaran.waves || [])),
  });

  useEffect(() => {
    setForm({
      isOpen: pendaftaran.isOpen,
      description: pendaftaran.description || '',
      descriptionExtra: pendaftaran.descriptionExtra || '',
      registrationUrl: pendaftaran.registrationUrl || '',
      brochureUrl: pendaftaran.brochureUrl || '',
      requirements: [...(pendaftaran.requirements || [])],
      waves: JSON.parse(JSON.stringify(pendaftaran.waves || [])),
    });
  }, [pendaftaran]);

  const [confirmDeleteReq, setConfirmDeleteReq] = useState({ open: false, index: -1 });
  const [confirmDeleteWave, setConfirmDeleteWave] = useState({ open: false, index: -1 });

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Silakan unggah file format PDF.');
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const csrfToken = getCookie('ppds_csrf');

      const response = await fetch('/api/upload.php', {
        method: 'POST',
        credentials: 'include',
        body: fd,
        ...(csrfToken ? { headers: { 'X-CSRF-Token': csrfToken } } : {}),
      });

      if (!response.ok) throw new Error('Upload gagal');
      const data = await response.json();

      if (data.url) {
        setForm(prev => ({ ...prev, brochureUrl: data.url }));
      } else {
        throw new Error('Upload gagal');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Gagal mengunggah file.');
    } finally {
      setUploading(false);
    }
  };
	
  const handleSave = () => {
    // Validasi URL Portal
    if (form.registrationUrl && !isValidUrl(form.registrationUrl)) {
      alert('URL portal tidak valid');
      return;
    }

    // Validasi URL Brosur (jika diinput manual atau hasil upload korup)
    if (form.brochureUrl && !isValidUrl(form.brochureUrl)) {
      alert('URL brosur tidak valid');
      return;
    }

    const payload = {
      ...form,
      requirements: form.requirements.filter((r) => r.trim() !== ''),
    };
    updatePendaftaran(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addRequirement = () => setForm({ ...form, requirements: [...form.requirements, ''] });
  const updateRequirement = (index, value) => {
    const updated = [...form.requirements];
    updated[index] = value;
    setForm({ ...form, requirements: updated });
  };
  const removeRequirement = (index) => setForm({ ...form, requirements: form.requirements.filter((_, i) => i !== index) });

  const addWave = () => setForm({ ...form, waves: [...form.waves, { name: '', period: '', active: false }] });
  const updateWave = (index, field, value) => {
    const updated = [...form.waves];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, waves: updated });
  };
  const removeWave = (index) => setForm({ ...form, waves: form.waves.filter((_, i) => i !== index) });

  return (
    <div className="max-w-[1366px] mx-auto pb-6 animate-in fade-in duration-500 px-1.5 sm:px-0">
      {/* Header - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sticky top-0 bg-slate-50/80 backdrop-blur-md z-20 py-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="text-emerald-600" />
            Sistem Pendaftaran
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">Konfigurasi alur penerimaan santri baru</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 w-full sm:w-auto ${
            saved ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-500' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
          }`}
        >
          {saved ? <><CheckCircle size={16} /> Tersimpan</> : <><Save size={16} /> Simpan Perubahan</>}
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Kolom Kiri */}
        <div className="lg:col-span-5 space-y-5">
          {/* Status Pendaftaran */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <h2 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
              <Settings className="w-4 h-4 text-slate-400" />
              Kontrol Utama
            </h2>
            <div className="space-y-4">
              <div className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer group ${form.isOpen ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}
                   onClick={() => setForm({ ...form, isOpen: !form.isOpen })}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${form.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-tight">Status Pendaftaran</p>
                      <p className="text-xs text-slate-500 font-medium">{form.isOpen ? 'Sedang Menerima Santri' : 'Pendaftaran Ditutup'}</p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors ${form.isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isOpen ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tautan Portal Online</label>
                <div className="flex flex-col sm:flex-row gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={form.registrationUrl}
                      onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })}
                      className="w-full pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium text-slate-700"
                      placeholder="https://psb.darussalampanusupan.com"
                    />
                  </div>
                  {form.registrationUrl && (
                    <a href={form.registrationUrl} target="_blank" rel="noopener noreferrer" 
                       className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Brosur Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Dokumen Brosur (PDF)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {form.brochureUrl ? (
                      <div className="flex-1 flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-emerald-900 truncate">Brosur_Terupload.pdf</p>
                            <a 
                              href={form.brochureUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[9px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                            >
                              Lihat Dokumen <ExternalLink size={8} />
                            </a>
                          </div>
                        </div>
                        <button 
                          onClick={() => setForm({ ...form, brochureUrl: '' })}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-white rounded-md transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={form.brochureUrl}
                          onChange={(e) => setForm({ ...form, brochureUrl: e.target.value })}
                          placeholder="Tempel link PDF brosur di sini..."
                          className="w-full pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium text-slate-700"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <span className="text-[9px] font-black text-slate-300 uppercase">Link Only</span>
                        </div>
                      </div>
                    )}
                    {!form.brochureUrl && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        <Plus size={14} /> {uploading ? 'Mengunggah...' : 'Upload'}
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                        // reset agar bisa pilih file yang sama dua kali
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5 ml-1 italic">
                    *File ini akan muncul sebagai tombol "Download Brosur" di halaman depan.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Deskripsi */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <h2 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-slate-400" />
              Narasi Informasi
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deskripsi Pembuka</label>
                <RichTextEditor
                  value={form.description}
                  onChange={(val) => setForm({ ...form, description: val })}
                  placeholder="Berikan sambutan pendaftaran..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Informasi Biaya/Lainnya</label>
                <RichTextEditor
                  value={form.descriptionExtra}
                  onChange={(val) => setForm({ ...form, descriptionExtra: val })}
                  placeholder="Detail tambahan (opsional)..."
                />
              </div>
            </div>
          </section>
        </div>

        {/* Kolom Kanan */}
        <div className="lg:col-span-7 space-y-5">
          {/* Gelombang Pendaftaran */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-slate-400" />
                Jadwal Gelombang
              </h2>
              <button onClick={addWave} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                <Plus size={13} /> Tambah Sesi
              </button>
            </div>
            <div className="space-y-3">
              {form.waves.map((wave, index) => (
                <div key={index} className={`grid grid-cols-1 sm:grid-cols-12 gap-2 p-3.5 rounded-xl border transition-all ${wave.active ? 'bg-white border-emerald-200 shadow-md shadow-emerald-500/5' : 'bg-slate-50 border-slate-100 opacity-80'}`}>
                  <div className="sm:col-span-4 space-y-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Nama Sesi</label>
                    <input
                      type="text"
                      value={wave.name}
                      onChange={(e) => updateWave(index, 'name', e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border-b border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold text-slate-800"
                      placeholder="Gelombang 1"
                    />
                  </div>
                  <div className="sm:col-span-5 space-y-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Periode Waktu</label>
                    <input
                      type="text"
                      value={wave.period}
                      onChange={(e) => updateWave(index, 'period', e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border-b border-slate-200 focus:border-emerald-500 outline-none text-xs font-medium text-slate-600"
                      placeholder="Mei - Juni 2024"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-center pt-3 sm:pt-0">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wave.active}
                        onChange={(e) => updateWave(index, 'active', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                      />
                      <span className="text-[9px] font-black uppercase text-slate-500">Aktif</span>
                    </label>
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end">
                    <button onClick={() => setConfirmDeleteWave({ open: true, index })} className="p-1.5 text-rose-300 hover:text-rose-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Persyaratan */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Persyaratan Dokumen</h2>
              <button onClick={addRequirement} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all">
                <Plus size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {form.requirements.map((req, index) => (
                <div key={index} className="group flex items-center gap-3 p-1.5 pl-3 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-200 hover:bg-white transition-all">
                  <span className="text-[10px] font-black text-slate-300">{String(index + 1).padStart(2, '0')}</span>
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    className="flex-1 bg-transparent py-1.5 outline-none font-medium text-slate-600 text-xs"
                    placeholder="Contoh: Fotocopy Ijazah terakhir dilegalisir"
                  />
                  <button onClick={() => setConfirmDeleteReq({ open: true, index })} className="p-1.5 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Dialog Konfirmasi */}
      <ConfirmDialog
        isOpen={confirmDeleteReq.open}
        onClose={() => setConfirmDeleteReq({ open: false, index: -1 })}
        onConfirm={() => removeRequirement(confirmDeleteReq.index)}
        title="Hapus Persyaratan"
        message="Item persyaratan ini akan dihapus dari daftar."
      />

      <ConfirmDialog
        isOpen={confirmDeleteWave.open}
        onClose={() => setConfirmDeleteWave({ open: false, index: -1 })}
        onConfirm={() => removeWave(confirmDeleteWave.index)}
        title="Hapus Gelombang"
        message="Informasi jadwal pendaftaran ini akan dihapus permanen."
      />
    </div>
  );
}
