---
title: "One GMKtec, Five GPUs: Taking the NEO-X1 Pro into Local AI"
author: zero
tags: homelab ai hardware gmktec amd nvidia local-llm
description: "How I expanded a GMKtec NEO-X1 Pro into a mixed AMD and NVIDIA local AI lab, with a Broadcom PCIe switch and measured Qwen inference results."
image: /assets/images/neox1-lab.png
published: false
---

My GMKtec NEO-X1 Pro now hosts five discrete GPUs: two AMD Radeon AI PRO R9700s, two NVIDIA RTX 3090s and an RTX 5070. That is 124 GB of VRAM across a compact host and its external expansion hardware. Getting them connected was only the start. The really satisfying bit was getting my main local LLM running faster on **one** AMD card than it had on two, leaving the other card available for vision work.

If you have read my [old hacking lab build](/2020/08/29/hacking-server-lab.html), you will know where this is going. Give me a useful computer, some expansion hardware and a reason to experiment, and the desk tends to get a little more complicated. This time the goal is a local AI workstation: language models, vision, image generation and video work, with control over which model runs where.

**The NEO-X1 Pro is the centre of this build.** The extra GPUs, PCIe switch, cabling and external power are my expansion. They do not all fit inside the GMKtec case, and this is my tested configuration rather than a stock five-GPU product.

*Disclosure: I bought the NEO-X1 Pro myself. This post is not sponsored by GMKtec, and the machine was not supplied or loaned for review.*

## The lab as it actually looks

Here is the build in its current home. The GMKtec lies on its side on the lower level of a TecMojo 12U open rack, with the upward-facing side panel removed and the PEX88096 expansion card plugged directly into the motherboard's PCIe slot. Above it, the top shelf carries the two RTX 3090s and two silver Gigabyte Radeon AI PRO R9700s. My rack has only the bottom and top shelves; there is no middle shelf. The ZOTAC RTX 5070 Twin Edge OC sits alongside the host on an AOOSTAR AG03 dock with its own integrated PSU. A single OCuLink cable connects that dock to the GMKtec. The large external power supply is up beside the four-card shelf. A couple of small fans help move air around the open assembly. This is very much a working homelab, cables and all.

<link rel="stylesheet" href="/assets/neox1/article.css">
<div class="neox1-photos">
  <figure>
    <a href="/assets/images/neox1/setup-overview.jpg" target="_blank" rel="noopener"><img src="/assets/images/neox1/setup-overview.jpg" width="2252" height="4000" loading="lazy" decoding="async" alt="Full view of the open rack, with four GPUs above the silver GMKtec host, a fifth GPU beside it, and a monitor above the build."></a>
    <figcaption><strong>01 / The whole build</strong>The NEO-X1 Pro anchors the lower level. The GPU expansion occupies the shelf above and the space beside it.</figcaption>
  </figure>
  <figure>
    <a href="/assets/images/neox1/gpu-shelf-closeup.jpg" target="_blank" rel="noopener"><img src="/assets/images/neox1/gpu-shelf-closeup.jpg" width="2252" height="4000" loading="lazy" decoding="async" alt="Close view of two black GeForce RTX cards and two silver Gigabyte Radeon cards, with power cables and an external power supply to the right."></a>
    <figcaption><strong>02 / Two GPU ecosystems</strong>Black RTX 3090s on the left, silver R9700s on the right, with external power and additional airflow.</figcaption>
  </figure>
  <figure>
    <a href="/assets/images/neox1/gpu-shelf-overhead.jpg" target="_blank" rel="noopener"><img src="/assets/images/neox1/gpu-shelf-overhead.jpg" width="2252" height="4000" loading="lazy" decoding="async" alt="Overhead view showing four upright graphics cards arranged side by side across the upper rack shelf."></a>
    <figcaption><strong>03 / The expansion shelf</strong>The overhead view makes the four-card arrangement clear. The electrical paths are explained in the diagram below.</figcaption>
  </figure>
</div>

*Photos by me. Select a photo to open the full image.*

## Pull the lab apart

<div class="neox1-embed" style="margin:1.5rem 0;">
  <iframe id="neox1-explorer" src="/neox1-lab/?embed=1" title="Interactive 3D exploded view of the NEO-X1 Pro AI lab" loading="lazy" style="display:block;width:100%;height:780px;border:1px solid #3c4933;border-radius:8px;" allow="fullscreen" allowfullscreen></iframe>
</div>

<script src="/assets/neox1/embed.js" defer></script>

**[Explore the lab in a full window ↗](/neox1-lab/)**

Start with the GMKtec enclosure study and open its chassis, or choose the R9700, ASUS TUF RTX 3090, **PCIe switch** and **RTX 5070 + dock** close-ups to inspect the hardware. Drag to orbit and use the zoom buttons for details. The **Complete rig** view shows the open-sided arrangement: host below with the switch seated upright across its motherboard, four cards above, and the fifth on its dock alongside. Separate the assembly and turn on **PCIe links** to follow the shared host connection and the separate route to the fifth GPU.

The models use the manufacturers' published chassis and GPU dimensions, product photographs and my rack and switch references. The TecMojo frame is 520 mm wide, 512 mm deep and 604 mm high including its casters, with only the top and bottom shelves fitted. The switch model follows the blue PCB, ten SFF-8654 connectors and silver blower/heatsink in my reference image. Each of the four switch-connected GPUs uses two SFF-8654 cables and a breakout board. This is a photo-derived reconstruction, not manufacturer CAD: concealed internals, the switch and dock's exact dimensions, and precise cable routing and port assignments are illustrative. The PCIe relationships reflect the measured setup. Visual references: [GMKtec NEO-X1 series](https://www.gmktec.uk/products/gmktec-neo-x1-series-amd-ryzen%E2%84%A2-9-9955hx-9955hx3d-modt-gaming-pc), [Gigabyte R9700 AI TOP](https://www.gigabyte.com/uk/Graphics-Card/GV-R9700AI-TOP-32GD-rev-10), [ASUS TUF RTX 3090 OC](https://www.asus.com/motherboards-components/graphics-cards/tuf-gaming/tuf-rtx3090-o24g-gaming/), [ZOTAC Twin Edge OC](https://www.zotac.com/product/graphics_card/zotac-gaming-geforce-rtx-5070-twin-edge-oc) and [AOOSTAR AG03](https://aoostar.com/products/aoostar-ag03-egpu-dock).

## Why the GMKtec made a good starting point

The useful combination here is a compact chassis, a Ryzen 9 9955HX3D with 16 cores and 32 threads, replaceable memory, and PCIe expansion I could actually put to work. GMKtec markets the NEO-X1 Pro as a compact gaming machine; I have been using that foundation to build an AI lab. [GMKtec's product page](https://www.gmktec.com/products/gmktec-neo-x1-pro-modt-gaming-pc-amd-ryzen-9-9955hx3d-nvidia-geforce-rtx-5070)

My host has **64 GB of DDR5 memory and a 2 TB Crucial E100 NVMe SSD**. Windows 11 Pro runs the desktop and several GPU services, with Ubuntu 24.04 under WSL2 for the main language model. The small Radeon 610M integrated GPU handles the display, leaving the discrete cards available for inference.

The CPU gives me room for orchestration, tokenisation and the rest of the lab around the GPU workloads. I have not isolated the effect of its 3D V-Cache on inference, so I am not attributing the token-rate gains below to that feature. Those gains came from changing the inference stack.

What I like about the GMKtec is that it has given me a practical platform to keep experimenting on. I could change the GPU topology, compare engines and move services between cards without rebuilding the whole host each time.

## The hardware, as built

| Component | My configuration |
|---|---|
| Host | GMKtec NEO-X1 Pro |
| CPU | AMD Ryzen 9 9955HX3D, 16 cores / 32 threads |
| System memory | 64 GB DDR5, two 32 GB modules |
| Storage | 2 TB Crucial E100 NVMe |
| AMD GPUs | 2 × Gigabyte Radeon AI PRO R9700 AI TOP, 32 GB each |
| NVIDIA GPUs | 2 × ASUS TUF RTX 3090 OC, 24 GB each; 1 × ZOTAC RTX 5070 Twin Edge OC, 12 GB |
| Main expansion | Broadcom PEX88096 PCIe Gen4 switch, in the PLX/PEX switch family |
| Fifth GPU path | M.2_2 adapter → one OCuLink cable → AOOSTAR AG03 dock, negotiated PCIe Gen4 ×4 |
| Power in this modified build | Host's internal 850 W supply; Cooler Master 2000 W for the main expansion; AG03's integrated 800 W PSU for the 5070 |

Those power-supply ratings describe the installed supplies, not measured wall consumption. They also describe my modified machine, not every retail NEO-X1 Pro configuration.

The five discrete cards add up to **124 GB of VRAM**, but each GPU owns its memory. I allocate workloads to those separate memory spaces; the switch does not turn them into one 124 GB GPU.

## The Broadcom switch is what makes the expansion interesting

The two R9700s and the two 3090s sit behind a **Broadcom PEX88096**, sharing one **PCIe Gen4 ×16 host uplink**. The RTX 5070 takes a separate **M.2-to-OCuLink Gen4 ×4 path** through the AG03 dock. My host connection uses one OCuLink cable; the dock's Thunderbolt ports are unused here. AOOSTAR specifies an integrated **800 W PSU**, so the 5070 has its own dock power supply. That rating describes capacity, not measured consumption. [AOOSTAR AG03 specifications](https://aoostar.com/products/aoostar-ag03-egpu-dock)

```text
GMKtec NEO-X1 Pro / Ryzen 9 9955HX3D
│
├── PCIe Gen4 ×16 shared uplink
│   └── Broadcom PEX88096 switch
│       ├── Radeon AI PRO R9700 · 32 GB
│       ├── Radeon AI PRO R9700 · 32 GB
│       ├── GeForce RTX 3090    · 24 GB
│       └── GeForce RTX 3090    · 24 GB
│
└── M.2_2 → one OCuLink cable · PCIe Gen4 ×4
    └── AOOSTAR AG03 · integrated 800 W PSU
        └── ZOTAC RTX 5070 Twin Edge OC · 12 GB
```

That shared uplink is the detail to keep in mind. Four connected cards do not mean four independent ×16 links back to the CPU. When several cards load models or move large amounts of data at once, they compete for the same host bandwidth.

I learnt this by measuring the links. In the 30 September campaign, a single R9700 reached **28.3 GB/s host-to-device and 27.7 GB/s device-to-host** through the switch. A 3090 reached **26.1 and 26.3 GB/s** respectively. Loading all four in the host-to-device direction produced about **28.3 GB/s aggregate**, not four times that figure.

The previous PEX8724 arrangement had a Gen3 ×8 uplink and gave the tested card about **3.49 GB/s**. Moving to the PEX88096 therefore delivered roughly **8.1× the measured host-to-device bandwidth** on that comparison. That is a transfer result, not an 8.1× LLM speedup.

One other trap: an endpoint can report a fast link to a bridge on the GPU itself. That does not describe the entire route back to the CPU. I checked the bridge chain and measured transfers rather than treating the biggest link number in a hardware report as the answer.

## AMD and NVIDIA, working in the same lab

I wanted to use both ecosystems. AMD's 32 GB cards give me useful room for language models and their context caches. The NVIDIA cards let me keep CUDA-based image and video workflows alongside them.

My service layout is built around separate jobs:

| GPU allocation | Workload | Serving stack |
|---|---|---|
| R9700 #1 | Main Qwen3.8-27B language model | WSL2, Docker, vLLM-radiance and DFlash2 |
| R9700 #2 | Qwen3.6-35B-A3B vision model | Native Windows llama.cpp, Vulkan |
| RTX 5070 | Intended Qwen-Image service | ComfyUI, CUDA |
| RTX 3090 #1 and #2 | MiniMax-H3 video workers | Separate ComfyUI instances, CUDA |

This table describes the intended service placement. My latest review caught an older launcher putting the image service on a 3090 that was also assigned video work. The endpoints were healthy, but the GPU placement was wrong. Checking which physical card owns a process is now part of the work still to tighten up.

The collaboration happens at the application level: a language model can plan a job, a vision model can inspect an image, and image or video workers can produce the assets. I am not claiming a single model is tensor-parallel across AMD and NVIDIA.

In the Windows transfer campaign, neither same-vendor GPU pair exposed usable direct peer access. Some copies were staged through system RAM. That finding helped steer me towards keeping models resident on individual cards and giving each card a useful job.

## The biggest inference upgrade was software

My earlier Qwen3.8-27B configuration used both R9700s with llama.cpp's ROCm backend and tensor splitting. It worked, but the next experiment changed the balance of the whole machine.

Using [mike2153's Qwen3.8 DFlash setup](https://github.com/mike2153/mbea-qwen38-dflash), I moved the main model to one R9700 with:

- **AMD Quark AWQ MXFP4 weights**, using the W4A8 kernel path.
- **vLLM-radiance and RDNA4 kernels** inside Docker on WSL2.
- A **DFlash2 FP8 drafter**, proposing seven speculative tokens.
- **FP8 KV cache**, prefix caching, and one active sequence at a time.

Speculative decoding lets a smaller drafter propose tokens for the main model to verify. How many proposals survive depends on the prompt and the generated text, so there is no single speed multiplier for every request.

Here is what happened on my actual campaign prompts. These are medians of three runs from **10 October**, with prefix reuse defeated by a per-request nonce.

| Measurement | Previous two-R9700 llama.cpp setup | One-R9700 DFlash setup |
|---|---:|---:|
| Process an 8k-token prompt | 1,185 tokens/s | **3,344 tokens/s** |
| Process a 32k-token prompt | 1,163 tokens/s | **3,036 tokens/s** |
| Process a 115k-token prompt | 951 tokens/s | **2,283 tokens/s** |
| 115k prompt processing time | 124 seconds | **51.6 seconds** |
| Generate after an 8k prompt | 62 tokens/s | **107 tokens/s** |
| Generate after a 32k prompt | 54 tokens/s | **98 tokens/s** |
| Generate after a 115k prompt | 46 tokens/s | **74 tokens/s** |

The generation rows measure 128 output tokens after each prompt. This compares complete configurations: the previous setup used Unsloth UD-Q4_K_XL weights, f16 KV and MTP; the new one uses MXFP4, FP8 KV and DFlash. The chat-template and request paths also differ. It demonstrates which setup worked better here, rather than isolating the effect of one kernel. [Download the recorded comparison values](/assets/neox1/inference-comparison.csv).

The result I care about most is the **115k-token prompt dropping from 124 seconds to 51.6 seconds while freeing an entire R9700**. That made room for the vision service. Faster responses and another useful model available at the same time is a much better outcome for this lab than simply occupying more GPUs.

I also ran a small reasoning campaign: ten tasks, three repetitions each, with 27 graded outcomes. DFlash matched the base llama.cpp setup at **25/27**, while recorded generation time fell from **83.4 minutes to 33.0 minutes**. That comparison was against the earlier **single-card** llama.cpp run. One DFlash run degenerated into repeated characters and hit its token cap at temperature 1.0; it needs retesting at the shipped 0.7 default. These are useful local checks, not a broad model-quality certification.

## Making it something I can actually use every day

A fast response is useful. A server that is still there after I close a terminal is useful too.

The WSL setup needed a persistent session so the distro and Docker worker stayed alive. Windows and WSL can enumerate GPUs differently, so I also have to be deliberate about device selection. Model loading has to respect system RAM and commit usage, even when there is plenty of VRAM across the machine.

The switch passed a **15-minute transfer soak moving 32.2 TB**, with no recorded WHEA events, PCIe replays or PCIe errors. A separate **15-minute four-GPU inference run completed 133 requests with no failures or dropouts**. Those are encouraging bounded tests; they are not evidence of weeks of unattended uptime.

On **16 October**, I updated the main server to **`mbea-qwen38-dflash:2026.10.1`**, at repository commit `353a6ba`. The normal serving start exposed **211,200 context tokens**, and all eight upstream API checks passed, including streaming and tool-call continuation. The previous benchmark profile exposed 214,720; available context is profiled at startup.

The new package builds the patches and kernels during installation and adds a guarded shutdown that drains work before stopping the GPU process. I also adjusted my fleet controller to honour a refused stop. The benchmark table above predates this update: I have not yet measured its incremental performance gain.

My next operational improvements are straightforward: verify GPU identity rather than trusting service labels, make startup sensitive to host memory pressure, and choose lighter reasoning settings for everyday requests. Long reasoning has its place, but I do not need it for every simple answer.

## What this build says about the NEO-X1 Pro

The part that has impressed me is how far I could take the host. The GMKtec is still the centre of the machine: CPU, memory, storage, desktop and PCIe connectivity. Around it, I have been able to build a mixed-vendor AI lab and change how the hardware is used as the software improves.

There are real trade-offs. The external GPUs and power supply take desk space. The shared link is finite. Sixty-four gigabytes of system RAM needs managing when several large services start together. And I still have work to do on placement checks and longer stability runs. Those are the details that make this a useful build log rather than just a photo of a lot of graphics cards.

For GMKtec, I think there is a good enthusiast story here: a compact machine becoming the foundation of a much more ambitious project. I would love to collaborate on a follow-up covering repeatable builds, measured power and noise, and longer inference runs. The benchmark methodology and the rough edges would stay in the write-up.

For now, I have a GMKtec at the centre of five GPUs, AMD and NVIDIA doing useful work in the same system, and a local language model that got substantially quicker through a change of software. That is a pretty good excuse for the state of my desk.

---

*Build and measurements recorded September–October 2026. The 3D illustration is schematic. Product specifications: [GMKtec NEO-X1 Pro](https://www.gmktec.com/products/gmktec-neo-x1-pro-modt-gaming-pc-amd-ryzen-9-9955hx3d-nvidia-geforce-rtx-5070) and [AMD Ryzen 9 9955HX3D](https://www.amd.com/en/products/processors/laptop/ryzen/9000-series/amd-ryzen-9-9955hx3d.html). Inference software credit: [mbea-qwen38-dflash](https://github.com/mike2153/mbea-qwen38-dflash), its linked radiance/libr4d projects, [vLLM](https://github.com/vllm-project/vllm), [llama.cpp](https://github.com/ggml-org/llama.cpp) and [ComfyUI](https://github.com/Comfy-Org/ComfyUI). Interactive rendering uses [Three.js](https://threejs.org/).*
