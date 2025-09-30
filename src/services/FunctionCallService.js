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

    // 战斗系统示例
    async handleBattle(args) {
        const { enemies, environment, special_conditions } = args;
        
        console.log('[DEBUG] 战斗开始:', { enemies, environment, special_conditions });
        
        // 模拟战斗逻辑
        await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟战斗时间
        
        const outcome = Math.random() > 0.3 ? 'victory' : 'defeat';
        const experience = outcome === 'victory' ? Math.floor(Math.random() * 100) + 50 : 0;
        const loot = outcome === 'victory' ? ['治疗药水', '铜币'] : [];
        
        // 缺少HP损失计算
        const hpLoss = Math.floor(Math.random() * 30) + 10; // 战斗中总是会损失HP
        const hpGain = outcome === 'victory' && loot.includes('治疗药水') ? 20 : 0;
        
        console.log('[DEBUG] 战斗结果:', { outcome, experience, hpLoss, hpGain });
        
        return {
            outcome,
            experience,
            loot,
            hpLoss,
            hpGain,
            description: `你${outcome === 'victory' ? '击败了' : '被击败了'}${enemies?.map(e => e.type).join('和') || '敌人'}！${hpLoss > 0 ? ` 损失了${hpLoss}点生命值。` : ''}${hpGain > 0 ? ` 使用治疗药水恢复了${hpGain}点生命值。` : ''}`
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

    // 搜索系统示例
    async handleSearch(args) {
        const { target, difficulty } = args;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const findings = Math.random() > 0.5 ? ['隐藏的宝箱', '秘密通道'] : ['什么也没找到'];
        
        return {
            findings,
            description: `你搜索了${target}，发现了：${findings.join('、')}`
        };
    }
}

export default FunctionCallService;