/**
 * Content Script: PoE Trade 书签
 * Injected into poe.game.qq.com/trade pages.
 * Adds a "保存书签" (Save Bookmark) button to the page.
 */

(function () {
  'use strict';

  // Only run once
  if (document.getElementById('poe-bookmark-btn')) return;

  /**
   * Create and inject the Save Bookmark button into the page.
   * The button floats in a fixed position so it doesn't interfere with the site layout.
   */
  function injectSaveButton() {
    const container = document.createElement('div');
    container.id = 'poe-bookmark-container';
    container.style.cssText = [
      'position: fixed',
      'bottom: 20px',
      'right: 20px',
      'z-index: 99999',
      'display: flex',
      'flex-direction: column',
      'align-items: flex-end',
      'gap: 8px',
      'font-family: "Microsoft YaHei", "微软雅黑", sans-serif'
    ].join(';');

    const button = document.createElement('button');
    button.id = 'poe-bookmark-btn';
    button.textContent = '⭐ 保存书签';
    button.style.cssText = [
      'background: #c8a84b',
      'color: #1a1a1a',
      'border: 2px solid #8b6914',
      'border-radius: 4px',
      'padding: 8px 16px',
      'font-size: 14px',
      'font-weight: bold',
      'cursor: pointer',
      'box-shadow: 0 2px 8px rgba(0,0,0,0.5)',
      'transition: background 0.2s'
    ].join(';');

    button.addEventListener('mouseenter', function () {
      this.style.background = '#e0b850';
    });
    button.addEventListener('mouseleave', function () {
      this.style.background = '#c8a84b';
    });
    button.addEventListener('click', handleSaveBookmark);

    // Toast notification element
    const toast = document.createElement('div');
    toast.id = 'poe-bookmark-toast';
    toast.style.cssText = [
      'background: rgba(30,30,30,0.95)',
      'color: #c8a84b',
      'border: 1px solid #8b6914',
      'border-radius: 4px',
      'padding: 8px 14px',
      'font-size: 13px',
      'display: none',
      'max-width: 220px',
      'text-align: center',
      'box-shadow: 0 2px 8px rgba(0,0,0,0.5)'
    ].join(';');

    container.appendChild(toast);
    container.appendChild(button);
    document.body.appendChild(container);
  }

  /**
   * Show a temporary toast notification.
   * @param {string} message
   * @param {boolean} isError
   */
  function showToast(message, isError) {
    const toast = document.getElementById('poe-bookmark-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.color = isError ? '#e05555' : '#c8a84b';
    toast.style.display = 'block';
    setTimeout(function () {
      toast.style.display = 'none';
    }, 2500);
  }

  /**
   * Handle the Save Bookmark button click.
   * Prompts the user for a name and saves the current URL to chrome.storage.local.
   */
  function handleSaveBookmark() {
    const currentUrl = window.location.href;

    // Only save trade search pages (not the home/index page with no search)
    if (!currentUrl.includes('/trade')) {
      showToast('请先进行一次交易搜索', true);
      return;
    }

    const name = window.prompt('请输入书签名称：', getDefaultName());
    if (name === null) return; // User cancelled
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast('书签名称不能为空', true);
      return;
    }

    chrome.storage.local.get(['bookmarks'], function (result) {
      const bookmarks = result.bookmarks || [];

      // Check for duplicate names
      const duplicate = bookmarks.find(function (b) { return b.name === trimmedName; });
      if (duplicate) {
        // Auto-suffix with a counter to handle duplicates gracefully
        const suffix = Date.now();
        const newName = trimmedName + ' (' + suffix + ')';
        saveBookmark(bookmarks, newName, currentUrl);
        showToast('书签已重名，已保存为：' + newName);
      } else {
        saveBookmark(bookmarks, trimmedName, currentUrl);
        showToast('书签已保存：' + trimmedName);
      }
    });
  }

  /**
   * Generate a default bookmark name from the current URL path.
   * @returns {string}
   */
  function getDefaultName() {
    const path = window.location.pathname;
    // Extract league or search ID from URL path like /trade/search/Standard/abc123
    const parts = path.split('/').filter(Boolean);
    // parts = ['trade', 'search', 'Standard', 'abc123'] or similar
    if (parts.length >= 3) {
      return parts.slice(2).join(' - ');
    }
    return '交易搜索 ' + new Date().toLocaleDateString('zh-CN');
  }

  /**
   * Persist a new bookmark to chrome.storage.local.
   * @param {Array} bookmarks - Existing bookmarks array
   * @param {string} name
   * @param {string} url
   */
  function saveBookmark(bookmarks, name, url) {
    const newBookmark = {
      id: generateId(),
      name: name,
      url: url,
      createdAt: new Date().toISOString()
    };
    bookmarks.push(newBookmark);
    chrome.storage.local.set({ bookmarks: bookmarks });
  }

  /**
   * Generate a simple unique ID.
   * @returns {string}
   */
  function generateId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // Wait for the DOM to be ready before injecting
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSaveButton);
  } else {
    injectSaveButton();
  }
})();
