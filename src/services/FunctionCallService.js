// services/FunctionCallService.js
class FunctionCallService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.registeredFunctions = new Map();
        this.setupDefaultFunctions();
    }

    setupDefaultFunctions() {
        this.registerFunction('start_battle', this.handleBattle.bind(this));
        this.registerFunction('start_puzzle', this.handlePuzzle.bind(this));
        this.registerFunction('search_area', this.handleSearch.bind(this));
    }

    registerFunction(name, handler) {
        this.registeredFunctions.set(name, handler);
        console.log(`[FunctionCallService] Registered function: ${name}`);
    }

    parseFunctionCall(text) {
        const functionCallRegex = /<FUNCTION_CALL>\s*({[\s\S]*?})\s*<\/FUNCTION_CALL>/;
        const match = text.match(functionCallRegex);
        
        if (match) {
            try {
                const functionData = JSON.parse(match[1]);
                const beforeCall = text.substring(0, match.index).trim();
                return {
                    hasFunctionCall: true,
                    narrativeBefore: beforeCall,
                    functionCall: functionData
                };
            } catch (error) {
                console.error('Failed to parse function call:', error);
                return { hasFunctionCall: false, narrative: text };
            }
        }
        
        return { hasFunctionCall: false, narrative: text };
    }

    async executeFunction(functionCall) {
        const { name, arguments: args } = functionCall;
        
        if (!this.registeredFunctions.has(name)) {
            throw new Error(`Unknown function: ${name}`);
        }
        
        this.eventBus.emit('function:execute:start', { name, args }, 'game');
        
        try {
            const result = await this.registeredFunctions.get(name)(args);
            this.eventBus.emit('function:execute:complete', { name, args, result }, 'game');
            return result;
        } catch (error) {
            this.eventBus.emit('function:execute:error', { name, args, error }, 'game');
            throw error;
        }
    }

    // 战斗系统 - 启动交互式战斗
    async handleBattle(args) {
        const { enemies, environment, special_conditions } = args;
        
        console.log('[DEBUG] 启动交互式战斗:', { enemies, environment, special_conditions });
        
        // 获取战斗服务
        const battleService = window.gameCore?.getService('battleService');
        if (!battleService) {
            console.error('战斗服务不可用，使用旧版战斗系统');
            return this.handleLegacyBattle(args);
        }

        try {
            // 不立即弹窗，先准备战斗数据，等待玩家点击进入
            await battleService.prepareBattle({
                enemies,
                environment,
                special_conditions
            });

            return {
                outcome: 'battle_ready',
                experience: 0,
                loot: [],
                hpLoss: 0,
                hpGain: 0,
                description: '你遭遇了敌人。点击下方“进入战斗”按钮后开始战斗。'
            };
        } catch (error) {
            console.error('启动战斗失败:', error);
            return this.handleLegacyBattle(args);
        }
    }

    // 旧版战斗系统作为后备
    async handleLegacyBattle(args) {
        const { enemies, environment, special_conditions } = args;
        
        console.log('[DEBUG] 使用旧版战斗系统:', { enemies, environment, special_conditions });
        
        // 模拟战斗逻辑
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const outcome = Math.random() > 0.3 ? 'victory' : 'defeat';
        const experience = outcome === 'victory' ? Math.floor(Math.random() * 100) + 50 : 0;
        const loot = outcome === 'victory' ? ['治疗药水', '铜币'] : [];
        
        const hpLoss = Math.floor(Math.random() * 30) + 10;
        const hpGain = outcome === 'victory' && loot.includes('治疗药水') ? 20 : 0;
        
        console.log('[DEBUG] 旧版战斗结果:', { outcome, experience, hpLoss, hpGain });
        
        const enemyNames = enemies?.map(e => e.type).join('和') || '敌人';
        let battleDescription = '';
        
        if (outcome === 'victory') {
            battleDescription = `你击败了${enemyNames}！`;
        } else {
            battleDescription = `你被${enemyNames}击败了！`;
        }
        
        if (hpLoss > 0) {
            battleDescription += ` 损失了${hpLoss}点生命值。`;
        }
        if (hpGain > 0) {
            battleDescription += ` 使用治疗药水恢复了${hpGain}点生命值。`;
        }
        
        return {
            outcome,
            experience,
            loot,
            hpLoss,
            hpGain,
            description: battleDescription
        };
    }

    // 解谜系统示例
    async handlePuzzle(args) {
        const { puzzle_type, difficulty } = args;
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const success = Math.random() > 0.4;
        const reward = success ? ['古代卷轴', '经验值'] : null;
        
        return {
            success,
            reward,
            description: `你${success ? '成功解开了' : '未能解开'}${puzzle_type}谜题！`
        };
    }

    // 搜索系统 - 支持物品发现
    async handleSearch(args) {
        const { target, difficulty } = args;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const inventoryService = window.gameCore?.getService('inventoryService');
        const searchSuccess = Math.random() > (difficulty === 'hard' ? 0.7 : difficulty === 'medium' ? 0.4 : 0.2);
        
        let findings = [];
        let foundItems = [];
        
        if (searchSuccess) {
            // 可能发现的物品
            const possibleItems = [
                { name: '治疗药水', chance: 0.4 },
                { name: '铜币', chance: 0.6 },
                { name: '面包', chance: 0.3 },
                { name: '魔法卷轴', chance: 0.1 },
                { name: '宝石', chance: 0.05 }
            ];
            
            // 可能发现的其他东西
            const possibleFindings = ['隐藏的宝箱', '秘密通道', '古老的铭文', '神秘的符号'];
            
            // 随机选择发现的物品
            possibleItems.forEach(item => {
                if (Math.random() < item.chance) {
                    foundItems.push(item.name);
                    if (inventoryService) {
                        inventoryService.addItem(item.name, 1);
                    }
                }
            });
            
            // 随机选择其他发现
            if (Math.random() > 0.6) {
                const randomFinding = possibleFindings[Math.floor(Math.random() * possibleFindings.length)];
                findings.push(randomFinding);
            }
            
            // 如果什么都没找到，至少给一个基础发现
            if (foundItems.length === 0 && findings.length === 0) {
                findings.push('一些有趣的痕迹');
            }
        } else {
            findings.push('什么也没找到');
        }
        
        let description = `你仔细搜索了${target}`;
        
        if (foundItems.length > 0) {
            description += `，发现了：${foundItems.join('、')}`;
        }
        
        if (findings.length > 0) {
            if (foundItems.length > 0) {
                description += `，还有：${findings.join('、')}`;
            } else {
                description += `，${findings.join('、')}`;
            }
        }
        
        return {
            findings: [...foundItems, ...findings],
            foundItems,
            description
        };
    }
}

export default FunctionCallService;