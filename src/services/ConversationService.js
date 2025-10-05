// services/ConversationService.js
class ConversationService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.conversationHistory = [];
        this.actionCount = 0; // 玩家行动计数器
        // 注意：summaries 现在存储在 GameState.conversation.summaries 中，不再使用实例变量
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 监听各种游戏事件来记录对话
        this.eventBus.on('game:action', this.recordPlayerAction.bind(this), 'game');
        this.eventBus.on('ui:display:narrative', this.recordNarrative.bind(this), 'game');
        this.eventBus.on('ui:display:function:result', this.recordFunctionResult.bind(this), 'game');
        
        // 🔧 监听存档加载事件，恢复 actionCount
        this.eventBus.on('save:loaded', this.restoreFromSave.bind(this), 'game');
    }
    
    // 🔧 从存档恢复状态
    restoreFromSave(data) {
        try {
            console.log('[ConversationService] 从存档恢复状态');
            
            // 从最后一个总结的 actionRange.end 恢复 actionCount
            const gameStateService = window.gameCore?.getService('gameStateService');
            const summaries = gameStateService?.getState()?.conversation?.summaries || [];
            
            if (summaries.length > 0) {
                // 获取最后一个总结的最大行动ID
                const lastSummary = summaries[summaries.length - 1];
                this.actionCount = lastSummary.actionRange.end || 0;
                console.log('[ConversationService] 从总结恢复 actionCount:', this.actionCount);
            } else {
                // 如果没有总结，从历史记录中查找最大的 actionId
                const history = gameStateService?.getState()?.conversation?.history || [];
                const actionIds = history
                    .filter(item => item.actionId !== undefined)
                    .map(item => item.actionId);
                
                if (actionIds.length > 0) {
                    this.actionCount = Math.max(...actionIds);
                    console.log('[ConversationService] 从历史记录恢复 actionCount:', this.actionCount);
                } else {
                    this.actionCount = 0;
                    console.log('[ConversationService] 未找到行动记录，actionCount 重置为 0');
                }
            }
            
            console.log('[ConversationService] 状态恢复完成，当前 actionCount:', this.actionCount);
        } catch (error) {
            console.warn('[ConversationService] 恢复状态失败:', error);
            this.actionCount = 0;
        }
    }

    // 记录玩家行动
    recordPlayerAction(actionData) {
        console.log('[ConversationService] 记录玩家行动:', actionData.action);
        
        this.conversationHistory.push({
            type: 'player_action',
            content: actionData.action,
            timestamp: Date.now(),
            actionId: ++this.actionCount
        });

        // 每4轮行动进行一次总结
        if (this.actionCount % 4 === 0) {
            this.performSummary();
        }
    }

    // 记录叙述内容
    recordNarrative(narrativeData) {
        // 只记录GM生成的内容，不记录玩家行动显示
        if (narrativeData.type && narrativeData.type.startsWith('gm_')) {
            console.log('[ConversationService] 记录GM叙述:', narrativeData.type);
            
            this.conversationHistory.push({
                type: narrativeData.type,
                content: narrativeData.content,
                timestamp: Date.now()
            });
        }
    }

    // 记录函数执行结果
    recordFunctionResult(functionData) {
        console.log('[ConversationService] 记录函数结果:', functionData.functionName);
        
        this.conversationHistory.push({
            type: 'function_result',
            content: `执行了${functionData.functionName}：${functionData.result.description}`,
            functionName: functionData.functionName,
            result: functionData.result,
            timestamp: Date.now()
        });
    }

    // 执行内容总结
    async performSummary() {
        console.log('[ConversationService] 开始执行内容总结，当前历史条数:', this.conversationHistory.length);
        
        if (this.conversationHistory.length <= 6) {
            console.log('[ConversationService] 历史记录不足6条，跳过总结');
            return;
        }

        // 获取需要总结的内容（除了最近6条）
        const toSummarize = this.conversationHistory.slice(0, -6);
        const recentHistory = this.conversationHistory.slice(-6);

        if (toSummarize.length === 0) {
            return;
        }

        try {
            // 生成总结
            const summary = await this.generateSummary(toSummarize);
            
            // 🔧 将总结保存到 GameState 中
            const gameStateService = window.gameCore?.getService('gameStateService');
            if (!gameStateService) {
                throw new Error('GameStateService 不可用');
            }
            
            const gameState = gameStateService.getState();
            if (!gameState.conversation.summaries) {
                gameState.conversation.summaries = [];
            }
            
            // 将总结添加到 GameState.conversation.summaries 数组
            gameState.conversation.summaries.push({
                summary: summary,
                originalCount: toSummarize.length,
                timeRange: {
                    start: toSummarize[0].timestamp,
                    end: toSummarize[toSummarize.length - 1].timestamp
                },
                actionRange: {
                    start: toSummarize.find(item => item.actionId)?.actionId || 0,
                    end: Math.max(...toSummarize.filter(item => item.actionId).map(item => item.actionId))
                }
            });

            // 更新历史记录，只保留最近6条
            this.conversationHistory = recentHistory;
            
            console.log('[ConversationService] 总结完成，压缩了', toSummarize.length, '条记录');
            console.log('[ConversationService] 当前总结数量:', gameState.conversation.summaries.length);
            
            // 发送总结完成事件
            this.eventBus.emit('conversation:summary:complete', {
                summaryCount: gameState.conversation.summaries.length,
                compressedItems: toSummarize.length
            }, 'game');

        } catch (error) {
            console.error('[ConversationService] 总结生成失败:');
            console.error('[ConversationService] 错误对象:', error);
            console.error('[ConversationService] 错误消息:', error?.message || String(error));
            console.error('[ConversationService] 错误堆栈:', error?.stack);
            
            // 尝试序列化错误对象以获取更多信息
            if (typeof error === 'object' && error !== null) {
                try {
                    console.error('[ConversationService] 错误详情:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
                } catch (e) {
                    console.error('[ConversationService] 无法序列化错误对象');
                }
            }
        }
    }

    // 生成内容总结
    async generateSummary(historyItems) {
        const summaryPrompt = `请为以下RPG游戏对话历史生成一个简洁的总结，保留关键的剧情发展、角色状态变化和重要事件：

${historyItems.map(item => {
    const time = new Date(item.timestamp).toLocaleTimeString();
    return `[${time}] ${item.type}: ${item.content}`;
}).join('\n')}

请生成一个不超过3000字的详细剧情总结，重点关注：
1. 主要剧情发展和故事线索
2. 角色状态变化（等级、HP、经验等）
3. 重要的战斗或事件结果及其影响
4. 关键的环境或位置变化
5. 角色成长历程和重要决策
6. 获得的物品、技能或重要信息
7. 遇到的NPC和对话内容
8. 解决的谜题或完成的任务

总结格式：详细的叙述性文字，保持故事的连贯性和丰富性，确保GM能够基于这些信息继续创作连贯的剧情。`;

        // 调用LLM生成总结
        const llmService = window.gameCore?.getService('llmService');
        if (!llmService) {
            throw new Error('LLM服务不可用');
        }

        const response = await llmService.generateResponse(summaryPrompt, {
            api: {
                inherit: true,
                overrides: {
                    temperature: 0.3, // 较低的温度确保总结的一致性
                    maxTokens: 6000 // 增加到6000 tokens以支持4000字的详细总结
                }
            }
            // 🔧 使用默认的流式输出，避免非流式模式的兼容性问题
        });

        if (!response.success) {
            throw new Error('总结生成失败');
        }

        return response.result;
    }

    // 获取用于LLM的上下文
    getContextForLLM() {
        // 🔧 从 GameState 读取总结
        const gameStateService = window.gameCore?.getService('gameStateService');
        const summaries = gameStateService?.getState()?.conversation?.summaries || [];
        
        const context = {
            summaries: summaries,
            recentHistory: this.conversationHistory,
            actionCount: this.actionCount
        };

        console.log('[ConversationService] 生成LLM上下文:', {
            总结数量: summaries.length,
            最近历史条数: this.conversationHistory.length,
            总行动数: this.actionCount
        });

        return context;
    }

    // 格式化上下文为提示词
    formatContextForPrompt() {
        let contextText = '';

        // 🔧 从 GameState 读取总结
        const gameStateService = window.gameCore?.getService('gameStateService');
        const summaries = gameStateService?.getState()?.conversation?.summaries || [];

        // 添加历史总结
        if (summaries.length > 0) {
            contextText += '## 历史剧情总结：\n';
            summaries.forEach((summary, index) => {
                contextText += `### 第${index + 1}段历史（行动${summary.actionRange.start}-${summary.actionRange.end}）：\n`;
                contextText += `${summary.summary}\n\n`;
            });
        }

        // 添加最近的详细对话
        if (this.conversationHistory.length > 0) {
            contextText += '## 最近的详细对话：\n';
            this.conversationHistory.forEach(item => {
                const time = new Date(item.timestamp).toLocaleTimeString();
                let prefix = '';
                
                switch (item.type) {
                    case 'player_action':
                        prefix = `[${time}] 玩家行动${item.actionId}`;
                        break;
                    case 'gm_narrative':
                        prefix = `[${time}] GM叙述`;
                        break;
                    case 'gm_continuation':
                        prefix = `[${time}] GM后续`;
                        break;
                    case 'function_result':
                        prefix = `[${time}] 系统执行`;
                        break;
                    default:
                        prefix = `[${time}] ${item.type}`;
                }
                
                contextText += `${prefix}: ${item.content}\n`;
            });
        }

        return contextText;
    }

    // 获取统计信息
    getStats() {
        // 🔧 从 GameState 读取总结
        const gameStateService = window.gameCore?.getService('gameStateService');
        const summaries = gameStateService?.getState()?.conversation?.summaries || [];
        
        return {
            totalActions: this.actionCount,
            summariesCount: summaries.length,
            recentHistoryCount: this.conversationHistory.length,
            totalCompressedItems: summaries.reduce((sum, s) => sum + s.originalCount, 0)
        };
    }

    // 清空历史记录（用于重新开始游戏）
    clearHistory() {
        this.conversationHistory = [];
        this.actionCount = 0;
        
        // 🔧 清空 GameState 中的总结
        const gameStateService = window.gameCore?.getService('gameStateService');
        if (gameStateService) {
            const gameState = gameStateService.getState();
            if (gameState.conversation) {
                gameState.conversation.summaries = [];
            }
        }
        
        console.log('[ConversationService] 历史记录已清空');
    }
}

export default ConversationService;