// data/EnemyTemplates.js - 敌人模板系统
class EnemyTemplates {
    constructor() {
        this.templates = this.initializeTemplates();
    }

    initializeTemplates() {
        return {
            // 1级敌人 - 新手友好
            1: [
                {
                    type: "小史莱姆",
                    level: 1,
                    baseHp: 30,
                    baseDamage: 8,
                    defense: 2,
                    speed: 5,
                    description: "软软的绿色史莱姆，看起来很无害",
                    skills: ["弹跳攻击"],
                    dropTable: [
                        { item: "史莱姆胶", chance: 0.7 },
                        { item: "铜币", chance: 0.8 },
                        { item: "治疗药水", chance: 0.3 }
                    ],
                    experienceReward: 15
                },
                {
                    type: "幼年哥布林",
                    level: 1,
                    baseHp: 35,
                    baseDamage: 10,
                    defense: 3,
                    speed: 7,
                    description: "刚成年的哥布林，拿着破旧的木棒",
                    skills: ["木棒挥击"],
                    dropTable: [
                        { item: "破旧木棒", chance: 0.4 },
                        { item: "铜币", chance: 0.9 },
                        { item: "面包", chance: 0.5 }
                    ],
                    experienceReward: 20
                }
            ],

            // 2级敌人 - 稍有挑战
            2: [
                {
                    type: "野狼",
                    level: 2,
                    baseHp: 60,
                    baseDamage: 15,
                    defense: 5,
                    speed: 12,
                    description: "饥饿的野狼，眼中闪烁着凶光",
                    skills: ["撕咬", "狼嚎"],
                    dropTable: [
                        { item: "狼牙", chance: 0.6 },
                        { item: "狼皮", chance: 0.4 },
                        { item: "治疗药水", chance: 0.4 },
                        { item: "铜币", chance: 0.8 }
                    ],
                    experienceReward: 35
                },
                {
                    type: "哥布林战士",
                    level: 2,
                    baseHp: 70,
                    baseDamage: 18,
                    defense: 8,
                    speed: 9,
                    description: "装备简陋武器的哥布林战士",
                    skills: ["冲锋", "连击"],
                    dropTable: [
                        { item: "铁剑", chance: 0.3 },
                        { item: "皮甲", chance: 0.2 },
                        { item: "铜币", chance: 0.9 },
                        { item: "治疗药水", chance: 0.5 }
                    ],
                    experienceReward: 40
                }
            ],

            // 3级敌人 - 中等难度
            3: [
                {
                    type: "骷髅兵",
                    level: 3,
                    baseHp: 90,
                    baseDamage: 22,
                    defense: 12,
                    speed: 8,
                    description: "被黑暗魔法复活的骷髅战士",
                    skills: ["骨刺攻击", "死亡凝视"],
                    dropTable: [
                        { item: "骨头", chance: 0.8 },
                        { item: "魔法卷轴", chance: 0.2 },
                        { item: "高级治疗药水", chance: 0.3 },
                        { item: "银币", chance: 0.6 }
                    ],
                    experienceReward: 60
                },
                {
                    type: "森林巨熊",
                    level: 3,
                    baseHp: 120,
                    baseDamage: 28,
                    defense: 15,
                    speed: 6,
                    description: "体型庞大的森林守护者，力量惊人",
                    skills: ["熊掌重击", "咆哮"],
                    dropTable: [
                        { item: "熊皮", chance: 0.7 },
                        { item: "熊胆", chance: 0.4 },
                        { item: "高级治疗药水", chance: 0.5 },
                        { item: "银币", chance: 0.7 }
                    ],
                    experienceReward: 75
                }
            ],

            // 4级敌人 - 较高难度
            4: [
                {
                    type: "哥布林萨满",
                    level: 4,
                    baseHp: 100,
                    baseDamage: 25,
                    defense: 10,
                    speed: 11,
                    description: "掌握黑暗魔法的哥布林法师",
                    skills: ["火球术", "治疗术", "诅咒"],
                    dropTable: [
                        { item: "魔法杖", chance: 0.4 },
                        { item: "魔法卷轴", chance: 0.6 },
                        { item: "法师袍", chance: 0.3 },
                        { item: "银币", chance: 0.8 }
                    ],
                    experienceReward: 90
                },
                {
                    type: "石像鬼",
                    level: 4,
                    baseHp: 150,
                    baseDamage: 30,
                    defense: 20,
                    speed: 7,
                    description: "古老的石制守护者，防御力极强",
                    skills: ["石化凝视", "岩石投掷"],
                    dropTable: [
                        { item: "魔法石", chance: 0.5 },
                        { item: "坚硬石块", chance: 0.8 },
                        { item: "高级治疗药水", chance: 0.4 },
                        { item: "银币", chance: 0.7 }
                    ],
                    experienceReward: 100
                }
            ],

            // 5级敌人 - 高难度
            5: [
                {
                    type: "暗影刺客",
                    level: 5,
                    baseHp: 130,
                    baseDamage: 40,
                    defense: 15,
                    speed: 18,
                    description: "来无影去无踪的暗影杀手",
                    skills: ["暗影突袭", "毒刃", "隐身"],
                    dropTable: [
                        { item: "暗影匕首", chance: 0.4 },
                        { item: "隐身斗篷", chance: 0.2 },
                        { item: "毒药", chance: 0.5 },
                        { item: "金币", chance: 0.6 }
                    ],
                    experienceReward: 120
                },
                {
                    type: "火焰元素",
                    level: 5,
                    baseHp: 110,
                    baseDamage: 35,
                    defense: 8,
                    speed: 14,
                    description: "纯粹的火焰能量体，攻击带有灼烧效果",
                    skills: ["火焰爆发", "灼烧", "火墙"],
                    dropTable: [
                        { item: "火焰宝石", chance: 0.6 },
                        { item: "火抗药水", chance: 0.4 },
                        { item: "魔法卷轴", chance: 0.5 },
                        { item: "金币", chance: 0.7 }
                    ],
                    experienceReward: 130
                }
            ],

            // 6级敌人 - 精英级别
            6: [
                {
                    type: "兽人酋长",
                    level: 6,
                    baseHp: 200,
                    baseDamage: 45,
                    defense: 25,
                    speed: 10,
                    description: "部落的强大领袖，拥有丰富的战斗经验",
                    skills: ["战争咆哮", "重击", "召唤小弟"],
                    dropTable: [
                        { item: "酋长战斧", chance: 0.3 },
                        { item: "兽人护甲", chance: 0.4 },
                        { item: "力量药水", chance: 0.5 },
                        { item: "金币", chance: 0.9 }
                    ],
                    experienceReward: 160
                },
                {
                    type: "冰霜巨人",
                    level: 6,
                    baseHp: 250,
                    baseDamage: 50,
                    defense: 30,
                    speed: 5,
                    description: "来自极地的巨大生物，攻击带有冰冻效果",
                    skills: ["冰霜重击", "冰墙", "暴风雪"],
                    dropTable: [
                        { item: "冰霜之心", chance: 0.4 },
                        { item: "巨人之骨", chance: 0.6 },
                        { item: "冰抗药水", chance: 0.5 },
                        { item: "金币", chance: 0.8 }
                    ],
                    experienceReward: 180
                }
            ],

            // 7级敌人 - Boss级别
            7: [
                {
                    type: "黑暗骑士",
                    level: 7,
                    baseHp: 300,
                    baseDamage: 55,
                    defense: 35,
                    speed: 12,
                    description: "堕落的圣骑士，被黑暗力量腐蚀",
                    skills: ["黑暗斩击", "邪恶光环", "死亡骑术"],
                    dropTable: [
                        { item: "黑暗之剑", chance: 0.5 },
                        { item: "堕落铠甲", chance: 0.3 },
                        { item: "黑暗宝石", chance: 0.4 },
                        { item: "白金币", chance: 0.7 }
                    ],
                    experienceReward: 220
                },
                {
                    type: "古龙幼崽",
                    level: 7,
                    baseHp: 280,
                    baseDamage: 60,
                    defense: 25,
                    speed: 15,
                    description: "年幼的巨龙，已经展现出恐怖的力量",
                    skills: ["龙息", "龙爪撕裂", "龙威"],
                    dropTable: [
                        { item: "龙鳞", chance: 0.8 },
                        { item: "龙血", chance: 0.3 },
                        { item: "龙珠", chance: 0.1 },
                        { item: "白金币", chance: 0.9 }
                    ],
                    experienceReward: 250
                }
            ],

            // 8级敌人 - 传说级别
            8: [
                {
                    type: "巫妖王",
                    level: 8,
                    baseHp: 350,
                    baseDamage: 65,
                    defense: 30,
                    speed: 13,
                    description: "不死的法师之王，掌握着禁忌魔法",
                    skills: ["死亡法术", "亡灵召唤", "时间停止"],
                    dropTable: [
                        { item: "巫妖之杖", chance: 0.4 },
                        { item: "不死之书", chance: 0.2 },
                        { item: "灵魂宝石", chance: 0.5 },
                        { item: "秘银币", chance: 0.8 }
                    ],
                    experienceReward: 300
                },
                {
                    type: "泰坦守护者",
                    level: 8,
                    baseHp: 400,
                    baseDamage: 70,
                    defense: 40,
                    speed: 8,
                    description: "远古时代的巨大守护者，力量无穷",
                    skills: ["泰坦之拳", "大地震击", "神圣护盾"],
                    dropTable: [
                        { item: "泰坦之心", chance: 0.3 },
                        { item: "远古铠甲", chance: 0.4 },
                        { item: "神圣药水", chance: 0.6 },
                        { item: "秘银币", chance: 0.9 }
                    ],
                    experienceReward: 350
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

    // 创建敌人实例，添加随机变化
    createEnemyInstance(template) {
        const variance = 0.2; // 20%的属性变化
        
        return {
            ...template,
            hp: Math.floor(template.baseHp * (1 + (Math.random() - 0.5) * variance)),
            maxHp: Math.floor(template.baseHp * (1 + (Math.random() - 0.5) * variance)),
            damage: Math.floor(template.baseDamage * (1 + (Math.random() - 0.5) * variance)),
            // 保持原有属性
            defense: template.defense,
            speed: template.speed
        };
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
        return Math.max(1, Math.min(8, baseLevel + variance));
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