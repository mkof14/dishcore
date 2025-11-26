/**
 * Mobile-first optimizations and responsive design
 */

/* Touch-friendly tap targets */
.tap-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Smooth scrolling for mobile */
@media (max-width: 768px) {
  html {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }

  body {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }

  /* Mobile-optimized padding */
  .mobile-container {
    padding: 1rem;
  }

  /* Stack cards vertically on mobile */
  .card-grid {
    grid-template-columns: 1fr !important;
  }

  /* Larger text on mobile for readability */
  .mobile-text-lg {
    font-size: 1.125rem;
  }

  /* Full-width buttons on mobile */
  .mobile-button-full {
    width: 100% !important;
  }

  /* Hide elements on mobile */
  .hide-mobile {
    display: none !important;
  }

  /* Bottom navigation for mobile */
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 0.5rem;
    z-index: 1000;
    display: flex;
    justify-content: space-around;
  }

  /* Swipeable cards */
  .swipeable {
    touch-action: pan-y;
  }

  /* Optimized dialogs for mobile */
  [role="dialog"] {
    max-height: 90vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* Pull-to-refresh indicator */
  .pull-to-refresh {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem 1rem;
    background: var(--accent-from);
    color: white;
    border-radius: 0 0 12px 12px;
    font-size: 0.875rem;
    z-index: 9999;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1024px) {
  .tablet-grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .tablet-hide {
    display: none !important;
  }
}

/* Safe areas for notched devices */
@supports (padding: max(0px)) {
  .safe-area-top {
    padding-top: max(1rem, env(safe-area-inset-top));
  }

  .safe-area-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  .safe-area-left {
    padding-left: max(1rem, env(safe-area-inset-left));
  }

  .safe-area-right {
    padding-right: max(1rem, env(safe-area-inset-right));
  }
}

/* Landscape optimizations */
@media (max-height: 500px) and (orientation: landscape) {
  .landscape-hide {
    display: none !important;
  }

  .landscape-flex {
    display: flex;
    flex-direction: row;
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --border: #000000;
    --text-primary: #000000;
    --background: #ffffff;
  }
}

/* Dark mode optimizations */
@media (prefers-color-scheme: dark) {
  .auto-dark {
    background: #1a1a1a;
    color: #ffffff;
  }
}

/* Touch gestures */
.swipe-left {
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.swipe-right {
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

/* Loading skeletons */
.skeleton {
  background: linear-gradient(90deg, 
    var(--background) 0%, 
    var(--border) 50%, 
    var(--background) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Sticky headers on mobile */
.mobile-sticky {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--surface);
  backdrop-filter: blur(10px);
}

/* Improved form inputs for mobile */
@media (max-width: 768px) {
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"],
  textarea,
  select {
    font-size: 16px !important; /* Prevents zoom on iOS */
  }
}

/* Bottom sheet for mobile */
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--surface);
  border-radius: 24px 24px 0 0;
  padding: 1.5rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.bottom-sheet.open {
  transform: translateY(0);
}

/* Haptic feedback simulation */
.haptic-feedback:active {
  transform: scale(0.98);
  transition: transform 0.1s;
}

/* Mobile menu optimizations */
@media (max-width: 768px) {
  .mobile-menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--surface);
    z-index: 9999;
    padding: 2rem;
    overflow-y: auto;
  }

  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 9998;
  }
}