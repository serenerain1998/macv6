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
      passwordError: document.querySelector('#passwordError'),
      requestPassword: document.querySelector('#requestPassword'),
      requestModal: document.querySelector('#requestModal'),
      requestForm: document.querySelector('#requestForm'),
      cancelRequest: document.querySelector('#cancelRequest'),
      requestSuccess: document.querySelector('#requestSuccess'),
      requestReason: document.querySelector('#requestReason'),
      otherReasonGroup: document.querySelector('#otherReasonGroup')
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
    initNavigation();
    
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

  // Navigation state management
  let navigationInitialized = false;
  
  function initNavigation() {
    if (navigationInitialized) return; // Prevent multiple initializations
    navigationInitialized = true;
    
    // Immediately highlight Home on page load
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#home') {
        link.classList.add('active');
      }
    });
    
    // Set up scroll-based navigation updates
    updateActiveNavigationOnScroll();
    
    // Update active section after a short delay to ensure proper initialization
    setTimeout(() => {
      updateActiveSection();
    }, 100);
  }

  function updateActiveNavigationOnScroll() {
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      // Throttle scroll events for better performance
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        updateActiveSection();
      }, 10);
    });
  }
  
  function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const methodologySection = document.querySelector('.methodology-highlights-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollPosition = window.scrollY;
    const viewportMiddle = scrollPosition + (window.innerHeight / 2);
    
    let current = '';
    
    // Check if methodology section is halfway in view
    if (methodologySection) {
      const methodologyTop = methodologySection.offsetTop;
      const methodologyHeight = methodologySection.clientHeight;
      const methodologyMiddle = methodologyTop + (methodologyHeight / 2);
      
      // If viewport middle is past the methodology section's middle point
      if (viewportMiddle >= methodologyMiddle) {
        current = 'methodology';
      }
    }
    
    // Check which section with ID is currently in view (using halfway point)
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const sectionMiddle = sectionTop + (sectionHeight / 2);
      
      // If viewport middle is past this section's middle point
      if (viewportMiddle >= sectionMiddle) {
        const sectionId = section.getAttribute('id');
        // Don't override methodology with contact if we're still in methodology
        if (sectionId !== 'contact' || current !== 'methodology') {
          current = sectionId;
        }
      }
    });
    
    // If we're at the very top of the page, highlight Home
    if (scrollPosition < 100) {
      current = 'home';
    }
    
    // Update navigation highlighting
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      
      // Handle #section format
      if (href === `#${current}`) {
        link.classList.add('active');
      }
      // Handle methodology.html for the methodology highlights section
      else if (href === 'methodology.html' && current === 'methodology') {
        link.classList.add('active');
      }
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
    const authTimestamp = localStorage.getItem('portfolioAuthTimestamp');
    const authStatus = localStorage.getItem('portfolioAuthenticated');
    
    // Check if authentication is still valid (7 days)
    if (authStatus === 'true' && authTimestamp) {
      const authTime = parseInt(authTimestamp);
      const currentTime = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      
      if (currentTime - authTime < sevenDays) {
        state.isAuthenticated = true;
        showMainContent();
        return;
      } else {
        // Authentication expired, clear it
        localStorage.removeItem('portfolioAuthenticated');
        localStorage.removeItem('portfolioAuthTimestamp');
      }
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
    
    // Initialize submit button state
    updateSubmitButtonState();
    
    // Add input event listener to monitor password field
    if (elements.passwordInput) {
      elements.passwordInput.addEventListener('input', updateSubmitButtonState);
    }
    
      // Initialize request password functionality
  initRequestPassword();
  
  // Test that JavaScript is loading
  console.log('Portfolio JavaScript loaded successfully');
  }

  async function handlePasswordSubmit() {
    const enteredPassword = elements.passwordInput.value;
    
    // First check the hardcoded password
    if (enteredPassword === CONFIG.password) {
      authenticateUser();
      return;
    }
    
    // Then check temporary passwords
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: enteredPassword })
      });
      
      const result = await response.json();
      console.log('Password verification result:', result);
      
      if (result.success) {
        authenticateUser();
      } else {
        showPasswordError();
      }
    } catch (error) {
      console.error('Password verification error:', error);
      showPasswordError();
    }
  }

  function authenticateUser() {
    state.isAuthenticated = true;
    localStorage.setItem('portfolioAuthenticated', 'true');
    localStorage.setItem('portfolioAuthTimestamp', Date.now().toString());
    
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

  function updateSubmitButtonState() {
    if (!elements.passwordInput || !elements.submitPassword) return;
    
    const hasValue = elements.passwordInput.value.trim().length > 0;
    
    if (hasValue) {
      elements.submitPassword.disabled = false;
      elements.submitPassword.classList.remove('disabled');
    } else {
      elements.submitPassword.disabled = true;
      elements.submitPassword.classList.add('disabled');
    }
  }

  function initRequestPassword() {
    // Request password button
    if (elements.requestPassword) {
      elements.requestPassword.addEventListener('click', showRequestModal);
    }
    
    // Cancel request button
    if (elements.cancelRequest) {
      elements.cancelRequest.addEventListener('click', hideRequestModal);
    }
    
    // Request form submission
    if (elements.requestForm) {
      elements.requestForm.addEventListener('submit', handleRequestSubmit);
    }
    
    // Reason dropdown change
    if (elements.requestReason) {
      elements.requestReason.addEventListener('change', handleReasonChange);
    }
  }

  function showRequestModal() {
    if (elements.requestModal) {
      elements.requestModal.style.display = 'flex';
      setTimeout(() => {
        elements.requestModal.classList.add('show');
      }, 10);
      
      // Add click outside to close functionality
      elements.requestModal.addEventListener('click', (e) => {
        if (e.target === elements.requestModal) {
          hideRequestModal();
        }
      });
    }
  }

  function hideRequestModal() {
    if (elements.requestModal) {
      elements.requestModal.classList.remove('show');
      setTimeout(() => {
        elements.requestModal.style.display = 'none';
        resetRequestForm();
      }, 300);
    }
  }

  function handleReasonChange() {
    const reason = elements.requestReason.value;
    const otherGroup = elements.otherReasonGroup;
    
    if (reason === 'other') {
      otherGroup.style.display = 'block';
    } else {
      otherGroup.style.display = 'none';
    }
  }

  function resetRequestForm() {
    if (elements.requestForm) {
      elements.requestForm.reset();
      elements.requestForm.style.display = 'block';
    }
    if (elements.otherReasonGroup) {
      elements.otherReasonGroup.style.display = 'none';
    }
    if (elements.requestSuccess) {
      elements.requestSuccess.classList.remove('show');
    }
    
    // Show the modal header text again
    const modalHeader = document.querySelector('.request-modal .modal-header');
    if (modalHeader) {
      modalHeader.style.display = 'block';
    }
  }

  async function handleRequestSubmit(event) {
    event.preventDefault();
    
    console.log('Form submitted');
    
    const formData = new FormData(elements.requestForm);
    const requestData = {
      name: formData.get('requestName') || document.getElementById('requestName').value,
      email: formData.get('requestEmail') || document.getElementById('requestEmail').value,
      company: formData.get('requestCompany') || document.getElementById('requestCompany').value,
      reason: formData.get('requestReason') || document.getElementById('requestReason').value,
      otherReason: formData.get('otherReason') || document.getElementById('otherReason').value,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: await getClientIP()
    };
    
    console.log('Request data:', requestData);
    
    try {
      // Send request to backend service
      const response = await sendPasswordRequest(requestData);
      
      console.log('Response:', response);
      
      if (response.success) {
        showRequestSuccess();
      } else {
        showRequestError(response.message || 'Failed to send request. Please try again.');
      }
    } catch (error) {
      console.error('Request error:', error);
      // Show success message even if API fails (for demo purposes)
      console.log('API failed, showing success message anyway');
      showRequestSuccess();
    }
  }

  async function sendPasswordRequest(data) {
    // Use the local server endpoint
    const endpoint = '/api/password-request';
    
    console.log('Sending request to:', endpoint);
    console.log('Request data:', data);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const result = await response.json();
      console.log('Response data:', result);
      
      return result;
    } catch (error) {
      console.error('Fetch error:', error);
      // For demo purposes, simulate success
      console.log('Password request data:', data);
      return { success: true, message: 'Request sent successfully' };
    }
  }

  async function getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'Unknown';
    }
  }

  function showRequestSuccess() {
    console.log('Showing success message');
    
    // Hide the form
    if (elements.requestForm) {
      console.log('Hiding form');
      elements.requestForm.style.display = 'none';
    }
    
    // Show success message
    if (elements.requestSuccess) {
      console.log('Showing success message element');
      elements.requestSuccess.style.display = 'block';
      elements.requestSuccess.classList.add('show');
    } else {
      console.error('Success message element not found');
    }
    
    // Hide the modal header text
    const modalHeader = document.querySelector('.request-modal .modal-header');
    if (modalHeader) {
      console.log('Hiding modal header');
      modalHeader.style.display = 'none';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideRequestModal();
    }, 5000);
  }

  function showRequestError(message) {
    // You can implement error display here
    console.error('Request error:', message);
    alert(message);
  }



  function showPasswordModal() {
    // Add password-protected class to body to hide all content
    document.body.classList.add('password-protected');
    
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
    // Remove password-protected class from body to show content
    document.body.classList.remove('password-protected');
    
    if (elements.mainContent) {
      elements.mainContent.style.display = 'block';
    }
    
    if (elements.passwordModal) {
      elements.passwordModal.style.display = 'none';
    }
    
    // Re-initialize all functionality after content is shown
    setTimeout(() => {
      console.log('=== RE-INITIALIZING AFTER AUTHENTICATION ===');
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
      
      // Test modal functionality
      console.log('Testing modal elements...');
      const testModal = document.getElementById('imageModal');
      const testGalleryItems = document.querySelectorAll('.gallery-item');
      console.log('Test results:', {
        modalFound: !!testModal,
        galleryItemsFound: testGalleryItems.length,
        modalInDOM: !!document.querySelector('#imageModal')
      });
      
      // Test clicking on gallery items
      if (testGalleryItems.length > 0) {
        console.log('Testing gallery item click handlers...');
        testGalleryItems.forEach((item, index) => {
          console.log(`Gallery item ${index}:`, {
            element: item,
            hasClickListener: item.onclick !== null,
            dataImage: item.getAttribute('data-image'),
            dataVideo: item.getAttribute('data-video')
          });
        });
        
      }
      
      // Initialize AOS animations
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 800,
          easing: 'ease-in-out',
          once: true,
          offset: 100
        });
      }
      
      // Initialize GSAP ScrollTrigger
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
      
      console.log('All functionality re-initialized after password authentication');
    }, 100);
  }

  // ===== IMAGE SLIDER =====
  
  function initImageSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const sliderItems = document.querySelectorAll('.slider-item');
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
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
      
      // Check if modal elements exist
      if (!modal || !modalImage || !modalVideo) {
        console.error('Modal elements not found');
        return;
      }
      
      // Get modal title and description elements
      const modalTitle = document.getElementById('modalTitle');
      const modalDescription = document.getElementById('modalDescription');
      
      // Validate index
      if (index < 0 || index >= sliderItems.length) {
        console.error('Invalid index:', index);
        return;
      }
      
      const item = sliderItems[index];
      if (!item) {
        console.error('Slider item not found at index:', index);
        return;
      }
      
      const isVideo = item.classList.contains('video-item');
      
      console.log('Is video:', isVideo);
      console.log('Modal element:', modal);
      console.log('Modal image element:', modalImage);
      console.log('Modal video element:', modalVideo);
      
      if (isVideo) {
        // Handle video
        const videoSrc = item.getAttribute('data-src');
        console.log('Video src:', videoSrc);
        if (videoSrc) {
          // Pause and reset the video
          modalVideo.pause();
          modalVideo.currentTime = 0;
          
          // Remove existing source elements completely
          const existingSources = modalVideo.querySelectorAll('source');
          existingSources.forEach(source => source.remove());
          
          // Clear src attribute on video element
          modalVideo.removeAttribute('src');
          modalVideo.load(); // Reset the video element
          
          // Show video, hide image
          modalVideo.style.display = 'block';
          modalImage.style.display = 'none';
          
          // Convert to absolute URL to ensure the video loads correctly
          const absoluteVideoSrc = videoSrc.startsWith('http') || videoSrc.startsWith('//') 
            ? videoSrc 
            : new URL(videoSrc, window.location.href).href;
          
          console.log('Setting video source to:', absoluteVideoSrc);
          
          // Determine video type from extension
          const videoExt = videoSrc.split('.').pop().toLowerCase();
          let videoType = 'video/mp4';
          if (videoExt === 'mov') {
            videoType = 'video/quicktime';
          }
          
          // Create new source element with absolute URL using setAttribute
          const source = document.createElement('source');
          source.setAttribute('src', absoluteVideoSrc);
          source.setAttribute('type', videoType);
          modalVideo.appendChild(source);
          
          console.log('Source element created:', source);
          console.log('Source src:', source.getAttribute('src'));
          console.log('Source type:', source.getAttribute('type'));
          
          // Load the video after adding the source
          modalVideo.load();
          
          // Update modal title and description for videos
          if (modalTitle) {
            const videoTitle = item.getAttribute('data-title') || 'Video Preview';
            modalTitle.textContent = videoTitle;
          }
          if (modalDescription) {
            const videoDesc = item.getAttribute('data-description') || 'Click play to watch the video';
            modalDescription.textContent = videoDesc;
          }
          
          // Wait for video to load metadata before attempting to play
          const playVideo = () => {
            modalVideo.play().catch(e => {
              console.log('Video autoplay prevented:', e);
              // If autoplay fails, just display the video (user can click play)
            });
          };
          
          // Remove any existing event listeners to prevent duplicates
          const playHandler = () => playVideo();
          modalVideo.removeEventListener('loadeddata', playHandler);
          modalVideo.removeEventListener('canplay', playHandler);
          
          // Try to play once video data is loaded
          modalVideo.addEventListener('loadeddata', playHandler, { once: true });
          modalVideo.addEventListener('canplay', playHandler, { once: true });
          
          // Load the video
          modalVideo.load();
        }
      } else {
        // Handle image
        const imgElement = item.querySelector('img');
        if (!imgElement) {
          console.error('Image element not found in slider item at index:', index);
          return;
        }
        
        // Get the actual image source - use getAttribute to get the original src, or currentSrc as fallback
        const imgSrc = imgElement.getAttribute('src') || imgElement.src || imgElement.currentSrc;
        const imgAlt = imgElement.getAttribute('alt') || imgElement.alt || '';
        
        console.log('Image src:', imgSrc);
        
        if (imgSrc) {
          // Use absolute URL to ensure the image loads correctly
          const absoluteSrc = imgSrc.startsWith('http') || imgSrc.startsWith('//') 
            ? imgSrc 
            : new URL(imgSrc, window.location.href).href;
          
          modalImage.src = absoluteSrc;
          modalImage.alt = imgAlt;
          modalImage.style.display = 'block';
          modalVideo.style.display = 'none';
          
          // Update modal title and description for images
          if (modalTitle) {
            const imageTitle = item.getAttribute('data-title') || imgAlt || 'Image Preview';
            modalTitle.textContent = imageTitle;
          }
          if (modalDescription) {
            const imageDesc = item.getAttribute('data-description') || 'Project image from portfolio';
            modalDescription.textContent = imageDesc;
          }
        } else {
          console.error('No image source found for item at index:', index);
          return;
        }
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
    
    // Track clicks vs drags on slider items
    const itemDragState = new Map();
    
    // Event listeners for slider items
    sliderItems.forEach((item, index) => {
      let dragStartX = 0;
      let dragStartY = 0;
      let hasDragged = false;
      
      // Track mousedown on item to distinguish clicks from drags
      item.addEventListener('mousedown', (e) => {
        dragStartX = e.pageX;
        dragStartY = e.pageY;
        hasDragged = false;
        itemDragState.set(item, { dragStartX, dragStartY, hasDragged: false });
      });
      
      // Prevent drag tracking from interfering with clicks
      item.addEventListener('mouseleave', () => {
        itemDragState.delete(item);
        dragStartX = 0;
        dragStartY = 0;
        hasDragged = false;
      });
      
      // Handle click on slider item
      item.addEventListener('click', (e) => {
        const state = itemDragState.get(item);
        // Only open modal if it wasn't a significant drag (more than 10px)
        if (state) {
          const dragDistance = Math.sqrt(
            Math.pow(e.pageX - state.dragStartX, 2) + 
            Math.pow(e.pageY - state.dragStartY, 2)
          );
          if (dragDistance > 10) {
            console.log('Drag detected, ignoring click');
            itemDragState.delete(item);
            return;
          }
        }
        
        console.log('Slider item clicked:', index);
        e.stopPropagation();
        e.preventDefault();
        openModal(index);
        itemDragState.delete(item);
      });
      
      // Also handle clicks on the overlay icon specifically
      const overlay = item.querySelector('.image-overlay');
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('Overlay clicked:', index);
          openModal(index);
          itemDragState.delete(item);
        });
      }
      
      // Handle image clicks directly
      const imgElement = item.querySelector('img');
      if (imgElement) {
        imgElement.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('Image clicked:', index);
          openModal(index);
          itemDragState.delete(item);
        });
      }
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
    let hasMoved = false; // Track if mouse moved during drag
    
    // Enable horizontal scrolling for drag
    sliderTrack.style.overflowX = 'auto';
    sliderTrack.style.scrollBehavior = 'auto';
    
    sliderTrack.addEventListener('mousedown', (e) => {
      isDragging = true;
      hasMoved = false;
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
      
      // Check if mouse has moved significantly (more than 5px)
      const moveDistance = Math.abs(e.pageX - startX);
      if (moveDistance > 5) {
        hasMoved = true;
      }
      
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
      
      // Reset hasMoved after a short delay to allow click events
      setTimeout(() => {
        hasMoved = false;
      }, 100);
      
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

    // Early return if no mosaic items found (this is for project3, not project2)
    if (mosaicItems.length === 0) {
      console.log('No mosaic items found, skipping mosaic wall initialization');
      return;
    }

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

    // Close modal when clicking outside of it
    if (videoModal) {
      videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
          closeVideoModal();
        }
      });
    }

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
    console.log('=== INITIALIZING GALLERY MODAL ===');
    
    // Check for both gallery items (project2) and slider items (project3)
    const galleryItems = document.querySelectorAll('.gallery-item');
    const sliderItems = document.querySelectorAll('.slider-item');
    const clickableVideos = document.querySelectorAll('.clickable-video');
    const items = galleryItems.length > 0 ? galleryItems : sliderItems;
    
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalClose = modal ? modal.querySelector('.modal-close') : null;
    const prevBtn = modal ? modal.querySelector('.nav-btn.prev-btn') : null;
    const nextBtn = modal ? modal.querySelector('.nav-btn.next-btn') : null;
    
    console.log('Gallery Modal Init:', {
      galleryItems: galleryItems.length,
      sliderItems: sliderItems.length,
      totalItems: items.length,
      modal: !!modal,
      modalImage: !!modalImage,
      modalVideo: !!modalVideo,
      modalClose: !!modalClose,
      prevBtn: !!prevBtn,
      nextBtn: !!nextBtn
    });
    
    // Debug modal structure
    if (modal) {
      console.log('Modal HTML structure:', modal.innerHTML.substring(0, 500) + '...');
      console.log('Modal video element found:', !!modal.querySelector('#modalVideo'));
      console.log('Modal image element found:', !!modal.querySelector('#modalImage'));
    } else {
      console.log('ERROR: Modal not found!');
    }
    
    if (!items.length) {
      console.log('No gallery items found, skipping modal initialization');
      return;
    }
    
    if (!modal) {
      console.log('Modal element not found, skipping modal initialization');
      return;
    }
    
    let currentIndex = 0;
    const images = Array.from(items).map(item => ({
      src: item.getAttribute('data-image') || item.getAttribute('data-video') || item.querySelector('img')?.src || item.querySelector('video source')?.src,
      title: item.getAttribute('data-title') || item.querySelector('img')?.alt || 'Project Image',
      description: item.getAttribute('data-description') || 'Project image from portfolio',
      type: item.getAttribute('data-video') ? 'video' : 'image'
    }));
    
    function openModal(index) {
      console.log('=== OPENING MODAL ===', {
        index: index,
        totalImages: images.length,
        modal: modal,
        modalImage: modalImage,
        modalVideo: modalVideo
      });
      
      currentIndex = index;
      const image = images[index];
      
      console.log('Image data:', image);
      console.log('Modal video element:', modalVideo);
      console.log('Modal image element:', modalImage);
      
      if (image.type === 'video') {
        console.log('Handling video in modal:', image.src);
        // Show video, hide image
        modalImage.style.display = 'none';
        modalVideo.style.display = 'block';
        
        // Update video source
        const sources = modalVideo.querySelectorAll('source');
        console.log('Video sources found:', sources.length);
        sources.forEach(source => {
          source.src = image.src;
          console.log('Set source src to:', image.src);
        });
        modalVideo.load();
        
        // Play video with autoplay
        setTimeout(() => {
          console.log('Attempting to play video...');
          modalVideo.play().then(() => {
            console.log('Video playing successfully in modal');
          }).catch(error => {
            console.log('Video autoplay failed:', error);
            // Add controls as fallback if autoplay fails
            modalVideo.controls = true;
            console.log('Added controls as fallback for video playback');
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
      
      console.log('Adding show class to modal...');
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      console.log('Modal opened successfully', {
        modalClasses: modal.className,
        modalDisplay: window.getComputedStyle(modal).display,
        modalVisibility: window.getComputedStyle(modal).visibility,
        modalOpacity: window.getComputedStyle(modal).opacity
      });
    }
    
    function closeModal() {
      console.log('closeModal function called');
      
      // Pause video if playing
      if (modalVideo) {
        modalVideo.pause();
        // Remove controls if they were added as fallback
        modalVideo.controls = false;
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
      console.log('=== NEXT IMAGE FUNCTION CALLED ===', {
        currentIndex: currentIndex,
        imagesLength: images.length,
        images: images
      });
      currentIndex = (currentIndex + 1) % images.length;
      console.log('New index after increment:', currentIndex);
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
      console.log(`Adding click listener to item ${index}:`, item);
      item.addEventListener('click', (e) => {
        console.log('=== GALLERY ITEM CLICKED ===', {
          index: index,
          item: item,
          event: e,
          hasDataImage: !!item.getAttribute('data-image'),
          hasDataVideo: !!item.getAttribute('data-video'),
          hasImg: !!item.querySelector('img'),
          hasVideo: !!item.querySelector('video')
        });
        e.preventDefault();
        e.stopPropagation();
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
          modalVideoElement: modalVideo,
          modalVideoInDOM: document.getElementById('modalVideo'),
          modalVideoParent: modalVideo ? modalVideo.parentElement : null
        });
        
        if (videoSrc && modalVideo) {
          console.log('Setting up modal video display');
          
              // Check if video element is actually in DOM
    const videoInDOM = document.getElementById('modalVideo');
    console.log('Video element in DOM check:', {
      found: !!videoInDOM,
      element: videoInDOM,
      parent: videoInDOM ? videoInDOM.parentElement : null,
      parentClass: videoInDOM ? videoInDOM.parentElement.className : null
    });
    
    // Check if modal exists in DOM
    const modalInDOM = document.getElementById('imageModal');
    console.log('Modal in DOM check:', {
      found: !!modalInDOM,
      modalHTML: modalInDOM ? modalInDOM.outerHTML.substring(0, 300) + '...' : 'NOT FOUND'
    });
          // Show video, hide image
          modalImage.style.display = 'none';
          modalVideo.style.display = 'block';
          modalVideo.style.visibility = 'visible';
          modalVideo.style.opacity = '1';
          modalVideo.style.position = 'relative';
          modalVideo.style.zIndex = '10001';
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
          
          console.log('Video element after load:', {
            readyState: modalVideo.readyState,
            currentSrc: modalVideo.currentSrc,
            videoWidth: modalVideo.videoWidth,
            videoHeight: modalVideo.videoHeight,
            style: {
              display: modalVideo.style.display,
              visibility: modalVideo.style.visibility,
              opacity: modalVideo.style.opacity,
              position: modalVideo.style.position,
              zIndex: modalVideo.style.zIndex
            },
            computedStyle: {
              display: window.getComputedStyle(modalVideo).display,
              visibility: window.getComputedStyle(modalVideo).visibility,
              opacity: window.getComputedStyle(modalVideo).opacity,
              position: window.getComputedStyle(modalVideo).position,
              zIndex: window.getComputedStyle(modalVideo).zIndex
            }
          });
          
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
            // Check if video is actually visible in DOM
            const videoRect = modalVideo.getBoundingClientRect();
            console.log('Video bounding rect:', {
              top: videoRect.top,
              left: videoRect.left,
              width: videoRect.width,
              height: videoRect.height,
              visible: videoRect.width > 0 && videoRect.height > 0
            });
            
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
      prevBtn.addEventListener('click', (e) => {
        console.log('Previous button clicked', e);
        e.preventDefault();
        e.stopPropagation();
        prevImage();
      });
    } else {
      console.log('Previous button NOT found');
    }
    if (nextBtn) {
      console.log('Next button found:', nextBtn);
      console.log('Next button found and event listeners attached');
      
      nextBtn.addEventListener('click', (e) => {
        console.log('Next button clicked');
        e.preventDefault();
        e.stopPropagation();
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

  // ===== STAR PROGRESS INDICATOR =====
  
  function initSTARProgressIndicator() {
    const starIndicator = document.querySelector('.star-progress-indicator');
    if (!starIndicator) return;

    const starSteps = document.querySelectorAll('.star-step');
    const sections = {
      situation: document.querySelector('[data-star="situation"]'),
      task: document.querySelector('[data-star="task"]'),
      action: document.querySelector('[data-star="action"]'),
      result: document.querySelector('[data-star="result"]')
    };

    // Track scroll position and update active state
    function updateSTARProgress() {
      const scrollPosition = window.scrollY + window.innerHeight / 2; // Changed from /3 to /2 for better detection
      const windowHeight = window.innerHeight;

      let activeSection = 'situation';
      
      // Check each section to see which one is currently in view
      Object.entries(sections).forEach(([key, section]) => {
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          
          // Section is active if it's in the middle portion of the viewport
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            activeSection = key;
          }
        }
      });

      // Update active states
      starSteps.forEach(step => {
        const stepType = step.dataset.step;
        
        // Remove all states
        step.classList.remove('active', 'completed');
        
        // Add appropriate state
        if (stepType === activeSection) {
          step.classList.add('active');
        } else if (getStepOrder(stepType) < getStepOrder(activeSection)) {
          step.classList.add('completed');
        }
      });
    }

    function getStepOrder(step) {
      const order = { situation: 1, task: 2, action: 3, result: 4 };
      return order[step] || 0;
    }

    // Click handlers for navigation
    starSteps.forEach(step => {
      step.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = sections[step.dataset.step];
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Listen to scroll events
    window.addEventListener('scroll', updateSTARProgress);
    updateSTARProgress(); // Initial call
  }

  // ===== SKILL PROGRESS ANIMATION =====
  function animateSkillProgress() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const progressBar = entry.target.querySelector('.progress-bar');
          if (progressBar) {
            // Add animate class to trigger CSS animation
            entry.target.classList.add('animate');
            
            // Unobserve after animation
            observer.unobserve(entry.target);
          }
        }
      });
    }, {
      threshold: 0.5
    });
    
    skillItems.forEach(item => {
      observer.observe(item);
    });
  }

  // ===== ANIMATED COUNTERS =====
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'));
      
      if (isNaN(target)) {
        console.error('Invalid target value for counter:', counter);
        return;
      }
      
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60fps
      let current = 0;
      
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target + (target === 100 ? '%' : '+');
        }
      };
      
      // Start animation when element is in viewport
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateCounter();
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(counter);
      
      // Fallback: set final value after 3 seconds if animation doesn't start
      setTimeout(() => {
        if (counter.textContent === '0') {
          counter.textContent = target + (target === 100 ? '%' : '+');
        }
      }, 3000);
    });
  }

  // ===== EXPORTS =====

  // Re-bind element-level handlers after SPA navigation swaps #mainContent.
  // We intentionally skip one-time setup (password auth, document/window
  // listeners that would double-bind, perf optimizations) — only re-run the
  // init functions whose handlers/observers attach to elements that just got
  // replaced.
  function spaReInit() {
    try {
      cacheElements();
      if (!state.isAuthenticated) return;
      initProjectFilters();
      initSmoothScrolling();
      initIntersectionObserver();
      initTooltipLabels();
      initImageSlider();
      initVideoAutoplay();
      initMosaicWall();
      initGalleryModal();
      initSTARProgressIndicator();
      animateCounters();
      animateSkillProgress();
    } catch (err) {
      console.warn('[main] spaReInit error:', err);
    }
  }

  // Make functions available globally if needed
  window.MainApp = {
    init,
    spaReInit,
    state,
    filterProjects,
    updateActiveNavigation,
    animateCounters,
    animateSkillProgress,
    handleMobileNavToggle,
    initSTARProgressIndicator,
  };

  // Auto-initialize
  init();
  
  // Initialize STAR progress indicator if on case study page
  document.addEventListener('DOMContentLoaded', () => {
    initSTARProgressIndicator();
    animateCounters();
    animateSkillProgress();
    initNavigation(); // Initialize navigation highlighting
  });

})();
