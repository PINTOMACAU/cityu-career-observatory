const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const crypto = require('crypto');
const db = cloud.database();

const COLLECTION = 'responses';
const OFFSET_MS = 8 * 60 * 60 * 1000;

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

function isMissingDocument(error) {
  return Boolean(error) && (error.errCode === -502004 || /does not exist|not exist/i.test(error.message || ''));
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) return { ok: false, reason: 'no_openid' };

  const cycle = cycleOf(new Date());
  const id = responseId(OPENID, cycle);

  try {
    const res = await db.collection(COLLECTION).doc(id).get();
    const submittedAt = res.data && res.data.createdAt;
    return {
      ok: true,
      answered: true,
      cycle,
      submittedAt: submittedAt ? new Date(submittedAt).toISOString() : '',
    };
  } catch (error) {
    if (isMissingDocument(error) || /COLLECTION_NOT_EXIST/i.test(error.message || '')) {
      return { ok: true, answered: false, cycle };
    }
    console.error('status check failed', error);
    return { ok: false, reason: 'db_error', message: 'Could not check your status.' };
  }
};
