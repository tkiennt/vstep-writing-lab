import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 relative overflow-hidden">
      {/* Radial gradient decoration */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-400 rounded-full blur-[200px] opacity-10 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
           <div className="md:col-span-1">
             <Link href="/" className="flex items-center mb-4">
               <img src="/logo.png" alt="VSTEP Writing Logo" className="h-10 w-auto" />
             </Link>
             <p className="text-gray-400 text-sm">Advanced AI platform for VSTEP writing preparation. Made with precision.</p>
           </div>
           <div>
              <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Product</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                 <li><Link href="/practice-list" className="hover:text-emerald-600 transition-colors">Practice Library</Link></li>
                 <li><Link href="/features" className="hover:text-emerald-600 transition-colors">Features</Link></li>
                 <li><Link href="/pricing" className="hover:text-emerald-600 transition-colors">Pricing</Link></li>
              </ul>
           </div>
           <div>
              <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Company</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                 <li><Link href="/contact" className="hover:text-emerald-600 transition-colors">Contact</Link></li>
                 <li><Link href="/how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</Link></li>
                 <li><Link href="/target-bands" className="hover:text-emerald-600 transition-colors">Target Bands</Link></li>
              </ul>
           </div>
           <div>
              <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                 <li><Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                 <li><Link href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
                 <li><Link href="#" className="hover:text-emerald-600 transition-colors">User Guide</Link></li>
              </ul>
           </div>
        </div>
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 font-semibold gap-4">
           <p>© 2026 VSTEP Writing Lab. All rights reserved.</p>
           <p>Designed with Antigravity UI Standard.</p>
        </div>
      </div>
    </footer>
  );
}
