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
        
        // 根据函数结果更新游戏状态
        if (name === 'start_battle' && result.outcome === 'victory') {
            this.updatePlayerStats({
                experience: this.gameState.player.experience + result.experience
            });
        }
        
        this.addConversationEntry({
            role: 'system',
            content: `函数执行结果: ${name}`,
            result: result,
            type: 'function_result'
        });
    }

    generateGamePrompt() {
        const state = this.gameState.getContextualState();
        
        return `你是一个专业的游戏主持人(GM)，正在运行一个地牢探险RPG游戏。

## 当前游戏状态：
- 玩家：${state.player.name} (等级${state.player.level})
- 生命值：${state.player.hp}/${state.player.maxHp}
- 位置：${state.world.currentLocation}
- 时间：${state.world.timeOfDay}

## 游戏规则：
1. 根据玩家行动生动描述场景和结果
2. 在适当时机调用游戏功能
3. 保持故事的连贯性和挑战性

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

重要：输出函数调用后立即停止，等待系统执行完毕！`;
    }
}

export default GameStateService;