---
layout: post
author: zero
tags: hacking server hardware kali linux
---

This guide entails a general overview of how to setup a hacking lab on a computer/server at home to practice hacking exercises using a software combination of Windows 10 Pro + Virtual Box + Kali Linux + VulnHub Virtual Machine Images.

![Hacking Lab Header](/assets/images/hacking_lab/hacking_lab_header.png)

# Quick start guide to setting up a hacking server lab

##  The Hardware

In order to run this software stack you will require a minimum generic computer specification stated below.

*Minimum specification*
```
4 - Core x86 CPU (intel or amd) hyper-threading is a bonus
8 - Gigs of DDRx Ram 
1 - Hard Drive at least 256+ Gigs of space
1 - Motherboard to support CPU and Memory architectures 
1 - Network Adapter (built in LAN port or wifi adaptor)
1 - Power Supply
1 - Computer Inclosure 
1 - Keyboard, Mouse and Screen
```

Basically find an old device that you not using and try get it to those minimum specifications, check online classifieds, ebay, gumtree or local forums, etc for good second hand deals. 

It doesn't have to be latest generation specs. An old intel 4000 series CPU such as an 6 core hyper-threading i7 4930K in my instance does just fine, this system is based on the old intel x79 architecture which is good enough for my needs.

*Recommended Specifications*
```
6 + Core x86 CPU with hyper-threading (intel 4/5/6/7/8/9/10 CPU generations will do OR AMD New Ryzen based CPUS)
16 + Gigs of DDR4 Ram (Dual Channel Preferably)
1 - Solid State Drive 256+ Gigs
1 - Motherboard with DDR4 support, SATA SSD and/or NVME SSD support, 1GB Ethernet LAN and some PCI-Express ports
1 - Power Supply with good efficiency 
1 - Network Adapter either onboard LAN or wifi adapter with at least 100Mbps speeds
1 - Computer case with good airflow
1 - Mechanical Keyboard, Gaming Mouse and 27inch Full HD screen
```

Make sure you have some form of GPU power to power the setup, either internal GPU within the CPU or a dedicated graphics card if you wish to crack hashes in a faster way.

I found good deals on second hand computer components at my local online forums called [carbonite.co.za](https://carbonite.co.za/index.php) and assembled this beast for less than $500 USD as of 2020.

*My specifications*
```
6 - Core 12 Thread intel i7 4930K running at 3.4 Ghz stock and cooled by a 120mm radiator water cooling system.
32 - Gigs of Samsung DDR3-1600 RAM (4 x 8GB Sticks) 
1 - EVGA X79 Dark Edition Motherboard
1 - Western Digital Solid State Drive 500 Gigs
1 - Seagate Barracuda (7200rpm) Hard Disk Drive 750 Gigs 
1 - Huntkey 550W Green 14cm Fan Power Supply
2 - 1 GBPS Onboard Ethernet Network Adapters
1 - Corsair Graphite Series 760T Arctic White Full-Tower Windowed Case + 3 x Corsair 120mm case fans included
1 - Redragon Mechanical Keyboard and Mouse with a 24inch Samsung local screen. I remote desktop into this machine a 27inch QHD screen
1 - Sparkle Geforce GT220 1024 MB PCI-Express Native HDMI Graphics Card (I crunch hashes online or on my nVidia Max-Q 2080)
```

Ain't it a beauty and the beast kinda computer :p

<img class="" alt="Home Server" src="/assets/images/hacking_lab/home_server_1.jpg" width="30%" height="30%">
<img class="" alt="Home Server" src="/assets/images/hacking_lab/home_server_2.jpg" width="30%" height="30%">
<img class="" alt="Home Server" src="/assets/images/hacking_lab/home_server_3.jpg" width="30%" height="30%">

## The Software

This software stack is chosen for its easy of use, easy setup and general versatility. You could defiantly subvert Windows and go with a full Linux based Virtual Machine system.

### Base Operating System - Windows 10 Pro

Windows 10 Pro has a lot of features and is a good base OS for everyday use, plus we will get all our exposure to linux systems via the virtual machines from vulnhub and our primary Kali Linux virtual machine that we will setup within Virtual Box.
Try to source a cheap retail OEM license key from a reputable non-mainstream source.

Why Windows 10 Pro specifically? Windows 10 Home edition does not come with [Hyper-V](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/about/) support which is required to make virtual machines.

Get a blank 8 Gig USB stick to install the Windows 10 media creation tool on it to download and to to be able to install Windows 10 via a USB stick. The details can be found here: [Windows 10 Download](https://www.microsoft.com/en-gb/software-download/windows10)


### Virtual Machine Software - Virtual Box

What is Virtual Box?

> Oracle VM VirtualBox (formerly Sun VirtualBox, Sun xVM VirtualBox and Innotek VirtualBox) is a free and open-source hosted hypervisor for x86 virtualization, developed by Oracle Corporation. Created by Innotek, it was acquired by Sun Microsystems in 2008, which was in turn acquired by Oracle in 2010.

> VirtualBox may be installed on Windows, macOS, Linux, Solaris and OpenSolaris. There are also ports to FreeBSD and Genode. It supports the creation and management of guest virtual machines running Windows, Linux, BSD, OS/2, Solaris, Haiku, and OSx86, as well as limited virtualization of macOS guests on Apple hardware. For some guest operating systems, a "Guest Additions" package of device drivers and system applications is available, which typically improves performance, especially that of graphics.

[Wikipidia Source Entry](https://en.wikipedia.org/wiki/VirtualBox)

This software will allows us to easily manage our virtual machines that we are going to use for hacking.

Download the latest version of virtual box for windows from here: [Virtual Box Download](https://www.virtualbox.org/wiki/Downloads)

Follow the default install instructions and you should be fine. We will get into some more specific setup steps a bit later.

### Attacking Operating System - Kali Linux

> Kali Linux is a Debian-derived Linux distribution designed for digital forensics and penetration testing. It is maintained and funded by Offensive Security. Kali Linux has over 600 preinstalled penetration-testing programs...

[Wikipedia Source Entry](https://en.wikipedia.org/wiki/Kali_Linux)

Download the Kali Linux VirtualBox 32 or 64bit Image file from this link: [Kali Linux VM Image Download](https://www.offensive-security.com/kali-linux-vm-vmware-virtualbox-image-download/#1572305786534-030ce714-cc3b)

Once you have downloaded the image add it to Virtual Box, there are tons of guides on the internet on how to do this exactly so I'm not going to go into detail here about that simple step. [Google Search](https://www.google.com/search?q=install+kali+linux+in+virtualbox)

I would however recommend  you setup the Kali instance with at least *2 or more CPU cores and at least 2048 MB or more of RAM.*

Another specific requirement is that you should setup two network adapters on the Kali VM. You should find this in the Kali Linux VM settings under the Network menu.
* 1 Bridged Adapter - This allows you to connect to the internet via your local ethernet port
* 1 Host-only Adapter - This will connect to the network where your victim machines should reside.

![Virtual Box Network Menu](/assets/images/hacking_lab/vritual_box_1.jpg)


### Victim Virtual Machine Systems - VulnHub

The aim/goal of VulnHub is:
> To provide materials that allows anyone to gain practical 'hands-on' experience in digital security, computer software & network administration.
> So VulnHub was born to cover as many as possible, creating a catalogue of 'stuff' that is (legally) 'breakable, hackable & exploitable' - allowing you to learn in a safe environment and practise 'stuff' out.

[About VunlHub Source](https://www.vulnhub.com/about/)

This is were we will obtain the majority of our free victim virtual machine system images that you will hack for practice.

Here is a link to a even more detailed guide on setting up a hacking lab: [VulnHub - Setting up a local lab](https://www.vulnhub.com/lab/)

Once you have aquatinted yourself with VulnHub download any virtual machine image that suits your level and needs.

### Adding OVE or VMDK Virtual Image files to Virtual box

Todo: detail how to add each type of VM files to virtual box.

### General Tips

Here are a few recommend things you do to setup and easy ideal environment.
* Make sure that the victim virtual machine images are set up with a Host-only Adapter to keep the separated from your main network and off the internet.
* Read the details of each VulnHub machine to get specific bits of setup information if needed.
* Install Virtual Box Guest Additions for you Kali Linux instance to allow for extra features such as copy,past via OS systems and to enable dynamic screen re-sizing to name a few features.
* Use the following command within Kali Linux to find the network address of the victim virtual machine - note to specify your network adapters correct name for the host-only adapter network.

```
# check the names of your network interfaces within kali linux with
ip addr
or
sudo ifconfig

# eth1 is the name of the host-only network interface within kali linux and -l to list items.
sudo apr-scan -I eth1 -l
```

* Do your internet hacking research via a modern browser on Windows 10.
* Microsoft OneNote is a great tool for taking detailed hacking notes.
* Use CherryTree within Kali Linux to keep victim system specific notes.
* I would recommend assigning 2 cores and at least 1024MB of RAM to each VM for smooth operation.
* Also create a Snap Shot called `Fresh` of each Victim Virtual Box Image before you start hacking it so that you can revert back to this snap short if you break the VM system.

Good luck and have fun, I hoped this helped a little.

### Extra Resources

* [Kali Linux Training](https://kali.training/)
* [Kali Linux & VirtualBox Guest Addition](https://www.kali.org/docs/virtualization/install-virtualbox-guest-additions-kali/)