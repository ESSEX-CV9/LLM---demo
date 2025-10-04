// controllers/GameController.js
class GameController {
    constructor(serviceLocator, eventBus) {
        this.serviceLocator = serviceLocator;
        this.eventBus = eventBus;
        this.isProcessing = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('ui:player:action', this.handlePlayerAction.bind(this), 'game');
        this.eventBus.on('function:execute:complete', this.handleFunctionComplete.bind(this), 'game');
        // 监听战斗完成事件，用最终结果驱动后续剧情生成
        this.eventBus.on('battle:completed', this.handleBattleCompleted.bind(this), 'game');
    }

    async handlePlayerAction(actionData) {
        if (this.isProcessing) {
            console.warn('[DEBUG] 已在处理行动中，忽略新行动');
            this.eventBus.emit('ui:display:error', {
                message: '请等待当前行动处理完成'
            }, 'game');
            return;
        }

        console.log('[DEBUG] 开始处理玩家行动:', actionData.action);
        this.isProcessing = true;
        
        try {
            const gameStateService = this.serviceLocator.get('gameStateService');
            const llmService = this.serviceLocator.get('llmService');
            const functionCallService = this.serviceLocator.get('functionCallService');

            // 1. 更新游戏状态
            this.eventBus.emit('game:action', actionData, 'game');

            // 2. 生成基础提示词
            const systemPrompt = gameStateService.generateGamePrompt();

            // 3. 调用LLM
            const response = await llmService.generateResponse(systemPrompt, {
                userInput: actionData.action
            });

            if (!response.success) {
                throw new Error('LLM request failed');
            }

            // 4. 解析响应，检查是否有函数调用
            const parseResult = functionCallService.parseFunctionCall(response.result);

            if (parseResult.hasFunctionCall) {
                // 显示叙述部分
                if (parseResult.narrativeBefore) {
                    this.eventBus.emit('ui:display:narrative', {
                        content: parseResult.narrativeBefore,
                        type: 'gm_narrative'
                    }, 'game');
                }

                // 执行函数调用
                const functionResult = await functionCallService.executeFunction(parseResult.functionCall);

                // 显示函数执行结果
                this.eventBus.emit('ui:display:function:result', {
                    functionName: parseResult.functionCall.name,
                    result: functionResult
                }, 'game');

                // 继续生成后续叙述（交互式战斗开始或战斗准备态时，不在此处生成，等待战斗完成事件）
                if (!(parseResult.functionCall.name === 'start_battle' && functionResult && (functionResult.outcome === 'battle_started' || functionResult.outcome === 'battle_ready'))) {
                    await this.generateContinuation(functionResult, parseResult.functionCall.name);
                }
            } else {
                // 直接显示叙述
                this.eventBus.emit('ui:display:narrative', {
                    content: parseResult.narrative,
                    type: 'gm_narrative'
                }, 'game');
            }

        } catch (error) {
            console.error('[DEBUG] 处理玩家行动时发生错误:', error);
            this.eventBus.emit('ui:display:error', {
                message: '处理行动时发生错误，请重试。'
            }, 'game');
        } finally {
            console.log('[DEBUG] 玩家行动处理完成，重置处理状态');
            this.isProcessing = false;
            // 注意：不在这里启用输入，因为可能还有后续的LLM生成或函数执行
        }
    }

    async generateContinuation(functionResult, functionName) {
        try {
            const gameStateService = this.serviceLocator.get('gameStateService');
            const llmService = this.serviceLocator.get('llmService');

            const continuationPrompt = `
## 函数执行结果：
函数：${functionName}
结果：${JSON.stringify(functionResult, null, 2)}

请根据上述结果继续描述后续情节，不要再调用任何函数。

## 📝 必须遵循的输出格式：
你的回复必须包含两个部分，使用第二人称描述：

**第一部分 - 剧情描述**：
- 描述刚才函数执行的结果带来的剧情发展
- 包括战斗结果、发现物品、事件影响等
- 展现因果关系和戏剧性
- 例如战斗后："激战过后，你喘着粗气站在敌人的尸体旁。鲜血染红了地面，你的武器还在滴血。这是，一个黑袍人影从阴影中走出，她轻笑了一声，"真是莽撞啊，年轻的冒险者。"

**第二部分 - 环境描述**：
- 纯粹描述当前的环境状态、氛围
- 不涉及具体行动，只聚焦感官细节
- 包括视觉、听觉、嗅觉等感受
- 例如战斗后环境："你环视四周，你的面前有一个石门，沉重石门看起来没法从这边打开。你的左边有一个窄小的通道，里面没有刚光亮，不知道到底通向何方"

记住：不要提及任何数值变化（HP、经验值、等级等），系统会自动处理和显示这些。`;

            const response = await llmService.generateResponse(
                gameStateService.generateGamePrompt(), 
                {
                    userInput: continuationPrompt
                }
            );

            if (response.success) {
                this.eventBus.emit('ui:display:narrative', {
                    content: response.result,
                    type: 'gm_continuation'
                }, 'game');
            }

        } catch (error) {
            console.error('Error generating continuation:', error);
            this.eventBus.emit('ui:display:narrative', {
                content: '你的行动产生了一些影响，但具体细节模糊不清...',
                type: 'gm_fallback'
            }, 'game');
        }
    }

    handleBattleCompleted(battleResult) {
        // 战斗完成后，用最终战斗结果驱动后续剧情生成
        this.generateContinuation(battleResult, 'start_battle');
    }

    handleFunctionComplete(data) {
        // 函数执行完成的后续处理
        console.log('Function execution completed:', data);
    }
}

export default GameController;