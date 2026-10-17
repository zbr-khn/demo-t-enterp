# Tuba Enterprises Website (demo-t-enterp)

A polished, trustworthy, modern one-page website for **Tuba Enterprises**, a dedicated local 20-litre drinking-water bottle home delivery service based in Okhla, New Delhi.

## Features

- **Pure 20L Water Bottle Home Delivery**: Reliable, hygienic drinking-water delivery to your doorstep across Okhla.
- **Fast Ordering**: Click-to-call direct dialing (`+91 9866063694`) and interactive pre-filled WhatsApp order messaging.
- **Floating WhatsApp Quick-Contact**: Always-accessible hover WhatsApp button with pulse animation for instant customer support.
- **Seamless Order Booking Form**: Multi-field booking form with strict client-side validation and automated phone/chat redirection.
- **Enterprise-Grade Security Hardening**:
  - Content Security Policy (CSP) headers & anti-clickjacking (`frame-ancestors: 'none'`)
  - Strict input sanitization preventing Stored & Reflected XSS
  - Client-side rolling-window rate limiting
  - Reverse tabnabbing defense (`rel="noopener noreferrer"`)
  - Authenticated staff management portal with SHA-256 cryptographic hashing and timing-safe comparisons

## Tech Stack

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)

## Getting Started

1. Clone repository:
   ```bash
   git clone https://github.com/zbr-khn/demo-t-enterp.git
   cd demo-t-enterp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
