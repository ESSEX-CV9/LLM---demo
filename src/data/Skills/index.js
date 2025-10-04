// data/Skills/index.js - 统一技能导出

import PhysicalCommonSkills from './Physical_Common.js';
import PhysicalSwordSkills from './Physical_Sword.js';
import PhysicalHeavySkills from './Physical_Heavy.js';
import PhysicalRangedSkills from './Physical_Ranged.js';
import PhysicalSupportSkills from './Physical_Support.js';
import MagicFireSkills from './Magic_Fire.js';
import MagicIceSkills from './Magic_Ice.js';
import MagicHolySkills from './Magic_Holy.js';
import MagicDarkSkills from './Magic_Dark.js';
import MagicThunderSkills from './Magic_Thunder.js';
import MagicPassiveSkills from './Magic_Passive.js';

// 合并所有技能
const AllSkills = [
  ...PhysicalCommonSkills,
  ...PhysicalSwordSkills,
  ...PhysicalHeavySkills,
  ...PhysicalRangedSkills,
  ...PhysicalSupportSkills,
  ...MagicFireSkills,
  ...MagicIceSkills,
  ...MagicHolySkills,
  ...MagicDarkSkills,
  ...MagicThunderSkills,
  ...MagicPassiveSkills
];

console.log(`[SkillsDB] 加载了 ${AllSkills.length} 个技能`);

// 辅助函数
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
  
  const parts = [];
  if (dmg !== undefined) parts.push(`基础伤害${dmg}`);
  if (heal !== undefined) parts.push(`基础治疗${heal}`);
  
  // 武器要求
  if (skill.weaponRequirement && skill.weaponRequirement.length > 0) {
    const weaponNames = {
      'sword': '剑',
      'dagger': '匕首',
      'hammer': '锤',
      'axe': '斧',
      'bow': '弓',
      'staff': '法杖'
    };
    const reqNames = skill.weaponRequirement.map(w => weaponNames[w] || w).join('/');
    parts.push(`需要${reqNames}`);
  }
  
  parts.push(`消耗 MP:${mp}/SP:${sp}`, `冷却:${cd}`);
  
  // 特殊效果描述
  if (skill.specialEffects) {
    if (skill.specialEffects.multiHit) {
      parts.push(`连击×${skill.specialEffects.multiHit.count}`);
    }
    if (skill.specialEffects.dot) {
      const dotNames = { 'burn': '灼烧', 'poison': '中毒', 'bleed': '流血' };
      const dotName = dotNames[skill.specialEffects.dot.type] || skill.specialEffects.dot.type;
      parts.push(`${dotName}${skill.specialEffects.dot.duration}回合(${skill.specialEffects.dot.damage}伤害/回合)`);
    }
    if (skill.specialEffects.cc) {
      const ccNames = { 'stun': '晕眩', 'freeze': '冰冻', 'slow': '减速' };
      const ccName = ccNames[skill.specialEffects.cc.type] || skill.specialEffects.cc.type;
      const chance = Math.floor(skill.specialEffects.cc.chance * 100);
      parts.push(`${ccName}${skill.specialEffects.cc.duration}回合(${chance}%几率)`);
    }
    if (skill.specialEffects.lifesteal) {
      parts.push(`吸血${Math.floor(skill.specialEffects.lifesteal.percent * 100)}%`);
    }
    if (skill.specialEffects.penetration) {
      if (skill.specialEffects.penetration.physical > 0) {
        parts.push(`无视${skill.specialEffects.penetration.physical}%物抗`);
      }
      if (skill.specialEffects.penetration.magic > 0) {
        parts.push(`无视${skill.specialEffects.penetration.magic}%魔抗`);
      }
    }
    if (skill.specialEffects.execute) {
      parts.push(`处决<${Math.floor(skill.specialEffects.execute.threshold * 100)}%HP`);
    }
    if (skill.specialEffects.mark) {
      parts.push(`标记伤害+${Math.floor(skill.specialEffects.mark.damageBonus * 100)}%`);
    }
    if (skill.specialEffects.reflect) {
      parts.push(`反伤${Math.floor(skill.specialEffects.reflect.percent * 100)}%`);
    }
  }
  
  return parts.join('，');
}

function getSkillById(id) {
  return AllSkills.find(s => s.id === id) || null;
}

function getAllSkills() {
  return [...AllSkills];
}

// 按类型获取技能
function getSkillsByType(type) {
  return AllSkills.filter(s => s.type === type);
}

// 按等级范围获取技能
function getSkillsByLevelRange(minLevel, maxLevel = 100) {
  return AllSkills.filter(s => 
    s.requirements.minLevel >= minLevel && 
    s.requirements.minLevel <= maxLevel
  );
}

// 按标签获取技能
function getSkillsByTag(tag) {
  return AllSkills.filter(s => s.tags && s.tags.includes(tag));
}

// 按武器要求获取技能
function getSkillsByWeaponRequirement(weaponType) {
  if (!weaponType) {
    // 无武器要求的技能
    return AllSkills.filter(s => !s.weaponRequirement || s.weaponRequirement.length === 0);
  }
  return AllSkills.filter(s => 
    s.weaponRequirement && s.weaponRequirement.includes(weaponType)
  );
}

// 获取技能统计信息
function getSkillStats() {
  const stats = {
    total: AllSkills.length,
    byType: {},
    byLevel: {},
    byWeapon: {},
    withSpecialEffects: 0
  };
  
  AllSkills.forEach(skill => {
    // 按类型统计
    stats.byType[skill.type] = (stats.byType[skill.type] || 0) + 1;
    
    // 按等级统计
    const levelRange = Math.floor(skill.requirements.minLevel / 10) * 10;
    const rangeKey = `${levelRange}-${levelRange + 9}`;
    stats.byLevel[rangeKey] = (stats.byLevel[rangeKey] || 0) + 1;
    
    // 按武器统计
    if (skill.weaponRequirement) {
      skill.weaponRequirement.forEach(weapon => {
        stats.byWeapon[weapon] = (stats.byWeapon[weapon] || 0) + 1;
      });
    } else {
      stats.byWeapon['无要求'] = (stats.byWeapon['无要求'] || 0) + 1;
    }
    
    // 特殊效果统计
    if (skill.specialEffects) {
      stats.withSpecialEffects++;
    }
  });
  
  return stats;
}

const SkillsDB = {
  getSkillById,
  getAllSkills,
  getSkillsByType,
  getSkillsByLevelRange,
  getSkillsByTag,
  getSkillsByWeaponRequirement,
  getSkillStats,
  describeLevel,
  Skills: AllSkills
};

// 输出统计信息
const stats = getSkillStats();
console.log('[SkillsDB] 技能统计:', stats);

export default SkillsDB;