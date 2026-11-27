# NEO-X1 Pro article draft

Prepared on the local branch `draft/neox1-local-ai`. No remote push or publication has been performed.

## Status: a six-post series (2026-11-21)

The owner decided on one overview post followed by five separate posts. The post file named below is
now the **overview**. The single long article it replaced (the 16 October draft, with the full switch
measurements, the complete DFlash table and the daily-use section) is in git at commit `67013e4`:
`git show 67013e4:_posts/2026-10-16-gmktec-neox1-pro-local-ai-lab.md`. Parts 3 to 5 should start from it.

| Post | Subject | State |
| --- | --- | --- |
| Overview | What the build is, what is good about it, what to copy on a smaller budget | Written, `published: false` |
| 1 | The host: what the NEO-X1 Pro offers, and where the build started | Not started |
| 2 | The cards: R9700, RTX 3090, RTX 5070 | Not started |
| 3 | Getting GPUs outside the box: docks, OCuLink, PCIe switches, power, the frame | Not started |
| 4 | Making the models fast: engines, tuning, benchmarks | Not started |
| 5 | Running it every day, and which configuration to build | Not started |

Before publishing the overview: rename the file to its real publication date (the URL and the two
preview scripts carry `2026/10/16`), and do not link to the parts until they exist.

**Owner feedback applied 2026-11-26:**
- Title and URL made generic: "One PCIe Slot, Five GPUs: Taking Local AI to the Next Level",
  slug `one-pcie-slot-five-gpus` (file renamed; the preview scripts and `PREVIEW.md` follow it).
- The disclosure now covers all hardware: bought by the owner, nothing sponsored by any component
  maker "so far" (the owner's "yet").
- New section "The PCIe switch: one slot, many GPUs". Its specification table and the five gallery
  photos in `assets/images/neox1/pcie-switch/` come from the supplier's Alibaba listing (product
  photos, credited as such; one carries the supplier's `lxyd.en.alibaba.com` watermark, and the back
  view shows a serial label from the supplier's sample card, not the owner's). The supplier lists the
  card under SFF-TA-1016 (MCIO), but the board is silkscreened SlimSAS / SFF-8654, so the post omits
  that line. Measurements in the section are the 30 September campaign's; the no-P2P finding is from
  `llm-inference-notes/pex88096-4gpu-windows-test-plan-2026-09-30.md`.
- Subsection "The cheaper option I tried first": the CEACENT CNOL4PE08 (PEX8724, Gen3 x8 up, 4 x OCuLink
  Gen3 x4 down), supplier link from the owner. Figures (3.49 GB/s per card, 6.99 GB/s concurrent,
  2.5 TB in 360 s with zero WHEA, ~30 t/s decode) are from `llm-inference-notes/dual-r9700-instability-diagnostic-2026-09-14.md`
  §3–4; the enclosure/switch blame being wrong is its §9. The listing says the card needs BIOS
  x4x4x4x4 bifurcation; that is wrong for a card with a switch chip, so the post does not repeat it.
- M.2-to-OCuLink redriver lesson (owner, 2026-11-26): the first adapter (printed M2-8612-RA, the one in
  build photo 18) had no redriver and the card never enumerated, as the 3 September notes record. The
  replacement that works is Amazon UK B0G2GBYQS5: M.2 2280 M-key to OCuLink SFF-8612 host adapter,
  PCIe 4.0, PX410 linear redriver, cable not included (from the listing). Photo 18's caption was
  corrected (it had said that adapter carries the fifth GPU), and a hardware tip was added.
- **No promises of follow-up posts** (owner, 2026-11-26): "What is coming" and its five-part list were
  removed, along with every "the follow-up posts / Part 4 will…" line. The post ends with "Final
  thoughts", which says only that he *may* come back to parts of the build. The series plan in the table
  above is internal; do not put part numbers or a roadmap back into the published text.
- New section "Tips for getting more out of local AI", drawn from `llmwiki/concepts/local-llm-inference-architecture.md`,
  `llm-inference-notes/r9700-prefill-campaign-2026-10-02.md`, `bench-results/20261015-nemotron-bolt/RESULTS.md`,
  `llm-inference-notes/vision-5070-qwen35-9b-and-hermes-2026-10-01.md`, the pex88096 test plan, the
  2026-10-16 inference review and the ComfyUI pipeline memory note (all in the parent workspace).

**Fact-check against the workspace notes, 2026-11-27** (owner asked for a whole-post review). Every
figure in the post was traced to a note in the parent workspace. Corrected:
- The RTX 5070 joined on **1 October**, not 4 October (`pex88096-4gpu-windows-test-plan-2026-09-30.md`
  Part 5e and the vision-5070 note are dated 10-01; 4 October is only the date of the five-GPU HWiNFO report).
- CEACENT card: the 30 tokens/s was **one card, speculative decoding off** (diagnostic §4; test plan row
  5B), not a model split across two. It is within 3% of the 30.79 t/s direct-slot figure, which the post now says.
- "Nearly every mini PC has one full-length PCIe slot" was wrong: most have none.
- "Peak committed memory 140 GB" was the **page file's** peak use (139.7 GiB, inference review 2026-10-16).
- ComfyUI tip: 58 s was the 4.1 MP job, but the 8 s was a different, 768 x 768 job, not the same job at
  the intended size (ComfyUI pipeline memory note). Reworded.
- Reliability: "more than a week as I write this" was no longer true (the owner restarted on 25 November).
  The System log gives a 12.4-day run, 13 to 25 November, ended by a user restart; that is the longest
  since the driver fix (an 11.5-day run in October is second). The post now states that.
- The "115k" prompt is 117,649 tokens. The post now says 118k, and `assets/neox1/inference-comparison.csv`
  carries the real token counts (8,184 / 32,743 / 117,649) in place of the rounded labels.
- Smaller: the `--load-mode none` saving was measured on llama.cpp servers on the RTX 3090s (they run
  ComfyUI now); the two-slot flags are `-np 2 -kvu --no-cache-idle-slots`; the 640 px video answer had
  "one small left/centre slip", so it is "stayed accurate", not "the same answer".

Added for local-AI readers, all from the notes: quantisation, engine and context in the jobs table;
streamed speeds from the 2026-11-14 bench (about 90 and 124 tokens/s); one line on what DFlash is and
its trade-offs (MXFP4 checkpoint, one degenerate run in 30, 25/27 the same as llama.cpp,
`bench-results/20261010-dflash-wsl/RESULTS.md`); that a model can be split across cards; the RTX 3090
(936 GB/s) against R9700 (640 GB/s) bandwidth comparison and why speculative decoding beats the bandwidth
ceiling; sensor power readings from `neox1-hardware-telemetry-2026-10-04.md` (about 15 W idle for an
RTX 3090 or 5070, about 240 W for an R9700 generating).

Switch prices (owner, 2026-11-27, from his Alibaba order records): the PEX88096 kit was ordered
02 Sep 2026 (GMT-07:00), total **GBP 400.53 = USD 535.46** (order summary: item GBP 362.79, shipping
GBP 37.75 discounted from 47.56, 1 USD = 0.748006 GBP), and it had **five** dual SFF-8654-8i interface boards
(this settles the open question behind the gallery caption). The CEACENT CNOL4PE08 was ordered
20 Aug 2026 (GMT-07:00), total **GBP 47.83 = USD 64.42** (order summary: item GBP 35.63, shipping 4.23,
tax 7.98, 1 USD = 0.742350 GBP). The PEX88096 order summary has **no tax line**, and the owner
confirmed (2026-11-27) that no import VAT or duty was charged on delivery, so GBP 400.53 was the full
cost. The post says "the order came to" and deliberately does not mention import charges, which vary by
reader and country.
The post gives both order totals with their breakdowns and says "start of September"
and "late August", because the order timestamps are in a US time zone. Current supplier prices
for the PEX88096, also from the owner on 2026-11-27 and now in the post: GBP 261.88 for the card alone
(RTE88096-A54), 365.86 for the kit with five boards and 423.63 for the kit with ten. The listing has a
100-piece minimum; the owner enquired and was sold one, which the post says. The listing read the same
day in USD agrees (340 / 475 / 550, option names "PCIe x16 Expansion Kit" and "PCIe x8 Expansion Kit",
which is where the post's "x16 kit" and "x8 kit" labels come from; samples USD 350 to 560). The CEACENT
listing showed USD 47.99; that current price is not in the post. The owner has no wall-power
measurement, so the post still says the lab has not been measured at the wall.

Not re-checked on 2026-11-27: the manufacturers' figures (GMKtec, AMD, AOOSTAR, Cooler Master), which
were read from their product pages on 2026-11-21, and the owner's own prices and purchase history.

What the overview states that the 16 October draft did not, and where each comes from:

- Host figures (96 GB, 213,840-token context, two requests at once, the vision server's two slots):
  read from the live rig on 2026-11-20, recorded in `INDEX.md` section 0 of the parent workspace.
- The RTX 5070 shipped fitted in the PC, the dock is the AOOSTAR AG03, and the two RTX 3090 prices
  (GBP 511 in June 2024, GBP 1,000 brand new in August 2026): told by the owner on 2026-11-21.
- The 14.6-litre case, liquid-cooled CPU and 96 GB memory ceiling: GMKtec's product page.
- AG03 details (800 W supply, OCuLink plus two Thunderbolt 5 ports, PCIe 4.0 x4, incompatibility list):
  AOOSTAR's product page.
- 54 GB/s for a card directly in the slot and 3.5 GB/s through the PCIe 3.0 switch:
  `hardware_baseline_2026-09-03_*` and the master context in the parent workspace.
- The build timeline: the dated HWiNFO reports in the parent workspace and the build photos
  (see `NEOX1-IMAGES.md`).
- Both RTX 3090s dropping out once: master context, hardware traps. The owner asked for no dates in
  the reliability paragraph.
- Added on the owner's feedback (2026-11-21), in his words: the laptop was an old MSI GS75 with a mobile
  RTX 2080 that hosted the first Hermes Agent setup; the RTX 3090 joined it in an original Razer Core X
  for more VRAM and had been used for password cracking in his cyber security day job; he bought the
  first R9700 in August expecting high-VRAM cards to rise in price, it now costs GBP 200 to 300 more
  than he paid, and a second followed quickly; the NEO-X1 Pro was good value on its launch deal; the
  cards run at stock power and lowering it is a future test; the early instability was AMD driver
  software and it is stable now.
- Processor figures (16 Zen 5 cores, up to 5.4 GHz, 55 W default TDP, "world's fastest mobile gaming
  processor" as AMD's own claim): AMD's product page. Power modes (54 / 85 / 160 W): GMKtec's page.
- Power supply (2000 W, aimed at servers and AI machines, fully modular, 2000 W only on 200 to 240 V
  mains and 1600 W on 115 V): Cooler Master's product page. "Ten power connections for four cards" is
  counted from the hardware: two 8-pin per RTX 3090, one 16-pin per R9700, one 6-pin per breakout
  board (seen in the build photos). How the supply's own leads are shared out is **not** confirmed.
- "More than a week without a restart" was true on 2026-11-21: Windows had been up 7.6 days. The
  owner's wording was "has not crashed in weeks"; the System log shows unexpected-shutdown events
  (Kernel-Power 41) on 12 and 13 November, which may be deliberate power cycles. Re-check when publishing.
- The 350 W figure for an RTX 3090: the 30 September four-card run, where both sat at that limit.

**The 3D viewer was rebuilt on 2026-11-21** against the owner's build photos: every component model and
the complete-rig layout (power supply on the top shelf, four-card frame, breakout boards, switch card
running front to back in the PC, side-mounted radiator, full cabling). Codex and Antigravity reviewed
renders against the photos over four rounds and both accepted all six views. What changed, the evidence
and the tooling are in section 0 of `NEOX1-3D-RENDER-HANDOFF.md` in the parent workspace. The viewer
now takes `?view=<host|amd|nvidia|switch|dock|rig>`, so a later post can link straight to one part, and
the social card `assets/images/neox1-lab.png` was regenerated from the rebuilt rig.

**The PC's internals were rebuilt on 2026-11-22** from three more pictures and the owner's description:
the 850 W supply stands in the top front corner with its leads leaving downwards, the two SO-DIMMs
stand upright beside the pump, there are five case fans (two under the lime top, one on the floor, two
on the radiator), and the radiator bracket has a two-circle fan cut-out plus the slot that shows the
supply's label. Codex and Antigravity both accepted the result on the second pass (reports in `tmp/neox1-blog/review-*-internals2.md`, renders in `tmp/neox1-blog/round5/`).

The 3D viewer's text was brought up to date at the same time (`assets/neox1/parts.js`,
`neox1-lab/index.html`, `assets/neox1/topology.svg`): 96 GB, the current context size, and the service
placement, which is now measured and no longer "intended".

## Files

- `_posts/2026-10-16-one-pcie-slot-five-gpus.md`: article; `published: false` deliberately keeps it out of normal builds.
- `neox1-lab/index.html`: standalone interactive embed.
- `assets/neox1/`: renderer, scoped CSS, static topology fallback and comparison CSV.
- `assets/images/neox1-lab.png`: social image captured from the actual renderer.
- `assets/images/neox1/`: three real build photographs, with captions and full-image links in the article.
- `assets/lib/three-r180/`: self-hosted, pinned Three.js r180, OrbitControls, RoomEnvironment and RoundedBoxGeometry, with upstream MIT licence. Downloaded unchanged from `https://github.com/mrdoob/three.js/tree/r180`.

The article matches the existing Jekyll post front matter and Hacker theme. The interactive page is plain HTML and ES modules, requiring no npm build and no third-party CDN requests. It renders on demand, honours reduced motion, pauses when hidden/off-screen and offers keyboard controls and a static fallback.

## Preview

The generated `_site/` directory contains a local preview of the full draft. On this Windows machine, start it with `./Preview-Neox1.ps1`, then open the URL printed in the terminal. `./Preview-Neox1.ps1 -InteractiveOnly` serves the interactive source directly without requiring Ruby or a Jekyll build. Both servers bind only to loopback. These preview instructions and the PowerShell launcher are excluded from the published site.

With the repository's Ruby dependencies installed:

```sh
SECURITY_FEEDS=off bundle exec jekyll serve --unpublished
```

Article: `/2026/10/16/one-pcie-slot-five-gpus.html`

Interactive model: `/neox1-lab/`

The draft build also contains the article in feeds and indexes locally. Only a normal build with `published: false` excludes it. The interactive assets themselves are ordinary static files, so keep this branch unmerged until ready to release them too.

## Editorial choices and provenance

- The owner confirmed that the NEO-X1 Pro was personally purchased, with no current GMKtec sponsorship or review loan. The article discloses this near the opening.
- The positive product coverage is based on the owner's build. A short closing invitation proposes a future GMKtec collaboration; no claim of an existing partnership is made.
- Hardware topology: `NEO-X1_PRO.HTM_PCIE_SWITCH_5_GPU.HTM`, live PCIe tree and the 30 September switch campaign in the parent workspace.
- Transfer and soak figures: `llm-inference-notes/pex88096-4gpu-windows-test-plan-2026-09-30.md`.
- DFlash comparison: `bench-results/20261010-dflash-wsl/RESULTS.md`. The downloadable CSV is a transcription of its published median table, not raw trials. Since 2026-11-27 its `prompt_tokens` column holds the real prompt lengths, not the rounded campaign labels.
- Current runtime and validation: `llm-inference-notes/qwen38-runtime-update-2026-10-16.md`.
- Service placement and limitations: `llm-inference-notes/neox1-inference-review-2026-10-16.md`.
- External primary sources are linked in the post. Outdated claims about 48 CPU lanes or six physical expansion slots from earlier local notes were not repeated.

The owner supplied three photographs: `106615.jpg` (overview), `106044.jpg` (close-up) and `106038.jpg` (overhead). The assembled model follows the visible rack arrangement: horizontal host below, two black RTX 3090s and two silver R9700s across the upper shelf, RTX 5070 beside the host, and external PSU with a small fan at the upper right. Actual service placement is not live telemetry. The article records the image-worker GPU mismatch found during the review rather than claiming it was resolved.

### Detailed model revision — 17 October 2026

The viewer opens on the GMKtec product model, with separate R9700, TUF RTX 3090, PEX88096, ZOTAC RTX 5070 + AOOSTAR dock and full-rig views. The host has detachable perforated side panels, lime top and handles, front I/O, rear I/O, internal board, SO-DIMMs, M.2 devices, PSU and an opening dual-fan radiator assembly. The GPUs have distinct blower/axial coolers, pitched blades, heatsink fins, backplates, I/O brackets and the appropriate power connectors. Studio environment reflections and bevelled edges replace the first draft's block models. Exploding the host or rig automatically frames the expanded assembly; explicit zoom and keyboard rotation remain available.

Outer dimensions are used for proportions at 1 scene unit = 100 mm:

| Model | Reference envelope | Source |
| --- | --- | --- |
| GMKtec NEO-X1 Pro | 350 × 165 × 265 mm body | [GMKtec UK product photographs and specifications](https://www.gmktec.uk/products/gmktec-neo-x1-series-amd-ryzen%E2%84%A2-9-9955hx-9955hx3d-modt-gaming-pc); owner's `neo-x1-break-apart.png` |
| Gigabyte Radeon AI PRO R9700 AI TOP 32G rev. 1.0 | 267 × 111 × 40 mm; 16-pin power | [Gigabyte specifications](https://www.gigabyte.com/uk/Graphics-Card/GV-R9700AI-TOP-32GD-rev-10/sp), owner photographs, [CFD distributor product image](https://prtimes.jp/main/html/rd/p/000001039.000032645.html) |
| ASUS TUF RTX 3090 O24G | 299.9 × 126.9 × 51.7 mm; two 8-pin connectors | [ASUS gallery](https://www.asus.com/motherboards-components/graphics-cards/tuf-gaming/tuf-rtx3090-o24g-gaming/) and [specifications](https://www.asus.com/motherboards-components/graphics-cards/tuf-gaming/tuf-rtx3090-o24g-gaming/techspec/) |
| ZOTAC RTX 5070 Twin Edge OC | 241.5 × 120.1 × 40.6 mm; dual 90 mm fans; 12V-2x6 input | [ZOTAC product](https://www.zotac.com/product/graphics_card/zotac-gaming-geforce-rtx-5070-twin-edge-oc), [official gallery image](https://www.zotac.com/download/files/styles/w1024/public/product_gallery/graphics_cards/zt-b50700h-10p-image02.jpg?itok=05SEsdl3) and [brochure](https://www.zotac.com/download/mediadrivers/External/GraphicsCard/5070/Brochure/ZT-B50700H-10P-brochure.pdf) |
| AOOSTAR AG03 | Dock envelope is photo-proportioned, not measured; integrated 800 W PSU | [AOOSTAR product and gallery](https://aoostar.com/products/aoostar-ag03-egpu-dock); owner confirmed one OCuLink host cable |
| TecMojo 12U rack | 520 W × 512 D × 534 mm body; 604 mm including casters | Owner-supplied `rack_1.jpg` and `rack_2.jpg`; owner explicitly confirmed **top and bottom shelves only, no middle shelf** |

The manufacturer images are visual references, not republished textures. Meshes, text decals and perforation masks are created in `models.js`; no CAD assets were supplied or claimed. Hidden internal arrangements and exact switch/dock dimensions remain illustrative. Sparse physical host-to-GPU cable bundles are also illustrative, and disappear when the rig separates; the optional link overlay explains the measured topology and omits bridge tiers. The dock's short local GPU power leads remain attached to its assembly. Reference downloads remain outside the site in `tmp/neox1-blog/product-references/`.

### Switch mounting correction — 17 October 2026

The owner supplied `C:/Users/Neo/Downloads/plx-pcie-switch.png` and confirmed that the switch plugs directly into the motherboard, with the host lying on its side and its upward-facing side panel removed. The rack model now removes that panel, faces the motherboard components upward and attaches the switch to an explicit PCIe socket in the host hierarchy. It stays seated at zero separation, moves with the host, and lifts out only in the exploded state. There is no floating switch board in the assembled rack.

The new switch model follows the blue PCB, gold PCIe edge, bracket, silver fin stack/blower and ten SFF-8654 receptacles in that image. Its dedicated close-up makes the card inspectable. The green GPU risers have two receptacles, and eight illustrative cables connect the four switch GPUs. Paired cables are corroborated by `llm-inference-notes/multi-gpu-llama.cpp-notes.md` in the parent workspace. The kit image's “x8” label is not used to replace the measured Gen4 ×16 host uplink. Exact physical port assignments and switch measurements were not provided. The separate GMKtec enclosure study retains its removable panels; the complete-rig view represents the owner's open-sided configuration.

### Dock and orientation correction — 17 October 2026

The owner's exact fifth card is now modelled as the ZOTAC Twin Edge OC, with its compact striped shroud, two fans, vented metal backplate, four display outputs and 16-pin power input. It sits in the AG03's roof socket, above the integrated PSU housing. Dock details follow the manufacturer gallery: bevelled enclosure, power button, OCuLink and two unused Thunderbolt ports, three rear GPU power outputs, ventilation and PSU fan. There is one physical OCuLink cable from the host's M.2 adapter to the dock; the dock does not attach to the PEX88096. The separate studio view has links to both manufacturers.

All five GPU assemblies turn 180 degrees from the previous rack orientation. The switch and its modelled socket turn 90 degrees about the vertical axis, keeping the card upright and its edge connector seated. The internal board placement is an explanatory reconstruction, not a claim to have motherboard CAD. Physical routes clear the upper shelf edge and the host's retained lime panel. The article, inspector and static fallback record the AG03 and distinguish its 800 W rating from the 2000 W expansion supply and host's 850 W supply.

Blog photo copies preserve the compressed image data and decoded pixels exactly. GPS, camera, thumbnail, XMP/IPTC and trailing metadata were removed; only a minimal EXIF Orientation=6 tag was retained for correct portrait display, plus a colour profile if present. The originals remain in Downloads. The metadata preparation script is in the parent workspace at `tmp/neox1-blog/prepare-photos.mjs`.

No new inference benchmark was run for the article. October 10 measurements predate the October 16 runtime update; the author's reported extra 4.9% was not represented as a local result.

## Publication

After reviewing the text and visual, remove `published: false` (or set it to `true`) and use the repository's usual PR/merge workflow. A push to `master` triggers the existing public Pages deployment. Update the post date if desired before sharing its URL. No changes to the site's deployment pipeline are necessary.

## Validation completed

- Full Jekyll 4.4.1 draft build with the existing Gemfile.lock, using official Ruby 3.4 in an isolated, resource-limited Docker container. Homepage feed fetching was disabled for local validation.
- HTML-Proofer passed after the photo update: 35 HTML files, 131 internal links, image and script checks.
- Edge/Chromium checks passed again on 17 October for all six desktop and mobile views, chassis and rig explode/reassemble, all eight component selections, PCIe toggle, zoom/orbit/reset, reduced motion, disabled JavaScript and unavailable WebGL. Checks verified the removed panel, upward-facing motherboard, ten switch connectors, upright transverse switch, reversed GPU orientations, the 5070 seated in its dock, one OCuLink host cable, and the switch returning to its socket after reassembly. A picking check orbits above the open host and selects the installed switch. An idle-frame check confirmed the renderer stops requesting animation frames after interaction settles.
- The rebuilt article passed checks for the embedded controls, responsive iframe height, mobile overflow, disclosure and refreshed social-card metadata. No browser script errors or failed HTTP responses occurred; mobile overflow measured 0 px. The social image is an actual capture of the new exploded chassis view.
- JavaScript syntax checks and Git whitespace checks passed.
- All three photo copies decoded to identical pixels to their originals and retained only the Orientation EXIF tag. Browser checks confirmed portrait orientation and responsive gallery layout.

Screenshots and validation scripts are retained outside the site in the parent workspace's `tmp/neox1-blog/`. A standalone Ruby installation was not added to Windows. The reusable `neox1-blog-gems` Docker volume holds only the blog's build dependencies; no inference container was changed.

## 17 October — isometric camera

- The viewer now uses a true isometric orthographic camera (35.264° elevation, `[1,1,1]` diagonal) in place of the 34° perspective camera. Framing is an overlay-aware orthographic bounds fit over visible meshes only. The ↶/↷ buttons and arrow keys step between the four isometric corners. "Isometric view" (formerly "Reset view") returns to the default corner. Drag still orbits freely, and the header then reads FREE ORBIT. Full notes are in `../NEOX1-3D-RENDER-HANDOFF.md` §9.
- `check_browser.py`, `check_switch_pick.py` and `check_article.py` passed after the change. The switch connectors can now be picked from the default rig view at both desktop and mobile widths. Changed static files were synced into `_site`; the article Markdown is unchanged.

## 17 October — host exploded view

- The host studio explosion was reworked against GMKtec's own exploded render. The explosion is now staged:
  - the top, side and front panels come off first;
  - the handles and the bottom panel with its feet follow;
  - the dual-fan radiator lifts and rolls its fans towards the viewer;
  - the cylindrical pump, both SO-DIMMs and the M.2 drives lift off the board, and the PSU slides out.
- New static detail:
  - a RYZEN package under a copper cold plate, and VRM heatsinks;
  - a guarded PSU fan, IEC inlet and rocker switch;
  - a framed side fan, a radiator bracket, chassis rails, and bordered perforation fields.
- The reference's internal GPU, GPU bracket and adjacent 120 mm fan were deliberately left out, because this build's slot holds the PCIe switch. Details are in `../NEOX1-3D-RENDER-HANDOFF.md` §8.
- The social card was regenerated from the new view. All three browser suites passed, and the `_site` assets were synced.
