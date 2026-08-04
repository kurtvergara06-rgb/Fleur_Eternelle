'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('link[href="css/enhancements.css"]')) {
    const enhancementStyles = document.createElement('link');
    enhancementStyles.rel = 'stylesheet';
    enhancementStyles.href = 'css/enhancements.css';
    document.head.appendChild(enhancementStyles);
  }

  const grid = document.querySelector('#product-grid');
  const featuredGrid = document.querySelector('#featured-products');
  const searchInput = document.querySelector('#product-search');
  const sortSelect = document.querySelector('#product-sort');
  const resultCount = document.querySelector('#result-count');
  const emptyState = document.querySelector('#empty-state');
  const resetButton = document.querySelector('#reset-filters');
  const filterButtons = [...document.querySelectorAll('.filter-pill')];
  const modal = document.querySelector('#product-modal');
  const modalClose = document.querySelector('#modal-close');
  const modalInquire = document.querySelector('.modal-inquire');
  const inquiryForm = document.querySelector('#inquiry-form');
  const productSelect = document.querySelector('#selected-product');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const scrollTop = document.querySelector('#scroll-top');
  const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0
  });

  let activeFilter = 'all';
  let lastFocused = null;
  let selectedModalProduct = null;

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[char]));

  const productById = (id) => products.find((product) => product.id === id);
  const formatPrice = (price) => Number.isFinite(price)
    ? `From ${currency.format(price)}`
    : 'Price on inquiry';

  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' })
    : null;

  function registerRevealElements(root = document) {
    const selectors = [
      '.section-heading',
      '.featured-card',
      '.product-card',
      '.category-card',
      '.story-visual',
      '.story-copy',
      '.care-card',
      '.contact-copy',
      '.inquiry-card'
    ];

    const elements = [...root.querySelectorAll(selectors.join(','))];
    elements.forEach((element, index) => {
      if (element.dataset.revealReady === 'true') return;
      element.dataset.revealReady = 'true';
      element.classList.add('reveal-on-scroll', `reveal-delay-${(index % 3) + 1}`);

      if (revealObserver) {
        revealObserver.observe(element);
      } else {
        element.classList.add('is-visible');
      }
    });
  }

  function productCard(product) {
    const statusClass = product.availability === 'Available' ? '' : ' unavailable';
    return `<article class="product-card"><div class="product-image-wrap"><img loading="lazy" src="${product.image}" alt="${escapeHtml(product.alt)}" width="700" height="875"><span class="product-badge">${escapeHtml(product.categoryLabel)}</span></div><div class="product-category">${escapeHtml(product.categoryLabel)}</div><h3>${escapeHtml(product.name)}</h3><p class="product-card-description">${escapeHtml(product.description)}</p><div class="product-bottom"><div><span class="product-price">${formatPrice(product.price)}</span><span class="status-badge${statusClass}">${escapeHtml(product.availability)}</span></div><button class="view-details" type="button" data-product-id="${product.id}">View details ↗</button></div></article>`;
  }

  function featuredCard(product) {
    return `<article class="featured-card"><img loading="lazy" src="${product.image}" alt="${escapeHtml(product.alt)}" width="900" height="1100"><div class="featured-card-content"><span class="feature-label">${escapeHtml(product.categoryLabel)}</span><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description)}</p></div><button class="view-circle" type="button" aria-label="View details for ${escapeHtml(product.name)}" data-product-id="${product.id}">↗</button></article>`;
  }

  function renderFeatured() {
    featuredGrid.innerHTML = products
      .filter((product) => product.featured)
      .slice(0, 3)
      .map(featuredCard)
      .join('');
    registerRevealElements(featuredGrid);
  }

  function filteredProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const visible = products.filter((product) => {
      const matchesCategory = activeFilter === 'all' || product.category === activeFilter;
      const searchable = `${product.name} ${product.categoryLabel} ${product.description} ${product.composition}`.toLowerCase();
      return matchesCategory && (!query || searchable.includes(query));
    });

    switch (sortSelect.value) {
      case 'name-asc':
        visible.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        visible.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        visible.sort((a, b) => b.price - a.price);
        break;
      default:
        visible.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return visible;
  }

  function renderProducts() {
    const visible = filteredProducts();
    grid.innerHTML = visible.map(productCard).join('');
    emptyState.hidden = visible.length > 0;
    resultCount.textContent = visible.length === products.length && activeFilter === 'all' && !searchInput.value
      ? 'Showing all arrangements'
      : `Showing ${visible.length} arrangement${visible.length === 1 ? '' : 's'}`;
    registerRevealElements(grid);
  }

  function populateProductSelect() {
    productSelect.insertAdjacentHTML(
      'beforeend',
      products.map((product) => `<option value="${product.id}">${escapeHtml(product.name)}</option>`).join('')
    );
  }

  function openModal(id) {
    const product = productById(id);
    if (!product) return;

    selectedModalProduct = product;
    lastFocused = document.activeElement;
    document.querySelector('#modal-image').src = product.image;
    document.querySelector('#modal-image').alt = product.alt;
    document.querySelector('#modal-category').textContent = product.categoryLabel;
    document.querySelector('#modal-title').textContent = product.name;
    document.querySelector('#modal-description').textContent = product.description;
    document.querySelector('#modal-price').textContent = formatPrice(product.price);
    document.querySelector('#modal-status').textContent = product.availability;
    document.querySelector('#modal-status').className = `status-badge${product.availability === 'Available' ? '' : ' unavailable'}`;
    document.querySelector('#modal-composition').textContent = product.composition;
    document.querySelector('#modal-care').textContent = product.care;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modalClose.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener('click', (event) => {
    const detailButton = event.target.closest('[data-product-id]');
    if (detailButton) openModal(detailButton.dataset.productId);
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeModal();

    if (event.key === 'Tab' && !modal.hidden) {
      const focusable = [...modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.disabled);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  modalInquire.addEventListener('click', () => {
    if (selectedModalProduct) {
      productSelect.value = selectedModalProduct.id;
      document.querySelector('#subject').value = `Inquiry about ${selectedModalProduct.name}`;
    }
    closeModal();
  });

  filterButtons.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    renderProducts();
  }));

  searchInput.addEventListener('input', renderProducts);
  sortSelect.addEventListener('change', renderProducts);

  resetButton.addEventListener('click', () => {
    activeFilter = 'all';
    searchInput.value = '';
    sortSelect.value = 'featured';
    filterButtons.forEach((item) => item.classList.toggle('active', item.dataset.filter === 'all'));
    renderProducts();
  });

  document.querySelectorAll('.category-card').forEach((card) => card.addEventListener('click', () => {
    activeFilter = card.dataset.category;
    filterButtons.forEach((item) => item.classList.toggle('active', item.dataset.filter === activeFilter));
    renderProducts();
    document.querySelector('#collection').scrollIntoView({ behavior: 'smooth' });
  }));

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    siteNav.classList.toggle('is-open', !expanded);
  });

  siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    siteNav.classList.remove('is-open');
  }));

  inquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const required = ['full-name', 'email', 'subject', 'message'];
    let valid = true;

    required.forEach((id) => {
      const field = document.getElementById(id);
      const error = document.querySelector(`[data-error-for="${id}"]`);
      let message = '';

      if (!field.value.trim()) {
        message = 'Please fill in this field.';
      } else if (id === 'email' && !/^\S+@\S+\.\S+$/.test(field.value.trim())) {
        message = 'Please enter a valid email.';
      }

      error.textContent = message;
      field.setAttribute('aria-invalid', String(Boolean(message)));
      if (message) valid = false;
    });

    const status = document.querySelector('#form-status');
    if (!valid) {
      status.textContent = 'Please check the highlighted fields.';
      status.className = 'form-status is-error';
      return;
    }

    status.textContent = 'Your inquiry has been prepared successfully. Connect this form to an email or backend service before publishing.';
    status.className = 'form-status is-success';
    inquiryForm.reset();
  });

  inquiryForm.querySelectorAll('input, textarea, select').forEach((field) => field.addEventListener('input', () => {
    const error = document.querySelector(`[data-error-for="${field.id}"]`);
    if (error) error.textContent = '';
    field.removeAttribute('aria-invalid');
  }));

  window.addEventListener('scroll', () => {
    scrollTop.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });

  scrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.querySelector('#current-year').textContent = new Date().getFullYear();

  renderFeatured();
  renderProducts();
  populateProductSelect();
  registerRevealElements(document);
});
