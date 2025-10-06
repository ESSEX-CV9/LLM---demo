// services/BattleService.js
import EnemyTemplates from '../data/EnemyTemplates.js';

class BattleService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.currentBattle = null;
        this.battleState = null;
        this.enemyTemplates = new EnemyTemplates();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('battle:start', this.startBattle.bind(this), 'game');
        this.eventBus.on('battle:action', this.handleBattleAction.bind(this), 'game');
        this.eventBus.on('battle:end', this.endBattle.bind(this), 'game');
    }

    // 使用"准备-点击进入"的战斗流程
    async prepareBattle(battleData) {
        const { enemies, environment, special_conditions } = battleData;

        // 获取玩家状态
        const gameStateService = window.gameCore?.getService('gameStateService');
        const gameState = gameStateService?.getState();

        if (!gameState) {
            throw new Error('无法获取游戏状态');
        }

        const playerStats = gameState.getPlayerStats(); // 计算后的属性

        // 处理敌人数据 - 支持模板系统
        const processedEnemies = this.processEnemies(enemies, playerStats.level);

        // 初始化战斗状态（准备态：不激活、不弹窗）
        this.battleState = {
            player: {
                name: playerStats.name || '冒险者',
                hp: playerStats.hp,
                maxHp: playerStats.maxHp,
                level: playerStats.level,
                attack: playerStats.attack,
                physicalResistance: playerStats.physicalResistance ?? 0,
                magicResistance: playerStats.magicResistance ?? 0,
                agility: playerStats.agility ?? 8,
                weight: playerStats.weight ?? 10,
                // 新增资源与强度、技能同步
                mana: playerStats.mana ?? 0,
                maxMana: playerStats.maxMana ?? 0,
                stamina: playerStats.stamina ?? 0,
                maxStamina: playerStats.maxStamina ?? 0,
                magicPower: playerStats.magicPower ?? 0,
                physicalPower: playerStats.physicalPower ?? 0,
                criticalChance: playerStats.criticalChance ?? 0,
                skills: Array.isArray(playerStats.skills) ? JSON.parse(JSON.stringify(playerStats.skills)) : [],
                // 动作加入"技能"
                actions: ['攻击', '技能', '防御', '使用物品', '逃跑']
            },
            enemies: processedEnemies,
            environment,
            special_conditions: special_conditions || [],
            turn: 'player',
            round: 1,
            battleLog: [],
            isActive: false // 准备态不激活
        };

        // 不设置 currentBattle，直到正式进入战斗
        this.currentBattle = null;

        return {
            success: true,
            message: '战斗已准备'
        };
    }

    // 玩家点击“进入战斗”后正式进入战斗并弹出战斗界面
    launchPreparedBattle() {
        if (!this.battleState) {
            console.warn('[BattleService] 没有准备好的战斗状态');
            return { success: false, message: '战斗尚未准备' };
        }

        // 激活战斗并弹出界面
        this.battleState.isActive = true;
        this.currentBattle = this.battleState;

        this.eventBus.emit('ui:battle:show', this.battleState, 'game');

        return { success: true, message: '战斗开始！' };
    }
    async startBattle(battleData) {
        const { enemies, environment, special_conditions } = battleData;
        
        // 获取玩家状态
        const gameStateService = window.gameCore?.getService('gameStateService');
        const gameState = gameStateService?.getState();
        
        if (!gameState) {
            throw new Error('无法获取游戏状态');
        }

        const playerStats = gameState.getPlayerStats(); // 使用计算后的属性

        // 处理敌人数据 - 支持模板系统
        const processedEnemies = this.processEnemies(enemies, playerStats.level);

        // 初始化战斗状态
        this.battleState = {
            player: {
                name: playerStats.name || '冒险者',
                hp: playerStats.hp,
                maxHp: playerStats.maxHp,
                level: playerStats.level,
                attack: playerStats.attack,
                physicalResistance: playerStats.physicalResistance ?? 0,
                magicResistance: playerStats.magicResistance ?? 0,
                agility: playerStats.agility ?? 8,
                weight: playerStats.weight ?? 10,
                // 新增资源与强度、技能同步
                mana: playerStats.mana ?? 0,
                maxMana: playerStats.maxMana ?? 0,
                stamina: playerStats.stamina ?? 0,
                maxStamina: playerStats.maxStamina ?? 0,
                magicPower: playerStats.magicPower ?? 0,
                physicalPower: playerStats.physicalPower ?? 0,
                criticalChance: playerStats.criticalChance ?? 0,
                skills: Array.isArray(playerStats.skills) ? JSON.parse(JSON.stringify(playerStats.skills)) : [],
                // 动作加入"技能"
                actions: ['攻击', '技能', '防御', '使用物品', '逃跑']
            },
            enemies: processedEnemies,
            environment,
            special_conditions: special_conditions || [],
            turn: 'player',
            round: 1,
            battleLog: [],
            isActive: true
        };

        this.currentBattle = this.battleState;
        
        // 显示战斗界面
        this.eventBus.emit('ui:battle:show', this.battleState, 'game');
        
        return {
            success: true,
            message: '战斗开始！'
        };
    }

    // 处理敌人数据，支持模板系统和传统系统
    processEnemies(enemies, playerLevel) {
        return enemies.map(enemy => {
            // 如果敌人只有type和level，使用模板系统
            if (enemy.type && enemy.level && !enemy.hp) {
                const template = this.enemyTemplates.getEnemyByLevel(enemy.level);
                if (template && template.type === enemy.type) {
                    return {
                        ...template,
                        actions: template.skills || ['攻击', '技能攻击']
                    };
                }
                // 如果没找到匹配的模板，使用推荐等级生成
                const recommendedTemplate = this.enemyTemplates.getEnemyByLevel(enemy.level);
                if (recommendedTemplate) {
                    return {
                        ...recommendedTemplate,
                        type: enemy.type, // 保持原始类型名
                        actions: recommendedTemplate.skills || ['攻击', '技能攻击']
                    };
                }
            }
            
            // 传统敌人数据处理
            return {
                ...enemy,
                hp: enemy.hp || this.calculateEnemyHP(enemy),
                maxHp: enemy.maxHp || enemy.hp || this.calculateEnemyHP(enemy),
                actions: enemy.actions || ['攻击', '技能攻击']
            };
        });
    }

    async handleBattleAction(actionData) {
        if (!this.currentBattle || !this.battleState.isActive) {
            return { success: false, message: '当前没有进行中的战斗' };
        }

        const { action, target, item, skillId } = actionData;
        let result = {};

        if (this.battleState.turn === 'player') {
            result = await this.executePlayerAction(action, target, item, skillId);
            
            // 🆕 统一检查战斗结束条件（无论什么行动类型）
            if (this.battleState.enemies.every(enemy => enemy.hp <= 0)) {
                return await this.endBattle('victory');
            }
            
            // 🆕 使用物品不结束回合，只更新界面
            if (action === '使用物品') {
                this.eventBus.emit('ui:battle:update', this.battleState, 'game');
                return result;
            }
            
            // 🆕 完成物品使用后结束回合
            if (action === '完成物品使用') {
                this.battleState.turn = 'enemy';
                this.eventBus.emit('ui:battle:update', this.battleState, 'game');
                
                // 延迟执行敌人行动
                setTimeout(() => {
                    this.executeEnemyTurn();
                }, 1500);
                
                return result;
            }
            
            // 如果是特殊攻击或技能，在检查战斗结束后再处理回合逻辑
            if (action === '特殊攻击' || action === '技能') {
                // 技能/特殊攻击后仍需切换回合（如果战斗未结束）
                this.battleState.turn = 'enemy';
                this.eventBus.emit('ui:battle:update', this.battleState, 'game');
                
                // 延迟执行敌人行动
                setTimeout(() => {
                    this.executeEnemyTurn();
                }, 1500);
                
                return result;
            }
            
            // 切换到敌人回合
            this.battleState.turn = 'enemy';
            this.eventBus.emit('ui:battle:update', this.battleState, 'game');
            
            // 延迟执行敌人行动
            setTimeout(() => {
                this.executeEnemyTurn();
            }, 1500);
            
        }

        return result;
    }

    async executePlayerAction(action, target, item, skillId) {
        const player = this.battleState.player;
        
        let logMessage = '';
        let damage = 0;

        switch (action) {
            case '攻击':
                // 直接使用 battleState.enemies 和 target 索引，不要过滤后再访问
                if (target !== undefined && this.battleState.enemies[target]) {
                    const targetEnemy = this.battleState.enemies[target];
                    
                    // 检查目标是否还活着
                    if (targetEnemy.hp <= 0) {
                        logMessage = '目标已被击败！';
                        break;
                    }
                    
                    // 检查敌人是否闪避（与技能一致的命中判定）
                    const dodged = this.checkDodge(player, targetEnemy);
                    if (dodged) {
                        logMessage = `你的攻击被${targetEnemy.type}敏捷地闪避了！`;
                        break;
                    }
                    
                    // 检查斩杀效果（优先级最高）
                    const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
                    if (equipmentEffectService) {
                        const executeThreshold = equipmentEffectService.getExecuteThreshold();
                        if (executeThreshold > 0) {
                            const hpPercent = targetEnemy.hp / targetEnemy.maxHp;
                            if (hpPercent <= executeThreshold) {
                                targetEnemy.hp = 0;
                                logMessage = `⚡你触发了斩杀效果！${targetEnemy.type}被瞬间击杀！`;
                                break;
                            }
                        }
                    }
                    
                    damage = this.calculatePlayerDamage(player, 'attack', targetEnemy);
                    
                    // 添加暴击检查
                    const isCritical = this.checkCriticalHit();
                    if (isCritical) {
                        damage = Math.floor(damage * 1.5);
                    }

                    // 最终一次随机浮动（90% - 110%）
                    const variance = Math.random() * 0.2 + 0.9;
                    const variedDamage = Math.floor(damage * variance);
                    
                    // 应用抗性减伤（包含破甲）
                    const actualDamage = this.applyResistance(variedDamage, 'physical', targetEnemy, 'player');
                    targetEnemy.hp = Math.max(0, targetEnemy.hp - actualDamage);
                    
                    let criticalText = isCritical ? '暴击！' : '';
                    logMessage = `你${criticalText}对${targetEnemy.type}造成了${actualDamage}点伤害！`;
                    
                    // 吸血效果
                    if (equipmentEffectService && actualDamage > 0) {
                        const lifestealPercent = equipmentEffectService.getLifestealPercent();
                        if (lifestealPercent > 0) {
                            const healAmount = Math.floor(actualDamage * lifestealPercent);
                            if (healAmount > 0) {
                                player.hp = Math.min(player.maxHp, player.hp + healAmount);
                                logMessage += ` 吸血回复${healAmount}点HP！`;
                            }
                        }
                    }
                    
                    // DOT效果触发
                    if (equipmentEffectService && targetEnemy.hp > 0) {
                        const dotEffects = equipmentEffectService.getWeaponDOTEffects();
                        for (const dotEffect of dotEffects) {
                            const triggerChance = dotEffect.chance || 1.0;
                            if (Math.random() < triggerChance) {
                                const effectManager = window.gameCore?.getService('effectManager');
                                if (effectManager) {
                                    effectManager.applyDOT(targetEnemy, {
                                        type: dotEffect.dotType,
                                        damage: dotEffect.damage,
                                        duration: dotEffect.duration
                                    }, 'player_weapon');
                                    logMessage += ` ${targetEnemy.type}中了${this.getDOTName(dotEffect.dotType)}！`;
                                }
                            }
                        }
                    }
                    
                    if (targetEnemy.hp <= 0) {
                        logMessage += ` ${targetEnemy.type}被击败了！`;
                    }
                }
                break;
            
            case '特殊攻击':
                // 使用武器特殊攻击
                const weaponService = window.gameCore?.getService('weaponService');
                if (weaponService && skillId) {
                    const result = weaponService.useBasicAttack(skillId, target);
                    if (!result?.success && result?.message) {
                        logMessage = result.message;
                    } else {
                        logMessage = ''; // WeaponService已写入日志
                    }
                } else {
                    logMessage = '无法使用特殊攻击';
                }
                break;
            
            case '技能':
                // 技能释放交由 SkillService 处理，避免重复日志，这里不追加日志
                try {
                    const skillService = window.gameCore?.getService('skillService');
                    const result = skillService?.useSkill(skillId, target);
                    // 如果技能服务返回了失败信息，作为当前回合消息提示
                    if (!result?.success && result?.message) {
                        logMessage = result.message;
                    } else {
                        logMessage = ''; // 技能服务已写入日志
                    }
                } catch (e) {
                    logMessage = '技能释放失败';
                }
                break;
                
            case '防御':
                player.defending = true;
                logMessage = '你采取了防御姿态，下次受到的伤害将减少50%！';
                break;
                
            case '使用物品':
                if (item) {
                    const itemResult = await this.useItem(item);
                    logMessage = itemResult.message;
                }
                break;
            
            case '完成物品使用':
                // 完成物品使用，准备切换到敌人回合
                logMessage = '';
                break;
                
            case '逃跑':
                // 基于敏捷和重量的逃跑判定
                const playerMobility = (player.agility || 8) - ((player.weight || 10) / 2);
                
                // 计算所有存活敌人的平均机动性
                const aliveEnemiesForEscape = this.battleState.enemies.filter(e => e.hp > 0);
                const avgEnemyMobility = aliveEnemiesForEscape.reduce((sum, e) => {
                    const enemyAgility = e.agility || e.speed || 8;
                    const enemyWeight = e.weight || 10;
                    return sum + (enemyAgility - enemyWeight / 2);
                }, 0) / aliveEnemiesForEscape.length;
                
                // 逃跑成功率计算：基础30% + (玩家机动性 - 敌人平均机动性) * 5%
                const mobilityDiff = playerMobility - avgEnemyMobility;
                const baseEscapeChance = 30;
                const mobilityBonus = mobilityDiff * 5;
                const totalEscapeChance = Math.min(90, Math.max(10, baseEscapeChance + mobilityBonus));
                
                const escapeRoll = Math.random() * 100;
                
                if (escapeRoll < totalEscapeChance) {
                    logMessage = `你成功逃脱了！（逃跑成功率：${Math.floor(totalEscapeChance)}%）`;
                    this.battleState.battleLog.push({
                        type: 'player',
                        message: logMessage,
                        round: this.battleState.round
                    });
                    return await this.endBattle('escape');
                } else {
                    logMessage = `逃跑失败！敌人阻止了你的逃跑！（逃跑成功率：${Math.floor(totalEscapeChance)}%）`;
                }
                break;
        }

        // 技能服务已输出日志时避免重复追加
        if (logMessage) {
            this.battleState.battleLog.push({
                type: 'player',
                message: logMessage,
                round: this.battleState.round
            });
        }

        return { success: true, message: logMessage };
    }

    async executeEnemyTurn() {
        if (!this.battleState.isActive) return;

        const enemies = this.battleState.enemies.filter(e => e.hp > 0);
        const player = this.battleState.player;

        for (const enemy of enemies) {
                if (enemy.hp <= 0) continue;
                
                // 检查敌人是否被控制
                const effectManager = window.gameCore?.getService('effectManager');
                if (effectManager && effectManager.isControlled(enemy)) {
                    this.battleState.battleLog.push({
                        type: 'enemy',
                        message: `${enemy.type}被控制，无法行动！`,
                        round: this.battleState.round
                    });
                    continue;
                }
    
                // 决定使用普通攻击还是技能
                let useSkill = false;
                let selectedSkill = null;
                
                // 如果敌人有aiSkills且概率触发，选择一个技能
                if (enemy.aiSkills && enemy.aiSkills.length > 0 && Math.random() > 0.7) {
                    // 随机选择一个可用技能
                    const availableSkills = enemy.aiSkills.filter(s => {
                        // 可以添加冷却检查等
                        return true;
                    });
                    if (availableSkills.length > 0) {
                        selectedSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                        useSkill = true;
                    }
                }
                
            let damage = 0;
            let logMessage = '';

            // 检查玩家是否闪避
            const dodged = this.checkDodge(enemy, player);
            if (dodged) {
                logMessage = `你敏捷地闪避了${enemy.type}的攻击！`;
            } else if (this.checkBlock(player)) {
                // 检查格挡
                logMessage = `你用盾牌格挡了${enemy.type}的攻击！`;
            } else {
                // 检查敌人是否暴击
                const isCritical = this.checkCriticalHit(enemy);
                
                if (!useSkill) {
                    // 普通攻击
                    damage = this.calculateEnemyDamage(enemy, 'attack');
                    
                    // 应用暴击
                    if (isCritical) {
                        damage = Math.floor(damage * 1.5);
                    }

                    // 最终一次随机浮动（90% - 110%）
                    const variance = Math.random() * 0.2 + 0.9;
                    const variedDamage = Math.floor(damage * variance);
                    
                    // 应用抗性减伤
                    let actualDamage = this.applyResistance(variedDamage, 'physical', player);

                    // 应用装备效果（伤害减免）
                    const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
                    if (equipmentEffectService) {
                        const damageData = {
                            attacker: 'enemy',
                            target: 'player',
                            damage: actualDamage,
                            damageType: 'physical'
                        };
                        const modifiedData = equipmentEffectService.modifyDamage(damageData);
                        actualDamage = modifiedData.modifiedDamage || actualDamage;
                    }

                    if (player.defending) {
                        actualDamage = Math.floor(actualDamage * 0.5);
                        player.defending = false;
                        const critText = isCritical ? '暴击！' : '';
                        const resistInfo = `物抗${Math.floor(player.physicalResistance)}%`;
                        logMessage = `${enemy.type}${critText}对你造成了${actualDamage}点伤害！（${resistInfo}+防御姿态减伤）`;
                    } else {
                        const critText = isCritical ? '暴击！' : '';
                        const resistInfo = `物抗${Math.floor(player.physicalResistance)}%`;
                        logMessage = `${enemy.type}${critText}对你造成了${actualDamage}点伤害！（${resistInfo}减伤）`;
                    }
                    player.hp = Math.max(0, player.hp - actualDamage);
                } else {
                    // 技能攻击
                    damage = this.calculateEnemyDamage(enemy, 'skill', selectedSkill);
                    const skillName = selectedSkill ? selectedSkill.name : this.getRandomSkill(enemy);
                    const skillType = selectedSkill ? selectedSkill.type : 'magic';
                    
                    // 应用暴击
                    if (isCritical) {
                        damage = Math.floor(damage * 1.5);
                    }

                    // 最终一次随机浮动（90% - 110%）
                    const variance = Math.random() * 0.2 + 0.9;
                    const variedDamage = Math.floor(damage * variance);
                    
                    // 应用抗性减伤（使用技能的实际类型）
                    let actualDamage = this.applyResistance(variedDamage, skillType, player);

                    // 应用装备效果（伤害减免）
                    const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
                    if (equipmentEffectService) {
                        const damageData = {
                            attacker: 'enemy',
                            target: 'player',
                            damage: actualDamage,
                            damageType: skillType
                        };
                        const modifiedData = equipmentEffectService.modifyDamage(damageData);
                        actualDamage = modifiedData.modifiedDamage || actualDamage;
                    }

                    if (player.defending) {
                        actualDamage = Math.floor(actualDamage * 0.5);
                        player.defending = false;
                        const critText = isCritical ? '暴击！' : '';
                        const resistType = skillType === 'physical' ? '物抗' : '魔抗';
                        const resistValue = skillType === 'physical'
                            ? Math.floor(player.physicalResistance)
                            : Math.floor(player.magicResistance);
                        logMessage = `${enemy.type}使用【${skillName}】${critText}，对你造成了${actualDamage}点伤害！（${resistType}${resistValue}%+防御姿态减伤）`;
                    } else {
                        const critText = isCritical ? '暴击！' : '';
                        const resistType = skillType === 'physical' ? '物抗' : '魔抗';
                        const resistValue = skillType === 'physical'
                            ? Math.floor(player.physicalResistance)
                            : Math.floor(player.magicResistance);
                        logMessage = `${enemy.type}使用【${skillName}】${critText}，对你造成了${actualDamage}点伤害！（${resistType}${resistValue}%减伤）`;
                    }
                    player.hp = Math.max(0, player.hp - actualDamage);
                }
            }

            this.battleState.battleLog.push({
                type: 'enemy',
                message: logMessage,
                round: this.battleState.round
            });

            // 检查玩家是否死亡
            if (player.hp <= 0) {
                setTimeout(() => {
                    this.endBattle('defeat');
                }, 1000);
                return;
            }
        }

        // 移除自动回复机制 - 战斗中不自动恢复MP/SP
        // 玩家需要通过物品或技能恢复资源

        // 在切换到玩家回合前，递减技能冷却并同步到全局状态
        const skillService = window.gameCore?.getService('skillService');
        if (skillService && typeof skillService.tickCooldowns === 'function') {
            skillService.tickCooldowns(this.battleState);
        }
        
        // 处理特殊效果（DOT、控制等）
        const effectManager = window.gameCore?.getService('effectManager');
        if (effectManager) {
            const effectMessages = effectManager.processTurnEffects(this.battleState);
            effectMessages.forEach(msg => {
                this.battleState.battleLog.push(msg);
            });
        }
        
        // ✅ 检查DOT是否杀死了所有敌人
        if (this.battleState.enemies.every(enemy => enemy.hp <= 0)) {
            setTimeout(() => {
                this.endBattle('victory');
            }, 1000);
            return;
        }
        
        // 装备效果：回合开始的持续效果处理（通过事件与直接调用双保障）
        this.eventBus.emit('battle:turn:start', this.battleState, 'game');
        const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
        if (equipmentEffectService && typeof equipmentEffectService.processTurnEffects === 'function') {
            equipmentEffectService.processTurnEffects(this.battleState);
        }
        
        // 回合结束，切换到玩家
        this.battleState.round++;
        this.battleState.turn = 'player';
        this.eventBus.emit('ui:battle:update', this.battleState, 'game');
    }

    async useItem(itemName) {
        const inventoryService = window.gameCore?.getService('inventoryService');
        if (!inventoryService) {
            return { success: false, message: '背包系统不可用' };
        }

        const item = inventoryService.getItem(itemName);
        if (!item) {
            return { success: false, message: '物品不存在' };
        }

        if (item.quantity <= 0) {
            return { success: false, message: '物品数量不足' };
        }

        let result = { success: false, message: '无法使用该物品' };

        // 消耗品类型处理
        if (item.type === 'consumable' && item.effect) {
            const effect = item.effect;
            
            switch (effect.type) {
                case 'heal':
                    const healAmount = effect.value;
                    const oldHp = this.battleState.player.hp;
                    this.battleState.player.hp = Math.min(
                        this.battleState.player.maxHp,
                        this.battleState.player.hp + healAmount
                    );
                    const actualHeal = this.battleState.player.hp - oldHp;
                    inventoryService.removeItem(itemName, 1);
                    result = {
                        success: true,
                        message: `使用${item.name}恢复了${actualHeal}点生命值！`
                    };
                    break;
                    
                case 'restore_mana':
                    const manaAmount = effect.value;
                    const oldMana = this.battleState.player.mana || 0;
                    this.battleState.player.mana = Math.min(
                        this.battleState.player.maxMana || 0,
                        oldMana + manaAmount
                    );
                    const actualMana = this.battleState.player.mana - oldMana;
                    inventoryService.removeItem(itemName, 1);
                    result = {
                        success: true,
                        message: `使用${item.name}恢复了${actualMana}点法力值！`
                    };
                    break;
                    
                case 'restore_stamina':
                    const staminaAmount = effect.value;
                    const oldStamina = this.battleState.player.stamina || 0;
                    this.battleState.player.stamina = Math.min(
                        this.battleState.player.maxStamina || 0,
                        oldStamina + staminaAmount
                    );
                    const actualStamina = this.battleState.player.stamina - oldStamina;
                    inventoryService.removeItem(itemName, 1);
                    result = {
                        success: true,
                        message: `使用${item.name}恢复了${actualStamina}点耐力值！`
                    };
                    break;
                    
                case 'temp_buff':
                    // 临时增益效果处理
                    if (effect.stats) {
                        // 应用增益效果到玩家
                        Object.entries(effect.stats).forEach(([stat, value]) => {
                            if (this.battleState.player[stat] !== undefined) {
                                this.battleState.player[stat] += value;
                            }
                        });
                        inventoryService.removeItem(itemName, 1);
                        result = {
                            success: true,
                            message: `使用${item.name}获得了临时增益效果！`
                        };
                    }
                    break;
                    
                default:
                    result = { success: false, message: `无法使用该物品效果` };
            }
        }

        return result;
    }

    // 统一的玩家伤害计算 - 使用最终一次随机与新公式
    calculatePlayerDamage(player, type, target = null, skillData = null) {
        // 技能伤害已在 SkillService 中计算，这里只处理普通攻击
        if (skillData) {
            return skillData.damage || 0;
        }
        // 普通攻击公式：总攻击力 × (0.6 + 物理强度 ÷ 100)
        const attackPower = player.attack || 0;
        const physicalPower = player.physicalPower || 0;
        const baseDamage = attackPower * (0.6 + physicalPower / 100);

        let finalDamage = Math.floor(baseDamage);

        // 应用装备效果（不含随机与抗性）
        const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
        if (equipmentEffectService && target) {
            const damageData = {
                attacker: 'player',
                target: 'enemy',
                damage: finalDamage,
                damageType: type === 'attack' ? 'physical' : type,
                targetType: target.type || '',
                isCritical: false
            };
            const modifiedData = equipmentEffectService.modifyDamage(damageData);
            finalDamage = modifiedData.modifiedDamage || finalDamage;
        }
        return finalDamage;
    }

    // 应用抗性减伤（包含破甲计算）
    applyResistance(damage, damageType, defender, attacker = null) {
        let resistance = 0;
        let penetration = 0;
        
        if (damageType === 'physical') {
            resistance = Math.min(75, Math.max(0, defender.physicalResistance || 0));
        } else if (damageType === 'magic') {
            resistance = Math.min(75, Math.max(0, defender.magicResistance || 0));
        }
        
        // 检查攻击者的破甲效果
        if (attacker === 'player') {
            const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
            if (equipmentEffectService) {
                penetration = equipmentEffectService.getPenetration(damageType);
            }
        }
        
        // 应用破甲：实际抗性 = 原抗性 × (1 - 破甲% / 100)
        const effectiveResistance = resistance * (1 - penetration / 100);
        
        // 收到的伤害 * (1 - 实际抗性%)
        const finalDamage = damage * (1 - effectiveResistance / 100);
        
        return Math.max(1, Math.floor(finalDamage)); // 至少1点伤害
    }

    // 检查暴击 - 完善暴击系统，支持技能暴击率加成
    checkCriticalHit(attacker = 'player', critBonus = 0) {
        let criticalChance = 0;
        
        if (attacker === 'player') {
            criticalChance = this.battleState.player.criticalChance || 0;
        } else {
            // 敌人也可以有暴击率
            criticalChance = attacker.criticalChance || 0;
        }
        
        // 应用技能暴击率加成
        criticalChance += critBonus;
        
        return Math.random() * 100 < criticalChance;
    }

    // 检查闪避 - 基于敏捷和重量，可选命中率加成
    checkDodge(attacker, defender, hitBonus = 0) {
        // 计算机动性 = 敏捷 - 重量/2
        const attackerAgility = attacker.agility || attacker.speed || 8;
        const attackerWeight = attacker.weight || 10;
        const attackerMobility = attackerAgility - (attackerWeight / 2);
        
        const defenderAgility = defender.agility || defender.speed || 8;
        const defenderWeight = defender.weight || 10;
        const defenderMobility = defenderAgility - (defenderWeight / 2);
        
        // 闪避率 = 30% + (防守方机动性 - 进攻方机动性) * 2% - 命中率加成
        const mobilityDiff = defenderMobility - attackerMobility;
        let dodgeChance = 30 + mobilityDiff * 2 - hitBonus;
        
        // 检查防守方的闪避加成装备效果
        if (defender === this.battleState.player) {
            const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
            if (equipmentEffectService) {
                const evasionBonus = equipmentEffectService.getEvasionBonus();
                dodgeChance += evasionBonus * 100; // 转换为百分比
            }
        }
        
        // 限制在0-90%范围内
        const finalDodgeChance = Math.min(90, Math.max(0, dodgeChance));
        
        const roll = Math.random() * 100;
        return roll < finalDodgeChance;
    }

    // 检查格挡 - 基于盾牌装备
    checkBlock(defender) {
        if (defender !== this.battleState.player) return false;
        
        const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
        if (!equipmentEffectService) return false;
        
        const blockChance = equipmentEffectService.getBlockChance();
        if (blockChance <= 0) return false;
        
        const roll = Math.random();
        return roll < blockChance;
    }

    // 获取DOT效果的中文名称
    getDOTName(dotType) {
        const names = {
            'burn': '灼烧',
            'poison': '中毒',
            'bleed': '流血'
        };
        return names[dotType] || dotType;
    }

    // 敌人伤害计算（统一公式，不在此处应用随机）
    calculateEnemyDamage(enemy, type, skillData = null) {
        const attackPower = enemy.attack || 0;

        if (type === 'skill' && skillData) {
            // 敌人技能伤害：(技能基础伤害 + 攻击力 × 0.5) × (强度/100 + 0.8)
            const baseDamage = skillData.baseDamage || 0;
            const power = skillData.type === 'physical'
                ? (enemy.physicalPower || 0)
                : (enemy.magicPower || 0);
            const preDamage = (baseDamage + attackPower * 0.5) * (power / 100 + 0.8);
            return Math.floor(preDamage);
        } else {
            // 敌人普通攻击： 攻击力 × (0.6 + 物理强度 ÷ 100)
            const physicalPower = enemy.physicalPower || 0;
            const preDamage = attackPower * (0.6 + physicalPower / 100);
            return Math.floor(preDamage);
        }
    }

    // 获取敌人的随机技能
    getRandomSkill(enemy) {
        if (enemy.skills && enemy.skills.length > 0) {
            const randomIndex = Math.floor(Math.random() * enemy.skills.length);
            return enemy.skills[randomIndex];
        }
        return '技能攻击';
    }

    calculateEnemyHP(enemy) {
        const baseHP = (enemy.level || 1) * 50;
        return Math.floor(baseHP * (Math.random() * 0.4 + 0.8)); // 80%-120%
    }

    async endBattle(outcome) {
        if (!this.currentBattle) return;

        this.battleState.isActive = false;
        let experience = 0;
        let loot = [];
        let hpLoss = 0;

        const gameStateService = window.gameCore?.getService('gameStateService');
        const originalHp = gameStateService.getState().player.hp;
        hpLoss = originalHp - this.battleState.player.hp;

        if (outcome === 'victory') {
            // 计算经验和掉落
            experience = this.battleState.enemies.reduce((total, enemy) => {
                return total + ((enemy.level || 1) * 25);
            }, 0);

            // 生成掉落物品
            loot = this.generateLoot(this.battleState.enemies);
            
        } else if (outcome === 'escape') {
            experience = 0;
            loot = [];
        }

        const battleResult = {
            outcome,
            experience,
            loot,
            hpLoss,
            hpGain: 0,
            description: this.getBattleResultDescription(outcome),
            player: this.battleState.player
        };

        // 通知GameStateService处理战斗结束
        if (gameStateService && gameStateService.handleBattleEnd) {
            gameStateService.handleBattleEnd(battleResult);
        }

        // 隐藏战斗界面
        this.eventBus.emit('ui:battle:hide', {}, 'game');
        
        // 重置战斗状态
        this.currentBattle = null;
        this.battleState = null;

        // 触发战斗后剧情生成（而不是直接显示结果）
        this.eventBus.emit('battle:completed', battleResult, 'game');

        return battleResult;
    }

    generateLoot(enemies) {
        const loot = [];
        
        enemies.forEach(enemy => {
            // 如果敌人有自定义掉落表，使用它
            if (enemy.dropTable && enemy.dropTable.length > 0) {
                enemy.dropTable.forEach(drop => {
                    if (Math.random() < drop.chance) {
                        // 处理数量
                        let quantity = 1;
                        if (drop.quantity) {
                            if (Array.isArray(drop.quantity)) {
                                // 数量是范围 [min, max]
                                const min = drop.quantity[0];
                                const max = drop.quantity[1];
                                quantity = Math.floor(Math.random() * (max - min + 1)) + min;
                            } else {
                                // 数量是固定值
                                quantity = drop.quantity;
                            }
                        }
                        
                        // 将物品添加quantity次到掉落列表
                        for (let i = 0; i < quantity; i++) {
                            loot.push(drop.item);
                        }
                    }
                });
            } else {
                // 使用默认掉落表
                const defaultLootTable = [
                    { name: '小瓶治疗药水', rarity: 0.4 },
                    { name: '铜币', rarity: 0.7, quantity: [1, 3] },
                    { name: '面包', rarity: 0.3 }
                ];
                
                defaultLootTable.forEach(item => {
                    if (Math.random() < item.rarity) {
                        let quantity = 1;
                        if (item.quantity) {
                            if (Array.isArray(item.quantity)) {
                                const min = item.quantity[0];
                                const max = item.quantity[1];
                                quantity = Math.floor(Math.random() * (max - min + 1)) + min;
                            } else {
                                quantity = item.quantity;
                            }
                        }
                        
                        for (let i = 0; i < quantity; i++) {
                            loot.push(item.name);
                        }
                    }
                });
            }
        });

        return loot;
    }

    getBattleResultDescription(outcome) {
        switch (outcome) {
            case 'victory':
                return '你获得了胜利！';
            case 'defeat':
                return '你被击败了...';
            case 'escape':
                return '你成功逃脱了！';
            default:
                return '战斗结束。';
        }
    }

    getBattleState() {
        return this.battleState;
    }

    isInBattle() {
        return this.currentBattle !== null && this.battleState?.isActive;
    }
}

export default BattleService;