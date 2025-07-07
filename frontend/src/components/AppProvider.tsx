import type { ReactNode } from "react";
import { useEffect } from 'react';
import { registerPWA } from 'utils/pwa';

interface Props {
  children: ReactNode;
}

/**
 * A provider wrapping the whole app.
 *
 * You can add multiple providers here by nesting them,
 * and they will all be applied to the app.
 *
 * Note: ThemeProvider is already included in AppWrapper.tsx and does not need to be added here.
 */
export const AppProvider = ({ children }: Props) => {
  // Register PWA service worker
  useEffect(() => {
    // Register PWA
    registerPWA();
    
    // Add PWA manifest link - must be properly formatted for install prompts
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    
    const manifest = {
      "name": "Mindflow - Mental Health Companion",
      "short_name": "Mindflow",
      "description": "AI-powered mental health companion for mood tracking, journaling, and self-care",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#0f172a",
      "theme_color": "#3b82f6",
      "orientation": "portrait-primary",
      "scope": "/",
      "categories": ["health", "lifestyle", "wellness"],
      "lang": "en",
      "dir": "ltr",
      "icons": [
        {
          "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%233b82f6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%238b5cf6;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='96' cy='96' r='85' fill='url(%23grad)'/%3E%3Ctext x='96' y='130' font-size='80' text-anchor='middle' fill='white'%3E🧠%3C/text%3E%3C/svg%3E",
          "sizes": "192x192",
          "type": "image/svg+xml",
          "purpose": "any"
        },
        {
          "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%233b82f6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%238b5cf6;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='96' cy='96' r='85' fill='url(%23grad)'/%3E%3Ctext x='96' y='130' font-size='80' text-anchor='middle' fill='white'%3E🧠%3C/text%3E%3C/svg%3E",
          "sizes": "192x192",
          "type": "image/svg+xml",
          "purpose": "maskable"
        },
        {
          "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%233b82f6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%238b5cf6;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='256' cy='256' r='230' fill='url(%23grad)'/%3E%3Ctext x='256' y='340' font-size='200' text-anchor='middle' fill='white'%3E🧠%3C/text%3E%3C/svg%3E",
          "sizes": "512x512",
          "type": "image/svg+xml",
          "purpose": "any"
        }
      ]
    };
    
    manifestLink.href = 'data:application/manifest+json,' + encodeURIComponent(JSON.stringify(manifest));
    document.head.appendChild(manifestLink);
    
    // Add standalone mode detection and styling
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      // Add standalone styles
      const style = document.createElement('style');
      style.textContent = `
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }
        
        #root {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        /* Hide any browser UI that might still show */
        body {
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Add safe area padding for notched devices */
        @supports (padding-top: env(safe-area-inset-top)) {
          body {
            padding-top: env(safe-area-inset-top);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `;
      document.head.appendChild(style);
      
      // Add standalone class to body for additional styling
      document.body.classList.add('standalone-app');
    }
    
    return () => {
      // Clean up manifest link
      const existingLink = document.querySelector('link[rel="manifest"]');
      if (existingLink && existingLink === manifestLink) {
        document.head.removeChild(manifestLink);
      }
    };
  }, []);

  return <>{children}</>;
};




