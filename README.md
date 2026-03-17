# PoE Trade Bookmark

A Chrome extension for saving and loading trading searches on [Path of Exile China's trade site](https://poe.game.qq.com/trade). Similar to [better-trading](https://github.com/exile-center/better-trading), but specifically designed for the Chinese version of Path of Exile.

This project uses the [TouchFish Agent](https://github.com/LightOfTheLight/touchfish_agent) workflow for AI-powered development.

## Features

- **Save Search Bookmarks**: Save your current trading search parameters with custom names
- **Quick Load**: Instantly load saved searches with one click
- **Search Management**: Edit, rename, or delete saved bookmarks
- **China-Specific**: Built specifically for `poe.game.qq.com/trade` interface and functionality
- **Local Storage**: All bookmarks stored locally in your browser

## Why This Project?

While projects like [better-trading](https://github.com/exile-center/better-trading) exist for the international PoE trade site, the Chinese version (`poe.game.qq.com/trade`) has a different URL structure and interface. This extension is specifically designed to work with the China version's trading platform.

## Development with TouchFish Agent

This project leverages AI-powered development workflow using Claude Code in Docker containers, triggered by GitHub Actions. Three AI agents assist with development:

| Agent | Role | Triggered by |
|-------|------|--------------|
| **PO** | Product Owner - analyzes requirements, maintains REQUIREMENT.md | `@PO` in commit message |
| **DEV** | Developer - implements features and fixes based on requirements | `@DEV` in commit message |
| **TESTER** | QA - creates and runs test cases based on requirements | `@TESTER` in commit message |

## Quick Start

### 1. Fork this repo

Click **"Use this template"** or **"Fork"** to create your own copy.

### 2. Set up the secret

Go to **Settings > Secrets and variables > Actions** and add:

| Secret | Description |
|--------|-------------|
| `CLAUDE_CODE_OAUTH_TOKEN` | Your Claude Code OAuth token |

That's the only secret you need. The agent Docker image is public and requires no authentication to pull.

### 3. Create a working branch

```bash
git checkout -b dev/my-feature
```

Agents only trigger on non-master/main branches.

### 4. Start development

Update `REQUIREMENT.md` with your feature requirements, then commit:

```bash
git add REQUIREMENT.md
git commit -m "Add bookmark save/load feature requirements @PO"
git push origin dev/my-feature
```

The `@PO` trigger tells the PO agent to analyze and refine your requirements in `REQUIREMENT.md`.

### 5. Trigger agents

Include an agent trigger in your commit message:

```bash
# Have the PO analyze requirements
git commit -m "Add bookmark management requirements @PO"

# Have the DEV implement a feature
git commit -m "Implement bookmark save functionality @DEV"

# Have the TESTER write tests
git commit -m "Write tests for bookmark storage @TESTER"
```

You can also use bracket syntax: `[DEV]`, `[PO]`, `[TESTER]`.

### 6. Review PRs

Each agent session creates a PR with its changes. Review, provide feedback, and merge.

## How It Works

1. You push a commit with an agent trigger (e.g., `@DEV`)
2. GitHub Actions detects the trigger and starts the workflow
3. The pre-built Docker image is pulled from `ghcr.io/lightofthelight/touchfish-agent:latest`
4. Claude Code runs inside the container with the specified agent role
5. The agent reads its instructions, your requirements, and the commit message
6. Changes are pushed to a temporary branch and a PR is created

## Repository Structure

```
.
├── .github/workflows/
│   └── agent-trigger.yml    # GitHub Actions workflow
├── agents/
│   ├── PO/                  # Product Owner agent
│   ├── DEV/                 # Developer agent
│   └── TESTER/              # QA agent
├── src/                     # Extension source code
│   ├── manifest.json        # Chrome extension manifest
│   ├── popup/               # Extension popup UI
│   ├── content/             # Content scripts for poe.game.qq.com
│   └── background/          # Background scripts
├── REQUIREMENT.md           # Project requirements
└── README.md                # This file
```

## Customization

- **Agent behavior**: Edit the agent definition files in `agents/` to customize how each agent works
- **Workflow**: Modify `.github/workflows/agent-trigger.yml` to change triggers or add steps
- **Requirements**: Edit `REQUIREMENT.md` directly or let the PO agent manage it

## Requirements

- A GitHub repository (this one, forked)
- A `CLAUDE_CODE_OAUTH_TOKEN` secret configured in your repo
- Commits pushed to a non-master/main branch with agent triggers

## Installation (For Users)

Once the extension is developed:

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `src` folder from this repository
6. Visit [poe.game.qq.com/trade](https://poe.game.qq.com/trade) and start using the extension

## Links

- [TouchFish Agent](https://github.com/LightOfTheLight/touchfish_agent) - The core agent system
- [PoE China Trade](https://poe.game.qq.com/trade) - Path of Exile China trading platform
- [better-trading](https://github.com/exile-center/better-trading) - Similar project for international PoE
