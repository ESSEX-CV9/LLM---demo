// data/Skills/Magic_Ice.js - 冰霜魔法技能（控制+伤害型）

const MagicIceSkills = [
  // ========== 1-10级基础冰霜魔法 ==========
  {
    id: 'ice_frost_bolt',
    name: '寒冰箭',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [8,9,10,11,12], sp: [0,0,0,0,0] },
    cooldown: [1,1,1,1,1],
    baseDamage: [20,23,27,31,36],
    weaponRequirement: null,
    specialEffects: {
      cc: { type: 'slow', duration: 1, chance: 1.0 }
    },
    requirements: { minLevel: 3, requires: [] },
    tags: ['魔法', '单体', '冰霜', '控制'],
    description: '寒冰箭，减速敌人1回合'
  },
  {
    id: 'ice_ice_spike',
    name: '冰刺术',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [15,17,19,21,23], sp: [0,0,0,0,0] },
    cooldown: [2,2,2,2,2],
    baseDamage: [50,58,66,76,87],
    weaponRequirement: null,
    specialEffects: {
      cc: { type: 'slow', duration: 2, chance: 1.0 }
    },
    requirements: { minLevel: 8, requires: [{ id: 'ice_frost_bolt', level: 3 }] },
    tags: ['魔法', '单体', '冰霜', '控制'],
    description: '冰刺术，减速敌人2回合'
  },

  // ========== 11-30级中级冰霜魔法 ==========
  {
    id: 'ice_frost_nova',
    name: '冰霜新星',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [25,27,30,33,36], sp: [0,0,0,0,0] },
    cooldown: [3,3,3,3,3],
    baseDamage: [45,52,60,69,79],
    weaponRequirement: null,
    specialEffects: {
      cc: { type: 'slow', duration: 2, chance: 1.0 }
    },
    requirements: { minLevel: 12, requires: [{ id: 'ice_frost_bolt', level: 4 }] },
    tags: ['魔法', '群体', '冰霜', '控制'],
    description: '冰霜新星，减速所有敌人2回合'
  },
  {
    id: 'ice_frozen_orb',
    name: '冰冻法球',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [35,38,41,44,47], sp: [0,0,0,0,0] },
    cooldown: [3,3,3,3,3],
    baseDamage: [85,98,113,130,149],
    weaponRequirement: null,
    specialEffects: {
      cc: { type: 'freeze', duration: 1, chance: 0.5 }
    },
    requirements: { minLevel: 18, requires: [{ id: 'ice_ice_spike', level: 4 }] },
    tags: ['魔法', '单体', '冰霜', '控制'],
    description: '冰冻法球，50%几率冰冻敌人1回合'
  },
  {
    id: 'ice_blizzard',
    name: '暴风雪',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [45,48,52,56,60], sp: [0,0,0,0,0] },
    cooldown: [4,4,4,4,4],
    baseDamage: [75,86,99,114,131],
    weaponRequirement: null,
    specialEffects: {
      cc: { type: 'slow', duration: 3, chance: 1.0 },
      dot: { type: 'burn', damage: 10, duration: 2 }
    },
    requirements: { minLevel: 22, requires: [{ id: 'ice_frost_nova', level: 4 }] },
    tags: ['魔法', '群体', '冰霜', '控制', 'DOT'],
    description: '暴风雪，减速3回合，持续冻伤2回合'
  },
  {
    id: 'ice_glacial_spike',
    name: '冰河尖刺',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [55,59,63,67,71], sp: [0,0,0,0,0] },
    cooldown: [4,4,4,4,4],
    baseDamage: [135,155,179,206,237],
    weaponRequirement: null,
    specialEffects: {
      cc: { type: 'freeze', duration: 2, chance: 0.6 }
    },
    requirements: { minLevel: 28, requires: [{ id: 'ice_frozen_orb', level: 4 }] },
    tags: ['魔法', '单体', '冰霜', '控制'],
    description: '冰河尖刺，60%几率冰冻敌人2回合'
  },
  {
    id: 'ice_frost_armor',
    name: '寒冰护甲',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [30,32,35,38,41], sp: [0,0,0,0,0] },
    cooldown: [5,5,5,5,5],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    requirements: { minLevel: 25, requires: [] },
    tags: ['魔法', '防御', '冰霜'],
    description: '寒冰护甲，5回合内魔法抗性+25%，攻击者被减速'
  },

  // ========== 31-60级高级冰霜魔法 ==========
  {
    id: 'ice_ice_age',
    name: '冰河时代',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [70,75,80,85,90], sp: [0,0,0,0,0] },
    cooldown: [6,6,6,6,6],
    baseDamage: [140,161,185,213,245],
    weaponRequirement: null,
    specialEffects: {
      cc: { type: 'freeze', duration: 2, chance: 0.7 }
    },
    requirements: { minLevel: 35, requires: [{ id: 'ice_blizzard', level: 5 }] },
    tags: ['魔法', '群体', '冰霜', '控制'],
    description: '冰河时代，70%几率冰冻所有敌人2回合'
  },
  {
    id: 'ice_absolute_zero',
    name: '绝对零度',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [90,96,102,108,114], sp: [0,0,0,0,0] },
    cooldown: [7,7,7,7,7],
    baseDamage: [280,322,370,426,490],
    weaponRequirement: null,
    specialEffects: {
      cc: { type: 'freeze', duration: 3, chance: 0.8 }
    },
    requirements: { minLevel: 45, requires: [{ id: 'ice_glacial_spike', level: 5 }] },
    tags: ['魔法', '单体', '冰霜', '控制'],
    description: '绝对零度，80%几率冰冻敌人3回合'
  },
  {
    id: 'ice_eternal_winter',
    name: '永恒寒冬',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [120,127,134,141,148], sp: [0,0,0,0,0] },
    cooldown: [8,8,8,8,8],
    baseDamage: [240,276,317,365,420],
    weaponRequirement: null,
    specialEffects: {
      cc: { type: 'freeze', duration: 3, chance: 0.6 },
      dot: { type: 'burn', damage: 25, duration: 5 }
    },
    requirements: { minLevel: 60, requires: [{ id: 'ice_ice_age', level: 5 }] },
    tags: ['魔法', '群体', '冰霜', '控制', 'DOT'],
    description: '永恒寒冬，持续5回合，减速+冰冻效果'
  },

  // ========== 61-100级终极冰霜魔法 ==========
  {
    id: 'ice_frost_titan',
    name: '冰霜泰坦',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [80,85,90,95,100], sp: [0,0,0,0,0] },
    cooldown: [9,9,9,9,9],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    requirements: { minLevel: 70, requires: [{ id: 'ice_frost_armor', level: 5 }] },
    tags: ['魔法', '增益', '冰霜'],
    description: '冰霜泰坦形态，8回合内魔法强度+60，魔法抗性+40%'
  },
  {
    id: 'ice_glacial_apocalypse',
    name: '冰川末世',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [160,169,178,187,196], sp: [0,0,0,0,0] },
    cooldown: [9,9,9,9,9],
    baseDamage: [450,518,595,685,788],
    weaponRequirement: null,
    specialEffects: {
      cc: { type: 'freeze', duration: 4, chance: 0.9 },
      dot: { type: 'burn', damage: 40, duration: 8 }
    },
    requirements: { minLevel: 85, requires: [{ id: 'ice_eternal_winter', level: 5 }] },
    tags: ['魔法', '群体', '冰霜', '控制', 'DOT'],
    description: '冰川末世，90%几率冰冻4回合，持续8回合冻伤'
  },
  {
    id: 'ice_absolute_freeze',
    name: '绝对冰封',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [200,210,220,230,240], sp: [0,0,0,0,0] },
    cooldown: [10,10,10,10,10],
    baseDamage: [850,978,1124,1293,1487],
    weaponRequirement: null,
    specialEffects: {
      cc: { type: 'freeze', duration: 5, chance: 1.0 },
      penetration: { physical: 0, magic: 60 }
    },
    requirements: { minLevel: 100, requires: [{ id: 'ice_glacial_apocalypse', level: 5 }] },
    tags: ['魔法', '单体', '冰霜', '控制', '终极'],
    description: '绝对冰封，100%冰冻5回合，无视60%魔法抗性'
  }
];

export default MagicIceSkills;