/**
 * ============================================================================
 * E-Governance & Citizen Portals: Usability and UI/UX Field Study
 * Vanilla JavaScript (ES6+) Implementation
 * Smt. Chandibai Himathmal Mansukhani College (CHMCSV11 Project)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. INITIALIZATION & FEATURE CHECKS
     -------------------------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     2. MOBILE NAVIGATION HAMBURGER TOGGLE
     -------------------------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link, .nav-cta-btn');
  const header = document.getElementById('header');

  const toggleMobileMenu = (forceClose = false) => {
    if (!navToggle || !navMenu) return;

    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    const shouldClose = forceClose || isExpanded;

    if (shouldClose) {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-active');
      document.body.style.overflow = '';
    } else {
      navToggle.setAttribute('aria-expanded', 'true');
      navMenu.classList.add('is-active');
      // Lock scroll on mobile when menu is active
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    }
  };

  if (navToggle) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Close mobile menu when a nav link is clicked
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      toggleMobileMenu(true);
    });
  });

  // Close mobile menu if clicked outside
  document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('is-active')) {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        toggleMobileMenu(true);
      }
    }
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('is-active')) {
      toggleMobileMenu(true);
      navToggle.focus();
    }
  });

  // Handle resize to desktop to reset body scroll
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && navMenu && navMenu.classList.contains('is-active')) {
      toggleMobileMenu(true);
    }
  });

  /* --------------------------------------------------------------------------
     3. STICKY HEADER SCROLL EFFECT
     -------------------------------------------------------------------------- */
  const handleHeaderScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* --------------------------------------------------------------------------
     4. SMOOTH ACTIVE NAV LINK HIGHLIGHTING (INTERSECTION OBSERVER)
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const mainNavLinks = document.querySelectorAll('.nav-list .nav-link');

  const updateActiveNavLink = (activeId) => {
    mainNavLinks.forEach((link) => {
      const targetId = link.getAttribute('href').replace('#', '');
      if (targetId === activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  if ('IntersectionObserver' in window && sections.length > 0) {
    const navObserverOptions = {
      root: null,
      rootMargin: '-25% 0px -65% 0px',
      threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateActiveNavLink(entry.target.id);
        }
      });
    }, navObserverOptions);

    sections.forEach((section) => {
      navObserver.observe(section);
    });
  }

  /* --------------------------------------------------------------------------
     5. SCROLL-TRIGGERED FADE-IN ANIMATIONS (INTERSECTION OBSERVER)
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if (prefersReducedMotion) {
    // If user prefers reduced motion, show all elements instantly
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  } else if ('IntersectionObserver' in window) {
    const revealObserverOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Once revealed, unobserve to maintain performance
          observer.unobserve(entry.target);
        }
      });
    }, revealObserverOptions);

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback for older browsers
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  }

  /* --------------------------------------------------------------------------
     6. FAQ ACCORDION WITH SMOOTH MAX-HEIGHT ANIMATION
     -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  class Accordion {
    constructor(el) {
      this.el = el;
      this.summary = el.querySelector('.faq-question');
      this.content = el.querySelector('.faq-answer');
      this.inner = el.querySelector('.faq-answer-inner');

      this.animation = null;
      this.isClosing = false;
      this.isExpanding = false;

      this.init();
    }

    init() {
      if (!this.summary || !this.content) return;

      this.summary.addEventListener('click', (e) => this.onClick(e));
    }

    onClick(e) {
      e.preventDefault();
      this.el.style.overflow = 'hidden';

      if (this.isClosing || !this.el.open) {
        this.open();
      } else if (this.isExpanding || this.el.open) {
        this.shrink();
      }
    }

    shrink() {
      this.isClosing = true;

      const startHeight = `${this.el.offsetHeight}px`;
      const endHeight = `${this.summary.offsetHeight}px`;

      if (this.animation) {
        this.animation.cancel();
      }

      this.animation = this.el.animate(
        {
          height: [startHeight, endHeight]
        },
        {
          duration: 350,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }
      );

      this.animation.onfinish = () => this.onAnimationFinish(false);
      this.animation.oncancel = () => (this.isClosing = false);
    }

    open() {
      // Close other open accordions smoothly for accordion exclusivity
      faqItems.forEach((item) => {
        if (item !== this.el && item.open && !item.classList.contains('closing')) {
          const itemSummary = item.querySelector('.faq-question');
          if (itemSummary) {
            const startH = `${item.offsetHeight}px`;
            const endH = `${itemSummary.offsetHeight}px`;
            const anim = item.animate(
              { height: [startH, endH] },
              { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
            );
            anim.onfinish = () => {
              item.open = false;
              item.style.height = '';
            };
          }
        }
      });

      this.el.style.height = `${this.el.offsetHeight}px`;
      this.el.open = true;
      window.requestAnimationFrame(() => this.expand());
    }

    expand() {
      this.isExpanding = true;

      const startHeight = `${this.el.offsetHeight}px`;
      const endHeight = `${this.summary.offsetHeight + this.inner.offsetHeight}px`;

      if (this.animation) {
        this.animation.cancel();
      }

      this.animation = this.el.animate(
        {
          height: [startHeight, endHeight]
        },
        {
          duration: 380,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }
      );

      this.animation.onfinish = () => this.onAnimationFinish(true);
      this.animation.oncancel = () => (this.isExpanding = false);
    }

    onAnimationFinish(open) {
      this.el.open = open;
      this.animation = null;
      this.isClosing = false;
      this.isExpanding = false;
      this.el.style.height = '';
      this.el.style.overflow = '';
    }
  }

  // Initialize Accordion for all FAQ items
  faqItems.forEach((el) => {
    new Accordion(el);
  });

  /* --------------------------------------------------------------------------
     7. CANVAS-BASED ANIMATED DOTS / PARTICLES HERO BACKGROUND
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('hero-canvas');
  const heroSection = document.getElementById('home');

  if (canvas && heroSection && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrameId = null;
    let isHeroVisible = true;

    // Mouse coordinates for gentle interactive repulsion/attraction
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120
    };

    // Configuration
    const PARTICLE_COUNT_DESKTOP = 65;
    const PARTICLE_COUNT_MOBILE = 30;
    const MAX_DISTANCE = 130;

    class Particle {
      constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        // Subtle drift velocity
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.8 + 1.2;
        this.baseAlpha = Math.random() * 0.4 + 0.25;

        // Choose between cyan or blue accent tint
        this.colorType = Math.random() > 0.4 ? 'cyan' : 'blue';
      }

      update(w, h) {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce gently against boundaries
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        // Mouse interaction: subtle reaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 1.5;
          this.y -= Math.sin(angle) * force * 1.5;
        }
      }

      draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.colorType === 'cyan') {
          context.fillStyle = `rgba(6, 182, 212, ${this.baseAlpha})`;
          context.shadowColor = 'rgba(6, 182, 212, 0.4)';
        } else {
          context.fillStyle = `rgba(37, 99, 235, ${this.baseAlpha})`;
          context.shadowColor = 'rgba(37, 99, 235, 0.4)';
        }
        context.shadowBlur = 6;
        context.fill();
        context.shadowBlur = 0; // Reset
      }
    }

    const resizeCanvas = () => {
      const rect = heroSection.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Adjust particle count for viewport size
      const targetCount = width < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
      particles = [];
      for (let i = 0; i < targetCount; i++) {
        particles.push(new Particle(width, height));
      }
    };

    // Track mouse coordinates within hero section
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    heroSection.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    // Connect particles with faint glowing lines
    const connectParticles = () => {
      const len = particles.length;
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < MAX_DISTANCE) {
            const opacity = (1 - dist / MAX_DISTANCE) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }
    };

    // Main animation loop
    const animate = () => {
      if (!isHeroVisible) {
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update(width, height);
        p.draw(ctx);
      });

      connectParticles();

      animationFrameId = requestAnimationFrame(animate);
    };

    // Pause animation when hero is offscreen to preserve battery & CPU
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isHeroVisible = entry.isIntersecting;
            if (isHeroVisible && !animationFrameId) {
              animationFrameId = requestAnimationFrame(animate);
            }
          });
        },
        { threshold: 0.05 }
      );
      heroObserver.observe(heroSection);
    }

    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
      }, 150);
    });

    // Initial setup
    resizeCanvas();
    animationFrameId = requestAnimationFrame(animate);
  }

  /* --------------------------------------------------------------------------
     8. SMOOTH SCROLLING ENHANCEMENT FOR INTERNAL LINKS
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update URL hash without jumping
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });

  console.log('E-Governance & Citizen Portals Field Study Application Initialized successfully.');
});
