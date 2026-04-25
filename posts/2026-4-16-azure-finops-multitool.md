---
layout: post.njk
title: "Azure FinOps Multitool: A Fast Track to Cost Optimization"
date: 2026-04-16
tags: [posts, azure, finops, cost-management, powershell, tools]
category: Tools
tool: true
excerpt: "Discover the Azure FinOps Multitool - a PowerShell application that provides a comprehensive view of your Azure costs, tagging health, and optimization opportunities. Deploy tags, policies, and budgets quickly, and export data to HTML, CSV, or Power BI templates."
---

# Azure FinOps Multitool: A Fast Track to Cost Optimization

![Azure FinOps Multitool](https://img.shields.io/badge/PowerShell-7.0%2B-blue?logo=powershell&logoColor=white) ![Azure Az Modules](https://img.shields.io/badge/Azure-Az%20Modules-0078D4?logo=microsoftazure&logoColor=white) ![License MIT](https://img.shields.io/badge/License-MIT-green) ![Version 2.0.1](https://img.shields.io/badge/Version-2.0.1-brightgreen)

I built this tool out of a recurring pattern I kept seeing while working with customers across industries; organizations knew they had Azure cost challenges but had no quick way to get a clear picture of where they stood. Every engagement started with the same manual effort: piecing together cost data, chasing down tagging gaps, and trying to size optimization opportunities across subscriptions. The Azure FinOps Multitool is my answer to that problem, built to solve the "cold start", helping teams quickly understand their current FinOps posture and identify immediate optimization opportunities without the usual setup overhead.

## What is the Azure FinOps Multitool?

The Azure FinOps Multitool is a PowerShell WPF application that scans your entire Azure tenant and provides a **single-pane-of-glass view** of your costs, tagging health, optimization opportunities, and FinOps maturity. It's organized around the three core FinOps pillars: **Understand**, **Quantify**, and **Optimize**.

Unlike complex FinOps implementations that require infrastructure deployment and dashboard setup, this tool gives you immediate insights with just one script execution. It's designed as the perfect on-ramp for organizations beginning their FinOps journey.

## Key Features and Capabilities

### Comprehensive Tenant Scanning
The tool provides deep visibility across your entire Azure estate:

| Area | Data Source | What You Get |
|------|-------------|--------------|
| **Hierarchy** | Management Groups API | Full MG tree with subscriptions and inline costs |
| **Costs** | Cost Management API | Month-to-date actual costs + forecasts per subscription |
| **Cost Trend** | Cost Management API (6 months) | Bar chart showing monthly spend over the last 6 months |
| **Cost Anomalies** | Trend analysis | Subscriptions with 25%+ month-over-month cost changes |
| **Resource Costs** | Cost Management API (per sub) | Per-resource spend with type, RG, forecast, % of total |
| **Contract** | Billing Accounts API + ARM quotaId | EA, MCA, PAYG, or CSP detection with quotaId fallback |
| **Tag Inventory** | Azure Resource Graph | Every tag name/value in use, untagged resource count |
| **Cost by Tag** | Cost Management API | Spend broken down by CAF allocation tags with auto-backfill |
| **Tag Deploy** | ARM Tags API (PATCH merge/delete) | Inline Add/Remove buttons per tag; deploy or remove tags from subscriptions or RGs |
| **Tag Recommendations** | CAF baseline | Gap analysis against 7 CAF allocation tags with deployment location |
| **AHB** | Azure Resource Graph | Windows VMs, SQL VMs, and SQL DBs missing Hybrid Benefit |
| **Commitments** | Reservation Summaries + Benefit Utilization API | RI and Savings Plan utilization %, underutilized commitments |
| **Orphaned Resources** | Azure Resource Graph (6 KQL queries) | Orphaned disks, unattached IPs/NICs, deallocated VMs, empty ASPs, old snapshots, with MTD cost and estimated annual waste |
| **RI / SP Recommendations** | Advisor + Reservation Recs API | RI and SP recs with Actual (MTD), Forecast, and savings |
| **Advisor** | Azure Advisor (Cost category) | Rightsize, shutdown, delete, modernize recs with cost data |
| **Budget Status** | Consumption Budgets API | Budget vs actual per subscription, % used, risk level; deploy budgets with up to 4 custom thresholds |
| **Savings Realized** | Cost Management (ActualCost + AmortizedCost) | Monthly savings from existing RIs, Savings Plans, and AHB |
| **Policy Inventory** | ARM Policy Assignment API + Resource Graph | All effective policy and initiative assignments including MG-inherited, with compliance state |
| **Policy Recommendations** | CAF-aligned built-in policies | Missing cost, tagging, security, and monitoring policies with deploy-from-GUI capability |
| **Policy Deploy / Unassign** | ARM Policy Assignment API | Inline Deploy/Unassign buttons per policy in the recommendations grid |
| **Policy Remediation** | Policy Insights API | Trigger remediation tasks for DeployIfNotExists/Modify policy assignments |
| **Budget Policy** | ARM Policy Assignment API | Deploy budget enforcement policies at subscription or MG scope |
| **Billing** | Billing Accounts/Profiles API | Billing accounts, profiles, invoice sections, EA departments |
| **Cost Allocation** | Cost Management Allocation API | Existing cost allocation rules with source/target counts |
| **Idle VMs** | Azure Monitor Metrics (14-day) | Running VMs with <5% CPU and minimal network activity — optimization candidates Advisor may miss |
| **Storage Tiers** | Azure Monitor Metrics (30-day) | Hot-tier storage accounts with low transaction activity — candidates for Cool or Archive migration |
| **Scorecard** | All of the above | Per-subscription health: cost, tags, optimizations, orphan savings, budget, trend |
| **FinOps Guidance** | All of the above | FinOps Maturity Score (0–100) with weighted category breakdown and actionable advice |
| **Resources** | Curated links | FinOps Framework, Cost Management docs, Azure Workbooks, orphaned resources workbook |
| **Data Export** | Local File System | HTML reports, CSV exports, and Power BI template files (.pbit) with pre-built 4-page dashboard |

### Tagging Health & Management
- **Tag Inventory**: Complete view of all tags in use across your tenant
- **Untagged Resources**: Identify resources missing critical tags
- **Cost by Tag**: Spend analysis broken down by CAF allocation tags with auto-backfill and last-month fallback
- **Tag Deployment**: Inline tag management with add/remove capabilities for subscriptions, resource groups, and individual resources
- **Mass Tag Removal**: Remove a tag from a subscription and all its resource groups in a single click; scope extended to individual resources via Resource Graph
- **Tag Removal Value Filter**: Filters removal candidates by actual tag value to prevent accidental deletions

### Management & Deployment
- **Policy Management**: Deploy and manage Azure policies across subscriptions; unassign individual policies or mass-unassign all assignments of the same policy in one action
- **Policy Remediation**: Trigger remediation tasks for DeployIfNotExists and Modify policy assignments directly from the GUI
- **Budget Deployment**: Create and configure budgets with up to 4 custom thresholds (Actual and Forecasted), with Action Group integration for alert routing
- **Bulk Operations**: Deploy tags, policies, and budgets across multiple subscriptions simultaneously

### Cost Optimization Opportunities
- **Azure Hybrid Benefit (AHB)**: Identify Windows VMs, SQL VMs, and SQL DBs missing licensing optimizations
- **Reservations & Savings Plans**: Utilization analysis and underutilized commitments
- **Orphaned Resources**: Find and quantify waste from unused disks, IPs, NICs, VMs, and snapshots
- **Idle VM Detection**: 14-day Azure Monitor metrics flag running VMs with <5% CPU that Advisor missed
- **Storage Tier Optimization**: Hot-tier storage accounts with low activity flagged for Cool/Archive migration (50–90% savings)
- **Rightsizing Recommendations**: Advisor-driven suggestions for better resource sizing
- **Budget Monitoring**: Budget vs. actual analysis with custom threshold alerts

### FinOps Maturity Scorecard
Get a per-subscription health assessment covering:
- Cost management effectiveness
- Tagging compliance
- Optimization opportunities
- Orphaned resource cleanup potential
- Budget adherence
- Spend trend analysis

### Data Export & Visualization
- **HTML Reports**: Export comprehensive reports for sharing and documentation
- **CSV Export**: Export data for analysis in Excel or other tools
- **Power BI Support**: Choose between:
  - **16 Structured CSVs**: Pre-formatted data files optimized for Power BI analysis covering costs, tags, policies, optimization opportunities, and more
  - **Power BI Templates (.pbit)**: Ready-to-use Power BI template files with pre-built visualizations and reports for immediate analysis
  - **Unified Export Dialog**: Single interface for all export formats with configurable options

## Why Use It?

No infrastructure to set up, no dashboards to build first. Run it once from any Windows machine with PowerShell and you'll have a real picture of your Azure environment in minutes, costs, tagging gaps, orphaned resources, and optimization opportunities all in one place.

If you're new to FinOps, it's a practical starting point before investing in more complex tooling. It shows you what to look at and gives you something concrete to act on. If you're already doing FinOps work, it's useful for quick cross-subscription spot checks or sizing up opportunities before a customer engagement.

It doesn't replace Azure Cost Management, FinOps Hubs, or Power BI, but it gets you answers faster when you need them.

## Getting Started

### Prerequisites
- **Windows** with PowerShell 5.1+ (WPF requires Windows — macOS and Linux are not supported)
- **Az PowerShell modules**: `Az.Accounts`, `Az.Resources`, `Az.ResourceGraph`, `Az.CostManagement`, `Az.Advisor`, `Az.Billing`
- **Azure RBAC**: Reader + Cost Management Reader on target scope (minimum for scanning)

Install modules if needed:
```powershell
Install-Module Az.Accounts, Az.Resources, Az.ResourceGraph, Az.CostManagement, Az.Advisor, Az.Billing -Scope CurrentUser
```

### Installation & Usage

1. **Clone the repository**:
   ```bash
   git clone https://github.com/z-larsen/Azure-FinOps-Multitool.git
   cd Azure-FinOps-Multitool
   ```

2. **Unblock downloaded files** (required on Windows for files from the internet):
   ```powershell
   Get-ChildItem -Path .\AzureFinOpsMultitool -Recurse | Unblock-File
   ```

3. **Run the tool**:
   ```powershell
   .\Start-FinOpsMultitool.ps1
   # Or bypass execution policy without changing system settings:
   powershell -ExecutionPolicy Bypass -File .\Start-FinOpsMultitool.ps1
   ```

4. Click **Commercial Tenant** (or **Gov Tenant** for Azure Government) — a browser login opens, then a tenant picker dialog lists all accessible tenants

4. If your tenant has more than 5 subscriptions, a **subscription selector dialog** appears — choose which subscriptions to scan or select all, then click OK

5. Click **Scan** — the tool runs through 23 data-collection stages with a progress bar

6. Browse the tabs when the scan completes:
   - **Overview** — cost summary cards, savings realized, budget status, subscription cost table with orphan savings, top resources by spend, scorecard
   - **Cost Analysis** — 6-month cost trend bar chart, cost anomaly flags (25%+ MoM change), spend by tag value
   - **Tags** — tag inventory with coverage %, CAF compliance check, inline Add/Remove buttons to deploy or remove tags on subscriptions/RGs/individual resources
   - **Policy** — effective policy inventory with compliance %, CAF-recommended policies, inline Deploy/Unassign buttons, remediation tasks for DINE/Modify policies
   - **Optimization** — RI/SP utilization, orphaned resources with cost and estimated annual waste, idle VM detection (14-day metrics), storage tier advice, AHB gaps, RI/SP recs, Advisor recs
   - **Billing** — billing accounts, billing profiles (MCA), invoice sections, EA departments, cost allocation rules
   - **FinOps Guidance** — FinOps Maturity Score (0–100) with pillar-by-pillar assessment
   - **Resources** — curated links to FinOps Framework, Cost Management, Azure Workbooks, and more

7. Click **Export Scan Results** to save as HTML, CSV, or Power BI template (.pbit)

## Latest Enhancements

### Tag Management (v1.9.4 – v1.9.18)
- **Mass tag removal**: Remove a tag from a subscription and all its resource groups simultaneously with one click (v1.9.4)
- **Individual resource scope**: Mass tag removal extended to individual resources discovered via Resource Graph (v1.9.8)
- **Tag removal value filter**: Removal operations now filter by actual tag value, not just tag name, preventing accidental removals (v1.9.13)
- **Tag name fix**: Removal now uses the actual tag name on the resource rather than the CAF recommended name (v1.9.18)
- **Resource Graph pagination**: Large tenants no longer hit truncation limits during tag scans (v1.9.13)

### Policy Management (v1.9.2 – v1.9.5)
- **Unassign from inventory**: Policies can be unassigned directly from the Policy Inventory grid without navigating elsewhere (v1.9.2)
- **Mass policy unassign**: Remove all assignments of the same policy across scopes in a single action (v1.9.5)

### Budget Improvements (v1.9.3 – v1.9.12)
- **Action Group selector**: Budget alerts now support selecting an Action Group at deployment time for proper alert routing (v1.9.12)
- **Subscription name display**: Budget deploy scope picker shows actual subscription names instead of IDs (v1.9.3)

### Export & Reporting (v1.9.14 – v1.9.16)
- **Power BI CSV export**: 16 structured CSVs pre-formatted for Power BI covering costs, tags, policies, and optimization opportunities (v1.9.14)
- **Power BI templates (.pbit)**: Ready-to-use template files with pre-built visualizations (v1.9.16)
- **Unified export dialog**: All export formats — HTML, CSV, Power BI CSVs, .pbit — available from a single interface (v1.9.16)

### Security & Stability (v1.9.6 – v1.9.15)
- **KQL injection protection**: All Resource Graph queries escape user-controlled input (v1.9.15)
- **Token redaction**: Access tokens are redacted in diagnostics and log output (v1.9.15)
- **Scope validation**: Input validation prevents unauthorized or malformed scope requests (v1.9.15)
- **Background MG hierarchy**: Management Group scan runs in a background runspace with a 60s timeout to prevent UI freezes on large tenants (v1.9.6)

### Visual & UI Refinements (v1.9.7 – v1.9.17)
- **Polished header bar**: Gradient header with icon badge and version label (v1.9.7)
- **Custom cloud icon**: Application-level cloud icon added (v1.9.17)
- **Responsive DataGrid columns**: Columns scale with window width; oversized row height fixed (v1.9.9 – v1.9.10)

### v2.0.0 — Major Release
The v2.0.0 bump was driven by the Power BI template export, which shifts the tool from a one-time scanner into a reusable reporting platform.

- **Power BI template (.pbit)**: Generates a `.pbit` alongside exported CSVs with a pre-built 4-page report layout (Cost Overview, Subscriptions, Optimization, Governance) — open directly in Power BI Desktop with all tables and relationships pre-configured via a `CsvFolderPath` parameter
- **Idle & underutilized VM detection**: 14-day Azure Monitor metrics (CPU + network) flag running VMs that Advisor missed, adding a second opinion beyond what Advisor surfaces
- **Storage tier optimization**: Hot-tier storage accounts with low transaction activity flagged for Cool/Archive migration (30-day metrics)
- **Resources tab**: Curated links organized into 5 categories — FinOps Framework, Cost Management, Rate Optimization, Governance, and Workbooks & Tools
- **Tag Inventory Remove button**: Delete any tag directly from the Tag Inventory grid
- **Session action log in HTML export**: Exported reports include an "Actions Taken" section showing all tags deployed/removed and policies assigned/unassigned during the session
- **Tag removal case handling**: Resource Graph queries use `tolower()` for key lookup, and the tool reads actual tag casing via GET before DELETE to prevent silent failures
- **Tag removal includes subscription/RG scope**: KQL queries union `resourcecontainers` so tags on subscriptions and resource groups are found and removed correctly

### v2.0.1 — Subscription Selector + Billing Fixes
- **Subscription selector**: WPF popup after tenant login lets you choose which subscriptions to scan; auto-skips for tenants with 5 or fewer subscriptions; Select All / Select None buttons; cancelling defaults to scanning everything
- **Cross-tenant billing fix**: Queries all scanned subscriptions for billing account IDs (not just the first 5) and normalizes account IDs by extracting the name segment
- **MCA commitment utilization**: Resolves billing profiles for MCA agreements so RI and Savings Plan queries use the correct profile scope
- **Granular progress indicators**: 7 scan modules now update status at ~10% intervals instead of every 25th subscription — noticeably smoother feedback on large tenants
- **Idle VM and Savings Realized progress**: Both modules now report per-item progress during metric queries (previously had no updates on large tenants)

## Use Cases & Scenarios

### Initial FinOps Assessment
Perfect for new FinOps practitioners or consultants joining an engagement. Get a complete picture of the current state in one comprehensive scan.

### Quarterly Cost Reviews
Use the trend analysis and anomaly detection to identify cost changes and investigate root causes.

### Migration Planning
Before migrating workloads to Azure, understand your current cost baseline and optimization opportunities.

### Budget Planning
Leverage the budget monitoring and forecasting features to set realistic budgets and track adherence.

### Optimization Validation
After implementing cost-saving measures, use the tool to quantify the impact and identify next opportunities.

## Architecture & Security

### Security First
- **Read-only operations** - never modifies your Azure resources
- **No data storage** - all analysis happens locally
- **Microsoft Entra authentication** - uses your existing Azure credentials
- **No external dependencies** - works entirely within your Azure tenant
- **Advanced Security Hardening**:
  - KQL injection escape protection for Resource Graph queries
  - Token redaction in logs and diagnostics
  - Scope validation to prevent unauthorized access

### Technical Architecture
- **PowerShell 5.1+** with WPF GUI (Windows only)
- **Azure Resource Graph** for resource queries
- **Cost Management APIs** for spend data
- **Azure Advisor** for optimization recommendations
- **Management Group APIs** for hierarchy analysis

## Community & Support

The Azure FinOps Multitool is an open-source project released under the MIT License. It's actively maintained and welcomes contributions from the FinOps community.

- **Documentation**: Comprehensive README with setup instructions
- **Issue Tracking**: GitHub Issues for bug reports and feature requests
- **Feature Requests**: Community-driven roadmap
- **Contributions**: Pull requests welcome

## Conclusion

FinOps doesn't have to start with a months-long implementation. The Multitool gives you a clear starting point, run it, see what it finds, and you'll know where to focus.

[Open source on GitHub](https://github.com/z-larsen/Azure-FinOps-Multitool) if you want to give it a try.

---

*Disclaimer: This tool is provided as-is under the MIT License. Always review and test in non-production environments first.*