---
layout: post
title: "How I Built My GitHub Pages Site Using Actions + VS Code"
date: 2026-01-06
categories: [GitHub]
tags: [GitHub Actions, Pages, Chirpy, VSCode]
excerpt: "Creating a personal website shouldn't require complicated tooling or expensive hosting. This post walks through exactly how I built this site using modern, free tools that work seamlessly together."
---

```
   _____ _ _   _    _       _       ____                       
  / ____(_) | | |  | |     | |     |  _ \ __ _  __ _  ___  ___ 
 | |  __ _| |_| |__| |_   _| |__   | |_) / _` |/ _` |/ _ \/ __|
 | | |_ | | __|  __  | | | | '_ \  |  __/ (_| | (_| |  __/\__ \
 | |__| | | |_| |  | | |_| | |_) | | |   \__,_|\__, |\___||___/
  \_____|_|\__|_|  |_|\__,_|_.__/  |_|          |___/           
```

Creating a personal website shouldn't require complicated tooling or expensive hosting. This post walks through exactly how I built this site using modern, free tools that work seamlessly together.

## Overview

This guide covers:

- **GitHub Pages** — Free hosting for static sites
- **GitHub Actions** — Automated CI/CD pipeline
- **VS Code with Dev Containers** — Containerized development environment
- **Chirpy Jekyll Theme** — Professional, modern UI
- **Custom Domain with HTTPS** — Professional branding

All automated. All free (except the domain). If you want to build a modern personal site with a professional look, this guide gives you every step.

---

## Prerequisites

Before we begin, you'll need:

### 1. Create a GitHub Account

If you don't already have one:

1. Go to [github.com](https://github.com)
2. Click **Sign up**
3. Follow the registration process
4. Verify your email address and good luck with the CAPTCHA

### 2. Install Git

Download and install Git from [git-scm.com](https://git-scm.com/downloads)

Verify installation:
```bash
git --version
```

### 3. Configure Git

Set your identity:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Creating the GitHub Pages Repository

GitHub Pages serves sites from a repository named: `<username>.github.io`

### Step-by-Step Repository Creation

1. **Log in to GitHub** and navigate to your profile

2. **Create a new repository:**
   - Click the **+** icon in the top-right corner
   - Select **New repository**

3. **Configure the repository:**
   - **Repository name:** `<your-username>.github.io`
     - For example, mine is: `zlarsen.github.io`
     - The username must match your GitHub username exactly
   - **Description:** (optional) "My personal website"
   - **Visibility:** Public (required for free GitHub Pages)
   - **Initialize:** Check "Add a README file"

4. **Click** "Create repository"

This repository becomes the source of your deployed website.

---

## Adding the Chirpy Jekyll Starter

I downloaded the [Chirpy starter template](https://github.com/cotes2020/chirpy-starter) and ensured all files lived in the repo root:

```
/_tabs
/_posts
/assets
/Gemfile
/_config.yml
```

> **Important:** File and directory names must be lowercase. GitHub Actions and Jekyll are case-sensitive!

--- 

## Setting Up GitHub Actions for CI/CD

Instead of letting GitHub Pages build the site automatically, I use GitHub Actions. This gives full control over Ruby versions, Bundler, Jekyll plugins, deployments, and error visibility.

Create `.github/workflows/pages-deploy.yml`:

```yaml
name: Deploy Jekyll site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.3"
          bundler-cache: true

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Build site
        run: bundle exec jekyll build --destination _site
        env:
          JEKYLL_ENV: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        uses: actions/deploy-pages@v4
```

### Configure Repository Settings for GitHub Actions

After creating your workflow file, you need to configure GitHub Pages to use GitHub Actions as the build source:

1. **Navigate to your repository** on GitHub

2. **Go to Settings:**
   - Click the **Settings** tab (⚙️ icon)

3. **Find Pages settings:**
   - In the left sidebar, click **Pages** (under "Code and automation")

4. **Configure Build and Deployment:**
   - **Source:** Select **GitHub Actions** from the dropdown
     - This is critical! Don't use "Deploy from a branch"
   - The page should show: "Use GitHub Actions to deploy from workflows in your repository"

5. **Save** (settings auto-save)

6. **Trigger the workflow:**
   - Push any commit to the `main` branch, or
   - Go to **Actions** tab → Select "Deploy Jekyll site to Pages" → Click **Run workflow**

7. **Monitor the deployment:**
   - Watch the workflow run in the **Actions** tab
   - Once complete, your site will be live at: `https://<username>.github.io`

> **Troubleshooting:** If you see "deploy from a branch" is selected, your Actions workflow won't run. Make sure to change the Source to "GitHub Actions".

---

## Adding a Custom Domain

### DNS Configuration

Configure your DNS provider with these records:

**A Records (Apex Domain):**
```
A  @  185.199.108.153
A  @  185.199.109.153
A  @  185.199.110.153
A  @  185.199.111.153
```

**CNAME Record (www subdomain):**
```
CNAME  www  ->  zlarsen.github.io
```

### GitHub Configuration

1. Navigate to **Repo Settings** → **Pages**
2. Under **Custom Domain**, enter your domain
3. Click **Save**

GitHub automatically issues an HTTPS certificate via Let's Encrypt.

---

## Local Development with VS Code Dev Containers

I didn't want to install Ruby directly on Windows, so I used containerized development:

### Prerequisites

1. **VS Code**
2. **Docker Desktop**
3. **Dev Containers extension**

This setup provides a clean Linux environment with Ruby and Bundler pre-configured.

### Getting Started

**1. Open project in Dev Container**

Press `Ctrl + Shift + P` and search for "Dev Containers: Reopen in Container"

This launches a Linux container and mounts your repository inside it.

**2. Install dependencies**

```bash
bundle install
```

**3. Start local preview**

```bash
bundle exec jekyll s
```

Visit `http://localhost:4000` to see your site.

### Automating with VS Code Tasks

Create `.vscode/tasks.json` to run Jekyll with a keyboard shortcut:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run Jekyll",
      "type": "shell",
      "command": "bundle exec jekyll s --host 0.0.0.0 --port 4000",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "isBackground": false,
      "problemMatcher": []
    }
  ]
}
```

Now press `Ctrl + Shift + B` to instantly start Jekyll.

---

## Customizing Navigation Tabs

Chirpy uses `_tabs/` for sidebar navigation. I customized:

- `_tabs/blog.md`
- `_tabs/certifications.md`
- `_tabs/about.md`

Each tab requires YAML front matter:

```yaml
---
layout: page
title: Certifications
icon: fas fa-certificate
order: 2
---
```

> **Note:** Filenames must be lowercase. If you create or rename a tab, restart Jekyll to see changes.

---

## Publishing Changes

Basic Git workflow:

```bash
git status
git add -A
git commit -m "Update content"
git push
```

- **GitHub Actions** deploys automatically on push
- **GitHub Pages** updates within seconds

---