'use strict';

(() => {
  document.documentElement.classList.add('js-enabled');

  document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const curtain = document.createElement('div');
    curtain.className = 'page-enter';
    curtain.setAttribute('aria-hidden', 'true');
    document.body.prepend(curtain);
    curtain.addEventListener('animationend', () => curtain.remove(), { once: true });

    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    const glow = document.createElement('div');
    glow.className = 'pointer-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    const revealSelectors = [
      '.products-hero > .container > *',
      '.home-best-sellers .section-heading > *',
      '.section-heading > *',
      '.best-seller-card',
      '.catalog-controls',
      '.catalog-count',
      '.catalog-card',
      '.category-card',
      '.story-visual',
      '.story-copy > *',
      '.care-card',
      '.contact-copy > *',
      '.inquiry-card',
      '.site-footer .footer-wrap > *'
    ];

    const revealObserver = !reduceMotion && 'IntersectionObserver' in window
      ? new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' })
      : null;

    function registerReveals(root = document) {
      const elements = root.matches?.(revealSelectors.join(','))
        ? [root]
        : [...root.querySelectorAll(revealSelectors.join(','))];

      elements.forEach((element, index) => {
        if (element.dataset.motionReady === 'true') return;
        element.dataset.motionReady = 'true';
        element.classList.add('motion-reveal');
        element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 75}ms`);

        if (revealObserver) revealObserver.observe(element);
        else element.classList.add('is-visible');
      });
    }

    registerReveals(document);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          registerReveals(node);
          node.querySelectorAll?.('.catalog-card').forEach((card, index) => {
            card.classList.add('is-filtering');
            card.style.animationDelay = `${index * 45}ms`;
          });
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    let previousScroll = window.scrollY;
    let ticking = false;
    const header = document.querySelector('.site-header');

    function updateOnScroll() {
      const current = window.scrollY;
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      progress.style.transform = `scaleX(${Math.min(current / max, 1)})`;

      if (header) {
        header.classList.toggle('header-scrolled', current > 16);
        const movingDown = current > previousScroll;
        header.classList.toggle('header-hidden', movingDown && current > 180);
      }

      const heroImage = document.querySelector('.hero-image-wrap img');
      const storyMain = document.querySelector('.story-main-image');
      const storyAccent = document.querySelector('.story-accent-image');

      if (!reduceMotion) {
        if (heroImage && current < window.innerHeight * 1.4) {
          heroImage.style.transform = `translate3d(0, ${current * 0.075}px, 0) scale(1.04)`;
        }
        if (storyMain) {
          const rect = storyMain.getBoundingClientRect();
          const offset = (window.innerHeight - rect.top) * 0.025;
          storyMain.style.transform = `translate3d(0, ${Math.max(-12, Math.min(18, offset - 12))}px, 0)`;
        }
        if (storyAccent) {
          const rect = storyAccent.getBoundingClientRect();
          const offset = (window.innerHeight - rect.top) * -0.018;
          storyAccent.style.transform = `translate3d(0, ${Math.max(-16, Math.min(12, offset + 8))}px, 0)`;
        }
      }

      previousScroll = current;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateOnScroll);
    }, { passive: true });
    updateOnScroll();

    if (!reduceMotion) {
      window.addEventListener('pointermove', (event) => {
        glow.style.transform = `translate3d(${event.clientX - 120}px, ${event.clientY - 120}px, 0)`;
      }, { passive: true });
    }

    const heroArt = document.querySelector('.hero-art');
    if (heroArt && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
      heroArt.addEventListener('pointermove', (event) => {
        const rect = heroArt.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        heroArt.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${y * -4}deg)`;
      });
      heroArt.addEventListener('pointerleave', () => {
        heroArt.style.transform = '';
      });
    }

    const tiltSelector = '.best-seller-card, .catalog-card, .category-card, .care-card';
    document.addEventListener('pointermove', (event) => {
      if (reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
      const card = event.target.closest(tiltSelector);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(800px) rotateY(${x * 3.5}deg) rotateX(${y * -3.5}deg) translateY(-4px)`;
    });

    document.addEventListener('pointerout', (event) => {
      const card = event.target.closest?.(tiltSelector);
      if (card && !card.contains(event.relatedTarget)) card.style.transform = '';
    });

    const stats = [...document.querySelectorAll('.hero-stats strong')];
    stats.forEach((stat) => {
      const match = stat.textContent.match(/^(\d+)(.*)$/);
      if (!match || reduceMotion) return;
      const target = Number(match[1]);
      const suffix = match[2];
      stat.textContent = `0${suffix}`;
      const start = performance.now();
      const duration = 1100;

      function animate(now) {
        const progressValue = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progressValue, 3);
        stat.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progressValue < 1) requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    });

    const sectionLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
    const sections = sectionLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if (sections.length && 'IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          sectionLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        });
      }, { threshold: .35 });
      sections.forEach((section) => sectionObserver.observe(section));
    }
  });
})();
