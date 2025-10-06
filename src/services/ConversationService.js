// services/ConversationService.js
class ConversationService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.conversationHistory = [];
        // 🔧 actionCount 现在存储在 GameState.conversation.actionCount 中，不再使用实例变量
        // 注意：summaries 现在存储在 GameState.conversation.summaries 中，不再使用实例变量
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 监听各种游戏事件来记录对话
        this.eventBus.on('game:action', this.recordPlayerAction.bind(this), 'game');
        this.eventBus.on('ui:display:narrative', this.recordNarrative.bind(this), 'game');
        this.eventBus.on('ui:display:function:result', this.recordFunctionResult.bind(this), 'game');
    }

    // 🔧 获取当前行动计数
    getActionCount() {
        const gameStateService = window.gameCore?.getService('gameStateService');
        return gameStateService?.getState()?.conversation?.actionCount || 0;
    }

    // 🔧 增加行动计数
    incrementActionCount() {
        const gameStateService = window.gameCore?.getService('gameStateService');
        const gameState = gameStateService?.getState();
        if (gameState?.conversation) {
            gameState.conversation.actionCount = (gameState.conversation.actionCount || 0) + 1;
            return gameState.conversation.actionCount;
        }
        return 0;
    }

    // 记录玩家行动
    recordPlayerAction(actionData) {
        console.log('[ConversationService] 记录玩家行动:', actionData.action);
        
        const actionId = this.incrementActionCount();
        
        this.conversationHistory.push({
            type: 'player_action',
            content: actionData.action,
            timestamp: Date.now(),
            actionId: actionId
        });

        // 每12轮行动进行一次总结
        if (actionId % 12 === 0) {
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
            
            // 🔧 检查是否需要压缩最老的总结到远历史总结
            if (gameState.conversation.summaries.length >= 6) {
                console.log('[ConversationService] 总结数量达到6个，开始压缩最老的总结');
                await this.compressOldestSummary();
            }
            
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

    // 🔧 压缩最老的总结到远历史总结
    async compressOldestSummary() {
        try {
            const gameStateService = window.gameCore?.getService('gameStateService');
            if (!gameStateService) {
                throw new Error('GameStateService 不可用');
            }
            
            const gameState = gameStateService.getState();
            const summaries = gameState.conversation.summaries;
            
            if (summaries.length < 6) {
                console.log('[ConversationService] 总结数量不足6个，跳过压缩');
                return;
            }
            
            // 获取最老的总结
            const oldestSummary = summaries[0];
            const existingDistantSummary = gameState.conversation.distantSummary;
            
            console.log('[ConversationService] 压缩最老的总结 (行动', oldestSummary.actionRange.start, '-', oldestSummary.actionRange.end, ')');
            
            // 生成新的远历史总结
            const newDistantSummary = await this.generateDistantSummary(existingDistantSummary, oldestSummary);
            
            // 更新远历史总结
            gameState.conversation.distantSummary = {
                summary: newDistantSummary,
                compressedCount: (existingDistantSummary?.compressedCount || 0) + 1,
                timeRange: {
                    start: existingDistantSummary?.timeRange?.start || oldestSummary.timeRange.start,
                    end: oldestSummary.timeRange.end
                },
                actionRange: {
                    start: existingDistantSummary?.actionRange?.start || oldestSummary.actionRange.start,
                    end: oldestSummary.actionRange.end
                },
                lastUpdated: Date.now()
            };
            
            // 删除最老的总结
            summaries.shift();
            
            console.log('[ConversationService] 远历史总结更新完成，已压缩', gameState.conversation.distantSummary.compressedCount, '个总结');
            console.log('[ConversationService] 当前总结数量:', summaries.length);
            
            // 发送压缩完成事件
            this.eventBus.emit('conversation:distant-summary:updated', {
                compressedCount: gameState.conversation.distantSummary.compressedCount,
                remainingSummaries: summaries.length
            }, 'game');
            
        } catch (error) {
            console.error('[ConversationService] 远历史总结压缩失败:', error);
            throw error;
        }
    }

    // 🔧 生成远历史总结（合并旧的远历史总结和最老的总结）
    async generateDistantSummary(existingDistantSummary, oldestSummary) {
        let distantSummaryPrompt;
        
        if (existingDistantSummary) {
            // 如果已有远历史总结，将其与最老的总结合并
            distantSummaryPrompt = `请将以下两部分RPG游戏剧情总结合并为一个连贯的远历史总结：

## 现有的远历史总结（行动${existingDistantSummary.actionRange.start}-${existingDistantSummary.actionRange.end}）：
${existingDistantSummary.summary}

## 需要合并的最新总结（行动${oldestSummary.actionRange.start}-${oldestSummary.actionRange.end}）：
${oldestSummary.summary}

请生成一个不超过3000字的综合远历史总结，要求：
1. 保持故事的连贯性和时间顺序
2. 突出重要的剧情转折点和关键事件
3. 保留角色的重要成长和变化
4. 精简细节，聚焦主线剧情
5. 确保GM能够基于这个总结理解整个故事背景`;
        } else {
            // 如果没有远历史总结，直接将最老的总结转为远历史格式
            distantSummaryPrompt = `请将以下RPG游戏剧情总结精炼为一个远历史总结：

## 总结内容（行动${oldestSummary.actionRange.start}-${oldestSummary.actionRange.end}）：
${oldestSummary.summary}

请生成一个不超过2500字的远历史总结，要求：
1. 保持故事的核心情节
2. 突出重要的剧情转折点和关键事件
3. 保留角色的重要成长和变化
4. 精简不必要的细节
5. 确保GM能够基于这个总结理解故事背景`;
        }
        
        // 调用 LLM 生成远历史总结
        const response = await window.callGenerate({
            components: {
                list: ['ALL_PREON']
            },
            userInput: distantSummaryPrompt,
            api: {
                inherit: true,
                overrides: {
                    temperature: 0.3,
                    maxTokens: 6000
                }
            },
            session: {
                id: 'xb2'  // 🔧 总结使用后台会话槽位，与玩家对话并行
            },
            streaming: {
                enabled: true
            },
            debug: { enabled: true }
        });

        if (!response.success) {
            throw new Error('远历史总结生成失败');
        }

        return response.result;
    }

    // 生成内容总结
    async generateSummary(historyItems) {
        // 构建历史记录文本
        const historyText = historyItems.map(item => {
            const time = new Date(item.timestamp).toLocaleTimeString();
            return `[${time}] ${item.type}: ${item.content}`;
        }).join('\n');

        const summaryPrompt = `请为以下RPG游戏对话历史生成一个简洁的总结，保留关键的剧情发展、角色状态变化和重要事件：

${historyText}

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

        // 🔧 直接调用 callGenerate，使用 userInput 参数
        // 根据小白X文档，userInput 是标准参数，应该包含在每个请求中
        const response = await window.callGenerate({
            components: {
                list: ['ALL_PREON'] // 使用预设中启用的组件作为基座
            },
            userInput: summaryPrompt, // 将总结提示作为用户输入
            api: {
                inherit: true,
                overrides: {
                    temperature: 0.3, // 较低的温度确保总结的一致性
                    maxTokens: 6000 // 增加到6000 tokens以支持4000字的详细总结
                }
            },
            session: {
                id: 'xb2'  // 🔧 总结使用后台会话槽位，与玩家对话并行
            },
            streaming: {
                enabled: true
            },
            debug: { enabled: true }
        });

        if (!response.success) {
            throw new Error('总结生成失败');
        }

        return response.result;
    }

    // 获取用于LLM的上下文
    getContextForLLM() {
        // 🔧 从 GameState 读取总结和行动计数
        const gameStateService = window.gameCore?.getService('gameStateService');
        const summaries = gameStateService?.getState()?.conversation?.summaries || [];
        const actionCount = this.getActionCount();
        
        const context = {
            summaries: summaries,
            recentHistory: this.conversationHistory,
            actionCount: actionCount
        };

        console.log('[ConversationService] 生成LLM上下文:', {
            总结数量: summaries.length,
            最近历史条数: this.conversationHistory.length,
            总行动数: actionCount
        });

        return context;
    }

    // 格式化上下文为提示词
    formatContextForPrompt() {
        let contextText = '';

        // 🔧 从 GameState 读取总结和远历史总结
        const gameStateService = window.gameCore?.getService('gameStateService');
        const summaries = gameStateService?.getState()?.conversation?.summaries || [];
        const distantSummary = gameStateService?.getState()?.conversation?.distantSummary;

        // 添加远历史总结
        if (distantSummary) {
            contextText += '## 远历史剧情总结（压缩了' + distantSummary.compressedCount + '个早期总结）：\n';
            contextText += `### 行动${distantSummary.actionRange.start}-${distantSummary.actionRange.end}的剧情概述：\n`;
            contextText += `${distantSummary.summary}\n\n`;
        }

        // 添加历史总结
        if (summaries.length > 0) {
            contextText += '## 近期历史剧情总结：\n';
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
        // 🔧 从 GameState 读取总结和行动计数
        const gameStateService = window.gameCore?.getService('gameStateService');
        const summaries = gameStateService?.getState()?.conversation?.summaries || [];
        const distantSummary = gameStateService?.getState()?.conversation?.distantSummary;
        const actionCount = this.getActionCount();
        
        return {
            totalActions: actionCount,
            summariesCount: summaries.length,
            recentHistoryCount: this.conversationHistory.length,
            totalCompressedItems: summaries.reduce((sum, s) => sum + s.originalCount, 0),
            distantSummaryCount: distantSummary ? distantSummary.compressedCount : 0,
            hasDistantSummary: !!distantSummary
        };
    }

    // 清空历史记录（用于重新开始游戏）
    clearHistory() {
        this.conversationHistory = [];
        
        // 🔧 清空 GameState 中的总结、远历史总结和行动计数
        const gameStateService = window.gameCore?.getService('gameStateService');
        if (gameStateService) {
            const gameState = gameStateService.getState();
            if (gameState.conversation) {
                gameState.conversation.summaries = [];
                gameState.conversation.distantSummary = null;
                gameState.conversation.actionCount = 0;
            }
        }
        
        console.log('[ConversationService] 历史记录已清空');
    }
}

export default ConversationService;