// data/Skills/Magic_Fire.js - 火焰魔法技能（爆发伤害型）

const MagicFireSkills = [
  // ========== 1-10级基础火焰魔法 ==========
  {
    id: 'fire_spark',
    name: '火花术',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [6,7,8,9,10], sp: [0,0,0,0,0] },
    cooldown: [0,0,0,0,0],
    baseDamage: [18,21,24,28,32],
    weaponRequirement: null,
    specialEffects: null,
    requirements: { minLevel: 1, requires: [] },
    tags: ['魔法', '单体', '火焰'],
    description: '基础的火焰魔法攻击'
  },
  {
    id: 'fire_fireball',
    name: '火球术',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [12,13,15,17,19], sp: [0,0,0,0,0] },
    cooldown: [1,1,1,1,1],
    baseDamage: [45,52,60,69,79],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'burn', damage: 8, duration: 1 }
    },
    requirements: { minLevel: 5, requires: [{ id: 'fire_spark', level: 3 }] },
    tags: ['魔法', '单体', '火焰', 'DOT'],
    description: '火球术，灼烧敌人1回合，造成8点持续伤害'
  },

  // ========== 11-30级中级火焰魔法 ==========
  {
    id: 'fire_flame_burst',
    name: '火焰爆发',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [20,22,24,26,28], sp: [0,0,0,0,0] },
    cooldown: [2,2,2,2,2],
    baseDamage: [55,63,73,84,97],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'burn', damage: 5, duration: 2 }
    },
    requirements: { minLevel: 10, requires: [{ id: 'fire_fireball', level: 3 }] },
    tags: ['魔法', '群体', '火焰', 'DOT'],
    description: '火焰爆发，对所有敌人造成AOE伤害并灼烧'
  },
  {
    id: 'fire_inferno',
    name: '地狱烈焰',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [28,30,33,36,39], sp: [0,0,0,0,0] },
    cooldown: [3,3,3,3,3],
    baseDamage: [95,109,126,145,167],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'burn', damage: 15, duration: 3 }
    },
    requirements: { minLevel: 15, requires: [{ id: 'fire_fireball', level: 4 }] },
    tags: ['魔法', '单体', '火焰', 'DOT'],
    description: '地狱烈焰，3回合内每回合-15HP'
  },
  {
    id: 'fire_pyroblast',
    name: '炎爆术',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [40,43,46,49,52], sp: [0,0,0,0,0] },
    cooldown: [4,4,4,4,4],
    baseDamage: [140,161,185,213,245],
    weaponRequirement: null,
    critBonus: [15, 17, 19, 21, 23],
    specialEffects: null,
    requirements: { minLevel: 20, requires: [{ id: 'fire_inferno', level: 3 }] },
    tags: ['魔法', '单体', '火焰', '爆发'],
    description: '炎爆术，暴击率+15%'
  },
  {
    id: 'fire_meteor',
    name: '陨石术',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [50,54,58,62,66], sp: [0,0,0,0,0] },
    cooldown: [4,4,4,4,4],
    baseDamage: [110,127,146,168,193],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'burn', damage: 12, duration: 2 }
    },
    requirements: { minLevel: 25, requires: [{ id: 'fire_flame_burst', level: 4 }] },
    tags: ['魔法', '群体', '火焰', 'DOT'],
    description: '陨石坠落，AOE伤害并灼烧2回合'
  },
  {
    id: 'fire_immolate',
    name: '献祭之火',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [35,37,40,43,46], sp: [0,0,0,0,0] },
    cooldown: [5,5,5,5,5],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    requirements: { minLevel: 28, requires: [] },
    tags: ['魔法', '增益', '火焰'],
    description: '献祭生命力，5回合内魔法强度+40，每回合-10HP'
  },
  {
    id: 'fire_flame_shield',
    name: '烈焰护盾',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [25,27,29,31,33], sp: [0,0,0,0,0] },
    cooldown: [5,5,5,5,5],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: {
      reflect: { percent: 0.2, duration: 4 }
    },
    requirements: { minLevel: 30, requires: [] },
    tags: ['魔法', '防御', '火焰', '反伤'],
    description: '烈焰护盾，4回合内魔法抗性+20%，反伤20%'
  },

  // ========== 31-60级高级火焰魔法 ==========
  {
    id: 'fire_phoenix_flame',
    name: '凤凰烈焰',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [70,75,80,85,90], sp: [0,0,0,0,0] },
    cooldown: [5,5,5,5,5],
    baseDamage: [260,299,344,396,455],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'burn', damage: 30, duration: 5 }
    },
    requirements: { minLevel: 40, requires: [{ id: 'fire_pyroblast', level: 5 }] },
    tags: ['魔法', '单体', '火焰', 'DOT'],
    description: '凤凰烈焰，灼烧5回合，每回合-30HP'
  },
  {
    id: 'fire_hellfire_storm',
    name: '地狱风暴',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [90,96,102,108,114], sp: [0,0,0,0,0] },
    cooldown: [6,6,6,6,6],
    baseDamage: [200,230,265,304,350],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'burn', damage: 20, duration: 3 }
    },
    requirements: { minLevel: 50, requires: [{ id: 'fire_meteor', level: 5 }] },
    tags: ['魔法', '群体', '火焰', 'DOT'],
    description: '地狱风暴，持续3回合AOE灼烧'
  },
  {
    id: 'fire_solar_flare',
    name: '太阳耀斑',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [110,117,124,131,138], sp: [0,0,0,0,0] },
    cooldown: [7,7,7,7,7],
    baseDamage: [280,322,370,426,490],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'burn', damage: 25, duration: 4 }
    },
    requirements: { minLevel: 60, requires: [{ id: 'fire_phoenix_flame', level: 5 }] },
    tags: ['魔法', '群体', '火焰', 'DOT'],
    description: '太阳耀斑，盲目2回合，命中率-40%'
  },

  // ========== 61-100级终极火焰魔法 ==========
  {
    id: 'fire_apocalyptic_fire',
    name: '末世烈焰',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [140,148,156,164,172], sp: [0,0,0,0,0] },
    cooldown: [8,8,8,8,8],
    baseDamage: [380,437,503,578,665],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'burn', damage: 50, duration: 8 }
    },
    requirements: { minLevel: 75, requires: [{ id: 'fire_hellfire_storm', level: 5 }] },
    tags: ['魔法', '群体', '火焰', 'DOT'],
    description: '末世烈焰，灼烧持续8回合，每回合-50HP'
  },
  {
    id: 'fire_sun_god_wrath',
    name: '太阳神之怒',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [180,189,198,207,216], sp: [0,0,0,0,0] },
    cooldown: [9,9,9,9,9],
    baseDamage: [700,805,926,1065,1225],
    weaponRequirement: null,
    specialEffects: {
      penetration: { physical: 0, magic: 50 },
      dot: { type: 'burn', damage: 60, duration: 10 }
    },
    requirements: { minLevel: 90, requires: [{ id: 'fire_solar_flare', level: 5 }] },
    tags: ['魔法', '单体', '火焰', '终极'],
    description: '太阳神之怒，无视50%魔法抗性，灼烧10回合'
  },
  {
    id: 'fire_supernova',
    name: '超新星爆发',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [220,231,242,253,264], sp: [0,0,0,0,0] },
    cooldown: [10,10,10,10,10],
    baseDamage: [600,690,794,913,1050],
    weaponRequirement: null,
    specialEffects: {
      penetration: { physical: 0, magic: 60 },
      dot: { type: 'burn', damage: 80, duration: 5 }
    },
    requirements: { minLevel: 100, requires: [{ id: 'fire_apocalyptic_fire', level: 5 }] },
    tags: ['魔法', '群体', '火焰', '终极'],
    description: '超新星爆发，无视60%魔法抗性，持续5回合AOE灼烧'
  }
];

export default MagicFireSkills;