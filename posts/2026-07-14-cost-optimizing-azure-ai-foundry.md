---
layout: post.njk
title: "Cost-Optimizing Azure AI Foundry: Tokens, PTUs, and the Provisioning Decision"
date: 2026-07-14
tags: [posts, azure, foundry, ai, finops, cost-management, optimization, ptu, azure-openai]
category: FinOps
excerpt: "Foundry's cost model is a fork in the road: pay-as-you-go tokens versus provisioned throughput units. Pick wrong and you either throttle in production or pay for idle capacity. A starting-point guide to deployment types, PTU reservations, batch, prompt caching, and the model router."
---
<!-- markdownlint-disable -->

# Cost-Optimizing Azure AI Foundry: Tokens, PTUs, and the Provisioning Decision

This is a deep dive in the [Azure Cost Optimization Playbook](/posts/2026-07-14-azure-cost-optimization-playbook/) series, and it has a companion piece. Before or after this one, read [Why AI Cost Optimization Is Different from Traditional FinOps](/posts/2026-04-22-finops-for-ai/) — that post explains *why* AI spend breaks the usual FinOps rules (volatile pricing, token-based billing, non-deterministic output). This post is the practical follow-up: given that AI is different, here's how you actually configure Azure AI Foundry to hit your performance goals without overpaying.

If you're deploying your first model, the single decision that determines most of your bill is coming up in the next section. Get it right and everything else is tuning.

> **Current as of July 2026.** Foundry moves faster than almost anything on Azure — model names, deployment types, and pricing shift constantly, and the portal now spans both "Azure AI Foundry" and "Microsoft Foundry" branding. Everything here comes from Microsoft's [Foundry documentation](https://learn.microsoft.com/azure/ai-foundry/), but confirm current model pricing in the [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/).

---

## The fork in the road: pay-per-token vs. provisioned

Here's the model in simplified terms. Every model deployment in Foundry bills one of two ways:

- **Pay-as-you-go (per token).** You're charged for the input and output tokens you actually consume. No idle cost, no commitment. Cost scales directly with usage.
- **Provisioned throughput (per PTU-hour).** You reserve dedicated model-processing capacity — measured in **Provisioned Throughput Units (PTUs)** — and pay an hourly rate for it whether or not you send a single request.

That's the whole decision, and it maps cleanly onto traffic pattern:

| Your traffic looks like… | Use… | Why |
| --- | --- | --- |
| Spiky, unpredictable, low or early-stage volume | **Pay-as-you-go (Standard)** | You pay only for what you use; no idle capacity to waste |
| Steady, high, sustained, latency-sensitive production | **Provisioned (PTUs)** | Predictable performance and lower effective cost at scale |
| Huge, non-urgent, asynchronous jobs | **Batch** | Half the cost of standard (more below) |

The expensive mistakes are the mismatches. Provisioning PTUs for a workload that only spikes a few hours a day means paying 24/7 for capacity you use part-time. Running a high-volume, latency-critical production app on pay-as-you-go means variable cost and no throughput guarantee — and you'll eventually hit rate limits at the worst moment.

---

## Deployment types, and where each one saves money

Foundry's [deployment types](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/deployment-types) are more than a performance choice — each has a distinct cost profile:

- **Standard** — pay-per-token, no latency SLA. The right default for development, variable traffic, and anything you're still validating.
- **Priority processing** — pay-per-token but on a priority tier for lower, more consistent latency. You pay more per token for the privilege; use it only where latency genuinely matters and you're not ready to provision.
- **Batch (Global Batch)** — for large asynchronous jobs, processed with a **24-hour target turnaround at 50% less cost than global standard**, using a separate token quota so it never disrupts your online workloads. If you're generating product descriptions, summarizing document archives, or bulk-classifying data, this is the single biggest discount available and it's criminally underused.
- **Provisioned throughput** — dedicated PTU capacity for high, predictable throughput. Comes in **Regional Provisioned, Data Zone Provisioned, and Global Provisioned** flavors, trading data-residency scope against availability and price.

The less-obvious insight: **you don't have to pick one for your whole application.** A mature setup often runs provisioned capacity for the latency-critical interactive path, standard pay-as-you-go for spillover and dev, and batch for the overnight bulk work — each workload on the pricing model that fits it.

---

## Sizing PTUs: don't guess

PTUs are granted as region-specific quota, and getting the count right is the core of provisioned cost optimization. Too few and you throttle; too many and you pay for idle capacity.

Don't eyeball it. Microsoft ships a [capacity calculator](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/provisioned-throughput-onboarding) — both a standalone PTU calculator and a planner built into the deployment dialog — that turns your expected traffic (requests per minute, prompt size, generation size) into a PTU recommendation. A couple of things to feed it accurately:

- **Output tokens cost more than input tokens.** Generations are more expensive to produce than prompts, and models price input and output throughput separately per PTU. A chatty, long-answer workload needs more PTUs than a short-classification one at the same request rate.
- **Model choice changes the math.** Different flagship models yield different tokens-per-PTU, so the "right" PTU count is model-specific. Re-run the calculator when you change models.

Provisioned deployments also give you flexibility that helps cost: a broad choice of flagship models (Azure OpenAI plus DeepSeek, Grok, Llama, and others) and the ability to switch models within your quota — so you can move to a cheaper sufficient model without renegotiating capacity.

---

## PTU billing and the reservation discount

Provisioned deployments are charged an **hourly rate ($/PTU/hr) on the number of PTUs deployed**, prorated to the minute. A 300-PTU deployment that exists for 15 minutes pays a quarter of one hour's charge; resize it and the cost adjusts immediately.

That per-minute proration is itself a cost lever: **hourly provisioned billing is ideal for short-term needs** — benchmarking a new model, or temporarily adding capacity for a launch or hackathon — because you can spin it up, use it, and tear it down without a long commitment.

But for *sustained* production use, hourly is the expensive way to pay. That's where [Azure Reservations for Foundry Provisioned Throughput](https://learn.microsoft.com/azure/cost-management-billing/reservations/microsoft-foundry) come in. You commit to a fixed number of PTUs for a **one-month or one-year** term and get a discount on top of the hourly rate. Details that matter:

- **Purchased in the Azure portal, not the Foundry portal**, and scoped flexibly — to a resource group, subscription, management group, or the whole billing account — so one reservation can cover several deployments.
- **Matched hourly; unused reserved PTUs don't carry forward.** Reserve 300 PTUs but deploy 100, and the discount only applies to the 100 you're running. The other 200 are wasted for that hour. Reserve what you *actually run continuously*.
- **Reservations apply across Foundry Models** (Azure OpenAI, DeepSeek, and others), and match Regional, Data Zone, or Global provisioned deployments accordingly.

Same discipline as everywhere in this series: **prove your steady-state PTU baseline on hourly pricing first, then reserve it.** Reserving before you know your baseline just locks in a guess.

---

## The cost levers people forget

Beyond the deployment-type decision, three features quietly cut AI spend and new users routinely miss them:

1. **Prompt caching.** For [supported models](https://learn.microsoft.com/azure/foundry/openai/how-to/prompt-caching), if the *beginning* of your prompt is identical across requests — a long system prompt, a fixed instruction block, a shared context — the cached input tokens are billed at a discount on Standard deployments, and at **up to a 100% discount on input tokens on Provisioned deployments.** If you have a big static system prompt, structure it to sit at the front of every request and let caching do the rest. It also cuts latency.
2. **The [model router](https://learn.microsoft.com/azure/ai-foundry/openai/concepts/model-router) (preview).** A single deployment that inspects each prompt and routes it to the cheapest model that can handle it well — reserving your expensive flagship for the prompts that actually need it. For mixed workloads, that's real money saved without a quality hit on the hard prompts.
3. **Batch for anything that can wait.** Worth repeating because it's the biggest single discount: if a job doesn't need a real-time answer, running it through Global Batch cuts the token cost in half.

---

## When multiple apps share your models: the AI gateway

Everything so far assumes you're tuning one deployment. The moment you have *several* apps, teams, or departments calling the same model endpoints, a new class of cost problem appears: one noisy app burns the whole TPM quota and starves everyone else, and you have no clean way to see who's spending what. That's the job of an **AI gateway** — and on Azure the built-in option is [API Management's GenAI gateway capabilities](https://learn.microsoft.com/azure/api-management/genai-gateway-capabilities), which sit in front of Foundry and give you cost controls you can't set on the deployment alone. Microsoft keeps a running catalog of the policies and sample implementations at the [API Management AI resources hub](https://azure.github.io/api-management-resources/).

The cost-relevant pieces:

- **Token limit policy.** Set a TPM limit *or* a token quota — hourly, daily, weekly, monthly, or yearly — per consumer with the [token limit policy](https://learn.microsoft.com/azure/api-management/azure-openai-token-limit-policy). Think of it as the enterprise version of the per-deployment rate limit: it stops any single app from eating the shared quota, and the quota window turns it into a real budget guardrail rather than just a throttle.
- **Semantic caching.** This is the one people conflate with prompt caching, and they're different. Foundry's built-in prompt caching only fires when the *beginning* of a prompt is byte-identical. APIM's [semantic caching](https://learn.microsoft.com/azure/api-management/azure-openai-enable-semantic-caching) goes further — using embeddings and an external cache (Azure Managed Redis), it returns a stored completion when a new prompt is *semantically similar* to an earlier one, not just identical. For workloads full of rephrased-but-equivalent questions (support bots, FAQs), that reuse cuts token consumption on top of what prompt caching already saves.
- **Token metrics per consumer.** The [emit-token-metric policy](https://learn.microsoft.com/azure/api-management/llm-emit-token-metric-policy) pushes per-app, per-team token counts into Application Insights. That's your **Inform** layer for AI at scale: real showback and chargeback, so the teams generating the spend actually see it.
- **Load balancing across backends.** A gateway can spread traffic across multiple deployments — for example, PTU as the primary backend with pay-as-you-go as spillover — so you get provisioned economics for the baseline and elastic tokens for the peaks, without every app hardcoding endpoints.

You don't need any of this on day one. But the day a second team starts calling your models, the gateway is how you keep one workload from blowing up everyone's bill — and how you find out where the money is actually going.

---

## Inform and Operate: closing the loop

The [FinOps for AI post](/posts/2026-04-22-finops-for-ai/) covers this in depth, so briefly, mapped to the cycle:

- **Inform.** Tag your Foundry resources like anything else, turn on the usage dashboards, and set **per-deployment token rate limits** in the portal so no single workload can consume all your capacity — a cost *and* reliability guardrail. When multiple apps share a model, emit per-consumer token metrics through the AI gateway so spend is attributable, not a single anonymous bill. Identify your highest-cost workload and compute its cost-per-inference; that becomes your optimization baseline.
- **Optimize.** Everything above — right deployment type, right PTU count, reservations on the baseline, caching, routing, batch.
- **Operate.** Tear down idle deployments (remember: hourly proration means an unused provisioned deployment is pure waste), review reservation coverage as traffic grows, and get into architecture and prompt-design decisions early — that's where the biggest AI savings actually live.

---

## To Sum it up

Foundry cost optimization starts with one decision: pay-as-you-go tokens for spiky and early-stage workloads, provisioned PTUs for steady high-throughput production, batch for anything asynchronous. Size PTUs with the calculator rather than guessing, remember output tokens cost more than input, and let per-minute proration serve short-term spikes. Once your baseline is stable, a one-month or one-year PTU reservation discounts it. Then layer on the forgotten levers — prompt caching (up to 100% off cached input on provisioned), the model router, and 50%-off batch — and you've configured for performance and cost at the same time. And once more than one team shares your models, put an AI gateway in front to cap per-consumer tokens, cache semantically similar prompts, and meter who's spending what.

For the *why* behind all of this — why AI pricing is so volatile and what that means for your practice — read the companion piece: [Why AI Cost Optimization Is Different from Traditional FinOps](/posts/2026-04-22-finops-for-ai/).

Next in the series: [Cost-Optimizing Azure Storage](/posts/2026-07-14-cost-optimizing-azure-storage/), where the discipline shifts from compute to the hundreds of tiny charges that add up across terabytes and petabytes.

---

## References

- [Deployment types for Azure AI Foundry Models](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/deployment-types)
- [Understanding costs associated with PTUs](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/provisioned-throughput-onboarding)
- [Provisioned throughput concepts](https://learn.microsoft.com/azure/ai-foundry/openai/concepts/provisioned-throughput)
- [Global Batch](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/batch)
- [Prompt caching](https://learn.microsoft.com/azure/foundry/openai/how-to/prompt-caching)
- [Model router](https://learn.microsoft.com/azure/ai-foundry/openai/concepts/model-router)
- [Save costs with Microsoft Foundry Provisioned Throughput Reservations](https://learn.microsoft.com/azure/cost-management-billing/reservations/microsoft-foundry)
- [AI gateway capabilities in Azure API Management](https://learn.microsoft.com/azure/api-management/genai-gateway-capabilities)
- [Limit Azure OpenAI API token usage policy](https://learn.microsoft.com/azure/api-management/azure-openai-token-limit-policy)
- [Enable semantic caching for LLM APIs in API Management](https://learn.microsoft.com/azure/api-management/azure-openai-enable-semantic-caching)
- [API Management AI resources hub](https://azure.github.io/api-management-resources/)

*Part of the [Azure Cost Optimization Playbook](/posts/2026-07-14-azure-cost-optimization-playbook/) series. Companion: [FinOps for AI](/posts/2026-04-22-finops-for-ai/).*
