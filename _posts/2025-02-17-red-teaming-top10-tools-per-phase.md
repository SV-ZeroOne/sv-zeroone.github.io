---
layout: post
author: zero
tags: redteaming phishing initialaccess tools
---

The top 10 tools in 2024/2025 for Red Teaming divided for each phase of the engagement.

---

# Top 10 Red Team Tools for Each Engagement Phase (2024/2025)

This document provides a comprehensive overview of the top 10 popular tools for each phase of a red team engagement in 2024/2025. Red team operations are divided into several phases—from initial reconnaissance to post-exploitation. The tables below list each tool’s primary purpose, a brief description, and the platform or language used where applicable.

> **Note:** Some tools appear in multiple phases if their functionality overlaps (e.g. Evilginx2 is used for both initial access and phishing). This guide reflects current industry trends and insights from recent research :contentReference[oaicite:2]{index=2}, :contentReference[oaicite:3]{index=3}.

---

## Phase 1: Reconnaissance

Reconnaissance is the foundation of a red team engagement—gathering intelligence on the target’s network, domains, assets, and potential vulnerabilities.

| Tool            | Primary Purpose                        | Description                                                                                             | Platform/Language      |
|-----------------|----------------------------------------|---------------------------------------------------------------------------------------------------------|------------------------|
| **Nmap**        | Network scanning & mapping             | Open-source network mapper for discovering hosts, open ports, and services.                             | C, C++ (CLI)           |
| **Shodan**      | Internet asset discovery               | A search engine for Internet-connected devices to identify exposed assets and services.                  | Web-based/API          |
| **Recon-ng**    | OSINT framework                        | Modular web reconnaissance framework to gather and correlate publicly available data.                   | Python                 |
| **theHarvester**| Email and domain enumeration           | Gathers email addresses, subdomains, hosts, and employee names from public sources.                      | Python                 |
| **Amass**       | Asset discovery & network mapping      | Helps identify domain infrastructure, subdomains, and external assets using DNS and certificate data.    | Go                     |
| **Maltego**     | Graph-based OSINT analysis             | Visualizes relationships between entities (domains, people, IPs) to map potential attack paths.           | Java-based GUI         |
| **SpiderFoot**  | Automated intelligence gathering       | An open-source tool that automates collection of OSINT from numerous data sources.                         | Python                 |
| **FOCA**        | Metadata extraction                    | Scans documents and files for hidden metadata that could reveal sensitive information.                   | Windows (GUI)          |
| **Datasploit**  | Comprehensive recon framework          | Aggregates data from multiple public sources for detailed target profiling and vulnerability assessment.  | Python                 |
| **dnsrecon**    | DNS enumeration                        | Automates DNS reconnaissance, including zone transfers and record collection.                           | Python                 |

---

## Phase 2: Initial Access

Initial access tools help simulate the techniques attackers use to gain their first foothold in a target environment through exploitation and social engineering.

| Tool                   | Primary Purpose                             | Description                                                                                             | Platform/Language      |
|------------------------|---------------------------------------------|---------------------------------------------------------------------------------------------------------|------------------------|
| **Metasploit Framework** | Exploitation framework                      | Provides a vast collection of exploits, payloads, and auxiliary modules for testing vulnerabilities.    | Ruby, CLI              |
| **Empire**             | Exploitation & post-exploitation            | A PowerShell and Python-based framework used to deliver payloads and automate exploitation tasks.        | PowerShell, Python     |
| **Cobalt Strike**      | Adversary simulation & exploitation         | Commercial tool for emulating threat actor tactics, including initial access and lateral movement.       | Java-based, cross-platform |
| **Evilginx2**          | Man-in-the-middle/phishing initial access     | Reverse proxy tool that intercepts session tokens to bypass MFA and capture credentials.                 | Go                     |
| **Modlishka**          | Phishing-based credential capture             | Replicates legitimate websites in real time to harvest user credentials during a simulated attack.       | Go                     |
| **SET (Social Engineering Toolkit)** | Social engineering                   | Automates spear phishing, website cloning, and other social engineering attacks to gain initial access.     | Python                 |
| **ntlmrelayx (Impacket)** | NTLM relay for credential abuse              | Relays NTLM authentication to exploit weak configurations in Windows environments.                       | Python                 |
| **PowerSploit**        | Exploitation via PowerShell                  | A collection of PowerShell scripts used for exploiting vulnerabilities and bypassing defenses.             | PowerShell             |
| **SQLmap**             | SQL injection exploitation                   | Automates the detection and exploitation of SQL injection flaws in web applications.                     | Python                 |
| **RIPS**               | Web application vulnerability exploitation    | Analyzes source code for vulnerabilities to facilitate exploitation in web applications.                | PHP (commercial version) |

---

## Phase 3: Phishing & Credential Harvesting

These tools are designed to simulate phishing campaigns and harvest credentials from targeted users, a key method for obtaining access via social engineering.

| Tool                          | Primary Purpose                          | Description                                                                                             | Platform/Language      |
|-------------------------------|------------------------------------------|---------------------------------------------------------------------------------------------------------|------------------------|
| **Gophish**                   | Phishing campaign management             | Open-source toolkit for creating, launching, and tracking phishing simulations and user awareness tests.  | Go, Web-based UI       |
| **Phishing Frenzy**           | Phishing campaign orchestration          | Ruby on Rails-based framework for managing large-scale phishing campaigns with detailed analytics.       | Ruby on Rails          |
| **CredSniper**                | MFA token and credential capture         | Creates realistic phishing pages to harvest both credentials and MFA tokens during simulated attacks.    | Python                 |
| **King Phisher**              | Targeted email phishing simulation       | Enables creation of highly realistic spear phishing campaigns for testing organizational defenses.       | Python                 |
| **Evilginx2**                 | Session hijacking via phishing           | Captures session cookies during phishing attacks to bypass MFA and establish authenticated sessions.     | Go                     |
| **SET (Social Engineering Toolkit)** | Social engineering & phishing         | Automates various social engineering attacks, including phishing and website cloning.                     | Python                 |
| **MailSniper**                | Email reconnaissance and harvesting      | Extracts email addresses and associated data to facilitate targeted phishing campaigns.                  | Python                 |
| **Phishery**                  | Lightweight phishing server              | Provides a simple HTTPS server for simulating phishing attacks via Basic Authentication.                 | Python                 |
| **Phishing Pretexts Library** | Phishing template repository             | A library of customizable pretexts and templates to enhance the realism of phishing emails.                | Various (Template-based)|
| **SocialPhish**               | Social media phishing                      | Assists in gathering data and launching phishing attacks targeting social media accounts.                 | Web-based, CLI         |

---

## Phase 4: Password Spraying

Password spraying tools test common passwords across many accounts—avoiding account lockouts—to identify weak credentials before adversaries do.

| Tool                | Primary Purpose                             | Description                                                                                             | Platform/Language      |
|---------------------|---------------------------------------------|---------------------------------------------------------------------------------------------------------|------------------------|
| **Spray365**        | Cloud password spraying                     | Targets Office 365 and Azure endpoints using a two-phase approach to safely test credentials.            | Python 3               |
| **Trident**         | Multi-cloud password spraying               | Automates spraying across various cloud platforms with features like IP pooling and scheduling.          | Not specified          |
| **SharpSpray**      | Active Directory password spraying          | Uses LDAP to interact with AD and spray credentials in Windows environments.                           | C# (.NET)              |
| **Spray-AD**        | Kerberos password spraying                  | Focuses on triggering Kerberos pre-authentication failures to conduct stealthy password spraying.        | C/C++                  |
| **TeamFiltration**  | Azure/Office 365 account enumeration        | Combines account enumeration with password spraying techniques for cloud-based environments.             | C#                     |
| **Spraycharles**    | Low-and-slow password spraying              | Operates over extended periods with dynamic indicators to evade detection during prolonged campaigns.    | Python                 |
| **CrackMapExec**    | Credential testing & lateral movement       | Multifunctional tool that can perform password spraying as well as automate lateral movement.             | Python                 |
| **Hydra**           | Network authentication brute forcing        | Supports password spraying on various protocols (SSH, FTP, RDP) through fast, parallelized brute force.    | C                     |
| **Medusa**          | Parallel brute-forcing tool                 | Performs password spraying attacks across multiple protocols simultaneously.                          | C                     |
| **PasswordSpray**   | Dedicated password spraying script          | A simple, customizable script for conducting password spraying attacks on defined target lists.          | PowerShell/Python (varies) |

---

## Phase 5: Post-Exploitation & Command and Control

Once a foothold is established, post-exploitation tools facilitate lateral movement, persistence, data exfiltration, and overall control of the compromised environment.

| Tool                         | Primary Purpose                             | Description                                                                                             | Platform/Language      |
|------------------------------|---------------------------------------------|---------------------------------------------------------------------------------------------------------|------------------------|
| **L3MON**                    | Android post-exploitation                   | Maintains persistent access on compromised Android devices with features for file management and keylogging. | Python                 |
| **Flask Reverse Shell**      | Stealth remote access                       | Provides an HTTPS reverse shell for covert remote command execution on compromised systems.             | Python                 |
| **Android Backdoor Dashboard** | Post-exploitation on Android             | A command-and-control (C2) dashboard to manage and control backdoored Android devices.                  | Python                 |
| **SILENTTRINITY**            | Cross-platform post-exploitation C2         | A versatile C2 framework that supports advanced post-exploitation activities on multiple platforms.      | Python                 |
| **Koadic**                   | Windows post-exploitation rootkit           | Uses COM interfaces to facilitate lateral movement and command execution on Windows targets.             | Python (with JScript)  |
| **Cobalt Strike**            | Commercial C2 and adversary simulation      | Widely used for simulating advanced adversary tactics, lateral movement, and persistence in networks.      | Java-based, cross-platform |
| **Sliver**                   | Open-source C2 framework                    | Provides cross-platform implant management and C2 communications over TLS, HTTP(S), and DNS.              | Go                     |
| **Havoc**                    | Modern C2 framework                         | An emerging framework designed for scalability and multi-channel communications in post-exploitation.      | Typically Rust/C (varies) |
| **PowerShell Empire**        | PowerShell-based post-exploitation          | Offers a range of modules for command execution, credential harvesting, and lateral movement on Windows.   | PowerShell             |
| **PoshC2**                   | Proxy-aware C2 framework                    | Written entirely in PowerShell, facilitates red team operations with a focus on stealth and automation.    | PowerShell             |

---

## Conclusion

This guide outlines 50 top red team tools across five phases—Reconnaissance, Initial Access, Phishing & Credential Harvesting, Password Spraying, and Post-Exploitation. By integrating these tools into your red team engagements, you can simulate sophisticated, real-world attacks and uncover vulnerabilities before adversaries do. Staying current with these popular tools from 2024/2025 empowers your organization to continuously refine defenses, improve threat detection, and enhance incident response.

*References: Insights and rankings derived from industry sources and additional web research from cybersecurity publications.*

Happy testing and stay secure!
