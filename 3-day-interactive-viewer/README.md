# 3-Day Skinny-Fat Starter Plan Interactive Viewer

This folder is a static web viewer for the customer-facing product.

## What It Does

- Renders the final PDF as self-paced pages.
- Adds previous and next controls.
- Adds desktop sidebar navigation.
- Adds mobile drawer navigation.
- Supports keyboard navigation with left and right arrows.
- Supports swipe navigation on touch screens.
- Includes a PDF download button.

## Files

- `index.html` - viewer page
- `styles.css` - responsive design system
- `viewer.js` - navigation and PDF rendering
- `assets/3-day-skinny-fat-starter-plan.pdf` - product PDF
- `vendor/pdfjs/` - local PDF renderer files

## Whop Path

Host this folder as a static website, then paste the public URL into Whop's Website Embed app.

Good hosting options:

- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages

This does not require a backend server. It only needs static file hosting.

## Product Note

This viewer adds interactive navigation around the PDF. Canva animations do not survive inside a normal PDF export. To recreate animated slide moments, rebuild those moments as HTML/CSS animations in this viewer.
