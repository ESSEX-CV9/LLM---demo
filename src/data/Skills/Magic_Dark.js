// data/Skills/Magic_Dark.js - 暗影神术技能（诅咒+吸血型）

const MagicDarkSkills = [
  // ========== 1-10级基础暗影神术 ==========
  {
    id: 'dark_shadow_bolt',
    name: '暗影箭',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [9,10,11,12,13], sp: [0,0,0,0,0] },
    cooldown: [1,1,1,1,1],
    baseDamage: [22,25,29,33,38],
    weaponRequirement: null,
    specialEffects: null,
    requirements: { minLevel: 3, requires: [] },
    tags: ['魔法', '单体', '暗影'],
    description: '暗影箭，基础暗影攻击'
  },
  {
    id: 'dark_curse_weakness',
    name: '虚弱诅咒',
    kind: 'active',
    type: 'support',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [15,16,18,20,22], sp: [0,0,0,0,0] },
    cooldown: [3,3,3,3,3],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    requirements: { minLevel: 8, requires: [] },
    tags: ['魔法', '减益', '暗影'],
    description: '虚弱诅咒，目标攻击-25%，持续4回合'
  },

  // ========== 11-30级中级暗影神术 ==========
  {
    id: 'dark_life_drain',
    name: '生命汲取',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [25,27,30,33,36], sp: [0,0,0,0,0] },
    cooldown: [2,2,2,2,2],
    baseDamage: [50,58,66,76,87],
    weaponRequirement: null,
    specialEffects: {
      lifesteal: { percent: 1.0 }
    },
    requirements: { minLevel: 12, requires: [{ id: 'dark_shadow_bolt', level: 3 }] },
    tags: ['魔法', '单体', '暗影', '吸血'],
    description: '生命汲取，100%吸血'
  },
  {
    id: 'dark_shadow_blast',
    name: '暗影爆发',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [38,41,44,47,50], sp: [0,0,0,0,0] },
    cooldown: [3,3,3,3,3],
    baseDamage: [60,69,79,91,105],
    weaponRequirement: null,
    specialEffects: null,
    requirements: { minLevel: 18, requires: [{ id: 'dark_shadow_bolt', level: 4 }] },
    tags: ['魔法', '群体', '暗影'],
    description: '暗影爆发，AOE暗影伤害'
  },
  {
    id: 'dark_curse_agony',
    name: '痛苦诅咒',
    kind: 'active',
    type: 'support',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [32,35,38,41,44], sp: [0,0,0,0,0] },
    cooldown: [4,4,4,4,4],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'poison', damage: 25, duration: 6 }
    },
    requirements: { minLevel: 20, requires: [{ id: 'dark_curse_weakness', level: 3 }] },
    tags: ['魔法', '减益', '暗影', 'DOT'],
    description: '痛苦诅咒，目标6回合内每回合-25HP'
  },
  {
    id: 'dark_vampiric_touch',
    name: '吸血之触',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [45,48,52,56,60], sp: [0,0,0,0,0] },
    cooldown: [4,4,4,4,4],
    baseDamage: [95,109,126,145,167],
    weaponRequirement: null,
    specialEffects: {
      lifesteal: { percent: 1.2 }
    },
    requirements: { minLevel: 25, requires: [{ id: 'dark_life_drain', level: 4 }] },
    tags: ['魔法', '单体', '暗影', '吸血'],
    description: '吸血之触，120%吸血'
  },
  {
    id: 'dark_shadow_form',
    name: '暗影形态',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [40,43,46,49,52], sp: [0,0,0,0,0] },
    cooldown: [6,6,6,6,6],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    requirements: { minLevel: 28, requires: [] },
    tags: ['魔法', '增益', '暗影'],
    description: '暗影形态，5回合内魔法强度+40，闪避率+30%'
  },
  {
    id: 'dark_doom',
    name: '末日审判',
    kind: 'active',
    type: 'support',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [60,64,68,72,76], sp: [0,0,0,0,0] },
    cooldown: [5,5,5,5,5],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'poison', damage: 999, duration: 10 }
    },
    requirements: { minLevel: 30, requires: [{ id: 'dark_curse_agony', level: 4 }] },
    tags: ['魔法', '减益', '暗影', 'DOT'],
    description: '末日审判，10回合后目标死亡（可驱散）'
  },

  // ========== 31-60级高级暗影神术 ==========
  {
    id: 'dark_soul_reaper',
    name: '灵魂收割',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [80,85,91,97,103], sp: [0,0,0,0,0] },
    cooldown: [6,6,6,6,6],
    baseDamage: [220,253,291,335,385],
    weaponRequirement: null,
    specialEffects: {
      lifesteal: { percent: 1.5 },
      execute: { threshold: 0.4 }
    },
    requirements: { minLevel: 40, requires: [{ id: 'dark_vampiric_touch', level: 5 }] },
    tags: ['魔法', '单体', '暗影', '吸血', '处决'],
    description: '灵魂收割，150%吸血，目标HP<40%即死'
  },
  {
    id: 'dark_plague',
    name: '瘟疫术',
    kind: 'active',
    type: 'support',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [70,75,80,85,90], sp: [0,0,0,0,0] },
    cooldown: [7,7,7,7,7],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: {
      dot: { type: 'poison', damage: 40, duration: 8 }
    },
    requirements: { minLevel: 45, requires: [{ id: 'dark_curse_agony', level: 5 }] },
    tags: ['魔法', '群体', '暗影', 'DOT'],
    description: '瘟疫术，所有敌人8回合内每回合-40HP'
  },
  {
    id: 'dark_shadow_master',
    name: '暗影主宰',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [90,96,102,108,114], sp: [0,0,0,0,0] },
    cooldown: [8,8,8,8,8],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    requirements: { minLevel: 55, requires: [{ id: 'dark_shadow_form', level: 5 }] },
    tags: ['魔法', '增益', '暗影'],
    description: '暗影主宰，8回合内魔法强度+70，闪避+50%，所有伤害吸血'
  },
  {
    id: 'dark_void_blast',
    name: '虚空爆裂',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [120,127,134,141,148], sp: [0,0,0,0,0] },
    cooldown: [7,7,7,7,7],
    baseDamage: [270,311,357,411,472],
    weaponRequirement: null,
    specialEffects: {
      lifesteal: { percent: 0.8 },
      penetration: { physical: 0, magic: 40 }
    },
    requirements: { minLevel: 60, requires: [{ id: 'dark_shadow_blast', level: 5 }] },
    tags: ['魔法', '群体', '暗影', '吸血', '破甲'],
    description: '虚空爆裂，80%吸血，无视40%魔法抗性'
  },

  // ========== 61-100级终极暗影神术 ==========
  {
    id: 'dark_death_coil',
    name: '死亡缠绕',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [140,148,156,164,172], sp: [0,0,0,0,0] },
    cooldown: [8,8,8,8,8],
    baseDamage: [450,518,595,685,788],
    weaponRequirement: null,
    specialEffects: {
      lifesteal: { percent: 2.0 },
      execute: { threshold: 0.3 }
    },
    requirements: { minLevel: 70, requires: [{ id: 'dark_soul_reaper', level: 5 }] },
    tags: ['魔法', '单体', '暗影', '吸血', '处决'],
    description: '死亡缠绕，200%吸血，目标HP<30%即死'
  },
  {
    id: 'dark_apocalypse',
    name: '暗影末世',
    kind: 'active',
    type: 'magic',
    target: 'aoe',
    maxLevel: 5,
    cost: { mp: [180,189,198,207,216], sp: [0,0,0,0,0] },
    cooldown: [10,10,10,10,10],
    baseDamage: [380,437,503,578,665],
    weaponRequirement: null,
    specialEffects: {
      lifesteal: { percent: 1.0 },
      dot: { type: 'poison', damage: 50, duration: 10 }
    },
    requirements: { minLevel: 85, requires: [{ id: 'dark_plague', level: 5 }] },
    tags: ['魔法', '群体', '暗影', '吸血', 'DOT'],
    description: '暗影末世，100%吸血，持续10回合诅咒'
  },
  {
    id: 'dark_void_lord',
    name: '虚空之主',
    kind: 'active',
    type: 'support',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [150,157,165,173,181], sp: [0,0,0,0,0] },
    cooldown: [12,12,12,12,12],
    baseDamage: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    requirements: { minLevel: 95, requires: [{ id: 'dark_shadow_master', level: 5 }] },
    tags: ['魔法', '增益', '暗影'],
    description: '虚空之主，12回合内魔法强度+120，所有伤害吸血150%'
  },
  {
    id: 'dark_oblivion',
    name: '湮灭虚空',
    kind: 'active',
    type: 'magic',
    target: 'single',
    maxLevel: 5,
    cost: { mp: [250,262,275,288,301], sp: [0,0,0,0,0] },
    cooldown: [10,10,10,10,10],
    baseDamage: [950,1093,1257,1445,1662],
    weaponRequirement: null,
    specialEffects: {
      lifesteal: { percent: 2.5 },
      penetration: { physical: 0, magic: 70 },
      execute: { threshold: 0.5 }
    },
    requirements: { minLevel: 100, requires: [{ id: 'dark_death_coil', level: 5 }] },
    tags: ['魔法', '单体', '暗影', '终极', '吸血'],
    description: '湮灭虚空，250%吸血，无视70%魔法抗性，目标HP<50%即死'
  }
];

export default MagicDarkSkills;