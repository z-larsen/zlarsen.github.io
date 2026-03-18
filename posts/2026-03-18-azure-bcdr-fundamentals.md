---
layout: post.njk
title: "Azure BCDR Fundamentals"
date: 2026-03-18
tags: [posts, Azure, BCDR, Backup, Disaster Recovery, Fundamentals]
excerpt: "Region pairs, backup concepts, Azure Site Recovery patterns, RTO/RPO definitions, and minimum resiliency expectations for production workloads."
hidden: true
---

This guide covers backup, disaster recovery, and business continuity in Azure. If you haven't already, start with the [Azure Platform Fundamentals](/posts/2026-03-18-new-to-azure-start-here/) overview first.

---

## Why BCDR Matters

Business Continuity and Disaster Recovery is not just an IT concern — it's a business requirement.

Every organization must answer:
- How long can we be down before it severely impacts the business? (**RTO**)
- How much data loss is acceptable? (**RPO**)
- What happens if an Azure region goes offline?

> Design for failure. Everything fails eventually.

In Azure:
- **Backup** protects against data loss (accidental deletion, corruption, ransomware)
- **Site Recovery** protects against outages (regional disasters, datacenter failures)
- **Resilience** is built in layers: Resource → Availability Zone → Region → Region Pair

---

## Region Pairs and Replication

### What Are Region Pairs?

Two Azure regions within the same geography paired for disaster recovery.

**Examples:**
- East US ↔ West US
- North Europe (Ireland) ↔ West Europe (Netherlands)
- Southeast Asia (Singapore) ↔ East Asia (Hong Kong)

**Why pairs exist:**
1. **Physical separation** — At least 300 miles apart
2. **Sequential updates** — Azure updates one region at a time, not both
3. **Data residency** — Pairs stay within the same geography for compliance
4. **Recovery priority** — In massive outages, one region in each pair gets priority

> **Important:** Many newer Azure regions are not paired. They provide redundancy through multiple Availability Zones within the region. Always verify your target region's pairing status before designing a DR strategy.

> Reference: [Cross-Region Replication](https://learn.microsoft.com/azure/reliability/cross-region-replication-azure)

### Availability Zones vs Region Pairs

| Concept | Availability Zones | Region Pairs |
|---------|-------------------|-------------|
| Scope | Within a region | Between regions |
| Distance | Connected by high-speed fiber (~2ms) | 300+ miles apart |
| Purpose | Datacenter-level failures | Regional disasters |
| Failover | Automatic (seconds–minutes) | Manual or semi-automated (minutes–hours) |
| Cost | Minimal increase | Data transfer costs |

**Best practice:** Use **both** — deploy across zones in the primary region, and replicate to a paired region for disaster recovery.

---

## Backup Fundamentals

Backups protect against accidental deletion, data corruption, ransomware, hardware failures, and insider threats.

### Azure Backup Service

A fully managed backup service (PaaS):
- No backup infrastructure to deploy
- Automatic backups to **Recovery Services Vault**
- Retention: 1 day to 99 years
- Supports: VMs, SQL databases, file shares, on-premises servers

Key benefits:
- No backup tape management
- Application-consistent backups (not just file copies)
- Encrypted at rest and in transit
- **Immutable backups** for ransomware protection

> Reference: [Azure Backup Overview](https://learn.microsoft.com/azure/backup/backup-overview)

### Backup Types

| Type | What It Backs Up | Speed | Storage | Restore Speed |
|------|-----------------|-------|---------|--------------|
| **Full** | Complete copy of all data | Slowest | Largest | Fastest |
| **Incremental** | Only data changed since last backup | Fastest | Smallest | Slower (needs chain) |
| **Differential** | Only data changed since last full | Medium | Medium | Medium (needs full + last diff) |

**Common pattern:** Full backup weekly + incremental daily. Retain daily for 30 days, weekly for 12 weeks, monthly for 12 months.

### What Can Be Backed Up?

| Resource | Backup Method |
|----------|--------------|
| Azure VMs | Azure Backup |
| Azure SQL Database | Built-in automated backups + Azure Backup |
| Azure Files | Azure Backup for Files |
| Azure Blobs | Soft delete + versioning |
| On-premises files | MARS agent → Azure Backup |
| On-premises VMs (Hyper-V/VMware) | Azure Site Recovery |

### Backup Best Practices

**3-2-1 Rule:**
- **3** copies of data (original + 2 backups)
- **2** different media types (e.g., disk + cloud)
- **1** copy offsite (different location)

**Test restores:** Schedule quarterly restore tests. Measure actual restore time and verify data integrity. *You don't have a backup until you've successfully restored from it.*

**Immutable backups:** Enable immutability to prevent deletion (ransomware protection). Requires Multi-User Authorization (MUA) to disable. Backups cannot be deleted until the retention period expires.

> Reference: [Immutable Vault](https://learn.microsoft.com/azure/backup/backup-azure-immutable-vault)

---

## Site Recovery Patterns

While backups protect data, Site Recovery protects applications (infrastructure + data).

### Azure Site Recovery (ASR)

- Disaster recovery service for VMs and physical servers
- Continuous replication to a secondary location
- Orchestrated failover (one-click DR activation)
- Supports: Azure-to-Azure, on-premises-to-Azure

> Reference: [Site Recovery Overview](https://learn.microsoft.com/azure/site-recovery/site-recovery-overview)

### Disaster Recovery Patterns

| Pattern | Secondary State | Cost | RTO | RPO | Failover |
|---------|----------------|------|-----|-----|----------|
| **Cold Standby** | Not running | $ | Hours | Hours | Manual |
| **Warm Standby** | Running (scaled-down) | $$ | Minutes | Minutes | Semi-automated |
| **Hot Standby (Active-Active)** | Running (full) | $$$ | Seconds | Near-zero | Automatic |

**Cold Standby:** Only storage replication, no secondary compute running. Cheapest but slowest to recover.

**Warm Standby:** Scaled-down secondary environment with real-time replication. Good balance of cost and recovery speed.

**Hot Standby:** Full production environment in both regions, actively serving traffic. Load balanced with Traffic Manager or Front Door. Most expensive but fastest recovery.

### ASR Workflow

1. **Enable replication** — Select source VMs, choose target region, configure replication policy
2. **Continuous replication** — ASR replicates disk changes, application-consistent snapshots taken periodically (lag typically < 5 minutes)
3. **Failover** — Initiate failover, VMs start in target region, update DNS/Traffic Manager
4. **Failback** — Once primary is restored, reverse replication and switch back

> Reference: [Azure-to-Azure Replication](https://learn.microsoft.com/azure/site-recovery/azure-to-azure-tutorial-enable-replication)

---

## RTO and RPO Definitions

RTO and RPO are **business requirements** that drive technical design.

### RTO (Recovery Time Objective)

**How long can the business tolerate being down?**

Measured from disaster occurrence to service restoration.

**What affects RTO:** Failover automation, secondary environment readiness, DNS propagation, data restoration time, validation steps.

**Example calculation:**
```
Disaster occurs:       10:00 AM
+ Detection:           10 minutes → 10:10 AM
+ Decision to failover: 20 minutes → 10:30 AM
+ Failover execution:  30 minutes → 11:00 AM
+ DNS propagation:     15 minutes → 11:15 AM
+ Validation:          15 minutes → 11:30 AM
Total RTO:             1.5 hours
```

### RPO (Recovery Point Objective)

**How much data loss can the business tolerate?**

Measured as the time between the last good backup and the disaster.

**Example:** Last backup at 2:00 AM, disaster at 2:37 AM → 37 minutes of data lost. If the business requires RPO < 30 minutes, daily backups are insufficient — you need continuous replication.

### RTO/RPO by Business Impact

| Business Impact | RTO | RPO | DR Strategy | Cost |
|----------------|-----|-----|-------------|------|
| Low | Days | 24 hours | Backups only | $ |
| Medium | 4–24 hours | 1–4 hours | Cold/warm standby | $$ |
| High | 1–4 hours | 15–60 min | Warm standby + replication | $$$ |
| Mission-Critical | < 1 hour | < 15 min | Active-active multi-region | $$$$ |

> Lower RTO/RPO = higher cost. The business must weigh recovery requirements against budget.

---

## Minimum Resiliency Expectations

Not every workload needs five-nines availability, but **every production workload** needs some level of resilience.

### Resiliency Tiers

| Tier | Downtime OK | Data Loss OK | Protection | Example |
|------|------------|-------------|-----------|---------|
| **Dev/Test** | Hours–days | Complete loss OK | None required | Developer sandbox |
| **Non-Critical Production** | 4–24 hours | 24 hours | Backup only (GRS) | Internal wiki |
| **Standard Production** | 1–4 hours | 1–4 hours | Backup + Availability Zones + warm standby | Line-of-business apps |
| **Business-Critical** | < 1 hour | < 15 minutes | Multi-zone + multi-region + continuous replication | E-commerce, financial |
| **Mission-Critical** | < 5 minutes | Near-zero | Active-active multi-region + synchronous replication | Banking, healthcare |

### Minimum Requirements by Tier

| Tier | Availability Zones | Regional DR | Backup Frequency | Retention | RTO | RPO |
|------|-------------------|-------------|-----------------|-----------|-----|-----|
| Dev/Test | Not required | No | Optional | Optional | N/A | N/A |
| Non-Critical | Not required | No | Daily | 30 days | 24 hrs | 24 hrs |
| Standard | Recommended | Warm standby | Hourly | 90 days | 4 hrs | 1 hr |
| Critical | Required | Warm standby | Continuous | 12 months | 1 hr | 15 min |
| Mission | Required | Active-active | Continuous | 7 years | 5 min | Near-zero |

### Governance Policies

Common policy: "All production workloads must meet non-critical tier as a minimum."

**Enforce with:**
- Azure Policy: Require backup enabled on VMs tagged `Environment: Prod`
- Azure Policy: Require GRS on storage accounts tagged `Criticality: High`
- Monthly audit: Review backups and successful restore tests
- Quarterly: Review RTO/RPO against actual incidents

---

## Key Takeaways

1. **Design for failure** — everything fails eventually
2. Use **Availability Zones** for datacenter resilience, **Region Pairs** for regional DR
3. Follow the **3-2-1 backup rule** and test restores quarterly
4. Choose DR patterns (cold/warm/hot) based on **RTO/RPO** requirements and budget
5. Enable **immutable backups** for ransomware protection
6. Define **minimum resiliency tiers** and enforce with Azure Policy

---

## Additional Resources

- [Azure Backup Overview](https://learn.microsoft.com/azure/backup/backup-overview)
- [Site Recovery Overview](https://learn.microsoft.com/azure/site-recovery/site-recovery-overview)
- [Cross-Region Replication](https://learn.microsoft.com/azure/reliability/cross-region-replication-azure)
- [Availability Zones](https://learn.microsoft.com/azure/reliability/availability-zones-overview)
- [Disaster Recovery Overview](https://learn.microsoft.com/azure/reliability/disaster-recovery-overview)
- [Resiliency Design Requirements](https://learn.microsoft.com/azure/architecture/framework/resiliency/design-requirements)

---

*This is part of the [Azure Fundamentals Series](/posts/2026-03-18-new-to-azure-start-here/). Return to the main guide to explore other topics.*
