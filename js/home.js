'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('#best-seller-grid');
  const modal = document.querySelector('#product-modal');
  const closeButton = document.querySelector('#modal-close');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const currentYear = document.querySelector('#current-year');
  const currency = new Intl.NumberFormat('en-PH', {style:'currency',currency:'PHP',maximumFractionDigits:0});
  let lastFocused = null;

  const formatPrice = (price) => `From ${currency.format(price)}`;
  const bestSellers = products.filter((product) => product.bestSeller).slice(0, 3);

  grid.innerHTML = bestSellers.map((product) => `
    <article class="best-seller-card">
      <div class="best-seller-image">
        <img src="${product.image}" alt="${product.alt}" loading="lazy" width="700" height="875">
        <span class="catalog-badge">Best seller</span>
      </div>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="best-seller-meta">
        <strong>${formatPrice(product.price)}</strong>
        <button type="button" data-product-id="${product.id}">View details ↗</button>
      </div>
    </article>`).join('');

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
});
