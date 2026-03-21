export function getAdminAccess(level = 0) {
  const normalizedLevel = Number(level) || 0;

  return {
    level: normalizedLevel,
    isEditor: normalizedLevel >= 1,
    isAdmin: normalizedLevel >= 5,
    isSuperAdmin: normalizedLevel >= 10,
    canAccessDashboard: normalizedLevel >= 1,
    canAccessMedia: normalizedLevel >= 1,
    canManageMedia: normalizedLevel >= 5,
    canAccessHeroSlides: normalizedLevel >= 5,
    canAccessProfile: normalizedLevel >= 5,
    canAccessPendidikan: normalizedLevel >= 5,
    canAccessPojokSantri: normalizedLevel >= 1,
    canAccessPengumuman: normalizedLevel >= 1,
    canAccessPendaftaran: normalizedLevel >= 5,
    canAccessUsers: normalizedLevel >= 10,
  };
}
