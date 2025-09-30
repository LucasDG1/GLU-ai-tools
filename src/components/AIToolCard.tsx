import React, { useState, useEffect, useRef } from 'react';
import { AITool } from '../App';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, XCircle, ExternalLink, MessageCircle, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReviewSection } from './ReviewSection';
import { FileUpload } from './FileUpload';
import { useLanguage } from '../contexts/LanguageContext';

interface AIToolCardProps {
  tool: AITool;
  subjectName: string;
  onRefresh: () => void;
}

export function AIToolCard({ tool, subjectName }: AIToolCardProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'uploads'>('reviews');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;
    
    const initAnimations = async () => {
      if (typeof window !== 'undefined' && cardRef.current) {
        try {
          const { gsap } = await import('gsap');
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');
          
          gsap.registerPlugin(ScrollTrigger);
          ctx = gsap.context(() => {
            gsap.fromTo(cardRef.current, 
              { 
                opacity: 0, 
                y: 20  // Reduced from 50px to 20px
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.4,  // Reduced from 0.8s to 0.4s
                ease: "power2.out",  // Softer easing
                scrollTrigger: {
                  trigger: cardRef.current,
                  start: "top 95%",  // Start animation later
                  toggleActions: "play none none none"  // Remove reverse to prevent re-animation
                }
              }
            );
          }, cardRef);
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
    <div 
      ref={cardRef}
      className="bg-white shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
    >
      {/* Main Card Content */}
      <div className="p-6">
        {tool.image_url && (
          <div className="w-full h-48 mb-6 overflow-hidden bg-glu-light">
            <ImageWithFallback
              src={tool.image_url}
              alt={tool.name}
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-200"
            />
          </div>
        )}
        
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 line-clamp-2">{tool.name}</h3>
          {tool.link_url && (
            <a
              href={tool.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-glu-gray hover:text-glu-orange cursor-pointer flex-shrink-0 ml-3 transition-colors"
              title={`Visit ${tool.name}`}
            >
              <ExternalLink size={20} />
            </a>
          )}
        </div>
        
        <Badge className="bg-glu-green text-white mb-4">
          {subjectName}
        </Badge>
        
        <p className="text-gray-700 mb-6 line-clamp-3 leading-relaxed">{tool.description}</p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Advantages */}
          {tool.advantages && tool.advantages.length > 0 && (
            <div className="bg-green-50 p-4">
              <h4 className="flex items-center font-semibold text-green-800 mb-3">
                <CheckCircle size={18} className="mr-2" />
                {t('tools.advantages')}
              </h4>
              <ul className="space-y-2">
                {tool.advantages.slice(0, 3).map((advantage, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>{advantage}</span>
                  </li>
                ))}
                {tool.advantages.length > 3 && (
                  <li className="text-sm text-green-600 italic">
                    +{tool.advantages.length - 3} more advantages
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Disadvantages */}
          {tool.disadvantages && tool.disadvantages.length > 0 && (
            <div className="bg-red-50 p-4">
              <h4 className="flex items-center font-semibold text-red-800 mb-3">
                <XCircle size={18} className="mr-2" />
                {t('tools.disadvantages')}
              </h4>
              <ul className="space-y-2">
                {tool.disadvantages.slice(0, 3).map((disadvantage, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>{disadvantage}</span>
                  </li>
                ))}
                {tool.disadvantages.length > 3 && (
                  <li className="text-sm text-red-600 italic">
                    +{tool.disadvantages.length - 3} more considerations
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Button className="bg-glu-orange text-white hover:bg-glu-orange/90">
            {t('tools.learnMore')}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsExpanded(!isExpanded);
              setActiveTab('reviews');
            }}
            className="border-glu-green text-glu-green hover:bg-glu-green hover:text-white"
          >
            <MessageCircle size={16} className="mr-2" />
            {t('tools.addReview')}
            {isExpanded ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setIsExpanded(!isExpanded);
              setActiveTab('uploads');
            }}
            className="border-glu-orange text-glu-orange hover:bg-glu-orange hover:text-white"
          >
            <Upload size={16} className="mr-2" />
            {t('tools.uploadWork')}
          </Button>
        </div>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-3 px-6 font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-glu-green text-white'
                  : 'text-glu-gray hover:text-glu-green hover:bg-green-50'
              }`}
            >
              <MessageCircle size={16} className="mr-2 inline" />
              {t('reviews.title')}
            </button>
            <button
              onClick={() => setActiveTab('uploads')}
              className={`flex-1 py-3 px-6 font-medium transition-colors ${
                activeTab === 'uploads'
                  ? 'bg-glu-orange text-white'
                  : 'text-glu-gray hover:text-glu-orange hover:bg-orange-50'
              }`}
            >
              <Upload size={16} className="mr-2 inline" />
              {t('upload.title')}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'reviews' && <ReviewSection toolId={tool.id} />}
            {activeTab === 'uploads' && <FileUpload toolId={tool.id} />}
          </div>
        </div>
      )}
    </div>
  );
}