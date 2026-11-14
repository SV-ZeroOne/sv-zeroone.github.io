---
author: zero
title: "The £250 USRP and the Sky I'm Still Chasing"
tags: sdr radio usrp b220 libresdr satellite meteor antenna lna homelab
---

Last time I left you in a dark hall full of voices, with a £40 stick and a few hundred-pound
radio, having learned that the air is never quiet. Since then two things have happened. A third
radio joined the desk — and it is a different animal entirely — and I set my sights on the sky.
This post is about both: the new board, why it is a bargain, what it took to get it talking, and
an honest report on my attempts to receive weather-satellite pictures so far. They have not worked
yet. I will tell you why, and what I am buying to fix it. And because the failure is, in the end,
an antenna story, I will spend a section on antennas, because they matter more than any radio.

## The third radio: a USRP for the price of a phone

As a student I used to read about **Ettus USRP** radios. A B210 cost about **$2,000**. It was the
reference hardware — the board in every research paper, the one everyone said you needed to "do
real radio". I read its spec sheet and closed the tab, the way you close the tab on a car you
can't afford.

Then I found a **LibreSDR B220 Mini** on Alibaba for about **£250**. It is a clone of that same
USRP B210/B220 board, built in China in a CNC-milled aluminium case, 0.5 kg, USB 3.0 Type-C, with
a small LED panel that tells you its power, clock and receive state. Inside: a Xilinx **XC7A200T
FPGA** and an **ADI AD9361** RF front end — the same fundamental architecture as the expensive
board, and, crucially, it speaks **UHD**, the same Universal Hardware Driver that drives a genuine
Ettus.

Here is how it sits next to the two radios from last time:

| | RTL-SDR stick | HackRF One | **B220 Mini** |
|---|---|---|---|
| Frequency range | 24 MHz – 1.766 GHz | 1 MHz – 6 GHz | **70 MHz – 6 GHz** |
| Sample rate | 2.4 MS/s | 20 MS/s | **61.44 MS/s** |
| Chains | 1 | 1 | **2×2 MIMO** |
| Front end | basic | basic, 8-bit | **AD9361, much lower noise floor** |
| Time sync | none | none | **PPS / 10 MHz reference input** |
| Driver | rtlsdr | hackrf | **UHD** |

Why is that a bargain? Because the expensive things are in the cheap things:

- **56 MHz of instantaneous bandwidth.** The HackRF sees a slice; the B220 sees a *wall* of the
  hall at once. Three times the sample rate of the HackRF, and a front end with a far lower noise
  floor and better dynamic range than an 8-bit converter.
- **2×2 MIMO.** Two transmit chains and two receive chains. That is the architecture that makes a
  radio a *measurement instrument* instead of a toy.
- **PPS and 10 MHz sync.** You can lock the radio's clock to an external reference and align it in
  time with another radio. That is what separates "I saw a blip" from "I measured a signal".
- **UHD compatibility.** The whole professional ecosystem works with it: GNU Radio, SDRangel,
  MATLAB, LabVIEW, `gnss-sdr`, drone-identification tools, and **OpenAirInterface** — the open 5G
  protocol stack. A £2,000 radio is a status symbol. A £250 clone is a capability.

What you lose: it cannot go below 70 MHz (no AM broadcast band — the HackRF still covers that),
and on Windows it runs at roughly half the performance of Linux, with demodulation stalling above
about 16 MS/s. Neither of those matters for what I do, and Linux is one USB cable away.

## Getting it to talk

It was not plug-and-play, and the setup was its own education:

- Before the UHD driver is installed, it enumerates as a **"WestBridge"** device — and with a
  custom vendor ID (`2500`), not the one the documentation implies. After the driver binds it, it
  appears as "Ettus Research LLC B200/B210", which is a nice touch.
- The **stock FPGA image is wrong for this board.** It needs the B220-Mini-specific bitstream, and
  the B210-mini and B220-mini images are *not* interchangeable. Swap the wrong file and nothing
  works, with no error that tells you why.
- The fun one: **the serial number bug.** This clone's serial is `S9M3OXJ`. UHD matches serials by
  parsing them as *hexadecimal* — and S, O, X and J are not hex digits. So the matching throws an
  exception, UHD reports "No devices found", and the radio is invisible to anything that filters by
  serial, even though `uhd_find_devices` can see it plainly. The workaround: register it in
  SDRangel as a **non-discoverable device** with the argument `type=b200`. I wrote the whole bug
  up for the upstream issue tracker, because a non-hex serial can *never* match, and every clone
  owner will hit this.
- And a quiet trap: **TX/RX and RX2 are different ports with different front ends.** Plug into the
  wrong one and you will conclude your radio is deaf when you have simply chosen the worse path.

Once it ran, it ran beautifully: 2.048 MS/s on DAB, 1.6 MHz low-pass, 40 dB of manual gain —
locked, zero re-acquisitions, **zero bit errors, 31 services, audio clean**. A board that cost
less than a mid-range phone, doing exactly what a $2,000 radio does.

## The sky: weather satellites

The reason I am chasing the sky is that the old beginner's path closed. The **NOAA APT**
satellites — the ones every "receive your first satellite picture" guide pointed at — were retired
in 2025. The 137.6 MHz band is empty. The only weather-satellite path left is Russia's **Meteor M2
LRPT** stream, and it is actually a nicer signal to decode: digital, with built-in error
correction, so a sufficient signal gives you a *clean* picture — no banding, no fading, no snow.
A marginal one gives you a black line where the signal dropped, not a ruined image.

The target is **M2-4**: 137.9 MHz (137.1 as backup), OQPSK at 72 kbit/s, 100 kHz wide, polarised
right-hand circular, flying polar at about 800 km — two passes over me a day, at roughly the same
solar time. (M2-2 is dead for our purposes — a micrometeorite collision compromised its power —
and M2-3 has a partially deployed antenna that makes its signal fade badly, so M2-4 is the one to
work with. The next launches are M2-5 in 2027 and M2-6 in 2028.)

My setup: the B220 records the pass with SDRangel (SatDump's live recorder crashes on this radio,
so we capture and decode offline with SatDump), and I predict passes with a small Python script off
a fresh TLE. Straightforward in principle.

The result, after three M2-4 passes (elevations 51°, 89° and 69°) and two live checks, is the
honest one: **it did not work.**

The waterfall showed a *fixed interferer, not the satellite*. The same spike, about 55 dB up, sat at
the same offset from centre on every pass, at every elevation, and the band's average was a flat
~7 dB whether the satellite was low or overhead. I escalated the gain 40 → 60 → 80 dB and watched
the signal move 0.4 → 2.3 → 4.0 dB. Still short of the 10+ dB the decoder needs. SatDump's
verdict: Viterbi **NOSYNC**, BER 0.415, **zero frames, no image**.

> **The satellite was there. My front end was not sensitive enough.**
> That is the good kind of failure — it tells you exactly what to buy.

## The fix: a filter, an amplifier, a longer piece of wire

Two things are coming, and they are not the radio:

1. **A 137 MHz SAW-filtered LNA** (ordered, arriving). This is the important purchase, and the
   reason it is a *filtered* amplifier: 137 MHz in an inhabited area is a soup of local
   interference — switching power supplies, LED drivers, powerline communications. A wideband
   booster (I have a 20 dB one) amplifies the signal *and the soup*. A SAW filter cuts everything
   except the 137 MHz band *before* the amplification, so the gain works on the satellite instead
   of on my neighbours' electronics. In a city or a village, a filtered LNA is not a luxury; it
   is the difference between a picture and a black line.
2. **A proper antenna.** The community answer is a **V-dipole** to start — cheap, portable, little
   that can go wrong — and a **QFH** (quad-filar helical) for a permanent station. Either gives
   roughly **10–15 dB over a whip**. There is also a polarisation detail worth knowing: the
   satellite transmits right-hand *circularly*, and a linear dipole is about 3 dB behind an ideal
   circular antenna. That is one reason the QFH is the "proper" long-term answer.

## Why antennas matter more than radios

The physics is boringly simple, and it is worth writing down because it explains everything above.
A whip works best at about a **quarter of the wavelength** it is meant to catch:

- 137 MHz (satellite) → about **55 cm**
- 868 MHz (ISM) → about **8.6 cm**
- 1090 MHz (aircraft) → about **6.9 cm**

My collection so far is a small box of compromises, all SMA:

| Antenna | Length | ¼-wave ~ | Best for |
|---|---|---|---|
| Telescopic rod | ~47 cm | ~159 MHz | VHF low: DAB, FM, **APT 137 MHz** |
| Magnetic whip | ~18 cm | ~417 MHz | UHF low |
| Two spring whips | ~14 cm | ~536 MHz | UHF (a possible MIMO pair for the B220) |
| Wire whip | ~16 cm | ~469 MHz | UHF |
| Rubber duck | ~10 cm | ~750 MHz | UHF high |
| 20 dB booster (50 MHz–6 GHz) | — | — | Weak/distant signals only — it is not a true LNA, so strong local signals clip |

Two details from the box that matter in practice. First, the SMA antennas plug straight into the
HackRF and the B220, but the RTL stick is **MCX, not SMA** — a pigtail adapter is on order, until
then the stick uses its stock whip. Second, I A/B tested the telescopic whip at 137 MHz: **55 cm
is the sweet spot** (the resonant length), 75 cm is slightly *worse*, and 100 cm is unlikely to
help. An antenna is a resonant object, not a "bigger is better" object.

And the hierarchy from last time still holds, in exactly the same order: **location beats antenna,
and antenna beats gain.** For a satellite, line-of-sight is the number-one parameter — above the
antenna, above the radio, above the software. A window beats a desk, a field beats a window, and a
metre of wire outside the glass beats forty decibels of gain inside it.

> **The radio decides which slice of the hall you hear. The antenna decides whether you hear
> anything at all.**

## What's next

- The LNA arrives, and the next M2-4 pass gets retested with the 55 cm whip first, then the
  V-dipole when it is built (3 mm aluminium rods, clamped to a coax — a Saturday afternoon's
  project).
- If the picture comes, the follow-up post will be the one everyone expects: Earth, from 800 km,
  through a £250 radio and a piece of wire in my garden.
- If it still fails, the next step is the location: a field, a hill, somewhere the 137 MHz soup
  thins out. The decode will tell me which one it is.
- And behind all of that, the reason the B220 mattered: with 56 MHz of bandwidth and a real UHD
  stack, the **private 5G lab** moves from "someday" to "this winter". The board that cost a
  phone is the standard front end for an open 5G network, and I intend to build one and then break
  it properly, on my own spectrum, under a licence.

The $2,000 board was never the point. It is the capability that is — and capability, it turns out,
is now £250. The sky is the same lesson in a different band: a failed pass is not a wall, it is a
parts list. A filter, an amplifier, a longer piece of wire. I know exactly what is missing now,
which is more than I knew in October.
