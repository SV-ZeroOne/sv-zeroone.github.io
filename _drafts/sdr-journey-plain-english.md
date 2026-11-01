---
title: "Listening to the Sky: How a £25 Gadget Turned Into a Radio Hobby (and a Private 5G Plan)"
date: 2026-10-31
tags: [sdr, radio, hobby, learning, 5g, ethics, licensing]
---

# Listening to the Sky: How a £25 Gadget Turned Into a Radio Hobby (and a Private 5G Plan)

Most hobbies start with a purchase you didn't think much about. Mine was a tiny USB stick — a
Nooelec NESDR Mini — bought during university while I was studying wireless networking. It cost
about as much as a takeaway and it did something I didn't expect: it let me *see* radio.

Not hear it. See it. Every radio signal is a shape, and this little stick drew those shapes on my
screen in real time — bright blobs where radio stations live, thin lines where aircraft hide, the
fuzzy cloud of a city's worth of gadgets chattering away. I was supposed to be revising. I spent
the evening staring at a graph.

That was roughly ten years ago. This is what happened in between, what the hardware actually lets
you do, and — importantly — where the line is between exploring and breaking the law.

## What these gadgets actually are

A "software defined radio" is a radio without the personality baked in. A normal FM radio is built
to do one thing: pick up FM, and nothing else. An SDR just hands your computer the raw radio waves
and lets software decide what to do with them.

The useful analogy: a normal radio is a single pre-recorded TV channel. An SDR is a camera pointed
at the sky — the picture is whatever software you point it at.

That's why the same £25 stick can listen to FM radio, track aeroplanes, read text from satellites,
and show you which of your neighbours' devices are shouting. It's not that the hardware is clever.
It's that the software can be.

## Stage one: the £25 beginning

My first stick was a DVB-T television dongle — the kind you'd buy to watch Freeview on a laptop.
It turns out those chips (RTL2832U) spray raw radio data over USB as a side effect of their real
job, and the internet worked out you could keep that data and ignore the television part.

It was not good, and that was the point. It was 8-bit, it drifted with temperature, and it needed a
weird connector (MCX) that no normal antenna fits. But it taught me things no book did:

- **Antennas matter more than radios.** A cheap radio with a decent antenna beats an expensive radio
  with a bad one, every single time.
- **Radio is physical.** Temperature changes the tuning. Metal nearby changes what you hear. Weather
  matters. It's not software; it's the actual world, with wires.
- **Seeing is believing.** Before this, radio was theory. After it, radio was a picture I could point
  at and say "what's that?"

The first genuinely magic moment was decoding **RDS** — the text data hidden inside FM broadcasts.
A string of numbers appeared in a terminal that told me the station's identity, transmitted on a
frequency no human ear can hear. A machine, talking quietly inside music, and I could read it.

The second was tracking **aeroplanes**. Aircraft constantly broadcast where they are, how fast
they're going and how high they are. With a small antenna by a window, my computer drew those
aircraft on a map — real planes, real altitudes, live. A receiver that cost less than dinner was
telling me the height of a jet over Surrey.

## Stage two: the HackRF — power, and its price

Once I started working in cybersecurity, listening stopped being enough. I wanted to understand
both halves of the conversation, not just one. So I bought a **HackRF One** with a PortaPack — a
well-known open-source radio that covers an enormous range and, crucially, can also *transmit*.

It's a brilliant teaching device and a slightly frustrating measuring device, and both come from the
same thing: it trades precision for enormous range. It's the radio equivalent of a very wide-angle
lens — you can see everything, but nothing in fine detail.

The PortaPack added a screen and a dial, so the whole thing works standing in a field with no laptop.
I learned two lessons I still use:

- **Weak signals vanish.** A wide-open receiver hears everything *and* its own noise. Finding
  something faint is a precision game, not a power game.
- **The computer matters as much as the radio.** I once lost an evening to "the radio keeps
  disconnecting" before realising it and the other dongle were fighting over the same USB port. The
  radio chain starts inside your computer.

## Stage three: the AI years

Then life got busy and the radios sat in a drawer for a while. What brought me back was AI — not
the hype version, but the practical one: modern models can now hold a connection to real tools and
*use* them.

I wired my radio software up so an AI agent could tune the radio, take measurements and report back.
That sounds like a gimmick. It isn't, because of one simple thing: **an assistant can measure things
I'm too slow to measure.**

Want to know if a frequency is actually empty, or just quiet at the moment you looked? A person
takes a snapshot. The agent can watch the spectrum three times a second for two minutes, remember
the loudest moment in every channel, and tell you "nothing here, and I can prove it."

Some real examples from my own desk:

- It found bursts of signal at 868 MHz and correctly told me they were **not** the thing I was
  convinced they were. I was sure I'd found a LoRa network. It wasn't — it was a device repeating
  every single second, like clockwork, which no battery-powered sensor network does.
- It measured a radio station's signal quality and proved my expensive long antenna was only
  *slightly* better than a tiny 10 cm stub — because the transmitter is 100 kilowatts and ten
  kilometres away, so it's shouting loud enough that antenna quality barely matters.
- When the radio software kept crashing, it found the exact Windows error record and traced it to a
  known bug in the software, then suggested the alternative program that works.

That last one is the honest reality of AI in hobbies: it didn't magically fix anything. It read the
error faster than I would have and pointed me in the right direction. That's worth a lot.

## Stage four: the board I couldn't afford as a student

Here's the part that still makes me smile.

As a student I used to read about **Ettus USRP** radios. A USRP B210 cost about **$2,000**. It was
the professional reference hardware — the board in every research paper, the one everyone said you
needed to "do real radio". I read its spec sheet and closed the tab, the way you close the tab on a
car you can't afford.

Then I found a **LibreSDR B220** on Alibaba for about **£250**. It's a clone of that same B210
board, built in China, using the same architecture — and it speaks the same software language, so
all the professional tools work with it.

It was not plug-and-play. It needed a specific firmware file, it had a serial number that the
software refused to recognise, and I spent a whole evening getting it to appear. But once it did, it
did this: locked onto a digital radio broadcast, decoded 31 stations at once, with **zero errors**.

A board costing less than a mid-range phone, doing what a £1,600 radio does.

That's the real change in this hobby over the last few years. **It isn't about becoming a
professional. It's that the professional tools got cheap enough that curiosity can afford them.**

## What you can actually do with this (ethically)

This is the fun part, and none of it requires a licence, because all of it is listening:

- **Watch the sky.** Aircraft above you broadcast their position and altitude; satellites pass over
  and send pictures and text. You can receive weather satellite images with a homemade antenna and
  a £25 dongle.
- **Read the invisible.** Digital radio carries text, station names, even programme information.
  Traffic systems, ship tracking, pager networks — a surprising amount of the modern world is still
  talking in the open.
- **Understand your own devices.** Wi-Fi, Bluetooth, doorbells, smart meters, car keys. Seeing them
  as radio makes security real instead of theoretical.
- **Learn how phones work** — the actual physics and protocol of mobile networks, not the marketing
  diagram.
- **Do genuinely useful security work.** Finding rogue transmitters, checking whether a wireless
  deployment is as isolated as the vendor claimed, and understanding attack surface at the layer
  most people never look at.

And here's the thing that surprised me: **the listening is the valuable half.** Everyone assumes
radio means transmitting. Almost everything I've learned came from listening very carefully and
then proving what I heard by decoding it.

## The rules — and why they matter

This is the part I want to be very clear about, because radio is one of the few hobbies where the
law is not a formality.

**Transmitting without a licence is a criminal offence in the UK.** The spectrum is licensed
property. Broadcasters pay for it, emergency services depend on it, air traffic control depends on
it. Turning on a transmitter on a frequency you don't own isn't a grey area — it's a Wireless
Telegraphy Act offence, and if you interfere with safety-of-life communications it can kill people.

To be explicit about my own practice: **I have never transmitted unlawfully.** My radios are used
for reception. Where I have transmitted at all, it has been at minimal power, for minutes at a time,
for education — on bands that are specifically set aside for public, licence-free use, where small
devices are legally allowed to operate. Never on a licensed band, never near public safety, aviation
or marine frequencies, never at power that could reach beyond my own desk. And if a receiver can
hear it in the next street, that's already too much for me.

The safety rules I hold myself to:

1. **Receive by default.** Almost everything is legal to listen to, and almost nothing needs
   transmitting.
2. **Never transmit on a licensed frequency.** Not "briefly", not "at low power". No.
3. **Never interfere, never jam, never spoof.** Jamming is not a prank; it's a threat to life and a
   serious crime.
4. **Don't broadcast what you overhear.** UK law also restricts *disclosing* the contents of
   messages you weren't meant to receive. Receiving something is not permission to publish it.
5. **If in doubt, don't transmit.** Then go and get a licence.

## Getting a licence — it's easier than people think

Two routes, both genuinely accessible:

**Amateur radio licence.** In the UK this is free, exam-based and designed for beginners. You study
a syllabus, sit a short multiple-choice exam (organised by the RSGB), and you get a callsign and
legal access to amateur bands. This is the traditional road into legal transmitting and it costs
tens of pounds, not thousands.

**Ofcom Innovation and Research licence.** For actual experimentation — testing your own equipment,
running a small trial, developing something — Ofcom issues an Innovation and Research licence at
**£50 per year per station**, or a Demonstration and Trial licence at **£50 per location per month**
for larger trials. You apply on form **OfW225** and processing typically takes around six to eight
weeks (most within 42 days).

Neither is an afternoon's work, but neither is the wall people imagine. My plan is to apply for an
experimental licence, because the next stage of what I want to do involves building a small private
5G network in my own space — and that absolutely requires doing it properly, on paper, with Ofcom's
blessing.

## What's next: a private 5G network

The reason the £250 board matters isn't the DAB decoding. It's that this class of radio is the
standard hardware for building your *own* mobile network.

There's a whole open-source ecosystem for this — a small "core" network on a computer, a base
station role played by the radio, a SIM card you program yourself, and a phone you own connecting to
a network that exists entirely inside your flat. People build these for research, for testing
equipment, and increasingly to learn 5G security by breaking their own network instead of someone
else's.

That last part is the appeal. You can read about how mobile networks protect subscriber identity
until you're blue in the face; it doesn't stick. Standing up your own network, watching a phone
attach to it, and then trying to break that protection in a lab you control — that sticks.

And to be clear about the boundary again: **my own equipment, my own spectrum, my own licence.**
Pointing a fake base station at other people's phones isn't research, it's a crime, and it's a crime
precisely because it works.

## What I'd tell my student self

I thought the thing standing between me and "real radio" was money. That a £2,000 radio was the
entry ticket and everything before it was a toy.

It wasn't. The £25 stick decoded aircraft and hidden text. The HackRF taught me that range and
precision are different things. The £250 clone gave me the same capability as hardware I used to
dream about. Every single step was capable of real work.

The actual barriers were time, curiosity, and the discipline to **prove** what you think you've
found instead of assuming. The biggest upgrade to my setup in ten years wasn't a board — it was
learning to say "I saw a signal, but I haven't decoded it yet, so I don't know what it is."

If you've got a cheap dongle and a bit of curiosity, you already have enough. Point it at the sky,
decode something small, and write down what you measured.

The expensive radio can wait. It always could.

---

*If you're curious and want a starting point: an RTL-SDR stick (£25–£40), a simple antenna, and free
software will get you listening to aircraft, FM text and weather satellites within an evening. Start
with listening. Stay with listening for a long time. There's more there than you'd think.*
