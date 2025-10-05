// services/EffectManager.js - 特殊效果管理器
// 管理战斗中的所有特殊效果：DOT、控制、标记、反伤等

class EffectManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 监听战斗开始，清理所有效果
        this.eventBus.on('battle:start', this.onBattleStart.bind(this), 'game');
    }

    onBattleStart() {
        // 战斗开始时清理效果（如果需要）
        console.log('[EffectManager] 战斗开始');
    }

    /**
     * 应用持续伤害效果 (DOT - Damage Over Time)
     * @param {Object} target - 目标对象
     * @param {Object} dotData - DOT数据 { type, damage, duration }
     * @param {string} sourceId - 来源ID
     * @returns {Object} 效果对象
     */
    applyDOT(target, dotData, sourceId) {
        const effectId = `dot_${Date.now()}_${Math.random()}`;
        const effect = {
            id: effectId,
            type: 'dot',
            subType: dotData.type, // 'burn', 'poison', 'bleed'
            // 🆕 移除 target 引用避免循环引用，effect已存储在target.activeEffects中
            damage: dotData.damage,
            remainingTurns: dotData.duration,
            sourceId: sourceId,
            timestamp: Date.now()
        };

        if (!target.activeEffects) {
            target.activeEffects = [];
        }
        target.activeEffects.push(effect);

        console.log(`[EffectManager] 应用DOT效果: ${dotData.type}, 伤害${dotData.damage}/回合, 持续${dotData.duration}回合`);
        return effect;
    }

    /**
     * 应用控制效果 (CC - Crowd Control)
     * @param {Object} target - 目标对象
     * @param {Object} ccData - CC数据 { type, duration, chance }
     * @param {string} sourceId - 来源ID
     * @returns {Object|null} 效果对象或null（未触发）
     */
    applyCC(target, ccData, sourceId) {
        // 检查触发概率
        const roll = Math.random();
        if (roll >= (ccData.chance || 1.0)) {
            console.log(`[EffectManager] 控制效果未触发 (${Math.floor(roll * 100)}% vs ${Math.floor(ccData.chance * 100)}%)`);
            return null;
        }

        const effectId = `cc_${Date.now()}_${Math.random()}`;
        const effect = {
            id: effectId,
            type: 'cc',
            subType: ccData.type, // 'stun', 'freeze', 'slow'
            // 🆕 移除 target 引用避免循环引用
            remainingTurns: ccData.duration,
            sourceId: sourceId,
            timestamp: Date.now()
        };

        if (!target.activeEffects) {
            target.activeEffects = [];
        }
        target.activeEffects.push(effect);

        console.log(`[EffectManager] 应用控制效果: ${ccData.type}, 持续${ccData.duration}回合`);
        return effect;
    }

    /**
     * 应用标记效果
     * @param {Object} target - 目标对象
     * @param {Object} markData - 标记数据 { damageBonus, duration }
     * @param {string} sourceId - 来源ID
     * @returns {Object} 效果对象
     */
    applyMark(target, markData, sourceId) {
        const effectId = `mark_${Date.now()}_${Math.random()}`;
        const effect = {
            id: effectId,
            type: 'mark',
            damageBonus: markData.damageBonus,
            remainingTurns: markData.duration,
            // 🆕 移除 target 引用避免循环引用
            sourceId: sourceId,
            timestamp: Date.now()
        };

        if (!target.activeEffects) {
            target.activeEffects = [];
        }
        target.activeEffects.push(effect);

        console.log(`[EffectManager] 应用标记效果: 伤害+${Math.floor(markData.damageBonus * 100)}%, 持续${markData.duration}回合`);
        return effect;
    }

    /**
     * 应用反伤效果
     * @param {Object} target - 目标对象
     * @param {Object} reflectData - 反伤数据 { percent, duration }
     * @param {string} sourceId - 来源ID
     * @returns {Object} 效果对象
     */
    applyReflect(target, reflectData, sourceId) {
        const effectId = `reflect_${Date.now()}_${Math.random()}`;
        const effect = {
            id: effectId,
            type: 'reflect',
            percent: reflectData.percent,
            remainingTurns: reflectData.duration,
            // 🆕 移除 target 引用避免循环引用
            sourceId: sourceId,
            timestamp: Date.now()
        };

        if (!target.activeEffects) {
            target.activeEffects = [];
        }
        target.activeEffects.push(effect);

        console.log(`[EffectManager] 应用反伤效果: ${Math.floor(reflectData.percent * 100)}%, 持续${reflectData.duration}回合`);
        return effect;
    }

    /**
     * 处理回合开始时的效果
     * @param {Object} battleState - 战斗状态
     * @returns {Array} 消息数组
     */
    processTurnEffects(battleState) {
        const allTargets = [battleState.player, ...battleState.enemies];
        const messages = [];

        for (const target of allTargets) {
            if (!target.activeEffects || target.hp <= 0) continue;

            const expiredEffects = [];

            for (const effect of target.activeEffects) {
                // 处理DOT效果
                if (effect.type === 'dot') {
                    const damage = effect.damage;
                    target.hp = Math.max(0, target.hp - damage);

                    const effectName = {
                        'burn': '灼烧',
                        'poison': '中毒',
                        'bleed': '流血'
                    }[effect.subType] || effect.subType;

                    const targetName = target.name || target.type;
                    messages.push({
                        type: target === battleState.player ? 'player' : 'enemy',
                        message: `${targetName}受到${effectName}效果，损失${damage}点生命值！`,
                        round: battleState.round
                    });

                    if (target.hp <= 0) {
                        messages.push({
                            type: target === battleState.player ? 'player' : 'enemy',
                            message: `${targetName}因${effectName}而倒下！`,
                            round: battleState.round
                        });
                    }
                }

                // 递减持续时间
                effect.remainingTurns--;
                if (effect.remainingTurns <= 0) {
                    expiredEffects.push(effect.id);

                    // 效果结束提示
                    const targetName = target.name || target.type;
                    if (effect.type === 'cc') {
                        const ccName = {
                            'stun': '晕眩',
                            'freeze': '冰冻',
                            'slow': '减速'
                        }[effect.subType] || effect.subType;
                        messages.push({
                            type: target === battleState.player ? 'player' : 'enemy',
                            message: `${targetName}的${ccName}效果消失了`,
                            round: battleState.round
                        });
                    }
                }
            }

            // 移除过期效果
            target.activeEffects = target.activeEffects.filter(e => !expiredEffects.includes(e.id));
        }

        return messages;
    }

    /**
     * 检查目标是否被完全控制（无法行动）
     * @param {Object} target - 目标对象
     * @returns {boolean}
     */
    isControlled(target) {
        if (!target.activeEffects) return false;
        return target.activeEffects.some(e =>
            e.type === 'cc' && (e.subType === 'stun' || e.subType === 'freeze')
        );
    }

    /**
     * 检查目标是否被减速
     * @param {Object} target - 目标对象
     * @returns {boolean}
     */
    isSlowed(target) {
        if (!target.activeEffects) return false;
        return target.activeEffects.some(e => e.type === 'cc' && e.subType === 'slow');
    }

    /**
     * 获取目标的伤害加成（来自标记）
     * @param {Object} target - 目标对象
     * @returns {number} 伤害加成倍率
     */
    getDamageBonus(target) {
        if (!target.activeEffects) return 0;
        const markEffect = target.activeEffects.find(e => e.type === 'mark');
        return markEffect ? markEffect.damageBonus : 0;
    }

    /**
     * 获取目标的反伤百分比
     * @param {Object} target - 目标对象
     * @returns {number} 反伤百分比
     */
    getReflectPercent(target) {
        if (!target.activeEffects) return 0;
        const reflectEffect = target.activeEffects.find(e => e.type === 'reflect');
        return reflectEffect ? reflectEffect.percent : 0;
    }

    /**
     * 清除目标的所有效果
     * @param {Object} target - 目标对象
     */
    clearEffects(target) {
        if (target.activeEffects) {
            target.activeEffects = [];
            console.log(`[EffectManager] 清除所有效果`);
        }
    }

    /**
     * 清除目标的指定类型效果
     * @param {Object} target - 目标对象
     * @param {string} effectType - 效果类型 ('dot', 'cc', 'mark', 'reflect')
     */
    clearEffectsByType(target, effectType) {
        if (!target.activeEffects) return;
        const before = target.activeEffects.length;
        target.activeEffects = target.activeEffects.filter(e => e.type !== effectType);
        const removed = before - target.activeEffects.length;
        if (removed > 0) {
            console.log(`[EffectManager] 清除${removed}个${effectType}效果`);
        }
    }

    /**
     * 获取目标的所有激活效果
     * @param {Object} target - 目标对象
     * @returns {Array} 效果数组
     */
    getActiveEffects(target) {
        return target.activeEffects || [];
    }

    /**
     * 获取效果的友好显示名称
     * @param {Object} effect - 效果对象
     * @returns {string} 显示名称
     */
    getEffectDisplayName(effect) {
        const names = {
            'dot': {
                'burn': '灼烧',
                'poison': '中毒',
                'bleed': '流血'
            },
            'cc': {
                'stun': '晕眩',
                'freeze': '冰冻',
                'slow': '减速'
            },
            'mark': '标记',
            'reflect': '反伤'
        };

        if (effect.type === 'dot' || effect.type === 'cc') {
            return names[effect.type][effect.subType] || effect.subType;
        }
        return names[effect.type] || effect.type;
    }

    /**
     * 获取效果的描述
     * @param {Object} effect - 效果对象
     * @returns {string} 效果描述
     */
    getEffectDescription(effect) {
        const name = this.getEffectDisplayName(effect);
        const turns = effect.remainingTurns;

        if (effect.type === 'dot') {
            return `${name}(${effect.damage}伤害/回合, 剩余${turns}回合)`;
        }
        if (effect.type === 'cc') {
            return `${name}(剩余${turns}回合)`;
        }
        if (effect.type === 'mark') {
            return `${name}(伤害+${Math.floor(effect.damageBonus * 100)}%, 剩余${turns}回合)`;
        }
        if (effect.type === 'reflect') {
            return `${name}(${Math.floor(effect.percent * 100)}%反伤, 剩余${turns}回合)`;
        }
        return `${name}(剩余${turns}回合)`;
    }
}

export default EffectManager;