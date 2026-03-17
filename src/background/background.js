/**
 * Background Service Worker: PoE Trade 书签
 *
 * Minimal service worker for Manifest V3.
 * Core bookmark operations (read/write) are handled directly by the popup
 * and content scripts using chrome.storage.local. This service worker is
 * included for forward compatibility and to handle any cross-context
 * messaging needs.
 */

'use strict';

// Log when the service worker installs
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

/**
 * Listen for messages from content scripts or popup.
 * Currently not required for MVP — all storage ops are done client-side —
 * but this hook is available for future enhancements (e.g. import/export).
 */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message && message.type === 'ping') {
    sendResponse({ status: 'ok' });
  }
  // Return false to indicate we're not sending an async response
  return false;
});
