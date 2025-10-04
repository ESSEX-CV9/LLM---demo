// data/Skills/Physical_Ranged.js - 远程专精技能（需要bow）

const PhysicalRangedSkills = [
  // ========== 1-10级基础远程技能 ==========
  {
    id: 'bow_aimed_shot',
    name: '瞄准射击',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [10,11,12,13,14] },
    cooldown: [1,1,1,1,1],
    baseDamage: [40,46,53,61,70],
    weaponRequirement: ['bow'],
    critBonus: [10, 11, 12, 13, 15],
    specialEffects: null,
    requirements: { minLevel: 5, requires: [] },
    tags: ['物理', '单体', '弓类', '暴击'],
    description: '瞄准射击，暴击率+10%'
  },

  // ========== 11-30级中级远程技能 ==========
  {
    id: 'bow_multi_shot',
    name: '多重射击',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [22,24,26,28,30] },
    cooldown: [2,2,2,2,2],
    baseDamage: [50,58,66,76,87],
    weaponRequirement: ['bow'],
    specialEffects: null,
    requirements: { minLevel: 12, requires: [{ id: 'bow_aimed_shot', level: 3 }] },
    tags: ['物理', '群体', '弓类'],
    description: '多重射击，攻击所有敌人'
  },
  {
    id: 'bow_penetrating_arrow',
    name: '穿透箭',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [28,30,33,36,39] },
    cooldown: [3,3,3,3,3],
    baseDamage: [80,92,106,122,140],
    weaponRequirement: ['bow'],
    specialEffects: {
      penetration: { physical: 30, magic: 0 }
    },
    requirements: { minLevel: 18, requires: [{ id: 'bow_aimed_shot', level: 4 }] },
    tags: ['物理', '单体', '弓类', '破甲'],
    description: '穿透箭，无视30%物理抗性'
  },
  {
    id: 'bow_explosive_arrow',
    name: '爆炸箭',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [40,43,46,49,52] },
    cooldown: [4,4,4,4,4],
    baseDamage: [95,109,126,145,167],
    weaponRequirement: ['bow'],
    specialEffects: null,
    requirements: { minLevel: 25, requires: [{ id: 'bow_multi_shot', level: 4 }] },
    tags: ['物理', '群体', '弓类', '爆炸'],
    description: '爆炸箭，AOE伤害'
  },
  {
    id: 'bow_sniper_focus',
    name: '狙击专注',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [20,22,24,26,28] },
    cooldown: [5,5,5,5,5],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: ['bow'],
    critBonus: [35, 37, 39, 41, 43],
    specialEffects: null,
    requirements: { minLevel: 30, requires: [{ id: 'bow_aimed_shot', level: 5 }] },
    tags: ['物理', '增益', '弓类', '暴击'],
    description: '狙击专注，4回合内暴击率+35%'
  },

  // ========== 31-60级高级远程技能 ==========
  {
    id: 'bow_rapid_fire',
    name: '急速射击',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [55,59,63,67,71] },
    cooldown: [4,4,4,4,4],
    baseDamage: [60,69,79,91,105],
    weaponRequirement: ['bow'],
    specialEffects: {
      multiHit: { count: 3 }
    },
    requirements: { minLevel: 35, requires: [{ id: 'bow_multi_shot', level: 5 }] },
    tags: ['物理', '单体', '弓类', '连击'],
    description: '急速射击，连续射击3次'
  },
  {
    id: 'bow_deadly_precision',
    name: '致命精准',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [65,70,75,80,85] },
    cooldown: [5,5,5,5,5],
    baseDamage: [200,230,265,304,350],
    weaponRequirement: ['bow'],
    critBonus: [25, 27, 29, 31, 33],
    critMultiplier: [2.5, 2.5, 2.5, 2.5, 2.5],
    specialEffects: null,
    requirements: { minLevel: 45, requires: [{ id: 'bow_penetrating_arrow', level: 5 }] },
    tags: ['物理', '单体', '弓类', '暴击'],
    description: '致命精准，暴击率+25%，暴击时造成2.5倍伤害'
  },
  {
    id: 'bow_arrow_rain',
    name: '箭雨',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [80,85,91,97,103] },
    cooldown: [6,6,6,6,6],
    baseDamage: [150,173,198,228,262],
    weaponRequirement: ['bow'],
    specialEffects: null,
    requirements: { minLevel: 55, requires: [{ id: 'bow_explosive_arrow', level: 5 }] },
    tags: ['物理', '群体', '弓类'],
    description: '箭雨，对所有敌人持续攻击2回合'
  },

  // ========== 61-100级终极远程技能 ==========
  {
    id: 'bow_hawk_eye',
    name: '鹰眼',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [50,53,56,59,62] },
    cooldown: [8,8,8,8,8],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: ['bow'],
    critBonus: [50, 52, 54, 56, 58],
    critMultiplier: [2.0, 2.0, 2.0, 2.0, 2.0],
    specialEffects: null,
    requirements: { minLevel: 65, requires: [{ id: 'bow_sniper_focus', level: 5 }] },
    tags: ['物理', '增益', '弓类', '暴击'],
    description: '鹰眼，6回合内暴击率+50%，暴击时造成2倍伤害'
  },
  {
    id: 'bow_deadeye_shot',
    name: '死眼一击',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [100,107,114,121,128] },
    cooldown: [8,8,8,8,8],
    baseDamage: [550,633,728,837,963],
    weaponRequirement: ['bow'],
    critBonus: [100, 100, 100, 100, 100], // 必定暴击
    critMultiplier: [3.0, 3.0, 3.0, 3.0, 3.0],
    specialEffects: {
      penetration: { physical: 50, magic: 0 }
    },
    requirements: { minLevel: 80, requires: [{ id: 'bow_deadly_precision', level: 5 }] },
    tags: ['物理', '单体', '弓类', '终极', '暴击'],
    description: '死眼一击，必定暴击×3，无视50%物理抗性'
  },
  {
    id: 'bow_heaven_piercer',
    name: '贯天神箭',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [150,157,165,173,181] },
    cooldown: [10,10,10,10,10],
    baseDamage: [900,1035,1190,1369,1574],
    weaponRequirement: ['bow'],
    critBonus: [100, 100, 100, 100, 100], // 必定暴击
    critMultiplier: [4.0, 4.0, 4.0, 4.0, 4.0],
    specialEffects: {
      penetration: { physical: 75, magic: 0 },
      execute: { threshold: 0.25 }
    },
    requirements: { minLevel: 100, requires: [{ id: 'bow_deadeye_shot', level: 5 }] },
    tags: ['物理', '单体', '弓类', '终极'],
    description: '贯天神箭，必定暴击×4，无视75%物理抗性，目标HP<25%即死'
  }
];

export default PhysicalRangedSkills;