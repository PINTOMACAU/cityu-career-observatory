# Handover: Career Intelligence and Graduate Outcomes Observatory

**For:** Faculty of Business management, and CityU IT.
**From:** José Pinto, Faculty of Business.
**Purpose:** Everything needed to inspect, test, approve and operate the survey without a hand-holding session. Nothing here requires reading source code, though the code is available.

---

## 1. One-page summary

The Faculty of Business needs a recurring stream of evidence on what final-year students intend to do, what they have done to get there, and how ready they feel. This project collects that evidence twice a year, for the whole cohort, from a phone, in about five minutes, with no student numbers and no names.

It is **built and testable today**, but **not live**: it runs in WeChat's tourist mode, which has no database. To go live the university has to register the mini program (AppID), which also unlocks the cloud database and the two server functions. Everything else is done.

| | |
| --- | --- |
| What exists | A WeChat mini program: intro screen, 5-section survey, confirmation; two cloud functions; a schema guard; a static web preview of the same instrument |
| Questions | 25, of which 19 required; bilingual; versioned |
| Cadence | Two rounds per academic year (Feb–Jul, Aug–Jan), enforced server-side |
| Duplicate control | One response per student per round, enforced by the database key, not by a client check |
| What a student gives up | Nothing but a WeChat openid, and only for duplicate control. No name, no student number, no contact details |
| What IT must do | Register the AppID, create one cloud environment, deploy two functions, set one collection permission. Estimated one working day, mostly waiting on registration approvals |
| Recurring cost | RMB 300/year WeChat certification. Cloud free tier covers this volume; no server, no licence, no per-student cost |
| Decision owner | The four decisions in §10 are for the Faculty and IT; each has a recommendation |

---

## 2. Where the work is

| What | Where |
| --- | --- |
| Source code | https://github.com/PINTOMACAU/cityu-career-observatory |
| This handover | https://github.com/PINTOMACAU/cityu-career-observatory/blob/main/HANDOVER.md |
| Web preview (static, does not save) | https://pintomacau.github.io/cityu-career-observatory/ |
| Surrender of access | The repository can be transferred to a CityU GitHub organisation, or made private and archived, once IT has it |

The repository is public so that IT can open it without an account. It contains no credentials, no AppID secret, no student data, and no personal information. It should be made private once IT has taken it over.

---

## 3. What a student sees

Three screens, in this order:

1. **Intro.** Says what the survey is, that it is anonymous, that it is one response per round, and that answers are kept as a draft until submitted. It checks with the server whether this WeChat account has already answered this round. Three states: *round open → Start*, *already completed → when, and when the next round opens*, *server unreachable → Start anyway / Retry*.
2. **Survey.** Five sections, one screen at a time, progress indicator, back and next. Required questions block *next* with a toast. Every answer is written to local storage as it is typed, so a call, a dead battery or a closed app does not lose work.
3. **Confirmation.** Says the round is complete and when the next round opens. A close button returns to the intro, which now shows *already completed*.

Nothing is shown to the student after submission: no score, no comparison, no feedback. This is deliberate; it keeps the instrument neutral and avoids promising analysis the Faculty has not committed to.

---

## 4. What is measured

| Section | Questions | What it captures |
| --- | --- | --- |
| About You | 3 | Year 4 or graduated; programme; country/region of origin |
| Career Aspirations | 6 | Why CityU, why the major, preferred career and industry, expected monthly salary (MOP), postgraduate intentions |
| Experience During Studies | 8 | Internships (whether and how many), competitions, certifications, exchange, leadership, AI tools used, career coaching, industry contacts |
| Career Readiness | 6 | Six statements on a 1–5 scale: I know the career I want; I know how to obtain it; I have relevant experience; I have useful professional contacts; I feel employable; I am confident about finding employment |
| Suggestions | 1 | Free text: what additional support would improve employability |

The full instrument, with every wording and every bilingual label, is `data/questions.js`. Each question has a stable machine name (the stored column), which is why names must never be renamed later — see §12.

The six readiness statements are the part that can be compared across rounds and, if the Faculty wants it, benchmarked against published employability scales. They are also the part that could later be attached to course evaluation as an outcome measure, which is the externality argument: the same data stream can test whether a course change moved how prepared students feel, without asking students a second set of double-barrelled questions.

---

## 5. How a round works

Two rounds per academic year, computed in UTC+8 (Macau) on **both** the phone and the server, so the boundary never depends on where a device is:

- **H1** = 1 February to 31 July, labelled `YYYYH1`
- **H2** = 1 August to 31 January, labelled `YYYYH2`, where January belongs to the previous year's H2

Examples: 15 March 2027 → `2027H1`; 15 January 2027 → `2026H2`; 1 August 2026 → `2026H2`.

The server **ignores** any round label the phone sends and computes its own. A phone with a wrong clock or a tampered client cannot invent a round.

---

## 6. Duplicate control, and why it is not a client-side check

Each response document's `_id` is the first 32 hex characters of `sha256(openid | cycle)`. The database refuses a second write with the same `_id`. So:

- A student who reinstalls, clears storage, or submits from two devices in the same round is still rejected.
- A student who submits in H1 can submit again in H2, because the round is part of the key.
- The rejection is a database constraint, not a suggestion the app could skip.

This is why the survey is described as **pseudonymous, not anonymous**: the Faculty cannot name a respondent, but the database can recognise that a WeChat account has already answered this round, and the same account's two responses across rounds are linkable by design — that linkage is the entire point of a longitudinal stream. This distinction should be stated plainly in any ethics or privacy filing.

---

## 7. What is stored

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

Server-side rules, all enforced in `cloudfunctions/submitResponse/index.js`:

- Only flat scalar values are kept; keys must match `^[a-z_]{1,40}$`; anything else is dropped.
- Each answer is trimmed and capped at 2,000 characters; the whole payload is capped at 60 kB.
- The 19 required questions are re-checked on the server; the client's validation is a courtesy, not the guarantee.
- `createdAt` is set by the server, not the phone.

The collection is created automatically on the first successful submission, and its permission must then be set to **仅创建者可读写** (creator-only read/write). All reads and writes go through the cloud functions, which bypass collection rules, so students never touch the database directly and no client can read another student's answer.

### Getting data out

云开发 console → 数据库 → `responses` → 导出. The export is the analysis dataset. Before sharing it outside the Faculty, drop `_id`: it is a hash of a WeChat identifier and, while not reversible in practice, it is a stable per-student key.

---

## 8. What IT has to do

Ordered, with the reason for each step. Steps 1–3 are registration and approval; steps 4–7 are technical and take under an hour once 1–3 are done.

1. **Register the mini program under a CityU entity**, so the AppID belongs to the university. The personal route is not available (it requires a mainland Chinese ID). The university's WeChat account administrator creates it and adds the survey maintainer as a project member with **开发** and **云开发** permissions.
   *Confirm during registration:* the required 小程序类目 (category) and whether 小程序备案 (ICP filing) applies to this entity type. Both affect the calendar, not the code.
2. **Complete 微信认证** for the account: RMB 300 per year, paid by the university. This is what allows the account to be linked to the university's identity and to use the cloud capabilities without limits.
3. **Decide data ownership** (§10, decision 4) before any real response is collected.
4. **Create one 云开发 (CloudBase) environment** in the mini program console. Note its environment ID.
5. **Put that ID in `config.js`** (`envId`). Leaving it empty uses the default environment, which is acceptable for a single environment.
6. **Deploy the two cloud functions**: in WeChat DevTools, right-click `cloudfunctions/submitResponse` → 上传并部署：云端安装依赖, then the same for `getStatus`. Both use `wx-server-sdk` and `crypto`, no other dependency.
7. **Set the collection permission** to 仅创建者可读写 after the first submission creates `responses` (§7).
8. **Declare the privacy policy** in 微信公众平台 → 用户隐私保护指引. What is collected is limited to the WeChat identifier used for duplicate control; the declaration must match the code, so it should list nothing beyond that. Then submit for review and publish.

If CloudBase turns out to be unavailable for the chosen entity type, only `cloudfunctions/` has to change: the pages call the functions by name and store nothing themselves.

---

## 9. Acceptance test

Anyone, technical or not, can run this in WeChat DevTools with a registered AppID and an environment. It takes about twenty minutes and it either passes or it does not.

| # | Do this | Expect |
| --- | --- | --- |
| 1 | Run `node scripts/check-schema.mjs` | `OK - 5 sections, 25 questions, 19 required.` |
| 2 | Open the project in DevTools, compile, preview on a phone | Intro shows the current round, e.g. `Round 2026 H2`, with Start |
| 3 | Press Start | Section 1 of 5, progress 20% |
| 4 | Try Next with required questions blank | Toast: answer the required questions; no advance |
| 5 | Complete all five sections and submit | Confirmation screen; next round date shown |
| 6 | In 云开发 console, open `responses` | Exactly one document: 32-character `_id`, correct `cycle`, `instrumentVersion` `2026.1`, `answers` with the filled keys, server `createdAt` |
| 7 | Return to the intro | *Already completed*, with the submission date |
| 8 | Clear the app's storage and reopen | Still *already completed* — the check is server-side |
| 9 | Submit again by any route | Rejected as `already`; no second document appears |
| 10 | Delete that document in the console, reopen the intro | Round open again |

Steps 6 to 9 are the ones that matter: they prove the round logic, the duplicate control and the server-side validation, which are the three things a client-side prototype cannot prove.

---

## 10. Decisions needed

Four, each with a recommendation. None is a technical choice; all four are ownership questions.

1. **Who holds the AppID.** Recommended: the university, under the Faculty's use, with the maintainer added as a project member. An AppID held by an individual cannot be transferred cleanly later and ties the Faculty's data stream to one person's account.
2. **Who pays the RMB 300 certification.** Recommended: the Faculty, as a recurring operating cost, not a research grant. It is annual and it lapses into restricted operation if unpaid.
3. **Which cloud environment, and who administers it.** Recommended: one environment for this mini program only, administered by IT, with the maintainer holding 云开发 permissions for deployment. Sharing an environment with other applications complicates both cost attribution and access review.
4. **Who owns the response data, and who may approve an export.** Recommended: the Faculty owns it; IT is custodian; the Dean (or a named delegate) approves exports for research use; the maintainer prepares them. This is the decision that should be written down before the first real submission, because it determines what the privacy declaration says and what a future ethics application can claim.

---

## 11. Costs

| Item | Amount | Notes |
| --- | --- | --- |
| WeChat certification | RMB 300 / year | Requires a university entity and a verified account |
| CloudBase database and functions | RMB 0 at this volume | Free tier covers a cohort-scale survey twice a year; the paid floor is a few tens of RMB per month if usage grows |
| Server, licence, per-student fee | RMB 0 | There is no server to run and no commercial dependency |
| Staff time | Under one working day for IT setup; a few hours per round for the Faculty | Deployment, permission check, export |

Already-committed Faculty resources: the instrument, the code, the schema guard and this handover are done. The outstanding cost is registration and one day of IT time.

---

## 12. What is not built, and what happens when the instrument changes

Deliberately absent:

- **No reminder mechanism.** WeChat forbids unsolicited push. The only in-app option is 订阅消息, and one student subscription covers one message, so it cannot replace email or TronClass as the channel that actually brings students back each round. The reminder code is not scaffolded because it cannot be tested until a template exists.
- **No dashboard.** Export and analysis are console-side today. A dashboard is a reasonable second phase and a poor first one: it would have been built against zero real responses.
- **No language toggle.** Questions are bilingual in place, as in the earlier web version. A toggle is a later option if the bilingual layout becomes crowded.
- **No identity fields.** No name, no student number, no programme-year roll, no email. If the Faculty later wants to link responses to academic records, that is a different instrument with a different consent conversation, and it should not be bolted onto this one.

Rules for changing the instrument, so that rounds stay comparable:

- Never rename an existing question key. Add a new key and leave the old one in place; the stored column is the key.
- Bump `instrumentVersion` in `config.js` whenever a question changes. It is stored with every response.
- If the set of required questions changes, update `REQUIRED` in `cloudfunctions/submitResponse/index.js` and run `node scripts/check-schema.mjs`. It fails loudly if the client and the server disagree.

---

## 13. Open questions, stated plainly

- **Entity type and filing.** Whether 小程序备案 applies, and which 类目 the account must declare, is decided by the platform at registration. Until that is answered the calendar has an unknown in it; the code does not.
- **Who maintains it after the first round.** The instrument and the code are documented well enough for another person to operate, but a named maintainer should exist before the first round closes.
- **Whether the readiness scale will be benchmarked.** If it will, the wording should be fixed now, before round one, rather than after two rounds of data exist.

---

## 14. Contact

José Pinto, Faculty of Business, City University of Macau — for anything about the instrument, the code or the analysis.
IT — for the AppID, the environment and the collection permission.
