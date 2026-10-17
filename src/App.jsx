import React, { useState } from 'react';
import { 
  Droplet, 
  Phone, 
  MapPin, 
  Heart, 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Check, 
  Menu, 
  X, 
  Truck, 
  ShieldCheck, 
  Users, 
  ExternalLink,
  MessageCircle,
  Clock,
  Lock,
  LogOut,
  AlertTriangle,
  KeyRound
} from 'lucide-react';
import { 
  sanitizeText, 
  sanitizePhone, 
  ClientRateLimiter, 
  hashPassword, 
  secureTimingEqual 
} from './security';

// Rate limiters for form submission & admin login (5 attempts per minute)
const orderRateLimiter = new ClientRateLimiter(5, 60000);
const loginRateLimiter = new ClientRateLimiter(4, 60000);

// SHA-256 hash of default admin master passphrase ("TubaOkhla2026!")
const ADMIN_HASH_KEY = '5a6bc3f7895029bc0b6c68b759600a927fa10c92f15eb1e428a2b5311e51f8dc';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  
  // Admin Portal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  
  // Order Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    bottles: '1',
    preferredDate: '',
    message: ''
  });

  const PHONE_NUMBER = "+919643088712";
  const PHONE_DISPLAY = "+91 9643088712";
  const UPI_ID = "9866063694";
  const MADARSA_ADDRESS = "Lane No. 4, Near Nabi Masjid, Johri Farm, Okhla, New Delhi - 110025";
  const MAPS_SEARCH_URL = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Lane No. 4, Near Nabi Masjid, Johri Farm, Okhla, New Delhi 110025");

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 3000);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    setRateLimitError('');

    // 1. Rate Limiting check
    if (!orderRateLimiter.canAttempt()) {
      const waitTime = orderRateLimiter.getRemainingTime();
      setRateLimitError(`Rate limit reached: Please wait ${waitTime}s before submitting another order.`);
      return;
    }
    orderRateLimiter.recordAttempt();

    // 2. Strict Input Sanitization & XSS Neutralization
    const sanitizedName = sanitizeText(formData.fullName, 60);
    const sanitizedPhone = sanitizePhone(formData.phone);
    const sanitizedAddress = sanitizeText(formData.address, 180);
    const sanitizedBottles = sanitizeText(formData.bottles, 10);
    const sanitizedDate = sanitizeText(formData.preferredDate, 12);
    const sanitizedMessage = sanitizeText(formData.message, 250);

    if (!sanitizedName || !sanitizedPhone || !sanitizedAddress) {
      alert("Please enter a valid name, phone number, and address.");
      return;
    }

    // 3. Construct WhatsApp delivery message with sanitized values
    const messageText = `Assalamu Alaikum / Hello Tuba Enterprises,\n\nI would like to request a 20L water bottle delivery:\n• Name: ${sanitizedName}\n• Phone: ${sanitizedPhone}\n• Address: ${sanitizedAddress}\n• Bottles: ${sanitizedBottles} (20-litre)\n${sanitizedDate ? `• Preferred Date: ${sanitizedDate}\n` : ''}${sanitizedMessage ? `• Note: ${sanitizedMessage}\n` : ''}\nThank you!`;

    const whatsappUrl = `https://wa.me/919643088712?text=${encodeURIComponent(messageText)}`;
    
    // Open in secure new tab with noopener, noreferrer
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setFormSubmitted(true);
  };

  // Secure Admin Authentication
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError('');

    if (!loginRateLimiter.canAttempt()) {
      const remaining = loginRateLimiter.getRemainingTime();
      setAdminError(`Too many failed login attempts. Locked for ${remaining}s.`);
      return;
    }
    loginRateLimiter.recordAttempt();

    const cleanInput = adminPassword.trim();
    if (!cleanInput) {
      setAdminError('Please enter the administrator key.');
      return;
    }

    // Cryptographic Hash & Timing-Safe verification
    const computedHash = await hashPassword(cleanInput);
    if (secureTimingEqual(computedHash, ADMIN_HASH_KEY)) {
      setAdminAuthenticated(true);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('Access Denied: Invalid credentials.');
    }
  };

  const handleAdminLogout = () => {
    setAdminAuthenticated(false);
    setShowAdminModal(false);
    setAdminPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#fbfbf9] text-[#1e293b]">
      
      {/* ---------------- 1. STICKY NAVBAR ---------------- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#0f766e]/15 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo / Wordmark */}
            <a href="#home" className="flex items-center gap-3.5 group">
              <div className="w-13 h-13 rounded-2xl bg-white p-1 border border-[#0f766e]/20 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <img 
                  src="/tuba-logo.png" 
                  alt="Tuba Enterprises Official Logo" 
                  className="w-full h-full object-contain rounded-xl" 
                />
              </div>
              <div className="text-left">
                <span className="block font-bold text-xl sm:text-2xl tracking-tight text-[#1e293b] font-['Outfit'] leading-none">
                  Tuba Enterprises
                </span>
                <span className="block text-[11px] font-semibold text-[#0f766e] tracking-wider uppercase mt-1">
                  Serving Water • Educating Futures
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-[15px] font-semibold text-[#334155]">
              <a href="#home" className="hover:text-[#0f766e] transition-colors">Home</a>
              <a href="#about" className="hover:text-[#0f766e] transition-colors">About</a>
              <a href="#delivery" className="hover:text-[#0f766e] transition-colors">Water Delivery</a>
              <a href="#madarsa" className="hover:text-[#0f766e] transition-colors">Madarsa</a>
              <a href="#donation" className="hover:text-[#0f766e] transition-colors">Donation</a>
              <a href="#contact" className="hover:text-[#0f766e] transition-colors">Contact</a>
            </nav>

            {/* Right CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="#order-form"
                className="inline-flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all active:scale-95"
              >
                <Droplet className="w-4 h-4 fill-white" />
                <span>Order Water</span>
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <div className="flex flex-col space-y-2 text-base font-medium text-slate-700">
              <a 
                href="#home" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-[#0f766e]"
              >
                Home
              </a>
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-[#0f766e]"
              >
                About
              </a>
              <a 
                href="#delivery" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-[#0f766e]"
              >
                Water Delivery
              </a>
              <a 
                href="#madarsa" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-[#0f766e]"
              >
                Madarsa
              </a>
              <a 
                href="#donation" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-[#0f766e]"
              >
                Donation
              </a>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-[#0f766e]"
              >
                Contact
              </a>
            </div>
            
            <div className="pt-2 flex flex-col gap-2.5">
              <a
                href="#order-form"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0f766e] text-white font-semibold text-center py-3 rounded-xl shadow-sm"
              >
                <Droplet className="w-4 h-4 fill-white" />
                Order Water
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1e293b] text-white font-semibold text-center py-3 rounded-xl shadow-sm"
              >
                <Phone className="w-4 h-4" />
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ---------------- 2. HERO SECTION ---------------- */}
      <section id="home" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-gradient-to-b from-[#f0fdfa]/60 via-[#fbfbf9] to-[#fbfbf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 text-left space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f0fdfa] border border-[#0f766e]/30 text-[#0f766e] text-xs sm:text-sm font-semibold tracking-wide shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#65a30d] animate-pulse"></span>
                <span>Okhla Community Initiative • New Delhi</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1e293b] font-['Outfit'] leading-[1.14]">
                Pure Water. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0f766e] via-[#0284c7] to-[#15803d]">
                  Delivered to Your Door.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
                Reliable 20-litre water bottle delivery in Okhla, New Delhi — helping serve local families while supporting the education and welfare of 19 madrasa students.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <a
                  href="#delivery"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#0f766e] hover:bg-[#115e59] text-white font-semibold text-base px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98"
                >
                  <Droplet className="w-5 h-5 fill-white" />
                  <span>Order Water</span>
                </a>
                
                <a
                  href="#madarsa"
                  className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-base px-6 py-3.5 rounded-xl shadow-2xs hover:shadow-xs transition-all active:scale-98"
                >
                  <Heart className="w-5 h-5 text-[#65a30d]" />
                  <span>Support the Madarsa</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/90">
                <p className="text-sm font-medium text-slate-600 flex flex-wrap items-center gap-y-2 gap-x-4">
                  <span className="inline-flex items-center gap-1.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#0f766e]" />
                    20L Home Delivery
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#0f766e]" />
                    Local Service
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#65a30d]" />
                    Community Supported
                  </span>
                </p>
              </div>

            </div>

            {/* Right Column: Hero Realistic Imagery & Logo Integration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md lg:max-w-none">
                
                {/* Decorative background glow with brand teal & olive */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#ccfbf1]/60 to-[#ecfccb]/60 rounded-3xl blur-2xl -z-10 transform rotate-1"></div>
                
                <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden relative">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 relative group">
                    <img 
                      src="/water-bottle-20l.jpg" 
                      alt="Tuba Enterprises 20L Pure Water Bottle" 
                      className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500"
                    />

                    {/* Logo Watermark Badge on Top Right */}
                    <div className="absolute top-3.5 right-3.5 w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-slate-200/80 flex items-center justify-center">
                      <img src="/tuba-logo.png" alt="Tuba Enterprises Emblem" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    
                    {/* Bottle Tag Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-[#1e293b]/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-lg border border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-[#5eead4] font-bold">Standard 20-Litre Jar</div>
                        <div className="text-sm font-semibold text-white">Clean Drinking Water</div>
                      </div>
                      <a
                        href={`tel:${PHONE_NUMBER}`}
                        className="bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- 3. ABOUT TUBA ENTERPRISES ---------------- */}
      <section id="about" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#0f766e] uppercase bg-[#f0fdfa] px-3.5 py-1 rounded-full border border-[#0f766e]/20">
              Our Story & Purpose
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] font-['Outfit']">
              More Than a Water Delivery Service
            </h2>
            <div className="w-16 h-1 bg-[#0f766e] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6 text-slate-600 text-base sm:text-lg leading-relaxed">
              <p className="font-medium text-slate-800">
                Tuba Enterprises is a small local water-delivery initiative serving families in and around Okhla. Customers can order 20-litre drinking-water bottles for convenient home delivery.
              </p>
              <p>
                What makes Tuba Enterprises different is where the work leads. The income generated through the business helps support Madarsa Darululoom Siddiquia and the welfare and education of its 19 students.
              </p>
              <p className="text-slate-600 text-sm italic border-l-3 border-[#65a30d] pl-4 py-1.5 bg-[#f7fee7]/40 rounded-r-lg">
                Every bottle ordered helps keep clean drinking water on local dining tables while contributing honestly toward shelter, books, and daily meals for children learning under community care.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Card 1: Water Delivery */}
              <div className="bg-[#fbfbf9] hover:bg-[#f0fdfa] p-6 rounded-2xl border border-slate-200 hover:border-[#0f766e]/30 transition-all text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center mb-4">
                  <Droplet className="w-6 h-6 fill-[#0f766e]" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 font-['Outfit']">Water Delivery</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  20-litre drinking water bottles brought right to your doorstep in Okhla.
                </p>
              </div>

              {/* Card 2: Community Support */}
              <div className="bg-[#fbfbf9] hover:bg-[#f7fee7] p-6 rounded-2xl border border-slate-200 hover:border-[#65a30d]/30 transition-all text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[#ecfccb] text-[#65a30d] flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 font-['Outfit']">Community Support</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A homegrown initiative built with neighbors, families, and trust.
                </p>
              </div>

              {/* Card 3: Education */}
              <div className="bg-[#fbfbf9] hover:bg-[#fffbeb] p-6 rounded-2xl border border-slate-200 hover:border-amber-200 transition-all text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 font-['Outfit']">Education</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Providing food, daily needs, and learning for 19 dedicated students.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ---------------- 4. WATER DELIVERY SECTION ---------------- */}
      <section id="delivery" className="py-20 bg-[#fbfbf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#0f766e] uppercase bg-[#f0fdfa] px-3.5 py-1 rounded-full border border-[#0f766e]/20">
              Home Service
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] font-['Outfit']">
              20L Water Bottle Delivery
            </h2>
            <p className="text-slate-600 text-lg">
              Convenient drinking-water delivery for your home.
            </p>
            <div className="w-16 h-1 bg-[#0f766e] mx-auto rounded-full"></div>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center">
              
              {/* Product Visual */}
              <div className="md:col-span-5 bg-[#f0fdfa]/50 p-6 sm:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
                <div className="relative group max-w-xs">
                  <img 
                    src="/water-bottle-20l.jpg" 
                    alt="20-Litre Water Bottle Home Delivery" 
                    className="w-full h-auto rounded-2xl shadow-sm object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#1e293b] text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                    20L Jar
                  </div>
                </div>
              </div>

              {/* Service Details & Features */}
              <div className="md:col-span-7 p-6 sm:p-10 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#1e293b] font-['Outfit'] mb-2">
                    Clean Drinking-Water at Home
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Have 20-litre water bottles brought directly to your home with dependable local service. Easy ordering with no complicated signups.
                  </p>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="flex items-center gap-3 bg-[#fbfbf9] p-3 rounded-xl border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center shrink-0">
                      <Droplet className="w-4 h-4 fill-[#0f766e]" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">20-litre water bottles</span>
                  </div>

                  <div className="flex items-center gap-3 bg-[#fbfbf9] p-3 rounded-xl border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">Home delivery</span>
                  </div>

                  <div className="flex items-center gap-3 bg-[#fbfbf9] p-3 rounded-xl border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">Local Okhla service</span>
                  </div>

                  <div className="flex items-center gap-3 bg-[#fbfbf9] p-3 rounded-xl border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">Easy ordering by phone</span>
                  </div>
                </div>

                {/* Call details notice */}
                <div className="bg-[#f0fdfa] border border-[#0f766e]/20 rounded-xl p-3.5 text-xs text-[#0f766e] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#0f766e] shrink-0 mt-0.5" />
                  <span>
                    For pricing, delivery timings, and local route availability in your specific lane, please call directly.
                  </span>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className="inline-flex items-center justify-center gap-2.5 bg-[#0f766e] hover:bg-[#115e59] text-white font-semibold text-base px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Order a 20L Bottle</span>
                  </a>

                  <a
                    href={`https://wa.me/919643088712?text=${encodeURIComponent("Assalamu Alaikum / Hello, I would like to order a 20L water bottle delivery.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-base px-5 py-3.5 rounded-xl shadow-sm hover:shadow transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp Order</span>
                  </a>
                </div>

                <div className="text-sm text-slate-500 font-medium">
                  Or call directly: <a href={`tel:${PHONE_NUMBER}`} className="text-slate-900 font-bold hover:underline">{PHONE_DISPLAY}</a>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ---------------- 5. HOW IT WORKS ---------------- */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] font-['Outfit']">
              How It Works
            </h2>
            <div className="w-16 h-1 bg-[#0f766e] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="relative bg-[#fbfbf9] rounded-2xl p-8 border border-slate-200 hover:border-[#0f766e]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-extrabold text-[#0f766e] font-['Outfit']">01</span>
                  <div className="w-12 h-12 rounded-xl bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#1e293b] mb-2 font-['Outfit']">
                  Place Your Order
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Call Tuba Enterprises at <a href={`tel:${PHONE_NUMBER}`} className="font-semibold text-[#0f766e] hover:underline">{PHONE_DISPLAY}</a> or fill out our quick request form.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0f766e]" /> Direct phone confirmation
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-[#fbfbf9] rounded-2xl p-8 border border-slate-200 hover:border-[#0f766e]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-extrabold text-[#0f766e] font-['Outfit']">02</span>
                  <div className="w-12 h-12 rounded-xl bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#1e293b] mb-2 font-['Outfit']">
                  We Deliver
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Your 20-litre water bottle is delivered to your home promptly across the local Okhla neighborhood.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0f766e]" /> Delivered directly to your home
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-[#fbfbf9] rounded-2xl p-8 border border-slate-200 hover:border-[#65a30d]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-extrabold text-[#65a30d] font-['Outfit']">03</span>
                  <div className="w-12 h-12 rounded-xl bg-[#ecfccb] text-[#65a30d] flex items-center justify-center">
                    <Heart className="w-6 h-6 text-[#65a30d]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#1e293b] mb-2 font-['Outfit']">
                  Your Order Helps
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  The business also contributes toward supporting the madrasa and its students.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 text-xs font-medium text-[#65a30d] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#65a30d]" /> Supporting 19 madrasa students
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ---------------- 6. MADARSA SECTION ---------------- */}
      <section id="madarsa" className="py-20 bg-[#fbfbf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#65a30d] uppercase bg-[#f7fee7] px-3.5 py-1 rounded-full border border-[#65a30d]/30">
              Community Education
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] font-['Outfit']">
              Madarsa Darululoom Siddiquia
            </h2>
            <div className="w-16 h-1 bg-[#65a30d] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual of Madrasa study environment */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="bg-white p-3 rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                  <img 
                    src="/madrasa-learning.jpg" 
                    alt="Students studying at Madarsa Darululoom Siddiquia" 
                    className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                  />
                  <div className="mt-3 p-3 bg-[#f7fee7] rounded-xl border border-[#65a30d]/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#65a30d] text-white flex items-center justify-center font-bold text-sm">
                        19
                      </div>
                      <span className="text-xs font-bold text-[#365314] uppercase tracking-wide">
                        Students Under Community Care
                      </span>
                    </div>
                    <span className="text-xs text-[#4d7c0f] font-semibold">Self-Funded</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content & Address */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed">
                <p className="text-slate-900 font-medium text-lg sm:text-xl">
                  Alongside the water-delivery business, Tuba Enterprises supports a self-funded madrasa serving 19 students. The income generated through the business helps contribute toward their education and welfare.
                </p>
                <p>
                  Every student is given a safe, dignified environment focused on learning, character building, daily nourishment, and steady progress.
                </p>
              </div>

              {/* Dignified Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-2xl font-bold text-[#1e293b] font-['Outfit'] mb-1">19 Students</div>
                  <p className="text-xs text-slate-600">Receiving regular education, living support, and care.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-2xl font-bold text-[#65a30d] font-['Outfit'] mb-1">Self-Funded</div>
                  <p className="text-xs text-slate-600">Maintained through community water sales and honest support.</p>
                </div>
              </div>

              {/* Address Box */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#f0fdfa] text-[#0f766e] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1e293b] text-sm">Madarsa Address</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Lane No. 4, Near Nabi Masjid, Johri Farm, Okhla, New Delhi - 110025
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={MAPS_SEARCH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ---------------- 7. ABOUT MUFTI MOHD. SADIQUE HUSSAIN ---------------- */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#fbfbf9] rounded-3xl border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              
              {/* Profile Avatar Icon representation */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-[#0f766e]/30 flex items-center justify-center shrink-0 text-slate-500 overflow-hidden shadow-xs">
                <div className="flex flex-col items-center justify-center p-2 text-center">
                  <Users className="w-10 h-10 text-[#0f766e] mb-1" />
                  <span className="text-[10px] font-bold text-[#0f766e] uppercase tracking-tighter">Educator</span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0f766e] bg-[#f0fdfa] px-2.5 py-0.5 rounded-md border border-[#0f766e]/20">
                  Leadership
                </span>
                <h3 className="text-2xl font-bold text-[#1e293b] font-['Outfit']">
                  Mufti Mohd. Sadique Hussain
                </h3>
                <p className="text-sm font-semibold text-slate-700">
                  Madarsa Darululoom Siddiquia
                </p>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl pt-1">
                  He runs Madarsa Darululoom Siddiquia, overseeing the education and welfare of the 19 students in Johri Farm, Okhla.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ---------------- 8. DONATION SECTION ---------------- */}
      <section id="donation" className="py-20 bg-gradient-to-b from-[#fbfbf9] to-[#f0fdfa]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <span className="text-xs font-bold tracking-widest text-[#0f766e] uppercase bg-[#f0fdfa] px-3.5 py-1 rounded-full border border-[#0f766e]/20">
              Direct Contribution
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] font-['Outfit']">
              Support the Students
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              If you would like to contribute directly toward the education and welfare of the madrasa students, you can support Madarsa Darululoom Siddiquia through the UPI ID below.
            </p>
            <div className="w-16 h-1 bg-[#0f766e] mx-auto rounded-full"></div>
          </div>

          <div className="bg-white rounded-3xl border border-[#0f766e]/25 shadow-xl p-6 sm:p-10 space-y-8">
            
            {/* UPI ID Presentation Box */}
            <div className="bg-[#1e293b] rounded-2xl p-6 sm:p-8 text-white text-center space-y-4 relative overflow-hidden">
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#5eead4]">
                UPI ID for Madarsa Support
              </div>
              
              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-extrabold tracking-wider text-white select-all">
                {UPI_ID}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#042f2e] font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {copiedUPI ? (
                    <>
                      <Check className="w-5 h-5 text-[#042f2e]" />
                      <span>UPI ID copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 text-[#042f2e]" />
                      <span>Copy UPI ID</span>
                    </>
                  )}
                </button>

                {/* Direct UPI Intent Link for mobile phones */}
                <a
                  href={`upi://pay?pa=${UPI_ID}&pn=Madarsa%20Darululoom%20Siddiquia&cu=INR`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-3 rounded-xl border border-slate-700 transition-colors text-sm"
                >
                  <span>Donate via UPI App</span>
                </a>
              </div>

              {copiedUPI && (
                <div className="text-xs text-[#5eead4] font-semibold animate-fade-in">
                  ✓ Copied {UPI_ID} to clipboard. You can now paste it into GPay, PhonePe, Paytm, or BHIM.
                </div>
              )}
            </div>

            {/* Direct Contact Notice */}
            <div className="text-center pt-2">
              <p className="text-sm text-slate-600 font-medium">
                For donation-related questions, please contact us directly.
              </p>
              <div className="mt-3 flex justify-center">
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="inline-flex items-center gap-2 text-[#0f766e] font-bold hover:underline text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {PHONE_DISPLAY}</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ---------------- 9. WATER DELIVERY CONTACT FORM (SECURE & SANITIZED) ---------------- */}
      <section id="order-form" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-12">
            <span className="text-xs font-bold tracking-widest text-[#0f766e] uppercase bg-[#f0fdfa] px-3.5 py-1 rounded-full border border-[#0f766e]/20">
              Delivery Request
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] font-['Outfit']">
              Order Water for Your Home
            </h2>
            <p className="text-slate-600 text-base">
              Fill in your delivery address below. Your order request will open directly in WhatsApp or you can dial us at {PHONE_DISPLAY}.
            </p>
            <div className="w-16 h-1 bg-[#0f766e] mx-auto rounded-full"></div>
          </div>

          <div className="bg-[#fbfbf9] rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
            
            {/* Rate limit warning banner */}
            {rateLimitError && (
              <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{rateLimitError}</span>
              </div>
            )}

            {formSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#f0fdfa] text-[#0f766e] flex items-center justify-center mx-auto border border-[#0f766e]/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#1e293b] font-['Outfit']">Request Ready</h3>
                <p className="text-slate-600 max-w-md mx-auto text-sm">
                  Your order details were sanitized and prepared. If WhatsApp didn't open automatically, you can call us directly:
                </p>
                <div className="pt-2">
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className="inline-flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold px-6 py-3 rounded-xl shadow-md"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {PHONE_DISPLAY}</span>
                  </a>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormSubmitted(false);
                      setRateLimitError('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Edit form details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-5" noValidate={false}>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      maxLength={60}
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder="e.g. Mohd. Farhan"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0f766e] bg-white text-slate-900 text-sm"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      maxLength={15}
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="e.g. 9876543210"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0f766e] bg-white text-slate-900 text-sm"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    required
                    rows={3}
                    maxLength={180}
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="House/Flat No., Lane No., Landmark, Johri Farm / Okhla"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0f766e] bg-white text-slate-900 text-sm resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Number of 20L Bottles */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="bottles" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Number of 20L Bottles *
                    </label>
                    <select
                      id="bottles"
                      name="bottles"
                      required
                      value={formData.bottles}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0f766e] bg-white text-slate-900 text-sm"
                    >
                      <option value="1">1 Bottle (20 Litre)</option>
                      <option value="2">2 Bottles (20 Litre each)</option>
                      <option value="3">3 Bottles (20 Litre each)</option>
                      <option value="4">4 Bottles (20 Litre each)</option>
                      <option value="5+">5+ Bottles (Call for bulk)</option>
                    </select>
                  </div>

                  {/* Preferred Delivery Date */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="preferredDate" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Preferred Delivery Date
                    </label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0f766e] bg-white text-slate-900 text-sm"
                    />
                  </div>
                </div>

                {/* Additional Message */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Additional Message
                  </label>
                  <input
                    type="text"
                    id="message"
                    name="message"
                    maxLength={250}
                    value={formData.message}
                    onChange={handleFormChange}
                    placeholder="e.g. Ring the bell on 2nd floor, or deliver in the morning"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0f766e] bg-white text-slate-900 text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-base py-4 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Droplet className="w-5 h-5 fill-white" />
                    <span>Request Water Delivery</span>
                  </button>
                  <p className="text-[12px] text-slate-500 text-center mt-2">
                    Orders are processed directly via phone/WhatsApp confirmation. Rate-limited & XSS-protected.
                  </p>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* ---------------- 10. CONTACT SECTION ---------------- */}
      <section id="contact" className="py-20 bg-[#fbfbf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#0f766e] uppercase bg-[#f0fdfa] px-3.5 py-1 rounded-full border border-[#0f766e]/20">
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] font-['Outfit']">
              Tuba Enterprises
            </h2>
            <div className="w-16 h-1 bg-[#0f766e] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Phone Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#f0fdfa] text-[#0f766e] flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1e293b] font-['Outfit']">Phone Ordering</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Call us directly to request 20-litre water bottle delivery or for any queries about our service.
                </p>
                <div className="text-2xl font-mono font-bold text-slate-900 pt-1">
                  {PHONE_DISPLAY}
                </div>
              </div>

              <div>
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold py-3.5 rounded-xl shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#f7fee7] text-[#65a30d] flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1e293b] font-['Outfit']">Madarsa Address</h3>
                <div className="text-slate-700 text-sm leading-relaxed font-medium">
                  {MADARSA_ADDRESS}
                </div>
                <p className="text-xs text-slate-500">
                  Madarsa Darululoom Siddiquia • Johri Farm, Okhla
                </p>
              </div>

              <div>
                <a
                  href={MAPS_SEARCH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-xs transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ---------------- 11. FOOTER ---------------- */}
      <footer className="bg-[#1e293b] text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
            
            {/* Col 1: Brand & Social Purpose */}
            <div className="md:col-span-6 space-y-4 text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-xs">
                  <img src="/tuba-logo.png" alt="Tuba Enterprises Logo" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div>
                  <span className="block text-2xl font-bold tracking-tight text-white font-['Outfit'] leading-none">
                    Tuba Enterprises
                  </span>
                  <span className="block text-[11px] text-[#5eead4] font-medium tracking-wider uppercase mt-1">
                    Serving Water. Educating Futures.
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm font-semibold max-w-md">
                “Community Welfare Initiative • Johri Farm, Okhla”
              </p>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Serving Okhla families with clean 20-litre water home delivery, with income contributing to the education and daily welfare of 19 students at Madarsa Darululoom Siddiquia.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="md:col-span-3 space-y-3 text-left">
              <div className="text-xs font-bold uppercase tracking-widest text-[#5eead4]">Quick Links</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#delivery" className="hover:text-white transition-colors">Water Delivery</a></li>
                <li><a href="#madarsa" className="hover:text-white transition-colors">Madarsa</a></li>
                <li><a href="#donation" className="hover:text-white transition-colors">Donation</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminModal(true);
                      setAdminError('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#5eead4] transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Staff Portal</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Direct Contact */}
            <div className="md:col-span-3 space-y-3 text-left">
              <div className="text-xs font-bold uppercase tracking-widest text-[#5eead4]">Direct Contact</div>
              <p className="text-sm text-slate-300">
                Call for deliveries or inquiries:
              </p>
              <a 
                href={`tel:${PHONE_NUMBER}`}
                className="inline-flex items-center gap-2 text-white font-mono font-bold text-lg hover:text-[#5eead4] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#5eead4]" />
                {PHONE_DISPLAY}
              </a>
              <div className="pt-2 text-xs text-slate-400">
                Johri Farm, Okhla, New Delhi - 110025
              </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© 2026 Tuba Enterprises. All rights reserved.</p>
            <p className="text-slate-400">Community water delivery initiative in Okhla, New Delhi.</p>
          </div>

        </div>
      </footer>

      {/* ---------------- PROTECTED ADMIN PORTAL MODAL ---------------- */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative">
            
            <button
              type="button"
              onClick={() => {
                setShowAdminModal(false);
                setAdminError('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {!adminAuthenticated ? (
              <form onSubmit={handleAdminLogin} className="space-y-5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#f0fdfa] text-[#0f766e] flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">Protected Staff Portal</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Restricted access. Passphrase authentication with SHA-256 verification and brute-force lockout.
                  </p>
                </div>

                {adminError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="adminKey" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Administrator Passphrase
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="adminKey"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0f766e] text-slate-900 text-sm"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </button>
              </form>
            ) : (
              <div className="space-y-5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">Authorized Session Active</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Authenticated as Authorized Dispatch / Admin.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">Security Status:</span>
                    <span className="text-emerald-700 font-bold">Hardened</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">Dispatch Phone:</span>
                    <span className="font-mono text-slate-900">{PHONE_DISPLAY}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">Beneficiary UPI:</span>
                    <span className="font-mono text-slate-900">{UPI_ID}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">Database Exposure:</span>
                    <span className="text-emerald-700 font-bold">None (Stateless Client)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
