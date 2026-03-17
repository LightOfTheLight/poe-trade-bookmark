/**
 * Popup Script: PoE Trade 书签
 * Handles listing, loading, renaming, and deleting bookmarks.
 */

(function () {
  'use strict';

  var pendingDeleteId = null;

  // DOM references
  var bookmarkList = document.getElementById('bookmark-list');
  var emptyState = document.getElementById('empty-state');
  var bookmarkCount = document.getElementById('bookmark-count');
  var confirmBar = document.getElementById('confirm-bar');
  var confirmYes = document.getElementById('confirm-yes');
  var confirmNo = document.getElementById('confirm-no');

  /**
   * Load bookmarks from chrome.storage.local and render the list.
   */
  function loadBookmarks() {
    chrome.storage.local.get(['bookmarks'], function (result) {
      var bookmarks = result.bookmarks || [];
      renderBookmarks(bookmarks);
    });
  }

  /**
   * Render the bookmark list into the DOM.
   * @param {Array} bookmarks
   */
  function renderBookmarks(bookmarks) {
    bookmarkList.innerHTML = '';
    hideConfirmBar();

    if (bookmarks.length === 0) {
      emptyState.style.display = 'block';
      bookmarkCount.textContent = '';
      return;
    }

    emptyState.style.display = 'none';
    bookmarkCount.textContent = bookmarks.length + ' 个书签';

    bookmarks.forEach(function (bookmark) {
      var li = createBookmarkItem(bookmark);
      bookmarkList.appendChild(li);
    });
  }

  /**
   * Create a list item element for a single bookmark.
   * @param {Object} bookmark - { id, name, url, createdAt }
   * @returns {HTMLLIElement}
   */
  function createBookmarkItem(bookmark) {
    var li = document.createElement('li');
    li.dataset.id = bookmark.id;

    // Load button (shows bookmark name, click to navigate)
    var nameBtn = document.createElement('button');
    nameBtn.className = 'bookmark-name';
    nameBtn.textContent = bookmark.name;
    nameBtn.title = bookmark.url;
    nameBtn.addEventListener('click', function () {
      loadBookmark(bookmark.url);
    });

    // Rename input (hidden initially)
    var renameInput = document.createElement('input');
    renameInput.type = 'text';
    renameInput.className = 'rename-input';
    renameInput.value = bookmark.name;

    // Rename button
    var renameBtn = document.createElement('button');
    renameBtn.className = 'btn-icon btn-rename';
    renameBtn.textContent = '✏️';
    renameBtn.title = '重命名';
    renameBtn.addEventListener('click', function () {
      toggleRenameMode(li, nameBtn, renameInput, renameBtn, confirmRenameBtn, cancelRenameBtn);
    });

    // Confirm rename button
    var confirmRenameBtn = document.createElement('button');
    confirmRenameBtn.className = 'btn-icon btn-confirm';
    confirmRenameBtn.textContent = '✔';
    confirmRenameBtn.title = '确认重命名';
    confirmRenameBtn.style.display = 'none';
    confirmRenameBtn.addEventListener('click', function () {
      commitRename(bookmark.id, renameInput.value, li, nameBtn, renameInput, renameBtn, confirmRenameBtn, cancelRenameBtn);
    });

    // Cancel rename button
    var cancelRenameBtn = document.createElement('button');
    cancelRenameBtn.className = 'btn-icon btn-cancel';
    cancelRenameBtn.textContent = '✖';
    cancelRenameBtn.title = '取消重命名';
    cancelRenameBtn.style.display = 'none';
    cancelRenameBtn.addEventListener('click', function () {
      cancelRename(li, nameBtn, renameInput, renameBtn, confirmRenameBtn, cancelRenameBtn);
    });

    // Allow Enter/Escape in rename input
    renameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        commitRename(bookmark.id, renameInput.value, li, nameBtn, renameInput, renameBtn, confirmRenameBtn, cancelRenameBtn);
      } else if (e.key === 'Escape') {
        cancelRename(li, nameBtn, renameInput, renameBtn, confirmRenameBtn, cancelRenameBtn);
      }
    });

    // Delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-icon btn-delete';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = '删除';
    deleteBtn.addEventListener('click', function () {
      requestDelete(bookmark.id, bookmark.name);
    });

    li.appendChild(nameBtn);
    li.appendChild(renameInput);
    li.appendChild(renameBtn);
    li.appendChild(confirmRenameBtn);
    li.appendChild(cancelRenameBtn);
    li.appendChild(deleteBtn);

    return li;
  }

  /**
   * Open the active trade page tab or create a new one with the given URL.
   * @param {string} url
   */
  function loadBookmark(url) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      // If we're already on a poe trade tab, navigate it; otherwise open a new tab
      if (currentTab && currentTab.url && currentTab.url.includes('poe.game.qq.com')) {
        chrome.tabs.update(currentTab.id, { url: url });
      } else {
        chrome.tabs.create({ url: url });
      }
      window.close();
    });
  }

  /**
   * Show rename UI for a bookmark row.
   */
  function toggleRenameMode(li, nameBtn, renameInput, renameBtn, confirmBtn, cancelBtn) {
    nameBtn.style.display = 'none';
    renameInput.style.display = 'block';
    renameBtn.style.display = 'none';
    confirmBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    renameInput.focus();
    renameInput.select();
  }

  /**
   * Commit the rename operation to storage.
   */
  function commitRename(id, newName, li, nameBtn, renameInput, renameBtn, confirmBtn, cancelBtn) {
    var trimmed = newName.trim();
    if (!trimmed) return;

    chrome.storage.local.get(['bookmarks'], function (result) {
      var bookmarks = result.bookmarks || [];
      var bookmark = bookmarks.find(function (b) { return b.id === id; });
      if (bookmark) {
        bookmark.name = trimmed;
        chrome.storage.local.set({ bookmarks: bookmarks }, function () {
          nameBtn.textContent = trimmed;
          cancelRename(li, nameBtn, renameInput, renameBtn, confirmBtn, cancelBtn);
          // Update count label (name change doesn't affect count)
        });
      }
    });
  }

  /**
   * Cancel rename and restore the name display.
   */
  function cancelRename(li, nameBtn, renameInput, renameBtn, confirmBtn, cancelBtn) {
    renameInput.style.display = 'none';
    confirmBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    nameBtn.style.display = 'block';
    renameBtn.style.display = 'inline-block';
  }

  /**
   * Show the confirm bar and set pending delete ID.
   * @param {string} id
   * @param {string} name
   */
  function requestDelete(id, name) {
    pendingDeleteId = id;
    var confirmText = document.getElementById('confirm-text');
    confirmText.textContent = '确定删除「' + name + '」？';
    confirmBar.classList.add('visible');
    confirmBar.style.display = 'flex';
    // Scroll confirm bar into view
    confirmBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Execute the pending delete.
   */
  function executeDelete() {
    if (!pendingDeleteId) return;
    var idToDelete = pendingDeleteId;
    hideConfirmBar();

    chrome.storage.local.get(['bookmarks'], function (result) {
      var bookmarks = (result.bookmarks || []).filter(function (b) {
        return b.id !== idToDelete;
      });
      chrome.storage.local.set({ bookmarks: bookmarks }, function () {
        renderBookmarks(bookmarks);
      });
    });
  }

  function hideConfirmBar() {
    pendingDeleteId = null;
    confirmBar.classList.remove('visible');
    confirmBar.style.display = 'none';
  }

  // Wire up confirm bar buttons
  confirmYes.addEventListener('click', executeDelete);
  confirmNo.addEventListener('click', hideConfirmBar);

  // Listen for storage changes (e.g., bookmark saved from content script)
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === 'local' && changes.bookmarks) {
      renderBookmarks(changes.bookmarks.newValue || []);
    }
  });

  // Initial load
  loadBookmarks();
})();
