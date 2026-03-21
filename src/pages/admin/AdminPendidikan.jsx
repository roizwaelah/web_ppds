import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, CheckCircle, Plus, X, GraduationCap, Book, Clock, Users, Trash2 } from 'lucide-react';

const cloneArray = (value) => JSON.parse(JSON.stringify(Array.isArray(value) ? value : []));

export function AdminPendidikan() {
  const { pendidikan, updatePendidikan } = useData();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState('formal');

  const [formal, setFormal] = useState(cloneArray(pendidikan?.formal));
  const [nonFormal, setNonFormal] = useState(cloneArray(pendidikan?.nonFormal));
  const [extracurriculars, setExtracurriculars] = useState(Array.isArray(pendidikan?.extracurriculars) ? [...pendidikan.extracurriculars] : []);
  const [schedule, setSchedule] = useState(cloneArray(pendidikan?.schedule));
  const [newEkstra, setNewEkstra] = useState('');

  // Sync state when pendidikan updates from context
  useEffect(() => {
    setFormal(cloneArray(pendidikan?.formal));
    setNonFormal(cloneArray(pendidikan?.nonFormal));
    setExtracurriculars(Array.isArray(pendidikan?.extracurriculars) ? [...pendidikan.extracurriculars] : []);
    setSchedule(cloneArray(pendidikan?.schedule));
  }, [pendidikan]);

  const handleSave = async () => {
    setSaveError('');

    try {
      await updatePendidikan({
        formal,
        nonFormal,
        extracurriculars: extracurriculars.filter((e) => e.trim() !== ''),
        schedule,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSaved(false);
      setSaveError(error?.message || 'Gagal menyimpan data pendidikan.');
    }
  };

  const updateFormalField = (index, field, value) => {
    const updated = [...formal];
    updated[index] = { ...updated[index], [field]: value };
    setFormal(updated);
  };

  const updateFormalFeature = (eduIndex, featureIndex, value) => {
    const updated = [...formal];
    updated[eduIndex].features[featureIndex] = value;
    setFormal(updated);
  };

  const addFormalFeature = (eduIndex) => {
    const updated = [...formal];
    updated[eduIndex].features.push('');
    setFormal(updated);
  };

  const removeFormalFeature = (eduIndex, featureIndex) => {
    const updated = [...formal];
    updated[eduIndex].features = updated[eduIndex].features.filter((_, i) => i !== featureIndex);
    setFormal(updated);
  };

  // ===== Non-Formal helpers =====
  const addSubject = (nfIndex) => {
    const updated = [...nonFormal];
    if (!updated[nfIndex].subjects) updated[nfIndex].subjects = [];
    updated[nfIndex].subjects.push('');
    setNonFormal(updated);
  };

  const updateSubject = (nfIndex, sIdx, value) => {
    const updated = [...nonFormal];
    if (!updated[nfIndex].subjects) updated[nfIndex].subjects = [];
    updated[nfIndex].subjects[sIdx] = value;
    setNonFormal(updated);
  };

  const removeSubject = (nfIndex, sIdx) => {
    const updated = [...nonFormal];
    updated[nfIndex].subjects = (updated[nfIndex].subjects || []).filter((_, i) => i !== sIdx);
    setNonFormal(updated);
  };

  // Support methods/programs for Tahfidzul Quran
  const getMethodKey = (nfIndex) => (nonFormal[nfIndex].methods ? 'methods' : (nonFormal[nfIndex].programs ? 'programs' : 'methods'));

  const addMethod = (nfIndex) => {
    const updated = [...nonFormal];
    const key = getMethodKey(nfIndex);
    if (!updated[nfIndex][key]) updated[nfIndex][key] = [];
    updated[nfIndex][key].push('');
    setNonFormal(updated);
  };

  const updateMethod = (nfIndex, mIdx, value) => {
    const updated = [...nonFormal];
    const key = getMethodKey(nfIndex);
    if (!updated[nfIndex][key]) updated[nfIndex][key] = [];
    updated[nfIndex][key][mIdx] = value;
    setNonFormal(updated);
  };

  const removeMethod = (nfIndex, mIdx) => {
    const updated = [...nonFormal];
    const key = getMethodKey(nfIndex);
    updated[nfIndex][key] = (updated[nfIndex][key] || []).filter((_, i) => i !== mIdx);
    setNonFormal(updated);
  };

  const addSchedule = () => {
    setSchedule([...schedule, { time: '', activity: '' }]);
  };

  const updateScheduleField = (index, field, value) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  const removeSchedule = (index) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: 'formal', label: 'Formal', icon: GraduationCap },
    { id: 'nonformal', label: 'Pesantren', icon: Book },
    { id: 'ekstra', label: 'Ekstra', icon: Users },
    { id: 'jadwal', label: 'Jadwal', icon: Clock },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Sticky Header - Compact */}
      <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md pt-1.5 pb-3 mb-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
			<h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
				<GraduationCap className="text-emerald-600" size={19} />
				Pendidikan
			</h1>
            <p className="text-xs text-gray-500">
				Konfigurasi kurikulum dan agenda harian
			</p>
          </div>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all active:scale-95"
          >
            {saved ? <><CheckCircle size={14} /> Tersimpan</> : <><Save size={14} /> Simpan</>}
          </button>
        </div>

        {/* Tabs - Compact */}
        <div className="flex gap-1.5 mt-4 overflow-x-auto pb-0.5 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-emerald-300'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {saveError && (
          <div className="mt-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            {saveError}
          </div>
        )}
      </div>

      <div className="pb-6">
        {/* Formal Section - Compact */}
        {activeTab === 'formal' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {formal.map((edu, eduIndex) => (
              <div key={edu.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                    <GraduationCap size={16} />
                  </div>
                  <input
                    type="text"
                    value={edu.level}
                    onChange={(e) => updateFormalField(eduIndex, 'level', e.target.value)}
                    className="text-sm font-bold text-gray-900 bg-transparent outline-none focus:text-emerald-600 transition-colors w-full"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 block">Deskripsi</label>
                    <textarea
                      rows={2}
                      value={edu.desc}
                      onChange={(e) => updateFormalField(eduIndex, 'desc', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 transition-all outline-none resize-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Keunggulan</label>
                      <button onClick={() => addFormalFeature(eduIndex)} className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <Plus size={10} /> Tambah
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {edu.features.map((feature, fIdx) => (
                        <div key={fIdx} className="group flex items-center gap-1.5">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFormalFeature(eduIndex, fIdx, e.target.value)}
                            className="flex-1 px-2.5 py-1 text-[11px] rounded-md border border-gray-200 focus:border-emerald-500 outline-none transition-all"
                          />
                          <button onClick={() => removeFormalFeature(eduIndex, fIdx)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Non-Formal Section - Compact */}
        {activeTab === 'nonformal' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {nonFormal.map((edu, idx) => (
              <div key={edu.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="mb-3">
                  <input
                    type="text"
                    value={edu.name}
                    onChange={(e) => {
                      const updated = [...nonFormal];
                      updated[idx].name = e.target.value;
                      setNonFormal(updated);
                    }}
                    className="text-sm font-bold text-gray-900 w-full mb-0.5 outline-none focus:text-emerald-600"
                  />
                  <textarea
                    rows={2}
                    value={edu.desc}
                    onChange={(e) => {
                      const updated = [...nonFormal];
                      updated[idx].desc = e.target.value;
                      setNonFormal(updated);
                    }}
                    className="w-full text-xs text-gray-500 bg-transparent border-none p-0 outline-none resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                  {edu.subjects && (
                    <div className="col-span-full">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400">Mata Pelajaran</label>
                        <button onClick={() => addSubject(idx)} className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <Plus size={10} /> Tambah
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {edu.subjects.map((subj, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100">
                            <input
                              value={subj}
                              onChange={(e) => updateSubject(idx, sIdx, e.target.value)}
                              className="bg-transparent outline-none w-24"
                            />
                            <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => removeSubject(idx, sIdx)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metode Tahfidzul Quran - dukung 'methods' baru atau fallback 'programs' */}
                  {(edu.methods || edu.programs) && (
                    <div className="col-span-full">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400">Metode</label>
                        <button onClick={() => addMethod(idx)} className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <Plus size={10} /> Tambah
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {(edu.methods || edu.programs).map((m, mIdx) => (
                          <div key={mIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={m}
                              onChange={(e) => updateMethod(idx, mIdx, e.target.value)}
                              className="flex-1 px-2.5 py-1 text-[11px] rounded-md border border-gray-200 focus:border-emerald-500 outline-none transition-all"
                            />
                            <button onClick={() => removeMethod(idx, mIdx)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ekstrakurikuler Section - Compact */}
        {activeTab === 'ekstra' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm max-w-2xl">
            <div className="p-3.5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">List Ekstrakurikuler</h3>
            </div>
            <div className="p-3.5 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {extracurriculars.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5 group animate-in fade-in">
                    <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg transition-all group-hover:border-emerald-200 group-hover:bg-white">
                      <span className="text-[9px] font-black text-emerald-500">{index + 1}</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...extracurriculars];
                          updated[index] = e.target.value;
                          setExtracurriculars(updated);
                        }}
                        className="flex-1 bg-transparent outline-none text-xs font-medium"
                      />
                    </div>
                    <button onClick={() => setExtracurriculars(extracurriculars.filter((_, i) => i !== index))} className="p-1.5 text-gray-300 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-1.5">
                <input
                  type="text"
                  value={newEkstra}
                  onChange={(e) => setNewEkstra(e.target.value)}
                  placeholder="Input nama ekskul..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-emerald-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && newEkstra.trim() && (setExtracurriculars([...extracurriculars, newEkstra.trim()]), setNewEkstra(''))}
                />
                <button
                  onClick={() => newEkstra.trim() && (setExtracurriculars([...extracurriculars, newEkstra.trim()]), setNewEkstra(''))}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jadwal Section - Compact */}
        {activeTab === 'jadwal' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm max-w-3xl">
            <div className="p-3.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Agenda Harian Santri</h3>
              <button onClick={addSchedule} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-all">
                <Plus size={11} /> Baris
              </button>
            </div>
            <div className="p-3.5 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-[9px] font-black text-gray-400 uppercase tracking-widest pb-2 px-1.5">Waktu</th>
                    <th className="text-left text-[9px] font-black text-gray-400 uppercase tracking-widest pb-2 px-1.5">Aktivitas</th>
                    <th className="w-8 pb-2"></th>
                  </tr>
                </thead>
                <tbody className="space-y-1.5">
                  {schedule.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="py-1.5 px-1.5">
                        <input
                          type="text"
                          value={item.time}
                          onChange={(e) => updateScheduleField(index, 'time', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-transparent rounded-md text-xs focus:bg-white focus:border-emerald-200 transition-all outline-none"
                          placeholder="00.00"
                        />
                      </td>
                      <td className="py-1.5 px-1.5">
                        <input
                          type="text"
                          value={item.activity}
                          onChange={(e) => updateScheduleField(index, 'activity', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-transparent rounded-md text-xs focus:bg-white focus:border-emerald-200 transition-all outline-none"
                          placeholder="Nama kegiatan..."
                        />
                      </td>
                      <td className="py-1.5 px-1.5">
                        <button onClick={() => removeSchedule(index)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
