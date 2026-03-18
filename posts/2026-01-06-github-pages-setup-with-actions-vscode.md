---
layout: post.njk
title: "How I Built My GitHub Pages Site Using Actions + VS Code"
date: 2026-01-06
tags: [posts, GitHub Actions, Pages, Eleventy, VSCode]
excerpt: "Creating a personal website shouldn't require complicated tooling or expensive hosting. This post walks through exactly how I built this site using modern, free tools that work seamlessly together."
---

Creating a personal website shouldn't require complicated tooling or expensive hosting. This post walks through exactly how I built this site using modern, free tools that work seamlessly together.

```
   _____ _ _   _    _       _       ____                       
  / ____(_) | | |  | |     | |     |  _ \ __ _  __ _  ___  ___ 
 | |  __ _| |_| |__| |_   _| |__   | |_) / _` |/ _` |/ _ \/ __|
 | | |_ | | __|  __  | | | | '_ \  |  __/ (_| | (_| |  __/\__ \
 | |__| | | |_| |  | | |_| | |_) | | |   \__,_|\__, |\___||___/
  \_____|_|\__|_|  |_|\__,_|_.__/  |_|          |___/           
```



## Overview

This guide covers:

- **GitHub Pages** — Free hosting for static sites
- **GitHub Actions** — Automated CI/CD pipeline
- **VS Code** — Development environment with tasks
- **Eleventy (11ty)** — Fast, flexible static site generator
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

### 3. Install Node.js

Download and install Node.js (LTS) from [nodejs.org](https://nodejs.org)

Verify installation:
```bash
node --version
npm --version
```

### 4. Configure Git

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

## Setting Up Eleventy

[Eleventy (11ty)](https://www.11ty.dev/) is a simple, fast static site generator that runs on Node.js. It supports multiple template languages and requires almost zero configuration to get started.

### Initialize the Project

```bash
npm init -y
npm install @11ty/eleventy --save-dev
npm install luxon
```

### Project Structure

Here's how I organized the site:

```
/
├── _includes/         # Layout templates (Nunjucks)
│   ├── base.njk       # Base HTML layout
│   └── post.njk       # Blog post layout
├── _data/             # Global data files
├── posts/             # Blog posts (Markdown)
├── css/
│   └── style.css      # Site styles
├── assets/
│   └── img/           # Images and favicons
├── index.njk          # Homepage
├── blog.njk           # Blog listing page
├── about.md           # About page
├── .eleventy.js       # Eleventy configuration
└── package.json
```

### Eleventy Configuration

Create `.eleventy.js` in the project root:

```javascript
const { DateTime } = require('luxon');

module.exports = function (eleventyConfig) {
  // Copy static assets to the output
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('css');

  // Date filters for templates
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' })
      .toFormat('LLL dd, yyyy');
  });

  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' })
      .toFormat('yyyy-LL-dd');
  });

  // Blog posts collection
  eleventyConfig.addCollection('posts', function (collectionApi) {
    return collectionApi.getFilteredByGlob('posts/*.md')
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  };
};
```

### Add Build Scripts

In `package.json`, add:

```json
{
  "scripts": {
    "build": "eleventy",
    "serve": "eleventy --serve",
    "start": "eleventy --serve"
  }
}
```

### Templates

Eleventy uses Nunjucks (`.njk`) templates. The base layout in `_includes/base.njk` defines the HTML shell — header, nav, main content area, and footer. Individual pages set `layout: base.njk` in their front matter.

Blog posts use Markdown with a `post.njk` layout that wraps the content with a header, date, tags, and a back-link.

---

## Setting Up GitHub Actions for CI/CD

Instead of letting GitHub Pages build the site automatically, I use GitHub Actions with Node.js and Eleventy. This gives full control over the build process, dependencies, and error visibility.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Eleventy site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm install

      - name: Build with Eleventy
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Configure Repository Settings for GitHub Actions

After creating your workflow file, you need to configure GitHub Pages to use GitHub Actions as the build source:

1. **Navigate to your repository** on GitHub

2. **Go to Settings:**
   - Click the **Settings** tab

3. **Find Pages settings:**
   - In the left sidebar, click **Pages** (under "Code and automation")

4. **Configure Build and Deployment:**
   - **Source:** Select **GitHub Actions** from the dropdown
     - This is critical! Don't use "Deploy from a branch"
   - The page should show: "Use GitHub Actions to deploy from workflows in your repository"

5. **Save** (settings auto-save)

6. **Trigger the workflow:**
   - Push any commit to the `main` branch, or
   - Go to **Actions** tab → Select "Deploy Eleventy site to Pages" → Click **Run workflow**

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

## Local Development with VS Code

### Getting Started

**1. Clone and install dependencies**

```bash
git clone https://github.com/<your-username>/<your-username>.github.io.git
cd <your-username>.github.io
npm install
```

**2. Start local preview**

```bash
npm run serve
```

Visit `http://localhost:8080` to see your site. Eleventy watches for file changes and reloads automatically.

### Automating with VS Code Tasks

Create `.vscode/tasks.json` to run the dev server with a keyboard shortcut:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run Eleventy Dev Server",
      "type": "shell",
      "command": "npm run serve",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "isBackground": true,
      "problemMatcher": []
    }
  ]
}
```

Now press `Ctrl + Shift + B` to instantly start the dev server.

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