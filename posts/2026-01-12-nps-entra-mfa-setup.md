---
layout: post.njk
title: "Setting Up NPS with Entra ID MFA for RADIUS Authentication"
date: 2026-01-12
tags: [posts, azure, entra, mfa, nps, radius, authentication, security]
category: Security & Identity
excerpt: "Learn how to configure a Network Policy Server (NPS) with Microsoft Entra ID Multi-Factor Authentication to secure RADIUS-based authentication for VPNs, network switches, and wireless access points."
---

Network Policy Server (NPS) is Microsoft's RADIUS server implementation that provides centralized authentication, authorization, and accounting for network access. By integrating with Microsoft Entra ID Multi-Factor Authentication, you can add an additional security layer to protect access to VPNs, wireless networks, and network devices.

```
    ____  ___    ____  ____  __  _______
   / __ \/   |  / __ \/  _/ / / / / ___/
  / /_/ / /| | / / / // /  / / / /\__ \ 
 / _, _/ ___ |/ /_/ // /  / /_/ /___/ / 
/_/ |_/_/  |_/_____/___/  \____//____/  
```



## What You'll Need

- Windows Server (2016 or later) with NPS role installed
- Azure subscription with Microsoft Entra ID (P1 or P2 license)
- Administrator access to both the Windows Server and Azure portal
- Network devices (VPN gateway, switches, or wireless access points) that support RADIUS

## Architecture Overview

The solution works as follows:

1. User attempts to authenticate to a network device (VPN, switch, WiFi)
2. Network device sends RADIUS authentication request to NPS server
3. NPS validates credentials against Active Directory
4. NPS extension triggers MFA challenge via Entra ID
5. User completes MFA on their registered device
6. Upon successful MFA, NPS grants access

<figure>
<img src="https://learn.microsoft.com/en-us/entra/identity/authentication/media/howto-mfa-nps-extension/auth-flow.png" alt="Authentication flow diagram showing VPN server sending RADIUS request to NPS, which then triggers Microsoft Entra multifactor authentication">
<figcaption>The NPS extension authentication flow: the VPN/NAS server sends a RADIUS request to NPS, which validates credentials then triggers a cloud-based MFA challenge via Microsoft Entra ID. Source: Microsoft Learn</figcaption>
</figure>

## Real-World Use Cases

### Use Case 1: Securing Remote VPN Access

**Scenario**: A healthcare organization needs to comply with HIPAA requirements for remote access to electronic health records (EHR) systems.

**Implementation**:
- Deploy NPS with Entra MFA for all VPN connections
- Create separate network policies for different user groups (doctors, nurses, administrators)
- Enforce MFA for all users regardless of location
- Configure conditional access policies in Entra ID to require MFA and compliant devices

**Benefits**:
- Meets compliance requirements for multi-factor authentication
- Protects patient data from credential-based attacks
- Provides audit trail of all VPN access attempts
- Reduces risk of unauthorized access even if passwords are compromised

### Use Case 2: Enterprise WiFi with 802.1X Authentication

**Scenario**: A financial services company wants to secure wireless access across multiple office locations without managing certificates on employee devices.

**Implementation**:
- Configure wireless access points to use RADIUS authentication with NPS
- Deploy 802.1X with PEAP-MSCHAPv2 for seamless authentication
- Enable Entra MFA for WiFi access during initial device enrollment
- Use certificate-based authentication for subsequent connections after device trust is established

**Benefits**:
- Eliminates pre-shared keys (PSK) that can be easily shared
- Automatically segments network access by user credentials
- Provides individual accountability for network usage
- Simplifies onboarding/offboarding - disable AD account to revoke WiFi access

### Use Case 3: Privileged Network Device Management

**Scenario**: An MSP (Managed Service Provider) needs to secure administrative access to customer network infrastructure (switches, routers, firewalls) across multiple client sites.

**Implementation**:
- Configure network devices to use RADIUS for administrative authentication
- Create NPS policies that grant access only to specific AD security groups (Network Admins, NOC Engineers)
- Require MFA for all administrative sessions
- Implement time-based restrictions for scheduled maintenance windows
- Use RADIUS accounting to log all administrative commands

**Benefits**:
- Prevents unauthorized configuration changes
- Creates detailed audit logs for compliance and troubleshooting
- Centralizes credential management - no local admin passwords on devices
- Enables immediate access revocation when employees leave
- Satisfies client security requirements for SOC 2, ISO 27001, etc.

## Part 1: Install and Configure NPS Role

### Install NPS Role

1. Open **Server Manager**
2. Click **Add Roles and Features**
3. Select **Role-based or feature-based installation**
4. Select your server
5. Under **Server Roles**, expand **Network Policy and Access Services**
   - Check **Network Policy Server**
   - Click **Add Features** when prompted
6. Click **Next** through the wizard and **Install**
7. After installation completes, open **Network Policy Server** from the Tools menu

### Configure RADIUS Clients

RADIUS clients are the network devices that will send authentication requests to your NPS server.

1. In NPS console, expand **RADIUS Clients and Servers**
2. Right-click **RADIUS Clients** → **New**
3. Configure the client:
   - **Friendly name**: Descriptive name (e.g., "VPN Gateway" or "Core Switch")
   - **Address (IP or DNS)**: IP address of your network device
   - **Shared secret**: Generate a strong secret (save this for device configuration)
   - Click **OK**

**Tip:** Create a shared secret template for multiple devices:
1. Right-click **Shared Secrets** → **New**
2. Enter a **Template name**
3. Enter and confirm the **Shared secret**
4. When adding RADIUS clients, select this template instead of entering secrets manually

### Configure Remote RADIUS Server Groups (Optional)

If you're using multiple NPS servers for redundancy:

1. Expand **RADIUS Clients and Servers**
2. Right-click **Remote RADIUS Server Groups** → **New**
3. Enter **Group name**
4. Click **Add** to add RADIUS servers
   - Enter **Server** IP address
   - Click **Authentication/Accounting** tab
   - Enter **Shared secret**
5. Click **OK**

## Part 2: Install Entra MFA NPS Extension

<figure>
<img src="https://learn.microsoft.com/en-us/entra/identity/authentication/media/howto-mfa-nps-extension/radius-flow.png" alt="RADIUS packet flow diagram showing UDP authentication requests between VPN server and NPS with MFA extension">
<figcaption>RADIUS UDP packet flow: the NPS MFA extension intercepts authentication requests and performs a secondary verification with Microsoft Entra ID before granting or denying access. Source: Microsoft Learn</figcaption>
</figure>

### Prerequisites

Before installing the extension:

1. Ensure NPS server can reach the internet (required for Entra ID communication)
2. The server must be domain-joined
3. Users must be synced to Entra ID (via Microsoft Entra Connect)
4. Users must have MFA methods registered in Entra ID

### Download and Install the Extension

1. Download the **NPS Extension for Azure MFA** from Microsoft:
   ```
   https://www.microsoft.com/download/details.aspx?id=54688
   ```

2. Run the installer: `NpsExtnForAzureMfaInstaller.exe`

3. Accept the license terms and complete the installation

4. The installer will:
   - Install required PowerShell modules
   - Configure registry settings
   - Create log directories

### Register the Extension with Entra ID

After installation, you must register the extension:

1. Open **PowerShell as Administrator** on the NPS server

2. Import the Microsoft Graph Authentication module:
   ```powershell
   Import-Module Microsoft.Graph.Authentication
   ```

3. Connect to your Microsoft Entra tenant:
   ```powershell
   Connect-MgGraph -Scopes "Directory.Read.All"
   ```

4. Sign in with **Global Administrator** credentials

5. Run the configuration script (located in the extension install directory):
   ```powershell
   cd "C:\Program Files\Microsoft\AzureMfa\Config"
   .\AzureMfaNpsExtnConfigSetup.ps1
   ```

6. The script will:
   - Create a certificate for authentication
   - Register the NPS server as a service principal in Entra ID
   - Configure the necessary registry keys

7. **Restart the NPS service**:
   ```powershell
   Restart-Service IAS
   ```

## Part 3: Configure Network Policy

### Create a Connection Request Policy

1. In NPS console, expand **Policies**
2. Right-click **Connection Request Policies** → **New**
3. Configure:
   - **Policy name**: "Entra MFA VPN Access" (or appropriate name)
   - **Type of network access server**: Select your device type (e.g., "Remote Access Server (VPN-Dial up)")
   - Click **Next**
4. Click **Next** on Conditions (or add specific conditions)
5. On **Settings**, ensure **Authentication** is selected
   - **Authenticate requests on this server** (default)
6. Click **Next** and **Finish**

### Create a Network Policy

1. Right-click **Network Policies** → **New**
2. Configure basic settings:
   - **Policy name**: "VPN Users - MFA Required"
   - **Type of network access server**: Select appropriate type
   - Click **Next**

3. **Specify Conditions**:
   - Click **Add**
   - Select **User Groups** → **Add Groups**
   - Add the AD group containing your VPN users
   - Click **Next**

4. **Specify Access Permission**:
   - Select **Access granted**
   - Click **Next**

5. **Configure Authentication Methods**:
   - Ensure **Microsoft Encrypted Authentication version 2 (MS-CHAPv2)** is checked
   - For VPNs, also enable **Extensible Authentication Protocol (EAP)**
     - Click **Add** → Select **Microsoft: Secured password (EAP-MSCHAP v2)**
   - Click **Next**

6. **Configure Constraints** (optional):
   - Set idle timeout, session timeout, etc.
   - Click **Next**

7. **Configure Settings**:
   - Leave defaults unless specific RADIUS attributes are needed
   - Click **Next** and **Finish**

## Part 4: Advanced Configuration

### Registry Tweaks for Extension Behavior

The MFA extension can be customized via registry:

**Location:** `HKLM\SOFTWARE\Microsoft\AzureMfa`

**Common settings:**

```powershell
# Allow cached credentials during MFA outage (in seconds)
New-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\AzureMfa" -Name "GRACE_PERIOD_IN_SECONDS" -Value 3600 -PropertyType DWord -Force

# Customize MFA prompt text
New-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\AzureMfa" -Name "PROMPT_FOR_RADIUS_RESPONSE" -Value "Please complete MFA on your registered device" -PropertyType String -Force

# Enable additional logging
New-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\AzureMfa" -Name "LOG_LEVEL" -Value 2 -PropertyType DWord -Force
```

### Configure User MFA Methods in Entra ID

Users must have MFA methods registered:

1. In Azure Portal, navigate to **Entra ID** → **Users**
2. Select **Per-user MFA** or use **Conditional Access**
3. For each user:
   - **Status**: Enable or Enforce
   - Users must register methods at: `https://aka.ms/mfasetup`
   - Supported methods: Microsoft Authenticator, SMS, Phone call, Hardware tokens

## Part 5: Configure Network Devices

### Example: VPN Gateway Configuration

On your VPN gateway or firewall:

1. Navigate to RADIUS authentication settings
2. Add **Primary RADIUS Server**:
   - **IP Address**: Your NPS server IP
   - **Port**: 1812 (authentication) and 1813 (accounting)
   - **Shared Secret**: The secret created in NPS
3. Configure **Authentication Protocol**: MS-CHAPv2 or EAP
4. Set timeout values (typically 30-60 seconds to allow for MFA)

### Example: Cisco Switch Configuration

```
aaa new-model
!
radius server NPS-MFA
 address ipv4 192.168.1.10 auth-port 1812 acct-port 1813
 key YourSharedSecret
!
aaa group server radius AZURE-MFA
 server name NPS-MFA
!
aaa authentication login default group AZURE-MFA local
aaa authorization exec default group AZURE-MFA local
```

## Troubleshooting

### Common Issues

**MFA Not Triggering:**
- Verify user is synced to Entra ID: `Get-MgUser -UserId user@domain.com` (Microsoft Graph PowerShell — the legacy AzureAD module was retired in 2025)
- Check user has MFA enabled in Azure Portal
- Review NPS logs: `%SystemRoot%\System32\LogFiles\`

**Extension Errors:**
- Check extension logs: `C:\Program Files\Microsoft\AzureMfa\Logs\`
- Verify certificate: `Get-ChildItem Cert:\LocalMachine\My | Where-Object {$_.Issuer -match "Azure"}`
- Ensure NPS server can reach: `login.microsoftonline.com` and `*.phonefactor.net`

**Authentication Failures:**
- Enable detailed NPS logging: NPS Console → **Accounting** → **Log File Properties**
- Check Event Viewer: **Applications and Services Logs** → **Microsoft** → **AzureMfa**
- Verify RADIUS shared secret matches on both NPS and network device

### Enable Verbose Logging

```powershell
# Enable debug logging
New-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\AzureMfa" -Name "LOG_LEVEL" -Value 2 -PropertyType DWord -Force

# Restart NPS service
Restart-Service IAS
```

Logs location: `C:\Program Files\Microsoft\AzureMfa\Logs\AzureMfaExtension.log`

## Testing the Setup

1. **Test Basic RADIUS**:
   - Use `Test-Connection` to verify NPS server is reachable
   - Check RADIUS client can communicate on ports 1812/1813

2. **Test Authentication**:
   - Attempt VPN/network login with a test user
   - User should receive MFA prompt (push notification, SMS, or call)
   - Upon MFA completion, access should be granted

3. **Monitor Logs**:
   - NPS console: Review successful and failed authentication attempts
   - Entra ID: Sign-in logs show MFA challenges and results

## Security Best Practices

- **Use certificates for RADIUS authentication** when possible (EAP-TLS)
- **Rotate RADIUS shared secrets** regularly (at least annually)
- **Limit MFA grace period** to minimal business requirement
- **Monitor failed attempts** - repeated failures may indicate attacks
- **Deploy multiple NPS servers** for redundancy and load balancing
- **Restrict NPS server firewall** - only allow RADIUS ports from trusted devices
- **Use Conditional Access policies** for granular MFA requirements

## Conclusion

Adding Entra ID MFA to NPS means your VPN, wireless, and network device access all require a second factor, without replacing your existing RADIUS infrastructure. You get centralized MFA policy management in Entra ID, support for modern authentication methods (Authenticator app, FIDO2, biometrics), detailed sign-in logs in Azure, and no additional hardware to maintain.

The end result is straightforward: a stolen password alone isn't enough to get in. For environments that rely on RADIUS authentication, that's a meaningful improvement in your overall security posture.
