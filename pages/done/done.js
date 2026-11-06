const { cycleOf, cycleLabel, nextCycle, cycleBounds, formatDate } = require('../../utils/cycle');

Page({
  data: {
    cycleText: '',
    nextDue: '',
  },

  onLoad(options) {
    const cycle = (options && options.cycle) || cycleOf(new Date());
    const next = nextCycle(cycle);
    this.setData({
      cycleText: cycleLabel(cycle),
      nextDue: formatDate(cycleBounds(next).start),
    });
  },

  close() {
    wx.reLaunch({ url: '/pages/intro/intro' });
  },
});
