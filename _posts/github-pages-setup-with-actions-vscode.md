---
layout: post
title: "How I Built My GitHub Pages Site Using Actions and VS Code"
date: 2026-01-06
categories: [GitHub, CI/CD, Jekyll]
tags: [GitHub Actions, Pages, Chirpy, VSCode]
---

# GitHub Pages Website Using GitHub Actions and VS Code

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

## Creating the GitHub Pages Repository

GitHub Pages serves sites from a repository named: `<username>.github.io`

For my site, I created:

```
zlarsen.github.io
```

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
CNAME  www  →  zlarsen.github.io
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

## Summary

You now have a fully automated personal website with:

✅ Professional Jekyll theme  
✅ Free hosting on GitHub Pages  
✅ Automated deployments via GitHub Actions  
✅ Local development in VS Code  
✅ Custom domain with HTTPS  
