---
layout: post.njk
title: "Azure Verified Modules: Microsoft's Official IaC Module Library"
date: 2026-05-01
tags: [posts, azure, bicep, terraform, iac, infrastructure-as-code, avm]
category: Tools
excerpt: "Azure Verified Modules (AVM) is Microsoft's answer to the fragmented IaC module landscape. Learn what AVM is, why it matters, how the module types work, and how to start using it in your Bicep or Terraform deployments today."
---

# Azure Verified Modules: Microsoft's Official IaC Module Library

If you've written Infrastructure-as-Code for Azure over the past few years, you've probably come across the CARML library, the Public Bicep Registry, the Terraform Verified Modules initiative, various Landing Zone Accelerator repos, and a handful of internal Microsoft GitHub repos all doing roughly the same thing: publishing reusable IaC modules for Azure resources. The problem was none of them had consistent standards, consistent support, or consistent ownership.

Azure Verified Modules (AVM) is the initiative that consolidates all of that into a single, Microsoft-backed standard for what a good IaC module looks like.

## What Is AVM?

[Azure Verified Modules](https://azure.github.io/Azure-Verified-Modules/) is an official Microsoft initiative to define, build, test, and maintain a library of infrastructure-as-code modules for Azure in both Bicep and Terraform. The modules are published to their respective public registries:

- **Bicep**: published to the [Public Bicep Registry](https://github.com/Azure/bicep-registry-modules) under the `avm/` namespace
- **Terraform**: published to the [HashiCorp Terraform Registry](https://registry.terraform.io/) under the `Azure/avm-*` naming convention

The "verified" part means Microsoft owns the support statement. You can raise a GitHub issue against the module repo, log a support ticket, and it routes to the AVM team and module owners. That's different from community modules where the maintainer might not respond, or where an individual's priorities change.

AVM is a direct evolution of CARML (Common Azure Resource Module Library) and TFVM (Terraform Verified Modules). All existing CARML modules were migrated to AVM as its Bicep module foundation. If you were using CARML, you are already using what became AVM.

## The Three Module Types

AVM publishes three kinds of modules:

| Type | What It Is | Example |
|------|-----------|---------|
| **Resource Modules** | A single Azure resource type with all its child resources and extensions handled. Flexible, multi-purpose, covers the full surface of that resource. | `avm/res/key-vault/vault`, `avm/res/network/virtual-network` |
| **Pattern Modules** | A reusable architectural pattern composed of multiple resources. Encodes a known good design for a workload or scenario. | Hub-spoke networking, AKS baseline, secure storage account with private endpoint |
| **Utility Modules** | Shared helper types and functions used by other AVM modules. Not deployed directly. | `avm/utl/types/avm-common-types` for shared user-defined types |

Resource modules are where most of the library lives and where you should start. Pattern modules are being built on top of resource modules and are more opinionated, composing multiple resources into a coherent architecture.

## What "Verified" Actually Means

The word "verified" carries a specific definition in AVM. A module earns it by meeting these requirements per the [AVM introduction docs](https://azure.github.io/Azure-Verified-Modules/overview/introduction/):

- **Microsoft supported**: module owners are Microsoft FTEs, backed by the AVM core team and Microsoft CSS
- **Specification compliant**: modules must pass static validation against a published set of specifications covering naming, inputs/outputs, testing, telemetry, and documentation
- **Deployment tested**: every module must include end-to-end deployment tests that prove the examples actually deploy
- **WAF-aligned defaults**: default parameter values follow high-priority recommendations from the [Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/), the Reliability Hub, and the Azure Proactive Resiliency Library (APRL)
- **Maintained over time**: module owners are responsible for keeping modules current with API versions, new features, and product roadmap changes
- **Semantic versioning**: breaking changes require a major version bump; consumers can pin versions and assess upgrade impact

The WAF-alignment is worth understanding in more depth. AVM modules default to security and reliability best practices where they can be expressed as a simple parameter value. For example, a Key Vault module defaults to enabling purge protection and using RBAC for authorization instead of access policies. But for configurations that require additional resources (like private endpoints, which need a VNet, subnet, and DNS zone), AVM does not force those onto you; it just makes the module flexible enough to support them when you bring your own infrastructure.

## The Problem AVM Solves

Before AVM, if you went looking for a reusable Bicep module for an Azure Storage Account, you might find five different implementations across different repos. Some had good testing. Some had role assignments. Some didn't. None had a clear support path. And if you were on a customer engagement and something broke in your IaC, you were on your own to debug a community module.

AVM solves three specific problems:

**Consistency across the library.** Every AVM module follows the same specifications for parameter naming, output patterns, role assignment support, diagnostic settings interfaces, and private endpoint support. Once you learn the pattern for one module, it transfers to the next. The interfaces for things like `roleAssignments`, `diagnosticSettings`, `lock`, and `privateEndpoints` are standardized through shared utility types.

**Security and reliability by default.** You don't have to remember to set TLS 1.2 minimum, enable soft-delete on Key Vault, or turn on geo-redundancy for storage. Modules encode those defaults for you. You can override them, but you have to explicitly choose a less secure or less reliable configuration rather than accidentally omitting it.

**Long-term support.** For enterprise customers and large engagements, the support question matters. AVM gives you a module that Microsoft will maintain, that has a published support path, and that follows semantic versioning so your pipelines don't break unexpectedly.

## Using AVM with Bicep

Bicep modules are referenced directly from the public registry using the `br/public:` prefix. You don't clone anything; the Bicep CLI resolves the module at deploy time from Microsoft's container registry (`mcr.microsoft.com`).

Here's a minimal example deploying an Azure Key Vault with a secret and a role assignment, sourced from the [AVM Bicep quickstart](https://azure.github.io/Azure-Verified-Modules/usage/quickstart/bicep/):

```bicep
targetScope = 'resourceGroup'

import { roleAssignmentType } from 'br/public:avm/utl/types/avm-common-types:0.4.0'

param keyVaultName string
param enablePurgeProtection bool = true

@secure()
param patToken string = newGuid()

param roleAssignments roleAssignmentType[]?

module myKeyVault 'br/public:avm/res/key-vault/vault:0.11.0' = {
  name: 'key-vault-deployment'
  params: {
    name: keyVaultName
    enablePurgeProtection: enablePurgeProtection
    secrets: [
      {
        name: 'PAT'
        value: patToken
      }
    ]
    roleAssignments: roleAssignments
  }
}
```

And the parameter file:

```bicep
using 'main.bicep'

param keyVaultName = 'my-keyvault-prod'
param enablePurgeProtection = false   // disable for dev/test

param roleAssignments = [
  {
    principalId: '<your-user-object-id>'
    roleDefinitionIdOrName: 'Key Vault Secrets Officer'
  }
]
```

A few things worth noting here. First, notice `roleDefinitionIdOrName: 'Key Vault Secrets Officer'` rather than a GUID. AVM modules map built-in role names to their GUIDs internally, which makes templates readable and avoids GUID lookup errors. Second, the `import` statement pulls in the `roleAssignmentType` user-defined type from the AVM common types utility module, which gives you IntelliSense and type validation in VS Code. Third, most of the WAF-aligned defaults (RBAC authorization, soft-delete enabled, public network restrictions) are applied automatically without any explicit parameters.

To deploy:

```powershell
Connect-AzAccount
Set-AzContext -SubscriptionId '<subscriptionId>'
New-AzResourceGroup -Name 'avm-rg' -Location 'eastus'
New-AzResourceGroupDeployment -ResourceGroupName 'avm-rg' -TemplateFile 'main.bicep' -TemplateParameterFile 'dev.bicepparam'
```

To find what modules are available, the easiest path is the [Bicep VS Code extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-bicep). When you type `module myModule 'br/public:` in a `.bicep` file, IntelliSense lists all published AVM modules directly. You can also browse the [AVM Bicep module index](https://azure.github.io/Azure-Verified-Modules/indexes/bicep/bicep-resource-modules/) and click through to the module's folder in the BRM repository where the README and usage examples live.

One recommended addition: add a `bicepconfig.json` to your project to get warnings when you're not on the latest module version:

```json
{
  "analyzers": {
    "core": {
      "rules": {
        "use-recent-module-versions": {
          "level": "warning"
        }
      }
    }
  }
}
```

## Using AVM with Terraform

Terraform modules are published to the [HashiCorp Terraform Registry](https://registry.terraform.io/) under the `Azure` organization. Module names follow the pattern `Azure/avm-res-<resource-provider>-<resource-type>/azurerm`. You reference them using the standard Terraform `source` and `version` arguments.

The equivalent Key Vault deployment in Terraform (from the [AVM Terraform quickstart](https://azure.github.io/Azure-Verified-Modules/usage/quickstart/terraform/)):

```hcl
module "keyvault" {
  source  = "Azure/avm-res-keyvault-vault/azurerm"
  version = "~> 0.9"

  name                = "my-keyvault-prod"
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  tenant_id           = data.azurerm_client_config.current.tenant_id

  enable_telemetry = true

  role_assignments = {
    kv_secrets_officer = {
      role_definition_id_or_name = "Key Vault Secrets Officer"
      principal_id               = data.azurerm_client_config.current.object_id
    }
  }
}
```

Standard Terraform workflow applies:

```bash
az login
terraform init
terraform plan
terraform apply
```

To find modules, search `avm` on the [Terraform Registry](https://registry.terraform.io/) and look for the `Partner` tag which identifies official AVM modules from the `Azure` organization. You can also browse the [AVM Terraform module index](https://azure.github.io/Azure-Verified-Modules/indexes/terraform/tf-resource-modules/).

## Versioning and Production Use

AVM uses semantic versioning. Most modules are currently in `0.x.y` pre-1.0 releases while the CI framework and specification coverage mature, but that does not mean they are not production-ready. The AVM team's guidance is that modules can be used in production before reaching 1.0. Once a module hits 1.0, standard semver rules apply: breaking changes require a major version bump.

For Bicep, each module's `CHANGELOG.md` documents what changed between versions. For Terraform, release notes on the Registry provide the same. The recommended upgrade approach is:

1. Review the changelog for breaking changes
2. Update the version reference in your code
3. Run `what-if` (Bicep) or `terraform plan` (Terraform) to review the proposed changes before applying

## What About Pattern Modules and Landing Zones?

Pattern modules are being built on top of resource modules for common architectural patterns. As of early 2026, the published pattern module library is smaller than the resource module library, but it is growing. Examples include hub-spoke networking patterns, AKS baseline deployments, and enterprise-scale landing zone components.

Landing Zone Accelerators (like the ALZ Bicep or Terraform solutions) are not being forced onto AVM immediately, but over time components are being migrated. The [ALZ Bicep subscription vending solution](https://github.com/Azure/bicep-lz-vending) has already migrated to use AVM resource modules. If you're building landing zone automation today, using AVM resource modules as your building blocks is the right direction.

For a full walkthrough of implementing subscription vending with the AVM Terraform module, including OIDC authentication with GitHub Actions and remote state configuration, see **[AVM Deep Dive: Getting Started with Subscription Vending](/posts/2026-05-31-avm-subscription-vending/)**.

The AVM team is also experimenting with AI-assisted development workflows. The [AI-Assisted IaC Solution Development](https://azure.github.io/Azure-Verified-Modules/experimental/ai-assisted-sol-dev/) section of the AVM docs covers using GitHub Copilot with a spec-driven approach to scaffold AVM-based solutions, including end-to-end examples for both Bicep and Terraform.

## When AVM Is the Right Choice

AVM makes the most sense when:

- You want a known-good, Microsoft-supported starting point for common Azure resource deployments
- You're in an organization where support traceability matters and community-maintained modules create risk
- You're building on top of the Well-Architected Framework and want security and reliability defaults already encoded
- You're contributing to or building alongside Landing Zone Accelerators or Azure Mission Landing Zone patterns

It is not a replacement for all IaC. Very custom or niche resource configurations may require you to write native Bicep or Terraform directly. And if a module you need doesn't exist yet, you can [propose one](https://aka.ms/avm/moduleproposal) on the AVM GitHub and, if you're a Microsoft FTE, volunteer to own it.

---

*Sources: [Azure Verified Modules introduction](https://azure.github.io/Azure-Verified-Modules/overview/introduction/), [AVM FAQ](https://azure.github.io/Azure-Verified-Modules/resources/faq/), [Bicep quickstart guide](https://azure.github.io/Azure-Verified-Modules/usage/quickstart/bicep/), [Terraform quickstart guide](https://azure.github.io/Azure-Verified-Modules/usage/quickstart/terraform/), [AVM module specifications](https://azure.github.io/Azure-Verified-Modules/specs/module-specs/)*
