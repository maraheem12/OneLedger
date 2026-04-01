"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Eye, 
  BarChart, 
  ShieldAlert, 
  Layers, 
  Database, 
  Lock, 
  CheckCircle2,
  Mail,
  ArrowRight,
  BookOpen
} from "lucide-react";

// Custom SVGs since older lucide-react version lacks these
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.5 5.5 0 0 0-1.5-3.8 5.4 5.4 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.4 5.4 0 0 0-.1 3.8A5.5 5.5 0 0 0 3.4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Animation Variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/30 to-purple-600/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* 1. Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">OneLedger</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-white text-black px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/10 hover:shadow-white/20">
              Sign Up
            </Link>
          </motion.div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-36 pb-24 relative z-10">
        
        {/* 2. Hero Section */}
        <motion.div 
          initial="initial"
          animate="animate"
          variants={stagger}
          className="text-center max-w-3xl mx-auto mb-32"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 mb-8 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mt-0.5" />
            Task Tracking System
          </motion.div>
          
          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.1]">
            Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">records</span> with precision & clarity.
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed font-light">
            A comprehensive tracking system designed for scale. Viewers read records, Analysts dive into metrics, and Admins wield full control.
          </motion.p>
          
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-medium flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            
            {/* 6. Documentation Button */}
            <Link href="/" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95">
              <BookOpen className="w-4 h-4 text-zinc-400" /> View Documentation
            </Link>
          </motion.div>
        </motion.div>

        {/* 3. Roles Section */}
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="mb-32"
        >
          <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tight mb-12 text-center">
            Role-Based Capabilities
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <RoleCard 
              icon={<Eye className="w-6 h-6 text-blue-400" />}
              title="Viewer"
              description="Read-only access to browse and search through all available records."
              color="from-blue-500/20 to-transparent"
              borderColor="border-blue-500/20"
            />
            <RoleCard 
              icon={<BarChart className="w-6 h-6 text-indigo-400" />}
              title="Analyst"
              description="View deep analytics, track performance metrics, and gather insights."
              color="from-indigo-500/20 to-transparent"
              borderColor="border-indigo-500/20"
            />
            <RoleCard 
              icon={<ShieldAlert className="w-6 h-6 text-purple-400" />}
              title="Admin"
              description="Full system control including CRUD operations and insights management."
              color="from-purple-500/20 to-transparent"
              borderColor="border-purple-500/20"
            />
          </div>
        </motion.div>

        {/* 4 & 5. Info & Tech Stack Matrix */}
        <div className="grid md:grid-cols-2 gap-6 mb-32">
          
          {/* Tech Stack Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <h3 className="text-2xl font-bold tracking-tight mb-8 flex items-center gap-3">
              <Database className="w-6 h-6 text-indigo-400" /> Tech Stack Used
            </h3>
            <div className="space-y-6">
              <TechItem title="Frontend & Backend" desc="Next.js (App Router)" />
              <TechItem title="Database" desc="MongoDB via Mongoose" />
              <TechItem title="Authentication" desc="bcrypt hashing + JWT tokens" />
              <TechItem title="Validation" desc="Zod schema validation" />
            </div>
          </motion.div>

          {/* Auth Flow Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <h3 className="text-2xl font-bold tracking-tight mb-8 flex items-center gap-3">
              <Lock className="w-6 h-6 text-purple-400" /> Authentication Info
            </h3>
            <div className="space-y-6">
              <AuthFeature 
                title="Manual Credentials" 
                desc="Secure email and password signup & login flows." 
              />
              <AuthFeature 
                title="JWT-based Authentication" 
                desc="Stateless, secure JSON Web Token authentication." 
              />
              <AuthFeature 
                title="Role-Based Access Control" 
                desc="Strict authorization hierarchy (Viewer / Analyst / Admin)." 
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* 7. Footer */}
      <footer className="border-t border-white/5 bg-black/50 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-2 text-zinc-400 font-medium tracking-tight">
             <Layers className="w-5 h-5 text-indigo-400" /> OneLedger
          </div>
          
          <div className="flex items-center gap-4">
            {/* <SocialLink href="#" icon={<Mail className="w-5 h-5" />} ariaLabel="Email Developer" /> */}
            <SocialLink href="https://github.com/maraheem12/" icon={<GithubIcon className="w-5 h-5" />} ariaLabel="GitHub" />
            <SocialLink href="https://www.linkedin.com/in/mohd-abdul-raheem/" icon={<LinkedinIcon className="w-5 h-5" />} ariaLabel="LinkedIn" />
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function RoleCard({ icon, title, description, color, borderColor }: { icon: React.ReactNode, title: string, description: string, color: string, borderColor: string }) {
  return (
    <motion.div 
      variants={fadeIn}
      className={`relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:${borderColor} transition-all duration-500 overflow-hidden group`}
    >
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-black/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 relative z-10">{title}</h3>
      <p className="text-zinc-400 leading-relaxed relative z-10 text-sm">
        {description}
      </p>
    </motion.div>
  );
}

function TechItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
      </div>
      <div>
        <div className="font-semibold text-zinc-200">{title}</div>
        <div className="text-sm text-zinc-500 mt-1">{desc}</div>
      </div>
    </div>
  );
}

function AuthFeature({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <ShieldAlert className="w-4 h-4 text-purple-400" />
      </div>
      <div>
        <div className="font-semibold text-zinc-200">{title}</div>
        <div className="text-sm text-zinc-500 mt-1">{desc}</div>
      </div>
    </div>
  );
}

function SocialLink({ href, icon, ariaLabel }: { href: string, icon: React.ReactNode, ariaLabel: string }) {
  return (
    <a 
      href={href} 
      aria-label={ariaLabel}
      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-sm"
    >
      {icon}
    </a>
  );
}
