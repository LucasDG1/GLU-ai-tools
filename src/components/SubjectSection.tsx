import React, { useEffect, useRef } from 'react';
import { Subject, AITool } from '../App';
import { AIToolCard } from './AIToolCard';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';

interface SubjectSectionProps {
  subject: Subject;
  tools: AITool[];
  onRefresh: () => void;
}

const subjectIcons: Record<string, string> = {
  design: '🎨',
  development: '💻',
  marketing: '📈',
  video: '🎬',
  social: '📱',
  gameart: '🎮',
  gamedesign: '🕹️',
  vr: '🥽',
  brand: '🏷️',
  content: '📝',
  art: '🖌️',
  dtp: '📰'
};

export function SubjectSection({ subject, tools, onRefresh }: SubjectSectionProps) {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const icon = subjectIcons[subject.id] || '🔧';

  useEffect(() => {
    let ctx: any;
    
    const initAnimations = async () => {
      if (typeof window !== 'undefined' && titleRef.current) {
        try {
          const { gsap } = await import('gsap');
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');
          
          gsap.registerPlugin(ScrollTrigger);
          ctx = gsap.context(() => {
            // Only animate the title with a subtle fade-in
            gsap.fromTo(titleRef.current,
              { 
                opacity: 0, 
                y: 15  // Reduced from x: -100 to y: 15 for subtler effect
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,  // Reduced from 1s
                ease: "power2.out",  // Softer easing
                scrollTrigger: {
                  trigger: titleRef.current,
                  start: "top 90%",  // Start later
                  toggleActions: "play none none none"  // Remove reverse
                }
              }
            );
          }, titleRef);
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
  }, []);

  return (
    <section 
      ref={sectionRef}
      id={subject.id} 
      className="scroll-mt-24 py-16 px-6 lg:px-8"
      data-section="subjects"
    >
      <div className="max-w-7xl mx-auto">
        <div ref={titleRef} className="mb-12">
          <div className="flex items-center space-x-6 mb-6">
            <div className="text-6xl">{icon}</div>
            <div className="flex-1">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">{subject.name}</h2>
              <p className="text-xl text-glu-gray leading-relaxed">{subject.description}</p>
            </div>
            <div className="hidden md:flex flex-col items-center">
              <Badge className="bg-glu-orange text-white px-4 py-2 text-lg">
                {tools.length}
              </Badge>
              <span className="text-sm text-glu-gray mt-1">
                {tools.length === 1 ? 'Tool' : 'Tools'}
              </span>
            </div>
          </div>
          
          {/* Separator Line */}
          <div className="w-full h-px bg-gradient-to-r from-glu-orange via-glu-green to-transparent"></div>
        </div>

        {tools.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <AIToolCard 
                key={tool.id} 
                tool={tool} 
                subjectName={subject.name}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-16 text-center shadow-lg">
            <div className="text-8xl mb-6 opacity-50">{icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No AI Tools Yet</h3>
            <p className="text-glu-gray text-lg mb-8 max-w-md mx-auto leading-relaxed">
              We're working on adding AI tools for {subject.name}. Check back soon or suggest tools through the CMS!
            </p>
            <div className="inline-flex items-center space-x-3 text-glu-orange">
              <span className="font-medium">Coming Soon</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-glu-orange rounded-full animate-gentle-bounce"></div>
                <div className="w-3 h-3 bg-glu-orange rounded-full animate-gentle-bounce animate-delay-100"></div>
                <div className="w-3 h-3 bg-glu-orange rounded-full animate-gentle-bounce animate-delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}