# LLM驱动游戏的最小实现指南

## 核心工作流程

### 1. 主要AI工作流
```
用户输入 → LLM分析 → 生成叙述+函数调用 → 执行游戏功能 → LLM生成后续叙述
```

**具体步骤：**
1. **用户行动** - 玩家输入行动指令
2. **LLM生成** - 基于游戏状态生成回应
3. **函数解析** - 检测是否需要调用游戏功能
4. **功能执行** - 执行战斗/解谜等系统
5. **后续生成** - 基于执行结果继续叙述

### 2. 多次API调用模式
```javascript
// 第一次调用：分析+生成+可能的函数调用
response1 = await llm_api.generate(prompt + userInput)

// 如果有函数调用
if (hasFunctionCall) {
    result = await executeFunction(functionCall)
    
    // 第二次调用：基于结果继续生成
    response2 = await llm_api.generate(continuationPrompt + result)
}
```

## 函数调用格式

### 1. 标准调用格式
```xml
<FUNCTION_CALL>
{
  "name": "function_name",
  "arguments": {
    "param1": "value1",
    "param2": "value2"
  }
}
</FUNCTION_CALL>
```

### 2. 具体函数示例

**战斗系统：**
```xml
<FUNCTION_CALL>
{
  "name": "start_battle",
  "arguments": {
    "enemies": [{"type": "goblin", "level": 2, "count": 1}],
    "environment": "dungeon_corridor",
    "special_conditions": ["darkness"]
  }
}
</FUNCTION_CALL>
```

**解谜系统：**
```xml
<FUNCTION_CALL>
{
  "name": "start_puzzle",
  "arguments": {
    "puzzle_type": "ancient_mechanism",
    "difficulty": "medium"
  }
}
</FUNCTION_CALL>
```

**环境交互：**
```xml
<FUNCTION_CALL>
{
  "name": "search_area",
  "arguments": {
    "target": "old_chest",
    "difficulty": "easy"
  }
}
</FUNCTION_CALL>
```

## 核心提示词设计

### 1. 系统提示词结构
```
[角色定义] + [游戏状态] + [规则说明] + [函数调用指南] + [停止指令]
```

### 2. 最小实现模板
```
你是专业的游戏主持人，运行RPG游戏。

## 当前状态：
- 玩家：{player_name} (等级{level})
- 位置：{location}
- HP：{hp}/{max_hp}

## 核心规则：
1. 根据玩家行动生动描述结果
2. 适时调用游戏功能
3. 保持故事连贯性

## 函数调用：
需要特殊功能时使用此格式，调用后立即停止输出：

<FUNCTION_CALL>
{"name": "function_name", "arguments": {...}}
</FUNCTION_CALL>

重要：输出函数调用后立即停止！
```

### 3. 小白X插件调用格式
```javascript
const options = {
  components: {
    list: [
      'ALL_PREON',  // 继承预设配置
      {
        role: 'system',
        content: systemPrompt,
        position: 'BEFORE_PROMPT'
      }
    ]
  },
  userInput: playerAction,
  api: {
    inherit: true,
    overrides: {
      temperature: 0.8,
      maxTokens: 1000
    }
  },
  streaming: { enabled: true },
  debug: { enabled: true }
};

const response = await window.callGenerate(options);
```

## 核心架构要点

### 1. 事件驱动架构
```javascript
// 松耦合通信
eventBus.emit('ui:player:action', { action });
eventBus.on('function:execute:complete', handleResult);
```

### 2. 服务定位模式
```javascript
// 依赖注入
const llmService = serviceLocator.get('llmService');
const gameState = serviceLocator.get('gameStateService');
```

### 3. 函数注册系统
```javascript
// 可扩展的功能注册
functionCallService.registerFunction('start_battle', handleBattle);
functionCallService.registerFunction('start_puzzle', handlePuzzle);
```

## 关键实现细节

### 1. 函数调用解析
```javascript
parseFunctionCall(text) {
    const regex = /<FUNCTION_CALL>\s*({[\s\S]*?})\s*<\/FUNCTION_CALL>/;
    const match = text.match(regex);
    
    if (match) {
        return {
            hasFunctionCall: true,
            narrativeBefore: text.substring(0, match.index).trim(),
            functionCall: JSON.parse(match[1])
        };
    }
    
    return { hasFunctionCall: false, narrative: text };
}
```

### 2. 游戏状态管理
```javascript
generateGamePrompt() {
    const state = this.gameState.getContextualState();
    return `
## 当前游戏状态：
- 玩家：${state.player.name} (等级${state.player.level})
- 生命值：${state.player.hp}/${state.player.maxHp}
- 位置：${state.world.currentLocation}

[函数调用规则...]
    `;
}
```

### 3. 错误处理与备案
```javascript
// 三层防护
try {
    // 1. LLM调用
    const response = await llmService.generate(prompt);
    
    // 2. 函数执行
    if (hasFunctionCall) {
        const result = await executeFunction(functionCall);
    }
} catch (error) {
    // 3. 备案叙述
    return "出现了意外情况，但冒险继续...";
}
```

## 快速启动清单

### 1. 必需组件
- ✅ EventBus（事件总线）
- ✅ ServiceLocator（服务定位）
- ✅ LLMService（AI调用）
- ✅ FunctionCallService（函数调用）
- ✅ GameController（游戏控制）

### 2. 核心文件
- ✅ `index.js` - 入口点
- ✅ `GameCore.js` - 核心协调器
- ✅ `GameState.js` - 状态管理
- ✅ 各种Service类 - 业务逻辑

### 3. 关键配置
```javascript
// 小白X插件环境检查
if (typeof window.callGenerate !== 'function') {
    throw new Error('需要小白X插件环境');
}

// ES6模块导出
export default ClassName;

// 依赖导入
import Dependency from './path/to/Dependency.js';
```

## 扩展指南

### 1. 添加新功能
```javascript
// 1. 注册新函数
functionCallService.registerFunction('new_feature', handleNewFeature);

// 2. 更新提示词
// 在函数调用指南中添加新功能说明

// 3. 实现处理函数
async function handleNewFeature(args) {
    // 功能逻辑
    return { success: true, description: "..." };
}
```

### 2. 优化提示词
- **明确停止指令**：确保函数调用后停止输出
- **提供具体示例**：让AI理解正确的调用格式
- **状态上下文**：包含必要的游戏状态信息
- **错误处理**：提供备案叙述方案

### 3. 性能优化
- **流式输出**：实时显示生成过程
- **状态缓存**：避免重复生成相同提示词
- **错误重试**：网络失败时的重试机制
- **用户体验**：加载动画和进度提示

这个最小实现提供了构建LLM驱动游戏的核心框架，可以根据具体需求进行扩展和定制。