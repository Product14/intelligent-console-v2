export const headerConfig = {
  title: 'Schedule',
  subTitle: 'Manage your leads, track your sales and view analytics',
};

export const enterpriseTeamMap = [
  { enterpriseId: '8e46c89ad', teamId: '4348934f4d', showform: true },
  { enterpriseId: '9419dba73', teamId: 'ae440a1bc1', showform: true },
  { enterpriseId: '74c1adc77', teamId: 'b2c0a103ad', showform: true },
  { enterpriseId: '5842ef9e2', teamId: '30bc87e920', showform: true },
  { enterpriseId: 'c91ce6fa8', teamId: 'af15967383', showform: true },
  { enterpriseId: '17882069e', teamId: '3d42c99372', showform: true },
  { enterpriseId: 'c1261c6c0', teamId: '9537cfec86', showform: true },
  { enterpriseId: 'bc6476d1b', teamId: '1f1b2607aa', showform: true },
  { enterpriseId: 'c92ebe3db', teamId: 'cb6faaa18a', showform: false },
  { enterpriseId: '843540ef9', teamId: '34e51333-6', showform: false },
  { enterpriseId: 'c68580ae5', teamId: '09652c78f4', showform: false },
];

export const LEAD_TYPE = [
  {
    name: 'Hot',
    textColor: '#F44336',
    icon: `${process.env.SPYNE_STATIC_URL}/fire.svg`,
    bgColor: '#FEF3F2',
  },
  {
    name: 'Cold',
    textColor: '#175CD3',
    icon: `${process.env.SPYNE_STATIC_URL}/ac_unit.svg`,
    bgColor: '#EFF8FF',
  },
  {
    name: 'Warm',
    textColor: '#B54708',
    icon: `${process.env.SPYNE_STATIC_URL}/sunny.svg`,
    bgColor: '#FFFAEB',
  },
];
