import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Trophy, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-vstep-primary-50 to-vstep-secondary-50">
      {/* Navigation */}
      <nav className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-vstep-primary-600">VSTEP Writing Lab</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <button className="btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-vstep-gray-900 mb-6 animate-fade-in">
            Master VSTEP Writing with
            <span className="text-vstep-primary-500"> AI-Powered</span> Practice
          </h1>
          <p className="text-xl text-vstep-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
            Improve your English writing skills with personalized feedback, instant scoring, and targeted practice for VSTEP B1, B2, and C1 levels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-bounce-subtle">
            <Link href="/register" className="btn-primary flex items-center justify-center">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/practice" className="btn-secondary">
              Try Practice
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-vstep-gray-900 mb-4">Why Choose VSTEP Writing Lab?</h2>
            <p className="text-lg text-vstep-gray-600">Everything you need to excel in your VSTEP writing exam</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="dashboard-card text-center card-hover">
              <div className="bg-vstep-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-vstep-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-vstep-gray-900 mb-2">AI-Powered Feedback</h3>
              <p className="text-vstep-gray-600">Get instant, detailed feedback on your writing with AI analysis of grammar, vocabulary, and structure.</p>
            </div>
            <div className="dashboard-card text-center card-hover">
              <div className="bg-vstep-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-vstep-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-vstep-gray-900 mb-2">VSTEP-Specific Practice</h3>
              <p className="text-vstep-gray-600">Practice with topics and formats that match the actual VSTEP exam for B1, B2, and C1 levels.</p>
            </div>
            <div className="dashboard-card text-center card-hover">
              <div className="bg-vstep-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-vstep-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-vstep-gray-900 mb-2">Track Your Progress</h3>
              <p className="text-vstep-gray-600">Monitor your improvement with detailed analytics, scores, and personalized recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-vstep-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-vstep-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-vstep-gray-600">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-vstep-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold text-vstep-gray-900 mb-2">Choose Your Level</h3>
              <p className="text-vstep-gray-600">Select your VSTEP target level (B1, B2, or C1) and get personalized practice topics.</p>
            </div>
            <div className="text-center">
              <div className="bg-vstep-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold text-vstep-gray-900 mb-2">Write & Practice</h3>
              <p className="text-vstep-gray-600">Complete timed writing exercises with real exam conditions and instant feedback.</p>
            </div>
            <div className="text-center">
              <div className="bg-vstep-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold text-vstep-gray-900 mb-2">Review & Improve</h3>
              <p className="text-vstep-gray-600">Analyze your performance, learn from mistakes, and track your progress over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-vstep-primary-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-vstep-primary-100" />
          <h2 className="text-3xl font-bold mb-4">Ready to Ace Your VSTEP Writing?</h2>
          <p className="text-xl mb-8 text-vstep-primary-100">Join thousands of students who have improved their writing scores with VSTEP Writing Lab.</p>
          <Link href="/register" className="bg-white text-vstep-primary-600 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-vstep-gray-50 inline-flex items-center shadow-button hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-vstep-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">VSTEP Writing Lab</h3>
            <p className="text-vstep-gray-400 mb-6">Empowering students to excel in VSTEP writing examinations through AI-powered practice and feedback.</p>
            <div className="flex justify-center space-x-6">
              <Link href="/about" className="text-vstep-gray-400 hover:text-white transition-colors duration-200">About</Link>
              <Link href="/contact" className="text-vstep-gray-400 hover:text-white transition-colors duration-200">Contact</Link>
              <Link href="/privacy" className="text-vstep-gray-400 hover:text-white transition-colors duration-200">Privacy</Link>
              <Link href="/terms" className="text-vstep-gray-400 hover:text-white transition-colors duration-200">Terms</Link>
            </div>
            <div className="mt-8 pt-8 border-t border-vstep-gray-800 text-center text-vstep-gray-400">
              <p>&copy; 2024 VSTEP Writing Lab. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
