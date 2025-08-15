'use client';

// React and Next.js imports
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from "next/image";

// Theme and UI component imports
import { useTheme } from "next-themes";
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch"; 

// Icon imports from lucide-react
import { 
    Briefcase, ClipboardList, Users, CheckCircle, ArrowRight, BarChart2, ShieldCheck, Clock, 
    Calendar, Settings, Mail, Moon, SunMedium, ArrowUp, Star, ChevronDown, Twitter, Linkedin, Github,
    Menu, X, Zap, TrendingUp, Award, Globe
} from 'lucide-react';

// Animation imports from GSAP
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'; // FIX: Import ScrollToPlugin
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin); // FIX: Register ScrollToPlugin

// Main Landing Page Component
export default function LandingPage() {
    const container = useRef<HTMLDivElement>(null);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // GSAP Animations Hook
    useGSAP(() => {
        const tl = gsap.timeline({ delay: 0.2 });
        
        tl.from('.navbar-container', { y: -100, opacity: 0, duration: 1, ease: 'power3.out' })
          .from('.navbar-item', { y: -30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '-=0.5');
        
        tl.from('.hero-badge', { scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.3')
          .from('.hero-title', { y: 50, opacity: 0, duration: 1.2, ease: 'power3.out' }, '-=0.5')
          .from('.hero-subtitle', { y: 30, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.8')
          .from('.hero-buttons', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
          .from('.hero-stats-container .hero-stat', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '-=0.4');
        
        tl.from('.hero-image', { y: 100, opacity: 0, scale: 0.8, duration: 1.5, ease: 'power3.out' }, '-=1')
          .to('.hero-image', { y: -20, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });

        gsap.to('.floating-particle', {
            y: (i) => -20 + Math.random() * 20, // Add randomness
            x: (i) => -15 + Math.random() * 30,
            duration: 4 + Math.random() * 2, 
            repeat: -1, yoyo: true, ease: 'sine.inOut',
            stagger: { each: 0.5, from: 'random' }
        });

        // FIX: Handle parallax effect with GSAP for performance and stability
        gsap.utils.toArray<HTMLElement>('.parallax').forEach(elem => {
            gsap.to(elem, {
                yPercent: -20,
                ease: "none",
                scrollTrigger: {
                    trigger: '.hero-section', // Trigger based on hero section
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        const animateOnScroll = (selector: string, options = {}) => {
            gsap.utils.toArray(selector).forEach((elem: any, index) => {
                // FIX: Simplified the scroll animation to be more stable
                gsap.from(elem, {
                    scrollTrigger: { 
                        trigger: elem, 
                        start: "top 85%", 
                        toggleActions: "play none none none",
                    },
                    y: 60, opacity: 0, duration: 1, ease: "expo.out",
                    delay: index * 0.1, ...options
                });
            });
        };
        
        animateOnScroll('.stat-item', { scale: 0.8 });
        animateOnScroll('.feature-card');
        animateOnScroll('.step-card', { x: -50 });
        animateOnScroll('.testimonial-card', { scale: 0.9 });
        animateOnScroll('.pricing-card');
        animateOnScroll('.faq-item', { x: 30 });
        animateOnScroll('.footer-col', { y: 30 });

        gsap.from('.cta-section', {
            scrollTrigger: { trigger: '.cta-section', start: "top 75%" },
            scale: 0.5, opacity: 0, rotation: 5, duration: 1.5, ease: "expo.out"
        });

        gsap.utils.toArray<HTMLElement>('.magnetic-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const { offsetX, offsetY, target } = e;
                const { clientWidth, clientHeight } = target as HTMLElement;
                const xPos = (offsetX / clientWidth) - 0.5;
                const yPos = (offsetY / clientHeight) - 0.5;
                gsap.to(btn, { x: xPos * 20, y: yPos * 20, scale: 1.05, duration: 0.4, ease: 'power2.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
            });
        });

        gsap.utils.toArray<HTMLElement>('.counter').forEach(counter => {
            gsap.from(counter, {
                scrollTrigger: { trigger: counter, start: "top 80%" },
                textContent: 0, duration: 2, ease: "power1.out",
                snap: { textContent: 1 }
            });
        });

    }, { scope: container });

    // FIX: Simplified useEffect to only handle state updates, preventing loops
    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []); // Empty dependency array is correct and safe here

    // FIX: Corrected the 'scrollTo' syntax
    const scrollToTop = () => {
        gsap.to(window, { scrollTo: { y: 0 }, duration: 1.5, ease: 'power3.inOut' });
    };
    
    const scrollToSection = (id: string) => {
        gsap.to(window, { 
            scrollTo: { y: `#${id}`, offsetY: 100 }, 
            duration: 1, 
            ease: 'power2.inOut' 
        });
    };

    if (!mounted) return null;
    const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
 return (
   <div className="feature-card bg-white dark:bg-gray-800/50 rounded-xl shadow-sm p-8 hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-100 dark:hover:border-blue-800">
     <div className="flex justify-center mb-5">
       <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
         {icon}
       </div>
     </div>
     <h3 className="text-xl font-semibold mb-3 text-center text-gray-800 dark:text-gray-100">{title}</h3>
     <p className="text-gray-600 dark:text-gray-400 text-center">{description}</p>
   </div>
 );
};

const StepCard = ({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) => {
 return (
   <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
     <div className="flex items-center mb-4">
       <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4 font-bold text-lg">
         {number}
       </div>
       <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
         {icon}
       </div>
     </div>
     <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
     <p className="text-gray-600 dark:text-gray-400">{description}</p>
   </div>
 );
};

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-slate-800 text-gray-900 dark:text-gray-100 selection:bg-blue-200 dark:selection:bg-blue-800 overflow-x-hidden" ref={container}>

            {/* Floating Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="floating-particle absolute top-20 left-10 w-4 h-4 bg-blue-400/20 rounded-full"></div>
                <div className="floating-particle absolute top-40 right-20 w-6 h-6 bg-purple-400/20 rounded-full"></div>
                <div className="floating-particle absolute top-60 left-1/3 w-3 h-3 bg-green-400/20 rounded-full"></div>
                <div className="floating-particle absolute bottom-40 right-1/4 w-5 h-5 bg-yellow-400/20 rounded-full"></div>
                <div className="floating-particle absolute bottom-60 left-20 w-4 h-4 bg-red-400/20 rounded-full"></div>
            </div>

            {/* Enhanced Modern Navbar */}
           <nav className="navbar-container px-6 py-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl w-full fixed top-0 z-50 border-b border-white/20 dark:border-gray-800/20 shadow-lg shadow-black/5">
    <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="navbar-item">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                    <Image src="/Indibus.jpg" alt="Indibus Logo" width={30} height={30} className='rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300' />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
                </div>
                <span className="hidden sm:block font-bold text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">LeadPro</span>
            </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1  p-1 rounded-full ">
            {[
                { id: 'features', label: 'Features' }, { id: 'how-it-works', label: 'How it Works' },
                { id: 'pricing', label: 'Pricing' }, { id: 'faq', label: 'FAQ' }
            ].map(item => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="navbar-item group flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md">{item.label}</button>
            ))}
        </div>

        <div className="flex items-center gap-3">
            <div onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="navbar-item cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <SunMedium className={`w-5 h-5 transition-all duration-300 ${theme === 'light' ? 'block' : 'hidden'}`} />
                <Moon className={`w-5 h-5 transition-all duration-300 ${theme === 'dark' ? 'block' : 'hidden'}`} />
            </div>

            {/* FIX: Worker Login button added here */}
            <Link href="/worker/auth/login" className="navbar-item hidden sm:block">
                <Button variant="outline" className="magnetic-btn">
                    Worker Login
                </Button>
            </Link>

            <Link href="/manager/auth/login" className="navbar-item">
                <Button className="magnetic-btn dark:text-white gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:shadow-lg transition-all">
                    Manager Login
                </Button>
            </Link>

            <button className="navbar-item md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X/> : <Menu/>}
            </button>
        </div>
    </div>

    {/* Mobile Menu */}
    {mobileMenuOpen && (
        <div className="md:hidden mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700">
            {['features', 'how-it-works', 'pricing', 'faq'].map((item,index) => (
                <button key={index} onClick={() => { scrollToSection(item); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 capitalize">{item}</button>
            ))}
            {/* Adding login links to mobile menu for better UX */}
            <div className='mt-4 pt-4 border-t dark:border-gray-700 space-y-2'>
                 <Link href="/worker/auth/login">
                    <Button variant="outline" className="w-full">Worker Login</Button>
                </Link>
                <Link href="/manager/auth/login">
                    <Button className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">Manager Login</Button>
                </Link>
            </div>
        </div>
    )}
</nav>

            {/* Enhanced Hero Section */}
            <section className="relative py-20 md:py-32 px-6 text-center max-w-7xl mx-auto">
                <div className="absolute inset-0 pointer-events-none"><div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div><div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div></div>
                <div className="hero-badge inline-block px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300 mb-8 border border-blue-200 dark:border-blue-700">🚀 Transform Your Sales Process Today</div>
                <h1 className="hero-title text-6xl md:text-8xl font-black mb-8 leading-tight"><span className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">Supercharge Your</span><br /><span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Lead Generation</span></h1>
                <p className="hero-subtitle text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">Revolutionary AI-powered lead management with intelligent distribution, real-time analytics, and seamless team collaboration. Boost conversions by 300% and accelerate your growth.</p>
                <div className="hero-buttons flex flex-col sm:flex-row justify-center gap-6 mb-12">
                    <Link href="/manager/auth/login"><Button size="lg" className="magnetic-btn gap-3 px-10 py-8 text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:shadow-xl transition-all rounded-2xl">Start Free Trial <ArrowRight className="w-6 h-6" /></Button></Link>
                    <Button size="lg" variant="outline" className="magnetic-btn gap-3 px-10 py-8 text-xl border-2 hover:border-blue-400 transition-all rounded-2xl">Watch Demo <Star className="w-6 h-6" /></Button>
                </div>
                <div className="hero-stats-container grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 max-w-4xl mx-auto">
                    <div className="hero-stat text-center"><div className="counter text-3xl font-bold text-blue-600" data-value="50000">574</div><div className="text-sm text-gray-600 dark:text-gray-400">Leads Processed</div></div>
                    <div className="hero-stat text-center"><div className="counter text-3xl font-bold text-purple-600" data-value="300">20</div><div className="text-sm text-gray-600 dark:text-gray-400">% Conversion Boost</div></div>
                    <div className="hero-stat text-center"><div className="counter text-3xl font-bold text-green-600" data-value="1000">120</div><div className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</div></div>
                    <div className="hero-stat text-center"><div className="counter text-3xl font-bold text-orange-600" data-value="99">24</div><div className="text-sm text-gray-600 dark:text-gray-400">% Uptime</div></div>
                </div>
                <div className="hero-image relative"><div className="relative rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-2xl border dark:border-gray-700 max-w-6xl mx-auto"><Image src="/crm.webp" alt="Dashboard Preview" width={1200} height={600} className="rounded-xl shadow-inner" priority /><div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-blue-500/20 via-transparent to-purple-500/20 pointer-events-none"></div></div></div>
            </section>
            
         {/* Stats Section */}
<section className="py-16 bg-white dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {/* --- Stat Item 1 --- */}
            <div className="stat-item p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h3 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">95%</h3>
                <p className="text-gray-600 dark:text-gray-400">Faster Lead Assignment</p>
            </div>
            {/* --- Stat Item 2 --- */}
            <div className="stat-item p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <h3 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">3x</h3>
                <p className="text-gray-600 dark:text-gray-400">Conversion Increase</p>
            </div>
            {/* --- Stat Item 3 --- */}
            <div className="stat-item p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <h3 className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">24/7</h3>
                <p className="text-gray-600 dark:text-gray-400">Real-time Monitoring</p>
            </div>
            {/* --- Stat Item 4 --- */}
            <div className="stat-item p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <h3 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">10k+</h3>
                <p className="text-gray-600 dark:text-gray-400">Leads Managed Daily</p>
            </div>
        </div>
    </div>
</section>

{/* Features Section */}
<section id="features" className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
    <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Powerful Features for Your Sales Team
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
            Everything you need to streamline your lead management process and maximize conversions
        </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <FeatureCard
            icon={<ClipboardList className="w-10 h-10 text-blue-600 dark:text-blue-400" />}
            title="Smart Lead Distribution"
            description="Automatically assign leads based on availability, skills, and performance metrics for optimal results."
        />
        <FeatureCard
            icon={<Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />}
            title="Role-Based Dashboards"
            description="Custom interfaces for managers and workers with only relevant information and actions."
        />
        <FeatureCard
            icon={<CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />}
            title="Progress Tracking"
            description="Monitor lead status, follow-ups, and completions with visual indicators and notifications."
        />
        <FeatureCard
            icon={<BarChart2 className="w-10 h-10 text-orange-600 dark:text-orange-400" />}
            title="Performance Analytics"
            description="Detailed reports on conversion rates, response times, and team productivity."
        />
        <FeatureCard
            icon={<ShieldCheck className="w-10 h-10 text-red-600 dark:text-red-400" />}
            title="Data Security"
            description="Enterprise-grade security with encryption and role-based access controls."
        />
        <FeatureCard
            icon={<Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />}
            title="Real-time Updates"
            description="Instant notifications and activity streams keep everyone informed of changes."
        />
    </div>
</section>

{/* How It Works Section */}
<section id="how-it-works" className="py-20 px-6 bg-white dark:bg-gray-900">
    <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                How Indibus LeadPro Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                A simple three-step process to transform your lead management
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
                number="1"
                icon={<Mail className="w-8 h-8" />}
                title="Capture Leads"
                description="Import leads from multiple sources or enter them manually into the system."
            />
            <StepCard
                number="2"
                icon={<Settings className="w-8 h-8" />}
                title="Automate Distribution"
                description="Our algorithm assigns leads to the most appropriate team member instantly."
            />
            <StepCard
                number="3"
                icon={<Calendar className="w-8 h-8" />}
                title="Track & Convert"
                description="Monitor progress, set follow-ups, and close more deals efficiently."
            />
        </div>
    </div>
</section>

{/* NOTE: You will need to define the FeatureCard and StepCard components with dark mode support as well. */}
{/* Here are example definitions for them: */}


            
             {/* Testimonials Section */}
            <section id="testimonials" className="py-24 px-6 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Trusted by Industry Leaders</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xl leading-relaxed max-w-3xl mx-auto mb-20">Our clients have seen unprecedented growth and efficiency. Here's what they have to say about their journey with LeadPro.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <TestimonialCard name="Priya Sharma" role="Sales Head, Tech Innovators" text="LeadPro revolutionized our sales process. Lead assignment is now instant, and our conversion rates have tripled! It's an indispensable tool for our team." imageUrl="https://i.pravatar.cc/150?img=1" />
                        <TestimonialCard name="Ankit Verma" role="CEO, Growth Solutions" text="The analytics dashboard is a game-changer. I have a clear, real-time view of my team's performance, which helps in making sharp, data-driven decisions." imageUrl="https://i.pravatar.cc/150?img=3" />
                        <TestimonialCard name="Sunita Rao" role="Ops Manager, RealEstate Co." text="The simplicity and power of this tool are unmatched. Our team was onboarded in a single day, and the productivity boost was immediate and significant." imageUrl="https://i.pravatar.cc/150?img=5" />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-gray-900">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Fair & Simple Pricing</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xl leading-relaxed max-w-3xl mx-auto mb-12">Choose the plan that scales with your business. No hidden fees, ever.</p>
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <span className={`font-medium ${billingCycle === 'monthly' ? 'text-blue-600' : 'text-gray-500'}`}>Monthly</span>
                        <Switch id="billing-cycle" checked={billingCycle === 'yearly'} onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} />
                        <span className={`font-medium ${billingCycle === 'yearly' ? 'text-blue-600' : 'text-gray-500'}`}>Yearly</span>
                        <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/50 rounded-full px-3 py-1">Save 20%</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        <PricingCard plan="Starter" monthlyPrice={1499} yearlyPrice={1199} billingCycle={billingCycle} features={['Up to 1,000 leads/mo', 'Smart Lead Distribution', 'Basic Analytics', 'Email Support']} />
                        <PricingCard plan="Professional" monthlyPrice={2999} yearlyPrice={2399} billingCycle={billingCycle} features={['Up to 10,000 leads/mo', 'All Starter Features', 'AI-Powered Insights', 'Priority Support']} popular={true} />
                        <PricingCard plan="Enterprise" monthlyPrice={"Custom"} yearlyPrice={"Custom"} features={['Unlimited Leads', 'All Pro Features', 'Dedicated Account Manager', 'Custom Integrations']} />
                    </div>
                </div>
            </section>

             {/* FAQ Section */}
            <section id="faq" className="py-24 px-6 bg-white dark:bg-gray-900">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-20"><h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Common Questions</h2><p className="text-gray-600 dark:text-gray-400 text-xl leading-relaxed">Have questions? We've got answers. If you don't see your question here, feel free to contact us.</p></div>
                    <div className="space-y-6">
                        <FaqItem question="Can I integrate LeadPro with my existing CRM?" answer="Yes! We offer seamless integrations with popular CRMs like Salesforce, HubSpot, and Zoho. Custom integrations are also available on our Enterprise plan." />
                        <FaqItem question="Is there a free trial available?" answer="Absolutely. You can sign up for a 14-day free trial on our Professional plan to explore all the features, with no credit card required." />
                        <FaqItem question="How many users can I add to my account?" answer="Our plans are priced per user. You can add as many users as you need. The 'Starter' plan is ideal for teams up to 5, while the 'Professional' plan suits larger teams. 'Enterprise' has no limits." />
                        <FaqItem question="Is it possible to import my existing leads?" answer="Of course. We provide a simple bulk-upload tool using an Excel/CSV template to get your existing leads into the system in minutes." />
                        <FaqItem question="Does the system work on mobile devices?" answer="Yes, LeadPro is fully responsive and works beautifully on all devices, including desktops, tablets, and smartphones, so your team can manage leads on the go." />
                        <FaqItem question="What kind of support can I expect?" answer="We offer email support on the Starter plan and priority email and chat support on the Professional plan. Enterprise clients receive a dedicated account manager and phone support." />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section py-24 px-6 relative overflow-hidden">
                <div className="cta-bg absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" style={{ backgroundSize: '200% 200%' }}></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">Ready to Supercharge Your Sales?</h2>
                    <p className="text-xl text-blue-100 mb-12">Join thousands of businesses that have increased their conversion rates and team productivity with LeadPro. Start your free trial today and see the difference.</p>
                    <div className="flex justify-center"><Link href="/manager/auth/register"><Button size="lg" className="magnetic-btn gap-3 px-10 py-8 text-xl bg-white text-blue-600 hover:bg-gray-200 shadow-2xl hover:shadow-white/50 transition-all rounded-2xl">Start 14-Day Free Trial <ArrowRight className="w-6 h-6" /></Button></Link></div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 dark:bg-black text-gray-400">
                <div className="max-w-7xl mx-auto py-20 px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
                        <div className="footer-col col-span-2 lg:col-span-1"><Link href="/" className="flex items-center gap-2 mb-4"><Image src="/Indibus.jpg" alt="Indibus Logo" width={32} height={32} className='rounded-lg' /><span className="text-white font-bold text-xl">LeadPro</span></Link><p className="text-sm pr-4">The ultimate platform for intelligent lead management and sales automation.</p><div className="flex gap-4 mt-6"><a href="#" aria-label="Twitter"><Twitter className="w-5 h-5 hover:text-white transition-colors" /></a><a href="#" aria-label="LinkedIn"><Linkedin className="w-5 h-5 hover:text-white transition-colors" /></a><a href="#" aria-label="GitHub"><Github className="w-5 h-5 hover:text-white transition-colors" /></a></div></div>
                        <div className="footer-col">
                            <h4 className="font-semibold text-white mb-4">Product</h4>
                            <ul className="space-y-3">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4 className="font-semibold text-white mb-4">Resources</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4 className="font-semibold text-white mb-4">Company</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-16 pt-8 text-center text-sm"><p>&copy; {new Date().getFullYear()} INDIBUS Software Solution Pvt. Ltd. All rights reserved.</p></div>
                </div>
            </footer>
            
            {/* Scroll to Top Button */}
             <button 
                onClick={scrollToTop}
                className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300 z-50 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
                aria-label="Scroll to top">
                <ArrowUp className="w-6 h-6" />
            </button>
        </div>
    );
}

// --- Reusable Card Components ---

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="feature-card bg-white dark:bg-gray-800/50 rounded-2xl p-8 text-center hover:-translate-y-2 transition-transform duration-300 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10">
        <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-2xl mb-6">{icon}</div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
);

const StepCard = ({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) => (
    <div className="step-card bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-10 hover:-translate-y-2 transition-transform duration-300">
        <div className="flex justify-center mb-6"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-black text-3xl shadow-lg">{number}</div></div>
        <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);

const TestimonialCard = ({ name, role, text, imageUrl }: { name: string; role: string; text: string; imageUrl: string; }) => (
    <div className="testimonial-card bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 h-full flex flex-col text-left hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300">
        <div className="flex items-center gap-1 mb-5">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}</div>
        <p className="text-gray-700 dark:text-gray-300 mb-6 flex-grow text-lg">"{text}"</p>
        <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
            <Image src={imageUrl} alt={name} width={56} height={56} className="rounded-full shadow-md" />
            <div><p className="font-bold text-gray-900 dark:text-white text-lg">{name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{role}</p></div>
        </div>
    </div>
);

const PricingCard = ({ plan, monthlyPrice, yearlyPrice, billingCycle, price, features, popular = false }: { plan: string, monthlyPrice?: number |string, yearlyPrice?: number | string, billingCycle?: 'monthly' | 'yearly', price?: string, features: string[], popular?: boolean }) => {
    const currentPrice = price ? price : (billingCycle === 'yearly' ? yearlyPrice : monthlyPrice);
    const priceRef = useRef<HTMLSpanElement>(null);

    useGSAP(() => {
        if (priceRef.current && typeof currentPrice === 'number') {
            gsap.to(priceRef.current, { duration: 0.5, innerText: currentPrice, roundProps: "innerText", ease: "power2.inOut" });
        }
    }, [currentPrice]);
    
    return (
        <div className={`pricing-card rounded-2xl p-8 flex flex-col transition-all duration-300 ${popular ? 'border-2 border-blue-500 shadow-2xl shadow-blue-500/20 bg-white dark:bg-gray-800' : 'border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'}`}>
            {popular && <div className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/50 rounded-full px-4 py-1 self-center mb-6">MOST POPULAR</div>}
            <h3 className="text-2xl font-bold mb-4">{plan}</h3>
            <div className="mb-8"><span className="text-6xl font-black">{price ? price : '₹'}<span ref={priceRef}>{currentPrice}</span></span><span className="text-gray-500 dark:text-gray-400">{price ? '' : '/mo/user'}</span></div>
            <ul className="space-y-4 text-left mb-10 flex-grow">{features.map((feature, i) => (<li key={i} className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>{feature}</span></li>))}</ul>
            <Button size="lg" variant={popular ? 'default' : 'outline'} className={`w-full py-6 text-lg rounded-xl ${popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>Get Started</Button>
        </div>
    );
};

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="faq-item bg-white dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left p-6 font-bold text-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <span>{question}</span><ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </button>
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                 <div className="overflow-hidden"><p className="px-6 pb-6 pt-0 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">{answer}</p></div>
            </div>
        </div>
    );
};