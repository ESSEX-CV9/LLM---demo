// data/Skills/Physical_Heavy.js - 重武器专精技能（需要hammer/axe）

const PhysicalHeavySkills = [
  // ========== 1-10级基础重武器技能 ==========
  {
    id: 'heavy_crushing_blow',
    name: '粉碎打击',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [15,17,19,21,23] },
    cooldown: [2,2,2,2,2],
    baseDamage: [50,58,66,76,87],
    weaponRequirement: ['hammer', 'axe'],
    specialEffects: {
      penetration: { physical: 10, magic: 0 }
    },
    requirements: { minLevel: 5, requires: [{ id: 'phy_power_strike', level: 2 }] },
    tags: ['物理', '单体', '重武器', '破甲'],
    description: '粉碎性打击，无视10%物理抗性'
  },

  // ========== 11-30级中级重武器技能 ==========
  {
    id: 'heavy_ground_slam',
    name: '重击地面',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [28,30,33,36,39] },
    cooldown: [3,3,3,3,3],
    baseDamage: [65,75,86,99,114],
    weaponRequirement: ['hammer'],
    specialEffects: {
      cc: { type: 'stun', duration: 1, chance: 0.3 }
    },
    requirements: { minLevel: 12, requires: [{ id: 'heavy_crushing_blow', level: 3 }] },
    tags: ['物理', '群体', '锤类', '控制'],
    description: '重击地面，30%几率晕眩1回合'
  },
  {
    id: 'heavy_cleave',
    name: '裂地斩',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [25,27,30,33,36] },
    cooldown: [2,2,2,2,2],
    baseDamage: [75,86,99,114,131],
    weaponRequirement: ['axe'],
    specialEffects: {
      dot: { type: 'bleed', damage: 8, duration: 3 }
    },
    requirements: { minLevel: 12, requires: [{ id: 'heavy_crushing_blow', level: 3 }] },
    tags: ['物理', '单体', '斧类', 'DOT'],
    description: '裂地斩击，流血3回合，每回合-8HP'
  },
  {
    id: 'heavy_seismic_wave',
    name: '震地波',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [40,43,46,49,52] },
    cooldown: [4,4,4,4,4],
    baseDamage: [90,104,119,137,158],
    weaponRequirement: ['hammer'],
    specialEffects: null,
    requirements: { minLevel: 20, requires: [{ id: 'heavy_ground_slam', level: 4 }] },
    tags: ['物理', '群体', '锤类'],
    description: '震地波，降低敌人物理抗性10%，持续3回合'
  },
  {
    id: 'heavy_whirlwind_axe',
    name: '旋风斧刃',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [38,41,44,47,50] },
    cooldown: [3,3,3,3,3],
    baseDamage: [80,92,106,122,140],
    weaponRequirement: ['axe'],
    specialEffects: null,
    requirements: { minLevel: 22, requires: [{ id: 'heavy_cleave', level: 4 }] },
    tags: ['物理', '群体', '斧类'],
    description: '旋转斧击，攻击所有敌人'
  },
  {
    id: 'heavy_armor_break',
    name: '破甲',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [35,38,41,44,47] },
    cooldown: [4,4,4,4,4],
    baseDamage: [95,109,126,145,167],
    weaponRequirement: ['hammer', 'axe'],
    specialEffects: null,
    requirements: { minLevel: 25, requires: [{ id: 'heavy_crushing_blow', level: 5 }] },
    tags: ['物理', '单体', '重武器', '破甲'],
    description: '破甲打击，降低目标物理抗性30%，持续4回合'
  },
  {
    id: 'heavy_titans_grip',
    name: '泰坦之握',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [20,22,24,26,28] },
    cooldown: [5,5,5,5,5],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: ['hammer', 'axe'],
    specialEffects: null,
    requirements: { minLevel: 28, requires: [] },
    tags: ['物理', '增益', '重武器'],
    description: '泰坦之握，5回合内物理强度+35'
  },

  // ========== 31-60级高级重武器技能 ==========
  {
    id: 'heavy_mountain_splitter',
    name: '裂山击',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [60,64,68,72,76] },
    cooldown: [5,5,5,5,5],
    baseDamage: [210,242,278,320,368],
    weaponRequirement: ['hammer', 'axe'],
    specialEffects: {
      penetration: { physical: 40, magic: 0 }
    },
    requirements: { minLevel: 35, requires: [{ id: 'heavy_armor_break', level: 5 }] },
    tags: ['物理', '单体', '重武器', '破甲'],
    description: '裂山击，无视40%物理抗性'
  },
  {
    id: 'heavy_cataclysm',
    name: '大灾变',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [75,80,85,90,95] },
    cooldown: [6,6,6,6,6],
    baseDamage: [170,196,225,259,298],
    weaponRequirement: ['hammer'],
    specialEffects: {
      cc: { type: 'stun', duration: 2, chance: 0.5 }
    },
    requirements: { minLevel: 45, requires: [{ id: 'heavy_seismic_wave', level: 5 }] },
    tags: ['物理', '群体', '锤类', '控制'],
    description: '大灾变，50%几率晕眩所有敌人2回合'
  },
  {
    id: 'heavy_blood_frenzy',
    name: '血之狂暴',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [70,75,80,85,90] },
    cooldown: [6,6,6,6,6],
    baseDamage: [160,184,212,243,280],
    weaponRequirement: ['axe'],
    specialEffects: {
      dot: { type: 'bleed', damage: 20, duration: 5 },
      lifesteal: { percent: 0.2 }
    },
    requirements: { minLevel: 48, requires: [{ id: 'heavy_whirlwind_axe', level: 5 }] },
    tags: ['物理', '群体', '斧类', 'DOT', '吸血'],
    description: '血之狂暴，流血5回合，造成伤害的20%回血'
  },
  {
    id: 'heavy_colossus_strike',
    name: '巨神之击',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [95,101,107,113,119] },
    cooldown: [7,7,7,7,7],
    baseDamage: [380,437,503,578,665],
    weaponRequirement: ['hammer', 'axe'],
    specialEffects: {
      cc: { type: 'stun', duration: 1, chance: 1.0 },
      penetration: { physical: 30, magic: 0 }
    },
    requirements: { minLevel: 60, requires: [{ id: 'heavy_mountain_splitter', level: 5 }] },
    tags: ['物理', '单体', '重武器', '控制', '破甲'],
    description: '巨神之击，100%晕眩1回合，无视30%物理抗性'
  },

  // ========== 61-100级终极重武器技能 ==========
  {
    id: 'heavy_ragnarok',
    name: '诸神黄昏',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [110,117,124,131,138] },
    cooldown: [8,8,8,8,8],
    baseDamage: [280,322,370,426,490],
    weaponRequirement: ['hammer'],
    specialEffects: {
      cc: { type: 'stun', duration: 2, chance: 0.7 }
    },
    requirements: { minLevel: 70, requires: [{ id: 'heavy_cataclysm', level: 5 }] },
    tags: ['物理', '群体', '锤类', '控制'],
    description: '诸神黄昏，降低所有敌人全属性30%，持续5回合，70%晕眩2回合'
  },
  {
    id: 'heavy_berserker_lord',
    name: '狂战之王',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [60,64,68,72,76] },
    cooldown: [9,9,9,9,9],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: ['hammer', 'axe'],
    critBonus: [40, 42, 44, 46, 48],
    specialEffects: null,
    requirements: { minLevel: 75, requires: [{ id: 'heavy_titans_grip', level: 5 }] },
    tags: ['物理', '增益', '重武器'],
    description: '狂战之王，8回合内物理强度+80，暴击率+40%'
  },
  {
    id: 'heavy_world_ender',
    name: '终世之锤',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [180,189,198,207,216] },
    cooldown: [10,10,10,10,10],
    baseDamage: [500,575,661,760,874],
    weaponRequirement: ['hammer', 'axe'],
    specialEffects: {
      penetration: { physical: 60, magic: 0 },
      cc: { type: 'stun', duration: 3, chance: 0.8 }
    },
    requirements: { minLevel: 100, requires: [{ id: 'heavy_ragnarok', level: 5 }] },
    tags: ['物理', '群体', '重武器', '终极'],
    description: '终世之锤，对所有敌人造成毁灭性伤害，无视60%物理抗性，80%晕眩3回合'
  }
];

export default PhysicalHeavySkills;