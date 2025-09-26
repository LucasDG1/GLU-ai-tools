import React, { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    // GSAP animations - only run once
    const initAnimations = async () => {
      if (animatedRef.current) return; // Prevent re-animation
      
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      
      gsap.registerPlugin(ScrollTrigger);

      // Initial states
      gsap.set([titleRef.current, subtitleRef.current, ctaRef.current], {
        opacity: 0,
        y: 60
      });

      // Animation timeline - run only once
      const tl = gsap.timeline({
        onComplete: () => {
          animatedRef.current = true; // Mark as animated
        }
      });
      
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      })
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.6")
      .to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.4");

      // Subtle parallax background effect - no repeat
      gsap.set(heroRef.current, {
        backgroundPosition: "50% 50%"
      });
      
      gsap.to(heroRef.current, {
        backgroundPosition: "50% 60%",
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          once: true // Only trigger once
        }
      });
    };

    initAnimations();
  }, []);

  const scrollToContent = () => {
    const firstSection = document.querySelector('[data-section="subjects"]');
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white"
    >
      {/* Geometric Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-80 h-80 bg-glu-orange/10 blur-3xl animate-subtle-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-glu-green/10 blur-3xl animate-subtle-pulse animate-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-glu-gray/5 blur-3xl animate-subtle-pulse animate-delay-1000"></div>
      </div>

      {/* Sharp Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(#FF8F1C 1px, transparent 1px),
            linear-gradient(90deg, #FF8F1C 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Decorative Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-32 w-16 h-16 bg-glu-orange opacity-20"></div>
        <div className="absolute bottom-40 left-32 w-12 h-12 bg-glu-green opacity-30"></div>
        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-glu-gray opacity-15"></div>
        <div className="absolute bottom-1/3 right-1/3 w-20 h-20 border-2 border-glu-orange opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-14 h-14 border-2 border-glu-green opacity-25"></div>
      </div>

      <div className="relative z-10 text-center text-gray-900 px-6 max-w-7xl mx-auto min-h-[80vh] flex flex-col justify-center">
        {/* Main Content - Centered */}
        <div className="mb-16">
          <h1 
            ref={titleRef}
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-12 leading-tight text-gray-900"
          >
            {t('hero.title')}
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-2xl md:text-3xl lg:text-4xl mb-16 max-w-5xl mx-auto leading-relaxed text-gray-700"
          >
            {t('hero.subtitle')}
          </p>
          
          <button 
            ref={ctaRef}
            onClick={scrollToContent}
            className="group bg-glu-orange text-white px-12 py-6 text-xl font-semibold hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {t('hero.cta')}
            <ChevronDown className="inline-block ml-3 group-hover:translate-y-1 transition-transform" size={24} />
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-glu-orange animate-bounce">
        <ChevronDown size={32} />
      </div>
    </section>
  );
}