import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Seo } from './Seo';
import { getDefaultSeo } from '../utils/seo';

export function PublicLayout({ children, seo }) {
  const location = useLocation();
  const defaultSeo = getDefaultSeo(location.pathname);
  const resolvedSeo = seo || defaultSeo;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Seo {...resolvedSeo} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-emerald-700 focus:px-4 focus:py-3 focus:text-white focus:shadow-lg"
      >
        Lewati ke konten utama
      </a>
      <Header />
      <main id="main-content" tabIndex="-1" className="flex-1 w-full focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
