// data/Skills/Magic_Thunder.js - 雷电魔法技能（连锁+暴击型）

const MagicThunderSkills = [
  // ========== 1-10级基础雷电魔法 ==========
  {
    id: 'thunder_shock',
    name: '电击术',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [10,11,12,13,14], sp: [0,0,0,0,0] },
    cooldown: [1,1,1,1,1],
    baseDamage: [25,29,33,38,44],
    weaponRequirement: null,
    critBonus: [5, 6, 7, 8, 9],
    specialEffects: null,
    requirements: { minLevel: 4, requires: [] },
    tags: ['魔法', '单体', '雷电', '暴击'],
    description: '电击术，暴击率+5%'
  },

  // ========== 11-30级中级雷电魔法 ==========
  {
    id: 'thunder_chain_lightning',
    name: '连锁闪电',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [22,24,26,28,30], sp: [0,0,0,0,0] },
    cooldown: [2,2,2,2,2],
    baseDamage: [40,46,53,61,70],
    weaponRequirement: null,
    specialEffects: {
      multiHit: { count: 3 }
    },
    requirements: { minLevel: 10, requires: [{ id: 'thunder_shock', level: 3 }] },
    tags: ['魔法', '群体', '雷电', '连锁'],
    description: '连锁闪电，攻击最多3个敌人（如果敌人少于3个，则重复攻击）'
  },
  {
    id: 'thunder_lightning_bolt',
    name: '闪电箭',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [32,35,38,41,44], sp: [0,0,0,0,0] },
    cooldown: [3,3,3,3,3],
    baseDamage: [85,98,113,130,149],
    weaponRequirement: null,
    critBonus: [15, 16, 17, 18, 20],
    specialEffects: null,
    requirements: { minLevel: 15, requires: [{ id: 'thunder_shock', level: 4 }] },
    tags: ['魔法', '单体', '雷电', '暴击'],
    description: '闪电箭，暴击率+15%'
  },
  {
    id: 'thunder_thunderstorm',
    name: '雷暴',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [45,48,52,56,60], sp: [0,0,0,0,0] },
    cooldown: [3,3,3,3,3],
    baseDamage: [70,81,93,107,123],
    weaponRequirement: null,
    specialEffects: {
      multiHit: { count: 2 }
    },
    requirements: { minLevel: 20, requires: [{ id: 'thunder_chain_lightning', level: 4 }] },
    tags: ['魔法', '群体', '雷电'],
    description: '雷暴，随机攻击所有敌人2次'
  },
  {
    id: 'thunder_ball_lightning',
    name: '球状闪电',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [55,59,63,67,71], sp: [0,0,0,0,0] },
    cooldown: [4,4,4,4,4],
    baseDamage: [120,138,159,183,210],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'burn', damage: 20, duration: 3 }
    },
    requirements: { minLevel: 25, requires: [{ id: 'thunder_lightning_bolt', level: 4 }] },
    tags: ['魔法', '单体', '雷电', 'DOT'],
    description: '球状闪电，连续电击3回合，每回合-20HP'
  },
  {
    id: 'thunder_static_field',
    name: '静电场',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [40,43,46,49,52], sp: [0,0,0,0,0] },
    cooldown: [5,5,5,5,5],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: {
      reflect: { percent: 0.3, duration: 5 }
    },
    requirements: { minLevel: 28, requires: [{ id: 'thunder_thunderstorm', level: 4 }] },
    tags: ['魔法', '防御', '雷电', '反伤'],
    description: '静电场，敌人攻击时反伤30%，持续5回合'
  },
  {
    id: 'thunder_overload',
    name: '超载',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [35,37,40,43,46], sp: [0,0,0,0,0] },
    cooldown: [6,6,6,6,6],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    critBonus: [25, 27, 29, 31, 33],
    specialEffects: null,
    requirements: { minLevel: 30, requires: [] },
    tags: ['魔法', '增益', '雷电'],
    description: '超载，5回合内魔法强度+45，法术暴击率+25%'
  },

  // ========== 31-60级高级雷电魔法 ==========
  {
    id: 'thunder_storm_fury',
    name: '风暴之怒',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [80,85,91,97,103], sp: [0,0,0,0,0] },
    cooldown: [6,6,6,6,6],
    baseDamage: [240,276,317,365,420],
    weaponRequirement: null,
    critBonus: [30, 32, 34, 36, 38],
    critMultiplier: [2.0, 2.0, 2.0, 2.0, 2.0],
    specialEffects: null,
    requirements: { minLevel: 40, requires: [{ id: 'thunder_ball_lightning', level: 5 }] },
    tags: ['魔法', '单体', '雷电', '暴击'],
    description: '风暴之怒，暴击率+30%，暴击时造成2倍伤害'
  },
  {
    id: 'thunder_apocalyptic_thunder',
    name: '末世雷霆',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [100,107,114,121,128], sp: [0,0,0,0,0] },
    cooldown: [7,7,7,7,7],
    baseDamage: [180,207,238,274,315],
    weaponRequirement: null,
    critBonus: [20, 22, 24, 26, 28],
    specialEffects: {
      multiHit: { count: 4 }
    },
    requirements: { minLevel: 50, requires: [{ id: 'thunder_thunderstorm', level: 5 }] },
    tags: ['魔法', '群体', '雷电', '连锁'],
    description: '末世雷霆，连锁6次攻击，暴击率+20%'
  },

  // ========== 61-100级终极雷电魔法 ==========
  {
    id: 'thunder_zeus_wrath',
    name: '宙斯之怒',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [130,138,146,154,162], sp: [0,0,0,0,0] },
    cooldown: [8,8,8,8,8],
    baseDamage: [420,483,555,638,734],
    weaponRequirement: null,
    critBonus: [100, 100, 100, 100, 100],
    critMultiplier: [3.0, 3.0, 3.0, 3.0, 3.0],
    specialEffects: null,
    requirements: { minLevel: 65, requires: [{ id: 'thunder_storm_fury', level: 5 }] },
    tags: ['魔法', '单体', '雷电', '暴击', '终极'],
    description: '宙斯之怒，必定暴击×3'
  },
  {
    id: 'thunder_heavenly_tribulation',
    name: '天劫',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [170,179,188,197,206], sp: [0,0,0,0,0] },
    cooldown: [9,9,9,9,9],
    baseDamage: [350,403,463,532,612],
    weaponRequirement: null,
    critBonus: [40, 42, 44, 46, 48],
    specialEffects: {
      multiHit: { count: 5 }
    },
    requirements: { minLevel: 80, requires: [{ id: 'thunder_apocalyptic_thunder', level: 5 }] },
    tags: ['魔法', '群体', '雷电', '连锁'],
    description: '天劫，连锁10次攻击，暴击率+40%'
  },
  {
    id: 'thunder_god_emperor',
    name: '雷神之皇',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [100,107,114,121,128], sp: [0,0,0,0,0] },
    cooldown: [10,10,10,10,10],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    critBonus: [50, 52, 54, 56, 58],
    specialEffects: null,
    requirements: { minLevel: 90, requires: [{ id: 'thunder_overload', level: 5 }] },
    tags: ['魔法', '增益', '雷电'],
    description: '雷神之皇，10回合内魔法强度+100，法术暴击率+50%'
  },
  {
    id: 'thunder_primordial_lightning',
    name: '原初雷霆',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [250,262,275,288,301], sp: [0,0,0,0,0] },
    cooldown: [10,10,10,10,10],
    baseDamage: [1000,1150,1323,1521,1749],
    weaponRequirement: null,
    critBonus: [100, 100, 100, 100, 100],
    critMultiplier: [5.0, 5.0, 5.0, 5.0, 5.0],
    specialEffects: {
      penetration: { physical: 0, magic: 75 }
    },
    requirements: { minLevel: 100, requires: [{ id: 'thunder_zeus_wrath', level: 5 }] },
    tags: ['魔法', '单体', '雷电', '终极'],
    description: '原初雷霆，必定暴击×5，无视75%魔法抗性'
  }
];

export default MagicThunderSkills;