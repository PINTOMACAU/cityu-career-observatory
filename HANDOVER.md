# Career Observatory — WeChat mini program handover

**For:** Faculty of Business management (Part A) and CityU IT (Part B).
**From:** José Pinto, Faculty of Business.
**Version:** November 2026. Code state: commit `4e57299` on `main`.

> **How to use this document.** Part A is one page and needs no technical knowledge. Part B is a click-by-click playbook: every step says where to click, what you should see, and what to do if you do not. Print it and tick the boxes. If a step does not behave as described, the troubleshooting table in §B11 covers the failures that actually happen; if it is not there, send one line (template in §B12) and nothing else is needed.

---

# Part A — For the Dean and the Associate Dean

## A1. What this is

A WeChat mini program that asks final-year BBA students, twice a year, what they intend to do, what they have done to prepare, and how ready they feel. Five screens, about five minutes, no name and no student number.

It is **built and testable today**. It is **not live**, because going live needs one thing only the university can provide: a mini program account registered to CityU. That account also brings the database with it. Everything on our side is finished.

## A2. Why WeChat, and why not the Registry route

Students already live in WeChat. There is no app to install, no password to remember, no login screen: the survey opens from a message or a QR code and the phone already knows who the user is well enough to prevent a double submission.

The Registry route produces course-level satisfaction and double-barrelled items ("the syllabus was clear and complete and served as a guide"). It cannot tell the Faculty what a cohort expects to earn, which industries they target, how many internships they actually completed, or whether students feel more employable after a course change. Those are the questions a Faculty can act on, and they are the questions this instrument asks.

## A3. What it gives the Faculty

- **A repeated measure, not a one-off.** The same instrument every semester, so a cohort can be followed and a change can be tested rather than asserted.
- **Cohort-scale coverage.** Every final-year student, not a self-selected sample, because it arrives through the channel students already use.
- **Evidence for accreditation, programme review and the annual report** that does not depend on a survey someone has to re-commission each year.
- **A research asset.** The readiness scale is a publishable dependent variable; the free-text item is a source of foresight on what students expect from the labour market. Course evaluation can be attached to it later as an outcome measure.
- **No marginal cost per student.** No licence, no server, no per-response fee. At 2,500 enrolled students and 800 responses a year, the platform allowances are barely touched (§A6).

## A4. What must be decided

| # | Decision | Recommendation |
| --- | --- | --- |
| 1 | Who holds the mini program account (AppID) | The university, used by the Faculty, with the maintainer added as a project member. An account held by an individual cannot be handed over cleanly later |
| 2 | Who pays the annual certification | The Faculty, as an operating cost, not a research grant. It is annual and lapses into restricted operation if unpaid |
| 3 | Which cloud environment, and who administers it | One environment for this mini program only, administered by IT, with the maintainer holding deployment rights. Sharing an environment with other applications complicates cost and access review |
| 4 | Who owns the responses, and who approves an export | The Faculty owns; IT is custodian; the Dean (or a named delegate) approves exports for research use; the maintainer prepares them. **Decide this before the first real response** — it determines what the privacy declaration says |

## A5. What it costs

| Item | Amount | Notes |
| --- | --- | --- |
| WeChat certification | RMB 300 / year (mainland entity); overseas entities are quoted in USD, about USD 99 / year | Confirm the current fee at registration; the entity type decides which applies |
| Cloud database and functions | Effectively zero at this volume | 800 responses and about 2 MB a year; the arithmetic is in §A6 |
| Server, licence, per-student fee | Zero | There is no server to run and no commercial dependency |
| IT time | Under one working day | Part B, steps 1–9, most of it waiting on registration approvals |
| Faculty time | A few hours per round | Export and analysis |

Already committed: the instrument, the code, the schema guard, the acceptance test and this document.

## A6. Scale — 2,500 students, 400 intake, 400 graduates a year

The sizing that matters is not the Faculty's headcount but the number of responses. The instrument is aimed at the final-year cohort, which is the annual graduate cohort: about **400 students per round**, two rounds a year.

| Quantity | Arithmetic | Per round | Per year | Over 10 years |
| --- | --- | --- | --- | --- |
| Eligible respondents | 400 graduates a year | 400 | 800 | 8,000 |
| Submissions at 60–80% response | 240–320 per round | 240–320 | 480–640 | 4,800–6,400 |
| Worst case, every student answers both rounds | 400 × 2 | 400 | 800 | 8,000 |
| Stored data at ~2.5 kB per response | 800 × 2.5 kB | ~1 MB | ~2 MB | ~20 MB |
| Stored data at the 60 kB hard cap | 800 × 60 kB | 48 MB | 48 MB | 480 MB |
| Server calls (status check + submit) | ~2 per visit, ~4 visits a year | ~1,600 | ~6,400 | 64,000 |
| Peak day, first week of a round | 400 students in 2 days | ~800 calls | — | — |

The 2,500 enrolled students matter for reach, not for load: if the Faculty later opened the same app to the whole student body for a shorter termly pulse, that would be 2,500 × 3 responses = 7,500 documents a year, about 19 MB, and roughly 15,000 server calls — still nowhere near the free tier's allowances.

For comparison, the free tier of 云开发 is measured in tens of thousands of database operations per day and gigabytes of storage; this workload uses a low single-digit percentage of it even in the worst case, and a fraction of a percent in the realistic case. WeChat revises these allowances, so confirm the current figures in 云开发 console → 用量 (usage) before promising a number; what will not change is the shape of the arithmetic above.

What this means for the annual cycle: data volume grows by about 2 MB a year, so it will be decades before storage is a consideration, and the number of students is irrelevant to the fee. The only cost that scales with anything is the annual certification, which does not scale at all.

## A7. What we are asking for

1. Confirm the principle: the Faculty collects its own outcome evidence, in addition to whatever the Registry collects.
2. Nominate the IT colleague who will own Part B.
3. Approve the certification fee and the cloud environment.

Part B can then proceed without me.

---

# Part B — For IT

Nothing here requires reading the source code. The code is small and commented if you want to.

## B0. What you are setting up, in five lines

1. A WeChat **mini program account** owned by CityU, which yields an **AppID**.
2. A **云开发 (CloudBase) environment**, which is a managed database plus two small server functions.
3. The two functions deployed into that environment.
4. One collection permission tightened.
5. A privacy declaration and a review submission.

There is no server, no container, no CI, no certificate, no domain to buy, and no dependency to install beyond what WeChat's own tooling does.

## B1. Prerequisites — confirm before starting

| Need | Who has it | Notes |
| --- | --- | --- |
| A WeChat account that administers the university's official accounts | Communications / IT | This is the only step that needs the university's identity |
| Business registration document of the entity | Finance / Legal | Needed at registration |
| Administrator's ID or passport, and a mobile number that receives SMS | The administrator | WeChat sends the verification code there |
| A Windows or macOS machine | IT | 微信开发者工具 runs on both; 4 GB RAM is enough |
| A phone with WeChat | IT | To scan the login QR and to test the survey |
| Node.js 18 or later (optional) | IT | Only for the one-line schema check in step 7; if it is not installed, skip that check — check 6 proves the same thing |
| This repository | — | §B2 |

## B2. Step 1 — Get the code (2 minutes)

**Where:** any browser.

**Do (no git):** open https://github.com/PINTOMACAU/cityu-career-observatory → green **Code** button → **Download ZIP** → extract anywhere.

**Do (with git):**
```
git clone https://github.com/PINTOMACAU/cityu-career-observatory.git
```

**You should see:** a folder containing `project.config.json`, `app.js`, `cloudfunctions/`, `pages/`.

**If not:** you extracted the ZIP inside another folder — open the inner folder. The one with `project.config.json` at its top level is the one to import.

- [ ] Folder obtained

## B3. Step 2 — Register the mini program (1–3 working days; the only slow step)

**Who:** whoever administers the university's WeChat accounts.

**Where:** https://mp.weixin.qq.com → **立即注册 (Register now)** → **小程序 (Mini program)**.

**Do:** register as an **境外主体 (overseas entity)** using the university's Macau registration, unless the university already holds a mainland entity that this should sit under. Have ready: the registration document, the administrator's identity document, an email address on the university domain, and a mobile number that receives SMS. Then complete **微信认证 (WeChat certification)** — the fee in §A5.

**You should see:** an **AppID** in 设置 → 基本设置, a string starting with `wx`.

**Then:** 设置 → 基本设置 → 服务类目 (service category) → choose the closest education category offered to this entity type.

**If not:** registration stalls most often on the entity document or on the certification payment; the platform states which. Nothing in our code depends on the choice of category, so it does not block testing — testing can start in the developer tool before review.

**Two calendar risks to confirm at this point**, neither of which changes the code:
- whether **小程序备案 (ICP filing)** applies to this entity type; if it does, add its stated working days;
- the exact **certification fee** for the entity type.

- [ ] AppID issued (write it here: `wx____________________`)
- [ ] Service category set
- [ ] Certification paid

## B4. Step 3 — Add the maintainer as a project member (5 minutes)

**Where:** https://mp.weixin.qq.com → 管理 → 成员管理 → 项目成员 → 添加成员.

**Do:** scan the QR with the maintainer's WeChat, then grant **开发者 (developer)**. Developer rights are what allow deploying cloud functions.

**You should see:** the maintainer listed under 项目成员.

**If not:** the account must have completed certification before members can be added.

- [ ] Maintainer added as 开发者

## B5. Step 4 — Open the project in WeChat DevTools (10 minutes)

**Where:** https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html → **稳定版 Stable**.

**Do:** install, log in by scanning the QR with the administrator's or maintainer's WeChat, then **导入项目 (Import project)**:
- **目录 (Directory):** the folder from §B2 containing `project.config.json`
- **AppID:** paste the `wx…` value from §B3
- leave 不使用云服务 (do not use cloud services) **unticked**

**You should see:** the project compiles, and the simulator shows the intro screen **“BBA Career Journey”**. The console may warn that the environment is not found — expected, that is §B6.

**If not:** a red compile error means the wrong folder was imported; the AppID field rejecting the value means the account is not certified yet.

- [ ] Project imported and compiling

## B6. Step 5 — Create the cloud environment (10 minutes)

**Where:** inside DevTools, the **云开发 (CloudBase)** button in the toolbar.

**Do:** 开通 (enable) → create one environment, name it `career-observatory`, choose the free/usage-based plan. When it finishes, copy the **环境 ID (environment ID)** — a string like `career-observatory-1a2b3c4d5e6f7g`.

**Then:** open `config.js` in the project and put that ID inside the quotes:
```js
envId: 'career-observatory-1a2b3c4d5e6f7g',
```
Save. (Leaving it empty uses the default environment, which is acceptable if this is the only one — but pasting the ID is unambiguous, so paste it.)

**You should see:** the 云开发 console opens with an empty database and an empty function list.

**If not:** “environment quota” messages mean the university already has environments; reuse one or ask WeChat for the quota.

- [ ] Environment created (ID: `____________________________`)
- [ ] `config.js` updated and saved

## B7. Step 6 — Deploy the two cloud functions (10 minutes)

**Where:** DevTools file tree on the left.

**Do:** right-click `cloudfunctions/submitResponse` → **上传并部署：云端安装依赖 (Upload and deploy: install dependencies in the cloud)**. Wait for the success message. Then do the same for `cloudfunctions/getStatus`.

**You should see:** both functions listed in 云开发 → 云函数, each with a recent deployment time.

**If not:** “no permission” means the member is not a 开发者 (§B4); “cloud function directory not found” means `project.config.json` has been altered — it must keep `"cloudfunctionRoot": "cloudfunctions/"`.

- [ ] `submitResponse` deployed
- [ ] `getStatus` deployed

## B8. Step 7 — Run the acceptance test (20 minutes)

This is the step that proves it works. The `responses` collection does not exist yet; the first submission in check 5 creates it, which is why the permission check comes after.

Use **预览 (Preview)** in DevTools to get a QR code, then scan with a phone that has WeChat (the same account the tool is logged in with is fine).

| # | Do this | Expect |
| --- | --- | --- |
| 1 | Run `node scripts/check-schema.mjs` in the project folder (skip if Node is not installed) | `OK - 5 sections, 25 questions, 19 required.` |
| 2 | Open the intro on the phone | The current round, e.g. “Round 2026 H2”, and a Start button |
| 3 | Press **Start** | Section 1 of 5, progress 20% |
| 4 | Press **Next** with required questions blank | A toast asking for the required questions; no advance |
| 5 | Answer all five sections and submit | Confirmation screen with the date the next round opens |
| 6 | 云开发 → 数据库 → `responses` | Exactly one document: 32-character `_id`, the right `cycle`, `instrumentVersion` `2026.1`, server `createdAt` |
| 7 | Return to the intro | “Already completed”, with the submission date |
| 8 | Clear the app's storage (or reopen on another phone with the same WeChat account) and reopen | Still “Already completed” — the check runs on the server |
| 9 | Submit again by any route | Rejected as already submitted; still exactly one document |
| 10 | Delete that document in the console and reopen the intro | The round is open again |

Checks 6, 8 and 9 are the ones that matter: they prove the round arithmetic, the duplicate control and the server-side validation — the three things that cannot be faked by a prototype.

**Then tighten the collection:** 云开发 → 数据库 → `responses` → **权限设置 (permissions)** → **仅创建者可读写 (creator only)** → save. All access goes through the functions, which bypass these rules, so this costs nothing functionally and closes direct access.

- [ ] Checks 1–10 pass
- [ ] Permission set to 仅创建者可读写
- [ ] Test document deleted

## B9. Step 8 — Privacy declaration and release (review takes 1–7 days)

**Where:** https://mp.weixin.qq.com → 设置 → 服务内容声明 → **用户隐私保护指引 (user privacy guidelines)**.

**Do:** declare what is collected. In the code that is exactly one thing: the WeChat identifier (`openid`), used solely to stop the same student submitting twice in a round. The survey asks for no name, no student number, no phone, no email, no location, and does not use the contacts, camera, microphone or album. Answer the form accordingly; do not declare more than that, because the declaration is checked against behaviour.

**Then:** 管理 → 版本管理 → the development version → **提交审核 (submit for review)** → after approval, **发布 (publish)**.

**You should see:** the mini program searchable by name, and openable by QR code.

**If not:** review rejections at this stage are almost always the privacy declaration not matching the code, or a service category that does not cover surveys. Both are corrected on the platform, not in the code.

- [ ] Privacy declaration submitted
- [ ] Review passed
- [ ] Published

## B10. Step 9 — Hand back

Send the four-line reply in §B12 with the AppID and environment ID filled in. From that moment the Faculty can collect without IT's involvement; the only recurring action is the annual certification.

---

## B11. Troubleshooting — the failures that actually happen

| Symptom | Cause | Fix |
| --- | --- | --- |
| The app runs but nothing saves; console mentions `touristappid` | Still in tourist mode | Re-import with the real AppID (§B4) |
| `wx.cloud is undefined` | Base library too old | 详情 → 本地设置 → set the debug base library to the latest |
| Submit returns `db_error`; console shows `-502005` | The collection did not exist | It is created automatically on first write; if it persists, create `responses` manually in the console and retry |
| Console shows `-502004` when the intro loads | No response document for this round — normal | Nothing; the intro shows “round open” |
| Submit returns `incomplete` with a field name | Client and server disagree on required questions | Run `node scripts/check-schema.mjs`; it names the mismatch |
| Submit returns `already` | This WeChat account already answered this round | Intended behaviour |
| `-404011 cloud function execution error` | Function not deployed, or deployed to a different environment | Redeploy (§B7), check the environment selected in the 云开发 console header |
| “No permission” when deploying | Member is not a 开发者 | §B4 |
| Data does not appear in the console | The console is showing a different environment | Switch environment in the 云开发 header |
| Preview QR code expired | Normal | Regenerate it |

---

## B12. What to send back

Copy this, fill the blanks, send it as one message. That is the entire handover acknowledgement.

```
Career Observatory — setup complete
AppID:            wx__________________
Environment ID:   ____________________
Acceptance test:  checks 1-10 passed on __ / __ / 2026
Permission:       responses set to creator-only
Notes:            (anything unexpected, one line)
```

---

# Part C — Reference (only if something needs changing later)

## C1. The screens

1. **Intro** — states what the survey is, that it is anonymous, one response per round, drafts kept until submitted. Asks the server whether this account already answered this round. Three states: round open, already completed (with date and next round), server unreachable (Start anyway / Retry).
2. **Survey** — five sections, one screen at a time, progress indicator, back and next. Required questions block *next*. Every answer is written to local storage as it is typed, so a call, a dead battery or a closed app loses nothing.
3. **Confirmation** — round complete, next round date. Closing it returns to the intro, which now shows “already completed”.

Nothing is shown to the student after submission: no score, no comparison, no feedback. Deliberate — it keeps the instrument neutral and promises nothing the Faculty has not committed to.

## C2. The instrument

Five sections, 25 questions, 19 required. `data/questions.js` holds every wording, every bilingual label and every stored key.

| Section | Questions | Captures |
| --- | --- | --- |
| About You | 3 | Year 4 or graduated; programme; origin |
| Career Aspirations | 6 | Why CityU, why the major, preferred career and industry, expected monthly salary (MOP), postgraduate intentions |
| Experience During Studies | 8 | Internships, competitions, certifications, exchange, leadership, AI tools, coaching, industry contacts |
| Career Readiness | 6 | Six statements on a 1–5 scale: I know the career I want; I know how to obtain it; I have relevant experience; I have useful contacts; I feel employable; I am confident of finding work |
| Suggestions | 1 | Free text on what would improve employability |

The six readiness statements are the comparable core: stable across rounds, and the natural candidate for attach-to-course-evaluation later — the same stream can test whether a course change moved how prepared students feel, without a second set of double-barrelled items.

## C3. Rounds

Two per academic year, computed in UTC+8 on both phone and server, so the boundary never depends on where a device is:

- **H1** = 1 February to 31 July → `YYYYH1`
- **H2** = 1 August to 31 January → `YYYYH2`, January belonging to the previous year's H2

Examples: 15 March 2027 → `2027H1`; 15 January 2027 → `2026H2`; 1 August 2026 → `2026H2`.

The server ignores whatever round the phone sends and computes its own, so a wrong clock or a tampered client cannot invent a round.

## C4. Duplicate control

Each document's `_id` is the first 32 hex characters of `sha256(openid | cycle)`. The database refuses a second write with the same `_id`, so a student who reinstalls, clears storage or uses two devices is still rejected within a round, and can answer again in the next one.

This is why the survey is described as **pseudonymous, not anonymous**: the Faculty cannot name a respondent, but the database can recognise that an account already answered, and the same account's rounds are linkable by design — that linkage is the point of a longitudinal stream. Say this plainly in any ethics or privacy filing; do not describe it as anonymous.

## C5. Stored data

One collection, `responses`, one document per student per round:

```json
{
  "_id": "32 hex characters",
  "cycle": "2027H1",
  "instrumentVersion": "2026.1",
  "answers": { "year": "Year 4", "programme": "Marketing", "ready_direction": "4", "...": "..." },
  "createdAt": "<server timestamp>"
}
```

Server-side rules, all in `cloudfunctions/submitResponse/index.js`: flat scalars only, keys matching `^[a-z_]{1,40}$`; each answer trimmed and capped at 2,000 characters; payload capped at 60 kB; the 19 required questions re-checked on the server; `createdAt` set by the server.

**Export:** 云开发 → 数据库 → `responses` → 导出. Drop `_id` before sharing outside the Faculty — it is a hash of a WeChat identifier and a stable per-student key. A full year is about 800 rows across 25 columns, comfortably under a megabyte, so it opens in Excel without special handling.

## C6. Deliberately absent

- **No reminder mechanism.** WeChat forbids unsolicited push. 订阅消息 gives one message per student subscription, which cannot replace email or TronClass as the channel that brings students back each round. Not scaffolded because it cannot be tested until a template exists.
- **No dashboard.** Export and analysis are console-side today. A dashboard is a sensible second phase and a poor first one: it would have been built against zero real responses.
- **No language toggle.** Bilingual in place, as in the earlier web version.
- **No identity fields.** No name, no student number, no email. Linking responses to academic records would be a different instrument with a different consent conversation and should not be bolted onto this one.

## C7. Changing the instrument later

- Never rename an existing question key: it is the stored column. Add a new key and leave the old one.
- Bump `instrumentVersion` in `config.js` whenever a question changes; it is stored with every response.
- If the required set changes, update `REQUIRED` in `cloudfunctions/submitResponse/index.js` and run `node scripts/check-schema.mjs`. It fails loudly on any client/server disagreement.

## C8. Contact

José Pinto, Faculty of Business — instrument, code, analysis.
IT — AppID, environment, collection permission.

Repository: https://github.com/PINTOMACAU/cityu-career-observatory
Web preview of the same instrument (renders, saves nothing): https://pintomacau.github.io/cityu-career-observatory/
