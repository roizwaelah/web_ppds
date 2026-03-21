// API base dari env (default same-origin)
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  ? String(import.meta.env.VITE_API_BASE).replace(/\/$/, '')
  : '';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Ambil cookie by name
 */
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(^| )' + name + '=([^;]+)')
  );
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Global API fetch wrapper
 */
async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  const csrfToken =
    typeof window !== 'undefined'
      ? getCookie('ppds_csrf')
      : null;

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(!SAFE_METHODS.has(method) && csrfToken
      ? { 'X-CSRF-Token': csrfToken }
      : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';

  // 🔥 AUTO LOGOUT JIKA 401
  if (res.status === 401) {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    
    if (isAdminRoute) {
      localStorage.removeItem('ppds_user');
      window.location.href = '/admin/login';
    }

    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Request failed');
    } else {
      const text = await res.text();
      throw new Error(text || 'Request failed');
    }
  }

  if (contentType.includes('application/json')) {
    return res.json();
  }

  return null;
}

//
// =========================
// ===== PUBLIC API =======
// =========================
//

export const getHero = () =>
  apiFetch('/api/hero.php');

export const getArticles = (page = 1, limit = 6, status) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);
  return apiFetch(`/api/pojok_santri.php?${params}`);
};

export const getArticleById = (id) =>
  apiFetch(`/api/pojok_santri.php?id=${id}`);

export const getPengumuman = () =>
  apiFetch('/api/pengumuman.php');

export const getPengumumanById = (id) =>
  apiFetch(`/api/pengumuman.php?id=${id}`);

export const getSekilasPandang = () =>
  apiFetch('/api/sekilas_pandang.php');

export const getVisiMisi = () =>
  apiFetch('/api/visi_misi.php');

export const getPengasuh = () =>
  apiFetch('/api/pengasuh.php');

export const getPendidikan = () =>
  apiFetch('/api/pendidikan.php');

export const getPendaftaran = () =>
  apiFetch('/api/pendaftaran.php');

//
// =========================
// ===== ADMIN CRUD =======
// =========================
//

export const createHeroSlide = (payload) =>
  apiFetch('/api/hero.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateHeroSlideApi = (id, payload) =>
  apiFetch(`/api/hero.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteHeroSlideApi = (id) =>
  apiFetch(`/api/hero.php?id=${id}`, {
    method: 'DELETE',
  });

export const updateSekilasPandangApi = (payload) =>
  apiFetch('/api/sekilas_pandang.php', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const updateVisiMisiApi = (payload) =>
  apiFetch('/api/visi_misi.php', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const createPengasuh = (payload) =>
  apiFetch('/api/pengasuh.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updatePengasuhApi = (id, payload) =>
  apiFetch(`/api/pengasuh.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deletePengasuhApi = (id) =>
  apiFetch(`/api/pengasuh.php?id=${id}`, {
    method: 'DELETE',
  });

export const updatePendidikanApi = (payload) =>
  apiFetch('/api/pendidikan.php', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const createPojokSantri = (payload) =>
  apiFetch('/api/pojok_santri.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updatePojokSantriApi = (id, payload) =>
  apiFetch(`/api/pojok_santri.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deletePojokSantriApi = (id) =>
  apiFetch(`/api/pojok_santri.php?id=${id}`, {
    method: 'DELETE',
  });


export const getPojokSantriComments = ({ articleId, page = 1, limit = 20, status = 'approved' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (articleId) params.append('article_id', articleId);
  if (status) params.append('status', status);
  return apiFetch(`/api/pojok_santri_comments.php?${params.toString()}`);
};

export const createPojokSantriComment = (payload) =>
  apiFetch('/api/pojok_santri_comments.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updatePojokSantriCommentStatusApi = (id, payload) =>
  apiFetch(`/api/pojok_santri_comments.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deletePojokSantriCommentApi = (id) =>
  apiFetch(`/api/pojok_santri_comments.php?id=${id}`, {
    method: 'DELETE',
  });

export const createPengumuman = (payload) =>
  apiFetch('/api/pengumuman.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updatePengumumanApi = (id, payload) =>
  apiFetch(`/api/pengumuman.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deletePengumumanApi = (id) =>
  apiFetch(`/api/pengumuman.php?id=${id}`, {
    method: 'DELETE',
  });

export const updatePendaftaranApi = (payload) =>
  apiFetch('/api/pendaftaran.php', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });


export const getMediaLibrary = () =>
  apiFetch('/api/media.php');

export const deleteMediaApi = (filename) =>
  apiFetch('/api/media.php', {
    method: 'DELETE',
    body: JSON.stringify({ filename }),
  });

export const uploadMediaApi = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const csrfToken = typeof window !== 'undefined'
    ? getCookie('ppds_csrf')
    : null;

  const res = await fetch(`${API_BASE}/api/upload.php`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
  });

  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Upload gagal');
    }
    throw new Error('Upload gagal');
  }

  return res.json();
};

//
// =========================
// ===== AUTH ==============
// =========================
//

export const loginApi = (payload) =>
  apiFetch('/api/login.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const logoutApi = () =>
  apiFetch('/api/logout.php', {
    method: 'POST',
  });

//
// =========================
// ===== USERS ============
// =========================
//

export const getRoles = () =>
  apiFetch('/api/roles.php');

export const getUsers = () =>
  apiFetch('/api/users.php');

export const createUser = (payload) =>
  apiFetch('/api/users.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateUserApi = (id, payload) =>
  apiFetch(`/api/users.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteUserApi = (id) =>
  apiFetch(`/api/users.php?id=${id}`, {
    method: 'DELETE',
  });
