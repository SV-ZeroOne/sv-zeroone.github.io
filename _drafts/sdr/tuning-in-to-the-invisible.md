---
author: zero
title: "Tuning In to the Invisible: An Evening and a Day Exploring the Airwaves with Software-Defined Radio"
tags: sdr radio rtl-sdr hackrf adsb airband homelab ai
---

The air around you is never quiet. Right now it is full of music, aircraft announcing where they are, weather sensors reporting the temperature, car key fobs, walkie-talkies, satellites and a fog of electrical noise from every gadget in your home. You can't see or hear any of it, but with a £40 USB stick and some free software you can. I spent an evening and a day tuning in with two software-defined radios and an AI assistant at my side. This post is about what's out there, what you can do with it, and the lessons I learned along the way, including the many things that didn't work the first time.

## A room full of voices

Imagine standing in a huge, dark hall where thousands of people are talking at once, each at a different pitch. Some shout, some whisper, some repeat the same sentence forever, and some only speak for half a second every few minutes. That hall is the radio spectrum, and "pitch" is frequency.

A normal radio is a person in that hall who can only listen to one pitch range and only understands one language. Your car radio understands FM music between 88 and 108 MHz and nothing else. Your phone understands mobile networks. Your TV understands television.

A **software-defined radio (SDR)** is different. It doesn't understand anything on its own. It just listens to a slice of the hall, turns what it hears into numbers and hands them to your computer. Software then decides what language to interpret them in: FM music, aircraft data, weather sensors, voice. Swap the software and the same small device becomes a completely different radio.

The first thing an SDR shows you is not sound but a picture called a **waterfall**. Frequency runs left to right, time flows from the top down, and brightness shows signal strength. An FM radio station is a wide, bright stripe. A walkie-talkie is a short dash that appears when someone presses the button. A key fob is a single blip. Noise is the speckled background. After a few minutes you start reading the waterfall the way you'd read a busy street from a window.

## The kit

| What | Why |
|---|---|
| **NooElec NESDR Mini 2** (about £40) | A tiny USB stick built around a chip originally designed for digital TV. It receives roughly 25 MHz to 1.75 GHz. This is the classic "RTL-SDR" that most people start with. |
| **HackRF One** (a few hundred pounds) | A more capable radio that covers 1 MHz to 6 GHz and can see a wider slice at once. It can also *transmit*, which comes with real legal responsibility (more below). I kept it receive-only. |
| **Antennas** | The stick's little telescopic whip, a telescopic ANT500 for the HackRF and a bag of cheap magnetic-base antennas. |
| **SDRangel** | Free, open-source software that drives both radios, shows the waterfall and includes decoders for dozens of signal types. |
| **An AI assistant** | Claude Code helped me research, plan, debug and run experiments. I also connected a local model (Qwen3.8 27B, running on my own hardware via the Hermes agent) to the radio so it can tune and read decoders itself. |

## Night one: getting it to talk

Every SDR story starts with a fight with drivers, and mine was no exception.

On Windows the stick shows up as a TV tuner, and you have to replace its driver with a generic one using a small tool called Zadig. The stick appears as *two* devices, "Interface 0" and "Interface 1", and the guides say clearly to pick Interface 0. I picked Interface 1. The test tool replied with `usb_claim_interface error -12`, which is radio-speak for "you picked the wrong one". Two minutes later it was fixed and the stick reported its tuner chip.

The second discovery was more interesting. These cheap sticks have an inexpensive crystal inside that keeps time, and it is slightly fast or slow. Mine runs **19 parts per million** fast. That sounds tiny, but at 100 MHz it means everything appears about 1.9 kHz away from where it should be, and at 1 GHz about 19 kHz. It's like a watch that gains a few seconds a day: fine for telling roughly what time it is, but you need to correct it if you care about precision. I let a measurement tool run for twenty minutes while the stick warmed up, then entered +19 as a correction. From then on, stations landed where they should.

## First sounds: music, and the data hidden inside it

The obvious first test is FM radio. I tuned to the middle of the FM band and saw eight stations as bright humps on the screen, a few of them towering 30 dB above the noise. I clicked on one and music came out of my speakers through a USB stick and a pile of software. It's a strangely satisfying moment.

FM stations also carry a hidden data stream called **RDS**, which is how a car radio shows the station name and the song title. It sits just above the audio, much quieter than the music, and this is where I learned the first big lesson.

I had turned the gain (the radio's amplification) up high, because surely more is better. The music sounded fine. The RDS decoder recovered almost nothing. When I turned the gain *down*, from 44 dB to around 25–30 dB, the data started coming through: a station code, a programme type of "Light Classics" and fragments of the song text. The radio had been overloaded. Strong stations were being amplified so much that they distorted, and the delicate data was the first thing to break.

> **Audio that sounds fine is not proof that the signal is clean.** Data is more fragile than your ears.

Two smaller fixes helped too. Widening the channel filter from 180 to 200 kHz stopped it clipping the edges of the signal, where RDS lives. And switching from stereo to mono removed most of the background hiss, because stereo FM needs a much stronger signal to sound clean.

## Aircraft that tell you where they are

Most passenger aircraft continuously broadcast a short digital message on 1090 MHz called **ADS-B**: who they are, where they are, how high, how fast. It's how flight-tracking websites work, and a £40 stick can receive it.

At half past eleven at night I saw nothing at all. I assumed I had broken something. The next afternoon, with the same stick, the same tiny antenna and the same settings, the screen filled with **eleven or twelve aircraft at once**. They had callsigns, altitudes and positions, many of them descending at 2,000 to 6,000 feet. I live near London, under the approach to Heathrow, and the radio was hearing the queue of aircraft lining up to land.

Nothing was wrong the night before. There just weren't many planes in the sky.

> **Time of day matters as much as any setting.** Before you change anything, ask whether there's anything to hear right now.

## Adding a second radio, and chasing the noise

With the stick on aircraft duty, I connected the HackRF and pointed it at FM radio. This turned into the longest and most humbling part of the day.

The music was fine, but RDS refused to decode. So, with the AI assistant controlling the radio through SDRangel's programming interface, I ran **gain sweeps**: twelve combinations of the HackRF's two amplifier stages, each measured for signal strength and data quality, in about two minutes. Then I swapped antennas, extended them, moved them, swapped USB cables and swept again. Twenty-four combinations later, the data quality sat stubbornly between 2 and 9 percent every time. The stereo pilot tone was rock-solid throughout.

That result is itself the lesson. When the signal is strong and steady but the fine detail is ruined, **gain isn't the problem**. Something in the environment is: reflections bouncing off buildings that blur the signal, or local electrical noise. No setting can fix that. Only position, distance or time of day can.

Along the way I collected a set of small, surprising lessons about antennas:

- **Location beats antenna, and antenna beats gain.** Moving the HackRF and its antenna from my desk to the window sill gave more improvement than any amount of fiddling with settings.
- **Your body is part of the antenna.** Just holding the base of an antenna changed the signal strength by 10 dB.
- **Don't improvise a ground plane with kitchen foil.** Magnetic-base antennas are designed to sit on a car roof, so I put foil under one. The signal dropped by 15 to 22 dB, because the foil was touching the antenna itself. Lifting it off restored everything instantly.
- **Antenna length matters.** A telescopic antenna works best at about a quarter of the wavelength you're listening to: roughly 71 cm for FM radio, 60 cm for aircraft voice and 7 cm for aircraft data at 1090 MHz.

And some lessons about noise, because once you can see radio, you discover how much of it you make yourself:

- A narrow line wobbling near 99.6 MHz in the waterfall wasn't a station. It was a switching power supply or monitor somewhere nearby, leaking radio energy.
- The HackRF itself draws neat, evenly spaced vertical lines across its own waterfall, plus carriers at exact whole numbers of megahertz such as 128.000 and 130.000 MHz. Those are its own internal clocks, not signals from outside.
- Most SDRs show a spike exactly in the middle of the screen. It's an artefact of how they work, so you learn to tune your target slightly off-centre.

## Voices in the sky

Air traffic control uses old-fashioned AM radio between 118 and 137 MHz. I set the HackRF to watch a 4 MHz slice of that band at once. I set up four channels in parallel, all muted, and had the computer log how busy each one was for ninety seconds. One frequency used by the Heathrow approach controllers was active 9 percent of the time, with signals 30 dB above the noise. The others were quiet in that window.

What surprised me was *who* I could hear. The recorded weather broadcast for the airport, which transmits non-stop, was too weak to receive at all from my window. The aircraft passing overhead, a few thousand feet up with nothing in the way, were by far the strongest signals. Height beats power: a small transmitter in the sky with a clear line of sight reaches much further than a bigger one on the ground behind buildings.

A small practical trap: UK aviation charts now list "channel names" for a newer, tighter channel spacing, so a frequency printed as 118.505 is actually transmitted on 118.500 MHz. Tune to the real frequency, not the label.

## What I couldn't hear, and shouldn't

Plenty of people buy an SDR hoping to listen to police, fire or ambulance radio. In the UK you can't, and you shouldn't try. The emergency services use a digital, encrypted network, and decrypting it would be a serious offence. When I scanned the obvious bands, the things I found were amateur radio frequencies (quiet at that moment), licence-free walkie-talkie channels (also quiet) and the chirps of key fobs and wireless sensors around 433 MHz.

Which brings me to the important part.

## Listening responsibly

Radio is open in the sense that it reaches everyone, but the law doesn't treat everything you can receive as yours to listen to. In the UK:

- **You don't need a licence to own or use a receiver**, as long as it can't transmit.
- Ofcom's guidance is that receivers should only be used for **"general reception"**: licensed broadcasts (like FM radio), amateur and CB radio, and weather and navigation transmissions.
- [Section 48 of the Wireless Telegraphy Act 2006](https://www.legislation.gov.uk/ukpga/2006/36/section/48) makes it an offence to use radio equipment **intending to find out the contents of a message that wasn't meant for you**, and a separate offence to **pass that information on**.

In practice this means music, amateur radio and broadcast data are fine. Airband voice, marine radio and business radio fall outside "general reception", and even though many hobbyists listen, you should know that's where the line is. Whatever you hear, never repeat it, publish it or act on it. Other countries have their own rules, so check yours before you start.

If your SDR can transmit, as the HackRF can, transmitting without the right licence is a separate and much more serious matter. It can interfere with services people depend on. Keep it receive-only unless you're licensed. An amateur radio licence is a good way to unlock that legally.

## Letting an AI help

I didn't do this alone. An AI assistant researched the hardware, wrote the plan, talked me through the driver problems and, once SDRangel's programming interface was switched on, ran experiments that would have taken me hours by hand: the gain sweeps, a band scan stepping through 161 frequencies, and the four-channel activity monitor that found the busy air traffic frequency.

I also wired a local AI model running on my own computer to the radio, through a small bridge program that turns SDRangel's controls into tools the model can call. That came with its own lessons:

- **Give the AI a short list of safe tools.** The bridge offers 93 actions, including ones that shut the software down or change its configuration. My local model gets 25: tune, read reports, add receive channels, load presets. Nothing that transmits, nothing destructive.
- **Trust, but verify.** Once, the radio's interface replied "OK" to a retune and silently didn't apply it. The rule I wrote for the AI is: after every change, read the setting back.
- **Write down what you learn.** Every lesson in this post is now in a notes file that the local model reads before it touches the radio. It knows that more gain isn't always better and that the stick runs 19 ppm fast, so we don't have to learn those things twice.

The goal isn't to let a machine listen for me. It's to have a patient lab assistant that can run the boring measurements, explain what a strange shape in the waterfall might be, and remember what we found last time.

## What you can do with an SDR

Here's a taste of what's out there, almost all of it within reach of a £40 stick and a reasonable antenna:

- **FM and DAB radio**, including the station data hidden alongside the music.
- **Aircraft tracking (ADS-B, 1090 MHz).** Build your own live flight map, and if you like, share your data with community tracking sites.
- **Ships (AIS, around 162 MHz)** if you live near the coast or a big river.
- **Weather balloons (radiosondes, 400–406 MHz)**, launched twice a day by weather services. Some people track them and go and find where they land.
- **Weather satellites.** Russia's Meteor satellites send pictures of the Earth around 137 MHz that you can decode with free software such as SatDump. (The older American NOAA satellites that beginners used to start with were retired in 2025.)
- **Home sensors (433 and 868 MHz).** Weather stations, tyre-pressure sensors and doorbells, decoded by a tool called rtl_433.
- **Amateur radio**, from local repeaters to the International Space Station, which sometimes sends picture transmissions down to anyone listening.
- **Shortwave and long-distance radio** below 30 MHz, with a radio like the HackRF or an add-on converter for the stick.
- **Radio astronomy.** Hydrogen gas in our galaxy glows at 1420 MHz, and with a home-made horn antenna and an amplifier you can detect the Milky Way.
- **Hunting interference.** Once you can see radio, you can find the noisy power supply that's ruining your reception.

## The lessons, in one place

1. **The driver step trips everyone up.** On Windows, use Zadig on Interface 0.
2. **Cheap radios have slightly wrong clocks.** Measure the error once and correct it.
3. **More gain is not better.** Too much overloads the radio. Turn it up until the noise floor rises a little, then stop.
4. **Sound quality is not data quality.** Data breaks first.
5. **Location beats antenna, and antenna beats gain.** A window beats a desk. Your body and nearby metal are part of the antenna.
6. **Check whether there's anything to hear.** Planes at midnight are rare, and a sweep is a snapshot. Bursty signals need patient monitoring.
7. **You make noise too.** Power supplies, monitors and the radio itself all draw lines on your waterfall.
8. **The strongest signals aren't always the most powerful transmitters.** Height and line of sight win.
9. **Not everything is yours to hear.** Learn the rules where you live, and never pass on what you overhear.
10. **Let computers do the tedious parts, but verify them.** Automation found things in minutes, and once said "done" when it wasn't.

## Getting started for under £50

1. Buy an RTL-SDR stick (NooElec NESDR or RTL-SDR Blog V4 are popular). Many come with a small antenna kit.
2. Install free software: SDRangel, SDR++ or SDR# on Windows; on Linux and macOS most of these work too.
3. On Windows, run Zadig and install the WinUSB driver on Interface 0.
4. Tune to FM radio first. Seeing the stations on the waterfall and hearing one is the "hello world" of SDR.
5. Then put the antenna in a window during the day, tune to 1090 MHz and watch the aircraft appear.

After that, follow your curiosity. The hall is full of voices. Most of them are just noise, some are none of your business, and a surprising number are quietly broadcasting fascinating things to anyone who cares to listen.
