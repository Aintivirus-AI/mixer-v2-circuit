# Aintivirus Mixer v2 — Trusted Setup Ceremony
## Community Contribution Guide — Phase 2 (Open Participation)

---

## 1. What Is This Ceremony?

The Aintivirus Mixer v2 is a privacy-preserving smart contract that uses **zkSNARKs** (zero-knowledge succinct non-interactive arguments of knowledge) to let users transact privately on-chain.

For zkSNARKs to work, a special one-time setup must be performed to generate the cryptographic parameters the system relies on. This is called a **Trusted Setup Ceremony**. The security of the entire protocol depends on this process being done correctly.

The ceremony is structured as a **multi-party computation (MPC)**: as long as at least one participant is honest and destroys their secret randomness (called "toxic waste"), the resulting parameters are secure — even if every other participant was malicious. The more independent participants join, the stronger the guarantee.

> 🔐 **The Core Security Property**
> As long as ONE participant is honest and destroys their randomness, the parameters are cryptographically secure — even if all other participants colluded. Your contribution matters.

---

## 2. Ceremony Structure

| Phase | Description | Who participates? |
|---|---|---|
| **Phase 1** — Powers of Tau | Universal, circuit-agnostic setup. | Already done — we reuse the PSE Perpetual Powers of Tau. |
| **Phase 2** — Circuit-Specific ✅ | Tied specifically to the Mixer v2 circuit. | Open to the community — this is you! |

Phase 2 is where you come in. The team has initialized the ceremony and made the first contribution. Each community participant takes the previous `.zkey` file, adds their own randomness, and publishes a new file. Contributions are **sequential** — you always build on the last person's work.

---

## 3. Prerequisites

Before contributing, make sure you have the following:

- **Node.js** (v16 or later) — [nodejs.org](https://nodejs.org)
- **snarkjs** — install globally with `npm install -g snarkjs`
- **Git** and a GitHub account — to submit your contribution via Pull Request
- **~1 GB of free disk space** — the `.zkey` files are large

Verify snarkjs is ready by running:

```sh
snarkjs --version
```

> ⚠️ **Windows Users:** The entropy command uses `/dev/urandom` which is Unix-only. Use WSL (Windows Subsystem for Linux) or substitute a long random string manually for the `-e` flag.

---

## 4. Step-by-Step Contribution Guide

The following steps must be followed **in order**. Contributions are sequential — you must always start from the latest accepted `.zkey` file.

---

### Step 1 — Fork and Clone the Repository

Fork the ceremony repo on GitHub, then clone your fork locally:

```sh
git clone https://github.com/<YOUR_USERNAME>/mixer-v2-circuit.git
cd mixer-v2-circuit
```

Add the upstream remote so you can always pull the latest state:

```sh
git remote add upstream https://github.com/Aintivirus-AI/mixer-v2-circuit.git
```

---

### Step 2 — Get the Latest Contribution

Sync your local copy with the upstream repository:

```sh
git fetch upstream
git checkout main
git merge upstream/main
```

> ⚠️ **Check for open Pull Requests first.** If there is an open PR on the upstream repository, you MUST continue from that PR's `.zkey` file, not from `main`. Download it from the open PR and use it as your input. Contributions must be strictly sequential.

The latest `.zkey` file will be in the `build/` directory, following the naming pattern `mixer_NNNN.zkey` (e.g. `mixer_0003.zkey`).

---

### Step 3 — Download the Phase 1 ptau File

You'll need this file for the verification step. It's large (~1 GB) and publicly audited — download it once and reuse it:

```sh
wget https://pse-trusted-setup-ppot.s3.eu-central-1.amazonaws.com/pot28_0080/ppot_0080_14.ptau
```

---

### Step 4 — Verify the Previous Contribution

Before adding your own contribution, cryptographically verify that the existing chain is valid. Replace `mixer_NNNN.zkey` with the actual latest filename:

```sh
snarkjs zkey verify build/mixer.r1cs ppot_0080_14.ptau build/mixer_NNNN.zkey
```

A successful verification ends with:

```
[INFO]  snarkJS: ZKey Ok!
```

> ❌ **If verification fails, do not proceed.** Contact the Aintivirus team immediately — it may indicate a corrupted contribution.

---

### Step 5 — Make Your Contribution

Increment the file number by one (e.g. if input is `mixer_0003.zkey`, output should be `mixer_0004.zkey`). Replace `"Your Name or Handle"` with any identifier you'd like to appear in the public transcript:

```sh
snarkjs zkey contribute \
    build/mixer_NNNN.zkey \
    build/mixer_MMMM.zkey \
    --name="Your Name or Handle" \
    -v \
    -e="$(head -c 1000 /dev/urandom | base64)"
```

This will take a few minutes depending on your hardware.

> 🔑 **About Toxic Waste:** The randomness generated during this step is your "toxic waste". Once the command finishes, it is gone — it is never written to disk. You do not need to do anything special to destroy it, but you should not attempt to save or log the entropy value.

---

### Step 6 — Submit Your Contribution via Pull Request

Create a new branch, add your `.zkey` file, and push it:

```sh
git checkout -b contribution/your-name
git add build/mixer_MMMM.zkey
git commit -m "Add contribution: Your Name or Handle"
git push origin contribution/your-name
```

Then open a Pull Request on GitHub against the upstream `main` branch. In the PR description, please include:

- Your contributor name or handle
- The input and output filenames (e.g. `mixer_0003.zkey` → `mixer_0004.zkey`)
- Confirmation that you ran the verification step and it passed

---

## 5. Frequently Asked Questions

**Do I need to understand zkSNARKs to contribute?**
No. You just need to follow the steps above. What matters is that you run the commands on your own machine and don't share the entropy value with anyone.

**What if I'm on Windows?**
The `head -c 1000 /dev/urandom | base64` command is Unix-only. Use WSL (Windows Subsystem for Linux) or manually provide a long random string to the `-e` flag instead.

**How long does it take?**
Typically 2–10 minutes depending on your machine's CPU.

**Can I contribute more than once?**
Yes, but please let others go first. The goal is to maximize the number of independent participants to strengthen the security guarantee.

**What happens after all contributions are collected?**
The team will finalize the ceremony by applying a public random beacon (such as a future Bitcoin or Ethereum block hash), then export the final verification key and Solidity verifier contract. Everything will be made public for independent auditing.

---

*Thank you for helping secure the Aintivirus Mixer v2 for everyone.*
