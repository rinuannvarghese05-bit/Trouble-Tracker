import React, { useState, useEffect } from 'react';
import { ArrowRight, UserCog, Users } from 'lucide-react';

export default function Landing() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      setScrollProgress(scrollPercent);
      setIsHeaderScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 z-50 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Header */}
      <header 
        className={`sticky top-0 z-40 bg-white transition-all duration-300 ${
          isHeaderScrolled ? 'py-3 shadow-lg' : 'py-4 shadow-sm'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="#" className="flex items-center gap-3 no-underline hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/25 hover:rotate-6 transition-transform overflow-hidden">
              <img src="/assests/images/hostellogo.png" alt="Logo" className="w-10 h-auto" />
            </div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Trouble Trackers
            </span>
          </a>
          <ul className="hidden md:flex gap-8 list-none items-center m-0">
            <li>
              <button 
                onClick={() => scrollToSection('process')}
                className="text-gray-600 font-medium text-sm hover:text-purple-600 transition-colors relative group border-none bg-transparent cursor-pointer"
              >
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300" />
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 font-medium text-sm hover:text-purple-600 transition-colors relative group border-none bg-transparent cursor-pointer"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300" />
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('portals')}
                className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm border-none cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-600/50 transition-all duration-200"
              >
                Get Started
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700" />
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/30 via-purple-500/30 to-indigo-500/30 animate-gradient-shift" />
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-600/20 via-transparent to-purple-600/20" />
        
        {/* Floating Shapes with Gradient */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-white/20 to-pink-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-12 w-48 h-48 bg-gradient-to-br from-blue-300/20 to-white/20 rounded-full blur-2xl animate-float-delayed" />
        <div className="absolute top-2/5 right-1/5 w-36 h-36 bg-gradient-to-br from-purple-300/20 to-white/20 rounded-full blur-xl animate-float-more-delayed" />
        
        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-white">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
              Making hostel life easier, one complaint at a time
            </h1>
            <p className="text-lg mb-9 opacity-95 leading-relaxed">
              Track issues, collaborate with your hostel community, and get things fixed faster. Built for students and administrators who care about better living.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button 
                onClick={() => scrollToSection('process')}
                className="bg-transparent text-white px-8 py-3.5 rounded-xl font-semibold text-base border-2 border-white/50 cursor-pointer hover:bg-white/10 hover:border-white transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="relative w-full max-w-md">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400/40 via-purple-400/40 to-indigo-400/40 rounded-2xl blur-2xl animate-pulse" />
              <div className="relative w-full aspect-square bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 flex items-center justify-center animate-float overflow-hidden p-8 shadow-2xl">
                <img src="/assests/images/hostelpic.png" alt="Hostel" className="w-4/5 h-auto drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Portal Section */}
      <section id="portals" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Choose Your Portal
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the login that matches your role in the hostel community
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Admin Card */}
          <a
            href="/admin-login"
            className="group bg-white border-2 border-gray-200 rounded-2xl p-11 transition-all duration-500 hover:border-purple-600 hover:shadow-2xl hover:shadow-purple-600/20 hover:-translate-y-2 relative overflow-hidden no-underline"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center text-4xl mb-7 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                👤
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Admin & Staff
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Access the dashboard to manage complaints, track resolution metrics, send announcements, and keep everything running smoothly.
              </p>
              <button className="w-full bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl font-semibold text-base border-none cursor-pointer group-hover:from-purple-700 group-hover:to-purple-800 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-purple-600/40 transition-all duration-300 flex items-center justify-center gap-2">
                Admin Login <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </a>

          {/* Student Card */}
          <a
            href="/student-login"
            className="group bg-white border-2 border-gray-200 rounded-2xl p-11 transition-all duration-500 hover:border-green-600 hover:shadow-2xl hover:shadow-green-600/20 hover:-translate-y-2 relative overflow-hidden no-underline"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center text-4xl mb-7 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                🎓
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Student Portal
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Report new issues, check the status of your complaints, upvote community concerns, and stay updated on resolutions.
              </p>
              <button className="w-full bg-gradient-to-br from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold text-base border-none cursor-pointer group-hover:from-green-700 group-hover:to-green-800 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-green-600/40 transition-all duration-300 flex items-center justify-center gap-2">
                Student Login <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </a>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="process" className="py-20 px-6 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A simple three-step process from problem to solution
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {[
            { num: '1', title: 'Submit', desc: 'Students report issues through the portal with details and optional photos' },
            { num: '2', title: 'Track', desc: 'Admins assign complaints to staff and update progress in real-time' },
            { num: '3', title: 'Resolve', desc: 'Once fixed, students receive notifications and can confirm resolution' }
          ].map((step, i) => (
            <div key={i} className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-9 text-center transition-all duration-300 hover:border-purple-200 hover:bg-white hover:shadow-xl hover:shadow-purple-600/15 hover:-translate-y-1.5">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-lg shadow-purple-600/30">
                {step.num}
              </div>
              <h4 className="text-2xl font-semibold text-gray-900 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {step.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Features That Matter
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage hostel operations effectively
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-20">
          {[
            { 
              title: 'Quick Reporting', 
              image: '/assests/images/quickresponding.png',
              features: [
                'Submit complaints in seconds with our streamlined interface',
                'Add photos and detailed descriptions to your reports',
                'Track your complaint status in real-time'
              ]
            },
            { 
              title: 'Smart Notifications', 
              image: '/assests/images/smartnotification.png',
              features: [
                'Get updates via email or SMS when status changes',
                'Receive real-time alerts for urgent issues',
                'Stay informed about resolution progress'
              ],
              reverse: true
            },
            { 
              title: 'Analytics Dashboard', 
              image: '/assests/images/analyticsdashboard.png',
              features: [
                'Track trends, response times, and common issues',
                'Generate detailed reports for management',
                'Monitor team performance and efficiency'
              ]
            },
            { 
              title: 'Community Voting', 
              image: '/assests/images/communityvoting.png',
              features: [
                'Upvote important issues to help prioritize fixes',
                'See what matters most to your hostel community',
                'Collaborate on solutions that benefit everyone'
              ],
              reverse: true
            },
            { 
              title: 'Secure Platform', 
              image: '/assests/images/secureplatform.png',
              features: [
                'Your data is protected with industry-standard security',
                'Encrypted communications for privacy',
                'Role-based access control for different user types'
              ]
            },
            { 
              title: 'Mobile Ready', 
              image: '/assests/images/mobileready.png',
              features: [
                'Works perfectly on phones, tablets, and computers',
                'Access your complaints from anywhere, anytime',
                'Responsive design for seamless experience'
              ],
              reverse: true
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className={`grid md:grid-cols-2 gap-20 items-center ${feature.reverse ? 'md:flex-row-reverse' : ''}`}
              style={feature.reverse ? { direction: 'rtl' } : {}}
            >
              <div style={{ direction: 'ltr' }} className="w-full max-w-lg mx-auto">
                <div className="w-full rounded-2xl overflow-hidden shadow-lg">
                  <img src={feature.image} alt={feature.title} className="w-full h-auto" />
                </div>
              </div>
              <div style={{ direction: 'ltr' }}>
                <h3 className="text-3xl font-bold text-gray-900 mb-5 border-b-4 border-orange-500 inline-block pb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {feature.title}
                </h3>
                <ul className="space-y-4 list-none p-0">
                  {feature.features.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-700 leading-relaxed">
                      <span className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full text-sm font-bold flex-shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer - Simplified */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/assests/images/hostellogo.png" alt="Logo" className="w-10 h-auto" />
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Trouble Trackers
            </span>
          </div>
          <p className="text-sm mt-6 opacity-70">Built by students, for students</p>
          <p className="text-sm mt-5 opacity-70">© {new Date().getFullYear()} Trouble Trackers. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-30px) translateX(20px); }
          66% { transform: translateY(20px) translateX(-20px); }
        }
        @keyframes gradient-shift {
          0%, 100% { transform: translateX(0%) translateY(0%); opacity: 0.6; }
          50% { transform: translateX(10%) translateY(10%); opacity: 0.8; }
        }
        .animate-float {
          animation: float 20s infinite ease-in-out;
        }
        .animate-float-delayed {
          animation: float 20s infinite ease-in-out 3s;
        }
        .animate-float-more-delayed {
          animation: float 20s infinite ease-in-out 6s;
        }
        .animate-gradient-shift {
          animation: gradient-shift 15s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}