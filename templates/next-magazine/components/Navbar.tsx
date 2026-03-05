'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
    brandName: string;
    brandTagline: string;
}

export default function Navbar({ brandName, brandTagline }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/magazine', label: 'Magazine' },
        { href: '/guida', label: 'Guida' },
        { href: '/servizi', label: 'Servizi' },
        { href: '/chi-siamo', label: 'Chi Siamo' },
    ];

    return (
        <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-zinc-100 py-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link
                    href="/"
                    className="text-2xl font-serif font-bold tracking-tight hover:text-zinc-900 transition-all active:scale-95"
                    onClick={() => setIsOpen(false)}
                >
                    {brandName}<span className="text-zinc-500 italic">.{brandTagline.toLowerCase()}</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-zinc-600">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:text-zinc-900 transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                    onClick={toggleMenu}
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation Overlay */}
            <div
                className={`fixed inset-0 top-[73px] bg-white z-[90] transition-transform duration-300 md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col p-8 gap-8 text-xl font-bold text-zinc-800">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="border-b border-zinc-100 pb-4"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
