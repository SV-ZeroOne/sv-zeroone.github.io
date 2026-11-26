# NEO-X1 Pro build photos: what each picture shows

Working note for the NEO-X1 Pro series. It is listed in `exclude` in `_config.yml`, so it is not published.

The 29 pictures were picked by the owner on 2026-11-20 and live outside this repo in
`C:/Users/Neo/Pictures/NeoX1Pro/Selected`. This file says what each one shows, what has to be fixed
before it goes on the site, and where it could be used.

**How this was produced.** Every picture was looked at twice, independently: once by a Claude subagent
and once by Antigravity (Gemini). Both were told to treat the filename as a claim to check, not as the
answer. They agreed on the main subject of all 29. Where they disagreed, the picture was checked again
by eye, and the outcome is under [Corrections and open questions](#corrections-and-open-questions).
Their full notes are in `Claude_Projects/tmp/neox1-blog/` (`image-notes-claude-agent.md`,
`image-notes-antigravity.md`). That folder is git-ignored, and it must stay that way: those notes
transcribe serial numbers. No serial number is written in this file.

## True of all 29

- **No location data.** None of the files carries GPS tags. Most have already had their metadata stripped.
- **Three depend on a rotation tag** (14, 17 and 18). They only display the right way up because of
  an EXIF tag. Rotate the pixels when exporting. If the tag is stripped without doing that, they turn
  sideways or upside down.
- **They are reduced copies**, 900 to 1,900 px wide. That suits a text column. Picture 29 is only 903 px
  wide. Larger versions of the same shots are in the parent folder (272 pictures, 193 of them from September).
- **No faces, reflections of people, postal addresses or courier labels** were seen in any picture.
- **Strongest five:** 28 (four cards powered on), 9 (3090 beside R9700), 10 (3090 on the dock on the PC),
  20 (the switch card) and 18 (the OCuLink adapter fitted).

Columns: **Use** is the recommendation (Use, Maybe, Skip). **Part** is the proposed series part
(see [Proposed use by part](#proposed-use-by-part-not-agreed-yet)). The name after the arrow is a
suggested web filename under `assets/images/neox1/build/`.

## 1. The first R9700 and an eGPU dock (18 to 26 August)

From the rig notes: this is the R9700 running on the AOOSTAR dock from the MSI GS75 laptop over
Thunderbolt 3, the single-card tuning testbed before the NEO-X1 Pro arrived.

| # | File | What it shows | Before publishing | Use | Part |
|---|---|---|---|---|---|
| 1 | `20260818_191436_r9700_frontbox.jpg` (1442x714) → `01-r9700-box.jpg` | Front of the Gigabyte Radeon AI PRO R9700 AI TOP 32 GB retail box, square-on. | Nothing. | Maybe. Little information; fine as a small "it arrives" picture. | 2 |
| 2 | `20260825_231041_r9700_gpu_front_blower_fan.jpg` (1382x797) → `02-r9700-fan-side.jpg` | The R9700 out of its box, fan side up: silver shroud, one blower fan with the AI TOP hub, edge-connector cover still on. A hand holds it at the left edge. | Crop the hand if wanted. | Use | 2 |
| 3 | `20260825_231050_r9700_back_gpu_fan_hole_blocked_why.jpg` (1661x733) → `03-r9700-backplate.jpg` | The R9700's backplate. The label reads GV-R9700AI TOP-32GD rev 1.1. The round opening behind the fan is mostly closed off by a plate, which is the "why" in the filename. | **Blur the serial number and barcodes** (label, centre-left). | Use. It proves the model and sets up the cooling question. | 2 |
| 4 | `20260825_231355_r9700_egpu_aoostar_tb5_oculink.jpg` (1080x808) → `04-r9700-on-dock-night.jpg` | The R9700 standing on a silver box-shaped eGPU dock at night, card logo lit. Dock front: power button, one OCuLink port, two USB-C ports with warning labels. No data cable plugged in. | Nothing. Soft and noisy. | Skip. Picture 5 is the better version. | - |
| 5 | `20260826_155532_r9700_egpu_aoostar_tb5_oculink.jpg` (1080x1029) → `05-r9700-on-dock-thunderbolt.jpg` | The same card and dock in daylight, dock powered, a USB-C cable marked 80Gbps plugged in. Two laptops are partly in frame (one lid reads Legion). | Crop the laptops if wanted. | Use | 3 |

## 2. An RTX 3090 arrives and meets the NEO-X1 Pro (30 August to 2 September)

| # | File | What it shows | Before publishing | Use | Part |
|---|---|---|---|---|---|
| 6 | `20260830_222515_ebay_luck_deal_brand_new_asus_3090_box.jpg` (1684x929) → `06-rtx3090-box-front.jpg` | Front of the ASUS TUF Gaming GeForce RTX 3090 OC Edition 24GB retail box. Corners lightly scuffed. | Nothing. | Maybe | 2 |
| 7 | `20260830_222528-asus_3090_back_box.jpg` (1665x930) → `07-rtx3090-box-back.jpg` | Back of the same box: marketing panels, port diagram, model code TUF-RTX3090-O24G-GAMING. | Nothing (manufacturer QR code only). | Skip. A wall of small print. | - |
| 8 | `20260830_222809_asus_tuf_gamming_3090_gpu_front_cooler.jpg` (1471x705) → `08-rtx3090-fan-side.jpg` | The 3090 fan side up on its anti-static bag, protective film still on the shroud. | Nothing. | Maybe. Picture 9 covers the card; keep this one if the "film still on" detail matters to the eBay story. | 2 |
| 9 | `20260830_222937_3090_vs_r9700.jpg` (1207x1014) → `09-rtx3090-vs-r9700.jpg` | The 3090 (top) and the R9700 (bottom) side by side, fan sides up, for size: a triple-fan open cooler against a single blower. | Nothing. | **Use.** One of the strongest pictures. | 2 |
| 10 | `20260902_154707_3090_testing_egpu_dock.jpg` (1048x1620) → `10-rtx3090-on-dock-on-neox1.jpg` | The 3090 standing in the silver dock, which sits on the lime-green top of the NEO-X1 Pro between its carry handles. Two 8-pin power leads go to the card. Daylight. | Nothing. | **Use.** Clean, and the PC is instantly recognisable. | 1 |
| 11 | `20260902_154740_3090_testing_egpu_back_neox1_pro_buttom.jpg` (965x1822) → `11-rtx3090-on-dock-neox1-open.jpg` | The same stack from the other side: the 3090's backplate, the dock's rear power sockets, and the NEO-X1 Pro with its side panel off, showing the radiator and fan frame. An AMD Ryzen 9 HX3D sticker and the GMKtec logo are on the case. A dark box stands at the lower left. | Small labels on the dock and card are unreadable at this size. | Use | 1 |

## 3. Inside the NEO-X1 Pro: the RTX 5070, the slots and OCuLink (3 September)

From the rig notes: on this day the PCIe audit measured one R9700 directly in the x16 slot at Gen5 x16
(54.2 GB/s host to card). The same card through the CEACENT card over OCuLink managed 3.56 GB/s. The
M.2 adapter in M.2_2 did not enumerate that day.

| # | File | What it shows | Before publishing | Use | Part |
|---|---|---|---|---|---|
| 12 | `20260903_171736_zotac_5070_neox1_pro_gpu.jpg` (1846x904) → `12-rtx5070-fan-side.jpg` | A ZOTAC Gaming dual-fan card loose on the desk mat, fan side up. The PC is not in frame. | Nothing. | Use | 2 |
| 13 | `20260903_171744_zotac_5070_neox1_pro_gpu_back.jpg` (1918x1003) → `13-rtx5070-backplate.jpg` | Its backplate. The label reads ZOTAC GAMING GeForce RTX 5070 Twin Edge OC 12GB. The graphics and label are upside down as shot. | **Blur the serial number, part number and barcodes** (lower right). | Maybe. Only needed to show the model. | 2 |
| 14 | `20260903_171820_neox1_pro_pci_slots_lanes.jpg` (1682x901 once rotated) → `14-neox1-slots.jpg` | The motherboard with the graphics card out. Top to bottom: M.2_1 holding the Crucial 2 TB SSD, the steel-reinforced PCIE X16 (G5) slot, the empty M.2_2 socket, and a PCIE X1 (G4) slot. Both M.2 sockets are stickered "M.2 PCIe 5.0x4". Board label: GMK_NEO-X1_V01-P 20260617. | **Rotation tag (6).** Blur or crop the blue QR sticker (bottom centre). Dark: lift the exposure. | Use. The only picture with all four slot labels readable. | 1 |
| 15 | `20260903_172348_CEACENT_CNOL4PE08_oculink_card_front_pcie.jpg` (1918x1080) → `15-oculink-switch-card-front.jpg` | A green CEACENT PCIe x8 card: heatsink in the middle, four OCuLink sockets on the right. This is the card the rig notes call the PEX8724 switch (PCIe 3.0). | Nothing. | Use | 3 |
| 16 | `20260903_172353 _CEACENT_CNOL4PE08_oculink_card_back_pcie.jpg` (1803x775) → `16-oculink-switch-card-back.jpg` | Its solder side, held in a hand. The label reads CNOL4PE08, "PCIe X8 4Port SFF8611 NVMe adapter". Note the space in the filename. | **Blur the serial number, QR code and barcodes.** Fingers in frame. | Skip, unless the model label is wanted. | - |
| 17 | `20260903_191118_CEACENT_CNOL4PE08_oculink_card_front_pcie_m2_oculink_adapter.jpg` (1080x1771) → `17-oculink-card-and-m2-adapter.jpg` | Flat-lay: the CEACENT card (cut off by the frame), a small black M.2-to-OCuLink adapter marked M2-8612-RA and "Support Up To Gen4", parts bags, a pocket knife, scissors and a phone. | **Rotation tag (3).** Blur the fulfilment sticker (QR code and reference numbers). Cluttered. | Skip. Pictures 15 and 18 show both parts better. | - |
| 18 | `20260903_191741_neox1_pro_mobo_m2_oclulink_adapter_attached.jpg` (1080x1918 once rotated) → `18-neox1-m2-oculink-fitted.jpg` | The M.2-to-OCuLink adapter fitted in M.2_2 with an OCuLink cable latched in, running past the empty x16 slot. The SSD is in M.2_1. | **Rotation tag (6).** | **Use.** Sharp, and it shows exactly how a GPU link leaves an M.2 socket. | 3 |

## 4. The PCIe switch kit (12 to 16 September)

From the rig repo: the saved HWiNFO reports date the steps. 13 September: the old Gen3 switch with two
R9700s. 17 September, 00:17: the new switch with two R9700s. 18 September: two R9700s plus one RTX 3090.

| # | File | What it shows | Before publishing | Use | Part |
|---|---|---|---|---|---|
| 19 | `20260912_143641_Broadcom_PEX88096_pcie_switch_cables_box.jpg` (981x1800) → `19-switch-kit-unboxing.jpg` | Unboxing on a wooden table: the blue switch card in its anti-static bag, one green x16 breakout board on bubble wrap, and bags of sleeved SlimSAS cables. | Nothing readable. Glare on the bags. | Maybe. It shows the whole kit in one picture. | 3 |
| 20 | `20260912_143803_Broadcom_PEX88096_pcie_switch.jpg` (1844x818) → `20-switch-card.jpg` | The switch card out of its bag: a blue full-length x16 card with a blower heatsink, ten SlimSAS sockets lettered A to E in pairs (silkscreen SLIMSAS1 to SLIMSAS10), a three-way DIP switch and its mode table. Board code RBE16A54C-V11A. | Nothing. | **Use.** The best landscape picture in the set. | 3 |
| 21 | `20260913_163910_Broadcom_PEX88096_pcie_switch_modes.jpg` (1080x1395) → `21-switch-mode-table.jpg` | Close-up of the bracket end: DIP switch FS1 with switch 1 on, and the printed table (FS1-1 on = X16, FS1-2 on = X8X8, FS1-3 on = X4X4X4X4). | Nothing. | Use | 3 |
| 22 | `20260913_172516_pcie_x16_slot_adapter_mcio.jpg` (1850x531) → `22-slimsas-breakout-board.jpg` | One breakout board: a PCIe x16 slot on a narrow green board, two SlimSAS inputs (SLIMSAS1, SLIMSAS2), a 6-pin power socket and a fan header. Model label RBS-16G4-2P54 (the last characters could also be read 2PS4). | **Blur the serial number and 2D code** (label, right-hand end). Very wide shape (3.5:1). | Use | 3 |
| 23 | `20260916_232917_initial_2xr9700_testing_on_pcie_switch.jpg` (1062x1701) → `23-two-r9700-first-switch-test.jpg` | First run on the new kit: two R9700s lying flat on the rack's top shelf, each plugged into a breakout board, with cables dropping to the NEO-X1 Pro below. The silver dock sits empty at the left. A portable monitor shows a chat window, HWiNFO and benchmark output. The switch card itself is not in frame. | **Blur the whole screen.** It shows chat titles, message text and a file path containing the Windows user name. Household background. | Use, once the screen is blurred. It is the "first light" picture. | 3 |
| 24 | `20260916_233935_Broadcom_PEX88096_pcie_switch_some_cables_connected.jpg` (1205x900) → `24-switch-four-cables.jpg` | The switch card held up in front of the PC with four SlimSAS cables in the sockets nearest the bracket (A2, A1, B2, B1 by position). Its edge connector is in the air: the card is not in the slot in this picture. | Nothing. | Use | 3 |

## 5. The four-card frame (29 to 30 September)

From the rig notes: 30 September is the four-card baseline. Each card trained Gen4 x16 behind the
switch (28.3 GB/s to an R9700, 26.1 GB/s to a 3090), and 32.2 TB moved in 15 minutes with no errors.

| # | File | What it shows | Before publishing | Use | Part |
|---|---|---|---|---|---|
| 25 | `20260929_210717_4_gpu_external_metal_backet_holder.jpg` (1022x866) → `25-gpu-frame-empty.jpg` | The empty four-card frame on a workbench: black aluminium rails, four upright bracket posts with thumbscrews, brass standoffs for the breakout boards. Tools, newspaper and a sheet of handwritten cable pin-out notes lie around it. | Crop tightly: the handwritten notes, newspaper pages and a card inside the toolbox are readable. | Maybe. Cluttered; picture 26 shows the frame in use. | 3 |
| 26 | `20260930_193129_gpu_external_metal_backet_holder_pcie_mico_adapters.jpg` (1080x1121) → `26-gpu-frame-half-built.jpg` | The frame on top of the rack, half populated: two bare breakout boards on the left (one already cabled), two R9700s standing upright on the right, and the NEO-X1 Pro below with its side open. | Nothing readable. A little dim. | Use. The only picture showing how the cards sit on the breakout boards. | 3 |
| 27 | `20260930_200142_top_view_of_4_gpus_connected.jpg` (1080x1223) → `27-four-gpus-off.jpg` | All four cards upright in the frame, unpowered: two black GeForce RTX cards on the left, two R9700s on the right, the 2000 W power supply at the upper right. | Nothing. Dim and grainy. | Skip. Picture 28 is the same view, powered. | - |
| 28 | `20260930_221440_top_view_of_4_gpus_connected_powered_on.jpg` (1080x1738) → `28-four-gpus-on.jpg` | The same view two hours later with the rig running: TUF logos lit on the two 3090s, the monitor on the Windows lock screen (22:13, Wednesday 30 September), and the Cooler Master X Mighty Platinum 2000 at the right. | Crop the shelf at the very top (boxes, including a WiFi Pineapple). The lock screen shows only the time and date. | **Use.** The strongest picture in the set. | 3, and a candidate series header |

## 6. The whole rig (undated)

| # | File | What it shows | Before publishing | Use | Part |
|---|---|---|---|---|---|
| 29 | `2x3090_2xr9700_1xgmktec_neox1pro.jpeg` (903x1975) → `29-whole-rig-front.jpg` | Front view of the open rack: the NEO-X1 Pro at the bottom lying on its side with its power light on, SlimSAS cables rising to the four cards on the top shelf, the power supply at the right, and a square cooling fan behind the cards. | Crop the sides: household shelves and a toy box are at the edges. Only 903 px wide. | Use, at a small size. The three rack photos already in the post are sharper for a large slot. | 1 or 5 |

## 7. The owner's poster (added 2026-11-21)

| # | File | What it shows | Before publishing | Use | Part |
|---|---|---|---|---|---|
| 30 | `two_sided_ai_beastt.jpg` (1442x2752, in the parent folder, not in `Selected`) → `30-two-sided-ai-beast.jpg` | A poster the owner made: a "TWO SIDED AI BEAST" banner with NVIDIA, NVIDIA RTX, Radeon Graphics and AMD Radeon logos, above a photo of the rack as it runs now. Top shelf: two RTX 3090s with lit logos and two R9700s, a square fan and a clip-on fan behind, the Cooler Master supply at the right with thick bundles of power leads. Below: the NEO-X1 Pro on its side with its power light on and SlimSAS cables dropping into it. | No GPS data. Wall stickers and magnets show at the right edge. The banner uses NVIDIA's and AMD's logos, which are their trademarks: fine as a description of what is in the build, but it should not read as endorsement. | **Use.** The owner chose it as the intro image. | Overview (header, left) |

## 8. Supplier product photos of the switch kit (added 2026-11-26)

Added by the owner straight into `assets/images/neox1/pcie-switch/`. These are the supplier's product
photos from the Alibaba listing, not the owner's own, and the overview post credits them that way.
None carries EXIF (JFIF headers only).

| File | Size | What it shows | Note |
|---|---|---|---|
| `1_pcie-switch-front_1.jpg` | 1440x649 | Switch card front on white: heatsink and blower, ten ports A1/A2 to E1/E2, DIP switch, board code RBE16A54C-V10 | |
| `2_pcie-switch-back_1.jpg` | 1440x649 | Card back with model label RTE88096-A54 | Label shows the supplier's sample serial number |
| `3_pcie-switch-front-ports.jpg` | 1440x1165 | Annotated front: x16 edge, SFF8654-8i, PEX88096, ports 1# to 10# | |
| `4_pcie-switch-front-dip-switch.jpg` | 1440x1285 | DIP switch and mode table (x16 / x8x8 / x4x4x4x4) | `lxyd.en.alibaba.com` watermark |
| `5_pci-switch-kit.jpg` | 1258x1062 | Kit: SFF-8654 cables x10, dual SFF-8654 8i interface board x5, card x1 | Kit contents as sold; the owner's own kit not confirmed |

All five are in the overview's switch gallery (`switch_gallery` in its front matter).

Three more were added the same day, for the PCIe 3.0 card tried first (the CEACENT CNOL4PE08 /
PEX8724). Also supplier product images, also no EXIF. They are in `pex8724_gallery`.

| File | Size | What it shows |
|---|---|---|
| `7_pcie_switch_oculink.png` | 800x800 | The green CNOL4PE08 on white: heatsink, four OCuLink sockets |
| `6_pcie_switch_oculink.png` | 730x581 | The same card annotated (bracket, gold finger, high-TG board, radiator, PLX8724 chip, SFF8611 ports) |
| `8_pcie_switch_oculink_specs.jpg` | 980x997 | Supplier's spec table (it misprints the controller as "PXL 8724") |

`9_m2_oculink_redriver.png` (1111x1051, no EXIF) is the seller's image of the M.2-to-OCuLink adapter
that works (Amazon UK B0G2GBYQS5): both sides of the board with a redriver chip on each, plus a link
diagram. It is a single figure (`.neox1-figure` in `assets/neox1/article.css`) under the redriver tip
in "Choosing hardware".

## Corrections and open questions

**What the pictures correct**

1. **The cables are SlimSAS, not MCIO.** The switch card and the breakout boards are silkscreened
   `SLIMSAS`. Two filenames say "mcio" / "mico". The draft post says SFF-8654, which is the SlimSAS
   connector, so the post is right and the filenames are wrong.
2. **"Broadcom PEX88096" is not printed anywhere visible.** The chip is under the heatsink and the
   board carries only the code RBE16A54C-V11A. Captions can still call it the PEX88096 switch, because
   the rig notes identify it. Avoid a caption that implies the name can be read off the card.
3. **The NEO-X1 Pro's case is dark grey with a lime-green top, not silver.** The alt text of the first
   rack photo in the draft says "silver GMKtec host".
4. **The CEACENT CNOL4PE08 and the "PEX8724 switch" are the same part.** The notes use the chip name,
   the pictures show the board name. Pick one for the post and introduce the other once.
5. **The M.2 adapter is printed M2-8612-RA.** The rig notes say M2-S612-RA. The pictures are the better source.
6. **The new switch first ran on 16 September, with two R9700s.** The notes give 30 September as the
   install date; that is the four-card build. Picture 23 and the HWiNFO report saved at 00:17 on
   17 September show the earlier two-card trial.
7. **The dock is a closed silver box with power sockets on its back, not an open frame.** No brand name
   is readable on it, but its front panel carries an outlined "03" (picture 10), and the owner confirms
   it is the AOOSTAR AG03.
8. **The two ZOTAC pictures do not show the PC**, despite "neox1_pro" in their names.

**Answered by the owner (2026-11-21)**

- **The ZOTAC RTX 5070 came fitted in the NEO-X1 Pro.** It is the card GMKtec ships in this model.
- **The silver dock is the AOOSTAR AG03.** From [AOOSTAR's page](https://aoostar.com/products/aoostar-ag03-egpu-dock):
  two Thunderbolt 5 ports (Intel JHL9480) and one OCuLink port, up to PCIe 4.0 x4, a built-in 800 W
  supply of which 500 W is for the graphics card, 100 to 140 W of charging back to the computer over
  Thunderbolt, and a short list of hardware it does not work with (it names RX 9070 XT cards).
- **The eBay RTX 3090 (pictures 6 to 8) is the second card:** brand new, GBP 1,000, August 2026.
  The first RTX 3090 cost GBP 511 in June 2024.

**Still open**

- **What is the dark box at the lower left of picture 11?** One read took faint lettering on it as
  "DESIGNED BY AOOSTAR", which would make it a second dock. It cannot be confirmed at this size.
- **What was the dock plugged into on 25 and 26 August?** The notes say the GS75 laptop over
  Thunderbolt 3. The cable in picture 5 is an 80 Gbps one.
- **When was picture 29 taken?** After 30 September. The RTX 5070 and its dock are not in the frame.
- **Why is the opening behind the R9700's fan closed (picture 3)?** One read's answer: a blower draws
  air in on the fan side and pushes it out through the bracket, so the back needs no opening. That is
  plausible but unverified; check it before the post says so.
- **The SSD's sticker reads "Crucial Gen4X4 PR3380 2TB"** (pictures 14 and 18). Windows reports the
  drive as CT2000E100, which the post calls the E100. Do not caption the drive from the sticker.

**Pictures the series would want that are not in this set**

- The switch card seated in the x16 slot.
- The NEO-X1 Pro closed, from the front, on its own.
- The RTX 5070 on its dock beside the host as it runs today.
- The laptop era: the GS75 with the Razer Core X.
- The two-card Gen3 arrangement of early September (the two enclosures the notes call EGPU1 and EGPU2).
- The external power supply's wiring and start jumper.
- Screens: the dashboard on `:8765`, a benchmark run.

The parent folder holds 272 pictures (193 from September, 43 from October), so several of these
probably exist already.

## Proposed use by part (not agreed yet)

The owner agreed the shape on 2026-11-21: one overview post, then five separate posts. Which picture
goes in which part is still a proposal. The part numbers in the tables refer to this outline.

| Part | Subject | Pictures |
|---|---|---|
| Overview | What the build is, why it is worth doing, what to copy. **Written** (`_posts/2026-10-16-one-pcie-slot-five-gpus.md`). | Used: 30 and a crop of 28 side by side as the header, and 10, 9, 18, 20, 26 in the gallery, plus the three rack photos |
| 1 | The host: what the NEO-X1 Pro offers, and where the build started | 10, 11, 14, and 29 or an existing rack photo |
| 2 | The cards: R9700, RTX 3090, RTX 5070 | 2, 3, 9, 12, optionally 1, 6, 8, 13 |
| 3 | Getting GPUs outside the box: docks, OCuLink, PCIe switches, power and the frame | 5, 15, 18, 20, 21, 22, 23, 24, 26, 28, optionally 19, 25 |
| 4 | Making the models fast: engines, tuning, benchmarks | None from this set. Charts and tables carry this part. |
| 5 | Running it every day, and which configuration to build | 29 and the three rack photos already in the post, plus a dashboard screenshot |

Skip: 4, 7, 16, 17, 27.

Pictures can appear in more than one post; the overview uses a few that parts 1 to 3 will show again
in context.

## Web copies

Published copies are in `assets/images/neox1/build/`, named as in the tables above. They are made by
`Claude_Projects/tmp/neox1-blog/Export-NeoX1Photos.ps1` (outside this repo). For each job it applies
the rotation tag to the pixels, optionally crops and scales, and saves a new JPEG with no metadata.
Add a job there for each new picture. It cannot blur yet, so the pictures that need a serial number
or a screen hidden (3, 13, 14, 16, 17, 22, 23) are not exported.

Exported so far: 9, 10, 18, 20, 26, 30, and two crops of picture 28: `28-four-gpus-on-tall.jpg`
(1080x1146, from the R9700 box down; this is the one in the header, beside 30) and
`28-four-gpus-on-hero.jpg` (1080x720, landscape; not used at the moment).
The three rack photos also have 900 px copies (`*-900.jpg`) that the post displays; the full-size
files stay linked.
