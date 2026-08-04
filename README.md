# Fleur Éternelle by Verleane

A mobile-first, responsive flower catalogue built with HTML5, CSS3, and vanilla JavaScript. The site is for viewing products and sending inquiries only. It has no cart, checkout, payment, account, or online-ordering flow.

## Files

- `index.html` — semantic page structure
- `css/style.css` — design system and mobile-first styles
- `css/responsive.css` — tablet and desktop breakpoints
- `js/products.js` — product catalogue data
- `js/script.js` — catalogue rendering, filtering, modal, navigation, validation, and scrolling behavior
- `assets/images/fleur-eternelle-logo.jpg` — official logo

## Run locally

Open `index.html` directly, or run a local static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Customize

- Edit products in `js/products.js`.
- Replace remote product-image URLs with optimized local WebP or JPEG files before production deployment.
- Update the placeholder contact details and social links in `index.html`.
- Adjust colors in the `:root` section of `css/style.css`.

## Inquiry form

The form validates fields in the browser but does not send data. Connect it to a secure backend or trusted form service before publishing.
