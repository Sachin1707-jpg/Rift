import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, ArrowRight, Zap, Lock, Globe, Server, 
  Key, Activity, CheckCircle, XCircle, Users,
  ChevronDown, MessageSquareQuote, ShieldAlert
} from 'lucide-react';
import { GooglePopup } from '../../components/GooglePopup/GooglePopup';

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

// ─── Section Components ───────────────────────────────────────────────────────

const Hero = ({ onSignIn }) => (
  <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
    {/* Ambient glowing orbs */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
    
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="max-w-5xl mx-auto text-center relative z-10"
    >
      <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-semibold mb-8 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        The OAuth Layer for AI Agents
      </motion.div>
      
      <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-8">
        Give your AI agents <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
          secure access
        </span> to the web.
      </motion.h1>
      
      <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
        AI agents cannot access authenticated websites directly. AI Passport acts like OAuth, giving your agents temporary, verifiable permission to act on your behalf.
      </motion.p>

      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onSignIn}
          className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
        >
          Sign in with Google
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={onSignIn}
          className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-full font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700"
        >
          Try Demo Flow
        </button>
      </motion.div>
    </motion.div>
  </section>
);

const ProblemStatement = () => (
  <section className="py-24 bg-slate-950/50 border-y border-white/5 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4">
      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid md:grid-cols-2 gap-12 items-center"
      >
        <motion.div variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            The Agent Access Problem
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1"><ShieldAlert className="w-6 h-6 text-rose-400" /></div>
              <div>
                <h4 className="text-white font-semibold text-lg">Agents are blocked</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">Websites use CAPTCHAs and cloud protections to block bots. AI agents are treated as malicious scrapers and shut out.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1"><Key className="w-6 h-6 text-rose-400" /></div>
              <div>
                <h4 className="text-white font-semibold text-lg">Sharing passwords is dangerous</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">Giving your password or session cookie to an LLM means giving it full, permanent access to your account. It's a massive security risk.</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Visual representation */}
        <motion.div variants={fadeInUp} className="relative h-[400px] rounded-3xl bg-slate-900 border border-white/10 p-8 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative z-10 flex items-center justify-between w-full max-w-sm">
            {/* Agent */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shadow-xl">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">AI Agent</span>
            </div>

            {/* Blocked Connection */}
            <div className="flex-1 px-4 relative flex items-center justify-center">
              <div className="w-full h-0.5 bg-rose-500/50 absolute top-1/2 -translate-y-1/2 border-t border-dashed border-rose-500"></div>
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center relative z-10 backdrop-blur-sm border border-rose-500/50">
                <XCircle className="w-5 h-5 text-rose-400" />
              </div>
            </div>

            {/* Website */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shadow-xl">
                <Globe className="w-8 h-8 text-slate-400" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Storefront</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="py-32 px-4 relative">
    <div className="max-w-7xl mx-auto text-center mb-20">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How AI Passport Works</h2>
      <p className="text-lg text-slate-400 max-w-2xl mx-auto">A seamless, secure flow that delegates permissions without sharing credentials.</p>
    </div>

    <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 relative">
      {/* Connecting line for desktop */}
      <div className="hidden md:block absolute top-12 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0"></div>

      {[
        { step: 1, title: 'Connect', desc: 'User logs in and connects their AI agent to AI Passport.', icon: Users },
        { step: 2, title: 'Scope', desc: 'Agent requests specific permissions (e.g., read, purchase).', icon: Shield },
        { step: 3, title: 'Sign', desc: 'AI Passport issues a time-limited, signed JWT Passport.', icon: Key },
        { step: 4, title: 'Execute', desc: 'External websites verify the passport and allow access.', icon: CheckCircle },
      ].map((s, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15 }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-full bg-slate-900 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)] flex items-center justify-center mb-6 relative">
            <s.icon className="w-10 h-10 text-blue-400" />
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm border-4 border-[#0F172A]">
              {s.step}
            </div>
          </div>
          <h4 className="text-xl font-bold text-white mb-3">{s.title}</h4>
          <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

const KeyFeatures = () => (
  <section className="py-24 px-4 bg-slate-900/30">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Enterprise-Grade Control</h2>
        <p className="text-lg text-slate-400">Everything you need to manage autonomous agent access safely.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'Granular Scopes', desc: 'Limit agents to specific actions. An agent that only needs to "Browse" cannot "Purchase".', color: 'from-blue-500/20 to-blue-600/5' },
          { title: 'Auto-Expiry', desc: 'Passports expire automatically. No lingering access or forgotten API keys.', color: 'from-purple-500/20 to-purple-600/5' },
          { title: 'Real-time Revocation', desc: 'Kill-switch any agent instantly from your dashboard if it misbehaves.', color: 'from-rose-500/20 to-rose-600/5' },
          { title: 'Cryptographic JWTs', desc: 'Passports are signed JSON Web Tokens, cryptographically verifiable by any backend.', color: 'from-emerald-500/20 to-emerald-600/5' },
          { title: 'Detailed Audit Logs', desc: 'See exactly what your agents are doing, when, and on which websites.', color: 'from-amber-500/20 to-amber-600/5' },
          { title: 'Developer API', desc: 'Easy 3-line integration for storefronts to verify incoming AI agent passports.', color: 'from-indigo-500/20 to-indigo-600/5' },
        ].map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-3xl border border-white/5 bg-gradient-to-br ${f.color} hover:border-white/10 transition-colors`}
          >
            <h4 className="text-xl font-bold text-white mb-3">{f.title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Comparison = () => (
  <section className="py-32 px-4">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why not just use API Keys?</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <XCircle className="w-8 h-8 text-rose-500" />
            <h3 className="text-2xl font-bold text-white">Traditional API Keys</h3>
          </div>
          <ul className="space-y-4">
            {['Permanent until manually rotated', 'Usually grants full account access', 'Hard to track specific agent activity', 'Requires developer setup for end-users'].map((item, i) => (
              <li key={i} className="flex gap-3 text-slate-300">
                <span className="text-rose-500 mt-0.5">✕</span> {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <h3 className="text-2xl font-bold text-white">AI Passport Passports</h3>
          </div>
          <ul className="space-y-4 relative z-10">
            {['Temporary and auto-expiring', 'Scoped to exact permissions needed', 'Rich audit trails per agent', 'Simple OAuth-like flow for users'].map((item, i) => (
              <li key={i} className="flex gap-3 text-slate-300">
                <span className="text-emerald-400 mt-0.5">✓</span> {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section className="py-24 px-4 bg-slate-900/30 border-y border-white/5">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Loved by AI Founders</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { text: "AI Passport solved our biggest go-to-market blocker. Users were terrified of giving our agents their passwords.", author: "Sarah J.", role: "CEO, AutoShopper AI" },
          { text: "Integration took exactly 15 minutes. It's literally just verifying a JWT on our backend.", author: "Michael T.", role: "CTO, NextStore" },
          { text: "The audit logs are incredible. Being able to prove exactly what our agent did builds immense trust with our enterprise clients.", author: "Elena R.", role: "VP Product, Agentic" },
        ].map((t, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur-sm relative"
          >
            <MessageSquareQuote className="w-10 h-10 text-blue-500/20 absolute top-6 right-6" />
            <p className="text-slate-300 leading-relaxed mb-8 relative z-10">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                {t.author[0]}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t.author}</p>
                <p className="text-slate-500 text-xs">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FAQ = () => {
  const faqs = [
    { q: "Do external websites need to integrate with AI Passport?", a: "Yes. Websites need a lightweight integration to verify incoming AI Passport Passports (JWTs). We provide SDKs for all major languages." },
    { q: "What happens if a passport leaks?", a: "Passports are short-lived by design (often expiring in hours or minutes). Additionally, they can be manually revoked at any time from the dashboard, instantly invalidating them." },
    { q: "Is this safe for sensitive actions like purchases?", a: "Absolutely. Passports are strictly scoped. An agent with 'Browse' permissions will be rejected by a storefront's backend if it attempts a 'Purchase' action." },
  ];

  return (
    <section className="py-32 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-6 rounded-2xl border border-white/10 bg-slate-900/50"
          >
            <h4 className="text-lg font-bold text-white mb-2 flex items-start gap-3">
              <span className="text-blue-400 mt-1">Q.</span> {faq.q}
            </h4>
            <p className="text-slate-400 leading-relaxed pl-8">{faq.a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="border-t border-white/5 py-12 px-4 bg-[#0B1120]">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-blue-500" />
        <span className="font-bold text-xl text-white tracking-tight">AI Passport</span>
      </div>
      <div className="flex gap-8 text-sm font-medium text-slate-500">
        <a href="#" className="hover:text-slate-300 transition-colors">Documentation</a>
        <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
        <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
      </div>
      <p className="text-slate-600 text-sm">© 2026 AI Passport. All rights reserved.</p>
    </div>
  </footer>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export const Login = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-blue-500/30 selection:text-white">
      {/* Navbar */}
      <nav className="absolute top-0 inset-x-0 w-full px-6 py-6 flex justify-between items-center z-50 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">AI Passport</span>
        </div>
        <button 
          onClick={() => setIsPopupOpen(true)}
          className="text-sm font-semibold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full border border-white/10"
        >
          Sign In
        </button>
      </nav>

      {/* Sections */}
      <Hero onSignIn={() => setIsPopupOpen(true)} />
      <ProblemStatement />
      <HowItWorks />
      <KeyFeatures />
      <Comparison />
      <Testimonials />
      <FAQ />
      <Footer />

      <GooglePopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
};
