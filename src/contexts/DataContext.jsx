import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import * as api from '../lib/api';

const DataContext = createContext(null);

/* ============================= */
/* ===== INITIAL STATE ========= */
/* ============================= */

const initialData = {
  heroSlides: [],
  sekilasPandang: { title: '', content: '', image: '', stats: [] },
  visiMisi: { visi: '', misi: [] },
  pengasuh: [],
  pendidikan: { formal: [], nonFormal: [], extracurriculars: [], schedule: [] },
  pojokSantri: [],
  pengumuman: [],
  pendaftaran: {
    isOpen: false,
    description: '',
    descriptionExtra: '',
    requirements: [],
    waves: [],
    registrationUrl: '',
    brochureUrl: ''
  },
};

/* ============================= */
/* ===== UTILITIES ============= */
/* ============================= */

const sanitizeRichText = (html = '') => {
  if (!html || typeof window === 'undefined') return html;

  const normalized = html
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/<p><br><\/p>/g, '')
    .trim();

  return DOMPurify.sanitize(normalized, {
    ALLOWED_TAGS: [
      'p','br','strong','em','u',
      'ol','ul','li',
      'h1','h2','h3',
      'blockquote','a','img'
    ],
    ALLOWED_ATTR: ['href','src','alt','title','class'],
    FORBID_TAGS: ['style','script','iframe','object','embed'],
    FORBID_ATTR: ['onerror','onclick','onload']
  });
};

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const safeObject = (obj, fallback = {}) =>
  obj && typeof obj === 'object' ? obj : fallback;

/* ============================= */
/* ===== PROVIDER ============== */
/* ============================= */

export function DataProvider({ children }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

  /* ============================= */
  /* ===== FETCH ALL DATA ======= */
  /* ============================= */

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        api.getHero(),
        api.getSekilasPandang(),
        api.getVisiMisi(),
        api.getPengasuh(),
        api.getPendidikan(),
        api.getArticles(1, 200, 'published'),
        api.getPengumuman(),
        api.getPendaftaran(),
      ]);

      const [
        heroSlides,
        sekilasPandang,
        visiMisi,
        pengasuh,
        pendidikan,
        pojokSantri,
        pengumuman,
        pendaftaran,
      ] = results.map(r => r.status === 'fulfilled' ? r.value : null);

      setData({
        heroSlides: normalizeArray(heroSlides),
        sekilasPandang: safeObject(sekilasPandang, initialData.sekilasPandang),
        visiMisi: safeObject(visiMisi, initialData.visiMisi),
        pengasuh: normalizeArray(pengasuh),
        pendidikan: safeObject(pendidikan, initialData.pendidikan),
        pojokSantri: normalizeArray(pojokSantri),
        pengumuman: normalizeArray(pengumuman),
        pendaftaran: safeObject(pendaftaran, initialData.pendaftaran),
      });

    } catch (err) {
      console.error('Fetch all failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ============================= */
  /* ===== GENERIC UPDATERS ===== */
  /* ============================= */

  const safeUpdate = (key, updater) => {
    setData(prev => ({ ...prev, [key]: updater }));
  };

  /* ============================= */
  /* ===== HERO SLIDES ========= */
  /* ============================= */

  const addHeroSlide = async (slide) => {
    const created = await api.createHeroSlide(slide);
    if (!created?.id) return fetchAll();
    setData(prev => ({ ...prev, heroSlides: [...prev.heroSlides, created] }));
  };

  const updateHeroSlide = async (id, updatedSlide) => {
    const updated = await api.updateHeroSlideApi(id, updatedSlide);
    if (!updated?.id) return fetchAll();
    setData(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.map(s => String(s.id) === String(id) ? updated : s)
    }));
  };

  const deleteHeroSlide = async (id) => {
    await api.deleteHeroSlideApi(id);
    setData(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.filter(s => String(s.id) !== String(id))
    }));
  };

  /* ============================= */
  /* ===== SEKILAS PANDANG ===== */
  /* ============================= */

  const updateSekilasPandang = async (payload) => {
    const cleaned = { ...payload, content: sanitizeRichText(payload.content) };
    try {
      const updated = await api.updateSekilasPandangApi(cleaned);
      setData(prev => ({
        ...prev,
        sekilasPandang: safeObject(updated, prev.sekilasPandang)
      }));
    } catch (err) {
      console.error(err);
      await fetchAll();
    }
  };

  /* ============================= */
  /* ===== VISI MISI ============ */
  /* ============================= */

  const updateVisiMisi = async (payload) => {
    const updated = await api.updateVisiMisiApi(payload);
    setData(prev => ({ ...prev, visiMisi: updated || prev.visiMisi }));
  };

  /* ============================= */
  /* ===== PENGASUH ============ */
  /* ============================= */

  const addPengasuh = async (payload) => {
    const created = await api.createPengasuh(payload);
    if (!created?.id) return fetchAll();
    setData(prev => ({ ...prev, pengasuh: [created, ...prev.pengasuh] }));
  };

  const updatePengasuh = async (id, payload) => {
    const updated = await api.updatePengasuhApi(id, payload);
    if (!updated?.id) return fetchAll();
    setData(prev => ({
      ...prev,
      pengasuh: prev.pengasuh.map(item => String(item.id) === String(id) ? updated : item)
    }));
  };

  const deletePengasuh = async (id) => {
    await api.deletePengasuhApi(id);
    setData(prev => ({
      ...prev,
      pengasuh: prev.pengasuh.filter(p => String(p.id) !== String(id))
    }));
  };

  /* ============================= */
  /* ===== PENDIDIKAN ========== */
  /* ============================= */

  const updatePendidikan = async (payload) => {
    const updated = await api.updatePendidikanApi(payload);
    setData(prev => ({ ...prev, pendidikan: updated || prev.pendidikan }));
  };

  /* ============================= */
  /* ===== POJOK SANTRI ======== */
  /* ============================= */

  const refreshPojokSantri = useCallback(async (status = 'published') => {
    const response = await api.getArticles(1, 200, status);
    const normalized = normalizeArray(response);
    setData(prev => ({ ...prev, pojokSantri: normalized }));
    return normalized;
  }, []);

  const addPojokSantri = async (article) => {
    const cleaned = { ...article, content: sanitizeRichText(article.content) };
    const created = await api.createPojokSantri(cleaned);
    if (!created?.id) return refreshPojokSantri('all');
    setData(prev => ({ ...prev, pojokSantri: [created, ...prev.pojokSantri] }));
  };

  const updatePojokSantri = async (id, payload) => {
    const cleaned = { ...payload, content: sanitizeRichText(payload.content) };
    const updated = await api.updatePojokSantriApi(id, cleaned);
    if (!updated?.id) return refreshPojokSantri('all');
    setData(prev => ({
      ...prev,
      pojokSantri: prev.pojokSantri.map(a => String(a.id) === String(id) ? updated : a)
    }));
  };

  const deletePojokSantri = async (id) => {
    await api.deletePojokSantriApi(id);
    setData(prev => ({
      ...prev,
      pojokSantri: prev.pojokSantri.filter(a => String(a.id) !== String(id))
    }));
  };

  /* ============================= */
  /* ===== PENGUMUMAN ========== */
  /* ============================= */

  const addPengumuman = async (item) => {
    const cleaned = { ...item, content: sanitizeRichText(item.content) };
    const created = await api.createPengumuman(cleaned);
    if (!created?.id) return fetchAll();
    setData(prev => ({ ...prev, pengumuman: [created, ...prev.pengumuman] }));
  };

  const updatePengumuman = async (id, payload) => {
    const cleaned = { ...payload, content: sanitizeRichText(payload.content) };
    const updated = await api.updatePengumumanApi(id, cleaned);
    if (!updated?.id) return fetchAll();
    setData(prev => ({
      ...prev,
      pengumuman: prev.pengumuman.map(a => String(a.id) === String(id) ? updated : a)
    }));
  };

  const deletePengumuman = async (id) => {
    await api.deletePengumumanApi(id);
    setData(prev => ({
      ...prev,
      pengumuman: prev.pengumuman.filter(a => String(a.id) !== String(id))
    }));
  };

  /* ============================= */
  /* ===== PENDAFTARAN ========= */
  /* ============================= */

  const updatePendaftaran = async (payload) => {
    const cleaned = {
      ...payload,
      description: sanitizeRichText(payload.description || ''),
      descriptionExtra: sanitizeRichText(payload.descriptionExtra || ''),
    };
    const updated = await api.updatePendaftaranApi(cleaned);
    setData(prev => ({ ...prev, pendaftaran: updated || prev.pendaftaran }));
  };

  return (
    <DataContext.Provider
      value={{
        ...data,
        loading,
        refresh: fetchAll,
        safeUpdate,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        updateSekilasPandang,
        updateVisiMisi,
        addPengasuh,
        updatePengasuh,
        deletePengasuh,
        updatePendidikan,
        refreshPojokSantri,
        addPojokSantri,
        updatePojokSantri,
        deletePojokSantri,
        addPengumuman,
        updatePengumuman,
        deletePengumuman,
        updatePendaftaran,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}