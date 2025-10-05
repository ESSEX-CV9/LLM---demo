// services/GameStateService.js
import GameState from '../models/GameState.js';

class GameStateService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.gameState = new GameState();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('game:action', this.handleGameAction.bind(this), 'game');
        this.eventBus.on('function:execute:complete', this.handleFunctionResult.bind(this), 'game');
    }

    getState() {
        return this.gameState;
    }

    updatePlayerStats(updates) {
        this.gameState.updatePlayer(updates);
        this.eventBus.emit('state:player:updated', this.gameState.player, 'game');
    }

    updateWorldState(updates) {
        this.gameState.updateWorld(updates);
        this.eventBus.emit('state:world:updated', this.gameState.world, 'game');
    }

    addConversationEntry(entry) {
        this.gameState.addToHistory(entry);
        this.eventBus.emit('state:conversation:updated', entry, 'game');
    }

    handleGameAction(actionData) {
        this.addConversationEntry({
            role: 'user',
            content: actionData.action,
            type: 'player_action'
        });
    }

    handleFunctionResult(data) {
        const { name, result } = data;
        
        console.log('[DEBUG] 处理函数结果:', { name, result });
        
        // 根据函数结果更新游戏状态
        if (name === 'start_battle') {
            this.handleBattleResult(result);
        } else if (name === 'search_area') {
            this.handleSearchResult(result);
        }
        
        // 对于交互式战斗（准备或开始），避免写入重复的函数结果到历史。
        // 这些条目由 UI 层（GameView.displayFunctionResult）写入，并包含 battleId，用于按钮恢复。
        if (name === 'start_battle' && (result?.outcome === 'battle_ready' || result?.outcome === 'battle_started')) {
            return;
        }
        
        this.addConversationEntry({
            role: 'system',
            content: `函数执行结果: ${name}`,
            result: result,
            type: 'function_result'
        });
    }

    handleBattleResult(result) {
        const updates = {};
        
        // 处理战斗结果 - 如果是交互式战斗开始或准备态，不处理数值变化
        if (result.outcome === 'battle_started' || result.outcome === 'battle_ready') {
            console.log('[DEBUG] 交互式战斗已开始/准备，延后状态更新');
            return;
        }
        
        // 无论胜负都要处理HP变化
        if (result.hpLoss > 0) {
            const newHp = Math.max(0, this.gameState.player.hp - result.hpLoss);
            updates.hp = newHp;
            console.log('[DEBUG] HP损失:', { 原HP: this.gameState.player.hp, 损失: result.hpLoss, 新HP: newHp });
        }
        
        if (result.hpGain > 0) {
            const newHp = Math.min(this.gameState.player.maxHp, this.gameState.player.hp + result.hpGain);
            updates.hp = newHp;
            console.log('[DEBUG] HP恢复:', { 原HP: this.gameState.player.hp, 恢复: result.hpGain, 新HP: newHp });
        }
        
        // 无论胜负都可能获得经验值
        if (result.experience > 0) {
            const newExp = this.gameState.player.experience + result.experience;
            updates.experience = newExp;
            console.log('[DEBUG] 经验值获得:', { 原经验: this.gameState.player.experience, 获得: result.experience, 新经验: newExp });
            
            // 检查是否升级
            const newLevel = this.calculateLevel(newExp);
            if (newLevel > this.gameState.player.level) {
                const levelDiff = newLevel - this.gameState.player.level;
                updates.level = newLevel;

                // 生命上限提升与满血
                updates.maxHp = this.gameState.player.maxHp + levelDiff * 20; // 每级增加20最大HP
                updates.hp = updates.maxHp;

                // 技能点奖励
                updates.skillPoints = (this.gameState.player.skillPoints || 0) + levelDiff;

                // 法力与耐力上限成长与全满
                updates.maxMana = (this.gameState.player.maxMana || 0) + levelDiff * 10;
                updates.maxStamina = (this.gameState.player.maxStamina || 0) + levelDiff * 10;
                updates.mana = updates.maxMana;
                updates.stamina = updates.maxStamina;

                console.log('[DEBUG] 等级提升!', { 原等级: this.gameState.player.level, 新等级: newLevel, 技能点增加: levelDiff, 资源上限成长: { mana: levelDiff * 10, stamina: levelDiff * 10 } });
            }
        }
        
        // 处理掉落物品
        if (result.loot && result.loot.length > 0) {
            const inventoryService = window.gameCore?.getService('inventoryService');
            if (inventoryService) {
                result.loot.forEach(itemName => {
                    inventoryService.addItem(itemName, 1);
                });
            }
        }
        
        if (Object.keys(updates).length > 0) {
            this.updatePlayerStats(updates);
        }
    }

    handleSearchResult(result) {
        // 搜索结果中的物品已经在FunctionCallService中处理了
        // 这里可以处理其他搜索相关的状态更新
        if (result.foundItems && result.foundItems.length > 0) {
            console.log('[DEBUG] 搜索发现物品:', result.foundItems);
        }
    }

    // 处理战斗结束后的状态更新
    handleBattleEnd(battleResult) {
        console.log('[DEBUG] 战斗结束，更新游戏状态:', battleResult);
        
        const updates = {};
        
        // 同步玩家资源与HP
        if (battleResult.player) {
            if (battleResult.player.hp !== undefined) updates.hp = battleResult.player.hp;
            if (battleResult.player.mana !== undefined) updates.mana = battleResult.player.mana;
            if (battleResult.player.stamina !== undefined) updates.stamina = battleResult.player.stamina;
            if (battleResult.player.maxMana !== undefined) updates.maxMana = battleResult.player.maxMana;
            if (battleResult.player.maxStamina !== undefined) updates.maxStamina = battleResult.player.maxStamina;
        }
        
        // 处理经验值和掉落
        if (battleResult.experience > 0) {
            const newExp = this.gameState.player.experience + battleResult.experience;
            updates.experience = newExp;
            
            // 检查升级
            const newLevel = this.calculateLevel(newExp);
            if (newLevel > this.gameState.player.level) {
                const levelDiff = newLevel - this.gameState.player.level;
                updates.level = newLevel;

                // HP 上限与满血
                updates.maxHp = this.gameState.player.maxHp + levelDiff * 20;
                updates.hp = updates.maxHp;

                // 技能点奖励
                updates.skillPoints = (this.gameState.player.skillPoints || 0) + levelDiff;

                // MP/SP 上限成长与全满
                updates.maxMana = (this.gameState.player.maxMana || 0) + levelDiff * 10;
                updates.maxStamina = (this.gameState.player.maxStamina || 0) + levelDiff * 10;
                updates.mana = updates.maxMana;
                updates.stamina = updates.maxStamina;
            }
        }
        
        // 处理掉落物品
        if (battleResult.loot && battleResult.loot.length > 0) {
            const inventoryService = window.gameCore?.getService('inventoryService');
            if (inventoryService) {
                battleResult.loot.forEach(itemName => {
                    inventoryService.addItem(itemName, 1);
                });
            }
        }
        
        if (Object.keys(updates).length > 0) {
            this.updatePlayerStats(updates);
        }
        
        // 更新战斗状态
        this.gameState.updateBattleState({
            isInBattle: false,
            currentBattle: null
        });
    }

    // 等级计算函数
    calculateLevel(experience) {
        // 简单的等级计算：每100经验值升1级
        return Math.floor(experience / 100) + 1;
    }

    generateGamePrompt() {
        const state = this.gameState.getContextualState();
        
        // 获取对话上下文
        const conversationService = window.gameCore?.getService('conversationService');
        let contextSection = '';
        
        if (conversationService) {
            const conversationContext = conversationService.formatContextForPrompt();
            if (conversationContext.trim()) {
                contextSection = `\n## 游戏历史上下文：\n${conversationContext}\n`;
            }
        }
        
        return `你是一个专业的游戏主持人(GM)，正在运行一个地牢探险RPG游戏。
${contextSection}
## 当前游戏状态：
- 玩家：${state.player.name} (等级${state.player.level})
- 生命值：${state.player.hp}/${state.player.maxHp}
- 经验值：${state.player.experience}
- 位置：${state.world.currentLocation}
- 时间：${state.world.timeOfDay}

## 🎭 重要的叙述规则：
1. **专注剧情叙述**：你只负责描述场景、环境、NPC对话和剧情发展
2. **禁止输出玩家建议**：不要告诉玩家应该做什么或给出行动建议
3. **禁止显示数据变化**：不要在叙述中提及HP、经验值、等级等数值变化
4. **系统自动处理**：所有数值变化由游戏系统自动计算和显示
5. **使用功能调用**：需要战斗、解谜、搜索时使用相应的函数调用
6. **保持沉浸感**：专注于营造氛围和推进故事情节

## 📝 输出格式要求（重要）：
每次响应必须包含以下两个部分，使用第二人称描述：

**第一部分 - 剧情描述**：
- 描述玩家的行动结果、遭遇的事件、NPC的反应等
- 推进故事情节，展现因果关系
- 包含对话、情绪、冲突等戏剧性元素
- 例如："你推开沉重的石门，门轴发出刺耳的摩擦声。突然，一个身披黑袍的人影从阴影中走出，冷笑着说：'终于等到你了，冒险者。'"

**第二部分 - 环境描述**：
- 纯粹描述当前所处的环境、氛围、景物
- 不涉及行动和事件，只聚焦于感官细节
- 包括视觉、听觉、嗅觉、触觉等感受
- 例如："周围是潮湿阴冷的石室，墙壁上布满青苔和裂纹。微弱的火把光在墙上投下摇曳的影子，空气中弥漫着霉味和某种难以名状的腐朽气息。远处传来滴水声，回荡在寂静的空间里。"

**示例输出**：
你小心翼翼地拾起地上的古老卷轴，展开后发现上面记载着一段神秘的咒语。就在此时，你听到身后传来脚步声，一名老者缓缓走来，用沙哑的声音说："年轻人，这可不是你该碰的东西。"

这是一间古老的图书馆，高耸的书架直达天花板，布满灰尘的书籍散发着岁月的气息。窗外的月光透过彩色玻璃窗洒进来，在地板上形成斑驳的光影。整个空间笼罩在一种神秘而庄重的氛围中，只有偶尔穿过房间的风的声音打破寂静。

## 游戏规则：
1. 根据玩家行动和历史上下文生动描述场景和结果
2. 保持与之前剧情的连贯性和一致性
3. 在适当时机调用游戏功能
4. 考虑玩家的成长历程和之前的经历
5. **绝不输出玩家数据或给出行动建议**

## 函数调用规则：
当需要调用游戏功能时，必须先用2-3句叙述当前情境与玩家状态（衔接前文剧情），然后使用以下格式调用，并在调用后立即停止输出：

战斗系统（推荐使用敌人等级系统）：
<FUNCTION_CALL>
{
  "name": "start_battle",
  "arguments": {
    "enemies": [{"type": "小史莱姆", "level": 1}],
    "environment": "地牢走廊",
    "special_conditions": ["昏暗"]
  }
}
</FUNCTION_CALL>

调用函数前的叙述要求：
- 简要描述当前环境、遭遇与动机，至少2-3句
- 与既往剧情连贯，不重复数值或直接显示系统变动
- 叙述后再输出函数调用块

战斗后剧情生成规则：
- 交互式战斗开始后不要继续生成剧情
- 仅在战斗完成后，系统将把最终战斗结果传回AI，再生成后续剧情

## 敌人等级指南：
- 1级敌人：小史莱姆、幼年哥布林（新手友好，容易获胜）
- 2级敌人：野狼、哥布林战士（稍有挑战）
- 3级敌人：骷髅兵、森林巨熊（中等难度）
- 4级敌人：哥布林萨满、石像鬼（较高难度）
- 5级敌人：暗影刺客、火焰元素（高难度）
- 6级敌人：兽人酋长、冰霜巨人（精英级别）
- 7级敌人：黑暗骑士、古龙幼崽（Boss级别）
- 8级敌人：巫妖王、泰坦守护者（传说级别）

根据玩家等级选择合适的敌人：
- 玩家1级：推荐1级敌人
- 玩家2级：推荐1-2级敌人
- 玩家3级：推荐2-3级敌人
- 以此类推...

解谜系统：
<FUNCTION_CALL>
{
  "name": "start_puzzle",
  "arguments": {
    "puzzle_type": "古代机关",
    "difficulty": "medium"
  }
}
</FUNCTION_CALL>

搜索系统：
<FUNCTION_CALL>
{
  "name": "search_area",
  "arguments": {
    "target": "古老的宝箱",
    "difficulty": "easy"
  }
}
</FUNCTION_CALL>

## ⚠️ 严格禁止的行为：
- ❌ 不要说"你获得了XX经验值"
- ❌ 不要说"你的HP减少了XX"
- ❌ 不要说"你升级了"
- ❌ 不要给出行动建议如"你可以选择..."
- ❌ 不要显示任何数值变化
- ❌ 禁止仅输出函数调用块而无任何叙述
- ✅ 只描述场景、氛围、NPC对话和剧情发展
- ✅ 让系统自动处理所有数值和状态变化

重要：先叙述再函数调用，并在调用后立即停止输出，等待系统执行完毕！系统会自动处理数值变化和结果显示！`;
    }
}

export default GameStateService;