// services/EquipmentEffectService.js - 装备效果处理服务
class EquipmentEffectService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.activeEffects = new Map(); // 存储当前激活的装备效果
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('equipment:equipped', this.onEquipmentEquipped.bind(this), 'game');
        this.eventBus.on('equipment:unequipped', this.onEquipmentUnequipped.bind(this), 'game');
        this.eventBus.on('battle:turn:start', this.processTurnEffects.bind(this), 'game');
        this.eventBus.on('battle:damage:calculate', this.modifyDamage.bind(this), 'game');
        this.eventBus.on('skill:cost:calculate', this.modifySkillCost.bind(this), 'game');
    }

    // 装备时激活效果
    onEquipmentEquipped(data) {
        const { item, slot, equipment } = data;
        
        if (equipment.effects && equipment.effects.length > 0) {
            const effectKey = `${slot}_${item}`;
            this.activeEffects.set(effectKey, {
                slot,
                item,
                effects: equipment.effects
            });
            
            console.log(`[EquipmentEffect] 激活装备效果: ${item}`, equipment.effects);
            
            // 应用被动效果
            this.applyPassiveEffects(equipment.effects, true);
        }
    }

    // 卸下装备时移除效果
    onEquipmentUnequipped(data) {
        const { item, slot, equipment } = data;
        
        const effectKey = `${slot}_${item}`;
        if (this.activeEffects.has(effectKey)) {
            const effectData = this.activeEffects.get(effectKey);
            
            // 移除被动效果
            this.applyPassiveEffects(effectData.effects, false);
            
            this.activeEffects.delete(effectKey);
            console.log(`[EquipmentEffect] 移除装备效果: ${item}`);
        }
    }

    // 应用被动效果（如生命回复、法力回复等）
    applyPassiveEffects(effects, isApplying) {
        const gameStateService = window.gameCore?.getService('gameStateService');
        if (!gameStateService) return;

        for (const effect of effects) {
            switch (effect.type) {
                case 'hp_regeneration':
                case 'mana_regeneration':
                    // 这些效果在回合开始时处理
                    break;
                    
                case 'max_stat_bonus':
                    // 最大属性加成已在EquipmentService中处理
                    break;
                    
                default:
                    // 其他被动效果可以在这里处理
                    break;
            }
        }
    }

    // 处理回合开始时的效果
    processTurnEffects(battleState) {
        if (!battleState || !battleState.player) return;

        let hpRegen = 0;
        let manaRegen = 0;
        let staminaRegen = 0;

        // 遍历所有激活的装备效果
        for (const [key, effectData] of this.activeEffects.entries()) {
            for (const effect of effectData.effects) {
                switch (effect.type) {
                    case 'hp_regeneration':
                        hpRegen += effect.value || 0;
                        break;
                    case 'mana_regeneration':
                        manaRegen += effect.value || 0;
                        break;
                    case 'stamina_regeneration':
                        staminaRegen += effect.value || 0;
                        break;
                }
            }
        }

        // 应用回复效果
        if (hpRegen > 0 || manaRegen > 0 || staminaRegen > 0) {
            const player = battleState.player;
            let updates = {};
            let messages = [];

            if (hpRegen > 0) {
                const oldHp = player.hp;
                player.hp = Math.min(player.maxHp, player.hp + hpRegen);
                const actualRegen = player.hp - oldHp;
                if (actualRegen > 0) {
                    updates.hp = player.hp;
                    messages.push(`装备效果回复了${actualRegen}点生命值`);
                }
            }

            if (manaRegen > 0) {
                const oldMana = player.mana;
                player.mana = Math.min(player.maxMana, player.mana + manaRegen);
                const actualRegen = player.mana - oldMana;
                if (actualRegen > 0) {
                    updates.mana = player.mana;
                    messages.push(`装备效果回复了${actualRegen}点法力值`);
                }
            }

            if (staminaRegen > 0) {
                const oldStamina = player.stamina;
                player.stamina = Math.min(player.maxStamina, player.stamina + staminaRegen);
                const actualRegen = player.stamina - oldStamina;
                if (actualRegen > 0) {
                    updates.stamina = player.stamina;
                    messages.push(`装备效果回复了${actualRegen}点耐力值`);
                }
            }

            // 同步到全局状态
            if (Object.keys(updates).length > 0) {
                const gameStateService = window.gameCore?.getService('gameStateService');
                if (gameStateService) {
                    gameStateService.updatePlayerStats(updates);
                }

                // 显示通知
                if (messages.length > 0) {
                    this.eventBus.emit('ui:notification', {
                        message: messages.join('，'),
                        type: 'info'
                    }, 'game');
                }
            }
        }
    }

    // 修改伤害计算
    modifyDamage(damageData) {
        const { attacker, target, damage, damageType, targetType } = damageData;
        let modifiedDamage = damage;

        // 如果攻击者是玩家，检查武器效果
        if (attacker === 'player') {
            for (const [key, effectData] of this.activeEffects.entries()) {
                for (const effect of effectData.effects) {
                    switch (effect.type) {
                        case 'damage_bonus':
                            // 对特定目标类型的伤害加成
                            if (effect.target && targetType && targetType.includes(effect.target)) {
                                modifiedDamage *= effect.value;
                                console.log(`[EquipmentEffect] 对${effect.target}伤害加成: ${damage} -> ${modifiedDamage}`);
                            }
                            break;
                        case 'critical_damage_bonus':
                            // 暴击伤害加成
                            if (damageData.isCritical) {
                                modifiedDamage *= effect.value;
                            }
                            break;
                        case 'elemental_damage':
                            // 元素伤害加成
                            modifiedDamage += effect.value;
                            break;
                    }
                }
            }
        }

        // 如果目标是玩家，检查防具效果
        if (target === 'player') {
            for (const [key, effectData] of this.activeEffects.entries()) {
                for (const effect of effectData.effects) {
                    switch (effect.type) {
                        case 'damage_reduction':
                            // 伤害减免
                            modifiedDamage *= (1 - effect.value);
                            console.log(`[EquipmentEffect] 伤害减免: ${damage} -> ${modifiedDamage}`);
                            break;
                        case 'elemental_resistance':
                            // 元素抗性
                            if (effect.element && damageType === effect.element) {
                                modifiedDamage *= (1 - effect.value);
                            }
                            break;
                    }
                }
            }
        }

        damageData.modifiedDamage = Math.floor(modifiedDamage);
        return damageData;
    }

    // 修改技能消耗
    modifySkillCost(costData) {
        const { skillId, originalCost } = costData;
        let modifiedCost = { ...originalCost };

        for (const [key, effectData] of this.activeEffects.entries()) {
            for (const effect of effectData.effects) {
                switch (effect.type) {
                    case 'spell_cost_reduction':
                        // 法术消耗减少
                        if (modifiedCost.mp) {
                            modifiedCost.mp = Math.ceil(modifiedCost.mp * (1 - effect.value));
                        }
                        break;
                    case 'skill_cost_reduction':
                        // 技能消耗减少
                        if (modifiedCost.sp) {
                            modifiedCost.sp = Math.ceil(modifiedCost.sp * (1 - effect.value));
                        }
                        break;
                    case 'specific_skill_bonus':
                        // 特定技能加成
                        if (effect.skillId === skillId) {
                            if (effect.costReduction) {
                                modifiedCost.mp = Math.ceil((modifiedCost.mp || 0) * (1 - effect.costReduction));
                                modifiedCost.sp = Math.ceil((modifiedCost.sp || 0) * (1 - effect.costReduction));
                            }
                        }
                        break;
                }
            }
        }

        costData.modifiedCost = modifiedCost;
        return costData;
    }

    // 获取所有激活的效果描述
    getActiveEffectDescriptions() {
        const descriptions = [];
        
        for (const [key, effectData] of this.activeEffects.entries()) {
            for (const effect of effectData.effects) {
                if (effect.description) {
                    descriptions.push({
                        source: effectData.item,
                        description: effect.description,
                        type: effect.type
                    });
                }
            }
        }
        
        return descriptions;
    }

    // 检查是否有特定类型的效果
    hasEffectType(effectType) {
        for (const [key, effectData] of this.activeEffects.entries()) {
            for (const effect of effectData.effects) {
                if (effect.type === effectType) {
                    return true;
                }
            }
        }
        return false;
    }

    // 获取特定类型效果的总值
    getEffectValue(effectType) {
        let totalValue = 0;
        
        for (const [key, effectData] of this.activeEffects.entries()) {
            for (const effect of effectData.effects) {
                if (effect.type === effectType) {
                    totalValue += effect.value || 0;
                }
            }
        }
        
        return totalValue;
    }

    // 清除所有效果（用于新游戏或重置）
    clearAllEffects() {
        this.activeEffects.clear();
        console.log('[EquipmentEffect] 清除所有装备效果');
    }

    // 获取效果统计
    getEffectStats() {
        const stats = {
            totalEffects: 0,
            effectTypes: new Set(),
            sources: new Set()
        };

        for (const [key, effectData] of this.activeEffects.entries()) {
            stats.sources.add(effectData.item);
            for (const effect of effectData.effects) {
                stats.totalEffects++;
                stats.effectTypes.add(effect.type);
            }
        }

        return {
            totalEffects: stats.totalEffects,
            effectTypes: Array.from(stats.effectTypes),
            sources: Array.from(stats.sources)
        };
    }
}

export default EquipmentEffectService;