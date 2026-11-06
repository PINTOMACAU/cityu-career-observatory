const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const crypto = require('crypto');
const db = cloud.database();

const COLLECTION = 'responses';
const OFFSET_MS = 8 * 60 * 60 * 1000;
const MAX_PAYLOAD = 60000;
const MAX_ANSWER = 2000;

// Keep in sync with data/questions.js. `node scripts/check-schema.mjs` fails
// when the two lists drift.
const REQUIRED = [
  'year',
  'programme',
  'origin',
  'preferred_career',
  'expected_salary',
  'postgraduate_plan',
  'internship_done',
  'internship_count',
  'competitions',
  'exchange',
  'leadership',
  'coaching',
  'industry_contacts',
  'ready_direction',
  'ready_how',
  'ready_experience',
  'ready_contacts',
  'ready_employable',
  'ready_confidence',
];

// Same rule as utils/cycle.js: H1 = Feb-Jul, H2 = Aug-Jan, always in UTC+8.
function cycleOf(date) {
  const shifted = new Date(date.getTime() + OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  if (month >= 8) return `${year}H2`;
  if (month >= 2) return `${year}H1`;
  return `${year - 1}H2`;
}

function responseId(openid, cycle) {
  return crypto.createHash('sha256').update(`${openid}|${cycle}`).digest('hex').slice(0, 32);
}

function isMissingCollection(error) {
  return Boolean(error) && (error.errCode === -502005 || /COLLECTION_NOT_EXIST|collection not exists/i.test(error.message || ''));
}

async function addResponse(data) {
  try {
    await db.collection(COLLECTION).add({ data });
  } catch (error) {
    if (!isMissingCollection(error)) throw error;
    await db.createCollection(COLLECTION);
    await db.collection(COLLECTION).add({ data });
  }
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) return { ok: false, reason: 'no_openid' };

  const answers = event && event.answers;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return { ok: false, reason: 'bad_payload' };
  }

  const missing = REQUIRED.filter((name) => {
    const value = answers[name];
    return value === undefined || value === null || String(value).trim() === '';
  });
  if (missing.length) return { ok: false, reason: 'incomplete', missing };

  // Store flat scalars only, with a length cap: the client is not trusted.
  const clean = {};
  for (const [key, value] of Object.entries(answers)) {
    if (!/^[a-z_]{1,40}$/.test(key)) continue;
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    const text = String(value).trim();
    if (text) clean[key] = text.slice(0, MAX_ANSWER);
  }
  if (JSON.stringify(clean).length > MAX_PAYLOAD) return { ok: false, reason: 'too_large' };

  const cycle = cycleOf(new Date());
  const id = responseId(OPENID, cycle);

  try {
    await addResponse({
      _id: id,
      cycle,
      instrumentVersion: String((event && event.version) || '').slice(0, 20),
      answers: clean,
      createdAt: db.serverDate(),
    });
  } catch (error) {
    try {
      await db.collection(COLLECTION).doc(id).get();
      return { ok: false, reason: 'already', cycle };
    } catch (inner) {
      console.error('submit failed', error);
      return { ok: false, reason: 'db_error', message: 'Could not save the response.' };
    }
  }

  return { ok: true, cycle };
};
