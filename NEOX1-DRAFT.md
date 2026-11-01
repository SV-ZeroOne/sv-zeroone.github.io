# NEO-X1 Pro article draft

Prepared on the local branch `draft/neox1-local-ai`. No remote push or publication has been performed.

## Files

- `_posts/2026-10-16-gmktec-neox1-pro-local-ai-lab.md`: article; `published: false` deliberately keeps it out of normal builds.
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

Article: `/2026/10/16/gmktec-neox1-pro-local-ai-lab.html`

Interactive model: `/neox1-lab/`

The draft build also contains the article in feeds and indexes locally. Only a normal build with `published: false` excludes it. The interactive assets themselves are ordinary static files, so keep this branch unmerged until ready to release them too.

## Editorial choices and provenance

- The owner confirmed that the NEO-X1 Pro was personally purchased, with no current GMKtec sponsorship or review loan. The article discloses this near the opening.
- The positive product coverage is based on the owner's build. A short closing invitation proposes a future GMKtec collaboration; no claim of an existing partnership is made.
- Hardware topology: `NEO-X1_PRO.HTM_PCIE_SWITCH_5_GPU.HTM`, live PCIe tree and the 30 September switch campaign in the parent workspace.
- Transfer and soak figures: `llm-inference-notes/pex88096-4gpu-windows-test-plan-2026-09-30.md`.
- DFlash comparison: `bench-results/20261010-dflash-wsl/RESULTS.md`. The downloadable CSV is a transcription of its published median table, not raw trials. Context lengths are rounded campaign labels.
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
