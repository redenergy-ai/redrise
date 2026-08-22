# Repository Visibility Reminder

## ⚠️ The Issue

This repository (`redenergy-ai/redrise`) is currently **public** because it was created as a **fork** of the upstream MedOS repository.

Due to GitHub's policy, **visibility cannot be changed directly** on a fork. The "Change visibility" option is greyed out/blocked.

---

## 🎯 Action Required

We need to decide how to handle this. Leaving it public may expose code, configurations, or early-stage work that we want to keep private.

---

## 📋 Options

| Option | Description | Recommendation |
| :--- | :--- | :--- |
| **1. Leave Public** | Keep the fork as-is. Contribute upstream if desired. | Only if you intend to open-source RedRise. |
| **2. Create New Private Repo** | Create a new private repository and push this code there, then delete the fork. | ✅ **Recommended** – safest and cleanest. |
| **3. Leave Fork Network** | Detach the fork from the upstream network, then change visibility to private. | Risky – permanently breaks upstream connection. |

---

## 🛠️ How to Execute Option 2 (Recommended)

Follow these steps when you are ready to make RedRise private:

1. **Create a new private repository** on GitHub (e.g., `redenergy-ai/redrise-private` or just reuse the name after deletion).
2. **Clone this public fork locally** (if not already done):
   ```bash
   git clone https://github.com/redenergy-ai/redrise.git
   cd redrise
```

3. Change the remote URL to point to the new private repo:
   ```bash
   git remote set-url origin https://github.com/redenergy-ai/redrise-private.git
   ```
   (Replace redenergy-ai/redrise-private with your actual new repo path.)
4. Push everything to the new private repo:
   ```bash
   git push -u origin main
   ```
   (If you have other branches, push them as well: git push --all origin)
5. Verify the new private repo has all the code, history, and the 20-RedRise/ folder.
6. Delete the public fork from GitHub (Settings → Delete this repository) to avoid confusion.

---

✅ Pre‑Push Safety Checklist

Before pushing to a new repository (even private), always verify:

☐ No .env files with API keys are committed.
☐ No hardcoded secrets (passwords, tokens) are in the code.
☐ No sensitive user data is stored in the repository.
☐ The .gitignore includes standard files (.env, *.log, node_modules/, venv/).

---

🔔 Reminder Schedule

When Action
Immediately after MVP Execute Option 2.
Before any external demo Ensure visibility is private.
Before deploying to production Run the Pre‑Push Safety Checklist.

---

Date Added: 2026-08-22
Owner: @redenergy-ai/team
