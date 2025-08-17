"use client"

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, ReactNode, HTMLAttributes } from "react";
import { useTheme } from "next-themes";
import {
    SunMedium,
    Moon,
    ClipboardList,
    CheckCircle,
    BarChart2,
    Mail,
    Settings,
    Calendar,
    Linkedin,
    Github,
    Menu,
    X,
    ArrowUp,
} from "lucide-react";

// Define types for common props
type CommonProps = {
    className?: string;
};

// Define props for the FeatureCard component
interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

// Define props for the StepCard component
interface StepCardProps {
    number: string;
    icon: ReactNode;
    title: string;
    description: string;
}

// Define props for the TestimonialCard component
interface TestimonialCardProps {
    name: string;
    role: string;
    text: string;
    imageUrl: string;
}

// Define props for the FaqItem component
interface FaqItemProps {
    question: string;
    answer: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
    <div className="flex flex-col items-center text-center p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md hover:scale-[1.02] transition-transform duration-300">
        <div className="mb-4 text-blue-500 dark:text-blue-400">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);

const StepCard = ({ number, icon, title, description }: StepCardProps) => (
    <div className="relative text-center p-8 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl border-4 border-white dark:border-gray-900">
            {number}
        </div>
        <div className="mt-6 mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);

const TestimonialCard = ({ name, role, text, imageUrl }: TestimonialCardProps) => (
    <div className="p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md flex flex-col items-center text-center">
        <Image
            src={imageUrl}
            alt={name}
            width={80}
            height={80}
            className="rounded-full mb-4 ring-2 ring-blue-500"
        />
        <p className="text-gray-600 dark:text-gray-400 italic mb-4">"{text}"</p>
        <h4 className="font-bold text-gray-900 dark:text-gray-100">{name}</h4>
        <p className="text-sm text-blue-600 dark:text-blue-400">{role}</p>
    </div>
);

const FaqItem = ({ question, answer }: FaqItemProps) => (
    <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
            {question}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{answer}</p>
    </div>
);

// Main Component
const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
    const { theme, setTheme } = useTheme();
    const container = useRef<HTMLDivElement>(null);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 70, // Offset for fixed navbar
                behavior: "smooth",
            });
        }
    };

    const handleScroll = () => {
        if (window.scrollY > 300) {
            setShowScrollTop(true);
        } else {
            setShowScrollTop(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className="bg-blue-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans antialiased overflow-x-hidden"
            ref={container}
        >
            {/* Floating Background Elements - Simplified */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] left-[15%] w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow delay-500"></div>
            </div>

            {/* Modern Navbar */}
            <nav className="navbar-container px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl w-full fixed top-0 z-50 border-b border-gray-200 dark:border-gray-800 shadow-md">
                <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo.jpg"
                            alt="CruxCRM Logo"
                            width={36}
                            height={36}
                            className="rounded-lg shadow-sm"
                        />
                        <span className="hidden sm:block font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            CruxCRM
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-5">
                        {[
                            { id: "features", label: "Features" },
                            { id: "how-it-works", label: "How it Works" },
                            { id: "pricing", label: "Pricing" },
                            { id: "faq", label: "FAQ" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="text-black dark:textgray-600 rounded-lg px-3 py-2 cursor-pointer dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-800"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                            className="cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <SunMedium
                                className={`w-5 h-5 transition-all duration-300 ${theme === "light" ? "block" : "hidden"
                                    }`}
                            />
                            <Moon
                                className={`w-5 h-5 transition-all duration-300 ${theme === "dark" ? "block" : "hidden"
                                    }`}
                            />
                        </div>

                        <Link href="/manager/auth/login" className="hidden sm:block">
                            <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white dark:text-gray-200 cursor-pointer">
                                Manager Login
                            </button>
                        </Link>
                        <Link href="/worker/auth/login">
                            <button className="px-3 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700 cursor-pointer">
                                Worker Login
                            </button>
                        </Link>

                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700">
                        {["features", "how-it-works", "pricing", "faq"].map(
                            (item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        scrollToSection(item);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left capitalize px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                                >
                                    {item}
                                </button>
                            )
                        )}
                        <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-2">
                            <Link href="/worker/auth/login">
                                <button className="w-full rounded-b-md bg-blue-600 text-white hover:bg-blue-700">
                                    Worker Login
                                </button>
                            </Link>
                            <Link href="/manager/auth/login">
                                <button className="w-full rounded-b-md bg-purple-600 text-white hover:bg-purple-700">
                                    Manager Login
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 px-6 text-center max-w-7xl mx-auto">
                <div className="hero-badge inline-block px-5 py-2.5 bg-blue-100/50 dark:bg-blue-900/50 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300 mb-6 border border-blue-200 dark:border-blue-800">
                    The Ultimate Lead Management Platform
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                    <span className="bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Scale Your Sales with
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        CruxCRM
                    </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                    Unleash the power of AI to automate lead distribution, empower your
                    team, and convert more leads into customers, faster.
                </p>
                <div className="hero-buttons flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/manager/auth/login">
                        <button 
                            className="px-4 py-2 text-lg bg-black dark:bg-blue-700 text-white hover:bg-blue-700 rounded-xl cursor-pointer"
                        >
                            Get to Manager Dashboard
                        </button>
                    </Link>
                    <Link href="/features">
                        <button
                            className="px-4 py-2 text-xl text-gray-800 bg-gray-200 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                        >
                            Learn More
                        </button>
                    </Link>
                </div>
                <div className="hero-image relative mt-16 p-4 bg-white/50 dark:bg-gray-800/50 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-md max-w-5xl mx-auto">
                    <Image
                        src="/crm.webp"
                        alt="Dashboard Preview"
                        width={1200}
                        height={600}
                        className="rounded-2xl"
                        priority
                    />
                </div>
            </section>

            {/* Features Section */}
            <section
                id="features"
                className="py-20 px-6 bg-gray-200 dark:bg-gray-900"
            >
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                        Core Features
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        A suite of tools designed to optimize your sales workflow and
                        maximize your team's efficiency.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    <FeatureCard
                        icon={<ClipboardList className="w-12 h-12" />}
                        title="Intelligent Lead Routing"
                        description="Our smart algorithm assigns leads to the best-suited agent, ensuring every opportunity is handled efficiently."
                    />
                    <FeatureCard
                        icon={<BarChart2 className="w-12 h-12" />}
                        title="Advanced Analytics"
                        description="Gain deep insights into team performance, conversion funnels, and lead sources with real-time dashboards."
                    />
                    <FeatureCard
                        icon={<CheckCircle className="w-12 h-12" />}
                        title="Customizable Workflows"
                        description="Tailor the lead management process to your business needs, from initial contact to closing the deal."
                    />
                </div>
            </section>

            {/* How It Works Section */}
            <section
                id="how-it-works"
                className="py-20 px-6 bg-blue-100 dark:bg-gray-950"
            >
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            How It Works
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Our streamlined process makes lead management simple and effective.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <StepCard
                            number="1"
                            icon={<Mail className="w-8 h-8 text-blue-600" />}
                            title="Integrate"
                            description="Connect your lead sources like web forms, APIs, and more to CruxCRM in minutes."
                        />
                        <StepCard
                            number="2"
                            icon={<Settings className="w-8 h-8 text-purple-600" />}
                            title="Automate"
                            description="Our system automatically sorts and assigns leads based on your custom rules and team availability."
                        />
                        <StepCard
                            number="3"
                            icon={<Calendar className="w-8 h-8 text-green-600" />}
                            title="Convert"
                            description="Your team receives hot leads instantly, allowing them to follow up and convert leads faster than ever."
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-24 px-6 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                        What Our Clients Say
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto mb-16">
                        Hear from our satisfied customers who have transformed their sales
                        process with CruxCRM.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TestimonialCard
                            name="Priya Sharma"
                            role="Sales Head, Tech Innovators"
                            text="CruxCRM has been a game-changer for our team. The intelligent routing has boosted our efficiency and our conversion rates are at an all-time high."
                            imageUrl="https://i.pravatar.cc/150?img=1"
                        />
                        <TestimonialCard
                            name="Ankit Verma"
                            role="CEO, Growth Solutions"
                            text="The analytics are incredibly insightful. I can now make data-driven decisions that directly impact our bottom line. Highly recommend!"
                            imageUrl="https://i.pravatar.cc/150?img=3"
                        />
                        <TestimonialCard
                            name="Sunita Rao"
                            role="Ops Manager, RealEstate Co."
                            text="The simplicity of this platform is its greatest strength. Our team was up and running in a day, and the productivity gains were immediate."
                            imageUrl="https://i.pravatar.cc/150?img=5"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 px-6 bg-blue-100 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            FAQs
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Find answers to the most common questions about CruxCRM.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <FaqItem
                            question="Can I integrate CruxCRM with my existing CRM?"
                            answer="Yes, we support seamless integrations with major CRMs via our API. Custom integrations are available on our enterprise plans."
                        />
                        <FaqItem
                            question="Is there a free trial?"
                            answer="Yes, we offer a 14-day free trial with no credit card required. This gives you full access to all features to see how it can help your business."
                        />
                        <FaqItem
                            question="How do you handle data security?"
                            answer="Data security is our top priority. We use industry-standard encryption protocols and follow strict access control policies to keep your data safe."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 dark:bg-black text-gray-400">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-start gap-4">
                            <Link href="/" className="flex items-center gap-2">
                                <Image
                                    src="/logo.jpg"
                                    alt="CruxCRM Logo"
                                    width={36}
                                    height={36}
                                    className="rounded-lg"
                                />
                                <span className="text-white font-bold text-2xl">CruxCRM</span>
                            </Link>
                            <p className="text-sm max-w-xs">
                                The ultimate platform for intelligent lead management and sales
                                automation.
                            </p>
                            <div className="flex gap-4 mt-4">
                                <a
                                    href="https://www.linkedin.com/in/abhay-k-5a0902278/"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin className="w-6 h-6 hover:text-white transition-colors" />
                                </a>
                                <a
                                    href="https://github.com/Abhay-Kushwaha"
                                    aria-label="GitHub"
                                >
                                    <Github className="w-6 h-6 hover:text-white transition-colors" />
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => scrollToSection("features")}
                                        className="hover:text-white transition-colors"
                                    >
                                        Features
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => scrollToSection("how-it-works")}
                                        className="hover:text-white transition-colors"
                                    >
                                        How it Works
                                    </button>
                                </li>
                                <li>
                                    <Link
                                        href="/pricing"
                                        className="hover:text-white transition-colors"
                                    >
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={() => scrollToSection("faq")}
                                        className="hover:text-white transition-colors"
                                    >
                                        FAQ
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
                            <ul className="space-y-2">
                                <li>Email: contact@cruxcrm.com</li>
                                <li>Phone: +1 (555) 123-4567</li>
                                <li>Address: 123 Lead St, Sales City, USA</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
                        <p>&copy; {new Date().getFullYear()} Code With Abhay</p>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300 z-50 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
                aria-label="Scroll to top"
            >
                <ArrowUp className="w-6 h-6" />
            </button>
        </div>
    );
};

export default LandingPage;