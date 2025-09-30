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
            const updates = {};
            
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
                    updates.level = newLevel;
                    // 升级时恢复满血
                    updates.hp = this.gameState.player.maxHp;
                    updates.maxHp = this.gameState.player.maxHp + 20; // 每级增加20最大HP
                    console.log('[DEBUG] 等级提升!', { 原等级: this.gameState.player.level, 新等级: newLevel });
                }
            }
            
            if (Object.keys(updates).length > 0) {
                this.updatePlayerStats(updates);
            }
        }
        
        this.addConversationEntry({
            role: 'system',
            content: `函数执行结果: ${name}`,
            result: result,
            type: 'function_result'
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

## 游戏规则：
1. 根据玩家行动和历史上下文生动描述场景和结果
2. 保持与之前剧情的连贯性和一致性
3. 在适当时机调用游戏功能
4. 考虑玩家的成长历程和之前的经历
5. **绝不输出玩家数据或给出行动建议**

## 函数调用规则：
当需要调用游戏功能时，使用以下格式，并在调用后立即停止输出：

战斗系统：
<FUNCTION_CALL>
{
  "name": "start_battle",
  "arguments": {
    "enemies": [{"type": "哥布林", "level": 2, "count": 1}],
    "environment": "地牢走廊",
    "special_conditions": ["昏暗"]
  }
}
</FUNCTION_CALL>

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
- ✅ 只描述场景、氛围、NPC对话和剧情发展
- ✅ 让系统自动处理所有数值和状态变化

重要：输出函数调用后立即停止，等待系统执行完毕！系统会自动处理数值变化和结果显示！`;
    }
}

export default GameStateService;