const { SECTIONS, findElement } = require('../../data/questions');
const { cycleOf, cycleLabel } = require('../../utils/cycle');
const config = require('../../config');

const DRAFT_PREFIX = 'draft:';
const MAX_PAYLOAD = 60000;

function blankPicks() {
  const picks = {};
  for (const section of SECTIONS) {
    for (const el of section.elements) {
      if (el.type === 'select') picks[el.name] = 0;
    }
  }
  return picks;
}

function pickLabels(answers, picks) {
  const labels = {};
  for (const section of SECTIONS) {
    for (const el of section.elements) {
      if (el.type === 'select' && answers[el.name]) {
        labels[el.name] = el.choices[picks[el.name]].label;
      }
    }
  }
  return labels;
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function sectionComplete(section, answers) {
  return section.elements.every((el) => !el.required || !isBlank(answers[el.name]));
}

Page({
  data: {
    cycle: '',
    cycleText: '',
    index: 0,
    total: SECTIONS.length,
    section: SECTIONS[0],
    answers: {},
    picks: blankPicks(),
    labels: {},
    percent: 20,
    isLast: SECTIONS.length === 1,
    submitting: false,
    scaleValues: [1, 2, 3, 4, 5],
  },

  onLoad(options) {
    const cycle = (options && options.cycle) || cycleOf(new Date());
    const draft = wx.getStorageSync(DRAFT_PREFIX + cycle) || {};
    const answers = draft.answers || {};
    const picks = Object.assign(blankPicks(), draft.picks || {});

    this.setData({
      cycle,
      cycleText: cycleLabel(cycle),
      answers,
      picks,
      labels: pickLabels(answers, picks),
    });
    this.goTo(typeof draft.index === 'number' ? draft.index : 0);
  },

  goTo(index) {
    const clamped = Math.max(0, Math.min(index, SECTIONS.length - 1));
    this.setData({
      index: clamped,
      section: SECTIONS[clamped],
      isLast: clamped === SECTIONS.length - 1,
      percent: Math.round(((clamped + 1) / SECTIONS.length) * 100),
    });
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
  },

  saveDraft() {
    wx.setStorageSync(DRAFT_PREFIX + this.data.cycle, {
      answers: this.data.answers,
      picks: this.data.picks,
      index: this.data.index,
    });
  },

  onSelect(e) {
    const name = e.currentTarget.dataset.name;
    const choice = Number(e.detail.value);
    const el = findElement(name);
    if (!el) return;
    this.setData({
      ['answers.' + name]: el.choices[choice].value,
      ['picks.' + name]: choice,
      ['labels.' + name]: el.choices[choice].label,
    });
    this.saveDraft();
  },

  onScale(e) {
    const { name, value } = e.currentTarget.dataset;
    this.setData({ ['answers.' + name]: Number(value) });
    this.saveDraft();
  },

  onText(e) {
    const name = e.currentTarget.dataset.name;
    this.setData({ ['answers.' + name]: e.detail.value });
    this.saveDraft();
  },

  back() {
    if (this.data.index === 0) {
      wx.navigateBack();
      return;
    }
    this.goTo(this.data.index - 1);
  },

  next() {
    if (this.data.submitting) return;
    if (!sectionComplete(this.data.section, this.data.answers)) {
      wx.showToast({ title: 'Answer the required questions / 请完成必答题', icon: 'none' });
      return;
    }
    if (this.data.isLast) {
      this.submit();
      return;
    }
    this.goTo(this.data.index + 1);
    this.saveDraft();
  },

  async submit() {
    const answers = this.data.answers;
    const missingSection = SECTIONS.findIndex((section) => !sectionComplete(section, answers));
    if (missingSection >= 0) {
      this.goTo(missingSection);
      wx.showToast({ title: 'Answer the required questions / 请完成必答题', icon: 'none' });
      return;
    }
    if (JSON.stringify(answers).length > MAX_PAYLOAD) {
      wx.showToast({ title: 'Some answers are too long / 回答过长', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: 'Submitting', mask: true });
    try {
      const res = await wx.cloud.callFunction({
        name: 'submitResponse',
        data: { cycle: this.data.cycle, version: config.instrumentVersion, answers },
      });
      const result = res.result || {};
      wx.hideLoading();

      if (result.ok) {
        wx.removeStorageSync(DRAFT_PREFIX + this.data.cycle);
        wx.redirectTo({ url: `/pages/done/done?cycle=${this.data.cycle}` });
        return;
      }
      if (result.reason === 'already') {
        wx.removeStorageSync(DRAFT_PREFIX + this.data.cycle);
        wx.showModal({
          title: 'Already submitted / 已提交',
          content: 'You have already completed this round. / 您已提交本轮问卷。',
          showCancel: false,
          success: () => wx.reLaunch({ url: '/pages/intro/intro' }),
        });
        return;
      }
      if (result.reason === 'incomplete' && Array.isArray(result.missing)) {
        wx.showToast({ title: 'Missing: ' + result.missing[0], icon: 'none' });
        return;
      }
      wx.showModal({ title: 'Not submitted', content: result.message || 'Please try again.', showCancel: false });
    } catch (error) {
      wx.hideLoading();
      console.error('submit failed', error);
      wx.showModal({
        title: 'Not submitted / 未提交',
        content: 'The server could not be reached. Your answers are kept as a draft. / 无法连接服务器，回答已保存为草稿。',
        showCancel: false,
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  onShareAppMessage() {
    return { title: 'BBA Career Journey Survey', path: '/pages/intro/intro' };
  },
});
