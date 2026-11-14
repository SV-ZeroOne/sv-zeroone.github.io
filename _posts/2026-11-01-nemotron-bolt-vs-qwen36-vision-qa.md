---
title: "Nemotron 3.5 Bolt vs Qwen3.6-35B: Testing a 2-bit 74B Model as My Vision QA Judge"
author: zero
tags: homelab ai amd local-llm benchmarks vision
description: "I tested NVIDIA's 2-bit Nemotron 3.5 Bolt against Qwen3.6-35B-A3B on two Radeon AI PRO R9700s, using 702 real QA calls from my AI video pipeline. What the speed and quality numbers mean, and why Qwen kept the job."
---

NVIDIA released Nemotron 3.5 Bolt on 15 October: a 74-billion-parameter vision model squeezed to 2 bits so it fits in about 24 GB, with benchmark scores that beat Qwen3.6-35B-A3B, the model that does vision work in my lab. The next day I ran them side by side on my two Radeon AI PRO R9700s, using 702 real requests from my own video pipeline rather than a generic benchmark. Qwen kept the job. On the same llama.cpp build it was faster on every speed test, and Bolt broke my pipeline's answer parsing and could not tell video clips apart. The more useful result was a surprise: the same Qwen model ran my workload 16% faster on a different build of llama.cpp.

This post explains what I measured, what each number means, and what I changed afterwards. Everything ran on my GMKtec NEO-X1 Pro lab; the full hardware and software details are at the end of the post.

## The two contenders

Both are mixture-of-experts (MoE) models. An MoE model holds many small "expert" networks but only runs a few of them for each token, so its **active** parameter count is what mostly decides speed. Total parameters decide how much memory it needs.

| | Qwen3.6-35B-A3B | Nemotron 3.5 Bolt 74B-A9B |
|---|---|---|
| Parameters, total / active per token | 35B / 3B | 74B / 9B |
| Quantisation I ran | Unsloth UD-Q4_K_XL, about 5 bits per weight on average | NVIDIA's own IQ2_XXS release, about 2 bits on the experts |
| Model file | 21 GB + 0.9 GB vision projector | 22 GB + 1.7 GB vision projector |
| Inputs | Text, images, video | Text, images, video |
| Speculative decoding | None in my GGUF | LiLiCorr drafter, 1 GB |
| VRAM used here, 262k context | About 30 GB | 29.5 GB with the drafter |

Bolt is NVIDIA's bet that a big model squeezed to 2 bits beats a smaller model at 4 bits, given the same memory. They compressed it from a 120B parent, then trained it further while quantised so it learns to cope with the low precision. Their [model card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF) shows it ahead of Qwen3.6-35B on most agent and reasoning benchmarks: Terminal-Bench 2.1 50.98 vs 44.38, BrowseComp 66.75 vs 48.74, GPQA Diamond 86.43 vs 83.40. Interestingly, NVIDIA's own speed table, in their [research blog](https://research.nvidia.com/labs/nemotron/Nemotron-3.5-Bolt-24GB/), had Qwen ahead: 97 vs 84 tokens per second on their RTX Spark, with each model using its own speculative decoding.

## What my vision model actually does

In my lab, the vision model on the second R9700 is mostly an automated quality checker for an AI video pipeline. The pipeline draws storyboard frames, animates them into short clips, and then asks the vision model to check its own work before a human ever looks:

- **Frame checks:** yes/no questions about a generated image ("is the woman on the right holding a curved sword?"), bounding boxes for people and props, and counts of background extras.
- **Clip checks:** head counts on eight frames from each clip, a checklist of questions per frame, and a "beat check" on the clip itself, sent as video, asking whether it shows the action it was meant to.

Every call uses temperature 0, has thinking switched off, and must return JSON in a fixed shape that the pipeline then parses. Calls run one at a time. That is a very different job from the long, thinking-on agent tasks Bolt was tuned for, which is exactly why I wanted to test it on my workload rather than trust the leaderboard.

## How I tested

I stopped my main language model for the test, which freed one R9700 for Bolt. The production Qwen server kept the other card, so both models ran at the same time on identical hardware.

A small test harness ran the pipeline's real checking code over four finished short films: 45 storyboard frames and 43 clips. That came to **702 requests per model**. The harness only swapped the server address, so both models received byte-for-byte identical requests and I could compare every answer one-to-one. I also replayed the same requests against Bolt at different drafter settings, and against Qwen on a second llama.cpp build.

Separately, I measured raw speed with the same long prompts (8k, 32k and 115k tokens) I use for all my speed benchmarks, and logged host memory while each model loaded.

## Speed: two numbers, and which one matters

Every local LLM speed figure is really two numbers.

- **Prompt processing** (also called prefill) is how fast the model reads its input. It decides how long you wait before the first word appears. Long documents and video make this matter.
- **Generation** (also called decode) is how fast it writes the answer, one token at a time. It mostly depends on how many bytes of weights the GPU must read per token.

Here are both, in tokens per second, on the same card model and the same llama.cpp build for both models: the official Vulkan release b11669, the first build that supports Bolt. Medians of three runs.

| Prompt length | Qwen3.6-35B: read / write | Bolt, no drafter: read / write |
|---|---:|---:|
| 8k tokens | **2,610** / **115** | 1,829 / 69 |
| 32k tokens | **2,398** / **103** | 1,735 / 67 |
| 115k tokens | **1,765** / **80** | 1,379 / 61 |

Qwen reads 1.3 to 1.4 times faster and writes 1.3 to 1.7 times faster. That fits the active parameters. Bolt runs 9B parameters per token against Qwen's 3B. Even at 2 bits on its experts, my rough estimate from the model file is that Bolt reads about twice as many bytes per generated token. Bolt is a hybrid model: alongside its experts it has Mamba layers (a lighter alternative to attention) and some attention layers. NVIDIA stores those at 4 and 8 bits, and they are read for every token.

For my pipeline, the number that matters is how long a whole QA pass takes, because the requests are short and run one after another:

| All 702 QA requests | Total time |
|---|---:|
| Qwen3.6-35B, Vulkan b11669 | **1,063 s** |
| Qwen3.6-35B, ROCm build (my previous production setup) | 1,269 s |
| Bolt, best drafter setting | 1,396 s |
| Bolt, NVIDIA's recommended drafter setting | 1,613 s |

Bolt beat the ROCm Qwen on only two kinds of request, both about a single still image: plate questions (1.78 s median against 1.97 s) and bounding boxes (2.36 s against 2.97 s). Against Qwen on the Vulkan build it won none. Every video request took it about a second longer, 30 to 70% more time.

## Speculative decoding: NVIDIA's setting was wrong for my card

Bolt ships with a small "drafter" model. The drafter guesses the next few tokens cheaply, and the big model checks all the guesses in one pass. Every guess it accepts is a token you did not have to generate the slow way. When the guesses are good, you get several tokens for the price of one. When they are poor, the checking costs more than it saves.

NVIDIA's recipe for 32 GB cards drafts up to **7 tokens** at a time (6 in its 28 GB recipe). On my R9700s with the Vulkan build, that was slower than no drafter at all for most text. Shorter drafts worked much better. Speeds are for 512-token chat answers with thinking off, in tokens per second:

| Task | No drafter | Draft 3 | Draft 4 | Draft 7 (NVIDIA's 32 GB recipe) |
|---|---:|---:|---:|---:|
| Writing code | 69 | 91 | **97** | 75 |
| Writing prose | 69 | **78** | 72 | 50 |
| Writing JSON | 69 | 85 | **87** | 67 |

With 7 drafted tokens, fewer than half were accepted on prose, so most of the checking was wasted work. With 3 or 4, between 46% and 78% were accepted. The drafter also slowed prompt processing by 10 to 12%, because it reads the prompt too.

Even at its best setting, Bolt topped out around Qwen's speed on the ROCm build (94 tokens per second) and well below Qwen on Vulkan (124). The lesson I would pass on: a vendor's drafter setting is tuned for their hardware. Measure a few values on yours.

## Quality: where the two models disagreed

Both models were well behaved at the basics. **All 1,404 answers were valid JSON**: none ran out of tokens, and neither leaked any thinking text. The differences are in what they said.

Agreement means both models gave the same yes/no answer, count or "found it" verdict to the same question. It is counted per question, and some requests ask several questions at once, so the disagreement counts can be larger than the number of requests:

| Check | Requests | Agreement | Where they differed |
|---|---:|---:|---|
| Frame yes/no questions | 74 | 77.5% | Bolt said yes 44 times where Qwen said no; 9 the other way |
| Bounding boxes, item found | 54 | 94.7% | Boxes overlapped closely (median IoU 0.86) |
| Per-frame checklist | 86 | 72.8% | Bolt said yes 65 times where Qwen said no; 23 the other way |
| Clip shows its action (video) | 43 | 69.8% | Bolt said yes 12 times where Qwen said no; 1 the other way |
| Clip matches *another* clip's action (video) | 43 | 55.8% | Bolt said yes 19 more times |

Three findings decided it.

**1. Bolt broke my parser on head counts.** Each head-count answer is a list with an item number `n` for each thing being counted. For the question "1. women", Qwen answers `{"n": 1, "count": 2}`. Bolt very often answered `{"n": 2, "count": 2}`, putting the count where the item number belongs. My parser looks for item 1, finds nothing, and records **zero people**. Only 92 of Bolt's 344 head-count answers were in a shape the parser could read, against 305 for Qwen. When I read the answers by hand, generously, the two models gave the same count 87% of the time. So Bolt can count fine; it just fills in the form wrongly.

**2. Bolt could not tell video clips apart.** My beat check includes a trap: alongside "does this clip show *its* action?", it asks "does this clip show the action from a *different* clip?" A good judge says no. Bolt said yes to the other clip's action on **23 of 43 clips**, which makes those checks worthless. Qwen did that on 4. NVIDIA's model card says Bolt's vision adapter was trained on images only, with no video, which fits.

**3. Bolt is far more lenient.** It passed **25 of 45** storyboard frames; Qwen passed **11**. On both frame questions and checklists, almost all disagreements were Bolt saying "yes, that's fine" where Qwen said no. I have not hand-labelled the disagreements yet, so I can't say whether Qwen is too strict or Bolt misses real defects. For a quality checker, though, I would rather have the strict one: a false alarm costs me a look, a missed defect ends up in the film.

## The surprise: same model, different build, 16% faster

To make the speed comparison fair, I also ran Qwen on the same Vulkan build as Bolt. Until then, my production vision server ran a ROCm build of llama.cpp ([Lemonade](https://github.com/lemonade-sdk/llamacpp-rocm)'s build for RDNA4). The two builds behave very differently on the same card and the same model:

| Qwen3.6-35B on one R9700 | ROCm build b1336 | Vulkan build b11669 |
|---|---:|---:|
| Read an 8k-token prompt | **4,526** tokens/s | 2,610 tokens/s |
| Read a 115k-token prompt | **2,654** tokens/s | 1,765 tokens/s |
| Write, chat answers | 94 tokens/s | **124** tokens/s |
| All 702 QA requests | 1,269 s | **1,063 s** |

ROCm reads long prompts much faster; Vulkan writes about 30% faster. My QA requests are short, between 550 and 3,300 tokens of prompt, where both builds read at roughly the same speed. So generation dominates, and Vulkan finished the whole pass **16% faster**. The answers matched on 95 to 99% of decisions, which is the normal noise between two builds of the same model.

I switched my vision server to the Vulkan build that afternoon, keeping a switch to go back. If I ever send it a whole film as one long video, the ROCm build would read it faster, so the right answer depends on the workload.

## A memory trap worth knowing on Windows

llama.cpp can load a model by memory-mapping the file (`--load-mode mmap`). On my first Bolt start that mode kept the **entire 22 GB file resident in system RAM**, even though the weights had already been copied to the GPU. Free host memory dropped from 23 GB to **0.5 GB**, which is dangerous on a machine also running three ComfyUI instances. With the default load mode, free RAM never went below **30 GB** and the model still loaded in under half a minute. If you have a lot of VRAM and modest system RAM, check what your loader leaves behind.

## What I changed

- **Qwen3.6-35B stays as the vision model**, now on the Vulkan build, which runs my QA workload 16% faster.
- **The pipeline's answer formats get stricter.** Qwen also misnumbered 39 of its 344 head-count answers, so my pipeline was already undercounting at times. The fix is to tell the model, through the JSON schema, exactly which item numbers are allowed. llama.cpp then enforces it during generation. That helps any model.
- **Bolt's launcher keeps a 4-token draft** in case I test it again, for example on agent tasks where its benchmarks are strongest.

## Caveats

- This is one rig, one workload and one run per setting. It says nothing about Bolt's agent, browsing or terminal skills, which are what NVIDIA optimised it for, and which I did not test.
- Bolt ran on day-one llama.cpp support, on Vulkan only. A ROCm build with Bolt support was not out yet and may well be faster.
- This compares what fits on a 32 GB card: a 2-bit 74B model against a 4-bit 35B one, with different architectures and vision encoders. It is not a comparison of the models at equal precision.
- Agreement is not accuracy. Where the models disagree, I still need to label who was right.

If you are choosing a local vision model for automated checks, my main takeaway is to replay your own requests. Leaderboards could not have told me that one model would fill in my JSON wrongly, or that a different build of the same model would save me 16% of my waiting time.

[Download the recorded measurements](/assets/neox1/bolt-vs-qwen-results.csv).

---

*Tested 16 October 2026 on the GMKtec NEO-X1 Pro build: two Radeon AI PRO R9700 32 GB cards behind a Broadcom PEX88096 switch, Windows 11, AMD Adrenalin 26.9.2. Models: [Nemotron 3.5 Bolt 74B-A9B](https://research.nvidia.com/labs/nemotron/Nemotron-3.5-Bolt-24GB/) ([Unsloth GGUF](https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF), byte-identical to NVIDIA's IQ2_XXS) and [Qwen3.6-35B-A3B](https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF). Runtime: [llama.cpp](https://github.com/ggml-org/llama.cpp) b11669 (v0.7.0, which added Bolt in [PR #30520](https://github.com/ggml-org/llama.cpp/pull/30520)) and [Lemonade llamacpp-rocm](https://github.com/lemonade-sdk/llamacpp-rocm) b1336. Raw speed rows use 128 generated tokens after each prompt; chat rows use 512 tokens, greedy, thinking off.*
