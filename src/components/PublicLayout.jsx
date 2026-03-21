import { Header } from './Header';
import { Footer } from './Footer';

export function PublicLayout({ children }) {
  return (
    <div 
      className="min-h-screen flex flex-col bg-gray-50"
      style={{ 
        zoom: "90%",
      }}
    >
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
