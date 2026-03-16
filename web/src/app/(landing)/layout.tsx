import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-200">
      <LandingNavbar />
      <main className="min-h-[70vh] w-full pt-16">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
