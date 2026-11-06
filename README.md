# cityu-career-observatory

The Faculty of Business is conducting an anonymous survey to better understand students' aspirations, career development and employability needs. Results will be used only in aggregate form. 商学院正在开展匿名调查，以了解学生的职业目标、发展情况及就业能力需求。所有结果仅用于汇总分析和改进学生支持服务。Career Intelligence & Graduate Outcomes Observatory for the Faculty of Business, City University of Macau. This project supports the collection and analysis of student aspirations, employability development, graduate outcomes, and alumni career progression through bilingual surveys and interactive dashboards. 澳门城市大学商学院职业情报及毕业生成果观察站。该项目通过双语调查和交互式仪表板支持收集和分析学生愿望、就业能力发展、毕业生成果和校友职业发展。

---

## Contents

| Path | What it is |
| --- | --- |
| `pages/` | WeChat mini program: intro, survey, confirmation |
| `data/questions.js` | The instrument — every question, bilingual, with stable data keys |
| `utils/cycle.js` | Six-month round logic (H1 = Feb–Jul, H2 = Aug–Jan, UTC+8) |
| `cloudfunctions/` | CloudBase functions: `submitResponse`, `getStatus` |
| `scripts/check-schema.mjs` | Fails if the client and server disagree on required questions |
| `students123.html`, `survey.html`, `survey123.json` | The earlier web version, kept for reference; Pages is off |

## Quick start

1. Open the folder in WeChat DevTools (微信开发者工具).
2. Replace `"appid": "touristappid"` in `project.config.json` with the mini program's AppID. Tourist mode has no CloudBase, so this is required before the survey can save anything.
3. In DevTools, open 云开发 and create an environment. Put its ID in `config.js` (`envId`); leave `''` to use the default environment.
4. Right-click `cloudfunctions/submitResponse` → 上传并部署：云端安装依赖. Do the same for `getStatus`.
5. The first submission creates the `responses` collection automatically. In the console set its permission to **仅创建者可读写** — all reads and writes go through the cloud functions, which bypass rules.
6. Compile and walk the survey on a phone preview.
7. Submit it for review in 微信公众平台, then publish.

## How a round works

- A student may submit **once per round**. The response document id is `sha256(openid | cycle)`, so a second submission is rejected by the database itself, not by a client-side check.
- `cycle` is computed in UTC+8 on the server: February–July is `YYYYH1`, August–January is `YYYYH2` (January belongs to the previous year's H2). The client shows the same value; the server ignores whatever cycle the client sends.
- `getStatus` tells the intro page whether this WeChat account already answered, and when.
- Answers are draft-saved in local storage as the student types, and cleared on success.

## Changing the instrument

- Never rename an existing `name` in `data/questions.js`: it is the stored column. Add a new key instead and leave the old one in place.
- Bump `instrumentVersion` in `config.js` whenever a question changes. It is stored with every response, so rounds stay comparable.
- If you change which questions are required, update `REQUIRED` in `cloudfunctions/submitResponse/index.js` and run:

```bash
node scripts/check-schema.mjs
```

## The six-monthly reminder

WeChat does not allow unsolicited push. The only options are 订阅消息 (the student opts in, usually one message per subscription) or reaching students through the university's own channels. A working pattern for this survey:

1. Ask for a subscription when the student submits: `wx.requestSubscribeMessage({ tmplIds: [...] })`.
2. Create the template in 微信公众平台 → 订阅消息 first; the template id goes into that call.
3. Because one subscription covers one message, re-ask on each submission for the next round, and keep email/TronClass as the fallback channel.

That reminder code is deliberately not scaffolded here: it cannot be tested until the template id exists.

## Getting the data out

云开发 console → 数据库 → `responses` → 导出. The export includes `_id`, `cycle`, `instrumentVersion`, `answers`, `createdAt`. For analysis, drop `_id` (a hash of the WeChat openid) before sharing anything — treat it as pseudonymous, not anonymous.

Each `answers` object is flat: `{ "year": "Year 4", "programme": "Marketing", "ready_direction": "4", ... }`.

## Decisions still open

- **Entity and AppID.** Who registers the mini program (CityU as a mainland entity, or an overseas entity) determines the available features and review route. Settle this before building further.
- **Languages.** Questions are shown bilingually in place, as in the web version. A language toggle is a later option if the bilingual layout gets crowded.
- **Rounds.** The H1/H2 calendar is set in two places (client and cloud functions); change both together.
