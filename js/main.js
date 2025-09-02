/* =============================================================================
   MAIN.JS - Site Interactions & Functionality
   ============================================================================= */

(function() {
  'use strict';

  // ===== STATE MANAGEMENT =====
  const state = {
    currentFilter: 'all',
    isNavbarExpanded: false,
    currentSection: 'home',
    isScrolled: false,
    isAuthenticated: false,
    isPasswordVisible: false
  };

  // ===== CONFIGURATION =====
  const CONFIG = {
    password: "MelissaAI123!",
    animationDuration: 0.8,
    staggerDelay: 0.1
  };

  // ===== DOM ELEMENTS =====
  let elements = {};

  function cacheElements() {
    elements = {
      navbar: document.querySelector('.navbar'),
      navbarToggle: document.querySelector('.navbar-toggle'),
      navbarNav: document.querySelector('.navbar-nav'),
      projectCards: document.querySelectorAll('.project-card'),
      filterButtons: document.querySelectorAll('.filter-btn'),
      projectGrid: document.querySelector('.projects-grid'),
      sections: document.querySelectorAll('section[id]'),
      navLinks: document.querySelectorAll('.nav-link'),
      // skipLink: document.querySelector('.skip-link'),
      mainContent: document.querySelector('#mainContent'),
      passwordModal: document.querySelector('.password-modal'),
      passwordForm: document.querySelector('.password-form'),
      passwordInput: document.querySelector('#passwordInput'),
      submitPassword: document.querySelector('#submitPassword'),
      togglePassword: document.querySelector('.toggle-password'),
      passwordError: document.querySelector('#passwordError')
    };
  }

  // ===== PROJECT FILTERS =====
  
  function initProjectFilters() {
    if (!elements.filterButtons.length) return;

    elements.filterButtons.forEach(button => {
      button.addEventListener('click', handleFilterClick);
    });

    // Add active state to first filter button
    const firstFilter = elements.filterButtons[0];
    if (firstFilter) {
      firstFilter.classList.add('active');
    }
  }

  function handleFilterClick(event) {
    const button = event.currentTarget;
    const filter = button.dataset.filter;
    
    // Update active state
    elements.filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Update state
    state.currentFilter = filter;
    
    // Filter projects
    filterProjects(filter);
    
    // Animate filter change
    animateFilterChange();
  }

  function filterProjects(filter) {
    if (!elements.projectCards.length) return;

    elements.projectCards.forEach(card => {
      const categories = card.dataset.categories?.split(',') || [];
      const shouldShow = filter === 'all' || categories.includes(filter);
      
      if (shouldShow) {
        card.style.display = 'block';
        card.classList.add('filtered-in');
        card.classList.remove('filtered-out');
      } else {
        card.classList.add('filtered-out');
        card.classList.remove('filtered-in');
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
  }

  function animateFilterChange() {
    // Add staggered animation for visible cards
    const visibleCards = Array.from(elements.projectCards).filter(card => 
      card.classList.contains('filtered-in')
    );

    visibleCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 50);
    });
  }

  // ===== NAVBAR ACCESSIBILITY =====
  
  function initNavbarAccessibility() {
    // Handle scroll effects
    initScrollEffects();
    
    // Add active state to current section
    updateActiveNavigationOnScroll();
    
    // Handle mobile navigation toggle
    if (elements.navbarToggle) {
      elements.navbarToggle.addEventListener('click', handleMobileNavToggle);
    }
    
    // Handle escape key for mobile menu
    document.addEventListener('keydown', handleEscapeKey);
    
    // Handle click outside for mobile menu
    document.addEventListener('click', handleClickOutside);
  }

  function handleMobileNavToggle() {
    const isExpanded = elements.navbarToggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;
    
    // Update ARIA state
    elements.navbarToggle.setAttribute('aria-expanded', newState.toString());
    
    if (elements.navbarNav) {
      if (newState) {
        // Opening the menu
        elements.navbarNav.classList.add('show');
        animateMobileMenuOpen();
      } else {
        // Closing the menu
        animateMobileMenuClose();
      }
    }
  }

  function animateMobileMenuOpen() {
    const navLinks = elements.navbarNav.querySelectorAll('.nav-link');
    
    // Reset any existing animations
    navLinks.forEach(link => {
      link.style.opacity = '0';
      link.style.transform = 'translateY(-20px)';
      link.style.transition = 'none';
    });
    
    // Force reflow
    elements.navbarNav.offsetHeight;
    
    // Animate each link with stagger
    navLinks.forEach((link, index) => {
      link.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      
      setTimeout(() => {
        link.style.opacity = '1';
        link.style.transform = 'translateY(0)';
      }, index * 80); // 80ms stagger delay
    });
  }

  function animateMobileMenuClose() {
    const navLinks = elements.navbarNav.querySelectorAll('.nav-link');
    
    // Animate each link with reverse stagger
    navLinks.forEach((link, index) => {
      link.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      setTimeout(() => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(-20px)';
      }, index * 50); // Faster stagger for closing
    });
    
    // Hide the navbar after animation completes
    const totalDuration = navLinks.length * 50 + 300;
    setTimeout(() => {
      elements.navbarNav.classList.remove('show');
      
      // Reset styles
      navLinks.forEach(link => {
        link.style.opacity = '';
        link.style.transform = '';
        link.style.transition = '';
      });
    }, totalDuration);
  }

  function handleEscapeKey(event) {
    if (event.key === 'Escape' && elements.navbarNav && elements.navbarNav.classList.contains('show')) {
      handleMobileNavToggle();
    }
  }

  function handleClickOutside(event) {
    if (elements.navbarNav && elements.navbarNav.classList.contains('show') && 
        !elements.navbar.contains(event.target)) {
      handleMobileNavToggle();
    }
  }

  function initScrollEffects() {
    let ticking = false;
    
    function updateNavbar() {
      const scrolled = window.scrollY > 50;
      
      if (scrolled !== state.isScrolled) {
        state.isScrolled = scrolled;
        
        if (elements.navbar) {
          if (scrolled) {
            elements.navbar.classList.add('scrolled');
          } else {
            elements.navbar.classList.remove('scrolled');
          }
        }
      }
      
      ticking = false;
    }

    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    }

    window.addEventListener('scroll', requestTick);
  }

  // ===== SMOOTH SCROLLING =====
  
  function initSmoothScrolling() {
    // Add smooth scrolling to navigation links
    elements.navLinks.forEach(link => {
      link.addEventListener('click', handleSmoothScroll);
    });
  }

  function handleSmoothScroll(event) {
    const href = event.currentTarget.getAttribute('href');
    
    // Only handle internal links
    if (!href.startsWith('#')) return;
    
    event.preventDefault();
    
    const target = document.querySelector(href);
    if (!target) return;
    
    // Close mobile navbar if open
    if (elements.navbarNav && elements.navbarNav.classList.contains('show')) {
      handleMobileNavToggle();
    }
    
    // Use native smooth scrolling with proper navbar offset
    const headerHeight = elements.navbar?.offsetHeight || 0;
    const navbarPadding = 40; // Additional padding to prevent overlap
    const targetPosition = target.offsetTop - headerHeight - navbarPadding;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // Update active navigation
    updateActiveNavigation(href);
  }

  function updateActiveNavigation(href) {
    elements.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === href) {
        link.classList.add('active');
      }
    });
  }

  function updateActiveNavigationOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
      let current = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= (sectionTop - 200)) {
          current = section.getAttribute('id');
        }
      });
      
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // ===== INTERSECTION OBSERVER =====
  
  function initIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          state.currentSection = sectionId;
          
          // Update active navigation
          updateActiveNavigation(`#${sectionId}`);
          
          // Add entrance animation class
          entry.target.classList.add('section-visible');
        }
      });
    }, observerOptions);

    // Observe all sections
    elements.sections.forEach(section => {
      observer.observe(section);
    });
  }

  // ===== TOOLTIP LABELS =====
  
  function initTooltipLabels() {
    // Initialize tooltips for icons and interactive elements
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      const tooltipText = element.dataset.tooltip;
      
      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'custom-tooltip';
      tooltip.textContent = tooltipText;
      tooltip.setAttribute('role', 'tooltip');
      
      // Position tooltip
      positionTooltip(element, tooltip);
      
      // Add event listeners
      element.addEventListener('mouseenter', () => showTooltip(tooltip));
      element.addEventListener('mouseleave', () => hideTooltip(tooltip));
      element.addEventListener('focus', () => showTooltip(tooltip));
      element.addEventListener('blur', () => hideTooltip(tooltip));
    });
  }

  function positionTooltip(element, tooltip) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Position above element by default
    tooltip.style.position = 'absolute';
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
    tooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;
    
    // Add to body
    document.body.appendChild(tooltip);
  }

  function showTooltip(tooltip) {
    tooltip.style.opacity = '1';
    tooltip.style.visibility = 'visible';
  }

  function hideTooltip(tooltip) {
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
  }

  // ===== FORM HANDLING =====
  
  function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
      
      // Add real-time validation
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
      });
    });
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // Basic validation
    if (validateForm(form)) {
      // Show success message
      showFormMessage(form, 'Message sent successfully!', 'success');
      
      // Reset form
      form.reset();
    }
  }

  function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      if (!validateField({ target: field })) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    
    clearFieldError({ target: field });
    
    if (isRequired && !value) {
      showFieldError(field, 'This field is required');
      return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
      }
    }
    
    return true;
  }

  function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    field.classList.add('error');
  }

  function clearFieldError(event) {
    const field = event.target;
    const errorDiv = field.parentNode.querySelector('.field-error');
    
    if (errorDiv) {
      errorDiv.remove();
    }
    
    field.classList.remove('error');
  }

  function showFormMessage(form, message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    
    form.appendChild(messageDiv);
    
    // Remove message after 5 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }

  // ===== PERFORMANCE OPTIMIZATIONS =====
  
  function initPerformanceOptimizations() {
    // Lazy load images
    initLazyLoading();
    
    // Debounce resize events
    initResizeHandler();
    
    // Preload critical resources
    preloadCriticalResources();
  }

  function initLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

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

  function initResizeHandler() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Handle resize events
        updateLayoutOnResize();
      }, 250);
    });
  }

  function updateLayoutOnResize() {
    // Update any layout-dependent elements
    if (elements.projectGrid) {
      // Trigger layout recalculation for project grid
      elements.projectGrid.style.display = 'none';
      elements.projectGrid.offsetHeight; // Force reflow
      elements.projectGrid.style.display = '';
    }
  }

  function preloadCriticalResources() {
    // Preload critical CSS and fonts
    const criticalResources = [
      '/css/themes.css',
      '/css/main.css'
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = 'style';
      document.head.appendChild(link);
    });
  }

  // ===== ACCESSIBILITY ENHANCEMENTS =====
  
  function initAccessibilityEnhancements() {
    // Skip to content functionality
    initSkipToContent();
    
    // Keyboard navigation
    initKeyboardNavigation();
    
    // Focus management
    initFocusManagement();
  }

  function initSkipToContent() {
    if (!elements.skipLink || !elements.mainContent) return;

    elements.skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      
      elements.mainContent.focus();
      elements.mainContent.scrollIntoView({ behavior: 'smooth' });
      
      // Announce to screen readers
      announceToScreenReader('Navigated to main content');
    });
  }

  function initKeyboardNavigation() {
    // Handle tab navigation
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  function initFocusManagement() {
    // Trap focus in modals when they're open
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (firstElement && lastElement) {
        modal.addEventListener('keydown', (event) => {
          if (event.key === 'Tab') {
            if (event.shiftKey) {
              if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
              }
            }
          }
        });
      }
    });
  }

  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }

  // ===== PASSWORD AUTHENTICATION =====
  
  function initPasswordAuthentication() {
    // Check if user is already authenticated
    if (sessionStorage.getItem('portfolioAuthenticated') === 'true') {
      state.isAuthenticated = true;
      showMainContent();
      return;
    }

    // Show password modal
    showPasswordModal();
    
    // Add event listeners
    if (elements.submitPassword) {
      elements.submitPassword.addEventListener('click', handlePasswordSubmit);
    }
    
    if (elements.passwordForm) {
      elements.passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handlePasswordSubmit();
      });
    }
    
    if (elements.passwordInput) {
      elements.passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handlePasswordSubmit();
        }
      });
    }
    
    if (elements.togglePassword) {
      elements.togglePassword.addEventListener('click', togglePasswordVisibility);
    }
  }

  function handlePasswordSubmit() {
    const enteredPassword = elements.passwordInput.value;
    
    if (enteredPassword === CONFIG.password) {
      authenticateUser();
    } else {
      showPasswordError();
    }
  }

  function authenticateUser() {
    state.isAuthenticated = true;
    sessionStorage.setItem('portfolioAuthenticated', 'true');
    
    // Hide password modal with animation
    if (elements.passwordModal) {
      elements.passwordModal.style.opacity = '0';
      elements.passwordModal.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        elements.passwordModal.style.display = 'none';
        showMainContent();
      }, 300);
    }
  }

  function showPasswordError() {
    if (elements.passwordError) {
      elements.passwordError.style.display = 'block';
      elements.passwordError.style.opacity = '1';
    }
    
    if (elements.passwordInput) {
      elements.passwordInput.classList.add('error');
      elements.passwordInput.value = '';
      elements.passwordInput.focus();
    }
    
    // Remove error after 3 seconds
    setTimeout(() => {
      if (elements.passwordError) {
        elements.passwordError.style.opacity = '0';
        setTimeout(() => {
          elements.passwordError.style.display = 'none';
        }, 300);
      }
      if (elements.passwordInput) {
        elements.passwordInput.classList.remove('error');
      }
    }, 3000);
  }

  function togglePasswordVisibility() {
    if (!elements.passwordInput || !elements.togglePassword) return;
    
    const input = elements.passwordInput;
    const icon = elements.togglePassword.querySelector('i');
    
    if (state.isPasswordVisible) {
      input.type = 'password';
      icon.className = 'fas fa-eye';
      state.isPasswordVisible = false;
    } else {
      input.type = 'text';
      icon.className = 'fas fa-eye-slash';
      state.isPasswordVisible = true;
    }
  }

  function showPasswordModal() {
    if (elements.passwordModal) {
      elements.passwordModal.style.display = 'flex';
      elements.passwordModal.style.opacity = '1';
      elements.passwordModal.style.transform = 'scale(1)';
    }
    
    if (elements.mainContent) {
      elements.mainContent.style.display = 'none';
    }
  }

  function showMainContent() {
    if (elements.mainContent) {
      elements.mainContent.style.display = 'block';
    }
    
    if (elements.passwordModal) {
      elements.passwordModal.style.display = 'none';
    }
  }

  // ===== IMAGE SLIDER =====
  
  function initImageSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const sliderItems = document.querySelectorAll('.slider-item');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalClose = document.querySelector('.modal-close');
    const modalPrevBtn = document.querySelector('.modal-btn.prev-btn');
    const modalNextBtn = document.querySelector('.modal-btn.next-btn');
    
    if (!sliderTrack || !sliderItems.length) return;
    
    let currentModalIndex = 0;
    const originalImages = 7; // Number of original images
    
    // Manual scroll controls
    function scrollLeft() {
      const currentScroll = sliderTrack.scrollLeft || 0;
      const itemWidth = 300 + 24; // item width + gap
      sliderTrack.scrollTo({
        left: currentScroll - itemWidth,
        behavior: 'smooth'
      });
    }
    
    function scrollRight() {
      const currentScroll = sliderTrack.scrollLeft || 0;
      const itemWidth = 300 + 24; // item width + gap
      sliderTrack.scrollTo({
        left: currentScroll + itemWidth,
        behavior: 'smooth'
      });
    }
    
    // Modal functionality
    function openModal(index) {
      // Map the index to the original image set
      const originalIndex = index % originalImages;
      const imgSrc = sliderItems[originalIndex].querySelector('img').src;
      const imgAlt = sliderItems[originalIndex].querySelector('img').alt;
      
      modalImage.src = imgSrc;
      modalImage.alt = imgAlt;
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      currentModalIndex = originalIndex;
    }
    
    function closeModal() {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
    
    function modalNext() {
      const nextIndex = (currentModalIndex + 1) % originalImages;
      openModal(nextIndex);
    }
    
    function modalPrev() {
      const prevIndex = (currentModalIndex - 1 + originalImages) % originalImages;
      openModal(prevIndex);
    }
    
    // Event listeners
    sliderItems.forEach((item, index) => {
      item.addEventListener('click', () => openModal(index));
    });
    
    // Button controls
    if (prevBtn) prevBtn.addEventListener('click', scrollLeft);
    if (nextBtn) nextBtn.addEventListener('click', scrollRight);
    
    // Modal controls
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalPrevBtn) modalPrevBtn.addEventListener('click', modalPrev);
    if (modalNextBtn) modalNextBtn.addEventListener('click', modalNext);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (modal.classList.contains('show')) {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') modalPrev();
        if (e.key === 'ArrowRight') modalNext();
      } else {
        if (e.key === 'ArrowLeft') scrollLeft();
        if (e.key === 'ArrowRight') scrollRight();
      }
    });
    
    // Modal overlay click to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // Touch/swipe support for manual scrolling
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    
    sliderTrack.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - sliderTrack.offsetLeft;
      scrollLeft = sliderTrack.scrollLeft;
      sliderTrack.style.cursor = 'grabbing';
    });
    
    sliderTrack.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - sliderTrack.offsetLeft;
      const walk = (x - startX) * 2;
      sliderTrack.scrollLeft = scrollLeft - walk;
    });
    
    sliderTrack.addEventListener('mouseup', () => {
      isDragging = false;
      sliderTrack.style.cursor = 'grab';
    });
    
    sliderTrack.addEventListener('mouseleave', () => {
      isDragging = false;
      sliderTrack.style.cursor = 'grab';
    });
    
    // Touch events for mobile
    sliderTrack.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - sliderTrack.offsetLeft;
      scrollLeft = sliderTrack.scrollLeft;
    });
    
    sliderTrack.addEventListener('touchmove', (e) => {
      if (!startX) return;
      const x = e.touches[0].pageX - sliderTrack.offsetLeft;
      const walk = (x - startX) * 2;
      sliderTrack.scrollLeft = scrollLeft - walk;
    });
    
    sliderTrack.addEventListener('touchend', () => {
      startX = null;
    });
  }

  // ===== INITIALIZATION =====
  
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Cache DOM elements
    cacheElements();
    
    // Initialize password authentication first
    initPasswordAuthentication();
    
    // Only initialize other functionality if authenticated
    if (state.isAuthenticated) {
      initProjectFilters();
      initNavbarAccessibility();
      initSmoothScrolling();
      initIntersectionObserver();
      initTooltipLabels();
      initFormHandling();
      initPerformanceOptimizations();
      initAccessibilityEnhancements();
      initImageSlider();
    }
    
    // Dispatch custom event when initialization is complete
    window.dispatchEvent(new CustomEvent('mainInitialized'));
  }

  // ===== EXPORTS =====
  
  // Make functions available globally if needed
  window.MainApp = {
    init,
    state,
    filterProjects,
    updateActiveNavigation,
    handleMobileNavToggle
  };

  // Auto-initialize
  init();

})();
