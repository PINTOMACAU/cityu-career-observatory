// Two rounds per academic year:
//   H1 = 1 February  - 31 July
//   H2 = 1 August    - 31 January (of the following calendar year)
//
// Everything is computed in UTC+8 (Macau) so the boundary does not depend on
// where the phone or the cloud function happens to be. The cloud functions
// carry their own copy of cycleOf(); keep the two in step.

const OFFSET_MS = 8 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function macauParts(date) {
  const shifted = new Date(date.getTime() + OFFSET_MS);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1 };
}

function cycleOf(date) {
  const d = date || new Date();
  const { year, month } = macauParts(d);
  if (month >= 8) return `${year}H2`;
  if (month >= 2) return `${year}H1`;
  return `${year - 1}H2`;
}

function cycleBounds(cycle) {
  const year = Number(cycle.slice(0, 4));
  const half = cycle.slice(4);
  if (half === 'H1') {
    return { start: new Date(Date.UTC(year, 1, 1) - OFFSET_MS), end: new Date(Date.UTC(year, 7, 1) - OFFSET_MS) };
  }
  return { start: new Date(Date.UTC(year, 7, 1) - OFFSET_MS), end: new Date(Date.UTC(year + 1, 1, 1) - OFFSET_MS) };
}

function nextCycle(cycle) {
  const bounds = cycleBounds(cycle);
  return cycleOf(new Date(bounds.end.getTime() + OFFSET_MS));
}

function formatDate(date) {
  const { year, month } = macauParts(date);
  const day = new Date(date.getTime() + OFFSET_MS).getUTCDate();
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function cycleLabel(cycle) {
  return `${cycle.slice(0, 4)} ${cycle.slice(4)}`;
}

module.exports = { cycleOf, cycleBounds, nextCycle, formatDate, cycleLabel };
