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
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalClose = document.querySelector('.modal-close');
    const modalPrevBtn = document.querySelector('.modal-btn.prev-btn');
    const modalNextBtn = document.querySelector('.modal-btn.next-btn');
    
    if (!sliderTrack || !sliderItems.length) return;
    
    let currentModalIndex = 0;
    const originalImages = 7; // Number of original images
    let isAutoScrolling = true;
    
    // Auto-scroll functionality
    let autoScrollInterval;
    let scrollDirection = 1; // 1 for right, -1 for left
    
    function startAutoScroll() {
      isAutoScrolling = true;
      if (autoScrollInterval) clearInterval(autoScrollInterval);
      autoScrollInterval = setInterval(() => {
        if (!isAutoScrolling) return;
        
        const maxScroll = sliderTrack.scrollWidth - sliderTrack.clientWidth;
        const currentScroll = sliderTrack.scrollLeft;
        
        // Reverse direction when reaching the end
        if (currentScroll >= maxScroll) {
          scrollDirection = -1;
        } else if (currentScroll <= 0) {
          scrollDirection = 1;
        }
        
        sliderTrack.scrollLeft += scrollDirection * 2; // Slow scroll speed
      }, 50); // Update every 50ms for smooth movement
    }
    
    function pauseAutoScroll() {
      isAutoScrolling = false;
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    }
    

    
    // Modal functionality
    function openModal(index) {
      console.log('Opening modal for index:', index);
      const item = sliderItems[index];
      const isVideo = item.classList.contains('video-item');
      
      console.log('Is video:', isVideo);
      console.log('Modal element:', modal);
      console.log('Modal image element:', modalImage);
      console.log('Modal video element:', modalVideo);
      
      if (isVideo) {
        // Handle video
        const videoSrc = item.getAttribute('data-src');
        console.log('Video src:', videoSrc);
        modalVideo.src = videoSrc;
        modalVideo.style.display = 'block';
        modalImage.style.display = 'none';
        
        // Play the video
        modalVideo.play().catch(e => console.log('Video autoplay prevented:', e));
      } else {
        // Handle image
        const imgSrc = item.querySelector('img').src;
        const imgAlt = item.querySelector('img').alt;
        console.log('Image src:', imgSrc);
        
        modalImage.src = imgSrc;
        modalImage.alt = imgAlt;
        modalImage.style.display = 'block';
        modalVideo.style.display = 'none';
      }
      
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      console.log('Modal classes after adding show:', modal.className);
      
      currentModalIndex = index;
    }
    
    function closeModal() {
      // Pause video if playing
      if (modalVideo.src) {
        modalVideo.pause();
        modalVideo.src = '';
      }
      
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
    
    function modalNext() {
      const nextIndex = (currentModalIndex + 1) % sliderItems.length;
      openModal(nextIndex);
    }
    
    function modalPrev() {
      const prevIndex = (currentModalIndex - 1 + sliderItems.length) % sliderItems.length;
      openModal(prevIndex);
    }
    
    // Event listeners
    sliderItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        console.log('Slider item clicked:', index);
        openModal(index);
      });
    });
    
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
      }
    });
    
    // Modal overlay click to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // Enhanced drag functionality
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let dragVelocity = 0;
    let lastDragTime = 0;
    
    // Enable horizontal scrolling for drag
    sliderTrack.style.overflowX = 'auto';
    sliderTrack.style.scrollBehavior = 'auto';
    
    sliderTrack.addEventListener('mousedown', (e) => {
      isDragging = true;
      pauseAutoScroll();
      startX = e.pageX;
      startScrollLeft = sliderTrack.scrollLeft;
      lastDragTime = Date.now();
      
      sliderTrack.style.cursor = 'grabbing';
      sliderTrack.style.userSelect = 'none';
      sliderTrack.style.scrollBehavior = 'auto';
    });
    
    sliderTrack.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const currentTime = Date.now();
      const deltaTime = currentTime - lastDragTime;
      const walk = (e.pageX - startX) * 2; // Drag sensitivity
      
      // Calculate velocity for momentum
      if (deltaTime > 0) {
        dragVelocity = walk / deltaTime;
      }
      
      sliderTrack.scrollLeft = startScrollLeft - walk;
      lastDragTime = currentTime;
    });
    
    sliderTrack.addEventListener('mouseup', () => {
      isDragging = false;
      sliderTrack.style.cursor = 'grab';
      sliderTrack.style.userSelect = 'auto';
      
      // Apply momentum effect
      if (Math.abs(dragVelocity) > 0.5) {
        const momentum = dragVelocity * 200;
        sliderTrack.scrollLeft = sliderTrack.scrollLeft - momentum;
        sliderTrack.style.scrollBehavior = 'smooth';
      }
      
      // Resume auto-scroll after manual interaction
      setTimeout(() => {
        sliderTrack.style.scrollBehavior = 'auto';
        startAutoScroll();
      }, 3000);
    });
    
    sliderTrack.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        sliderTrack.style.cursor = 'grab';
        sliderTrack.style.userSelect = 'auto';
        sliderTrack.style.scrollBehavior = 'smooth';
        // Resume auto-scroll after manual interaction
        setTimeout(() => {
          sliderTrack.style.scrollBehavior = 'auto';
          startAutoScroll();
        }, 3000);
      }
    });
    
    // Touch events for mobile
    sliderTrack.addEventListener('touchstart', (e) => {
      pauseAutoScroll();
      startX = e.touches[0].pageX;
      startScrollLeft = sliderTrack.scrollLeft;
      lastDragTime = Date.now();
      
      sliderTrack.style.userSelect = 'none';
      sliderTrack.style.scrollBehavior = 'auto';
    });
    
    sliderTrack.addEventListener('touchmove', (e) => {
      if (!startX) return;
      e.preventDefault();
      const currentTime = Date.now();
      const deltaTime = currentTime - lastDragTime;
      const walk = (e.touches[0].pageX - startX) * 2; // Drag sensitivity
      
      // Calculate velocity for momentum
      if (deltaTime > 0) {
        dragVelocity = walk / deltaTime;
      }
      
      sliderTrack.scrollLeft = startScrollLeft - walk;
      lastDragTime = currentTime;
    });
    
    sliderTrack.addEventListener('touchend', () => {
      startX = null;
      sliderTrack.style.userSelect = 'auto';
      
      // Apply momentum effect
      if (Math.abs(dragVelocity) > 0.5) {
        const momentum = dragVelocity * 200;
        sliderTrack.scrollLeft = sliderTrack.scrollLeft - momentum;
        sliderTrack.style.scrollBehavior = 'smooth';
      }
      
      // Resume auto-scroll after manual interaction
      setTimeout(() => {
        sliderTrack.style.scrollBehavior = 'auto';
        startAutoScroll();
      }, 3000);
    });
    
    // Initialize auto-scroll
    startAutoScroll();
  }

  // ===== VIDEO AUTOPLAY =====
  
  function initVideoAutoplay() {
    // Create Intersection Observer for video autoplay
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          // Video is in view, play it
          video.play().catch(error => {
            console.log('Video autoplay failed:', error);
          });
        } else {
          // Video is out of view, pause it
          video.pause();
        }
      });
    }, {
      threshold: 0.5, // Trigger when 50% of video is visible
      rootMargin: '0px'
    });

    // Observe all videos in the project
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      videoObserver.observe(video);
    });
  }

  // ===== MOSAIC WALL =====
  
  function initMosaicWall() {
    const mosaicItems = document.querySelectorAll('.mosaic-item');
    const videoModal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const modalClose = videoModal?.querySelector('.modal-close');
    const modalOverlay = videoModal?.querySelector('.modal-overlay');
    
    console.log('Mosaic Wall Init:', {
      mosaicItems: mosaicItems.length,
      videoModal: !!videoModal,
      modalVideo: !!modalVideo,
      modalClose: !!modalClose,
      modalOverlay: !!modalOverlay
    });

    // GSAP animations for mosaic items
    mosaicItems.forEach((item, index) => {
      // Initial state
      gsap.set(item, {
        scale: 0.8,
        opacity: 0,
        y: 50
      });

      // Entrance animation
      gsap.to(item, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: "back.out(1.7)"
      });

      // Hover animations
      const videoWrapper = item.querySelector('.video-wrapper');
      const video = item.querySelector('video');
      const overlay = item.querySelector('.video-overlay');
      const playIcon = overlay?.querySelector('i');
      const title = overlay?.querySelector('span');

      // Mouse enter
      item.addEventListener('mouseenter', () => {
        gsap.to(item, {
          scale: 1.05,
          duration: 0.6,
          ease: "power2.out"
        });

        gsap.to(video, {
          scale: 1.1,
          duration: 0.6,
          ease: "power2.out"
        });

        gsap.to(overlay, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        });

        gsap.to(playIcon, {
          scale: 1.2,
          duration: 0.4,
          ease: "back.out(1.7)"
        });

        gsap.to(title, {
          y: 0,
          duration: 0.4,
          ease: "power2.out"
        });
      });

      // Mouse leave
      item.addEventListener('mouseleave', () => {
        gsap.to(item, {
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        });

        gsap.to(video, {
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        });

        gsap.to(overlay, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        });

        gsap.to(playIcon, {
          scale: 0.8,
          duration: 0.4,
          ease: "power2.out"
        });

        gsap.to(title, {
          y: 20,
          duration: 0.4,
          ease: "power2.out"
        });
      });

      // Click to open modal
      item.addEventListener('click', () => {
        const videoSrc = item.getAttribute('data-video');
        const videoTitle = item.getAttribute('data-title');
        const videoDescription = item.getAttribute('data-description');
        
        console.log('Mosaic item clicked:', {
          videoSrc,
          videoTitle,
          videoDescription,
          modalVideo: !!modalVideo,
          videoModal: !!videoModal
        });
        
        if (videoSrc && modalVideo) {
          // Update source elements
          const sources = modalVideo.querySelectorAll('source');
          sources.forEach((source, index) => {
            source.src = videoSrc;
          });
          
          // Update video description
          const titleElement = document.getElementById('videoTitle');
          const descriptionElement = document.getElementById('videoDescription');
          
          if (titleElement && videoTitle) {
            titleElement.textContent = videoTitle;
          }
          
          if (descriptionElement && videoDescription) {
            descriptionElement.textContent = videoDescription;
          }
          
          // Load the video
          modalVideo.load();
          console.log('Video loaded, modal display set to flex');
          
          // Show modal with animation
          gsap.set(videoModal, { display: 'flex' });
          gsap.fromTo(videoModal, 
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out" }
          );
          
          // Force video to be visible immediately
          modalVideo.style.opacity = '1';
          modalVideo.style.transform = 'scale(1)';
          modalVideo.style.transition = 'none';
          
          // Play the video after a short delay
          setTimeout(() => {
            console.log('Attempting to play video...');
            modalVideo.play().then(() => {
              console.log('Video playing successfully');
            }).catch(error => {
              console.log('Modal video play failed:', error);
            });
          }, 500);
        } else {
          console.log('Missing videoSrc or modalVideo element');
          console.log('videoSrc:', videoSrc);
          console.log('modalVideo:', modalVideo);
        }
      });
    });

    // Modal close functionality
    if (modalClose) {
      modalClose.addEventListener('click', closeVideoModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', closeVideoModal);
    }

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.style.display === 'flex') {
        closeVideoModal();
      }
    });

    function closeVideoModal() {
      // Simple fade out animation
      modalVideo.style.transition = 'all 0.3s ease';
      modalVideo.style.opacity = '0';
      modalVideo.style.transform = 'scale(0.8)';

      gsap.to(videoModal, {
        opacity: 0,
        duration: 0.3,
        delay: 0.1,
        ease: "power2.in",
        onComplete: () => {
          videoModal.style.display = 'none';
          if (modalVideo) {
            modalVideo.pause();
            // Clear source elements
            const sources = modalVideo.querySelectorAll('source');
            sources.forEach(source => {
              source.src = '';
            });
            modalVideo.load();
            // Reset video styles
            modalVideo.style.opacity = '';
            modalVideo.style.transform = '';
            modalVideo.style.transition = '';
          }
        }
      });
    }
  }

  // ===== GALLERY MODAL =====
  
  function initGalleryModal() {
    // Check for both gallery items (project2) and slider items (project3)
    const galleryItems = document.querySelectorAll('.gallery-item');
    const sliderItems = document.querySelectorAll('.slider-item');
    const clickableVideos = document.querySelectorAll('.clickable-video');
    const items = galleryItems.length > 0 ? galleryItems : sliderItems;
    
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalClose = modal.querySelector('.modal-close');
    const prevBtn = modal.querySelector('.nav-btn.prev-btn');
    const nextBtn = modal.querySelector('.nav-btn.next-btn');
    
    console.log('Gallery Modal Init:', {
      galleryItems: galleryItems.length,
      sliderItems: sliderItems.length,
      totalItems: items.length,
      modal: !!modal,
      modalImage: !!modalImage,
      modalClose: !!modalClose,
      prevBtn: !!prevBtn,
      nextBtn: !!nextBtn
    });
    
    if (!items.length || !modal) return;
    
    let currentIndex = 0;
    const images = Array.from(items).map(item => ({
      src: item.getAttribute('data-image') || item.querySelector('img')?.src || item.querySelector('video')?.src,
      title: item.getAttribute('data-title') || item.querySelector('img')?.alt || 'Project Image',
      description: item.getAttribute('data-description') || 'Project image from portfolio',
      type: item.getAttribute('data-video') ? 'video' : 'image'
    }));
    
    function openModal(index) {
      console.log('Opening modal for index:', index, 'Total images:', images.length);
      currentIndex = index;
      const image = images[index];
      
      console.log('Image data:', image);
      
      if (image.type === 'video') {
        // Show video, hide image
        modalImage.style.display = 'none';
        modalVideo.style.display = 'block';
        
        // Update video source
        const sources = modalVideo.querySelectorAll('source');
        sources.forEach(source => {
          source.src = image.src;
        });
        modalVideo.load();
        
        // Play video
        setTimeout(() => {
          modalVideo.play().catch(error => {
            console.log('Video play failed:', error);
          });
        }, 100);
      } else {
        // Show image, hide video
        modalImage.style.display = 'block';
        modalVideo.style.display = 'none';
        
        modalImage.src = image.src;
        modalImage.alt = image.title;
      }
      
      if (modalTitle) modalTitle.textContent = image.title;
      if (modalDescription) modalDescription.textContent = image.description;
      
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      console.log('Modal opened successfully');
    }
    
    function closeModal() {
      console.log('closeModal function called');
      
      // Pause video if playing
      if (modalVideo) {
        modalVideo.pause();
        // Clear video source
        const sources = modalVideo.querySelectorAll('source');
        sources.forEach(source => {
          source.src = '';
        });
        modalVideo.load();
      }
      
      modal.classList.remove('show');
      document.body.style.overflow = '';
      console.log('Modal closed successfully');
    }
    
    function nextImage() {
      console.log('Next image called, current index:', currentIndex);
      currentIndex = (currentIndex + 1) % images.length;
      console.log('New index:', currentIndex);
      openModal(currentIndex);
    }
    
    function prevImage() {
      console.log('Previous image called, current index:', currentIndex);
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      console.log('New index:', currentIndex);
      openModal(currentIndex);
    }
    
    // Event listeners
    items.forEach((item, index) => {
      item.addEventListener('click', () => {
        console.log('Item clicked:', index);
        openModal(index);
      });
    });
    
    // Clickable video event listeners
    clickableVideos.forEach((videoContainer) => {
      videoContainer.addEventListener('click', () => {
        const videoSrc = videoContainer.getAttribute('data-video');
        const videoTitle = videoContainer.getAttribute('data-title');
        const videoDescription = videoContainer.getAttribute('data-description');
        
        console.log('Clickable video clicked:', {
          videoSrc,
          videoTitle,
          videoDescription,
          modalVideo: !!modalVideo,
          modalVideoElement: modalVideo
        });
        
        if (videoSrc && modalVideo) {
          console.log('Setting up modal video display');
          // Show video, hide image
          modalImage.style.display = 'none';
          modalVideo.style.display = 'block';
          modalVideo.classList.add('show');
          
          console.log('Modal video display style:', modalVideo.style.display);
          console.log('Modal video computed style:', window.getComputedStyle(modalVideo).display);
          console.log('Modal video dimensions:', {
            width: modalVideo.offsetWidth,
            height: modalVideo.offsetHeight,
            clientWidth: modalVideo.clientWidth,
            clientHeight: modalVideo.clientHeight
          });
          
          // Update video source
          const sources = modalVideo.querySelectorAll('source');
          sources.forEach(source => {
            source.src = videoSrc;
          });
          modalVideo.load();
          
          // Update title and description
          if (modalTitle) modalTitle.textContent = videoTitle;
          if (modalDescription) modalDescription.textContent = videoDescription;
          
          // Show modal
          modal.classList.add('show');
          document.body.style.overflow = 'hidden';
          
          console.log('Modal content dimensions:', {
            modalWidth: modal.offsetWidth,
            modalHeight: modal.offsetHeight,
            contentWidth: modal.querySelector('.modal-content').offsetWidth,
            contentHeight: modal.querySelector('.modal-content').offsetHeight
          });
          
          // Play video with audio
          setTimeout(() => {
            modalVideo.play().then(() => {
              console.log('Modal video playing with audio');
            }).catch(error => {
              console.log('Modal video play failed:', error);
            });
          }, 100);
        }
      });
    });
    
    if (modalClose) {
      console.log('Close button found:', modalClose);
      modalClose.addEventListener('click', () => {
        console.log('Close button clicked');
        closeModal();
      });
    } else {
      console.log('Close button NOT found');
    }
    if (prevBtn) {
      console.log('Previous button found:', prevBtn);
      prevBtn.addEventListener('click', () => {
        console.log('Previous button clicked');
        prevImage();
      });
    } else {
      console.log('Previous button NOT found');
    }
    if (nextBtn) {
      console.log('Next button found:', nextBtn);
      nextBtn.addEventListener('click', () => {
        console.log('Next button clicked');
        nextImage();
      });
    } else {
      console.log('Next button NOT found');
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (modal.classList.contains('show')) {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
      }
    });
    
    // Modal overlay click to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
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
      initVideoAutoplay();
      initMosaicWall();
      initGalleryModal();
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
