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

                // 继续生成后续叙述
                await this.generateContinuation(functionResult, parseResult.functionCall.name);
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

请根据上述结果继续描述后续情节，不要再调用任何函数。描述要生动具体，并说明对玩家状态的影响。`;

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

    handleFunctionComplete(data) {
        // 函数执行完成的后续处理
        console.log('Function execution completed:', data);
    }
}

export default GameController;