const config = require('./config');

App({
  globalData: { config },

  onLaunch() {
    if (!wx.cloud) {
      console.error('CloudBase is unavailable: raise the base library to 2.2.3 or later.');
      return;
    }
    wx.cloud.init({
      env: config.envId || undefined,
      traceUser: true,
    });
  },
});
