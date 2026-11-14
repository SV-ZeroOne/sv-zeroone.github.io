---
title: "From a £25 Dongle to a Private 5G Lab: My SDR Journey"
date: 2026-10-31
tags: [sdr, radio, rtl-sdr, hackrf, usrp, 5g, security, ai, mcp]
---

# From a £25 Dongle to a Private 5G Lab: My SDR Journey

Every hardware journey has a starting point you didn't recognise as one at the time. Mine was a
Nooelec NESDR Mini and a DVB-T stick in a university bedroom, plugged into a laptop that barely
had enough USB bandwidth to keep up. I bought them because I was studying wireless networking and
I wanted to see the thing I was reading about — not the packet captures, the actual signal.
Spectrograms, sidebands, the physical layer underneath all the abstraction.

Nearly a decade later I have a rack of radios that can hear from 70 MHz to 6 GHz, an AI agent that
tunes them for me over a JSON-RPC socket, and I'm planning a private 5G network in my flat. This is
the story of the gap between those two points, and what I actually learned filling it.

## Part 1: The £25 beginning

The RTL2832U chip was never designed to be a radio. It's a DVB-T demodulator that happened to expose
raw I/Q samples over USB, and a community of people realised that if you throw away the TV decoding
and keep the samples, you have a receiver that covers roughly 24 MHz to 1.7 GHz for the price of a
takeaway.

My first stick — an R820T tuner on the front end, 8-bit ADC, no temperature-compensated oscillator —
taught me three lessons that still govern everything I do:

1. **Connectors are a tax on enthusiasm.** The NESDR uses MCX, not SMA. Every antenna I owned needed
   an adapter I didn't have yet.
2. **Drift is real.** Without a TCXO the thing wanders tens of ppm. At 100 MHz that's kilohertz of
   error, and it's why my first RDS decodes looked like noise for a week. Mine needed about +19 ppm
   correction and even then it cooked with the room temperature.
3. **8 bits is not very many.** Strong stations sound fine; weak ones vanish into the quantisation
   floor. This isn't a software problem, and no amount of gain fixes it.

What it did give me was the *shape* of the spectrum. I could see FM broadcast, hear airband AM
scratchily, watch DAB blocks as broad plateaus, and — the moment that hooked me — decode an RDS
group and read a station's PI code out of a 57 kHz subcarrier that no human ear can hear. That's
still one of the best feelings in this hobby: a number appearing in a terminal that came out of
thin air.

Later, with a proper antenna and `dump1090`, the same £25 stick tracked aircraft overhead from
transponder pulses 0.5 microseconds long. A receiver that costs less than a takeaway curry was
telling me the altitude of a plane over Surrey. It's worth pausing on that.

## Part 2: The HackRF interlude — capability, then reality

Once I started doing penetration testing professionally, receive-only stopped being enough. I bought
a HackRF One with a PortaPack H2 clone from AliExpress — the classic "cheap spectrum playground"
purchase. 1 MHz to 6 GHz, 20 MS/s, transmit capability, and a screen-and-encoder interface that lets
you sweep the spectrum standing in a field with no laptop.

The HackRF is a *wonderful* teaching device and a *frustrating* measurement device, and both come
from the same design decision: an 8-bit ADC running at enormous bandwidth. You get coverage, you get
TX, you get portability — and you get a noise floor that swallows anything weak, plus a clock that
drifts.

I measured mine properly later: **−38.9 ppm** of LO error. At 1090 MHz that's 42 kHz off frequency
before you've done anything wrong. That's the difference between a clean ADS-B decode and a table
that stays empty while your waterfall looks busy.

The PortaPack taught me something the datasheets don't: **the USB link is part of the radio.** I
spent an evening chasing "the HackRF keeps disconnecting" before working out that it and the RTL
stick were sharing a USB controller and starving each other. Move them to separate controllers and
the problem evaporates. I've never forgotten it — the RF chain starts at the PCIe bus.

## Part 3: The AI and MCP years

Then I took a break. Not a deliberate one — work, life, the usual. What pulled me back was the
arrival of capable local models and, specifically, **MCP**: the idea that a language model could hold
a tool interface to a piece of hardware and drive it conversationally.

I wired SDRangel to an MCP server and started tuning radios by talking to an agent. Not because I
couldn't click the GUI, but because *the agent can measure things I'm too slow to measure*. It can
poll a spectrum readout three times a second for ninety seconds while I make tea, hold peak values
per bin, and tell me a band is empty with evidence rather than vibes.

That changed my relationship with the hobby more than any single radio has. A few examples from
recent sessions:

- The agent found **1 Hz-periodic bursts at 868 MHz**, 6 ms long, +47 dB above the noise floor,
  and correctly told me they weren't LoRa despite my confidence that they were.
- It decoded **DAB block 11D** and reported carrier-to-noise of 26–29 dB with zero bit errors and
  31 services, then proved a 10 cm antenna was only 3 dB worse than a 75 cm one *because the
  transmitter is 100 kW and ten kilometres away*.
- It ran a **gain sweep** through 0, 10, 20, 30 and 40 dB on the marine band, watched the noise
  floor fall by exactly 10 dB per step, and concluded the front end was noise-limited rather than
  overloaded. That's the kind of evidence that stops you buying an amplifier you don't need.

It also taught me the limits of automation, honestly. SDRangel's ADS-B demodulator crashed on all
three of my radios — I eventually captured the Windows fault record: **`0xC0000374`,
`STATUS_HEAP_CORRUPTION`, in `ntdll.dll`** — and traced it upstream to an open issue where the crash
sits in the aircraft-table removal path (`ADSBDemodGUI::removeAircraft`). An agent didn't fix that;
an agent *diagnosed* it, fast, and pointed me at `dump1090` instead. That's the right division of
labour.

## Part 4: The LibreSDR B220 — the board I couldn't afford as a student

This is the part that still makes me smile.

As a student I used to read about **Ettus USRP** boards. A B210 was around $2,000 and it might as
well have been a car. It was the reference hardware — 56 MHz of instantaneous bandwidth, 2×2 MIMO,
real UHD drivers, the board every serious paper used. I once spent an afternoon reading its
datasheet and closing tabs.

Then, on Alibaba, for roughly **£250**, I bought a **LibreSDR B220 Mini**: a USRP B210 clone built
on a Xilinx XC7A200T FPGA and an ADI AD9361 RF front end, with a milled aluminium case, USB 3.0, and
— this is the important bit — **UHD compatibility**. Same 70 MHz–6 GHz range, same 56 MHz bandwidth,
same 61.44 MS/s ceiling, same 2×2 MIMO architecture.

It is not a genuine B210 and I don't pretend it is. It's a clone with quirks, and getting it working
was its own education:

- UHD's serial matching parses serials as hexadecimal. This clone's serial (`S9M3OXJ`) isn't hex, so
  discovery fails and you get `No devices found` even though `uhd_find_devices` can see it. The
  workaround is registering it in SDRangel as a **non-discoverable device** with the argument
  `type=b200`.
- The FPGA image matters. The stock `usrp_b210_fpga.bin` isn't right for this board; it needs the
  LibreSDR-specific bitstream, and B210-mini and B220-mini images are not interchangeable.
- `TX/RX` and `RX2` are different ports with different characteristics. Receive on the wrong one and
  you'll conclude your radio is deaf when you've just plugged into a worse front end.

Once it ran, it ran beautifully. 2.048 MS/s on DAB block 11D, 1.6 MHz low-pass, 40 dB of manual gain:
`sync 1`, zero re-acquisitions, zero bit errors, 31 services, audio locked. A board that cost less
than a mid-range phone doing exactly what a £1,600 radio does.

That's not "professional league" in the sense of owning the best hardware. It's professional in the
sense that I now have the *capability* — bandwidth, dynamic range, a real driver stack, MIMO — and
capability is what actually moves you forward. The expensive board never was the point; the
instrument-grade front end was, and the clone delivers most of it.

## Part 5: What I've actually decoded

Hardware is proxy. Here's the scoreboard that matters, all measured on this desk in Limehouse:

| Band | Signal | Result |
|---|---|---|
| 174–240 MHz | DAB ensemble 11D (222.064 MHz) | Locked, CN 26–29 dB, **0 bit errors**, 31 services |
| 88–108 MHz | FM broadcast + RDS | PI codes decoded: BBC R2 `C202`, BBC R3 `C203`, Classic FM `C2A1`, Capital `C479` |
| 118–137 MHz | Airband AM | Four ATC carriers found; ground-level traffic below the noise on a whip |
| 156–162 MHz | Marine VHF / AIS | Nothing above the floor — antenna, not the radio |
| 430–440 MHz | Amateur / ISM | Bursts captured; 433.92 devices confirmed intermittent |
| 446 MHz | PMR446 | Quiet at the times tested — this band is a timing problem, not a tuning one |
| 868 MHz | ISM | 1 Hz periodic 6 ms beacon at 868.33, ~300 kHz wide — **not** LoRa |
| 1090 MHz | ADS-B | `dump1090` tracking live aircraft: altitude, speed, track |

The 868 MHz thread is the most instructive. I was convinced I'd found LoRa: wide bursts, right
band, tidy spacing. Then proper measurement showed a **one-second period, dead on 0.999 s median**,
6 ms bursts, and no sync word matching at any spreading factor from 7 to 12. A LoRa node
transmitting once a second would be at 100% duty cycle; the band allows 1%. It's a meter or a
sensor beacon, not a chirp network. I installed `gr-lora_sdr` in WSL, verified it end-to-end with its
own Tx→Rx loopback (`CRC valid!`), and it still correctly refused to decode a signal that isn't LoRa.

The lesson cost me an evening and was worth every minute: **a spectrum peak is not an identity.**
Identity comes from a decode. Everything else is a hypothesis.

## Part 6: Antennas > radios

The least glamorous and most decisive thing I've learned. I have a small box of antennas and every
one of them is a compromise. The physics is boringly simple — a quarter wave at 868 MHz is 8.6 cm,
at 156 MHz it's 48 cm, at 1090 MHz it's 6.9 cm — and the telescope whip I keep extended to 75 cm is
2.2 wavelengths at 868 MHz, which is exactly as inefficient as it sounds.

The honest result from my own bench: on DAB at 222 MHz, a 10 cm stub was only 3 dB behind the 75 cm
whip, because a 100 kW transmitter forgives everything. On marine VHF and airband, the long whip is
the only thing that works and it *still* isn't enough — a gain sweep through 40 dB down to 0 dB
showed the floor falling perfectly linearly, which means no overload, no blocking, just a signal
below the noise of an indoor antenna. The fix isn't a better radio. It's a metre of wire outside
the glass, or a walk to the river.

## Part 7: Now — private 5G and the next frontier

Which brings me to why the B220 matters beyond decoding DAB.

A USRP B210 is the canonical front end for **srsRAN** and **Open5GS** — the open-source 5G NR stack.
The standard "build your own 5G network" project is: a B210-class radio, a small core network, a
programmable SIM, and a laptop with too many terminals open. A £250 clone that speaks UHD opens that
door at a price a hobbyist can justify, and it's the same door every 5G security researcher walks
through.

What I want to do next is build the lab and then break it properly, because you cannot understand
5G security from diagrams:

- **Stand up a private network** — Open5GS core, srsRAN gNB on the B220, a test USIM I control, and
  5G SA in a shielded or licensed environment. Everything on hardware I own, on spectrum I'm allowed
  to use.
- **Then study the security properties hands-on**: how SUCI conceals the subscriber identity and
  where that breaks down; how the GTP-U user plane can be abused if a core is exposed; what network
  slicing actually isolates and what it doesn't; how O-RAN's open interfaces change the threat model;
  what a rogue gNB can learn from a phone that trusts it too readily.
- **And eventually take it apart at the RF level** — the B220 with real bandwidth is the right tool
  for looking at reference signals and control channels rather than treating the air interface as a
  black box.

To be explicit about the boundary, because it matters in this field: all of that is lab work on my
own equipment and spectrum. 5G research is legitimate; pointing a rogue gNB at other people's phones
is not, and it's a criminal offence in the UK regardless of intent. The whole point of building the
lab is that you never need to touch someone else's network to learn how it fails.

## What I'd tell my student self

The barriers I imagined were never the real ones.

I thought the thing standing between me and "doing real radio" was money — that a £2,000 USRP was
the entry ticket and everything before it was toys. It wasn't. The RTL-SDR decoded aircraft
transponders and RDS subcarriers; the HackRF taught me about dynamic range the hard way; the clone
gave me 56 MHz of bandwidth for the price of a graphics card. Every step was capable of real work.

The actual barriers were always **time, curiosity, and the discipline to measure instead of guess**.
The single biggest upgrade to my radio setup in ten years wasn't a board. It was learning to hold a
spectrum peak until a decoder confirms it — and, recently, having an agent that can hold the
measurement for me while I think about what it means.

If you're a student reading this with a £25 dongle and a telescopic whip, you already have enough
hardware to learn almost everything that matters. Point it at the sky, decode something, and write
down what you measured. The expensive board can wait — it always could.
