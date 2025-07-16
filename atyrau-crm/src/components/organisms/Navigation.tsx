'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from '@/components/ThemeToggle';

// Navigation items
const navItems = [
  { name: 'Обзор', href: '/dashboard', icon: 'HomeIcon' },
  { name: 'Записи', href: '/dashboard/appointments', icon: 'CalendarIcon' },
  { name: 'Клиенты', href: '/dashboard/clients', icon: 'UsersIcon' },
  { name: 'Услуги', href: '/dashboard/services', icon: 'TagIcon' },
  { name: 'Платежи', href: '/dashboard/payments', icon: 'CreditCardIcon' },
  { name: 'Настройки', href: '/settings/business-profile', icon: 'CogIcon' },
];

export const Navigation = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-sidebar-bg border-r border-card-border">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-nav-bg shadow-nav">
            <h1 className="text-xl font-bold text-nav-link-active flex items-center">
              💎 Атырау CRM
            </h1>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href || 
                    (pathname.startsWith(item.href) && item.href !== '/dashboard')
                      ? 'bg-sidebar-active-bg text-sidebar-active border-l-2 border-sidebar-active'
                      : 'text-sidebar-item hover:bg-hover-bg hover:text-sidebar-item-hover border-l-2 border-transparent'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            
            {/* User profile info */}
            <div className="p-4 mt-auto border-t border-card-border">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-diamond/20 text-diamond rounded-full flex items-center justify-center font-semibold">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'У'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-nav-link-active">
                    {session?.user?.name || session?.user?.email}
                  </p>
                  <p className="text-xs text-sidebar-item">
                    {session?.user?.role === 'business' ? 'Бизнес' : 'Администратор'}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="ml-auto p-2 text-sm text-sidebar-item hover:text-error transition-colors"
                  title="Выйти"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        {/* Mobile top navigation */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 bg-nav-bg border-b border-card-border px-4 shadow-nav">
          <h1 className="text-xl font-bold text-nav-link-active flex items-center">💎 Атырау CRM</h1>
          <div className="flex items-center">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="ml-3 inline-flex items-center justify-center p-2 rounded-md text-nav-link hover:text-nav-link-active hover:bg-hover-bg focus:outline-none transition-colors"
            >
              <span className="sr-only">Open menu</span>
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-content-bg shadow-modal border-b border-card-border">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href || 
                    (pathname.startsWith(item.href) && item.href !== '/dashboard')
                      ? 'bg-sidebar-active-bg text-sidebar-active border-l-4 border-sidebar-active'
                      : 'text-text-body hover:bg-hover-bg hover:text-text border-l-4 border-transparent'
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Sign out button for mobile menu */}
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-error hover:bg-error/10 hover:text-error transition-colors border-l-4 border-transparent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Выйти
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-content-bg border-t border-card-border shadow-nav">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href || 
                (pathname.startsWith(item.href) && item.href !== '/dashboard')
                  ? 'text-sidebar-active'
                  : 'text-text-muted hover:text-text-body'
              } flex flex-col items-center py-2 px-1 transition-colors`}
            >
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

