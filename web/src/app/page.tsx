import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Trophy, TrendingUp, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-vstep-gray to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-vstep-blue" />
            <span className="text-xl font-bold text-gray-900">VSTEP Writing Lab</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
              Testimonials
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-vstep-blue hover:bg-blue-700">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Master VSTEP Writing with{' '}
          <span className="text-vstep-blue">AI-Powered</span> Feedback
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Practice writing essays and get instant AI feedback tailored to VSTEP scoring criteria.
          Improve your score faster with personalized guidance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/register">
            <Button size="lg" className="bg-vstep-blue hover:bg-blue-700 text-lg px-8 py-6">
              Start Practicing Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span>4.9/5 from 2,000+ students</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-white rounded-3xl shadow-lg">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose VSTEP Writing Lab?
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to ace your VSTEP writing exam
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Brain className="h-12 w-12 text-vstep-blue" />}
            title="AI Scoring"
            description="Get instant, detailed feedback on your essays using advanced AI technology"
          />
          <FeatureCard
            icon={<TrendingUp className="h-12 w-12 text-vstep-green" />}
            title="Progress Tracking"
            description="Visualize your improvement over time with detailed analytics"
          />
          <FeatureCard
            icon={<BookOpen className="h-12 w-12 text-vstep-yellow" />}
            title="100+ Topics"
            description="Practice with diverse topics covering all VSTEP task types"
          />
          <FeatureCard
            icon={<Trophy className="h-12 w-12 text-purple-500" />}
            title="Gamified Learning"
            description="Earn XP, maintain streaks, and unlock achievements as you learn"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple 3-Step Process
          </h2>
          <p className="text-xl text-gray-600">
            Start improving your writing in minutes
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Choose Topic"
            description="Select from 100+ VSTEP practice topics across different task types"
          />
          <StepCard
            number="2"
            title="Write Essay"
            description="Write your essay with our clean editor under timed conditions"
          />
          <StepCard
            number="3"
            title="Get Feedback"
            description="Receive detailed AI scoring and feedback instantly"
          />
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container mx-auto px-4 py-20 bg-vstep-gray rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600">
            See what our students have achieved
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <TestimonialCard
            quote="Improved my score from 6.5 to 8.0 in just 4 weeks! The AI feedback is incredibly detailed and helpful."
            author="Nguyen Thi B"
            location="Hanoi University"
          />
          <TestimonialCard
            quote="The best platform for VSTEP writing practice. The gamification keeps me motivated every day!"
            author="Tran Van C"
            location="Ho Chi Minh City"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-vstep-blue to-blue-700 rounded-3xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Improve Your Writing?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students achieving their target VSTEP scores
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-4 text-sm opacity-75">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-vstep-blue" />
              <span className="font-semibold text-gray-900">VSTEP Writing Lab</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="#" className="hover:text-gray-900">Privacy Policy</Link>
              <Link href="#" className="hover:text-gray-900">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-900">Contact</Link>
            </div>
            <p className="text-sm text-gray-600 mt-4 md:mt-0">
              © 2026 VSTEP Writing Lab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 rounded-2xl hover:shadow-xl transition-shadow">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Step Card Component
function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 bg-vstep-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Testimonial Card Component
function TestimonialCard({
  quote,
  author,
  location,
}: {
  quote: string;
  author: string;
  location: string;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 text-lg mb-6">&quot;{quote}&quot;</p>
      <div>
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-gray-600 text-sm">{location}</p>
      </div>
    </div>
  );
}
