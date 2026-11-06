const { cycleOf, nextCycle, cycleLabel, cycleBounds, formatDate } = require('../../utils/cycle');

Page({
  data: {
    cycle: '',
    cycleText: '',
    answered: false,
    submittedText: '',
    nextDue: '',
    loading: true,
    offline: false,
  },

  onShow() {
    this.refresh();
  },

  async refresh() {
    const cycle = cycleOf(new Date());
    const next = nextCycle(cycle);
    this.setData({
      cycle,
      cycleText: cycleLabel(cycle),
      nextDue: formatDate(cycleBounds(next).start),
      loading: true,
      offline: false,
    });

    try {
      const res = await wx.cloud.callFunction({ name: 'getStatus', data: { cycle } });
      const result = res.result || {};
      this.setData({
        loading: false,
        answered: result.answered === true,
        submittedText: result.submittedAt ? formatDate(new Date(result.submittedAt)) : '',
      });
    } catch (error) {
      console.warn('status check failed', error);
      this.setData({ loading: false, offline: true });
    }
  },

  start() {
    wx.navigateTo({ url: `/pages/survey/survey?cycle=${this.data.cycle}` });
  },

  retry() {
    this.refresh();
  },
});
