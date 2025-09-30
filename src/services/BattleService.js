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
                defense: playerStats.defense,
                // 新增资源与强度、技能同步
                mana: playerStats.mana ?? 0,
                maxMana: playerStats.maxMana ?? 0,
                stamina: playerStats.stamina ?? 0,
                maxStamina: playerStats.maxStamina ?? 0,
                magicPower: playerStats.magicPower ?? 0,
                physicalPower: playerStats.physicalPower ?? 0,
                skills: Array.isArray(playerStats.skills) ? JSON.parse(JSON.stringify(playerStats.skills)) : [],
                // 动作加入“技能”
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
                defense: playerStats.defense,
                // 新增资源与强度、技能同步
                mana: playerStats.mana ?? 0,
                maxMana: playerStats.maxMana ?? 0,
                stamina: playerStats.stamina ?? 0,
                maxStamina: playerStats.maxStamina ?? 0,
                magicPower: playerStats.magicPower ?? 0,
                physicalPower: playerStats.physicalPower ?? 0,
                skills: Array.isArray(playerStats.skills) ? JSON.parse(JSON.stringify(playerStats.skills)) : [],
                // 动作加入“技能”
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
            
            // 检查敌人是否全部死亡
            if (this.battleState.enemies.every(enemy => enemy.hp <= 0)) {
                return await this.endBattle('victory');
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
        const enemies = this.battleState.enemies.filter(e => e.hp > 0);
        
        let logMessage = '';
        let damage = 0;

        switch (action) {
            case '攻击':
                if (target !== undefined && enemies[target]) {
                    damage = this.calculatePlayerDamage(player.level, 'attack', enemies[target]);
                    const actualDamage = Math.max(1, damage - (enemies[target].defense || 0));
                    enemies[target].hp = Math.max(0, enemies[target].hp - actualDamage);
                    logMessage = `你使用攻击力${player.attack}对${enemies[target].type}造成了${actualDamage}点伤害！`;
                    
                    if (enemies[target].hp <= 0) {
                        logMessage += ` ${enemies[target].type}被击败了！`;
                    }
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
                
            case '逃跑':
                const escapeChance = Math.random();
                if (escapeChance > 0.3) {
                    return await this.endBattle('escape');
                } else {
                    logMessage = '逃跑失败！敌人阻止了你的逃跑！';
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

            const action = Math.random() > 0.7 ? '技能攻击' : '攻击';
            let damage = 0;
            let logMessage = '';

            if (action === '攻击') {
                damage = this.calculateEnemyDamage(enemy, 'attack');
                // 使用玩家防御力进行减伤
                const playerDefense = player.defense || 0;
                let actualDamage = Math.max(1, damage - playerDefense);

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
                    logMessage = `${enemy.type}对你造成了${actualDamage}点伤害！（防御${playerDefense}+防御姿态减伤）`;
                } else {
                    logMessage = `${enemy.type}对你造成了${actualDamage}点伤害！（防御${playerDefense}减伤）`;
                }
                player.hp = Math.max(0, player.hp - actualDamage);
            } else {
                damage = this.calculateEnemyDamage(enemy, 'skill');
                const skillName = this.getRandomSkill(enemy);
                // 使用玩家防御力进行减伤
                const playerDefense = player.defense || 0;
                let actualDamage = Math.max(1, damage - playerDefense);

                // 应用装备效果（伤害减免）
                const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
                if (equipmentEffectService) {
                    const damageData = {
                        attacker: 'enemy',
                        target: 'player',
                        damage: actualDamage,
                        damageType: 'magic'
                    };
                    const modifiedData = equipmentEffectService.modifyDamage(damageData);
                    actualDamage = modifiedData.modifiedDamage || actualDamage;
                }

                if (player.defending) {
                    actualDamage = Math.floor(actualDamage * 0.5);
                    player.defending = false;
                    logMessage = `${enemy.type}使用${skillName}，对你造成了${actualDamage}点伤害！（防御${playerDefense}+防御姿态减伤）`;
                } else {
                    logMessage = `${enemy.type}使用${skillName}，对你造成了${actualDamage}点伤害！（防御${playerDefense}减伤）`;
                }
                player.hp = Math.max(0, player.hp - actualDamage);
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

        // 回合结束自然回复少量法力与耐力
        const p = this.battleState.player;
        p.mana = Math.min(p.maxMana || 0, (p.mana || 0) + 2);
        p.stamina = Math.min(p.maxStamina || 0, (p.stamina || 0) + 2);
        
        // 同步到全局玩家状态（用于顶部栏展示与提示）
        const gameStateService = window.gameCore?.getService('gameStateService');
        if (gameStateService) {
            gameStateService.updatePlayerStats({
                mana: p.mana,
                stamina: p.stamina
            });
        }

        // 在切换到玩家回合前，递减技能冷却并同步到全局状态
        const skillService = window.gameCore?.getService('skillService');
        if (skillService && typeof skillService.tickCooldowns === 'function') {
            skillService.tickCooldowns(this.battleState);
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

        switch (item.type) {
            case 'healing':
                const healAmount = item.effect.value;
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
        }

        return result;
    }

    // 玩家伤害计算 - 使用实际攻击力
    calculatePlayerDamage(level, type, target = null) {
        const playerAttack = this.battleState.player.attack || (level * 10);
        const variance = Math.random() * 0.4 + 0.8; // 80%-120%
        const multiplier = type === 'skill' ? 1.5 : 1;
        let baseDamage = Math.floor(playerAttack * variance * multiplier);
        
        // 应用装备效果
        const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
        if (equipmentEffectService && target) {
            const damageData = {
                attacker: 'player',
                target: 'enemy',
                damage: baseDamage,
                damageType: type,
                targetType: target.type || '',
                isCritical: this.checkCriticalHit()
            };
            
            const modifiedData = equipmentEffectService.modifyDamage(damageData);
            baseDamage = modifiedData.modifiedDamage || baseDamage;
            
            // 如果是暴击，应用暴击伤害
            if (modifiedData.isCritical) {
                baseDamage = Math.floor(baseDamage * 1.5);
                this.battleState.battleLog.push({
                    type: 'system',
                    message: '暴击！',
                    round: this.battleState.round
                });
            }
        }
        
        return baseDamage;
    }

    // 检查暴击
    checkCriticalHit() {
        const criticalChance = this.battleState.player.criticalChance || 0;
        return Math.random() * 100 < criticalChance;
    }

    // 敌人伤害计算
    calculateEnemyDamage(enemy, type) {
        const baseDamage = enemy.damage || enemy.baseDamage || (enemy.level || 1) * 8;
        const variance = Math.random() * 0.3 + 0.85; // 85%-115%
        const multiplier = type === 'skill' ? 1.3 : 1;
        return Math.floor(baseDamage * variance * multiplier);
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
                        loot.push(drop.item);
                    }
                });
            } else {
                // 使用默认掉落表
                const defaultLootTable = [
                    { name: '治疗药水', rarity: 0.4 },
                    { name: '铜币', rarity: 0.7 },
                    { name: '面包', rarity: 0.3 }
                ];
                
                defaultLootTable.forEach(item => {
                    if (Math.random() < item.rarity) {
                        loot.push(item.name);
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