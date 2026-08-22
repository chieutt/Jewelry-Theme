# Jewelry Theme — modular static preview

The original single-file SPINEL prototype is split into a maintainable static structure while preserving the current visual output and interactions.

```text
.
├── index.html
├── assets/
│   ├── css/
│   │   └── theme-01.css … theme-17.css
│   └── js/
│       ├── app.js
│       ├── homepage.js
│       ├── gift-bundle.js
│       ├── sticky-atelier.js
│       ├── featured-product.js
│       └── navigation.js
├── section/
│   ├── 01-hero.html
│   ├── 01a-authority-numbers.html
│   ├── 02-editorial-collection.html
│   ├── 03-image-banner.html
│   ├── 03b-text-highlight.html
│   ├── 04-highlight.html
│   ├── 05-collection-studies.html
│   ├── 06-marquee.html
│   ├── 07-featured-edit.html
│   ├── 08-video-banner.html
│   ├── 09-shop-the-look.html
│   ├── 10-launch-ledger.html
│   ├── 11-image-text.html
│   ├── 12-sticky-atelier.html
│   ├── 13-gift-bundle.html
│   ├── 14-journal.html
│   ├── 15-featured-product.html
│   ├── 16-testimonials.html
│   ├── 17-social-gallery.html
│   └── 18-service-strip.html
└── snippet/
    ├── topbar.html
    ├── header.html
    ├── mega-menu.html
    ├── search-plane.html
    ├── nav-backdrop.html
    ├── mobile-menu.html
    └── footer.html
```

## Structure rules

- `index.html`: document shell and homepage section order only.
- `assets/`: CSS and JavaScript.
- `section/`: complete page sections.
- `snippet/`: reusable UI/chrome components.
- `assets/js/app.js`: loads HTML partials recursively, then starts the existing interactions.

This remains plain HTML/CSS/JS and can be deployed directly by Vercel with no build command.
