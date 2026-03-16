import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 sm:px-12">
        <div className="text-center mb-16">
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">GET IN TOUCH</p>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 tracking-tight mt-2">Contact Us</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Have questions or want to partner with us? We&apos;d love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input type="text" placeholder="Nguyễn Văn A" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" placeholder="email@university.edu.vn" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea rows={4} placeholder="Your message..." className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50 resize-none" />
              </div>
              <Button className="w-full bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl h-12 font-bold">
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8 pt-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                <p className="text-gray-500 text-sm">support@vstepwriting.edu.vn</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
                <p className="text-gray-500 text-sm">+84 28 1234 5678</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Address</h3>
                <p className="text-gray-500 text-sm">Đại học FPT, Thủ Đức, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
