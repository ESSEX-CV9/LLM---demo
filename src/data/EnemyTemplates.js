// data/EnemyTemplates.js - 敌人模板系统（完整1-100级，基于现有机制）
class EnemyTemplates {
    constructor() {
        // 先初始化类型系数，后生成模板，避免未定义访问
        this.typeMultipliers = this.initializeTypeMultipliers();
        this.templates = this.initializeTemplates();
    }

    initializeTypeMultipliers() {
        return {
            "minion": {
                hp: 1.0, attack: 0.9, physicalPower: 0.9, magicPower: 0.9,
                physicalResistance: 2, magicResistance: 2, agility: 1.0, weight: 0.9, criticalChance: 5
            },
            "elite": {
                hp: 1.6, attack: 1.3, physicalPower: 1.3, magicPower: 1.3,
                physicalResistance: 10, magicResistance: 8, agility: 1.2, weight: 1.1, criticalChance: 12
            },
            "elite_advanced": {
                hp: 2.2, attack: 1.6, physicalPower: 1.6, magicPower: 1.6,
                physicalResistance: 20, magicResistance: 15, agility: 1.3, weight: 1.2, criticalChance: 18
            },
            "boss": {
                hp: 3.0, attack: 1.9, physicalPower: 1.9, magicPower: 1.9,
                physicalResistance: 30, magicResistance: 25, agility: 1.2, weight: 1.5, criticalChance: 25
            }
        };
    }

    initializeTemplates() {
        // 防御性检查：确保类型系数已就绪
        if (!this.typeMultipliers) {
            this.typeMultipliers = this.initializeTypeMultipliers();
        }
        const templates = {};
        
        // 生成1-100级，每5级一档的敌人模版
        for (let level = 1; level <= 100; level += 5) {
            const levelGroup = Math.min(level + 4, 100); // 确保不超过100级
            templates[level] = this.generateLevelGroup(level, levelGroup);
        }
        
        return templates;
    }

    // 生成等级组的敌人（每5级一组）
    generateLevelGroup(minLevel, maxLevel) {
        const midLevel = Math.floor((minLevel + maxLevel) / 2);
        const enemies = [];

        // 每个档次包含：小怪2种、精英1种、高精英1种（每10级）、BOSS（每10级）
        
        // 小怪
        enemies.push(this.createPhysicalMinion(midLevel));
        enemies.push(this.createMagicalMinion(midLevel));
        
        // 精英
        enemies.push(this.createElite(midLevel));
        
        // 高精英（每10级一个）
        if (midLevel % 10 <= 2 || midLevel % 10 >= 8) {
            enemies.push(this.createAdvancedElite(midLevel));
        }
        
        // BOSS（每10级一个）
        if (midLevel % 10 <= 2 || midLevel % 10 >= 8) {
            enemies.push(this.createBoss(midLevel));
        }
        
        return enemies;
    }

    // 创建物理系小怪
    createPhysicalMinion(level) {
        const baseStats = this.calculateBaseStats(level);
        const multipliers = this.typeMultipliers.minion;
        const finalStats = this.applyMultipliers(baseStats, multipliers);
        
        const names = ["森林狼", "哥布林战士", "骷髅兵", "野猪", "盗贼"];
        const name = names[level % names.length];
        
        return {
            name: name,
            type: name.toLowerCase(),
            level: level,
            category: "minion",
            
            ...finalStats,
            
            skills: ["撕咬", "冲锋攻击"],
            aiSkills: [
                {
                    name: "撕咬",
                    type: "physical",
                    target: "single",
                    baseDamage: Math.floor(18 + level * 2.5),
                    specialEffects: {
                        dot: { type: "bleed", damage: Math.floor(4 + level * 0.6), duration: 3 }
                    },
                    cooldown: 2,
                    priority: 40
                },
                {
                    name: "冲锋攻击",
                    type: "physical",
                    target: "single",
                    baseDamage: Math.floor(15 + level * 2.0),
                    hitBonus: Math.floor(10 + level * 0.3),
                    cooldown: 3,
                    priority: 30
                }
            ],
            
            dropTable: this.generateDropTable(level, "minion"),
            experienceReward: Math.floor(15 + level * 1.5),
            description: `等级${level}的${name}，擅长物理攻击`
        };
    }

    // 创建魔法系小怪
    createMagicalMinion(level) {
        const baseStats = this.calculateBaseStats(level);
        const multipliers = this.typeMultipliers.minion;
        const finalStats = this.applyMultipliers(baseStats, multipliers);
        
        const names = ["火元素", "冰霜史莱姆", "暗影精灵", "电光蛇", "毒菇怪"];
        const name = names[level % names.length];
        
        return {
            name: name,
            type: name.toLowerCase(),
            level: level,
            category: "minion",
            
            ...finalStats,
            
            skills: ["火球术", "冰锥术"],
            aiSkills: [
                {
                    name: "火球术",
                    type: "magic",
                    target: "single",
                    baseDamage: Math.floor(22 + level * 2.8),
                    specialEffects: {
                        dot: { type: "burn", damage: Math.floor(5 + level * 0.8), duration: 3 }
                    },
                    cooldown: 2,
                    priority: 45
                },
                {
                    name: "冰锥术",
                    type: "magic",
                    target: "single",
                    baseDamage: Math.floor(17 + level * 2.2),
                    specialEffects: {
                        cc: { type: "slow", duration: 2, chance: 0.7 }
                    },
                    cooldown: 1,
                    priority: 35
                }
            ],
            
            dropTable: this.generateDropTable(level, "minion"),
            experienceReward: Math.floor(18 + level * 1.8),
            description: `等级${level}的${name}，掌握元素魔法`
        };
    }

    // 创建精英
    createElite(level) {
        const baseStats = this.calculateBaseStats(level);
        const multipliers = this.typeMultipliers.elite;
        const finalStats = this.applyMultipliers(baseStats, multipliers);
        
        const names = ["哥布林督军", "骷髅队长", "巨狼首领", "法师护卫", "盗贼头目"];
        const name = names[level % names.length];
        
        return {
            name: name,
            type: name.toLowerCase(),
            level: level,
            category: "elite",
            
            ...finalStats,
            
            skills: ["战争咆哮", "连击斩", "重击突破"],
            aiSkills: [
                {
                    name: "战争咆哮",
                    type: "support",
                    target: "aoe",
                    specialEffects: {
                        cc: { type: "slow", duration: 3, chance: 0.8 }
                    },
                    cooldown: 4,
                    priority: 55
                },
                {
                    name: "连击斩",
                    type: "physical",
                    target: "single",
                    baseDamage: Math.floor(30 + level * 2.5),
                    specialEffects: {
                        multiHit: { count: Math.min(5, Math.floor(2 + level / 20)) }
                    },
                    cooldown: 4,
                    priority: 70
                },
                {
                    name: "重击突破",
                    type: "physical",
                    target: "single",
                    baseDamage: Math.floor(42 + level * 3.0),
                    specialEffects: {
                        penetration: { physical: Math.min(35, Math.floor(15 + level * 0.5)) }
                    },
                    cooldown: 5,
                    priority: 80
                }
            ],
            
            dropTable: this.generateDropTable(level, "elite"),
            experienceReward: Math.floor(40 + level * 3),
            description: `等级${level}的${name}，精英战士，拥有多种战斗技巧`
        };
    }

    // 创建高级精英
    createAdvancedElite(level) {
        const baseStats = this.calculateBaseStats(level);
        const multipliers = this.typeMultipliers.elite_advanced;
        const finalStats = this.applyMultipliers(baseStats, multipliers);
        
        const names = ["暗影刺客", "元素守护者", "死灵法师", "战争机器", "混沌术士"];
        const name = names[level % names.length];
        
        return {
            name: name,
            type: name.toLowerCase(),
            level: level,
            category: "elite_advanced",
            
            ...finalStats,
            
            skills: ["暗影突袭", "元素风暴", "死亡标记", "终极重击"],
            aiSkills: [
                {
                    name: "暗影突袭",
                    type: "physical",
                    target: "single",
                    baseDamage: Math.floor(55 + level * 3.5),
                    specialEffects: {
                        multiHit: { count: 4 },
                        lifesteal: { percent: Math.min(0.9, 0.4 + level * 0.01) }
                    },
                    cooldown: 5,
                    priority: 85
                },
                {
                    name: "元素风暴",
                    type: "magic",
                    target: "aoe",
                    baseDamage: Math.floor(45 + level * 3.0),
                    specialEffects: {
                        dot: { type: "burn", damage: Math.floor(10 + level * 1.2), duration: 4 },
                        cc: { type: "slow", duration: 3, chance: 0.85 }
                    },
                    cooldown: 6,
                    priority: 75
                },
                {
                    name: "死亡标记",
                    type: "support",
                    target: "single",
                    specialEffects: {
                        mark: { damageBonus: Math.min(1.2, 0.5 + level * 0.012), duration: 5 }
                    },
                    cooldown: 5,
                    priority: 70
                },
                {
                    name: "终极重击",
                    type: "physical",
                    target: "single",
                    baseDamage: Math.floor(85 + level * 5),
                    specialEffects: {
                        penetration: { physical: Math.min(50, Math.floor(20 + level * 0.6)) },
                        execute: { threshold: Math.min(0.40, 0.20 + level * 0.002) }
                    },
                    cooldown: 7,
                    priority: 90
                }
            ],
            
            dropTable: this.generateDropTable(level, "elite_advanced"),
            experienceReward: Math.floor(80 + level * 5),
            description: `等级${level}的${name}，高级精英，掌握复杂的战斗技巧和魔法`
        };
    }

    // 创建BOSS
    createBoss(level) {
        const baseStats = this.calculateBaseStats(level);
        const multipliers = this.typeMultipliers.boss;
        const finalStats = this.applyMultipliers(baseStats, multipliers);
        
        const names = ["暗影龙王", "元素领主", "死灵大君", "机械霸主", "虚空主宰"];
        const name = names[Math.floor(level / 20) % names.length];
        
        return {
            name: name,
            type: name.toLowerCase(),
            level: level,
            category: "boss",
            
            ...finalStats,
            
            skills: ["龙息吐息", "元素震荡", "死亡凝视", "毁灭重击", "王者重生"],
            aiSkills: [
                {
                    name: "龙息吐息",
                    type: "magic",
                    target: "aoe",
                    baseDamage: Math.floor(100 + level * 5),
                    specialEffects: {
                        dot: { type: "burn", damage: Math.floor(18 + level * 1.8), duration: 5 },
                        penetration: { magic: Math.min(60, Math.floor(25 + level * 0.7)) }
                    },
                    cooldown: 6,
                    priority: 85
                },
                {
                    name: "元素震荡",
                    type: "support",
                    target: "aoe",
                    specialEffects: {
                        cc: { type: "stun", duration: 2, chance: Math.min(0.85, 0.6 + level * 0.005) }
                    },
                    cooldown: 7,
                    priority: 80
                },
                {
                    name: "死亡凝视",
                    type: "support",
                    target: "single",
                    specialEffects: {
                        mark: { damageBonus: Math.min(1.5, 0.7 + level * 0.012), duration: 5 }
                    },
                    cooldown: 5,
                    priority: 75
                },
                {
                    name: "毁灭重击",
                    type: "physical",
                    target: "single",
                    baseDamage: Math.floor(150 + level * 7),
                    specialEffects: {
                        penetration: { physical: Math.min(70, Math.floor(30 + level * 0.8)) },
                        execute: { threshold: Math.min(0.50, 0.25 + level * 0.0025) }
                    },
                    cooldown: 8,
                    priority: 95
                },
                {
                    name: "王者重生",
                    type: "support",
                    target: "self",
                    trigger: "death_once",
                    effect: "revive_full_hp",
                    description: "死亡时触发一次满血复活",
                    priority: 200
                }
            ],
            
            dropTable: this.generateDropTable(level, "boss"),
            experienceReward: Math.floor(200 + level * 10),
            description: `等级${level}的${name}，终极BOSS，拥有毁天灭地的力量和复活能力`
        };
    }

    // 计算基础属性
    calculateBaseStats(level) {
        return {
            baseHp: 80 + (level - 1) * 22,
            baseMana: 60 + (level - 1) * 10,
            baseStamina: 60 + (level - 1) * 10,
            baseAttack: 10 + (level - 1) * 3.0,
            basePhysicalPower: 10 + (level - 1) * 3.0,
            baseMagicPower: 6 + (level - 1) * 2.2,
            baseAgility: 6 + Math.floor(level / 4),
            baseWeight: 10 + Math.floor(level / 10),
            basePhysicalResistance: Math.floor(level / 8) * 2.5,
            baseMagicResistance: Math.floor(level / 8) * 2
        };
    }

    // 应用类型系数
    applyMultipliers(baseStats, multipliers) {
        // 应用±10%随机浮动
        const variance = () => 0.9 + Math.random() * 0.2;
        
        return {
            hp: Math.floor(baseStats.baseHp * multipliers.hp * variance()),
            maxHp: Math.floor(baseStats.baseHp * multipliers.hp * variance()),
            mana: Math.floor(baseStats.baseMana * variance()),
            maxMana: Math.floor(baseStats.baseMana * variance()),
            stamina: Math.floor(baseStats.baseStamina * variance()),
            maxStamina: Math.floor(baseStats.baseStamina * variance()),
            
            attack: Math.floor(baseStats.baseAttack * multipliers.attack * variance()),
            physicalPower: Math.floor(baseStats.basePhysicalPower * multipliers.physicalPower * variance()),
            magicPower: Math.floor(baseStats.baseMagicPower * multipliers.magicPower * variance()),
            
            physicalResistance: Math.min(75, Math.floor((baseStats.basePhysicalResistance + multipliers.physicalResistance) * variance())),
            magicResistance: Math.min(75, Math.floor((baseStats.baseMagicResistance + multipliers.magicResistance) * variance())),
            
            agility: Math.floor(baseStats.baseAgility * multipliers.agility * variance()),
            weight: Math.floor(baseStats.baseWeight * multipliers.weight * variance()),
            criticalChance: multipliers.criticalChance
        };
    }

    // 生成掉落表
    generateDropTable(level, category) {
        const drops = [];
        
        // 基础掉落
        if (level <= 20) {
            drops.push({ item: "铜币", chance: 0.8, quantity: [1, Math.floor(level * 0.8)] });
            drops.push({ item: "小瓶治疗药水", chance: 0.3 });
        } else if (level <= 50) {
            drops.push({ item: "银币", chance: 0.8, quantity: [Math.floor(level * 0.3), Math.floor(level * 0.8)] });
            drops.push({ item: "中瓶治疗药水", chance: 0.4 });
        } else {
            drops.push({ item: "金币", chance: 0.9, quantity: [Math.floor(level * 0.5), Math.floor(level * 1.2)] });
            drops.push({ item: "大瓶治疗药水", chance: 0.5 });
        }
        
        // 根据类型添加特殊掉落
        switch (category) {
            case "elite":
                drops.push({ item: `等级${level}装备`, chance: 0.2 });
                break;
            case "elite_advanced":
                drops.push({ item: `高级等级${level}装备`, chance: 0.3 });
                drops.push({ item: "技能书", chance: 0.15 });
                break;
            case "boss":
                drops.push({ item: `传说级等级${level}装备`, chance: 0.6 });
                drops.push({ item: "稀有材料", chance: 0.8 });
                drops.push({ item: "高级技能书", chance: 0.3 });
                break;
        }
        
        return drops;
    }

    // 根据等级获取敌人模板
    getEnemyByLevel(level) {
        // 找到对应的等级组
        let levelGroup = null;
        for (let groupStart = 1; groupStart <= 96; groupStart += 5) {
            if (level >= groupStart && level <= groupStart + 4) {
                levelGroup = groupStart;
                break;
            }
        }
        
        if (!levelGroup) {
            levelGroup = 96; // 默认使用最高等级组
        }
        
        const levelTemplates = this.templates[levelGroup];
        if (!levelTemplates || levelTemplates.length === 0) {
            return null;
        }
        
        // 随机选择一个敌人
        const randomIndex = Math.floor(Math.random() * levelTemplates.length);
        const template = levelTemplates[randomIndex];
        
        // 调整等级到请求的等级
        return this.adjustEnemyLevel(template, level);
    }

    // 调整敌人等级
    adjustEnemyLevel(template, targetLevel) {
        if (template.level === targetLevel) {
            return JSON.parse(JSON.stringify(template));
        }
        
        const levelDiff = targetLevel - template.level;
        const adjusted = JSON.parse(JSON.stringify(template));
        
        // 按比例调整属性
        const scaleFactor = targetLevel / template.level;
        adjusted.level = targetLevel;
        adjusted.hp = Math.floor(adjusted.hp * scaleFactor);
        adjusted.maxHp = adjusted.hp;
        adjusted.attack = Math.floor(adjusted.attack * scaleFactor);
        adjusted.physicalPower = Math.floor(adjusted.physicalPower * scaleFactor);
        adjusted.magicPower = Math.floor(adjusted.magicPower * scaleFactor);
        adjusted.experienceReward = Math.floor(adjusted.experienceReward * scaleFactor);
        
        // 调整技能伤害
        if (adjusted.aiSkills) {
            adjusted.aiSkills.forEach(skill => {
                if (skill.baseDamage) {
                    skill.baseDamage = Math.floor(skill.baseDamage * scaleFactor);
                }
                if (skill.specialEffects?.dot?.damage) {
                    skill.specialEffects.dot.damage = Math.floor(skill.specialEffects.dot.damage * scaleFactor);
                }
            });
        }
        
        return adjusted;
    }

    // 获取推荐敌人等级
    getRecommendedEnemyLevel(playerLevel) {
        const variance = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        return Math.max(1, Math.min(100, playerLevel + variance));
    }

    // 获取敌人组合
    getEnemyGroup(level, count = 1, preferredTypes = []) {
        const enemies = [];
        
        for (let i = 0; i < count; i++) {
            let enemy;
            
            if (preferredTypes.length > 0) {
                // 尝试获取指定类型的敌人
                const targetType = preferredTypes[i % preferredTypes.length];
                enemy = this.getEnemyByTypeAndLevel(targetType, level);
            }
            
            if (!enemy) {
                enemy = this.getEnemyByLevel(level);
            }
            
            if (enemy) {
                enemies.push(enemy);
            }
        }
        
        return enemies;
    }

    // 根据类型和等级获取敌人
    getEnemyByTypeAndLevel(type, level) {
        const levelGroup = Math.floor((level - 1) / 5) * 5 + 1;
        const levelTemplates = this.templates[levelGroup];
        
        if (!levelTemplates) return null;
        
        const filtered = levelTemplates.filter(enemy => enemy.category === type);
        if (filtered.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * filtered.length);
        return this.adjustEnemyLevel(filtered[randomIndex], level);
    }

    // 获取所有可用等级
    getAvailableLevels() {
        return Object.keys(this.templates).map(Number).sort((a, b) => a - b);
    }

    // 生成指定等级和类型的敌人（供FunctionCallService使用）
    generateEnemy(level, category, species = null) {
        // 处理advanced_elite参数映射
        const actualCategory = category === 'advanced_elite' ? 'elite_advanced' : category;
        
        if (species) {
            return this.generateEnemyBySpecies(level, actualCategory, species);
        } else {
            return this.getEnemyByTypeAndLevel(actualCategory, level);
        }
    }

    // 根据物种生成敌人
    generateEnemyBySpecies(level, category, species) {
        const baseStats = this.calculateBaseStats(level);
        const multipliers = this.typeMultipliers[category] || this.typeMultipliers.minion;
        const finalStats = this.applyMultipliers(baseStats, multipliers);
        
        const speciesData = this.getSpeciesData(species, category);
        if (!speciesData) {
            console.warn(`[EnemyTemplates] 未知物种: ${species}，使用默认生成`);
            return this.getEnemyByTypeAndLevel(category, level);
        }
        
        return {
            name: speciesData.name,
            type: speciesData.name.toLowerCase(),
            level: level,
            category: category,
            
            ...finalStats,
            
            skills: speciesData.skills,
            aiSkills: this.generateSpeciesSkills(speciesData, level),
            
            dropTable: this.generateDropTable(level, category),
            experienceReward: this.calculateExperienceReward(level, category),
            description: `等级${level}的${speciesData.name}，${speciesData.description}`
        };
    }

    // 获取物种数据
    getSpeciesData(species, category) {
        const speciesDatabase = {
            // 物理系小怪
            "forest_wolf": {
                name: "森林狼",
                type: "physical",
                description: "敏捷的森林掠食者",
                skills: ["撕咬", "跳跃攻击"],
                specialties: ["流血", "敏捷"]
            },
            "goblin": {
                name: "哥布林战士",
                type: "physical",
                description: "狡猾的绿皮小怪物",
                skills: ["短刀突刺", "投掷石块"],
                specialties: ["群体", "狡诈"]
            },
            "skeleton": {
                name: "骷髅兵",
                type: "undead",
                description: "不死的骨架战士",
                skills: ["骨刃斩击", "死灵之力"],
                specialties: ["不死", "物理抗性"]
            },
            "wild_boar": {
                name: "野猪",
                type: "beast",
                description: "暴躁的森林野兽",
                skills: ["冲撞", "獠牙攻击"],
                specialties: ["冲锋", "韧性"]
            },
            "bandit": {
                name: "盗贼",
                type: "humanoid",
                description: "经验丰富的劫匪",
                skills: ["偷袭", "脏招"],
                specialties: ["暴击", "灵活"]
            },
            
            // 魔法系小怪
            "fire_elemental": {
                name: "火元素",
                type: "elemental",
                description: "燃烧的元素生物",
                skills: ["火球术", "火焰护盾"],
                specialties: ["灼烧", "火焰"]
            },
            "ice_slime": {
                name: "冰霜史莱姆",
                type: "elemental",
                description: "寒冷的粘液生物",
                skills: ["冰锥术", "寒冰护甲"],
                specialties: ["减速", "冰霜"]
            },
            "shadow_sprite": {
                name: "暗影精灵",
                type: "elemental",
                description: "阴影中的魔法生物",
                skills: ["暗影箭", "隐身"],
                specialties: ["暗影", "闪避"]
            },
            "electric_snake": {
                name: "电光蛇",
                type: "elemental",
                description: "充满电能的魔法蛇类",
                skills: ["闪电链", "电击"],
                specialties: ["麻痹", "连锁"]
            },
            "poison_mushroom": {
                name: "毒菇怪",
                type: "plant",
                description: "有毒的菌类怪物",
                skills: ["毒孢子", "根须缠绕"],
                specialties: ["中毒", "控制"]
            },
            
            // 精英怪
            "goblin_warchief": {
                name: "哥布林督军",
                type: "humanoid",
                description: "哥布林部落的强大领袖",
                skills: ["战争咆哮", "连击斩", "重击突破"],
                specialties: ["领导", "多技能"]
            },
            "skeleton_captain": {
                name: "骷髅队长",
                type: "undead",
                description: "不死军团的指挥官",
                skills: ["亡灵号令", "骨盾防御", "死亡重击"],
                specialties: ["不死", "防御"]
            },
            "alpha_wolf": {
                name: "巨狼首领",
                type: "beast",
                description: "狼群的阿尔法领袖",
                skills: ["狼群之吼", "撕裂攻击", "野性冲锋"],
                specialties: ["群体增益", "野性"]
            },
            "mage_guard": {
                name: "法师护卫",
                type: "humanoid",
                description: "受过训练的魔法战士",
                skills: ["魔法护盾", "元素打击", "法术反制"],
                specialties: ["法术", "防护"]
            },
            "bandit_leader": {
                name: "盗贼头目",
                type: "humanoid",
                description: "盗贼团的狡猾首领",
                skills: ["毒刃", "致命突袭", "烟雾弹"],
                specialties: ["毒素", "暴击"]
            },
            
            // 高级精英
            "shadow_assassin": {
                name: "暗影刺客",
                type: "humanoid",
                description: "掌握暗影之力的杀手",
                skills: ["暗影突袭", "影分身", "致命标记"],
                specialties: ["暗影", "刺杀"]
            },
            "elemental_guardian": {
                name: "元素守护者",
                type: "elemental",
                description: "古老的元素守护灵",
                skills: ["元素风暴", "元素融合", "守护结界"],
                specialties: ["多元素", "守护"]
            },
            "necromancer": {
                name: "死灵法师",
                type: "undead",
                description: "操控死亡力量的法师",
                skills: ["死亡标记", "亡灵召唤", "生命汲取"],
                specialties: ["死灵", "召唤"]
            },
            "war_machine": {
                name: "战争机器",
                type: "construct",
                description: "古代的魔法构造体",
                skills: ["重型火炮", "装甲冲锋", "自我修复"],
                specialties: ["机械", "装甲"]
            },
            "chaos_sorcerer": {
                name: "混沌术士",
                type: "humanoid",
                description: "掌握混沌魔法的疯狂法师",
                skills: ["混沌爆发", "现实扭曲", "疯狂诅咒"],
                specialties: ["混沌", "随机"]
            },
            
            // BOSS
            "shadow_dragon": {
                name: "暗影龙王",
                type: "dragon",
                description: "统治暗影的古老巨龙",
                skills: ["龙息吐息", "元素震荡", "死亡凝视", "毁灭重击", "王者重生"],
                specialties: ["龙族", "复活"]
            },
            "elemental_lord": {
                name: "元素领主",
                type: "elemental",
                description: "元素位面的统治者",
                skills: ["元素主宰", "位面撕裂", "元素军团", "终极审判", "不朽重生"],
                specialties: ["元素主宰", "位面"]
            },
            "lich_king": {
                name: "死灵大君",
                type: "undead",
                description: "不死魔法的最高存在",
                skills: ["死亡领域", "灵魂收割", "亡灵大军", "终极诅咒", "永恒重生"],
                specialties: ["不死之王", "灵魂"]
            },
            "mech_overlord": {
                name: "机械霸主",
                type: "construct",
                description: "超级人工智能机械体",
                skills: ["歼灭光束", "系统入侵", "机甲召唤", "核心爆炸", "系统重启"],
                specialties: ["人工智能", "科技"]
            },
            "void_master": {
                name: "虚空主宰",
                type: "aberration",
                description: "来自虚空的恐怖存在",
                skills: ["虚空撕裂", "现实崩坏", "恐惧光环", "终极湮灭", "虚空重生"],
                specialties: ["虚空", "恐怖"]
            }
        };
        
        return speciesDatabase[species] || null;
    }

    // 为物种生成技能
    generateSpeciesSkills(speciesData, level) {
        const baseSkills = [];
        
        // 根据物种类型和特长生成技能
        if (speciesData.specialties.includes("流血")) {
            baseSkills.push({
                name: "撕咬",
                type: "physical",
                target: "single",
                baseDamage: Math.floor(15 + level * 2),
                specialEffects: {
                    dot: { type: "bleed", damage: Math.floor(3 + level * 0.5), duration: 2 }
                },
                cooldown: 2,
                priority: 40
            });
        }
        
        if (speciesData.specialties.includes("灼烧")) {
            baseSkills.push({
                name: "火球术",
                type: "magic",
                target: "single",
                baseDamage: Math.floor(18 + level * 2.2),
                specialEffects: {
                    dot: { type: "burn", damage: Math.floor(4 + level * 0.6), duration: 2 }
                },
                cooldown: 2,
                priority: 45
            });
        }
        
        if (speciesData.specialties.includes("减速")) {
            baseSkills.push({
                name: "冰锥术",
                type: "magic",
                target: "single",
                baseDamage: Math.floor(14 + level * 1.8),
                specialEffects: {
                    cc: { type: "slow", duration: 2, chance: 0.6 }
                },
                cooldown: 1,
                priority: 35
            });
        }
        
        // 如果没有生成足够技能，使用通用技能填充
        if (baseSkills.length === 0) {
            baseSkills.push({
                name: "基础攻击",
                type: speciesData.type === "elemental" ? "magic" : "physical",
                target: "single",
                baseDamage: Math.floor(12 + level * 1.5),
                cooldown: 2,
                priority: 30
            });
        }
        
        return baseSkills;
    }

    // 计算经验奖励
    calculateExperienceReward(level, category) {
        const baseExp = {
            minion: 15,
            elite: 40,
            elite_advanced: 80,
            boss: 200
        };
        
        const categoryExp = baseExp[category] || baseExp.minion;
        return Math.floor(categoryExp + level * (categoryExp / 10));
    }

    // 获取可用物种列表
    getAvailableSpeciesByCategory(category) {
        const speciesMap = {
            minion: [
                "forest_wolf", "goblin", "skeleton", "wild_boar", "bandit", // 物理系
                "fire_elemental", "ice_slime", "shadow_sprite", "electric_snake", "poison_mushroom" // 魔法系
            ],
            elite: [
                "goblin_warchief", "skeleton_captain", "alpha_wolf", "mage_guard", "bandit_leader"
            ],
            elite_advanced: [
                "shadow_assassin", "elemental_guardian", "necromancer", "war_machine", "chaos_sorcerer"
            ],
            boss: [
                "shadow_dragon", "elemental_lord", "lich_king", "mech_overlord", "void_master"
            ]
        };
        
        return speciesMap[category] || [];
    }
}

export default EnemyTemplates;