---
layout: post.njk
title: "GitHub Copilot for Teams: What It Is, How to License It, and How It Bills"
date: 2026-06-29
tags: [posts, github, github-copilot, ai, developer-tools, vs-code, productivity]
category: AI
excerpt: "Now that the Git fundamentals are in place, this post adds GitHub Copilot on top: what it actually is, how the plans differ, how the new AI Credits billing works as of June 2026, and how to fold it into the daily commit-branch-PR process without burning through your allowance."
---
<!-- markdownlint-disable -->

# GitHub Copilot for Teams: What It Is, How to License It, and How It Bills

In the [Git for Teams post](/posts/2026-06-18-git-for-teams-github-copilot/) I made a point of putting Copilot last, because it's far more useful once you understand the workflow it's accelerating. This post picks up exactly there. You know the commit-branch-PR process now, so let's add the AI on top of it: what Copilot actually is, which plan to pick, how the billing works after the June 2026 change, and how to connect it to the work you're already doing.

One warning up front. This is the topic that changes faster than anything else I write about. Models, plan names, and billing all shift on a near-monthly cadence. Everything here is current as of **June 2026**.

## What GitHub Copilot Actually Is

Copilot is an AI assistant that lives inside your editor and a few other tools. It's a handful of features that share a subscription, and the difference between them matters for both how you work and what you pay.

| Feature                   | What it does                                                                     | Where it fits the Git workflow                                |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Code completions**      | Inline "ghost text" as you type                                                  | Writes the boilerplate so commits are about logic, not typing |
| **Next edit suggestions** | Predicts your *next* change after the current one                                | Keeps a refactor moving across a file                         |
| **Chat (Ask mode)**       | Answer questions in natural language                                             | "What does this `git rebase` do?" without leaving the editor  |
| **Chat (Edit mode)**      | Apply targeted edits across files you pick                                       | Make a reviewer's requested change quickly                    |
| **Chat (Agent mode)**     | Plans and runs multi-step tasks, including terminal commands, with your approval | Larger changes across many files                              |
| **Copilot CLI**           | Copilot in the terminal                                                          | Ask for a command or let it work in a repo from the shell     |
| **Code review**           | Reviews a PR or a selection in your IDE                                          | A first pass before a human reviewer                          |
| **Cloud agent**           | Runs a task on GitHub's infrastructure and opens a PR                            | Hand off a scoped task and review the result                  |

The two things to remember: **completions** are the passive, type-and-accept experience, and **agent mode** is the active, give-it-a-task experience. Most of the cost conversation later comes down to that distinction.

Under all of these is a catalog of models from OpenAI, Anthropic, and Google, plus an **auto model selection** option that picks one for you. I'm not going to list specific model names here, because that list turns over faster than any other part of Copilot and anything I print will be outdated within weeks. Pick a model per chat from the model picker, or leave it on auto and let Copilot choose.

## Picking a Plan

There are seven plans. Most people only need to understand which bucket they're in: individual, or covered by an organization.

| Plan           | Price (June 2026)        | Who it's for                                                                         |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------ |
| **Free**       | $0                       | Trying it out. Limited features, auto model selection only, 2,000 completions/month  |
| **Student**    | Free (verified students) | Students. Unlimited completions, limited chat and agent use                          |
| **Pro**        | $10/month                | Individual developers who want the full feature set                                  |
| **Pro+**       | $39/month                | Power users who want a bigger monthly allowance and premium models                   |
| **Max**        | $100/month               | High-volume users who want the largest individual allowance                          |
| **Business**   | $19/seat/month           | Teams and organizations, with central policy control                                 |
| **Enterprise** | $39/seat/month           | Enterprises on GitHub Enterprise Cloud, with a larger shared pool and extra controls |

A few things worth knowing before you pick:

- **Max is the newest tier.** If you've been on Pro+ and still hit your ceiling regularly, Max is the step above it. If you've never run out, you don't need it.
- **Business and Enterprise are seat-based and managed centrally.** An admin assigns seats, sets policy, and the org gets a shared pool of usage rather than each person managing their own.
- **There's a temporary sign-up pause.** As of April 22, 2026, new self-serve sign-ups for Copilot Business on organizations using GitHub Free and GitHub Team plans are paused. If that's you, you'll be routed to sales rather than self-serve.
- **Enterprise Server is out.** Copilot isn't available for GitHub Enterprise Server, only the cloud.

For a verified student, the Student plan is the obvious starting point. For most working developers paying their own way, Pro at $10 is the move. For a team, this should be a conversation with whoever owns your GitHub org, not an individual purchase.

## How Billing Works: GitHub AI Credits

This is the part that changed recently.

As of **June 1, 2026**, Copilot usage is measured in **GitHub AI Credits**. The old "premium requests" model, where each prompt counted as one request against a monthly quota, is now legacy. It only still applies to Pro and Pro+ subscribers on an existing *annual* plan who chose to stay on it. Everyone else is on credits.

Here's the model in simplified terms.

**Every interaction consumes tokens**, the input you send, the output the model generates, and cached context it reuses. Those tokens are priced per model, and the total is converted into credits at a fixed rate:

```
1 AI credit = $0.01 USD
```

So a quick question to a lightweight model costs a fraction of a credit. A long agent-mode session that reads and edits a dozen files with a frontier model costs many credits, because it's doing far more work. The cost tracks the work, not a flat per-prompt count.

Each paid plan includes a **monthly allowance** of credits, made up of two parts:

- **Base credits** are included with your subscription and never change.
- **Flex allotment** is an extra monthly amount on top, which GitHub adjusts over time as model pricing and efficiency change. Your base is spent first, then the flex kicks in automatically.

| Plan           | Base   | Flex   | Total credits/month |
| -------------- | ------ | ------ | ------------------- |
| **Pro** ($10)  | 1,000  | 500    | **1,500**           |
| **Pro+** ($39) | 3,900  | 3,100  | **7,000**           |
| **Max** ($100) | 10,000 | 10,000 | **20,000**          |

At one cent per credit, Pro's 1,500 credits is about $15 of model usage included on a $10 plan. Business and Enterprise get their own shared monthly pools managed at the org level rather than per person.

### What's free and what isn't

This is useful to understand, because it changes how you will work:

- **Code completions and next edit suggestions are not billed in credits.** They're unlimited on every paid plan. The type-and-accept experience that you use all day, every day, costs you nothing against your allowance.
- **Credits are spent by the AI-heavy features:** Copilot Chat (ask, edit, and agent modes), Copilot CLI, the cloud agent, Spaces, and Spark.

In other words, the passive autocomplete you lean on constantly is free, and you only draw down credits when you actively ask Copilot to reason or act for you. That's a much more forgiving model than it sounds at first.

### What happens when you run out

Three options available to you:

1. **Upgrade.** As you approach your limit, Copilot prompts you to move up a tier. You only pay the *difference* between plans, and your earlier usage counts against the new, larger allowance, so the extra credits are available immediately.
2. **Pay for more usage.** Set a dollar budget for additional credits at the same $0.01 rate. A $10 budget buys 1,000 more credits.
3. **Wait it out.** Allowances reset on the 1st of each month at 00:00 UTC. Unused credits don't roll over.

One nice detail: if you're on a paid plan and use **auto model selection** in chat, the CLI, or the cloud agent, you get a 10% discount on model costs. Letting Copilot pick the model is both simpler and slightly cheaper.

## Keeping Credit Usage Sane

You don't need to babysit this, but a few habits stretch the allowance out:

- **Lean on completions, they're free.** The more of your day is type-and-accept autocomplete, the less of your allowance you touch. Reserve chat and agent mode for the things that genuinely need reasoning.
- **Match the model to the task.** A quick "explain this function" doesn't need a frontier reasoning model. Auto selection handles this for you, and gives you the 10% discount on top.
- **Scope agent tasks tightly.** A vague "improve this app" sends the agent wandering across files and runs up credits. A specific "add input validation to the login form and a test for it" does the same useful work for a fraction of the cost.
- **Don't re-run a giant prompt hoping for a better answer.** Rephrase or narrow it instead. Resubmitting a long, complex prompt repeatedly is one of the easiest ways to burn credits with nothing to show for it.
- **Watch the meter.** In VS Code, click the Copilot icon in the status bar to see your usage and reset date. You can also see a full breakdown under **Billing and licensing** on GitHub.com. Make sure your editor is current, too: VS Code 1.120 or later is needed to display pricing and usage correctly.

## Working It Into the Daily Process

This is where it connects back to the Git workflow from the last post.

**Commit messages.** In the Source Control panel, Copilot can draft a message from your staged diff. You still read and adjust it, but it turns the blank box into edit-and-go. This costs credits (it's a chat interaction), but it's a cheap one.

**Reviewing a PR.** When you're reviewing a teammate's pull request and hit a pattern you don't recognize, ask Copilot Chat to explain the diff in plain language before you approve. The same goes the other way: Copilot code review can take a first pass over your own PR before a human looks at it, catching the obvious stuff so the human review is about substance.

**Resolving a merge conflict.** Copilot can propose a merged version of a conflicted block. This is the part where the last post's material comes in clutch, you have to know whether its suggestion is correct. Copilot resolving a conflict you don't understand is how bad code reaches `main`.

**The routine artifacts.** Tests, a `.gitignore`, a bit of boilerplate config, these are well-understood, low-risk things Copilot generates reliably so you can spend your attention on the real work.

**Agent mode for the bigger jobs.** When a change spans many files, agent mode can plan it, make the edits, and run terminal commands, asking your approval before each step. That approval step is only protection if you can read what it's about to do, which is the whole reason the Git post came first. Treat each approval as a real review, not a rubber stamp.

A realistic process looks like this:

```
1. Pull latest, branch for the feature        (you)
2. Write code with completions filling boilerplate   (Copilot, free)
3. Ask chat to explain an unfamiliar API             (Copilot, cheap)
4. Stage changes, let Copilot draft the commit msg   (Copilot, cheap)
5. Open the PR, run Copilot code review first        (Copilot)
6. Address review comments with edit mode            (Copilot)
7. Resolve any conflict yourself, sanity-check AI     (you + Copilot)
8. Merge
```

Completions carry the typing for free all day, and you spend credits deliberately at a few points where reasoning actually helps you. 

## Setting It Up

The install:

1. In VS Code, install the **GitHub Copilot** and **GitHub Copilot Chat** extensions.
2. Sign in with a GitHub account that has a Copilot plan (Free works to start).
3. Confirm you're on VS Code **1.120 or later** so usage and pricing display correctly.
4. Optionally, add **custom instructions** (a `.github/copilot-instructions.md` in your repo) so Copilot follows your team's conventions, and connect **MCP servers** to give it access to tools and data beyond the editor. Both are topics I'll come back to.

Microsoft's [Copilot in VS Code docs](https://code.visualstudio.com/docs/copilot/setup) cover the install in detail, and GitHub's [plans page](https://docs.github.com/en/copilot/get-started/plans) is the authoritative, always-current source for pricing and what each tier includes.

## To Sum it up

Completions are the free, always-on aspect to take advantage of. Chat and the agent are the approach you take when you need reasoning or action, and that's what draws down your credits. Pick the plan that matches how much of the latter you actually use, and let free completions do the heavy lifting the rest of the time.

From here the interesting work is customization: custom instructions, prompt files, agent workflows, and MCP servers that connect Copilot to your real tools. That's where it stops being autocomplete and starts being a genuine part of the team's process. More on that in the next posts.

For the canonical references that stay current as this changes, start with [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans) and [Usage-based billing for individuals](https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-individuals).
