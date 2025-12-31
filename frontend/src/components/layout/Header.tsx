
'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                        <Zap size={18} className="text-white fill-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">
                        Matching Core
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/playground" className="text-sm text-gray-400 hover:text-white transition-colors">
                        Playground
                    </Link>
                    <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                        Documentation
                    </Link>
                    <Link href="#" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-white transition-all">
                        GitHub
                    </Link>
                </nav>
            </div>
        </header>
    );
}
