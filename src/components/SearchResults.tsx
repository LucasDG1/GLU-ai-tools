import React, { useEffect, useRef } from 'react';
import { AITool, Subject } from '../App';
import { AIToolCard } from './AIToolCard';
import { Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchResultsProps {
  results: AITool[];
  query: string;
  subjects: Subject[];
}

export function SearchResults({ results, query, subjects }: SearchResultsProps) {
  const { t } = useLanguage();
  const resultsRef = useRef<HTMLElement>(null);
  
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || subjectId;
  };

  useEffect(() => {
    let ctx: any;
    
    const initAnimations = async () => {
      if (typeof window !== 'undefined' && resultsRef.current) {
        try {
          const { gsap } = await import('gsap');
          
          ctx = gsap.context(() => {
            gsap.fromTo(resultsRef.current!.children,
              { 
                opacity: 0, 
                y: 15  // Reduced from 30px
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.3,  // Reduced from 0.6s
                stagger: 0.05,  // Reduced from 0.1s
                ease: "power2.out"  // Softer easing
              }
            );
          }, resultsRef);
        } catch (error) {
          console.warn('GSAP animation failed to load:', error);
        }
      }
    };

    initAnimations();

    return () => {
      if (ctx) {
        ctx.revert();
      }
    };
  }, [results]);

  return (
    <section className="max-w-7xl mx-auto">
      <div className="flex items-center space-x-4 mb-12">
        <div className="w-16 h-16 bg-glu-orange flex items-center justify-center">
          <Search className="text-white" size={32} />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-gray-900">
            Search Results for "{query}"
          </h2>
          <p className="text-xl text-glu-gray mt-2">
            Found {results.length} {results.length === 1 ? 'tool' : 'tools'} matching your search
          </p>
        </div>
      </div>

      {results.length > 0 ? (
        <div ref={resultsRef} className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {results.map((tool) => (
            <AIToolCard 
              key={tool.id} 
              tool={tool} 
              subjectName={getSubjectName(tool.subject_id)}
              onRefresh={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="bg-glu-light p-16 text-center">
          <Search className="mx-auto text-glu-gray mb-6" size={64} />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h3>
          <p className="text-glu-gray text-lg mb-8 max-w-2xl mx-auto">
            We couldn't find any AI tools matching "{query}". Try searching with different keywords or browse our categories.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['AI', 'Design', 'Development', 'Creative', 'Student', 'Tool'].map((suggestion) => (
              <span
                key={suggestion}
                className="px-4 py-2 bg-white text-glu-gray hover:bg-glu-orange hover:text-white cursor-pointer transition-colors shadow-sm"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}