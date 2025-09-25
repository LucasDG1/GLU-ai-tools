import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Settings, Home, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';

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

  const navButtons = [
    { id: 'home', label: t('header.aiTools'), icon: Home },
    { id: 'cms', label: t('header.cms'), icon: Settings }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-glu-orange to-glu-green flex items-center justify-center">
              <span className="text-white font-bold text-xl">GLU</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Grafisch Lyceum Utrecht</h1>
              <p className="text-sm text-glu-gray">{t('header.tagline')}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Language Toggle */}
            <div className="flex items-center bg-glu-light">
              <button
                onClick={() => setLanguage('nl')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  language === 'nl' 
                    ? 'bg-glu-orange text-white' 
                    : 'text-glu-gray hover:text-gray-900'
                }`}
              >
                NL
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  language === 'en' 
                    ? 'bg-glu-orange text-white' 
                    : 'text-glu-gray hover:text-gray-900'
                }`}
              >
                EN
              </button>
            </div>

            {/* Navigation Buttons */}
            {navButtons.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 font-medium transition-all duration-200 ${
                  currentView === id
                    ? 'bg-glu-orange text-white shadow-lg'
                    : 'text-gray-700 hover:text-glu-orange hover:bg-glu-light'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          {currentView === 'home' && (
            <div className="hidden lg:flex items-center flex-1 max-w-md ml-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-glu-gray" size={20} />
                <Input
                  type="text"
                  placeholder={t('header.searchPlaceholder')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-12 pr-4 py-3 bg-glu-light border-0 focus:ring-2 focus:ring-glu-orange text-gray-900 placeholder-glu-gray"
                />
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-glu-orange transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        {currentView === 'home' && (
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-glu-gray" size={20} />
              <Input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-12 pr-4 py-3 bg-glu-light border-0 focus:ring-2 focus:ring-glu-orange text-gray-900 placeholder-glu-gray w-full"
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {/* Language Toggle Mobile */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Globe size={18} className="text-glu-gray" />
                <div className="flex bg-glu-light">
                  <button
                    onClick={() => setLanguage('nl')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      language === 'nl' 
                        ? 'bg-glu-orange text-white' 
                        : 'text-glu-gray hover:text-gray-900'
                    }`}
                  >
                    NL
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      language === 'en' 
                        ? 'bg-glu-orange text-white' 
                        : 'text-glu-gray hover:text-gray-900'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Navigation Buttons Mobile */}
              {navButtons.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentView(id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-6 py-3 font-medium transition-all duration-200 w-full ${
                    currentView === id
                      ? 'bg-glu-orange text-white'
                      : 'text-gray-700 hover:text-glu-orange hover:bg-glu-light'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}