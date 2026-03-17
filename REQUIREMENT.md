# Project Requirements

## 1. Overview

**Project Name:** PoE Trade Bookmark
**Project Type:** Chrome Browser Extension
**Target Users:** Path of Exile Chinese server players using [poe.game.qq.com/trade](https://poe.game.qq.com/trade)

### 1.1 Vision

Enable Path of Exile Chinese server players to save, organize, and instantly reload their trade search configurations. The international PoE community has tools like [better-trading](https://github.com/exile-center/better-trading), but the Chinese version (`poe.game.qq.com/trade`) has a different URL structure and interface. This extension fills that gap.

### 1.2 Core Principles

- **Simplicity**: One-click save and load operations — minimal friction
- **China-specific**: Designed and tested exclusively for `poe.game.qq.com/trade`
- **Privacy**: All bookmark data stored locally in the browser — no external servers

---

## 2. Functional Requirements

### 2.1 Save Search Bookmarks

**Description:** Users can save the current trade search URL/parameters with a custom name directly from the trade page.

**Acceptance Criteria:**
- [ ] A "Save Bookmark" button is visible on the `poe.game.qq.com/trade` page
- [ ] Clicking the button prompts the user to enter a custom name for the bookmark
- [ ] The bookmark is persisted to Chrome's local storage
- [ ] The saved bookmark captures all current search parameters (URL, filters, item category, etc.)
- [ ] Duplicate bookmark names are handled gracefully (warn or auto-suffix)

### 2.2 Quick Load

**Description:** Users can load any saved search with a single click from the extension popup.

**Acceptance Criteria:**
- [ ] The extension popup lists all saved bookmarks
- [ ] Clicking a bookmark navigates to the trade page with that search loaded
- [ ] All original search parameters are restored correctly
- [ ] Empty state is shown when no bookmarks exist

### 2.3 Bookmark Management

**Description:** Users can manage (edit, rename, delete) their saved bookmarks.

**Acceptance Criteria:**
- [ ] Each bookmark in the popup has a rename option
- [ ] Each bookmark in the popup has a delete option
- [ ] Deletion requires a confirmation step to prevent accidental loss
- [ ] Renaming is inline (no page reload required)
- [ ] Changes are immediately reflected in local storage

### 2.4 China-Specific Integration

**Description:** The extension integrates correctly with the Chinese PoE trade site's URL structure and interface.

**Acceptance Criteria:**
- [ ] Extension activates only on `poe.game.qq.com/trade` (not other sites)
- [ ] Correctly captures and restores trade URL parameters as used by the Chinese site
- [ ] Works with the Chinese trade site's filter structure and item categories
- [ ] Extension does not interfere with normal site functionality

---

## 3. Technical Requirements

### 3.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Language | JavaScript (or TypeScript if tooling is set up) |
| Platform | Chrome Extension, Manifest V3 |
| Storage | Chrome Storage API (`chrome.storage.local`) |
| UI | HTML/CSS popup (no framework required for MVP) |
| Content Script | Vanilla JS injected into `poe.game.qq.com/trade` |

### 3.2 Project Structure

```
src/
├── manifest.json        # Chrome extension manifest (MV3)
├── popup/
│   ├── popup.html       # Extension popup UI
│   ├── popup.js         # Popup logic (list, load, delete, rename bookmarks)
│   └── popup.css        # Popup styling
├── content/
│   └── content.js       # Content script: injected into poe.game.qq.com/trade
│                        # Handles reading current search params and "Save" button
└── background/
    └── background.js    # Service worker (MV3): handles storage operations if needed
```

### 3.3 Constraints

- Must use Chrome Extension Manifest V3 (not V2, which is deprecated)
- No external server dependencies — all data stays local
- Must declare minimal permissions (`storage`, `activeTab`, host permission for `poe.game.qq.com`)
- Compatible with Chrome 88+ (Manifest V3 minimum)

---

## 4. Non-Functional Requirements

### 4.1 Performance

- Extension popup must render within 200ms
- Bookmark save/load operations must complete within 100ms
- Content script injection must not noticeably delay page load

### 4.2 Security

- No external data transmission of any kind
- No collection of user trade data beyond local storage
- Follow Chrome Extension security best practices (CSP, no `eval`, no remote scripts)

### 4.3 Usability

- UI must work without any setup or configuration
- Text labels and messages should be in Chinese (zh-CN) to match the target audience
- Extension icon should be recognizable and themed appropriately

---

## 5. Acceptance Criteria

### 5.1 MVP (Minimum Viable Product)

- [ ] Chrome extension loads without errors on Chrome 88+
- [ ] Extension activates only on `poe.game.qq.com/trade`
- [ ] User can save the current trade search as a named bookmark
- [ ] User can view all saved bookmarks in the popup
- [ ] User can load a saved bookmark (navigates to the correct search)
- [ ] User can delete a saved bookmark
- [ ] All data persists across browser sessions (Chrome local storage)

### 5.2 Future Enhancements

- Bookmark categories or folders for organization
- Import/export bookmarks as JSON
- Sync across devices using `chrome.storage.sync`
- Support for multiple PoE leagues/seasons (tag bookmarks by league)
- Drag-and-drop reordering of bookmarks
- Search/filter within saved bookmarks
- One-click copy of trade search URL

---

## 6. Open Questions / Assumptions

| # | Question / Assumption | Status |
|---|----------------------|--------|
| 1 | The Chinese trade site uses URL-encoded search parameters similar to the international site | Assumed — DEV to verify |
| 2 | No login/authentication is needed to save bookmarks (local only) | Confirmed (local storage design) |
| 3 | TypeScript tooling (bundler, etc.) is not required for MVP | Assumed — plain JS for simplicity |
| 4 | UI language should be Chinese (zh-CN) | Assumed based on target audience |

---

*Document maintained by: PO Agent*
*Last updated: 2026-03-17*
