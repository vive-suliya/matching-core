
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHome = pathname === '/';

    return (
        <div className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none">
            <nav className={`
                pointer-events-auto
                transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
                flex items-center justify-between
                ${scrolled
                    ? 'w-full max-w-2xl bg-black/40 backdrop-blur-2xl border border-white/10 py-3 px-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                    : 'w-full max-w-7xl bg-transparent py-4 px-8 rounded-none'
                }
            `}>
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 flex items-center justify-center font-black text-xs shadow-lg shadow-purple-500/20 group-hover:rotate-12 transition-all duration-500">M</div>
                    <span className={`font-black tracking-tighter uppercase text-white transition-all duration-500 ${scrolled ? 'text-sm' : 'text-xl'}`}>
                        Matching Core
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
                    <Link href={isHome ? "#features" : "/#features"} className="hover:text-white transition-colors">Advantages</Link>
                    <Link href={isHome ? "#how-it-works" : "/#how-it-works"} className="hover:text-white transition-colors">Workflow</Link>
                    <Link href="/docs" className={`${pathname === '/docs' ? 'text-white' : ''} hover:text-white transition-colors`}>Docs</Link>
                    <Link href="/playground" className={`
                        px-6 py-2.5 rounded-full transition-all duration-500 font-black
                        ${scrolled
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:scale-105'
                            : 'bg-white text-black hover:scale-110 shadow-xl shadow-white/5'
                        }
                    `}>
                        Launch
                    </Link>
                </div>

                {/* Mobile Menu Icon (Placeholder) */}
                <div className="md:hidden w-8 h-8 flex flex-col justify-center gap-1.5 cursor-pointer">
                    <div className="w-full h-0.5 bg-white/50 rounded-full"></div>
                    <div className="w-2/3 h-0.5 bg-white/50 rounded-full self-end"></div>
                </div>
            </nav>
        </div>
    );
}
