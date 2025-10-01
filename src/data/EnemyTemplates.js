
// data/EnemyTemplates.js - 敌人模板系统（使用与玩家相同的数据结构）
class EnemyTemplates {
    constructor() {
        this.templates = this.initializeTemplates();
    }

    initializeTemplates() {
        return {
            // 1级敌人 - 新手友好
            1: [
                {
                    // 基础信息
                    name: "小史莱姆",
                    type: "小史莱姆", // 保持兼容性
                    level: 1,
                    
                    // 使用与玩家相同的属性结构
                    hp: 30,
                    maxHp: 30,
                    mana: 10,
                    maxMana: 10,
                    stamina: 20,
                    maxStamina: 20,
                    
                    // 基础属性 - 使用与玩家相同的stats结构
                    stats: {
                        baseAttack: 6,
                        baseDefense: 2,
                        speed: 5,
                        baseMagicPower: 2,
                        basePhysicalPower: 4,
                        // 装备加成属性（敌人通常为0，但保持结构一致）
                        equipmentAttackBonus: 0,
                        equipmentDefenseBonus: 0,
                        equipmentMagicPowerBonus: 0,
                        equipmentPhysicalPowerBonus: 0,
                        equipmentSpeedBonus: 0,
                        equipmentCriticalChanceBonus: 2
                    },
                    
                    // 技能和装备（保持与玩家结构一致）
                    skills: [],
                    equipment: {},
                    tempBuffs: [],
                    
                    // 敌人特有属性
                    description: "软软的绿色史莱姆，看起来很无害",
                    aiSkills: ["弹跳攻击"],
                    dropTable: [
                        { item: "史莱姆胶", chance: 0.7 },
                        { item: "铜币", chance: 0.8 },
                        { item: "小瓶治疗药水", chance: 0.3 }
                    ],
                    experienceReward: 15
                },
                {
                    name: "幼年哥布林",
                    type: "幼年哥布林",
                    level: 1,
                    
                    hp: 35,
                    maxHp: 35,
                    mana: 15,
                    maxMana: 15,
                    stamina: 25,
                    maxStamina: 25,
                    
                    stats: {
                        baseAttack: 8,
                        baseDefense: 3,
                        speed: 7,
                        baseMagicPower: 1,
                        basePhysicalPower: 6,
                        equipmentAttackBonus: 0,
                        equipmentDefenseBonus: 0,
                        equipmentMagicPowerBonus: 0,
                        equipmentPhysicalPowerBonus: 0,
                        equipmentSpeedBonus: 0,
                        equipmentCriticalChanceBonus: 5
                    },
                    
                    skills: [],
                    equipment: {},
                    tempBuffs: [],
                    
                    description: "刚成年的哥布林，拿着破旧的木棒",
                    aiSkills: ["木棒挥击"],
                    dropTable: [
                        { item: "廉价铁剑", chance: 0.4 },
                        { item: "铜币", chance: 0.9 },
                        { item: "小瓶治疗药水", chance: 0.5 }
                    ],
                    experienceReward: 20
                }
            ],

            // 2级敌人 - 稍有挑战
            2: [
                {
                    name: "野狼",
                    type: "野狼",
                    level: 2,
                    
                    hp: 60,
                    maxHp: 60,
                    mana: 20,
                    maxMana: 20,
                    stamina: 40,
                    maxStamina: 40,
                    
                    stats: {
                        baseAttack: 12,
                        baseDefense: 5,
                        speed: 12,
                        baseMagicPower: 2,
                        basePhysicalPower: 10,
                        equipmentAttackBonus: 0,
                        equipmentDefenseBonus: 0,
                        equipmentMagicPowerBonus: 0,
                        equipmentPhysicalPowerBonus: 0,
                        equipmentSpeedBonus: 0,
                        equipmentCriticalChanceBonus: 8
                    },
                    
                    skills: [],
                    equipment: {},
                    tempBuffs: [],
                    
                    description: "饥饿的野狼，眼中闪烁着凶光",
                    aiSkills: ["撕咬", "狼嚎"],
                    dropTable: [
                        { item: "皮革", chance: 0.6 },
                        { item: "小瓶治疗药水", chance: 0.4 },
                        { item: "铜币", chance: 0.8 }
                    ],
                    experienceReward: 35
                },
                {
                    name: "哥布林战士",
                    type: "哥布林战士",
                    level: 2,
                    
                    hp: 70,
                    maxHp: 70,
                    mana: 25,
                    maxMana: 25,
                    stamina: 35,
                    maxStamina: 35,
                    
                    stats: {
                        baseAttack: 14,
                        baseDefense: 8,
                        speed: 9,
                        baseMagicPower: 3,
                        basePhysicalPower: 12,
                        equipmentAttackBonus: 0,
                        equipmentDefenseBonus: 0,
                        equipmentMagicPowerBonus: 0,
                        equipmentPhysicalPowerBonus: 0,
                        equipmentSpeedBonus: 0,
                        equipmentCriticalChanceBonus: 6
                    },
                    
                    skills: [],
                    equipment: {},
                    tempBuffs: [],
                    
                    description: "装备简陋武器的哥布林战士",
                    aiSkills: ["冲锋", "连击"],
                    dropTable: [
                        { item: "铁剑", chance: 0.3 },
                        { item: "皮甲", chance: 0.2 },
                        { item: "铜币", chance: 0.9 },
                        { item: "小瓶治疗药水", chance: 0.5 }
                    ],
                    experienceReward: 40
                }
            ],

            // 3级敌人 - 中等难度
            3: [
                {
                    name: "骷髅兵",
                    type: "骷髅兵",
                    level: 3,
                    
                    hp: 90,
                    maxHp: 90,
                    mana: 30,
                    maxMana: 30,
                    stamina: 40,
                    maxStamina: 40,
                    
                    stats: {
                        baseAttack: 16,
                        baseDefense: 12,
                        speed: 8,
                        baseMagicPower: 8,
                        basePhysicalPower: 14,
                        equipmentAttackBonus: 0,
                        equipmentDefenseBonus: 0,
                        equipmentMagicPowerBonus: 0,
                        equipmentPhysicalPowerBonus: 0,
                        equipmentSpeedBonus: 0,
                        equipmentCriticalChanceBonus: 4
                    },
                    
                    skills: [],
                    equipment: {},
                    tempBuffs: [],
                    
                    description: "被黑暗魔法复活的骷髅战士",
                    aiSkills: ["骨刺攻击", "死亡凝视"],
                    dropTable: [
                        { item: "铁矿石", chance: 0.8 },
                        { item: "魔法水晶", chance: 0.2 },
                        { item: "中瓶治疗药水", chance: 0.3 },
                        { item: "银币", chance: 0.6 }
                    ],
                    experienceReward: 60
                },
                {
                    name: "森林巨熊",
                    type: "森林巨熊",
                    level: 3,
                    
                    hp: 120,
                    maxHp: 120,
                    mana: 25,
                    maxMana: 25,
                    stamina: 60,
                    maxStamina: 60,
                    
                    stats: {
                        baseAttack: 20,
                        baseDefense: 15,
                        speed: 6,
                        baseMagicPower: 4,
                        basePhysicalPower: 20,
                        equipmentAttackBonus: 0,
                        equipmentDefenseBonus: 0,
                        equipmentMagicPowerBonus: 0,
                        equipmentPhysicalPowerBonus: 0,
                        equipmentSpeedBonus: 0,
                        equipmentCriticalChanceBonus: 10
                    },
                    
                    skills: [],
                    equipment: {},
                    tempBuffs: [],
                    
                    description: "体型庞大的森林守护者，力量惊人",
                    aiSkills: ["熊掌重击", "咆哮"],
                    dropTable: [
                        { item: "皮革", chance: 0.7 },
                        { item: "中瓶治疗药水", chance: 0.5 },
                        { item: "银币", chance: 0.7 }
                    ],
                    experienceReward: 75
                }
            ],

            // 4级敌人 - 较高难度
            4: [
                {
                    name: "哥布林萨满",
                    type: "哥布林萨满",
                    level: 4,
                    
                    hp: 100,
                    maxHp: 100,
                    mana: 60,
                    maxMana: 60,
                    stamina: 40,
                    maxStamina: 40,
                    
                    stats: {
                        baseAttack: 14,
                        baseDefense: 10,
                        speed: 11,
                        baseMagicPower: 20,
                        basePhysicalPower: 8,
                        equipmentAttackBonus: 0,
                        equipmentDefenseBonus: 0,
                        equipmentMagicPowerBonus: 0,
                        equipmentPhysicalPowerBonus: 0,
                        equipmentSpeedBonus: 0,
                        equipmentCriticalChanceBonus: 7
                    },
                    
                    skills: [],
                    equipment: {},
                    tempBuffs: [],
                    
                    description: "掌握黑暗魔法的哥布林法师",
                    aiSkills: ["火球术", "治疗术", "诅咒"],
                    dropTable: [
                        { item: "木杖", chance: 0.4 },
                        { item: "魔法水晶", chance: 0.6 },
                        { item: "布袍", chance: 0.3 },
                        { item: "银币", chance: 0.8 }
                    ],
                    experienceReward: 90
                },
                {
                    name: "石像鬼",
                    type: "石像鬼",
                    level: 4,
                    
                    hp: 150,
                    maxHp: 150,
                    mana: 40,
                    maxMana: 40,
                    stamina: 50,
                    maxStamina: 50,
                    
                    stats: {
                        baseAttack: 22,
                        baseDefense: 20,
                        speed: 7,
                        baseMagicPower: 12,
                        basePhysicalPower: 18,
                        equipmentAttackBonus: 0,
                        equipmentDefenseBonus: 0,
                        equipmentMagicPowerBonus: 0,
                        equipmentPhysicalPowerBonus: 0,
                        equipmentSpeedBonus: 0,
                        equipmentCriticalChanceBonus: 3
                    },
                    
                    skills: [],
                    equipment: {},
                    tempBuffs: [],
                    
                    description: "古老的石制守护者，防御力极强",
                    aiSkills: ["石化凝视", "岩石投掷"],
                    dropTable: [
                        { item: "魔法水晶", chance: 0.5 },
                        { item: "铁矿石", chance: 0.8 },
                        { item: "中瓶治疗药水", chance: 0.4 },
                        { item: "银币", chance: 0.7 }
                    ],
                    experienceReward: 100
                }
            ],

            // 5级敌人 - 高难度
            5: [
                {
                    name: "暗影刺客",
                    type: "暗影刺客",
                    level: 5,
                    
                    hp: 130,
                    maxHp: 130,
                    mana: 50,
                    maxMana: 50,
                    stamina: 80,
                    maxStamina: 80,
                    
                    stats: {
                        baseAttack: 28,
                        baseDefense: 15,
                        speed: 18,
                        baseMagicPower: 10,
                        basePhysicalPower: 25,
                        equipmentAttackBonus: 0,
                        equipmentDefenseBonus: 0,
                        equipmentMagicPowerBonus: 0,
                        equipmentPhysicalPowerBonus: 0,
                        equipmentSpeedBonus: 0,
                        equipmentCriticalChanceBonus: 20
                    },
                    
                    skills: [],
                    equipment: {},
                    tempBuffs: [],
                    
                    description: "来无影去无踪的暗影杀手",
                    aiSkills: ["暗影突袭", "毒刃", "隐身"],
                    dropTable: [
                        { item: "毒刃匕首", chance: 0.4 },
                        { item: "毒药", chance: 0.5 },
                        { item: "金币", chance: 0.6 }
                    ],
                    experienceReward: 120
                }
            ]
        };
    }

    // 根据等级获取敌人模板
    getEnemyByLevel(level) {
        const levelTemplates = this.templates[level];
        if (!levelTemplates || levelTemplates.length === 0) {
            // 如果没有对应等级的敌人，返回最接近的等级
            const availableLevels = Object.keys(this.templates).map(Number).sort((a, b) => a - b);
            const closestLevel = availableLevels.reduce((prev, curr) =>
                Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev
            );
            return this.getRandomEnemyFromLevel(closestLevel);
        }
        
        return this.getRandomEnemyFromLevel(level);
    }

    // 从指定等级随机选择一个敌人
    getRandomEnemyFromLevel(level) {
        const levelTemplates = this.templates[level];
        if (!levelTemplates || levelTemplates.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * levelTemplates.length);
        const template = levelTemplates[randomIndex];
        
        // 创建敌人实例，添加一些随机变化
        return this.createEnemyInstance(template);
    }

    // 创建敌人实例，添加随机变化并使用与玩家相同的属性计算
    createEnemyInstance(template) {
        const variance = 0.2; // 20%的属性变化
        
        // 复制模板并添加随机变化
        const enemy = JSON.parse(JSON.stringify(template));
        
        // 对生命值添加随机变化
        const hpVariance = 1 + (Math.random() - 0.5) * variance;
        enemy.hp = Math.floor(enemy.hp * hpVariance);
        enemy.maxHp = enemy.hp;
        
        // 添加计算后的属性（使用与玩家相同的计算方式）
        enemy.attack = this.calculateEnemyAttack(enemy);
        enemy.defense = this.calculateEnemyDefense(enemy);
        enemy.magicPower = this.calculateEnemyMagicPower(enemy);
        enemy.physicalPower = this.calculateEnemyPhysicalPower(enemy);
        enemy.speed = this.calculateEnemySpeed(enemy);
        enemy.criticalChance = this.calculateEnemyCriticalChance(enemy);
        
        return enemy;
    }

    // 使用与玩家相同的计算公式
    calculateEnemyAttack(enemy) {
        const baseAttack = enemy.stats.baseAttack;
        const levelBonus = (enemy.level - 1) * 3; // 与玩家相同的等级加成
        const equipmentBonus = enemy.stats.equipmentAttackBonus || 0;
        return baseAttack + levelBonus + equipmentBonus;
    }

    calculateEnemyDefense(enemy) {
        const baseDefense = enemy.stats.baseDefense;
        const levelBonus = (enemy.level - 1) * 2; // 与玩家相同的等级加成
        const equipmentBonus = enemy.stats.equipmentDefenseBonus || 0;
        return baseDefense + levelBonus + equipmentBonus;
    }

    calculateEnemyMagicPower(enemy) {
        const base = enemy.stats.baseMagicPower || 0;
        const levelBonus = (enemy.level - 1) * 2; // 与玩家相同的等级加成
        const equipmentBonus = enemy.stats.equipmentMagicPowerBonus || 0;
        return base + levelBonus + equipmentBonus;
    }

    calculateEnemyPhysicalPower(enemy) {
        const base = enemy.stats.basePhysicalPower || 0;
        const levelBonus = (enemy.level - 1) * 3; // 与玩家相同的等级加成
        const equipmentBonus = enemy.stats.equipmentPhysicalPowerBonus || 0;
        return base + levelBonus + equipmentBonus;
    }

    calculateEnemySpeed(enemy) {
        const baseSpeed = enemy.stats.speed || 8;
        const equipmentBonus = enemy.stats.equipmentSpeedBonus || 0;
        return baseSpeed + equipmentBonus;
    }

    calculateEnemyCriticalChance(enemy) {
        const equipmentBonus = enemy.stats.equipmentCriticalChanceBonus || 0;
        return equipmentBonus;
    }

    // 获取多个敌人（用于群战）
    getEnemyGroup(level, count = 1) {
        const enemies = [];
        for (let i = 0; i < count; i++) {
            const enemy = this.getEnemyByLevel(level);
            if (enemy) {
                enemies.push(enemy);
            }
        }
        return enemies;
    }

    // 获取混合等级的敌人组合
    getMixedEnemyGroup(minLevel, maxLevel, count = 2) {
        const enemies = [];
        for (let i = 0; i < count; i++) {
            const randomLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
            const enemy = this.getEnemyByLevel(randomLevel);
            if (enemy) {
                enemies.push(enemy);
            }
        }
        return enemies;
    }

    // 根据玩家等级推荐敌人等级
    getRecommendedEnemyLevel(playerLevel) {
        // 基础推荐：敌人等级 = 玩家等级 ± 1
        const baseLevel = playerLevel;
        const variance = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        return Math.max(1, Math.min(5, baseLevel + variance)); // 限制在1-5级
    }

    // 获取所有可用的敌人等级
    getAvailableLevels() {
        return Object.keys(this.templates).map(Number).sort((a, b) => a - b);
    }

    // 获取指定等级的所有敌人类型
    getEnemyTypesByLevel(level) {
        const levelTemplates = this.templates[level];
        return levelTemplates ? levelTemplates.map(enemy => enemy.type) : [];
    }
}

export default EnemyTemplates;