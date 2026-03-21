import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Public Pages
import { HomePage } from './pages/HomePage';
import { SekilasPandangPage } from './pages/SekilasPandangPage';
import { VisiMisiPage } from './pages/VisiMisiPage';
import { PengasuhPage } from './pages/PengasuhPage';
import { PendidikanPage } from './pages/PendidikanPage';
import { PojokSantriPage } from './pages/PojokSantriPage';
import { PojokSantriDetailPage } from './pages/PojokSantriDetailPage';
import { PengumumanPage } from './pages/PengumumanPage';
import { PengumumanDetailPage } from './pages/PengumumanDetailPage';
import { PendaftaranPage } from './pages/PendaftaranPage';

// Admin Pages
import { Login } from './pages/admin/Login';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSekilasPandang } from './pages/admin/AdminSekilasPandang';
import { AdminVisiMisi } from './pages/admin/AdminVisiMisi';
import { AdminPengasuh } from './pages/admin/AdminPengasuh';
import { AdminHeroSlides } from './pages/admin/AdminHeroSlides';
import { AdminPendidikan } from './pages/admin/AdminPendidikan';
import { AdminPojokSantri } from './pages/admin/AdminPojokSantri';
import { AdminPengumuman } from './pages/admin/AdminPengumuman';
import { AdminPendaftaran } from './pages/admin/AdminPendaftaran';
import { AdminUsers } from './pages/admin/AdminUsers';
import { Forbidden } from './pages/admin/Forbidden';

// 1. Tambahkan RequireGuest untuk memproteksi halaman login
function RequireGuest({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

// 2. Replace RequireAdmin dengan RequireLevel (Lebih Fleksibel)
function RequireLevel({ minLevel = 1, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if ((user.level ?? 0) < minLevel) {
    return <Navigate to="/admin/forbidden" replace />;
  }

  return children;
}

export function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/profil/sekilas-pandang" element={<SekilasPandangPage />} />
              <Route path="/profil/visi-misi" element={<VisiMisiPage />} />
              <Route path="/profil/pengasuh" element={<PengasuhPage />} />
              <Route path="/pendidikan" element={<PendidikanPage />} />
              <Route path="/pojok-santri" element={<PojokSantriPage />} />
              <Route path="/pojok-santri/:id" element={<PojokSantriDetailPage />} />
              <Route path="/pengumuman" element={<PengumumanPage />} />
              <Route path="/pengumuman/:id" element={<PengumumanDetailPage />} />
              <Route path="/pendaftaran" element={<PendaftaranPage />} />
              
              {/* 1. Update Route Login dengan RequireGuest */}
              <Route 
                path="/admin/login" 
                element={
                  <RequireGuest>
                    <Login />
                  </RequireGuest>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <RequireLevel minLevel={1}>
                    <AdminLayout />
                  </RequireLevel>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="hero-slides" element={<AdminHeroSlides />} />
                <Route path="profil/sekilas-pandang" element={<AdminSekilasPandang />} />
                <Route path="profil/visi-misi" element={<AdminVisiMisi />} />
                <Route path="profil/pengasuh" element={<AdminPengasuh />} />
                <Route path="pendidikan" element={<AdminPendidikan />} />
                <Route path="pojok-santri" element={<AdminPojokSantri />} />
                <Route path="pengumuman" element={<AdminPengumuman />} />
                <Route path="pendaftaran" element={<AdminPendaftaran />} />
                <Route path="/admin/forbidden" element={<Forbidden />} />
                {/* 3. Ganti Route Users dengan RequireLevel (Min Level 5 untuk Admin) */}
                <Route 
                  path="users" 
                  element={
                    <RequireLevel minLevel={10}>
                      <AdminUsers />
                    </RequireLevel>
                  } 
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
