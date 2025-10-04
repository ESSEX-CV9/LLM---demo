// data/Skills/Magic_Passive.js - 魔法被动技能

const MagicPassiveSkills = [
  {
    id: 'passive_arcane_lore',
    name: '奥术学识',
    kind: 'passive',
    type: 'passive',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [0,0,0,0,0] },
    cooldown: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    effect: { kind: 'passive', data: { maxMana: [8,16,24,32,40], magicPower: [3,6,9,12,15] } },
    requirements: { minLevel: 1, requires: [] },
    tags: ['被动', '魔法'],
    description: '奥术学识，提升最大法力和魔法强度'
  },
  {
    id: 'passive_mana_efficiency',
    name: '法力效率',
    kind: 'passive',
    type: 'passive',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [0,0,0,0,0] },
    cooldown: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    effect: { kind: 'passive', data: { maxMana: [12,24,36,48,60] } },
    requirements: { minLevel: 10, requires: [{ id: 'passive_arcane_lore', level: 3 }] },
    tags: ['被动', '魔法'],
    description: '法力效率，大幅提升最大法力值'
  },
  {
    id: 'passive_spell_power',
    name: '法术强度',
    kind: 'passive',
    type: 'passive',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [0,0,0,0,0] },
    cooldown: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    effect: { kind: 'passive', data: { magicPower: [8,16,24,32,40] } },
    requirements: { minLevel: 15, requires: [{ id: 'passive_arcane_lore', level: 4 }] },
    tags: ['被动', '魔法'],
    description: '法术强度，大幅提升魔法强度'
  },
  {
    id: 'passive_magic_resistance',
    name: '魔法抗性',
    kind: 'passive',
    type: 'passive',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [0,0,0,0,0] },
    cooldown: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    effect: { kind: 'passive', data: { magicResistance: [3,6,9,12,15] } },
    requirements: { minLevel: 20, requires: [] },
    tags: ['被动', '魔法', '防御'],
    description: '魔法抗性，提升魔法抗性'
  },
  {
    id: 'passive_arcane_mastery',
    name: '奥术精通',
    kind: 'passive',
    type: 'passive',
    target: 'self',
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [0,0,0,0,0] },
    cooldown: [0,0,0,0,0],
    weaponRequirement: null,
    specialEffects: null,
    effect: { kind: 'passive', data: { maxMana: [20,40,60,80,100], magicPower: [10,20,30,40,50] } },
    requirements: { minLevel: 40, requires: [{ id: 'passive_spell_power', level: 5 }] },
    tags: ['被动', '魔法'],
    description: '奥术精通，大幅提升法力和魔法强度'
  }
];

export default MagicPassiveSkills;