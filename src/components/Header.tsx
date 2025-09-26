import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Settings, Home, Globe, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  currentView: 'home' | 'cms';
  setCurrentView: (view: 'home' | 'cms') => void;
}

export function Header({ onSearch, searchQuery, currentView, setCurrentView }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleLogout = () => {
    logout();
    setCurrentView('home');
    setMobileMenuOpen(false);
  };

  const navButtons = [
    { id: 'home', label: t('header.aiTools'), icon: Home },
    { id: 'cms' as const, label: t('header.cms'), icon: Settings }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-glu-orange to-glu-green flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">GLU</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 group-hover:text-glu-orange transition-colors">GLU Tools</h1>
              <p className="text-xs text-glu-gray">{t('header.tagline')}</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Search Bar */}
            {currentView === 'home' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-glu-gray" size={16} />
                <Input
                  type="text"
                  placeholder={t('header.searchPlaceholder')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-80 bg-glu-light border-0 focus:ring-2 focus:ring-glu-orange text-sm"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              {navButtons.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentView(id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    currentView === id
                      ? 'bg-glu-orange text-white'
                      : 'text-gray-700 hover:text-glu-orange hover:bg-glu-light'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-glu-light">
              <button
                onClick={() => setLanguage('nl')}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  language === 'nl' 
                    ? 'bg-glu-orange text-white' 
                    : 'text-glu-gray hover:text-gray-900'
                }`}
              >
                NL
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  language === 'en' 
                    ? 'bg-glu-orange text-white' 
                    : 'text-glu-gray hover:text-gray-900'
                }`}
              >
                EN
              </button>
            </div>

            {/* Logout Button */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-glu-orange transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        {currentView === 'home' && (
          <div className="lg:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-glu-gray" size={16} />
              <Input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 bg-glu-light border-0 focus:ring-2 focus:ring-glu-orange w-full text-sm"
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 py-3">
            <div className="flex flex-col space-y-2">
              {/* Navigation Buttons Mobile */}
              {navButtons.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentView(id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 w-full ${
                    currentView === id
                      ? 'bg-glu-orange text-white'
                      : 'text-gray-700 hover:text-glu-orange hover:bg-glu-light'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}

              {/* Language Toggle Mobile */}
              <div className="flex items-center justify-center space-x-2 py-2">
                <Globe size={16} className="text-glu-gray" />
                <div className="flex bg-glu-light">
                  <button
                    onClick={() => setLanguage('nl')}
                    className={`px-3 py-2 text-xs font-medium transition-colors ${
                      language === 'nl' 
                        ? 'bg-glu-orange text-white' 
                        : 'text-glu-gray hover:text-gray-900'
                    }`}
                  >
                    NL
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-2 text-xs font-medium transition-colors ${
                      language === 'en' 
                        ? 'bg-glu-orange text-white' 
                        : 'text-glu-gray hover:text-gray-900'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Logout Button Mobile */}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}