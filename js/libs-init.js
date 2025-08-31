/* =============================================================================
   LIBS-INIT.JS - Library Initialization & Configuration
   ============================================================================= */

(function() {
  'use strict';

  // ===== CONFIGURATION =====
  const CONFIG = {
    // Animation settings
    animationDuration: 800,
    staggerDelay: 0.1,
    
    // Typed.js settings
    typedStrings: [
      'AI-driven Interaction Design',
      'Advanced Prototyping',
      'Design Systems & Accessibility',
      'iOS, Android, & Web',
      'Consulting & Leadership'
    ],
    typedSpeed: 50,
    typedBackSpeed: 30,
    typedLoop: true,
    
    // AOS settings
    aosOffset: 120,
    aosDelay: 0,
    aosDuration: 800,
    aosEasing: 'ease-out-cubic',
    
    // Tippy.js settings
    tippyTheme: 'light-border',
    tippyAnimation: 'scale',
    tippyDuration: [200, 150],
    
    // Lightbox2 settings
    lightboxOptions: {
      fadeDuration: 300,
      imageFadeDuration: 300,
      resizeDuration: 300,
      wrapAround: true,
      albumLabel: 'Image %1 of %2'
    }
  };

  // ===== UTILITY FUNCTIONS =====
  
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ===== GSAP INITIALIZATION =====
  
  function initGSAP() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not loaded');
      return;
    }

    // Register ScrollTrigger plugin
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Set default ease
    gsap.defaults({
      ease: "power2.out",
      duration: prefersReducedMotion() ? 0.1 : CONFIG.animationDuration / 1000
    });

    // Hero entrance animations
    initHeroAnimations();
    
    // Scroll-triggered animations
    initScrollAnimations();
  }
  


  function initHeroAnimations() {
    if (prefersReducedMotion()) return;

    const tl = gsap.timeline();
    
    tl.from('.hero-title', {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out"
    })
    .from('.hero-subtitle', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.5")
    .from('.hero-description', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.3")
    .from('.hero-actions', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.3")
    .from('.hero-stats', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.3");
  }

  function initScrollAnimations() {
    if (prefersReducedMotion()) return;

    // Project cards animation
    gsap.utils.toArray('.project-card').forEach((card, index) => {
      gsap.fromTo(card, {
        opacity: 0,
        y: 60,
        scale: 0.95
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        delay: index * CONFIG.staggerDelay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Section headers animation
    gsap.utils.toArray('.section-header').forEach(header => {
      gsap.fromTo(header, {
        opacity: 0,
        y: 40
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: header,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Contact items animation
    gsap.utils.toArray('.contact-item').forEach((item, index) => {
      gsap.fromTo(item, {
        opacity: 0,
        x: -30
      }, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        delay: index * 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse"
        }
      });
    });
  }

  // ===== AOS INITIALIZATION =====
  
  function initAOS() {
    if (typeof AOS === 'undefined') {
      console.warn('AOS not loaded');
      return;
    }

    AOS.init({
      offset: CONFIG.aosOffset,
      delay: prefersReducedMotion() ? 0 : CONFIG.aosDelay,
      duration: prefersReducedMotion() ? 0 : CONFIG.aosDuration,
      easing: CONFIG.aosEasing,
      once: true,
      mirror: false,
      disable: prefersReducedMotion()
    });
  }

  // ===== TYPED.JS INITIALIZATION =====
  
  function initTyped() {
    if (typeof Typed === 'undefined') {
      console.warn('Typed.js not loaded');
      return;
    }

    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (!heroSubtitle || prefersReducedMotion()) return;

    // Set a fixed height to prevent jumping
    heroSubtitle.style.minHeight = '3.5rem';
    heroSubtitle.style.display = 'flex';
    heroSubtitle.style.alignItems = 'center';
    heroSubtitle.style.justifyContent = 'center';

    new Typed(heroSubtitle, {
      strings: CONFIG.typedStrings,
      typeSpeed: 50,
      backSpeed: 30,
      loop: CONFIG.typedLoop,
      backDelay: 3000,
      startDelay: 1500,
      showCursor: true,
      cursorChar: '|',
      autoInsertCss: true,
      smartBackspace: true,
      fadeOut: false,
      fadeOutClass: 'typed-fade-out',
      fadeOutDelay: 500
    });
  }

  // ===== TIPPY.JS INITIALIZATION =====
  
  function initTippy() {
    if (typeof tippy === 'undefined') {
      console.warn('Tippy.js not loaded');
      return;
    }

    // Initialize tooltips for icons and buttons
    tippy('[data-tippy-content]', {
      theme: CONFIG.tippyTheme,
      animation: CONFIG.tippyAnimation,
      duration: CONFIG.tippyDuration,
      placement: 'top',
      arrow: true,
      interactive: true,
      appendTo: () => document.body,
      onShow(instance) {
        // Add focus ring for keyboard navigation
        instance.popper.setAttribute('data-focus-visible', 'true');
      },
      onHide(instance) {
        instance.popper.removeAttribute('data-focus-visible');
      }
    });

    // Auto-initialize tooltips for common elements
    const tooltipElements = document.querySelectorAll('.social-link, .btn, .nav-link');
    tooltipElements.forEach(element => {
      if (!element.hasAttribute('data-tippy-content')) {
        const title = element.getAttribute('title') || element.getAttribute('aria-label');
        if (title) {
          element.setAttribute('data-tippy-content', title);
          element.removeAttribute('title');
        }
      }
    });
  }

  // ===== LIGHTBOX2 INITIALIZATION =====
  
  function initLightbox() {
    if (typeof lightbox === 'undefined') {
      console.warn('Lightbox2 not loaded');
      return;
    }

    // Initialize lightbox for project images
    lightbox.option(CONFIG.lightboxOptions);

    // Add keyboard support
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const lightbox = document.querySelector('.lb-outerContainer');
        if (lightbox) {
          lightbox.click();
        }
      }
    });
  }

  // ===== HOVER.CSS INITIALIZATION =====
  
  function initHoverCSS() {
    // Hover.css classes are applied via CSS, no JS initialization needed
    // But we can add some custom hover effects
    
    // Add hover effects to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  // ===== ACCESSIBILITY ENHANCEMENTS =====
  
  function initAccessibility() {
    // Skip to content link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Enhanced focus management
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', function() {
      document.body.classList.remove('keyboard-navigation');
    });

    // ARIA enhancements for navigation
    const navbarToggle = document.querySelector('.navbar-toggler');
    if (navbarToggle) {
      navbarToggle.addEventListener('click', function() {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !expanded);
      });
    }
  }

  // ===== PERFORMANCE OPTIMIZATIONS =====
  
  function initPerformance() {
    // Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Debounced scroll handler
    const scrollHandler = debounce(() => {
      // Handle navbar scroll effect
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    }, 16);

    window.addEventListener('scroll', scrollHandler);
  }

  // ===== INITIALIZATION =====
  
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all libraries
    initGSAP();
    initAOS();
    initTyped();
    initTippy();
    initLightbox();
    initHoverCSS();
    initAccessibility();
    initPerformance();

    // Dispatch custom event when initialization is complete
    window.dispatchEvent(new CustomEvent('libsInitialized'));
  }

  // ===== EXPORTS =====
  
  // Make functions available globally if needed
  window.LibsInit = {
    init,
    initGSAP,
    initAOS,
    initTyped,
    initTippy,
    initLightbox,
    prefersReducedMotion
  };

  // Auto-initialize
  init();

})();
