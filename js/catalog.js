'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('#catalog-grid');
  const filter = document.querySelector('#catalog-filter');
  const search = document.querySelector('#catalog-search');
  const count = document.querySelector('#catalog-count');
  const empty = document.querySelector('#catalog-empty');
  const modal = document.querySelector('#product-modal');
  const closeButton = document.querySelector('#modal-close');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const currentYear = document.querySelector('#current-year');
  const currency = new Intl.NumberFormat('en-PH', {style:'currency',currency:'PHP',maximumFractionDigits:0});
  let lastFocused = null;

  const formatPrice = (price) => `From ${currency.format(price)}`;

  function getVisibleProducts() {
    const selected = filter.value;
    const query = search.value.trim().toLowerCase();
    return products.filter((product) => {
      const matchesFilter = selected === 'all'
        || selected === product.category
        || (selected === 'best-seller' && product.bestSeller)
        || (selected === 'new' && product.newArrival);
      const haystack = `${product.name} ${product.categoryLabel} ${product.description}`.toLowerCase();
      return matchesFilter && (!query || haystack.includes(query));
    });
  }

  function render() {
    const visible = getVisibleProducts();
    grid.innerHTML = visible.map((product) => {
      const badge = product.bestSeller ? 'Best seller' : (product.newArrival ? 'New' : product.categoryLabel);
      const limited = product.availability !== 'Available' ? ' limited' : '';
      return `
        <article class="catalog-card">
          <div class="catalog-card-image">
            <img src="${product.image}" alt="${product.alt}" loading="lazy" width="700" height="875">
            <span class="catalog-badge">${badge}</span>
          </div>
          <h3>${product.name}</h3>
          <span class="catalog-price">${formatPrice(product.price)}</span>
          <p class="catalog-description">${product.description}</p>
          <div class="catalog-actions">
            <span class="catalog-status${limited}">${product.availability}</span>
            <button type="button" data-product-id="${product.id}">View details ↗</button>
          </div>
        </article>`;
    }).join('');
    count.textContent = `${visible.length} arrangement${visible.length === 1 ? '' : 's'}`;
    empty.hidden = visible.length > 0;
  }

  function openModal(id) {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    lastFocused = document.activeElement;
    document.querySelector('#modal-image').src = product.image;
    document.querySelector('#modal-image').alt = product.alt;
    document.querySelector('#modal-category').textContent = product.categoryLabel;
    document.querySelector('#modal-title').textContent = product.name;
    document.querySelector('#modal-description').textContent = product.description;
    document.querySelector('#modal-price').textContent = formatPrice(product.price);
    document.querySelector('#modal-status').textContent = product.availability;
    document.querySelector('#modal-composition').textContent = product.composition;
    document.querySelector('#modal-care').textContent = product.care;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    closeButton.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-product-id]');
    if (button) openModal(button.dataset.productId);
  });
  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });

  filter.addEventListener('change', render);
  search.addEventListener('input', render);

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('is-open', !expanded);
  });
  siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
  }));

  currentYear.textContent = new Date().getFullYear();
  render();
});
