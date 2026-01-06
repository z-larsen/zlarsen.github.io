GitHub Pages Website Using GitHub Actions and VS Code

Creating a personal website shouldn’t require complicated tooling or expensive hosting.
This post walks through exactly how I built this site using:

GitHub Pages
GitHub Actions for CI/CD
VS Code w/with Dev Containers extension
The Chirpy Jekyll theme
Custom domain w/ HTTPS

All automated. Semi free. 
If you want to build a modern personal site with a professional and modern UI, this guide gives you every step.

Creating the GitHub Pages Repository
GitHub Pages serves sites from a repo named:
<username>.github.io

So I created:
zlarsen.github.io

This repo becomes the source of the deployed website.

Adding the Chirpy Jekyll Starter
I downloaded the Chirpy starter template and ensured all files lived in the repo root:
/_tabs
/_posts
/assets
/Gemfile
/_config.yml

**File/directory names must be lowercase
**GitHub Actions and Jekyll are case sensitive 

Setting Up GitHub Actions for CI/CD

Instead of letting GitHub Pages build the site, I use GitHub Actions.
This gives full control over Ruby, Bundler, Jekyll, plugins, deployments, and error visibility.

YAML (Config)
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

Adding My Custom Domain (zlarsen.cloud)

We are going to need some custom records
    A  @  185.199.108.153
    A  @  185.199.109.153
    A  @  185.199.110.153
    A  @  185.199.111.153
 www subdomain
    CNAME www → zlarsen.github.io

Then in GitHub:
 Repo Settings 
        Pages 
             Custom Domain 
                 your domain
                        GitHub automatically issues an HTTPS certificate

Local Development with VS Code (Dev Containers)
Didn’t want to install Ruby directly on Windows, so I used:

1. VS Code
2. Docker Desktop
3. Dev Containers extension

This gives me a clean Linux environment with Ruby + Bundler.
Open project in Dev Container
In VS Code
    Ctrl + Shift + P
        This launches a Linux container and mounts your repo inside it

Install dependencies
    bundle install
Start local preview (port 4000)
    bundle exec jekyll s
        http://localhost:4000

Too lazy to run command each time so let's create a VSCode task
    Create .vscode/tasks.json:
        
            {
            "version": "2.0.0",
            "tasks": [
                {
                "label": "Run Jekyll",
                "type": "shell",
                "command": "bundle exec jekyll s --host 0.0.0.0 --port 4000",
                "group": "build",
                "isBackground": false,
                "problemMatcher": []
                }
            ]
            }
Ctrl + Shift + B = Run Jekyll

Chirpy uses _tabs/ for sidebar navigation.
I customized 
    _tabs/blog.md
    _tabs/certifications.md
    _tabs/about.md

Each tab requires YAML front‑matter:
  
---
layout: page
title: Certifications
icon: fas fa-certificate
order: 2
---
  
Important:
Filenames must be lowercase
If you create or rename a tab, local Jekyll must be restarted

Some helpful git commands:
git status
git add -A
git commit -m "Update content"
git push

Actions deploy automatically
Pages updates almost instantly