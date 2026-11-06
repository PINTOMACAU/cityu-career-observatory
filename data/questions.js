// The instrument. `name` is the stored column: never rename a key after the
// first round goes out, or the two rounds stop lining up.
//
// types: select | scale | text | textarea
// required: enforced on the client and re-checked in cloudfunctions/submitResponse
//           (keep REQUIRED there in sync; `node scripts/check-schema.mjs` verifies it)

const SECTIONS = [
  {
    id: 'profile',
    title: 'About You',
    titleZh: '基本信息',
    elements: [
      {
        name: 'year',
        type: 'select',
        title: 'Current status',
        titleZh: '目前状态',
        required: true,
        choices: [
          { value: 'Year 4', label: 'Year 4 / 四年级' },
          { value: 'Graduated', label: 'Graduated / 已毕业' },
        ],
      },
      {
        name: 'programme',
        type: 'select',
        title: 'Programme',
        titleZh: '专业',
        required: true,
        choices: [
          { value: 'HRM', label: 'HRM / 人力资源管理' },
          { value: 'Marketing', label: 'Marketing / 市场营销' },
          { value: 'Accounting', label: 'Accounting / 会计' },
          { value: 'Finance', label: 'Finance / 金融' },
          { value: 'Other', label: 'Other / 其他' },
        ],
      },
      {
        name: 'origin',
        type: 'select',
        title: 'Country / region of origin',
        titleZh: '生源地区',
        required: true,
        choices: [
          { value: 'Mainland China', label: 'Mainland China / 中国内地' },
          { value: 'Macau', label: 'Macau / 澳门' },
          { value: 'Hong Kong', label: 'Hong Kong / 香港' },
          { value: 'International', label: 'International / 国际' },
        ],
      },
    ],
  },

  {
    id: 'aspirations',
    title: 'Career Aspirations',
    titleZh: '职业目标',
    elements: [
      {
        name: 'why_cityu',
        type: 'textarea',
        title: 'Why did you choose City University of Macau?',
        titleZh: '您为什么选择澳门城市大学？',
        required: false,
      },
      {
        name: 'why_major',
        type: 'textarea',
        title: 'Why did you choose your major?',
        titleZh: '您为什么选择当前专业？',
        required: false,
      },
      {
        name: 'preferred_career',
        type: 'text',
        title: 'Preferred career',
        titleZh: '理想职业',
        required: true,
        placeholderEn: 'e.g. brand manager, auditor',
        placeholderZh: '例如：品牌经理、审计师',
      },
      {
        name: 'preferred_industry',
        type: 'text',
        title: 'Preferred industry',
        titleZh: '希望进入的行业',
        required: false,
        placeholderEn: 'e.g. hospitality, banking',
        placeholderZh: '例如：酒店、银行',
      },
      {
        name: 'expected_salary',
        type: 'select',
        title: 'Expected monthly salary (MOP)',
        titleZh: '期望月薪（澳门元）',
        required: true,
        choices: [
          { value: 'Below 10000', label: 'Below 10,000 / 低于 10,000' },
          { value: '10000-15000', label: '10,000 - 15,000' },
          { value: '15001-20000', label: '15,001 - 20,000' },
          { value: '20001-30000', label: '20,001 - 30,000' },
          { value: 'Above 30000', label: 'Above 30,000 / 高于 30,000' },
        ],
      },
      {
        name: 'postgraduate_plan',
        type: 'select',
        title: 'Do you intend to pursue postgraduate studies?',
        titleZh: '是否计划继续升学？',
        required: true,
        choices: [
          { value: 'Yes', label: 'Yes / 是' },
          { value: 'No', label: 'No / 否' },
          { value: 'Undecided', label: 'Undecided / 未确定' },
        ],
      },
    ],
  },

  {
    id: 'experience',
    title: 'Experience During Studies',
    titleZh: '在校经历',
    elements: [
      {
        name: 'internship_done',
        type: 'select',
        title: 'Have you completed any internships?',
        titleZh: '是否完成过实习？',
        required: true,
        choices: [
          { value: 'Yes', label: 'Yes / 是' },
          { value: 'No', label: 'No / 否' },
        ],
      },
      {
        name: 'internship_count',
        type: 'select',
        title: 'Number of internships completed',
        titleZh: '实习次数',
        required: true,
        choices: [
          { value: '0', label: '0' },
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3+', label: '3+' },
        ],
      },
      {
        name: 'competitions',
        type: 'select',
        title: 'Competitions participated in',
        titleZh: '参加过的比赛数量',
        required: true,
        choices: [
          { value: '0', label: '0' },
          { value: '1-2', label: '1-2' },
          { value: '3-5', label: '3-5' },
          { value: '5+', label: 'More than 5 / 5 个以上' },
        ],
      },
      {
        name: 'certifications',
        type: 'textarea',
        title: 'Certifications obtained',
        titleZh: '获得的证书',
        required: false,
      },
      {
        name: 'exchange',
        type: 'select',
        title: 'Exchange programme participation',
        titleZh: '是否参加交换项目',
        required: true,
        choices: [
          { value: 'Yes', label: 'Yes / 是' },
          { value: 'No', label: 'No / 否' },
        ],
      },
      {
        name: 'leadership',
        type: 'select',
        title: 'Student leadership experience',
        titleZh: '是否担任学生干部',
        required: true,
        choices: [
          { value: 'Yes', label: 'Yes / 是' },
          { value: 'No', label: 'No / 否' },
        ],
      },
      {
        name: 'ai_tools',
        type: 'textarea',
        title: 'AI tools used regularly',
        titleZh: '经常使用的 AI 工具',
        required: false,
      },
      {
        name: 'coaching',
        type: 'select',
        title: 'Career coaching activities attended',
        titleZh: '参加过的职业辅导活动',
        required: true,
        choices: [
          { value: 'None', label: 'None / 没有' },
          { value: '1-2', label: '1-2' },
          { value: '3-5', label: '3-5' },
          { value: '5+', label: 'More than 5 / 5 个以上' },
        ],
      },
      {
        name: 'industry_contacts',
        type: 'select',
        title: 'Industry contacts developed',
        titleZh: '建立的行业联系人数量',
        required: true,
        choices: [
          { value: 'None', label: 'None / 没有' },
          { value: '1-5', label: '1-5' },
          { value: '6-10', label: '6-10' },
          { value: '10+', label: 'More than 10 / 10 个以上' },
        ],
      },
    ],
  },

  {
    id: 'readiness',
    title: 'Career Readiness',
    titleZh: '职业准备度',
    legend: '1 = strongly disagree, 5 = strongly agree / 1 = 非常不同意，5 = 非常同意',
    elements: [
      {
        name: 'ready_direction',
        type: 'scale',
        title: 'I know what career I want.',
        titleZh: '我知道自己未来想从事什么职业。',
        required: true,
      },
      {
        name: 'ready_how',
        type: 'scale',
        title: 'I know how to obtain it.',
        titleZh: '我知道如何实现这一职业目标。',
        required: true,
      },
      {
        name: 'ready_experience',
        type: 'scale',
        title: 'I have relevant experience.',
        titleZh: '我拥有相关经验。',
        required: true,
      },
      {
        name: 'ready_contacts',
        type: 'scale',
        title: 'I have useful professional contacts.',
        titleZh: '我拥有有帮助的职业人脉。',
        required: true,
      },
      {
        name: 'ready_employable',
        type: 'scale',
        title: 'I feel employable.',
        titleZh: '我认为自己具有良好的就业竞争力。',
        required: true,
      },
      {
        name: 'ready_confidence',
        type: 'scale',
        title: 'I am confident about finding employment after graduation.',
        titleZh: '我对毕业后的就业充满信心。',
        required: true,
      },
    ],
  },

  {
    id: 'suggestions',
    title: 'Suggestions',
    titleZh: '建议',
    elements: [
      {
        name: 'support_needed',
        type: 'textarea',
        title: 'What additional support would help improve your employability?',
        titleZh: '您认为学校还可以提供哪些支持来提升您的就业能力？',
        required: false,
      },
    ],
  },
];

const REQUIRED_NAMES = [];
for (const section of SECTIONS) {
  for (const el of section.elements) {
    if (el.required) REQUIRED_NAMES.push(el.name);
  }
}

function findElement(name) {
  for (const section of SECTIONS) {
    for (const el of section.elements) {
      if (el.name === name) return el;
    }
  }
  return null;
}

module.exports = { SECTIONS, REQUIRED_NAMES, findElement };
