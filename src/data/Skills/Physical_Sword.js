// data/Skills/Physical_Sword.js - 剑类专精技能（需要sword/dagger）

const PhysicalSwordSkills = [
  // ========== 1-10级基础剑技 ==========
  {
    id: 'sword_quick_slash',
    name: '快速斩击',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [8,9,10,11,12] },
    cooldown: [1,1,1,1,1],
    baseDamage: [25,29,33,38,44],
    weaponRequirement: ['sword', 'dagger'],
    critBonus: [5, 6, 7, 8, 10], // 手动定义：快速攻击有一定暴击加成
    specialEffects: null,
    requirements: { minLevel: 3, requires: [{ id: 'phy_basic_strike', level: 2 }] },
    tags: ['物理', '单体', '剑类'],
    description: '快速的剑击，攻击速度快，轻微暴击率加成'
  },

  // ========== 11-30级中级剑技 ==========
  {
    id: 'sword_piercing_thrust',
    name: '穿刺突击',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [18,20,22,24,26] },
    cooldown: [2,2,2,2,2],
    baseDamage: [55,63,72,83,95],
    weaponRequirement: ['sword', 'dagger'],
    specialEffects: {
      penetration: { physical: 15, magic: 0 }
    },
    requirements: { minLevel: 10, requires: [{ id: 'sword_quick_slash', level: 3 }] },
    tags: ['物理', '单体', '剑类', '破甲'],
    description: '锐利的穿刺，无视15%物理抗性'
  },
  {
    id: 'sword_blade_dance',
    name: '剑舞',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [25,27,30,33,36] },
    cooldown: [3,3,3,3,3],
    baseDamage: [30,35,40,46,53],
    weaponRequirement: ['sword'],
    specialEffects: {
      multiHit: { count: 3 }
    },
    requirements: { minLevel: 15, requires: [{ id: 'sword_quick_slash', level: 4 }] },
    tags: ['物理', '单体', '剑类', '连击'],
    description: '华丽的剑舞，连续攻击3次'
  },
  {
    id: 'dagger_backstab',
    name: '背刺',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [20,22,24,26,28] },
    cooldown: [3,3,3,3,3],
    baseDamage: [70,81,93,107,123],
    weaponRequirement: ['dagger'],
    hitBonus: [10, 14, 18, 22, 26], // 手动定义：精准背刺，命中率随等级提升
    specialEffects: null,
    requirements: { minLevel: 12, requires: [{ id: 'sword_quick_slash', level: 3 }] },
    tags: ['物理', '单体', '匕首', '暴击'],
    description: '背后偷袭，暴击率+25%，命中率极高'
  },
  {
    id: 'sword_parry',
    name: '格挡',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [10,11,12,13,14] },
    cooldown: [2,2,2,2,2],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: ['sword'],
    specialEffects: null,
    requirements: { minLevel: 18, requires: [] },
    tags: ['物理', '防御', '剑类'],
    description: '格挡姿态，下次攻击闪避率+40%'
  },
  {
    id: 'dagger_poison_blade',
    name: '毒刃',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [22,24,26,28,30] },
    cooldown: [3,3,3,3,3],
    baseDamage: [60,69,79,91,105],
    weaponRequirement: ['dagger'],
    hitBonus: [12, 14, 16, 18, 20], // 手动定义：快速涂毒，中高命中率
    specialEffects: {
      dot: { type: 'poison', damage: 10, duration: 3 }
    },
    requirements: { minLevel: 20, requires: [{ id: 'dagger_backstab', level: 3 }] },
    tags: ['物理', '单体', '匕首', 'DOT'],
    description: '涂毒的匕首，造成3回合中毒效果，每回合-10HP'
  },
  {
    id: 'sword_execution_slash',
    name: '处刑斩',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [35,38,41,44,47] },
    cooldown: [4,4,4,4,4],
    baseDamage: [110,127,146,168,193],
    weaponRequirement: ['sword'],
    specialEffects: {
      execute: { threshold: 0.4 }
    },
    requirements: { minLevel: 25, requires: [{ id: 'sword_blade_dance', level: 3 }] },
    tags: ['物理', '单体', '剑类', '处决'],
    description: '处刑斩击，目标生命值<40%时必定暴击'
  },
  {
    id: 'dagger_shadow_step',
    name: '影步',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [15,16,17,18,19] },
    cooldown: [4,4,4,4,4],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: ['dagger'],
    hitBonus: [100, 100, 100, 100, 100], // 手动定义：增益技能必中
    specialEffects: null,
    requirements: { minLevel: 25, requires: [{ id: 'dagger_backstab', level: 4 }] },
    tags: ['物理', '增益', '匕首'],
    description: '影步技能，下次攻击必定暴击'
  },
  {
    id: 'sword_blade_storm',
    name: '剑刃风暴',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [45,48,51,54,57] },
    cooldown: [4,4,4,4,4],
    baseDamage: [85,98,113,130,149],
    weaponRequirement: ['sword'],
    specialEffects: null,
    requirements: { minLevel: 30, requires: [{ id: 'sword_blade_dance', level: 4 }] },
    tags: ['物理', '群体', '剑类'],
    description: '剑刃风暴，攻击所有敌人'
  },

  // ========== 31-60级高级剑技 ==========
  {
    id: 'sword_divine_slash',
    name: '神圣斩击',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [55,59,63,67,71] },
    cooldown: [5,5,5,5,5],
    baseDamage: [200,230,265,304,350],
    weaponRequirement: ['sword'],
    specialEffects: {
      penetration: { physical: 25, magic: 0 }
    },
    requirements: { minLevel: 40, requires: [{ id: 'sword_execution_slash', level: 5 }] },
    tags: ['物理', '单体', '剑类', '破甲'],
    description: '神圣的剑击，无视25%物理抗性'
  },
  {
    id: 'dagger_assassinate',
    name: '暗杀',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [60,64,68,72,76] },
    cooldown: [6,6,6,6,6],
    baseDamage: [180,207,238,274,315],
    weaponRequirement: ['dagger'],
    hitBonus: [16, 18, 22, 24, 26], // 手动定义：终极暗杀技能，超高命中率
    specialEffects: null,
    requirements: { minLevel: 40, requires: [{ id: 'dagger_shadow_step', level: 5 }] },
    tags: ['物理', '单体', '匕首', '暴击'],
    description: '致命暗杀，暴击率+35%，暴击时造成2倍伤害，几乎必中'
  },
  {
    id: 'sword_sword_master',
    name: '剑圣之境',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [40,43,46,49,52] },
    cooldown: [6,6,6,6,6],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: ['sword'],
    specialEffects: null,
    requirements: { minLevel: 50, requires: [{ id: 'sword_blade_storm', level: 5 }] },
    tags: ['物理', '增益', '剑类'],
    description: '剑圣境界，6回合内攻击+40%，暴击率+20%'
  },
  {
    id: 'dagger_deadly_venom',
    name: '致命剧毒',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [45,48,51,54,57] },
    cooldown: [5,5,5,5,5],
    baseDamage: [120,138,159,183,210],
    weaponRequirement: ['dagger'],
    hitBonus: [18, 20, 22, 24, 26], // 手动定义：高级毒素技能，很高命中率
    specialEffects: {
      dot: { type: 'poison', damage: 30, duration: 5 }
    },
    requirements: { minLevel: 50, requires: [{ id: 'dagger_poison_blade', level: 5 }] },
    tags: ['物理', '单体', '匕首', 'DOT'],
    description: '致命剧毒，5回合内每回合-30HP'
  },
  {
    id: 'sword_moonlight_slash',
    name: '月光斩',
    kind: 'active',
    type: 'physical',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [70,75,80,85,90] },
    cooldown: [6,6,6,6,6],
    baseDamage: [160,184,212,243,280],
    weaponRequirement: ['sword'],
    specialEffects: {
      penetration: { physical: 30, magic: 0 }
    },
    requirements: { minLevel: 60, requires: [{ id: 'sword_divine_slash', level: 5 }] },
    tags: ['物理', '群体', '剑类', '破甲'],
    description: '月光斩，群体攻击，无视30%物理抗性'
  },
  {
    id: 'dagger_death_mark',
    name: '死亡印记',
    kind: 'active',
    type: 'support',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [50,53,56,59,62] },
    cooldown: [7,7,7,7,7],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: ['dagger'],
    specialEffects: {
      mark: { damageBonus: 0.5, duration: 4 }
    },
    requirements: { minLevel: 65, requires: [{ id: 'dagger_assassinate', level: 5 }] },
    tags: ['物理', '单体', '匕首', '标记'],
    description: '标记敌人，4回合内该敌人受到的所有伤害+50%'
  },

  // ========== 61-100级终极剑技 ==========
  {
    id: 'sword_thousand_cuts',
    name: '千刃斩',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [90,96,102,108,114] },
    cooldown: [7,7,7,7,7],
    baseDamage: [150,173,198,228,262],
    weaponRequirement: ['sword'],
    specialEffects: {
      multiHit: { count: 4 }
    },
    requirements: { minLevel: 75, requires: [{ id: 'sword_moonlight_slash', level: 5 }] },
    tags: ['物理', '单体', '剑类', '连击'],
    description: '千刃斩，连续攻击4次'
  },
  {
    id: 'dagger_shadow_clone',
    name: '影分身',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [70,74,78,82,86] },
    cooldown: [8,8,8,8,8],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: ['dagger'],
    specialEffects: null,
    requirements: { minLevel: 80, requires: [{ id: 'dagger_death_mark', level: 5 }] },
    tags: ['物理', '增益', '匕首'],
    description: '创造影分身，接下来2次攻击伤害翻倍'
  },
  {
    id: 'sword_ultimate_blade',
    name: '终极之刃',
    kind: 'active',
    type: 'physical',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [120,126,132,138,144] },
    cooldown: [10,10,10,10,10],
    baseDamage: [750,863,992,1141,1312],
    weaponRequirement: ['sword'],
    specialEffects: {
      penetration: { physical: 50, magic: 0 },
      execute: { threshold: 0.35 }
    },
    requirements: { minLevel: 95, requires: [{ id: 'sword_thousand_cuts', level: 5 }] },
    tags: ['物理', '单体', '剑类', '终极'],
    description: '终极剑技，无视50%物理抗性，暴击×3，目标HP<35%即死'
  }
];

export default PhysicalSwordSkills;