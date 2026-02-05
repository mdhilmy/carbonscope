/**
 * Service Worker Generator
 * Generates service worker configuration for Workbox
 * Run with: node scripts/generateServiceWorker.js
 */

import { generateSW } from 'workbox-build'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildSW() {
  try {
    const { count, size, warnings } = await generateSW({
      swDest: join(__dirname, '../dist/service-worker.js'),
      globDirectory: join(__dirname, '../dist'),
      globPatterns: [
        '**/*.{html,js,css,png,jpg,jpeg,svg,gif,woff,woff2,json}',
      ],
      globIgnores: [
        '**/node_modules/**/*',
        'service-worker.js',
        'workbox-*.js',
      ],

      // Skip waiting to activate immediately
      skipWaiting: true,
      clientsClaim: true,

      // Runtime caching strategies
      runtimeCaching: [
        // Cache API responses with stale-while-revalidate
        {
          urlPattern: /^https:\/\/data\.epa\.gov\//,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'epa-api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 86400, // 24 hours
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/api\.carbonintensity\.org\.uk\//,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'uk-carbon-api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 1800, // 30 minutes
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/api\.eia\.gov\//,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'eia-api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 21600, // 6 hours
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/api\.electricitymap\.org\//,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'electricitymaps-api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 1800, // 30 minutes
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },

        // Cache static assets with cache-first strategy
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 604800, // 7 days
            },
          },
        },

        // Cache fonts
        {
          urlPattern: /\.(?:woff|woff2|eot|ttf|otf)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'fonts-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 2592000, // 30 days
            },
          },
        },

        // Cache JavaScript and CSS with stale-while-revalidate
        {
          urlPattern: /\.(?:js|css)$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 86400, // 24 hours
            },
          },
        },

        // Cache JSON data files
        {
          urlPattern: /\.json$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'json-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 86400, // 24 hours
            },
          },
        },
      ],

      // Navigation fallback for SPA
      navigateFallback: '/carbonscope/index.html',
      navigateFallbackAllowlist: [/^(?!\/__)/],
    })

    if (warnings.length > 0) {
      console.warn('Workbox warnings:')
      warnings.forEach(warning => console.warn('  -', warning))
    }

    console.log(`Service worker generated successfully!`)
    console.log(`  - Precached ${count} files`)
    console.log(`  - Total size: ${(size / 1024).toFixed(2)} KB`)
  } catch (error) {
    console.error('Error generating service worker:', error)
    process.exit(1)
  }
}

buildSW()
