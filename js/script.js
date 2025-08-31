// =============================================================================
// PORTFOLIO WEBSITE - MAIN JAVASCRIPT
// =============================================================================

$(document).ready(function() {
    'use strict';
    
    // =============================================================================
    // CONFIGURATION
    // =============================================================================
    
    const CONFIG = {
        password: "MelissaAI123!",
        animationDuration: 0.8,
        staggerDelay: 0.1,
        scrollTrigger: {
            trigger: "top 80%",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    };
    
    // =============================================================================
    // STATE MANAGEMENT
    // =============================================================================
    
    let state = {
        isAuthenticated: false,
        isPasswordVisible: false,
        currentSection: 'home'
    };
    
    // =============================================================================
    // INITIALIZATION
    // =============================================================================
    
    function init() {
        checkAuthentication();
        setupEventListeners();
        setupGSAP();
        
        if (state.isAuthenticated) {
            showMainContent();
        }
    }
    
    // =============================================================================
    // AUTHENTICATION SYSTEM
    // =============================================================================
    
    function checkAuthentication() {
        if (sessionStorage.getItem('portfolioAuthenticated') === 'true') {
            state.isAuthenticated = true;
        }
    }
    
    function setupEventListeners() {
        // Password form events
        $('#submitPassword').on('click', handlePasswordSubmit);
        $('#passwordInput').on('keypress', function(e) {
            if (e.which === 13) {
                handlePasswordSubmit();
            }
        });
        
        // Password visibility toggle
        $('.toggle-password').on('click', togglePasswordVisibility);
        
        // Navigation events
        $('a[href^="#"]').on('click', handleSmoothScroll);
        $(window).on('scroll', handleScroll);
        
        // Mobile menu toggle
        $('.navbar-toggle').on('click', toggleMobileMenu);
        
        // Close mobile menu on link click
        $('.navbar-nav .nav-link').on('click', closeMobileMenu);
        
        // Project card interactions
        $('.project-card').on('mouseenter', handleProjectCardHover);
        $('.project-card').on('mouseleave', handleProjectCardLeave);
    }
    
    function handlePasswordSubmit() {
        const enteredPassword = $('#passwordInput').val();
        
        if (enteredPassword === CONFIG.password) {
            authenticateUser();
        } else {
            showPasswordError();
        }
    }
    
    function authenticateUser() {
        state.isAuthenticated = true;
        sessionStorage.setItem('portfolioAuthenticated', 'true');
        
        // Animate success state
        gsap.to('.submit-btn', {
            backgroundColor: '#10b981',
            duration: 0.3,
            onComplete: () => {
                showMainContent();
            }
        });
    }
    
    function showPasswordError() {
        const errorElement = $('#passwordError');
        const inputElement = $('#passwordInput');
        
        // Show error message
        errorElement.addClass('show');
        inputElement.addClass('error');
        
        // Shake animation
        gsap.to(inputElement, {
            x: [-10, 10, -10, 10, 0],
            duration: 0.5,
            ease: "power2.out"
        });
        
        // Clear error after 3 seconds
        setTimeout(() => {
            errorElement.removeClass('show');
            inputElement.removeClass('error');
        }, 3000);
    }
    
    function togglePasswordVisibility() {
        const input = $('#passwordInput');
        const icon = $('.toggle-password i');
        
        if (state.isPasswordVisible) {
            input.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
            state.isPasswordVisible = false;
        } else {
            input.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
            state.isPasswordVisible = true;
        }
        
        // Animate the toggle
        gsap.to(icon, {
            scale: [1, 1.2, 1],
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    }
    
    // =============================================================================
    // CONTENT DISPLAY
    // =============================================================================
    
    function showMainContent() {
        // Hide password modal with animation
        gsap.to('.password-modal', {
            opacity: 0,
            scale: 0.9,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                $('.password-modal').remove();
                $('#mainContent').removeClass('d-none');
                animateMainContent();
            }
        });
    }
    
    function animateMainContent() {
        // Stagger animation for main content
        gsap.fromTo('.hero-section .hero-content > *', {
            opacity: 0,
            y: 50
        }, {
            opacity: 1,
            y: 0,
            duration: CONFIG.animationDuration,
            stagger: CONFIG.staggerDelay,
            ease: "power2.out"
        });
        
        // Animate hero background elements
        gsap.fromTo('.hero-section::before', {
            opacity: 0,
            scale: 0.8
        }, {
            opacity: 1,
            scale: 1,
            duration: CONFIG.animationDuration * 1.5,
            ease: "power2.out"
        });
        
        // Setup scroll animations
        setupScrollAnimations();
    }
    
    // =============================================================================
    // GSAP ANIMATIONS
    // =============================================================================
    
    function setupGSAP() {
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger);
        
        // Set default ease
        gsap.defaults({
            ease: "power2.out"
        });
    }
    
    function setupScrollAnimations() {
        // Animate sections on scroll
        gsap.utils.toArray('section').forEach(section => {
            gsap.fromTo(section, {
                opacity: 0,
                y: 60
            }, {
                opacity: 1,
                y: 0,
                duration: CONFIG.animationDuration,
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });
        });
        
        // Animate project cards
        gsap.fromTo('.project-card', {
            opacity: 0,
            y: 40,
            scale: 0.95
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: CONFIG.animationDuration,
            stagger: CONFIG.staggerDelay * 0.5,
            scrollTrigger: {
                trigger: '.projects-section',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });
        
        // Parallax effect for hero section
        gsap.to('.hero-section', {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: '.hero-section',
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
        
        // Floating animation for decorative elements
        gsap.to('.floating-element', {
            y: -20,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    }
    
    // =============================================================================
    // INTERACTIONS & ANIMATIONS
    // =============================================================================
    
    function handleProjectCardHover() {
        const card = $(this);
        
        gsap.to(card, {
            y: -8,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Animate the top border
        gsap.to(card.find('&::before'), {
            scaleX: 1,
            duration: 0.3,
            ease: "power2.out"
        });
    }
    
    function handleProjectCardLeave() {
        const card = $(this);
        
        gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Reset the top border
        gsap.to(card.find('&::before'), {
            scaleX: 0,
            duration: 0.3,
            ease: "power2.out"
        });
    }
    
    // =============================================================================
    // NAVIGATION & SCROLLING
    // =============================================================================
    
    function handleSmoothScroll(e) {
        e.preventDefault();
        
        const target = $(this.getAttribute('href'));
        if (target.length) {
            const offsetTop = target.offset().top - 80;
            
            gsap.to(window, {
                duration: 1,
                scrollTo: { y: offsetTop, autoKill: false },
                ease: "power2.inOut"
            });
        }
    }
    
    function handleScroll() {
        const scrollTop = $(window).scrollTop();
        
        // Navbar background effect
        if (scrollTop > 50) {
            $('.navbar').addClass('scrolled');
        } else {
            $('.navbar').removeClass('scrolled');
        }
        
        // Active navigation highlighting
        updateActiveNavigation(scrollTop);
        
        // Parallax effects
        updateParallaxElements(scrollTop);
    }
    
    function updateActiveNavigation(scrollTop) {
        $('section').each(function() {
            const top = $(this).offset().top - 100;
            const bottom = top + $(this).outerHeight();
            
            if (scrollTop >= top && scrollTop < bottom) {
                const id = $(this).attr('id');
                $('.nav-link').removeClass('active');
                $(`.nav-link[href="#${id}"]`).addClass('active');
            }
        });
    }
    
    function updateParallaxElements(scrollTop) {
        // Subtle parallax for background elements
        gsap.set('.parallax-bg', {
            y: scrollTop * 0.1
        });
    }
    
    // =============================================================================
    // MOBILE MENU
    // =============================================================================
    
    function toggleMobileMenu() {
        const nav = $('.navbar-nav');
        const icon = $('.navbar-toggle i');
        
        nav.toggleClass('show');
        
        // Animate icon rotation
        gsap.to(icon, {
            rotation: nav.hasClass('show') ? 90 : 0,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Animate menu items
        if (nav.hasClass('show')) {
            gsap.fromTo(nav.find('.nav-link'), {
                opacity: 0,
                x: -20
            }, {
                opacity: 1,
                x: 0,
                duration: 0.3,
                stagger: 0.1,
                ease: "power2.out"
            });
        }
    }
    
    function closeMobileMenu() {
        if ($(window).width() < 1024) {
            $('.navbar-nav').removeClass('show');
            gsap.to('.navbar-toggle i', {
                rotation: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }
    
    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================
    
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
    
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // =============================================================================
    // PERFORMANCE OPTIMIZATIONS
    // =============================================================================
    
    // Throttled scroll handler
    const throttledScrollHandler = throttle(handleScroll, 16);
    $(window).on('scroll', throttledScrollHandler);
    
    // Debounced resize handler
    const debouncedResizeHandler = debounce(() => {
        ScrollTrigger.refresh();
    }, 250);
    $(window).on('resize', debouncedResizeHandler);
    
    // =============================================================================
    // ACCESSIBILITY ENHANCEMENTS
    // =============================================================================
    
    // Keyboard navigation support
    $(document).on('keydown', function(e) {
        // Escape key closes mobile menu
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
        
        // Tab key management for focus
        if (e.key === 'Tab') {
            // Ensure focus is visible
            $(':focus').addClass('focus-visible');
        }
    });
    
    // Remove focus-visible class on mouse click
    $(document).on('mousedown', function() {
        $('.focus-visible').removeClass('focus-visible');
    });
    
    // =============================================================================
    // INITIALIZATION
    // =============================================================================
    
    // Start the application
    init();
    
    // =============================================================================
    // PUBLIC API (for potential external use)
    // =============================================================================
    
    window.PortfolioApp = {
        authenticate: authenticateUser,
        showContent: showMainContent,
        refreshAnimations: () => ScrollTrigger.refresh()
    };
});
