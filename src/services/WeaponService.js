// services/WeaponService.js - 武器基础攻击服务

import BasicAttacksDB from '../data/BasicAttacks.js';

class WeaponService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 可以监听装备变化事件
        this.eventBus.on('equipment:equipped', this.onEquipmentChange.bind(this), 'game');
        this.eventBus.on('equipment:unequipped', this.onEquipmentChange.bind(this), 'game');
    }

    onEquipmentChange(data) {
        // 装备变化时可以触发UI更新
        this.eventBus.emit('weapon:attacks:updated', {}, 'game');
    }

    /**
     * 获取当前装备武器的可用基础攻击
     * @returns {Array} 可用的基础攻击列表
     */
    getAvailableBasicAttacks() {
        const gameStateService = window.gameCore?.getService('gameStateService');
        if (!gameStateService) return [];

        const gameState = gameStateService.getState();
        const player = gameState.player;
        
        // 检查主手武器
        const weapon1 = player.equipment?.weapon1;
        const weapon2 = player.equipment?.weapon2;

        // 如果没有武器，返回徒手攻击
        if (!weapon1) {
            return BasicAttacksDB.getBasicAttacksForWeapon('unarmed', null);
        }

        // 获取武器的攻击列表
        const weaponCategory = weapon1.weaponCategory || this.inferWeaponCategory(weapon1.subType);
        const weaponSubCategory = weapon1.weaponSubCategory || this.inferWeaponSubCategory(weapon1);

        let attacks = BasicAttacksDB.getBasicAttacksForWeapon(weaponCategory, weaponSubCategory);

        // 如果装备了第二把武器或盾牌，添加其特殊攻击
        if (weapon2 && !weapon2.isSecondarySlot) {
            const weapon2Category = weapon2.weaponCategory || this.inferWeaponCategory(weapon2.subType);
            const weapon2SubCategory = weapon2.weaponSubCategory || this.inferWeaponSubCategory(weapon2);
            
            // 只添加第二把武器的特殊攻击（不重复添加轻击重击）
            const weapon2Attacks = BasicAttacksDB.getBasicAttacksForWeapon(weapon2Category, weapon2SubCategory);
            const specialAttacks = weapon2Attacks.filter(atk => 
                atk.id !== 'unarmed_light' && atk.id !== 'unarmed_heavy'
            );
            attacks = attacks.concat(specialAttacks);
        }

        return attacks;
    }

    /**
     * 根据武器子类型推断武器大类
     * @param {string} subType - 武器子类型
     * @returns {string} 武器大类
     */
    inferWeaponCategory(subType) {
        const categoryMap = {
            'sword': 'sword',
            'dagger': 'sword',
            'hammer': 'hammer',
            'club': 'hammer',
            'staff': 'staff',
            'wand': 'staff',
            'bow': 'bow',
            'axe': 'axe',
            'shield': 'shield'
        };
        return categoryMap[subType] || 'unarmed';
    }

    /**
     * 根据武器数据推断武器小类
     * @param {Object} weapon - 武器数据
     * @returns {string} 武器小类
     */
    inferWeaponSubCategory(weapon) {
        // 如果已经有weaponSubCategory字段，直接返回
        if (weapon.weaponSubCategory) {
            return weapon.weaponSubCategory;
        }

        const subType = weapon.subType;
        const weaponType = weapon.weaponType;

        // 根据subType和weaponType推断
        if (subType === 'dagger') return 'dagger';
        if (subType === 'sword') {
            return weaponType === 'two-handed' ? 'twoHandSword' : 'oneHandSword';
        }
        if (subType === 'hammer' || subType === 'club') {
            return weaponType === 'two-handed' ? 'twoHandHammer' : 'oneHandHammer';
        }
        if (subType === 'staff' || subType === 'wand') {
            return weaponType === 'two-handed' ? 'twoHandStaff' : 'oneHandStaff';
        }
        if (subType === 'bow') {
            // 根据名称判断弓的类型
            const name = weapon.name?.toLowerCase() || '';
            if (name.includes('短弓')) return 'shortBow';
            if (name.includes('长弓')) return 'longBow';
            if (name.includes('弩')) return 'crossbow';
            return weaponType === 'two-handed' ? 'longBow' : 'shortBow';
        }
        if (subType === 'axe') {
            return weaponType === 'two-handed' ? 'twoHandAxe' : 'oneHandAxe';
        }
        if (subType === 'shield') {
            // 盾牌通常是单手，但可以有大盾
            const name = weapon.name?.toLowerCase() || '';
            if (name.includes('双手') || name.includes('大')) return 'twoHandShield';
            return 'oneHandShield';
        }

        return null;
    }

    /**
     * 在战斗中使用基础攻击
     * @param {string} attackId - 攻击ID
     * @param {number} targetIndex - 目标索引
     * @returns {Object} 结果
     */
    useBasicAttack(attackId, targetIndex) {
        const battleService = window.gameCore?.getService('battleService');
        const battleState = battleService?.getBattleState();
        
        if (!battleService || !battleState || !battleState.isActive) {
            return { success: false, message: '当前没有进行中的战斗' };
        }

        const attack = BasicAttacksDB.getBasicAttackById(attackId);
        if (!attack) {
            return { success: false, message: '未知的攻击' };
        }

        const player = battleState.player;

        // 检查资源是否足够
        if (attack.manaCost > 0 && (player.mana || 0) < attack.manaCost) {
            return { success: false, message: '法力不足' };
        }
        if (attack.staminaCost > 0 && (player.stamina || 0) < attack.staminaCost) {
            return { success: false, message: '耐力不足' };
        }

        // 消耗资源
        if (attack.manaCost > 0) {
            player.mana = Math.max(0, player.mana - attack.manaCost);
        }
        if (attack.staminaCost > 0) {
            player.stamina = Math.max(0, player.stamina - attack.staminaCost);
        }

        let logMessage = '';
        let totalDamage = 0;

        // 根据攻击类型执行
        if (attack.type === 'support') {
            // 支援类攻击（如魔法屏障、盾墙）
            logMessage = this.executeSupportAttack(attack, player);
        } else {
            // 伤害类攻击
            if (attack.target === 'single') {
                // 单体攻击
                const enemy = battleState.enemies[targetIndex];
                if (!enemy || enemy.hp <= 0) {
                    return { success: false, message: '目标无效' };
                }

                const result = this.executeSingleTargetAttack(attack, player, enemy, battleService);
                logMessage = result.message;
                totalDamage = result.damage;
            } else if (attack.target === 'aoe') {
                // 群体攻击
                const result = this.executeAOEAttack(attack, player, battleState, battleService);
                logMessage = result.message;
                totalDamage = result.damage;
            }
        }

        // 写入战斗日志
        battleState.battleLog.push({
            type: 'player',
            message: logMessage,
            round: battleState.round
        });

        // 同步资源到全局状态
        const gameStateService = window.gameCore?.getService('gameStateService');
        if (gameStateService) {
            gameStateService.updatePlayerStats({
                hp: player.hp,
                mana: player.mana,
                stamina: player.stamina
            });
        }

        // 刷新UI
        this.eventBus.emit('ui:battle:update', battleState, 'game');

        return { success: true, message: logMessage, damage: totalDamage };
    }

    /**
     * 执行单体攻击
     */
    executeSingleTargetAttack(attack, player, enemy, battleService) {
        // 检查闪避
        const dodged = battleService.checkDodge(player, enemy);
        if (dodged) {
            return {
                damage: 0,
                message: `你使用【${attack.name}】，但${enemy.type}敏捷地闪避了！`
            };
        }

        // 计算伤害
        let damage = BasicAttacksDB.calculateBasicAttackDamage(attack, player);

        // 随机浮动
        const variance = Math.random() * 0.3 + 0.85; // 85%-115%
        damage = Math.floor(damage * variance);

        // 检查暴击
        let criticalChance = player.criticalChance || 0;
        if (attack.critBonus) {
            criticalChance += attack.critBonus;
        }
        const isCritical = Math.random() * 100 < criticalChance;
        if (isCritical) {
            damage = Math.floor(damage * 1.5);
        }

        // 应用抗性
        let finalDamage = damage;
        if (attack.armorPierce) {
            // 破甲攻击：临时降低抗性
            const originalResist = enemy.physicalResistance || 0;
            const tempResist = Math.max(0, originalResist - attack.armorPierce);
            enemy.physicalResistance = tempResist;
            finalDamage = battleService.applyResistance(damage, attack.type, enemy);
            enemy.physicalResistance = originalResist; // 恢复
        } else {
            finalDamage = battleService.applyResistance(damage, attack.type, enemy);
        }

        // 应用到敌人
        enemy.hp = Math.max(0, enemy.hp - finalDamage);

        // 生成消息
        const critText = isCritical ? '暴击！' : '';
        const pierceText = attack.armorPierce ? `（破甲${attack.armorPierce}%）` : '';
        let message = `你使用【${attack.name}】${critText}${pierceText}，对${enemy.type}造成了${finalDamage}点伤害！`;
        
        if (enemy.hp <= 0) {
            message += ` ${enemy.type}被击败了！`;
        }

        return { damage: finalDamage, message };
    }

    /**
     * 执行群体攻击
     */
    executeAOEAttack(attack, player, battleState, battleService) {
        const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);
        let totalDamage = 0;
        const damageResults = [];

        for (const enemy of aliveEnemies) {
            // 检查闪避
            const dodged = battleService.checkDodge(player, enemy);
            if (dodged) {
                damageResults.push(`${enemy.type}闪避`);
                continue;
            }

            // 计算伤害（群体攻击伤害略低）
            let damage = BasicAttacksDB.calculateBasicAttackDamage(attack, player);
            const variance = Math.random() * 0.3 + 0.85;
            damage = Math.floor(damage * variance);

            // 群体攻击不触发暴击（或降低暴击率）
            const criticalChance = (player.criticalChance || 0) * 0.5;
            const isCritical = Math.random() * 100 < criticalChance;
            if (isCritical) {
                damage = Math.floor(damage * 1.5);
            }

            // 应用抗性
            const finalDamage = battleService.applyResistance(damage, attack.type, enemy);
            enemy.hp = Math.max(0, enemy.hp - finalDamage);
            totalDamage += finalDamage;

            const critText = isCritical ? '暴击' : '';
            damageResults.push(`${enemy.type}${critText}${finalDamage}点${enemy.hp <= 0 ? '(击败)' : ''}`);
        }

        const message = `你使用【${attack.name}】，${damageResults.join('，')}！`;
        return { damage: totalDamage, message };
    }

    /**
     * 执行支援类攻击
     */
    executeSupportAttack(attack, player) {
        if (attack.defenseBonus && attack.duration) {
            // 添加临时防御增益
            const gameStateService = window.gameCore?.getService('gameStateService');
            if (gameStateService) {
                const buffData = {
                    name: attack.name,
                    stats: { physicalResistance: attack.defenseBonus },
                    duration: attack.duration
                };
                gameStateService.getState().addTempBuff(buffData);
            }
            return `你使用【${attack.name}】，物理抗性提升${attack.defenseBonus}%，持续${attack.duration}回合！`;
        }

        return `你使用了【${attack.name}】！`;
    }

    /**
     * 获取攻击描述（用于UI显示）
     * @param {string} attackId - 攻击ID
     * @param {Object} player - 玩家数据
     * @returns {Object} 攻击信息
     */
    getAttackInfo(attackId, player) {
        const attack = BasicAttacksDB.getBasicAttackById(attackId);
        if (!attack) return null;

        const damage = BasicAttacksDB.calculateBasicAttackDamage(attack, player);

        return {
            ...attack,
            estimatedDamage: damage,
            canUse: (player.mana >= attack.manaCost) && (player.stamina >= attack.staminaCost)
        };
    }
}

export default WeaponService;