---
# the default layout is 'page'
icon: fas fa-info-circle
order: 4
title: About
---

<style>
/* Section styling */
.about-section {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color, #eaeaea);
}

.about-section:last-child {
  border-bottom: none;
}

.about-section h2 {
  margin-bottom: 1.2rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.about-section p {
  line-height: 1.8;
  font-size: 1.05rem;
  margin-bottom: 1rem;
}

/* Certification Grid */
.cert-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  margin: 2rem 0;
  justify-content: flex-start;
  align-items: flex-start;
}

.cert-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 280px;
}

.cert-card img {
  max-width: 200px;
  max-height: 200px;
  width: auto;
  height: auto;
  margin-bottom: 1rem;
  display: block;
  cursor: default;
}

.finops-badge {
  max-width: 160px !important;
  max-height: 160px !important;
}

.azure-badge {
  max-width: 320px !important;
  max-height: 160px !important;
}

.cert-name {
  font-weight: 600;
  font-size: 1rem;
  margin-top: 0.5rem;
  line-height: 1.4;
  color: var(--link-color, #0366d6);
  cursor: pointer;
  text-decoration: none !important;
  transition: opacity 0.2s ease;
  display: inline-block;
  border-bottom: none !important;
}

.cert-name:hover {
  opacity: 0.7;
  text-decoration: none !important;
  border-bottom: none !important;
}

a.cert-name {
  text-decoration: none !important;
  border-bottom: none !important;
}

a.cert-name:hover {
  text-decoration: none !important;
  border-bottom: none !important;
}

.cert-link {
  color: var(--link-color, #0366d6);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Focus areas styling */
.focus-areas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.focus-tag {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: var(--tag-bg, #e8f4f8);
  color: var(--tag-color, #0366d6);
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .cert-card {
    background: transparent;
    border: none;
  }
  
  .focus-tag {
    background: var(--tag-bg, #1a3a52);
    color: var(--tag-color, #58a6ff);
  }
}
</style>

## About Me

I'm a Cloud Solution Architect with a passion for Azure. I enjoy helping organizations navigate their cloud journey and optimize their Azure environments.

<div class="focus-areas">
  <span class="focus-tag">Cloud Architecture</span>
  <span class="focus-tag">Security & Governance</span>
  <span class="focus-tag">Networking</span>
  <span class="focus-tag">FinOps</span>
  <span class="focus-tag">Resiliency</span>
  <span class="focus-tag">Automation</span>
</div>

---

## What is this blog about?

I started this blog to share what I've learned navigating the complex cloud landscape. My aim is simple: take intricate cloud concepts and break them down into practical, easy-to-follow guides for all audiences.

---

## Certifications

<div class="cert-grid">
  <div class="cert-card">
    <img src="/assets/img/az104Badge.png" alt="Microsoft Azure Administrator Associate Badge" class="azure-badge" />
    <a href="https://learn.microsoft.com/api/credentials/share/en-us/ZacLarsen-9767/9209D026AA374403?sharingId=DE68F1EA2957BC1D" target="_blank" rel="noopener noreferrer" class="cert-name">Microsoft Certified: Azure Administrator Associate</a>
  </div>
  
  <div class="cert-card">
    <img src="/assets/img/finops-certified-practitioner.3.png" alt="FinOps Certified Practitioner Badge" class="finops-badge" />
    <a href="https://verify.skilljar.com/c/gfo2icfsodda" target="_blank" rel="noopener noreferrer" class="cert-name">FinOps Certified Practitioner</a>
  </div>
</div>

