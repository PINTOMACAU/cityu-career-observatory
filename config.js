// CloudBase environment. Empty means "the AppID's default environment" —
// fine while there is exactly one. Set it once you create a named environment.
module.exports = {
  envId: '',

  // Bump whenever a question is added, removed or reworded. Stored with every
  // response so the two rounds of a year stay comparable.
  instrumentVersion: '2026.1',

  appTitle: 'BBA Career Journey',
};
