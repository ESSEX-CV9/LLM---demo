// services/FunctionCallService.js
import EnemyTemplates from '../data/EnemyTemplates.js';
import ItemsDB from '../data/Items.js';

class FunctionCallService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.registeredFunctions = new Map();
        this.enemyTemplates = new EnemyTemplates();
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
        // 🆕 改进正则表达式，支持多种格式和更强的容错性
        const patterns = [
            /<FUNCTION_CALL>\s*({[\s\S]*?})\s*<\/FUNCTION_CALL>/i,
            /<function_call>\s*({[\s\S]*?})\s*<\/function_call>/i,
            /```json\s*({[\s\S]*?})\s*```/i,
            /```\s*({[\s\S]*?})\s*```/i,
            /{[\s\S]*"name"\s*:\s*"start_battle"[\s\S]*}/i
        ];
        
        let match = null;
        let matchedPattern = null;
        
        for (const pattern of patterns) {
            match = text.match(pattern);
            if (match) {
                matchedPattern = pattern;
                break;
            }
        }
        
        if (!match) {
            return { hasFunctionCall: false, narrative: text };
        }
        
        const beforeCall = text.substring(0, match.index).trim();
        let rawJson = match[1];

        // 🆕 预处理JSON，修复常见的LLM生成问题
        const preprocessJSON = (jsonStr) => {
            // 移除多余的反斜杠和转义
            jsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\'/g, "'");
            
            // 修复单引号问题
            jsonStr = jsonStr.replace(/'/g, '"');
            
            // 修复尾随逗号
            jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
            
            // 修复属性名未加引号的问题
            jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
            
            // 移除注释
            jsonStr = jsonStr.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
            
            return jsonStr.trim();
        };

        // 🆕 改进的JSON字符串清理函数
        const sanitizeJSONString = (s) => {
            let result = '';
            let inString = false;
            let escaping = false;
            let braceDepth = 0;
            
            for (let i = 0; i < s.length; i++) {
                const ch = s[i];
                
                if (!inString) {
                    if (ch === '"' && !escaping) {
                        inString = true;
                        result += ch;
                    } else if (ch === '{') {
                        braceDepth++;
                        result += ch;
                    } else if (ch === '}') {
                        braceDepth--;
                        result += ch;
                        if (braceDepth === 0) break; // 结束主对象
                    } else if (ch === '\n' || ch === '\r') {
                        result += ' '; // 将换行替换为空格
                    } else {
                        result += ch;
                    }
                } else {
                    if (escaping) {
                        // 处理转义字符
                        if (ch === 'n') result += '\n';
                        else if (ch === 't') result += '\t';
                        else if (ch === 'r') result += '\r';
                        else if (ch === 'b') result += '\b';
                        else if (ch === 'f') result += '\f';
                        else result += ch;
                        escaping = false;
                    } else if (ch === '\\') {
                        result += ch;
                        escaping = true;
                    } else if (ch === '"') {
                        inString = false;
                        result += ch;
                    } else if (ch === '\n' || ch === '\r') {
                        result += '\\n'; // 字符串内的换行需要转义
                    } else {
                        result += ch;
                    }
                }
            }
            
            return result;
        };

        // 🆕 增强的参数规范化函数
        const normalizeArgs = (args) => {
            if (!args || typeof args !== 'object') return args;

            // 深度克隆以避免修改原对象
            const normalized = JSON.parse(JSON.stringify(args));

            // 清洗 special_conditions
            if (Array.isArray(normalized.special_conditions)) {
                normalized.special_conditions = normalized.special_conditions
                    .filter(item => typeof item === 'string')
                    .map(item => {
                        // 移除HTML标签和嵌套的FUNCTION_CALL
                        item = item.replace(/<[^>]*>/g, '').replace(/[\r\n]+/g, ' ').trim();
                        return item;
                    })
                    .filter(item => item.length > 0 && item.length <= 100);
            }

            // 强化 enemies 数组
            if (Array.isArray(normalized.enemies)) {
                normalized.enemies = normalized.enemies
                    .filter(e => e && typeof e === 'object')
                    .map(e => {
                        const enemy = { ...e };
                        
                        // 确保level为有效整数
                        if (typeof enemy.level !== 'number' || isNaN(enemy.level)) {
                            const parsed = parseInt(String(enemy.level), 10);
                            enemy.level = isNaN(parsed) ? 1 : Math.max(1, Math.min(100, parsed));
                        }
                        
                        // 确保category为有效字符串
                        const validCategories = ['minion', 'elite', 'elite_advanced', 'advanced_elite', 'boss'];
                        if (!validCategories.includes(enemy.category)) {
                            enemy.category = 'minion';
                        }
                        
                        // 映射advanced_elite到elite_advanced
                        if (enemy.category === 'advanced_elite') {
                            enemy.category = 'elite_advanced';
                        }
                        
                        // 确保count为有效整数
                        if (typeof enemy.count !== 'number' || isNaN(enemy.count)) {
                            enemy.count = 1;
                        }
                        enemy.count = Math.max(1, Math.min(enemy.category === 'boss' ? 1 : 5, enemy.count));
                        
                        // 清理species字段
                        if (enemy.species && typeof enemy.species !== 'string') {
                            delete enemy.species;
                        }
                        
                        // 清理type字段（如果有的话）
                        if (enemy.type && typeof enemy.type === 'string') {
                            enemy.type = enemy.type.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '');
                        }
                        
                        return enemy;
                    })
                    .filter(e => e.level && e.category); // 过滤掉无效的敌人
            }

            // 清理environment字段
            if (typeof normalized.environment === 'string') {
                normalized.environment = normalized.environment.replace(/<[^>]*>/g, '').trim();
                if (normalized.environment.length > 100) {
                    normalized.environment = normalized.environment.substring(0, 100) + '...';
                }
            }

            return normalized;
        };

        // 🆕 多层级解析尝试
        const parseAttempts = [
            () => {
                // 第一次尝试：直接解析
                const data = JSON.parse(rawJson);
                return data;
            },
            () => {
                // 第二次尝试：预处理后解析
                const preprocessed = preprocessJSON(rawJson);
                const data = JSON.parse(preprocessed);
                return data;
            },
            () => {
                // 第三次尝试：清理后解析
                const sanitized = sanitizeJSONString(rawJson);
                const data = JSON.parse(sanitized);
                return data;
            },
            () => {
                // 第四次尝试：预处理+清理
                const preprocessed = preprocessJSON(rawJson);
                const sanitized = sanitizeJSONString(preprocessed);
                const data = JSON.parse(sanitized);
                return data;
            },
            () => {
                // 第五次尝试：提取核心部分
                const coreMatch = rawJson.match(/"name"\s*:\s*"([^"]+)"[\s\S]*"arguments"\s*:\s*({[^}]+})/);
                if (coreMatch) {
                    const name = coreMatch[1];
                    const args = JSON.parse(coreMatch[2]);
                    return { name, arguments: args };
                }
                throw new Error('无法提取核心部分');
            }
        ];

        let functionData = null;
        let lastError = null;

        for (let i = 0; i < parseAttempts.length; i++) {
            try {
                functionData = parseAttempts[i]();
                console.log(`[FunctionCallService] 解析成功，使用方法${i + 1}`);
                break;
            } catch (error) {
                lastError = error;
                console.warn(`[FunctionCallService] 解析尝试${i + 1}失败:`, error.message);
            }
        }

        if (!functionData) {
            console.error('[FunctionCallService] 所有解析尝试均失败:', lastError);
            console.log('[FunctionCallService] 原始JSON:', rawJson);
            return { hasFunctionCall: false, narrative: text };
        }

        // 规范化参数
        if (functionData.arguments) {
            functionData.arguments = normalizeArgs(functionData.arguments);
        }

        return {
            hasFunctionCall: true,
            narrativeBefore: beforeCall,
            functionCall: functionData
        };
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

    // 战斗系统 - 支持模版快速生成和传统自定义模式
    async handleBattle(args) {
        console.log('[DEBUG] 启动交互式战斗:', args);
        
        // 获取战斗服务
        const battleService = window.gameCore?.getService('battleService');
        if (!battleService) {
            console.error('战斗服务不可用，使用旧版战斗系统');
            return this.handleLegacyBattle(args);
        }

        try {
            let processedEnemies;
            
            // 检查使用哪种模式
            const encounterType = args.encounter_type || 'custom';
            
            if (encounterType === 'template') {
                // 模版模式：基于等级和类型生成敌人
                processedEnemies = this.generateEnemiesFromTemplate(args.enemies);
                console.log('[DEBUG] 使用模版系统生成敌人:', processedEnemies);
            } else if (encounterType === 'auto') {
                // 智能匹配模式：根据玩家等级自动生成
                processedEnemies = this.generateEnemiesAuto(args);
                console.log('[DEBUG] 使用智能匹配生成敌人:', processedEnemies);
            } else {
                // 自定义模式：使用原有的敌人数据（向后兼容）
                processedEnemies = args.enemies || [];
                console.log('[DEBUG] 使用自定义敌人数据:', processedEnemies);
            }

            // 准备战斗数据
            await battleService.prepareBattle({
                enemies: processedEnemies,
                environment: args.environment || '未知区域',
                special_conditions: args.special_conditions || []
            });

            return {
                outcome: 'battle_ready',
                experience: 0,
                loot: [],
                hpLoss: 0,
                hpGain: 0,
                description: '你遭遇了敌人。点击下方"进入战斗"按钮后开始战斗。'
            };
        } catch (error) {
            console.error('启动战斗失败:', error);
            return this.handleLegacyBattle(args);
        }
    }

    // 基于模版生成敌人
    generateEnemiesFromTemplate(enemyConfigs) {
        const enemies = [];
        
        for (const config of enemyConfigs) {
            const { level, category = 'minion', species, count = 1 } = config;
            
            if (!level || level < 1 || level > 100) {
                console.warn(`[FunctionCallService] 无效的敌人等级: ${level}，使用默认等级1`);
                config.level = 1;
            }
            
            // BOSS只能有1个
            const actualCount = category === 'boss' ? 1 : Math.min(count, 5);
            
            for (let i = 0; i < actualCount; i++) {
                try {
                    const enemy = this.enemyTemplates.generateEnemy(level, category, species);
                    if (enemy) {
                        enemies.push(enemy);
                        const speciesText = species ? `${species}(${enemy.name})` : enemy.name;
                        console.log(`[FunctionCallService] 生成敌人: ${speciesText} (${level}级${category})`);
                    }
                } catch (error) {
                    console.error(`[FunctionCallService] 生成敌人失败:`, error);
                    // 使用备用敌人数据
                    const fallbackName = species ? `${species}(${level}级)` : `${level}级${category}`;
                    enemies.push({
                        name: fallbackName,
                        type: `${level}级${category}`,
                        level: level,
                        hp: 50 + level * 20,
                        maxHp: 50 + level * 20,
                        stats: { baseAttack: 10 + level * 2 }
                    });
                }
            }
        }
        
        return enemies;
    }

    // 智能匹配生成敌人
    generateEnemiesAuto(args) {
        const gameStateService = window.gameCore?.getService('gameStateService');
        const playerLevel = gameStateService?.getState()?.player?.level || 1;
        
        const { 
            difficulty = 'normal', 
            enemy_count = 2, 
            include_elite = false, 
            include_boss = false 
        } = args;
        
        // 根据难度调整敌人等级
        const difficultyModifiers = {
            'easy': -2,
            'normal': 0,
            'hard': 2,
            'deadly': 5
        };
        
        const baseLevel = Math.max(1, Math.min(100, playerLevel + difficultyModifiers[difficulty]));
        const enemies = [];
        
        if (include_boss) {
            // BOSS战
            const boss = this.enemyTemplates.generateEnemy(baseLevel + 2, 'boss');
            enemies.push(boss);
        } else {
            // 普通遭遇
            const totalCount = Math.min(enemy_count, 5);
            let eliteCount = 0;
            let minionCount = totalCount;
            
            if (include_elite && totalCount > 1) {
                eliteCount = 1;
                minionCount = totalCount - 1;
            }
            
            // 生成精英怪
            for (let i = 0; i < eliteCount; i++) {
                const elite = this.enemyTemplates.generateEnemy(baseLevel, 'elite');
                enemies.push(elite);
            }
            
            // 生成小怪
            for (let i = 0; i < minionCount; i++) {
                const minion = this.enemyTemplates.generateEnemy(baseLevel - 1, 'minion');
                enemies.push(minion);
            }
        }
        
        console.log(`[FunctionCallService] 智能生成敌人: 玩家${playerLevel}级, 难度${difficulty}, 生成${enemies.length}个敌人`);
        return enemies;
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
        
        const enemyNames = enemies?.map(e => e.type || e.name).join('和') || '敌人';
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

    // 解谜系统
    async handlePuzzle(args) {
        const { puzzle_type, difficulty = 'medium' } = args;
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 根据难度调整成功率
        const successChances = {
            'easy': 0.8,
            'medium': 0.6,
            'hard': 0.4,
            'very_hard': 0.2
        };
        const successChance = successChances[difficulty] || 0.6;
        const success = Math.random() < successChance;
        
        let rewards = [];
        let experience = 0;
        
        if (success) {
            // 根据难度给予经验奖励
            const expRewards = {
                'easy': 30,
                'medium': 60,
                'hard': 120,
                'very_hard': 200
            };
            experience = expRewards[difficulty] || 60;
            
            // 根据难度决定物品奖励
            const inventoryService = window.gameCore?.getService('inventoryService');
            const gameStateService = window.gameCore?.getService('gameStateService');
            const playerLevel = gameStateService?.getState()?.player?.level || 1;
            
            // 根据难度随机获得物品
            const itemChance = {
                'easy': 0.5,
                'medium': 0.7,
                'hard': 0.85,
                'very_hard': 0.95
            }[difficulty] || 0.7;
            
            if (Math.random() < itemChance) {
                // 获取适合玩家等级的物品
                const possibleItems = this.getRandomLootItems(playerLevel, difficulty);
                
                possibleItems.forEach(itemData => {
                    rewards.push(itemData.name);
                    if (inventoryService) {
                        inventoryService.addItem(itemData.name, itemData.quantity || 1);
                    }
                });
            }
        }
        
        let description = `你${success ? '成功解开了' : '未能解开'}${puzzle_type}谜题！`;
        
        if (success) {
            if (experience > 0) {
                description += ` 获得了${experience}点经验值`;
            }
            if (rewards.length > 0) {
                description += `，并发现了：${rewards.join('、')}`;
            }
        }
        
        return {
            success,
            experience,
            rewards,
            description
        };
    }

    // 搜索系统 - 从物品数据库中随机获取物品
    async handleSearch(args) {
        const { target, difficulty = 'easy' } = args;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const inventoryService = window.gameCore?.getService('inventoryService');
        const gameStateService = window.gameCore?.getService('gameStateService');
        const playerLevel = gameStateService?.getState()?.player?.level || 1;
        
        // 根据难度调整成功率
        const successChances = {
            'easy': 0.8,
            'medium': 0.6,
            'hard': 0.3
        };
        const searchSuccess = Math.random() < (successChances[difficulty] || 0.8);
        
        let findings = [];
        let foundItems = [];
        let experience = 0;
        
        if (searchSuccess) {
            // 搜索成功，给予少量经验
            experience = difficulty === 'hard' ? 20 : difficulty === 'medium' ? 10 : 5;
            
            // 从物品数据库中获取可能的物品
            const lootItems = this.getRandomLootItems(playerLevel, difficulty);
            
            // 添加找到的物品
            lootItems.forEach(itemData => {
                const quantity = itemData.quantity || 1;
                foundItems.push(itemData.name);
                if (inventoryService) {
                    inventoryService.addItem(itemData.name, quantity);
                }
            });
            
            // 可能发现的其他线索（非物品）
            const possibleFindings = [
                '隐藏的暗门',
                '古老的铭文',
                '神秘的符号',
                '奇怪的脚印',
                '新鲜的痕迹'
            ];
            
            // 30%概率发现额外线索
            if (Math.random() < 0.3) {
                const randomFinding = possibleFindings[Math.floor(Math.random() * possibleFindings.length)];
                findings.push(randomFinding);
            }
            
            // 如果什么物品都没找到，至少给一个基础发现
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
                description += `。还注意到：${findings.join('、')}`;
            } else {
                description += `，${findings.join('、')}`;
            }
        }
        
        if (experience > 0) {
            description += `。（获得${experience}点经验值）`;
        }
        
        return {
            findings: [...foundItems, ...findings],
            foundItems,
            experience,
            description
        };
    }

    // 辅助方法：根据玩家等级和难度获取随机战利品
    getRandomLootItems(playerLevel, difficulty = 'easy') {
        const lootItems = [];
        
        // 货币类物品 - 基础战利品
        const currencies = ['铜币', '银币', '金币'];
        const currencyChances = difficulty === 'hard' ? [0.5, 0.3, 0.1] :
                               difficulty === 'medium' ? [0.7, 0.2, 0.05] :
                               [0.8, 0.1, 0.01];
        
        currencies.forEach((currency, index) => {
            if (Math.random() < currencyChances[index]) {
                const quantity = currency === '铜币' ? Math.floor(Math.random() * 50) + 10 :
                                currency === '银币' ? Math.floor(Math.random() * 10) + 1 :
                                Math.floor(Math.random() * 3) + 1;
                lootItems.push({ name: currency, quantity });
            }
        });
        
        // 消耗品类物品 - 使用稀有度权重系统
        const consumables = ItemsDB.getConsumables();
        if (consumables && consumables.length > 0) {
            // 根据难度决定获得消耗品的概率
            const consumableChance = difficulty === 'hard' ? 0.6 :
                                    difficulty === 'medium' ? 0.5 :
                                    0.4;
            
            if (Math.random() < consumableChance) {
                // 过滤出适合玩家等级的消耗品，并排除测试物品
                const suitableConsumables = consumables.filter(item => {
                    // 排除测试物品
                    if (item.name && item.name.startsWith('[测试]')) return false;
                    
                    // 根据稀有度和玩家等级筛选
                    if (item.rarity === 'common') return true;
                    if (item.rarity === 'uncommon' && playerLevel >= 3) return true;
                    if (item.rarity === 'rare' && playerLevel >= 6) return true;
                    if (item.rarity === 'epic' && playerLevel >= 10) return true;
                    if (item.rarity === 'legendary' && playerLevel >= 15) return true;
                    return false;
                });
                
                if (suitableConsumables.length > 0) {
                    // 使用稀有度权重选择消耗品
                    const selectedItem = this.selectItemByRarity(suitableConsumables);
                    if (selectedItem) {
                        const quantity = selectedItem.subType === 'healing' || selectedItem.subType === 'mana' ?
                                       Math.floor(Math.random() * 3) + 1 : 1;
                        lootItems.push({ name: selectedItem.name, quantity });
                    }
                }
            }
        }
        
        // 材料类物品
        const materials = ['铁矿石', '皮革', '魔法水晶'];
        const materialChances = difficulty === 'hard' ? [0.4, 0.3, 0.2] :
                               difficulty === 'medium' ? [0.3, 0.2, 0.1] :
                               [0.2, 0.15, 0.05];
        
        materials.forEach((material, index) => {
            if (Math.random() < materialChances[index]) {
                const quantity = Math.floor(Math.random() * 5) + 1;
                lootItems.push({ name: material, quantity });
            }
        });
        
        // 高难度可能获得装备 - 使用稀有度权重系统
        if (difficulty === 'hard' && Math.random() < 0.15) {
            // 获取适合玩家等级的装备
            const equipment = ItemsDB.getItemsByLevelRange(
                Math.max(1, playerLevel - 2),
                playerLevel + 2
            );
            
            if (equipment && equipment.length > 0) {
                // 过滤出武器、防具、饰品，并排除测试装备
                const validEquipment = equipment.filter(item => {
                    // 排除测试装备
                    if (item.name && item.name.startsWith('[测试]')) return false;
                    
                    // 只保留武器、防具、饰品
                    return item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
                });
                
                if (validEquipment.length > 0) {
                    // 使用稀有度权重选择装备
                    const selectedEquip = this.selectItemByRarity(validEquipment);
                    if (selectedEquip) {
                        lootItems.push({ name: selectedEquip.name, quantity: 1 });
                    }
                }
            }
        }
        
        return lootItems;
    }

    // 辅助方法：根据稀有度权重选择物品
    selectItemByRarity(items) {
        if (!items || items.length === 0) return null;
        
        // 稀有度权重配置
        // common: 75%, uncommon: 17%, rare: 5%, epic/legendary: 3%
        const rarityWeights = {
            'common': 75,
            'uncommon': 17,
            'rare': 5,
            'epic': 3,
            'legendary': 3
        };
        
        // 按稀有度分组
        const itemsByRarity = {
            'common': [],
            'uncommon': [],
            'rare': [],
            'epic': [],
            'legendary': []
        };
        
        items.forEach(item => {
            const rarity = item.rarity || 'common';
            if (itemsByRarity[rarity]) {
                itemsByRarity[rarity].push(item);
            }
        });
        
        // 计算总权重（只计算有物品的稀有度）
        let totalWeight = 0;
        const availableRarities = [];
        
        for (const rarity in itemsByRarity) {
            if (itemsByRarity[rarity].length > 0) {
                availableRarities.push(rarity);
                totalWeight += rarityWeights[rarity];
            }
        }
        
        if (availableRarities.length === 0) return null;
        
        // 随机选择稀有度
        let randomValue = Math.random() * totalWeight;
        let selectedRarity = 'common';
        
        for (const rarity of availableRarities) {
            randomValue -= rarityWeights[rarity];
            if (randomValue <= 0) {
                selectedRarity = rarity;
                break;
            }
        }
        
        // 从选中的稀有度中随机选择一个物品
        const selectedRarityItems = itemsByRarity[selectedRarity];
        if (selectedRarityItems.length > 0) {
            return selectedRarityItems[Math.floor(Math.random() * selectedRarityItems.length)];
        }
        
        // 如果出现异常，返回第一个物品
        return items[0];
    }
}

export default FunctionCallService;