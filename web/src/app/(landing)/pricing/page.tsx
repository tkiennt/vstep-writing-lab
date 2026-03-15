import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANS = [
  {
    name: 'Free',
    price: '0đ',
    period: '/forever',
    description: 'Perfect for trying out the platform.',
    features: ['3 essays per month', 'Basic AI feedback', 'Limited vocabulary hints', 'Community support'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '49.000đ',
    period: '/month',
    description: 'For serious VSTEP learners.',
    features: ['Unlimited essays', 'Detailed band scoring', 'Full model essays access', 'AI Chatbot tutor', 'Progress analytics', 'Priority support'],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    name: 'Team',
    price: '199.000đ',
    period: '/month',
    description: 'For schools, teachers, and study groups.',
    features: ['Everything in Pro', 'Up to 30 students', 'Teacher dashboard', 'Custom topic management', 'Exam export tools', 'Dedicated support'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 sm:px-12">
        <div className="text-center mb-16">
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">PRICING</p>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 tracking-tight mt-2">Simple, transparent pricing</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Choose the plan that fits your learning goals. Upgrade or cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 flex flex-col ${
                plan.highlight
                  ? 'bg-vstep-dark text-white border-2 border-emerald-400 shadow-2xl shadow-emerald-900/20 relative'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-400 text-vstep-dark text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}
              <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.highlight ? 'text-emerald-200' : 'text-gray-500'}`}>{plan.description}</p>
              <div className="mb-6">
                <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? 'text-emerald-200' : 'text-gray-400'}`}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-emerald-100' : 'text-gray-600'}`}>
                    <Check className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full rounded-xl h-12 font-bold ${
                  plan.highlight
                    ? 'bg-white text-vstep-dark hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
