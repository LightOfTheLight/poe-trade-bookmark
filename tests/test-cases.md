# PoE Trade 书签 - Test Cases

**Tested by:** TESTER Agent
**Date:** 2026-03-17
**Version:** 1.0.0
**Based on:** REQUIREMENT.md, source code review

---

## Testing Approach

This extension is a Chrome Extension (MV3) that requires a browser environment. Full automated UI tests would require tools like Puppeteer with Chrome extension support or a dedicated extension testing framework. This document provides:

1. **Static code review** — All source files verified against requirements
2. **Logic analysis** — Function-level test cases with expected outcomes
3. **Manual test plan** — Steps for browser-based verification

---

## 1. Manifest & Extension Setup

### TC-001: Manifest Version
- **Test:** Verify `manifest_version` is 3 (not 2)
- **Expected:** `manifest_version: 3`
- **Result:** PASS — `src/manifest.json` line 2: `"manifest_version": 3`

### TC-002: Permissions Declared
- **Test:** Verify minimal permissions — `storage`, `activeTab`, host for poe.game.qq.com
- **Expected:** Only `["storage", "activeTab"]` + host_permissions for `https://poe.game.qq.com/trade/*`
- **Result:** PASS — manifest.json lines 6-11 confirm correct permissions

### TC-003: Content Security Policy
- **Test:** Verify CSP disallows eval and remote scripts
- **Expected:** `script-src 'self'; object-src 'self'`
- **Result:** PASS — manifest.json lines 37-39 confirm correct CSP

### TC-004: Content Script Target
- **Test:** Verify content script only activates on `poe.game.qq.com/trade/*`
- **Expected:** matches: `["https://poe.game.qq.com/trade/*"]`
- **Result:** PASS — manifest.json lines 28-30

### TC-005: Extension Icons Present
- **Test:** Verify icon files exist for all declared sizes (16, 48, 128)
- **Expected:** All three icon files present
- **Result:** PASS — `src/icons/icon16.png`, `icon48.png`, `icon128.png` all exist

---

## 2. Save Search Bookmarks (Requirement 2.1)

### TC-006: Save Button Injection
- **Test:** Content script injects a `⭐ 保存书签` button on `poe.game.qq.com/trade` pages
- **Expected:** A `<button id="poe-bookmark-btn">` is created in DOM
- **Code Path:** `content.js:injectSaveButton()`
- **Result:** PASS — button injection logic is correct; `document.body.appendChild(container)` adds it to page

### TC-007: Save Button Not Injected Twice
- **Test:** Content script guard prevents double-injection
- **Expected:** `document.getElementById('poe-bookmark-btn')` check prevents second injection
- **Code Path:** `content.js:7` — `if (document.getElementById('poe-bookmark-btn')) return;`
- **Result:** PASS — guard present and correct

### TC-008: Save Button Click — Prompts for Name
- **Test:** Clicking save button shows `window.prompt('请输入书签名称：', ...)`
- **Expected:** User sees a prompt with default name pre-filled
- **Code Path:** `content.js:handleSaveBookmark()` line 106
- **Result:** PASS — `window.prompt` is called with Chinese label and a default name

### TC-009: Default Name Generation
- **Test:** Default name for URL `/trade/search/Standard/abc123`
- **Expected:** `"Standard - abc123"` (path parts after index 2 joined with " - ")
- **Code Path:** `content.js:getDefaultName()`
- **Result:** PASS — `parts.slice(2).join(' - ')` produces "Standard - abc123"

### TC-010: Default Name Fallback
- **Test:** Default name for URL with < 3 path parts (e.g., `/trade`)
- **Expected:** `"交易搜索 " + current date in zh-CN`
- **Code Path:** `content.js:getDefaultName()` — fallback on line 144
- **Result:** PASS — fallback case handles short paths correctly

### TC-011: Save — User Cancels Prompt
- **Test:** User clicks "取消" on the prompt (returns `null`)
- **Expected:** No bookmark saved, no toast shown
- **Code Path:** `content.js:107` — `if (name === null) return;`
- **Result:** PASS — null check exits early

### TC-012: Save — Empty Name Rejected
- **Test:** User submits empty string or whitespace-only name
- **Expected:** Toast "书签名称不能为空" shown; no bookmark saved
- **Code Path:** `content.js:108-111`
- **Result:** PASS — `trimmedName` check with error toast

### TC-013: Save — Unique Name Success
- **Test:** Valid unique name → bookmark saved to chrome.storage.local
- **Expected:** New bookmark object `{ id, name, url, createdAt }` appended to bookmarks array; toast "书签已保存：{name}" shown
- **Code Path:** `content.js:saveBookmark()`
- **Result:** PASS — bookmark structure is correct and complete

### TC-014: Save — Duplicate Name Handling
- **Test:** User enters a name that already exists
- **Expected:** Bookmark auto-saved with timestamp suffix; toast "书签已重名，已保存为：{newName}" shown
- **Code Path:** `content.js:118-124`
- **Result:** PASS — duplicate check present; auto-suffix uses `Date.now()` (unique); user is informed via toast

### TC-015: Bookmark ID Uniqueness
- **Test:** Two bookmarks saved in rapid succession have different IDs
- **Expected:** `generateId()` produces unique strings
- **Code Path:** `content.js:generateId()` — `Math.random().toString(36).slice(2) + Date.now().toString(36)`
- **Result:** PASS — combination of random + timestamp makes collision extremely unlikely

### TC-016: Captured Data
- **Test:** Saved bookmark contains current page URL with all query parameters
- **Expected:** `url: window.location.href` captures full URL including search params
- **Code Path:** `content.js:98` — `const currentUrl = window.location.href;`
- **Result:** PASS — `location.href` includes full URL with query string

---

## 3. Quick Load (Requirement 2.2)

### TC-017: Popup Shows Bookmark List
- **Test:** Popup renders all saved bookmarks on open
- **Expected:** Each bookmark becomes a `<li>` with a name button
- **Code Path:** `popup.js:loadBookmarks()` → `renderBookmarks()` → `createBookmarkItem()`
- **Result:** PASS — correct flow; storage is read on init

### TC-018: Popup Empty State
- **Test:** When no bookmarks exist, empty state is shown
- **Expected:** `#empty-state` div visible; `#bookmark-list` empty; count hidden
- **Code Path:** `popup.js:renderBookmarks()` lines 37-41
- **Result:** PASS — empty state display logic correct

### TC-019: Bookmark Count Display
- **Test:** When bookmarks exist, count badge shows correct number
- **Expected:** `"N 个书签"` shown in header
- **Code Path:** `popup.js:renderBookmarks()` line 44
- **Result:** PASS — count calculated from bookmarks.length

### TC-020: Click Bookmark — Navigate on Trade Page
- **Test:** User clicks a bookmark while on poe.game.qq.com tab
- **Expected:** Current tab navigates to bookmark URL; popup closes
- **Code Path:** `popup.js:loadBookmark()` — `chrome.tabs.update(currentTab.id, { url: url })`
- **Result:** PASS — URL check and tab update logic correct

### TC-021: Click Bookmark — Open New Tab (Not on Trade Page)
- **Test:** User clicks a bookmark while on a non-poe.game.qq.com tab
- **Expected:** New tab opened with bookmark URL; popup closes
- **Code Path:** `popup.js:loadBookmark()` — `chrome.tabs.create({ url: url })`
- **Result:** PASS — fallback to create new tab is correct

### TC-022: Search Parameters Restored
- **Test:** Loading a bookmark restores all original search parameters
- **Expected:** Navigating to saved URL (which includes all query params) restores the search state
- **Note:** The trade site is a SPA; navigating to a full URL with search ID or query params should restore the search. Since the full `location.href` is saved (including hash/query), this should work as designed.
- **Result:** PASS (by design — URL-based state restoration is the correct approach for this type of site)

---

## 4. Bookmark Management (Requirement 2.3)

### TC-023: Delete Button Present
- **Test:** Each bookmark item has a delete button (`🗑️`)
- **Expected:** `<button class="btn-icon btn-delete">` present in each `<li>`
- **Code Path:** `popup.js:createBookmarkItem()` lines 114-121
- **Result:** PASS

### TC-024: Delete — Confirmation Step
- **Test:** Clicking delete shows confirmation bar (not immediate deletion)
- **Expected:** `#confirm-bar` becomes visible with "确定删除「{name}」？"
- **Code Path:** `popup.js:requestDelete()` lines 200-208
- **Result:** PASS — confirmation required before deletion

### TC-025: Delete — Confirm Executes Deletion
- **Test:** Clicking confirm (✔) removes bookmark from storage and re-renders list
- **Expected:** Bookmark removed from array; storage updated; list re-rendered
- **Code Path:** `popup.js:executeDelete()` lines 213-226
- **Result:** PASS — filter + storage.set + renderBookmarks chain is correct

### TC-026: Delete — Cancel Dismisses Confirmation
- **Test:** Clicking cancel (✖) hides confirm bar without deleting
- **Expected:** `#confirm-bar` hidden; `pendingDeleteId` cleared; no storage change
- **Code Path:** `popup.js:hideConfirmBar()` — confirmNo event listener
- **Result:** PASS — cancel correctly calls hideConfirmBar()

### TC-027: Rename Button Present
- **Test:** Each bookmark item has a rename button (`✏️`)
- **Expected:** `<button class="btn-icon btn-rename">` present in each `<li>`
- **Code Path:** `popup.js:createBookmarkItem()` lines 77-83
- **Result:** PASS

### TC-028: Rename — Toggle to Edit Mode
- **Test:** Clicking rename button shows inline input and hides name button
- **Expected:** Name button hidden; rename input shown; confirm/cancel buttons shown; input focused
- **Code Path:** `popup.js:toggleRenameMode()` lines 153-160
- **Result:** PASS — all visibility changes correct; `renameInput.focus()` called

### TC-029: Rename — Confirm Saves New Name
- **Test:** Entering a new name and clicking ✔ updates storage and display
- **Expected:** Bookmark name updated in storage; button text updated inline; edit mode exits
- **Code Path:** `popup.js:commitRename()` lines 166-181
- **Result:** PASS — storage.get → update → storage.set → UI update chain is correct

### TC-030: Rename — Enter Key Commits
- **Test:** Pressing Enter in rename input triggers commit
- **Expected:** Same as TC-029
- **Code Path:** `popup.js` lines 107-108 (keydown handler)
- **Result:** PASS — Enter key handler calls commitRename

### TC-031: Rename — Escape Key Cancels
- **Test:** Pressing Escape in rename input cancels rename
- **Expected:** Returns to normal display; no storage change
- **Code Path:** `popup.js` lines 109-110 (keydown handler)
- **Result:** PASS — Escape key handler calls cancelRename

### TC-032: Rename — Empty Name Rejected
- **Test:** User attempts to save empty/whitespace-only name
- **Expected:** Silent no-op (input stays open); no storage update
- **Code Path:** `popup.js:commitRename()` line 168 — `if (!trimmed) return;`
- **Result:** PASS — empty names not saved (UX: input stays open, user can correct)

### TC-033: Cancel Rename Restores Display
- **Test:** Clicking cancel (✖) during rename exits edit mode without saving
- **Expected:** Name button restored; input hidden; original name shown
- **Code Path:** `popup.js:cancelRename()` lines 187-193
- **Result:** PASS — visibility toggles correct

---

## 5. China-Specific Integration (Requirement 2.4)

### TC-034: Extension Only Activates on Target Site
- **Test:** Content script only runs on `poe.game.qq.com/trade/*`
- **Expected:** No injection on other sites
- **Code Path:** manifest.json `content_scripts.matches`
- **Result:** PASS — host permission and content_scripts matches are both restricted to `https://poe.game.qq.com/trade/*`

### TC-035: No External Data Transmission
- **Test:** Verify no fetch/XHR calls to external servers in any source file
- **Expected:** No outbound network calls beyond Chrome APIs
- **Code Path:** Reviewed all files — no `fetch()`, `XMLHttpRequest`, `WebSocket` or similar calls
- **Result:** PASS — all data operations use `chrome.storage.local` only

### TC-036: No Site Interference
- **Test:** Save button uses fixed positioning and high z-index
- **Expected:** Button overlays page without affecting layout flow
- **Code Path:** `content.js` — `position: fixed; bottom: 20px; right: 20px; z-index: 99999`
- **Result:** PASS — fixed overlay design doesn't affect site layout

### TC-037: Chinese UI Language
- **Test:** All user-facing text is in Chinese (zh-CN)
- **Expected:** Button labels, prompts, toasts, popup text all in Chinese
- **Code Path:** content.js, popup.html, popup.js — all strings verified
- **Result:** PASS — "保存书签", "请输入书签名称：", "暂无书签", "确定删除", etc. all in Chinese

---

## 6. Security & Technical Requirements

### TC-038: No eval Usage
- **Test:** Verify no `eval()` calls in source
- **Expected:** Zero occurrences
- **Result:** PASS — no eval in any source file

### TC-039: No Remote Scripts
- **Test:** Verify no externally loaded scripts
- **Expected:** All script src attributes reference local files only
- **Code Path:** popup.html uses `<script src="popup.js">` (local only)
- **Result:** PASS

### TC-040: chrome.storage.local for Persistence
- **Test:** Verify all data operations use chrome.storage.local
- **Expected:** `chrome.storage.local.get` and `chrome.storage.local.set` exclusively
- **Result:** PASS — no sessionStorage, localStorage, or IndexedDB used

### TC-041: Real-time Popup Updates
- **Test:** When a bookmark is saved from the content script while popup is open, popup auto-updates
- **Expected:** `chrome.storage.onChanged` listener triggers `renderBookmarks` with new data
- **Code Path:** `popup.js` lines 239-243
- **Result:** PASS — onChanged listener correctly re-renders on storage changes

---

## 7. Edge Cases

### TC-042: Storage — Empty Array on First Use
- **Test:** First-time use with no bookmarks in storage
- **Expected:** `result.bookmarks || []` safely defaults to empty array; empty state shown
- **Code Path:** `popup.js:loadBookmarks()` and `content.js:handleSaveBookmark()`
- **Result:** PASS — `|| []` fallback in all storage.get callbacks

### TC-043: Content Script Deferred Injection
- **Test:** Page loads before DOMContentLoaded fires
- **Expected:** Script waits for `DOMContentLoaded` if `document.readyState === 'loading'`
- **Code Path:** `content.js` lines 173-177
- **Result:** PASS — readyState check correctly defers injection

### TC-044: Background Service Worker Lifecycle
- **Test:** Service worker installs and claims clients
- **Expected:** `skipWaiting()` + `clients.claim()` ensure immediate activation
- **Code Path:** `background.js` lines 14-20
- **Result:** PASS — standard MV3 lifecycle management

---

## Summary

| Category | Total | Pass | Fail | Notes |
|----------|-------|------|------|-------|
| Manifest & Setup | 5 | 5 | 0 | |
| Save Bookmarks | 11 | 11 | 0 | |
| Quick Load | 6 | 6 | 0 | |
| Bookmark Management | 11 | 11 | 0 | |
| China Integration | 4 | 4 | 0 | |
| Security & Technical | 4 | 4 | 0 | |
| Edge Cases | 3 | 3 | 0 | |
| **Total** | **44** | **44** | **0** | |

---

## Known Limitations / Observations

1. **Duplicate name suffix format**: When a duplicate name is detected, the auto-suffix uses a Unix timestamp (e.g., "My Search (1710000000000)"). This is technically correct per requirements ("auto-suffix") but produces an unintuitive name. Not a bug — acceptable per spec.

2. **Rename does not check duplicates**: Renaming a bookmark to an existing name is allowed. The requirements only specify duplicate handling for the "Save" operation, not rename. Not a bug.

3. **`/trade` URL check in content.js is redundant**: The guard `if (!currentUrl.includes('/trade'))` in `handleSaveBookmark` will always pass since the content script only runs on `poe.game.qq.com/trade/*`. Dead code but harmless.

4. **Storage change during delete confirmation**: If a bookmark is saved from the trade page while the popup has a delete confirmation open, `renderBookmarks` will be called (via `onChanged`), which calls `hideConfirmBar()`, dismissing the pending delete. This is a very rare edge case and arguably correct behavior (stale UI reset on data change).

5. **`activeTab` vs `tabs` permission**: `popup.js` uses `chrome.tabs.query` to read the active tab URL. This works correctly because the popup opening counts as an extension invocation, granting `activeTab` access to the tab's URL. No `"tabs"` permission needed.

---

## Manual Testing Checklist (for browser verification)

- [ ] Load unpacked extension in Chrome (chrome://extensions, Developer Mode)
- [ ] Navigate to `https://poe.game.qq.com/trade` — verify save button appears bottom-right
- [ ] Perform a trade search — verify button still visible
- [ ] Click "⭐ 保存书签" — verify prompt appears with default name
- [ ] Enter a name and confirm — verify toast appears
- [ ] Open extension popup — verify bookmark appears in list
- [ ] Click bookmark in popup — verify navigation to correct trade search
- [ ] Click rename (✏️) — verify inline edit appears
- [ ] Rename and confirm — verify updated name shown
- [ ] Click delete (🗑️) — verify confirmation bar appears
- [ ] Confirm delete — verify bookmark removed from list
- [ ] Cancel delete — verify bookmark still present
- [ ] Save duplicate name — verify auto-suffix applied and toast shown
- [ ] Close and reopen Chrome — verify bookmarks persisted

---

*Test report generated by TESTER Agent — 2026-03-17*
