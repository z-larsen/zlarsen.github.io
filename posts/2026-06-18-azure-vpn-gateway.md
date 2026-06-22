---
layout: post.njk
title: "Azure VPN Gateway Overview"
date: 2026-06-18
tags: [posts, Azure, Networking, VPN, VPN Gateway, Hybrid Connectivity]
excerpt: "A practical guide to Azure VPN Gateway: gateway SKUs, VPN types, connection types (S2S, P2S, VNet-to-VNet), GatewaySubnet sizing, BGP, active-active mode, and key design considerations."
---

This post covers Azure VPN Gateway, Microsoft's managed IPsec/IKE VPN solution for connecting on-premises networks and individual clients to Azure Virtual Networks. If you haven't already, check out the [Azure Networking Fundamentals](/posts/2026-03-18-azure-networking-fundamentals/) post first for foundational concepts like VNets, subnets, and routing.

---

## What Is Azure VPN Gateway?

An Azure VPN Gateway is a specific type of Virtual Network Gateway that sends encrypted traffic between an Azure Virtual Network and an on-premises location, or between Azure VNets. Each VNet can have only one VPN Gateway, but a single gateway can support multiple connections.

Key characteristics:
- Traffic travels **over the public internet**, encrypted via IPsec/IKE
- Managed service — Microsoft handles HA, patching, and infrastructure
- Deployed into a dedicated **GatewaySubnet** within your VNet
- Supports Site-to-Site, Point-to-Site, and VNet-to-VNet connections

> Reference: [What is Azure VPN Gateway?](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways)

---

## VPN Gateway vs. ExpressRoute

Both options enable hybrid connectivity to Azure, but they serve different needs:

| Factor | VPN Gateway | ExpressRoute |
|---|---|---|
| Path | Encrypted over public internet | Private (not internet) |
| Bandwidth | Up to ~10 Gbps (VpnGw5AZ) | Up to 100 Gbps (Direct) |
| Latency | Variable | Consistent / low |
| Setup complexity | Lower | Higher (requires provider) |
| Cost | Lower | Higher |
| Use case | Branch offices, DR, remote access | Mission-critical, high-throughput |

VPN Gateway is often used alongside ExpressRoute as a failover path, or for scenarios where private connectivity is either unnecessary or cost-prohibitive.

---

## The GatewaySubnet

All VPN (and ExpressRoute) gateways require a dedicated subnet named exactly **`GatewaySubnet`** in the VNet. This subnet is reserved for gateway infrastructure and cannot be used for other resources.

### Subnet Size

- **Minimum:** `/27` (32 addresses, 27 usable)
- **Recommended:** `/26` (64 addresses, 58 usable)

Microsoft recommends `/26` to provide additional address space for future gateway configurations, zone-redundant deployments, or coexisting VPN and ExpressRoute gateways. A `/27` will work, but leaves little headroom if you later need to add an ExpressRoute gateway to the same VNet or deploy active-active gateways.

> Reference: [GatewaySubnet](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings#gwsub)

---

## Gateway SKUs

VPN Gateway SKUs determine throughput, supported features, and tunnel/connection limits. As of June 2026:

| SKU | Aggregate Throughput | S2S / VNet-to-VNet Tunnels | P2S Connections | Zone-Redundant | BGP | Active-Active |
|---|---|---|---|---|---|---|
| **Basic** | 100 Mbps | 10 | 128 | No | No | No |
| **VpnGw1** | 650 Mbps | 30 | 250 | No | Yes | Yes |
| **VpnGw2** | 1 Gbps | 30 | 500 | No | Yes | Yes |
| **VpnGw3** | 1.25 Gbps | 30 | 1,000 | No | Yes | Yes |
| **VpnGw4** | 5 Gbps | 100 | 5,000 | No | Yes | Yes |
| **VpnGw5** | 10 Gbps | 100 | 10,000 | No | Yes | Yes |
| **VpnGw1AZ** | 650 Mbps | 30 | 250 | Yes | Yes | Yes |
| **VpnGw2AZ** | 1 Gbps | 30 | 500 | Yes | Yes | Yes |
| **VpnGw3AZ** | 1.25 Gbps | 30 | 1,000 | Yes | Yes | Yes |
| **VpnGw4AZ** | 5 Gbps | 100 | 5,000 | Yes | Yes | Yes |
| **VpnGw5AZ** | 10 Gbps | 100 | 10,000 | Yes | Yes | Yes |

**Key notes:**
- **Basic SKU** is legacy; it doesn't support BGP, active-active, or zone redundancy. Avoid it for new deployments.
- **AZ SKUs** (zone-redundant) deploy across Availability Zones and are backed by a stronger SLA (99.99% vs. 99.9%).
- SKU upgrades/downgrades can be done in-place except to/from the Basic SKU (requires gateway recreation).
- Aggregate throughput figures are performance estimates, not guaranteed maximums.

> Reference: [VPN Gateway SKUs](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways#gwsku)

---

## VPN Types

When creating a VPN Gateway, you choose one of two VPN types. This setting **cannot be changed** after the gateway is created.

### Route-Based

- Uses IP routing (routes or routing tables) to direct traffic into tunnel interfaces
- Supports IKEv2
- Required for: Point-to-Site, VNet-to-VNet, multi-site connections, coexistence with ExpressRoute, BGP
- **Recommended for all new deployments**

### Policy-Based

- Encrypts and routes packets based on IPsec policies (static, on-premises prefixes)
- Only supports IKEv1
- Only supported on the Basic SKU
- Only supports one S2S tunnel
- **Legacy; use only when connecting to older on-premises VPN devices that require it**

> Reference: [VPN types](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings#vpntype)

---

## Connection Types

### Site-to-Site (S2S)

Connects an on-premises network to an Azure VNet over an IPsec/IKE tunnel. Requires a **Local Network Gateway** resource to represent the on-premises side (public IP + address prefixes), and a compatible VPN device on-premises.

**Common use cases:**
- Extending on-premises datacenters into Azure
- Connecting branch offices to Azure-hosted resources

```
[On-Premises Network] ──── IPsec/IKE ──── [Azure VPN Gateway] ──── [Azure VNet]
```

### Point-to-Site (P2S)

Allows individual clients (laptops, workstations) to connect to an Azure VNet from anywhere. No on-premises VPN device needed.

**Supported protocols:**
- **OpenVPN** — TLS-based, works over TCP 443; firewall-friendly
- **IKEv2** — Standards-based, supported on macOS and Windows natively
- **SSTP** — Microsoft-proprietary, Windows-only

**Authentication options:**
- Azure certificate authentication
- Microsoft Entra ID (Azure AD) authentication (OpenVPN only)
- RADIUS-based authentication

**Common use cases:**
- Remote workers connecting to Azure-hosted resources
- Developers accessing resources in non-production VNets

### VNet-to-VNet

Connects two Azure VNets together using an IPsec/IKE tunnel between their VPN Gateways. Useful for cross-region or cross-subscription connectivity.

> For VNets in the same region or tenant, **VNet Peering** is typically preferred (lower latency, higher throughput, simpler setup). Use VNet-to-VNet when Peering is not feasible (e.g., cross-tenant scenarios without the prerequisites for peering).

---

## BGP Support

VPN Gateway supports **BGP (Border Gateway Protocol)** on all non-Basic SKUs. BGP enables:

- Dynamic route exchange between Azure and your on-premises network
- Automatic failover by detecting and rerouting around failed tunnels
- Route propagation across multi-site and transit topologies

Each VPN Gateway has an **Azure BGP peer IP** from the GatewaySubnet and an **Autonomous System Number (ASN)**. Reserved ASNs that cannot be used: `65515–65520`, and the IANA-reserved ranges `23456`, `64496–64511`, `65535`.

> Reference: [BGP with Azure VPN Gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-bgp-overview)

---

## Active-Active Mode

By default, a VPN Gateway runs in **active-standby** mode: one active instance handles traffic, the standby takes over on failure (30–90 second failover for planned maintenance; ~10–15 seconds for unplanned failures).

**Active-active mode** provisions both gateway instances as active, each with its own public IP. Your on-premises VPN device must support dual tunnels to both instances simultaneously. This reduces failover time significantly and increases aggregate throughput.

Requirements:
- Route-Based VPN type
- VpnGw1 or higher SKU
- BGP is highly recommended (required for full active-active redundancy with on-premises devices)

> Reference: [Active-active VPN gateways](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable)

---

## Key Design Considerations

### Availability Zone Redundancy

Use AZ SKUs (`VpnGwXAZ`) when:
- You require 99.99% availability SLA
- The target Azure region supports Availability Zones
- You are running production workloads that cannot tolerate a gateway-level failure

### Coexistence with ExpressRoute

A VNet can have both a VPN Gateway and an ExpressRoute Gateway. Common design: use ExpressRoute as the primary path and VPN as an encrypted failover path. This requires:
- A route-based VPN Gateway
- A GatewaySubnet of at least `/27` (recommend `/26` for headroom)

> Reference: [Configure ExpressRoute and Site-to-Site coexisting connections](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-howto-coexist-resource-manager)

### Forced Tunneling

If your security policy requires all internet-bound traffic from Azure VMs to route through on-premises (for inspection or compliance), you can configure **forced tunneling** via a User Defined Route (UDR) that points `0.0.0.0/0` to the VPN Gateway.

> Note: Forced tunneling requires a route-based VPN Gateway with BGP enabled if using dynamic routes.

### IKE Policy Customization

VPN Gateway supports custom IKE Phase 1 and Phase 2 policies, allowing you to specify exact cipher suites, key sizes, and SA lifetimes when connecting to VPN devices that require specific parameters.

> Reference: [IPsec/IKE policy for S2S VPN](https://learn.microsoft.com/en-us/azure/vpn-gateway/ipsec-ike-policy-howto)

---

## Prerequisites Checklist

Before provisioning a VPN Gateway:

- [ ] Active Azure subscription with `Microsoft.Network` resource provider registered
- [ ] Virtual Network created with a `GatewaySubnet` (recommend `/26`, minimum `/27`)
- [ ] Public IP address(es) planned (1 for active-standby; 2 for active-active)
- [ ] VPN device on-premises is compatible and has a public IP (for S2S)
- [ ] On-premises address space does not overlap with the Azure VNet address space
- [ ] SKU selected based on throughput and feature requirements
- [ ] VPN type selected (route-based for all modern deployments)
- [ ] BGP ASN planned if using BGP

---

## Monitoring

VPN Gateway metrics and diagnostics are available via Azure Monitor:

- **Gateway bandwidth** — aggregate throughput in/out
- **Tunnel bandwidth** — per-tunnel throughput
- **Tunnel egress/ingress bytes** — data transferred per tunnel
- **BGP peer status** — health of BGP sessions
- **Tunnel connection count** — active P2S connections

Enable **diagnostic logs** to a Log Analytics Workspace for detailed troubleshooting:
- `GatewayDiagnosticLog` — gateway configuration events and state changes
- `TunnelDiagnosticLog` — tunnel state change events and reasons
- `RouteDiagnosticLog` — BGP route advertisements and changes
- `IKEDiagnosticLog` — IKE negotiation details

> Reference: [Monitor VPN Gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/monitor-vpn-gateway)

---

## Summary

| | Detail |
|---|---|
| What it is | Managed IPsec/IKE VPN service for hybrid and client connectivity |
| Subnet required | `GatewaySubnet` — /26 recommended, /27 minimum |
| VPN types | Route-Based (modern), Policy-Based (legacy) |
| Connection types | Site-to-Site, Point-to-Site, VNet-to-VNet |
| SKUs | Basic (legacy), VpnGw1–5, VpnGw1AZ–5AZ |
| Max throughput | Up to 10 Gbps (VpnGw5 / VpnGw5AZ) |
| High availability | Active-standby (default) or active-active |
| BGP | Supported on VpnGw1+ |

---

## Further Reading

- [What is Azure VPN Gateway?](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways)
- [VPN Gateway settings](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings)
- [VPN Gateway SKUs](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways#gwsku)
- [BGP with Azure VPN Gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-bgp-overview)
- [Highly available VPN Gateway designs](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable)
- [Point-to-Site overview](https://learn.microsoft.com/en-us/azure/vpn-gateway/point-to-site-about)
- [VPN Gateway FAQ](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-vpn-faq)
- [Well-Architected Framework: VPN Gateway](https://learn.microsoft.com/en-us/azure/well-architected/services/networking/vpn-gateway/reliability)
