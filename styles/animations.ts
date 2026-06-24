// animations.types.ts
export interface AnimationConfig {
  duration?: string;
  timing?: string;
  delay?: string;
  iteration?: string;
}

export interface CSSKeyframe {
  [key: string]: {
    [property: string]: string;
  };
}

export interface CSSAnimation {
  name: string;
  keyframes: CSSKeyframe;
  className?: string;
  config?: AnimationConfig;
}

// animations.constants.ts
export const KEYFRAMES = {
  fadeIn: {
    from: {
      opacity: '0',
      transform: 'translateY(20px)'
    },
    to: {
      opacity: '1',
      transform: 'translateY(0)'
    }
  },
  slideIn: {
    from: {
      opacity: '0',
      transform: 'translateX(-30px)'
    },
    to: {
      opacity: '1',
      transform: 'translateX(0)'
    }
  },
  scaleIn: {
    from: {
      opacity: '0',
      transform: 'scale(0.9)'
    },
    to: {
      opacity: '1',
      transform: 'scale(1)'
    }
  },
  bounceIn: {
    '0%': {
      opacity: '0',
      transform: 'scale(0.3)'
    },
    '50%': {
      opacity: '1',
      transform: 'scale(1.05)'
    },
    '70%': {
      transform: 'scale(0.9)'
    },
    '100%': {
      opacity: '1',
      transform: 'scale(1)'
    }
  },
  shimmer: {
    '0%': {
      backgroundPosition: '-200% 0'
    },
    '100%': {
      backgroundPosition: '200% 0'
    }
  },
  float: {
    '0%, 100%': {
      transform: 'translateY(0px)'
    },
    '50%': {
      transform: 'translateY(-10px)'
    }
  },
  glow: {
    '0%, 100%': {
      boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
    },
    '50%': {
      boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)'
    }
  },
  pulse: {
    '0%, 100%': {
      opacity: '1'
    },
    '50%': {
      opacity: '0.5'
    }
  },
  spin: {
    from: {
      transform: 'rotate(0deg)'
    },
    to: {
      transform: 'rotate(360deg)'
    }
  },
  bounce: {
    '0%, 20%, 53%, 80%, 100%': {
      transform: 'translate3d(0, 0, 0)'
    },
    '40%, 43%': {
      transform: 'translate3d(0, -30px, 0)'
    },
    '70%': {
      transform: 'translate3d(0, -15px, 0)'
    },
    '90%': {
      transform: 'translate3d(0, -4px, 0)'
    }
  }
} as const;

// animations.classes.ts
export const ANIMATION_CLASSES = {
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  scaleIn: 'animate-scale-in',
  bounceIn: 'animate-bounce-in',
  shimmer: 'animate-shimmer',
  float: 'animate-float',
  glow: 'animate-glow',
  spin: 'animate-spin',
  pulse: 'animate-pulse'
} as const;

// modal.animations.ts
export const modalAnimations = {
  backdrop: 'modal-backdrop',
  content: 'modal-content',
  overlay: 'modal-overlay',
  entrance: 'modal-entrance',
  exit: 'modal-exit'
} as const;

// button.animations.ts
export const buttonAnimations = {
  hoverLift: 'btn-hover-lift',
  hoverScale: 'btn-hover-scale',
  hoverGlow: 'btn-hover-glow'
} as const;

// card.animations.ts
export const cardAnimations = {
  hover: 'card-hover',
  entrance: 'card-entrance'
} as const;

// form.animations.ts
export const formAnimations = {
  input: 'form-input',
  label: 'form-label'
} as const;

// badge.animations.ts
export const badgeAnimations = {
  entrance: 'badge-entrance',
  pulse: 'badge-pulse'
} as const;

// icon.animations.ts
export const iconAnimations = {
  spin: 'icon-spin',
  pulse: 'icon-pulse',
  bounce: 'icon-bounce'
} as const;

// notification.animations.ts
export const notificationAnimations = {
  slideIn: 'notification-slide-in',
  fadeOut: 'notification-fade-out'
} as const;

// loader.animations.ts
export const loaderAnimations = {
  dots: 'loader-dots'
} as const;

// progress.animations.ts
export const progressAnimations = {
  fill: 'progress-fill',
  shimmer: 'progress-shimmer'
} as const;

// tooltip.animations.ts
export const tooltipAnimations = {
  entrance: 'tooltip-entrance'
} as const;

// dropdown.animations.ts
export const dropdownAnimations = {
  entrance: 'dropdown-entrance'
} as const;

// text.animations.ts
export const textAnimations = {
  gradient: 'text-gradient',
  shimmer: 'text-shimmer'
} as const;

// parallax.animations.ts
export const parallaxAnimations = {
  bg: 'parallax-bg'
} as const;

// animations.generator.ts
export class AnimationGenerator {
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    this.injectStyles();
  }

  private generateKeyframesCSS(): string {
    return Object.entries(KEYFRAMES)
      .map(([name, frames]) => {
        const framesCSS = Object.entries(frames)
          .map(([selector, styles]) => {
            const stylesCSS = Object.entries(styles)
              .map(([prop, value]) => `${this.camelToKebab(prop)}: ${value};`)
              .join(' ');
            return `${selector} { ${stylesCSS} }`;
          })
          .join(' ');
        return `@keyframes ${name} { ${framesCSS} }`;
      })
      .join('\n');
  }

  private generateClassCSS(): string {
    return `
      .animate-fade-in { animation: fadeIn 0.5s ease-out; }
      .animate-slide-in { animation: slideIn 0.6s ease-out; }
      .animate-scale-in { animation: scaleIn 0.3s ease-out; }
      .animate-bounce-in { animation: bounceIn 0.6s ease-out; }
      .animate-shimmer {
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      .animate-float { animation: float 3s ease-in-out infinite; }
      .animate-glow { animation: glow 2s ease-in-out infinite; }
      .animate-spin { animation: spin 1s linear infinite; }
      .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

      /* Modal effects */
      .modal-backdrop { backdrop-filter: blur(8px); transition: all 0.3s ease; }
      .modal-content { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .modal-overlay { background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); }

      /* Button animations */
      .btn-hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .btn-hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); }
      .btn-hover-scale { transition: all 0.2s ease; }
      .btn-hover-scale:hover { transform: scale(1.05); }
      .btn-hover-glow { transition: all 0.3s ease; }
      .btn-hover-glow:hover { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }

      /* Card animations */
      .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); }
      .card-entrance {
        animation: fadeIn 0.6s ease-out forwards;
        opacity: 0;
      }
      ${this.generateCardEntranceDelays()}

      /* Form animations */
      .form-input { transition: all 0.2s ease; }
      .form-input:focus { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15); }
      .form-label { transition: all 0.2s ease; }
      .form-input:focus + .form-label { color: rgb(99, 102, 241); transform: translateY(-2px); }

      /* Badge animations */
      .badge-entrance { animation: scaleIn 0.3s ease-out; }
      .badge-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

      /* Icon animations */
      .icon-spin { animation: spin 1s linear infinite; }
      .icon-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      .icon-bounce { animation: bounce 1s infinite; }

      /* Notification animations */
      .notification-slide-in { animation: slideIn 0.4s ease-out; }
      .notification-fade-out { animation: fadeIn 0.4s ease-out reverse; }

      /* Loader animations */
      .loader-dots { display: inline-flex; gap: 4px; }
      .loader-dots span {
        width: 8px; height: 8px; border-radius: 50%;
        background: currentColor;
        animation: bounce 1.4s infinite ease-in-out both;
      }
      .loader-dots span:nth-child(1) { animation-delay: -0.32s; }
      .loader-dots span:nth-child(2) { animation-delay: -0.16s; }
      .loader-dots span:nth-child(3) { animation-delay: 0s; }

      /* Progress bar animations */
      .progress-fill { transition: width 0.3s ease; }
      .progress-shimmer {
        position: relative;
        overflow: hidden;
      }
      .progress-shimmer::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
      }

      /* Tooltip & Dropdown animations */
      .tooltip-entrance { animation: fadeIn 0.2s ease-out; }
      .dropdown-entrance {
        animation: scaleIn 0.2s ease-out;
        transform-origin: top right;
      }

      /* Modal specific animations */
      .modal-entrance { animation: bounceIn 0.5s ease-out; }
      .modal-exit { animation: fadeIn 0.3s ease-out reverse; }

      /* Parallax effects */
      .parallax-bg { will-change: transform; transition: transform 0.1s linear; }

      /* Text animations */
      .text-gradient {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .text-shimmer {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 3s infinite;
      }

      /* Responsive animations */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }

      /* Dark mode animations */
      @media (prefers-color-scheme: dark) {
        .modal-overlay { background: rgba(0, 0, 0, 0.7); }
        .card-hover:hover { box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); }
      }
    `;
  }

  private generateCardEntranceDelays(): string {
    const delays = [];
    for (let i = 1; i <= 6; i++) {
      delays.push(`.card-entrance:nth-child(${i}) { animation-delay: ${i * 0.1}s; }`);
    }
    return delays.join(' ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private injectStyles(): void {
    if (typeof document !== 'undefined' && !this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'custom-animations';
      this.styleElement.textContent = this.generateKeyframesCSS() + this.generateClassCSS();
      document.head.appendChild(this.styleElement);
    }
  }

  public removeStyles(): void {
    if (this.styleElement && document.head.contains(this.styleElement)) {
      document.head.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  public getAnimationNames(): string[] {
    return Object.keys(KEYFRAMES);
  }

  public getClassNames(): string[] {
    return Object.values(ANIMATION_CLASSES);
  }
}

// animations.hooks.ts (pour React)
import { useEffect, useRef } from 'react';

export interface UseAnimationOptions {
  animation: keyof typeof ANIMATION_CLASSES;
  duration?: string;
  delay?: string;
  iteration?: string;
  onEnd?: () => void;
}

export const useAnimation = (options: UseAnimationOptions) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const { animation, duration, delay, iteration, onEnd } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const className = ANIMATION_CLASSES[animation];
    element.classList.add(className);

    if (duration) element.style.animationDuration = duration;
    if (delay) element.style.animationDelay = delay;
    if (iteration) element.style.animationIterationCount = iteration;

    const handleAnimationEnd = () => {
      element.classList.remove(className);
      if (duration) element.style.animationDuration = '';
      if (delay) element.style.animationDelay = '';
      if (iteration) element.style.animationIterationCount = '';
      onEnd?.();
    };

    element.addEventListener('animationend', handleAnimationEnd);
    return () => {
      element.removeEventListener('animationend', handleAnimationEnd);
    };
  }, [animation, duration, delay, iteration, onEnd]);

  return elementRef;
};

// animations.utils.ts
export const getAnimationDelay = (index: number, baseDelay: number = 0.1): string => {
  return `${index * baseDelay}s`;
};

export const getStaggeredDelay = (index: number, baseDelay: number = 0.1): string => {
  return `${(index + 1) * baseDelay}s`;
};

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const shouldAnimate = (): boolean => {
  return !prefersReducedMotion();
};

// // index.ts - Export principal
// export * from './animations.types';
// export * from './animations.constants';
// export * from './animations.classes';
// export * from './modal.animations';
// export * from './button.animations';
// export * from './card.animations';
// export * from './form.animations';
// export * from './badge.animations';
// export * from './icon.animations';
// export * from './notification.animations';
// export * from './loader.animations';
// export * from './progress.animations';
// export * from './tooltip.animations';
// export * from './dropdown.animations';
// export * from './text.animations';
// export * from './parallax.animations';
// export * from './animations.generator';
// export * from './animations.hooks';
// export * from './animations.utils';

// Pour une utilisation simple, créer une instance par défaut
export const animations = new AnimationGenerator();