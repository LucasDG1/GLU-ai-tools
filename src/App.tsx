import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SubjectSection } from './components/SubjectSection';
import { SearchResults } from './components/SearchResults';
import { CMSPanel } from './components/CMSPanel';
import { HeroSection } from './components/HeroSection';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Toaster } from './components/ui/sonner';
import { projectId, publicAnonKey } from './utils/supabase/info';

export interface Subject {
  id: string;
  name: string;
  description: string;
}

export interface AITool {
  id: string;
  subject_id: string;
  name: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  image_url: string;
}

function AppContent() {
  const { t } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [aiTools, setAiTools] = useState<AITool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AITool[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'cms'>('home');
  const [loading, setLoading] = useState(true);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-291b20a9`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, toolsRes] = await Promise.all([
        fetch(`${apiUrl}/subjects`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${apiUrl}/ai-tools`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        })
      ]);

      const subjectsData = await subjectsRes.json();
      const toolsData = await toolsRes.json();

      setSubjects(subjectsData.subjects || []);
      setAiTools(toolsData.tools || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      setSearchResults(data.tools || []);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-glu-orange to-glu-green flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-6"></div>
          <p className="text-xl">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      <main className="pt-20">
        {currentView === 'home' && (
          <>
            <HeroSection />
            
            {searchQuery && searchResults.length > 0 ? (
              <div className="px-6 lg:px-8 py-16">
                <SearchResults 
                  results={searchResults} 
                  query={searchQuery}
                  subjects={subjects}
                />
              </div>
            ) : (
              <div>
                {subjects.map((subject) => (
                  <SubjectSection
                    key={subject.id}
                    subject={subject}
                    tools={aiTools.filter(tool => tool.subject_id === subject.id)}
                    onRefresh={refreshData}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {currentView === 'cms' && (
          <div className="px-6 lg:px-8 py-16">
            <CMSPanel 
              subjects={subjects}
              aiTools={aiTools}
              onRefresh={refreshData}
            />
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-glu-orange to-glu-green flex items-center justify-center">
                  <span className="text-white font-bold text-xl">GLU</span>
                </div>
                <h3 className="text-2xl font-bold">Grafisch Lyceum Utrecht</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {t('footer.description')}
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">{t('footer.quickLinks')}</h3>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <button 
                    onClick={() => setCurrentView('home')} 
                    className="hover:text-glu-orange transition-colors text-left"
                  >
                    {t('header.aiTools')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentView('cms')} 
                    className="hover:text-glu-orange transition-colors text-left"
                  >
                    {t('header.cms')}
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">{t('footer.subjects')}</h3>
              <ul className="space-y-3 text-gray-300">
                {subjects.slice(0, 6).map(subject => (
                  <li key={subject.id} className="hover:text-glu-green transition-colors">
                    {subject.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}