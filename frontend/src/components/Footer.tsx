"use client";

import Link from "next/link";
import { MessageSquare, Twitter, Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 relative z-10">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-extrabold font-syne text-gray-900 mb-6 block">
              use<span className="text-teal-600">AI</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              AI-powered WhatsApp automation for modern Indian businesses. Train your AI brain in 5 minutes.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
                <Linkedin size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Product Col */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 font-syne">Product</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="#features" className="text-gray-500 hover:text-teal-600 text-sm transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="text-gray-500 hover:text-teal-600 text-sm transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="text-gray-500 hover:text-teal-600 text-sm transition-colors">Dashboard</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-teal-600 text-sm transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Company Col */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 font-syne">Company</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="#" className="text-gray-500 hover:text-teal-600 text-sm transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-teal-600 text-sm transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-teal-600 text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-teal-600 text-sm transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 font-syne">Support</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <Mail size={16} className="text-teal-500" />
                hello@useai.in
              </li>
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <MessageSquare size={16} className="text-teal-500" />
                WhatsApp Support
              </li>
              <li className="mt-4">
                 <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100/50">
                    <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-2">India Office</p>
                    <p className="text-xs text-teal-700/80 leading-relaxed">
                      Tower A, Cyber City, Phase 2<br />Gurugram, Haryana
                    </p>
                 </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-xs">
            © {currentYear} useAI Technologies Pvt Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-400 text-[10px] font-medium tracking-widest uppercase">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
