---
layout: post.njk
title: "Azure Resource Tagger: Bulk Tagging Before Policy Enforcement"
date: 2026-04-23
tags: [posts, azure, tagging, governance, powershell, tools]
category: Tools
tool: true
excerpt: "A PowerShell WPF tool that scans your Azure subscription for tagging gaps and lets you bulk-apply or remove tags at scale -- built for the moment before you flip a tag policy from audit to deny."
---

# Azure Resource Tagger: Bulk Tagging Before Policy Enforcement

![PowerShell 5.1+](https://img.shields.io/badge/PowerShell-5.1%2B-blue?logo=powershell&logoColor=white) ![Azure Az Modules](https://img.shields.io/badge/Azure-Az%20Modules-0078D4?logo=microsoftazure&logoColor=white) ![License MIT](https://img.shields.io/badge/License-MIT-green) ![Version 1.1.0](https://img.shields.io/badge/Version-1.1.0-brightgreen)

This one came out of a real problem. Azure Policy can enforce tags going forward, but it won't backfill what's already deployed. So when you switch a "require tag" policy from audit to deny, every resource group that's missing that tag starts breaking deployments. I kept running into this same gap at customer sites -- policy enforcement was ready to go, but hundreds of existing resources hadn't been tagged yet and nobody wanted to do it manually in the portal.

If you're managing your infrastructure through Bicep or Terraform, you can handle this in code -- define your tags in your templates, run a deployment, and you're done. But not every organization is there yet. Plenty of environments have resources that were deployed through the portal, through CLI one-liners, or through templates that didn't include tags at the time. In those cases, backfilling tags means either clicking through the portal one resource at a time, scripting it yourself with `az tag update` loops, or writing throwaway IaC just to patch metadata. None of those options are great when you're staring at 200 resource groups that need five tags each.

The Azure Resource Tagger is a focused tool for that specific gap: scan what exists, see what's missing, and bulk-apply or remove tags without writing a single line of code or template.

## What It Does

| Area | Data Source | What You Get |
|------|-------------|--------------|
| **Tag Inventory** | Azure Resource Graph | Every tag name/value on RGs and resources in scope |
| **Gap Analysis** | Resource Graph + required-tag list | Which RGs are missing which required tags |
| **Coverage Metrics** | Resource Graph | Tag coverage %, untagged RG count, unique tag keys |
| **Bulk Tagging** | ARM Tags API (`Update-AzTag -Operation Merge`) | Apply one or more tags to RGs or resources at scale |
| **Tag Removal** | ARM Tags API (`Update-AzTag -Operation Delete`) | Remove tags by key (with optional value filter) at scale |
| **Dry Run** | Local preview | Preview what would change before committing |
| **CSV Export** | Scan results | Full tag inventory exported for offline analysis |

## How It Works

Five tabs, each focused on a specific step in the workflow:

### Scope & Scan
Connect to Commercial or Gov tenants, pick a subscription (and optionally a specific resource group), then scan. Summary cards show you RG count, resource count, tag coverage percentage, untagged RGs, and unique tag keys at a glance. A tag key summary grid shows which tags exist and their coverage across resource groups.

### Resource Groups
Full list of resource groups with tag count, missing tags, and all current tags displayed. You can filter to show only RGs that are missing required tags. The required-tag list is configurable -- just type comma-separated tag names.

### Resources
All resources with their type, resource group, tag count, and current tags. Filter options: show all, untagged only, or missing a specific tag.

### Apply Tags
This is where the actual work happens. Define tags (name + value), queue them up, pick a target scope (all RGs, RGs missing a specific tag, all resources, or untagged resources only), and apply. An overwrite toggle controls whether existing tag values get replaced. Dry run mode is on by default -- it previews changes without touching anything. When you're ready, turn off dry run and confirm through the dialog. Results show per-resource success or failure.

### Remove Tags
Added in v1.1.0. Select a tag key from a dropdown populated from your scan data (or type one manually), optionally filter by value, choose scope (all RGs, all resources, or both), and remove. Same dry-run-first workflow as Apply Tags. Uses `Update-AzTag -Operation Delete`, which surgically removes just that key without touching other tags.

## Why Not Just Use the Portal (or IaC)?

If your resources are fully managed by Bicep or Terraform, add the tags to your templates and redeploy. That's the right answer when it's available. But for resources that were created outside of IaC -- or in environments where IaC adoption is still in progress -- you're left with manual options:

- **Azure Portal**: Open each resource, click Tags, type each key/value, save. Repeat. For every resource. It works, but it doesn't scale.
- **Azure CLI / PowerShell loops**: Write a script to query resources and pipe them through `az tag update` or `Update-AzTag`. Effective, but you're writing and testing throwaway code every time.
- **One-off Bicep/Terraform**: Write a template solely to patch tags onto existing resources. Works, but feels like using a sledgehammer on a thumbtack, and you're still figuring out which resources need which tags.

The Resource Tagger handles the discovery and application together. Scan first to see what's missing, then apply in bulk with a dry-run preview. No scripting, no templates, no clicking through 200 resource blades.

## Getting Started

### Prerequisites
- **Windows** with PowerShell 5.1+ (WPF requires Windows)
- **Az PowerShell modules**: `Az.Accounts`, `Az.Resources`, `Az.ResourceGraph`
- **Azure RBAC**: Reader for scanning, Tag Contributor for applying tags

Install modules if needed:
```powershell
Install-Module Az.Accounts, Az.Resources, Az.ResourceGraph -Scope CurrentUser
```

### Installation & Usage

1. **Clone the repository**:
   ```bash
   git clone https://github.com/z-larsen/AzureResourceTagger.git
   cd AzureResourceTagger
   ```

2. **Unblock downloaded files** (required on Windows for files from the internet):
   ```powershell
   Get-ChildItem -Path . -Recurse | Unblock-File
   ```

3. **Run the tool**:
   ```powershell
   .\Start-ResourceTagger.ps1
   # Or bypass execution policy without changing system settings:
   powershell -ExecutionPolicy Bypass -File .\Start-ResourceTagger.ps1
   ```

4. Click **Commercial Tenant** or **Gov Tenant** to authenticate

5. Select a subscription, optionally scope to a resource group, and click **Scan Tags**

6. Review the inventory across the Scope & Scan, Resource Groups, and Resources tabs

7. Switch to **Apply Tags** or **Remove Tags** to make changes (dry run is on by default)

## Typical Workflow

Here's the scenario this was built for:

1. Your organization decides to enforce `CostCenter`, `Environment`, and `Owner` tags via Azure Policy
2. You set the policies to **audit** mode first and realize hundreds of existing resources don't have these tags
3. Run the Resource Tagger, enter those three tags as your required-tag list, and scan
4. The gap analysis shows you exactly which resource groups are missing which tags
5. Queue up the tags with the correct values and bulk-apply them
6. Re-scan to confirm coverage
7. Now flip the policies to **deny** with confidence

## Architecture & Security

- **Read-only scanning** -- tag application requires explicit action and confirmation
- **No data storage** -- all analysis happens locally in memory
- **Microsoft Entra authentication** -- uses your existing Azure credentials via `Connect-AzAccount`
- **KQL injection protection** -- resource group filter input is sanitized before Resource Graph queries
- **Dry run by default** -- both Apply and Remove tabs default to preview mode
- **PowerShell 5.1 compatible** -- works on any Windows machine without upgrading PowerShell

## Changelog

### v1.1.0 (2026-04-23)
- Added **Remove Tags** tab with dropdown, value filter, scope selection, dry run, and results grid
- Tag removal uses `Update-AzTag -Operation Delete` (surgical key removal, preserves other tags)

### v1.0.0 (2026-04-23)
- Initial release with scan, gap analysis, bulk apply, dry run, CSV export
- Commercial and Gov tenant support
- PowerShell 5.1 compatibility

## Related

If you're looking at tagging as part of a broader FinOps initiative, the [Azure FinOps Multitool](https://github.com/z-larsen/Azure-FinOps-Multitool) covers cost analysis, optimization opportunities, policy management, and more. The Resource Tagger is a focused companion for the tagging piece specifically.

[Open source on GitHub](https://github.com/z-larsen/AzureResourceTagger) -- MIT licensed, contributions welcome.

---
