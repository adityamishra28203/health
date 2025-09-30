'use client';

import { useState, useEffect } from 'react';

// Device detection and performance optimization utilities
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLowEnd: boolean;
  supportsWebGL: boolean;
  supportsHardwareAcceleration: boolean;
}

// Performance levels based on device capabilities
export enum PerformanceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra'
}

// Animation configuration based on device performance
export interface AnimationConfig {
  enableParallax: boolean;
  enableComplexAnimations: boolean;
  enableParticleEffects: boolean;
  enableSmoothTransitions: boolean;
  maxAnimationDuration: number;
  useHardwareAcceleration: boolean;
  reducedMotion: boolean;
}

// Global device detection hook
export function useDeviceOptimization(): { deviceInfo: DeviceInfo; performanceLevel: PerformanceLevel; animationConfig: AnimationConfig } {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLowEnd: false,
    supportsWebGL: false,
    supportsHardwareAcceleration: false,
  });

  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>(PerformanceLevel.MEDIUM);
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig>({
    enableParallax: true,
    enableComplexAnimations: true,
    enableParticleEffects: true,
    enableSmoothTransitions: true,
    maxAnimationDuration: 1000,
    useHardwareAcceleration: true,
    reducedMotion: false,
  });

  useEffect(() => {
    const detectDevice = () => {
      if (typeof window === 'undefined') return;

      const userAgent = navigator.userAgent;
      const screenWidth = window.innerWidth;
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Device type detection
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || screenWidth < 768;
      const isTablet = (screenWidth >= 768 && screenWidth < 1024) || /iPad/i.test(userAgent);
      const isDesktop = screenWidth >= 1024;
      
      // Performance indicators
      const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4; // Default to 4GB if not available
      const cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
      const isLowEnd = memory <= 2 || cores <= 2 || pixelRatio > 2;
      
      // WebGL and hardware acceleration support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const supportsWebGL = !!gl;
      const supportsHardwareAcceleration = supportsWebGL && !isLowEnd;

      const newDeviceInfo: DeviceInfo = {
        isMobile,
        isTablet,
        isDesktop,
        isLowEnd,
        supportsWebGL,
        supportsHardwareAcceleration,
      };

      setDeviceInfo(newDeviceInfo);

      // Determine performance level
      let newPerformanceLevel: PerformanceLevel;
      if (isLowEnd || (isMobile && memory <= 2)) {
        newPerformanceLevel = PerformanceLevel.LOW;
      } else if (isMobile || isTablet || memory <= 4) {
        newPerformanceLevel = PerformanceLevel.MEDIUM;
      } else if (memory <= 8) {
        newPerformanceLevel = PerformanceLevel.HIGH;
      } else {
        newPerformanceLevel = PerformanceLevel.ULTRA;
      }

      setPerformanceLevel(newPerformanceLevel);

      // Configure animations based on performance level
      const newAnimationConfig: AnimationConfig = {
        enableParallax: newPerformanceLevel !== PerformanceLevel.LOW,
        enableComplexAnimations: newPerformanceLevel === PerformanceLevel.HIGH || newPerformanceLevel === PerformanceLevel.ULTRA,
        enableParticleEffects: newPerformanceLevel === PerformanceLevel.ULTRA,
        enableSmoothTransitions: true, // Always enable smooth transitions
        maxAnimationDuration: newPerformanceLevel === PerformanceLevel.LOW ? 500 : newPerformanceLevel === PerformanceLevel.MEDIUM ? 800 : 1200,
        useHardwareAcceleration: supportsHardwareAcceleration,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      };

      setAnimationConfig(newAnimationConfig);
    };

    // Debounced resize handler to prevent excessive re-renders
    let resizeTimeout: NodeJS.Timeout;
    const debouncedDetectDevice = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(detectDevice, 150);
    };

    detectDevice();
    window.addEventListener('resize', debouncedDetectDevice);
    
    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleReducedMotionChange = () => {
      detectDevice();
    };
    mediaQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedDetectDevice);
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return { deviceInfo, performanceLevel, animationConfig };
}

// Optimized transform helper with device-specific optimizations
export function getOptimizedTransform(
  baseValue: number,
  deviceInfo: DeviceInfo,
  animationConfig: AnimationConfig,
  customMultiplier?: number
): string {
  if (animationConfig.reducedMotion) {
    return 'translate3d(0,0,0)';
  }

  // Disable animations during resize to prevent layout shifts
  if (typeof window !== 'undefined' && (window as any).__isResizing) {
    return 'translate3d(0,0,0)';
  }

  const multiplier = customMultiplier || (
    deviceInfo.isMobile ? 0.6 :
    deviceInfo.isTablet ? 0.8 :
    deviceInfo.isLowEnd ? 0.4 : 1
  );

  const optimizedValue = baseValue * multiplier;
  
  if (animationConfig.useHardwareAcceleration) {
    return `translate3d(0, ${optimizedValue}px, 0)`;
  }
  
  return `translateY(${optimizedValue}px)`;
}

// Optimized style helper with performance enhancements
export function getOptimizedStyle(
  baseStyle: React.CSSProperties,
  deviceInfo: DeviceInfo,
  animationConfig: AnimationConfig
): React.CSSProperties {
  if (animationConfig.reducedMotion) {
    return {
      ...baseStyle,
      transform: 'translate3d(0,0,0)',
      transition: 'none',
    };
  }

  const optimizedStyle = { ...baseStyle };

  // Add hardware acceleration properties
  if (animationConfig.useHardwareAcceleration) {
    optimizedStyle.willChange = 'transform';
    optimizedStyle.backfaceVisibility = 'hidden';
    optimizedStyle.perspective = '1000px';
    
    // Webkit optimizations for iOS
    if (deviceInfo.isMobile) {
      optimizedStyle.WebkitTransform = optimizedStyle.transform?.toString();
      optimizedStyle.WebkitBackfaceVisibility = 'hidden';
      optimizedStyle.WebkitPerspective = '1000px';
    }
  }

  // Optimize transitions for performance
  if (optimizedStyle.transition) {
    optimizedStyle.transition = optimizedStyle.transition.toString()
      .replace(/all/g, 'transform, opacity')
      .replace(/ease/g, 'cubic-bezier(0.4, 0, 0.2, 1)');
  }

  return optimizedStyle;
}

// Framer Motion optimized variants
export function getOptimizedVariants(
  deviceInfo: DeviceInfo,
  animationConfig: AnimationConfig,
  customVariants?: Record<string, unknown>
) {
  if (animationConfig.reducedMotion) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
      ...customVariants,
    };
  }

  const baseVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: animationConfig.maxAnimationDuration / 1000,
        ease: [0.4, 0, 0.2, 1],
      }
    },
    ...customVariants,
  };

  // Reduce animation intensity for lower-end devices
  if (deviceInfo.isLowEnd || animationConfig.maxAnimationDuration < 800) {
    baseVariants.hidden.y = 10;
    baseVariants.visible.transition.duration = 0.3;
  }

  return baseVariants;
}

// Performance monitoring
export function usePerformanceMonitor() {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        const memoryInfo = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
        const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;
        
        setPerformanceMetrics({
          fps,
          memoryUsage,
          renderTime: performance.now() - currentTime,
        });
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measurePerformance);
    };

    animationId = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return performanceMetrics;
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  ];

  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  });

  // Preload critical images
  const criticalImages = [
    '/images/logo.svg',
    '/images/hero-bg.jpg',
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

// Lazy loading utility
export function useLazyLoad(ref: React.RefObject<HTMLElement>, options: IntersectionObserverInit = {}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isVisible;
}
