// data/Skills.js - 技能定义与查询

// 技能字段约定：
// id, name, kind('active'|'passive'), type('physical'|'magic'|'support'|'passive'),
// target('enemy'|'self'), maxLevel, cost: { mp: number[], sp: number[] },
// cooldown: number[](回合), baseDamage?: number[], baseHeal?: number[],
// scaling?: { physicalPowerCoef?: number[], magicPowerCoef?: number[] },
// effect?: { kind: 'buff'|'restore'|'special', data?: any },
// requirements: { minLevel?: number, requires?: Array&lt;{ id: string, level: number }&gt; },
// tags: string[]

const Skills = [
  {
    id: 'slash',
    name: '基础斩击',
    kind: 'active',
    type: 'physical',    // 明确：物理攻击
    target: 'single',     // 明确：单体目标
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [4,5,6,7,8] },
    cooldown: [0,0,0,0,0],
    baseDamage: [12,16,20,24,28],
    requirements: { minLevel: 1, requires: [] },
    tags: ['单体','物理']
  },
  {
    id: 'heavy_strike',
    name: '重击',
    kind: 'active',
    type: 'physical',    // 明确：物理攻击
    target: 'single',     // 明确：单体目标
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [10,11,12,13,14] },
    cooldown: [2,2,2,2,2],
    baseDamage: [25,32,39,46,53],
    requirements: { minLevel: 2, requires: [{ id: 'slash', level: 2 }] },
    tags: ['单体','物理','爆发']
  },
  {
    id: 'flurry',
    name: '连击',
    kind: 'active',
    type: 'physical',    // 明确：物理攻击
    target: 'single',     // 明确：单体目标
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [8,9,10,11,12] },
    cooldown: [3,3,3,3,3],
    baseDamage: [15,19,23,27,31],
    requirements: { minLevel: 3, requires: [{ id: 'slash', level: 3 }] },
    tags: ['单体','物理','多段']
  },
  {
    id: 'fireball',
    name: '火球术',
    kind: 'active',
    type: 'magic',       // 明确：魔法攻击
    target: 'single',     // 明确：单体目标
    maxLevel: 5,
    cost: { mp: [6,7,8,9,10], sp: [0,0,0,0,0] },
    cooldown: [1,1,1,1,1],
    baseDamage: [22,28,34,40,46],
    requirements: { minLevel: 2, requires: [] },
    tags: ['单体','魔法','灼烧?']
  },
  {
    id: 'ice_arrow',
    name: '寒冰箭',
    kind: 'active',
    type: 'magic',       // 明确：魔法攻击
    target: 'single',     // 明确：单体目标
    maxLevel: 5,
    cost: { mp: [6,7,8,9,10], sp: [0,0,0,0,0] },
    cooldown: [2,2,2,2,2],
    baseDamage: [18,24,30,36,42],
    effect: { kind: 'special', data: { slow: { duration: 1 } } },
    requirements: { minLevel: 3, requires: [{ id: 'fireball', level: 2 }] },
    tags: ['单体','魔法','减速']
  },
  {
    id: 'heal',
    name: '治疗术',
    kind: 'active',
    type: 'support',     // 明确：支援类型
    target: 'self',      // 明确：自身目标
    maxLevel: 5,
    cost: { mp: [8,9,10,11,12], sp: [0,0,0,0,0] },
    cooldown: [2,2,2,2,2],
    baseHeal: [25,33,41,49,57],
    requirements: { minLevel: 2, requires: [] },
    tags: ['治疗','自我']
  },
  {
    id: 'defend_stance',
    name: '守备姿态',
    kind: 'active',
    type: 'support',     // 明确：支援类型
    target: 'self',      // 明确：自身目标
    maxLevel: 3,
    cost: { mp: [0,0,0], sp: [3,3,3] },
    cooldown: [2,2,2],
    effect: { kind: 'buff', data: { defendNext: true } },
    requirements: { minLevel: 1, requires: [] },
    tags: ['减伤','自我']
  },
  {
    id: 'meditate',
    name: '冥想',
    kind: 'active',
    type: 'support',     // 明确：支援类型
    target: 'self',      // 明确：自身目标
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [0,0,0,0,0] },
    cooldown: [3,3,3,3,3],
    effect: { kind: 'restore', data: { mana: [12,15,18,21,24] } },
    requirements: { minLevel: 2, requires: [] },
    tags: ['回蓝','自我']
  },
  {
    id: 'passive_physical_training',
    name: '体能训练',
    kind: 'passive',
    type: 'passive',     // 明确：被动技能
    target: 'self',      // 明确：自身
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [0,0,0,0,0] },
    cooldown: [0,0,0,0,0],
    effect: { kind: 'passive', data: { maxStamina: [8,16,24,32,40], physicalPower: [3,6,9,12,15] } },
    requirements: { minLevel: 1, requires: [] },
    tags: ['被动','物理']
  },
  {
    id: 'passive_arcane_lore',
    name: '奥术学识',
    kind: 'passive',
    type: 'passive',     // 明确：被动技能
    target: 'self',      // 明确：自身
    maxLevel: 5,
    cost: { mp: [0,0,0,0,0], sp: [0,0,0,0,0] },
    cooldown: [0,0,0,0,0],
    effect: { kind: 'passive', data: { maxMana: [8,16,24,32,40], magicPower: [3,6,9,12,15] } },
    requirements: { minLevel: 1, requires: [] },
    tags: ['被动','魔法']
  }
];

function clampLevel(skill, level) {
  return Math.max(1, Math.min(skill.maxLevel, level || 1));
}

function describeLevel(skill, level) {
  const lv = clampLevel(skill, level);
  const mp = skill.cost?.mp?.[lv - 1] ?? 0;
  const sp = skill.cost?.sp?.[lv - 1] ?? 0;
  const cd = skill.cooldown?.[lv - 1] ?? 0;
  const dmg = skill.baseDamage ? skill.baseDamage[lv - 1] : undefined;
  const heal = skill.baseHeal ? skill.baseHeal[lv - 1] : undefined;
  const phy = skill.scaling?.physicalPowerCoef ? skill.scaling.physicalPowerCoef[lv - 1] : undefined;
  const mag = skill.scaling?.magicPowerCoef ? skill.scaling.magicPowerCoef[lv - 1] : undefined;
  const parts = [];
  if (dmg !== undefined) parts.push(`基础伤害${dmg}`);
  if (heal !== undefined) parts.push(`基础治疗${heal}`);
  if (phy !== undefined) parts.push(`物强系数x${phy}`);
  if (mag !== undefined) parts.push(`魔强系数x${mag}`);
  parts.push(`消耗 MP:${mp}/SP:${sp}`, `冷却:${cd}`);
  return parts.join('，');
}

function getSkillById(id) {
  return Skills.find(s => s.id === id) || null;
}

function getAllSkills() {
  return [...Skills];
}

const SkillsDB = {
  getSkillById,
  getAllSkills,
  describeLevel,
  Skills
};

export default SkillsDB;