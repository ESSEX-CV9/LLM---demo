// data/BasicAttacks.js - 武器基础攻击定义

/**
 * 基础攻击数据结构
 * - id: 攻击唯一标识
 * - name: 攻击名称
 * - type: 'physical' | 'magic' - 伤害类型
 * - target: 'single' | 'aoe' - 目标类型
 * - baseDamage: 基础伤害值
 * - damageMultiplier: 伤害倍率（基于武器攻击力）
 * - staminaCost: 耐力消耗
 * - manaCost: 法力消耗
 * - critBonus: 额外暴击率加成%
 * - armorPierce: 无视抗性%
 * - description: 描述
 */

const BasicAttacks = {
    // ==================== 无武器基础攻击 ====================
    unarmed: {
        lightAttack: {
            id: 'unarmed_light',
            name: '轻击',
            type: 'physical',
            target: 'single',
            baseDamage: 5,
            damageMultiplier: 0.6,
            staminaCost: 1,
            manaCost: 0,
            description: '快速的拳脚攻击'
        },
        heavyAttack: {
            id: 'unarmed_heavy',
            name: '重击',
            type: 'physical',
            target: 'single',
            baseDamage: 12,
            damageMultiplier: 1.0,
            staminaCost: 3,
            manaCost: 0,
            description: '蓄力的重拳攻击'
        }
    },

    // ==================== 刀剑类 ====================
    sword: {
        // 大类共享攻击
        shared: {
            id: 'sword_blade_storm',
            name: '剑刃风暴',
            type: 'physical',
            target: 'single',
            baseDamage: 20,
            damageMultiplier: 1.5,
            staminaCost: 5,
            manaCost: 0,
            description: '剑类共享：快速连续斩击'
        },
        // 匕首独有
        dagger: {
            id: 'dagger_shadow_strike',
            name: '影袭',
            type: 'physical',
            target: 'single',
            baseDamage: 25,
            damageMultiplier: 1.8,
            staminaCost: 8,
            manaCost: 0,
            critBonus: 15,
            description: '匕首独有：从阴影中发起突袭，暴击率+15%'
        },
        // 单手剑独有
        oneHandSword: {
            id: 'sword_thrust_counter',
            name: '突刺反击',
            type: 'physical',
            target: 'single',
            baseDamage: 18,
            damageMultiplier: 1.4,
            staminaCost: 4,
            manaCost: 0,
            description: '单手剑独有：快速突刺攻击'
        },
        // 双手剑独有
        twoHandSword: {
            id: 'sword_whirlwind',
            name: '旋风斩',
            type: 'physical',
            target: 'aoe',
            baseDamage: 30,
            damageMultiplier: 1.2,
            staminaCost: 10,
            manaCost: 0,
            description: '双手剑独有：旋转攻击周围所有敌人'
        }
    },

    // ==================== 战锤类 ====================
    hammer: {
        // 大类共享攻击
        shared: {
            id: 'hammer_ground_slam',
            name: '震地击',
            type: 'physical',
            target: 'aoe',
            baseDamage: 35,
            damageMultiplier: 1.6,
            staminaCost: 8,
            manaCost: 0,
            description: '锤类共享：震击地面的群体攻击'
        },
        // 单手锤独有
        oneHandHammer: {
            id: 'hammer_shield_bash',
            name: '盾击连打',
            type: 'physical',
            target: 'single',
            baseDamage: 22,
            damageMultiplier: 1.3,
            staminaCost: 5,
            manaCost: 0,
            description: '单手锤独有：配合盾牌的连续攻击'
        },
        // 双手锤独有
        twoHandHammer: {
            id: 'hammer_power_slam',
            name: '蓄力重锤',
            type: 'physical',
            target: 'single',
            baseDamage: 45,
            damageMultiplier: 2.0,
            staminaCost: 10,
            manaCost: 0,
            description: '双手锤独有：超强单体伤害'
        }
    },

    // ==================== 法杖类（消耗法力） ====================
    staff: {
        // 大类共享攻击
        shared: {
            id: 'staff_magic_missile',
            name: '魔法飞弹',
            type: 'magic',
            target: 'single',
            baseDamage: 18,
            damageMultiplier: 1.2,
            staminaCost: 0,
            manaCost: 4,
            description: '法杖共享：基础魔法攻击'
        },
        // 单手法杖独有
        oneHandStaff: {
            id: 'staff_magic_barrier',
            name: '魔法屏障',
            type: 'support',
            target: 'self',
            baseDamage: 0,
            damageMultiplier: 0,
            staminaCost: 0,
            manaCost: 4,
            defenseBonus: 15,
            duration: 2,
            description: '单手法杖独有：2回合内物理抗性+15%'
        },
        // 双手法杖独有
        twoHandStaff: {
            id: 'staff_arcane_blast',
            name: '魔力冲击',
            type: 'magic',
            target: 'aoe',
            baseDamage: 30,
            damageMultiplier: 1.5,
            staminaCost: 0,
            manaCost: 10,
            description: '双手法杖独有：群体魔法攻击'
        }
    },

    // ==================== 弓箭类 ====================
    bow: {
        // 大类共享攻击
        shared: {
            id: 'bow_precision_shot',
            name: '精准射击',
            type: 'physical',
            target: 'single',
            baseDamage: 20,
            damageMultiplier: 1.6,
            staminaCost: 5,
            manaCost: 0,
            critBonus: 15,
            description: '弓类共享：精准的单体射击，暴击率+15%'
        },
        // 短弓独有
        shortBow: {
            id: 'bow_rapid_fire',
            name: '多发速射',
            type: 'physical',
            target: 'aoe',
            baseDamage: 15,
            damageMultiplier: 1.0,
            staminaCost: 4,
            manaCost: 0,
            description: '短弓独有：快速射出多支箭攻击所有敌人'
        },
        // 长弓独有
        longBow: {
            id: 'bow_armor_pierce',
            name: '破甲箭',
            type: 'physical',
            target: 'single',
            baseDamage: 28,
            damageMultiplier: 1.8,
            staminaCost: 5,
            manaCost: 0,
            armorPierce: 30,
            description: '长弓独有：无视30%物理抗性'
        },
        // 弩独有
        crossbow: {
            id: 'crossbow_triple_shot',
            name: '三连弩',
            type: 'physical',
            target: 'single',
            baseDamage: 25,
            damageMultiplier: 1.5,
            staminaCost: 5,
            manaCost: 0,
            hits: 3,
            description: '弩独有：连续发射三次攻击同一目标'
        }
    },

    // ==================== 盾牌类 ====================
    shield: {
        // 大类共享攻击
        shared: {
            id: 'shield_bash',
            name: '盾牌猛击',
            type: 'physical',
            target: 'single',
            baseDamage: 15,
            damageMultiplier: 1.0,
            staminaCost: 4,
            manaCost: 0,
            description: '盾牌共享：用盾牌撞击敌人'
        },
        // 单手盾独有
        oneHandShield: {
            id: 'shield_charge',
            name: '盾牌冲撞',
            type: 'physical',
            target: 'single',
            baseDamage: 20,
            damageMultiplier: 1.2,
            staminaCost: 5,
            manaCost: 0,
            description: '单手盾独有：冲锋撞击敌人'
        },
        // 双手盾独有
        twoHandShield: {
            id: 'shield_wall',
            name: '盾墙',
            type: 'support',
            target: 'self',
            baseDamage: 0,
            damageMultiplier: 0,
            staminaCost: 5,
            manaCost: 0,
            defenseBonus: 30,
            duration: 3,
            description: '双手盾独有：3回合内物理抗性+30%'
        }
    },

    // ==================== 斧类 ====================
    axe: {
        // 大类共享攻击
        shared: {
            id: 'axe_cleave',
            name: '劈砍',
            type: 'physical',
            target: 'single',
            baseDamage: 25,
            damageMultiplier: 1.5,
            staminaCost: 5,
            manaCost: 0,
            description: '斧类共享：强力劈砍攻击'
        },
        // 单手斧独有
        oneHandAxe: {
            id: 'axe_double_strike',
            name: '双斧连击',
            type: 'physical',
            target: 'single',
            baseDamage: 20,
            damageMultiplier: 1.3,
            staminaCost: 4,
            manaCost: 0,
            hits: 2,
            description: '单手斧独有：连续挥砍两次'
        },
        // 双手斧独有
        twoHandAxe: {
            id: 'axe_whirlwind',
            name: '旋风斩',
            type: 'physical',
            target: 'aoe',
            baseDamage: 32,
            damageMultiplier: 1.4,
            staminaCost: 10,
            manaCost: 0,
            description: '双手斧独有：旋转攻击所有敌人'
        }
    }
};

/**
 * 获取指定武器类型的所有可用基础攻击
 * @param {string} weaponCategory - 武器大类（sword, hammer, staff等）
 * @param {string} weaponSubCategory - 武器小类（dagger, oneHandSword, twoHandSword等）
 * @returns {Array} 可用的基础攻击列表
 */
function getBasicAttacksForWeapon(weaponCategory, weaponSubCategory) {
    const attacks = [];
    
    // 无武器时返回徒手攻击
    if (!weaponCategory || weaponCategory === 'unarmed') {
        attacks.push(BasicAttacks.unarmed.lightAttack);
        attacks.push(BasicAttacks.unarmed.heavyAttack);
        return attacks;
    }
    
    const categoryAttacks = BasicAttacks[weaponCategory];
    if (!categoryAttacks) {
        // 如果没有找到对应类别，返回徒手攻击
        attacks.push(BasicAttacks.unarmed.lightAttack);
        attacks.push(BasicAttacks.unarmed.heavyAttack);
        return attacks;
    }
    
    // 装备武器时，只返回武器相关的特殊攻击，不包含徒手轻击重击
    
    // 添加大类共享攻击
    if (categoryAttacks.shared) {
        attacks.push(categoryAttacks.shared);
    }
    
    // 添加小类独有攻击
    if (weaponSubCategory && categoryAttacks[weaponSubCategory]) {
        attacks.push(categoryAttacks[weaponSubCategory]);
    }
    
    return attacks;
}

/**
 * 根据ID获取基础攻击
 * @param {string} attackId - 攻击ID
 * @returns {Object|null} 攻击数据
 */
function getBasicAttackById(attackId) {
    for (const category in BasicAttacks) {
        const categoryData = BasicAttacks[category];
        
        // 检查徒手攻击
        if (category === 'unarmed') {
            for (const key in categoryData) {
                if (categoryData[key].id === attackId) {
                    return categoryData[key];
                }
            }
        } else {
            // 检查其他武器类别
            for (const key in categoryData) {
                if (categoryData[key].id === attackId) {
                    return categoryData[key];
                }
            }
        }
    }
    return null;
}

/**
 * 计算基础攻击伤害
 * @param {Object} attack - 基础攻击数据
 * @param {Object} attacker - 攻击者数据
 * @returns {number} 计算后的伤害值
 */
function calculateBasicAttackDamage(attack, attacker) {
    // 统一技能与武器特攻计算公式（无随机）：
    // damage = (baseDamage + attackPower * 0.5) * (power / 100 + 0.8)
    const attackPower = attacker.attack || 0;
    const baseDamage = attack.baseDamage || 0;
    const power = attack.type === 'physical'
        ? (attacker.physicalPower || 0)
        : (attack.type === 'magic' ? (attacker.magicPower || 0) : 0);

    const finalDamage = (baseDamage + attackPower * 0.5) * (power / 100 + 0.8);
    return Math.floor(finalDamage);
}

const BasicAttacksDB = {
    BasicAttacks,
    getBasicAttacksForWeapon,
    getBasicAttackById,
    calculateBasicAttackDamage
};

export default BasicAttacksDB;

// 全局暴露（用于非模块环境访问）
window.BasicAttacksDB = BasicAttacksDB;