// 弓类武器数据（短弓、长弓）
export const Weapons_Bows = {
    // ========== 短弓 ==========
    // 1-20级
    '简易短弓': {
        id: 'simple_shortbow',
        name: '简易短弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'shortBow',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 1,
        description: '简陋的木制短弓',
        icon: './assets/icons/weapons/bow1.png',
        stats: {
            attack: 8,
            physicalPower: 8,
            weight: 3,
            agility: 2,
            criticalChance: 8
        },
        requirements: { level: 1 },
        value: 20
    },
    
    '猎弓': {
        id: 'hunting_bow',
        name: '猎弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'shortBow',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 4,
        description: '猎人常用的短弓',
        icon: './assets/icons/weapons/bow1.png',
        stats: {
            attack: 14,
            physicalPower: 14,
            weight: 3,
            agility: 2,
            criticalChance: 10
        },
        requirements: { level: 4 },
        value: 70
    },
    
    '精制短弓': {
        id: 'refined_shortbow',
        name: '精制短弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'shortBow',
        weaponType: 'one-handed',
        rarity: 'uncommon',
        level: 10,
        description: '工艺精湛的短弓',
        icon: './assets/icons/weapons/bow2.png',
        stats: {
            attack: 28,
            physicalPower: 28,
            weight: 4,
            agility: 3,
            criticalChance: 16
        },
        requirements: { level: 10 },
        value: 350
    },
    
    '复合短弓': {
        id: 'composite_shortbow',
        name: '复合短弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'shortBow',
        weaponType: 'one-handed',
        rarity: 'rare',
        level: 16,
        description: '使用复合材料制成的强力短弓',
        icon: './assets/icons/weapons/bow2.png',
        stats: {
            attack: 45,
            physicalPower: 45,
            weight: 4,
            agility: 5,
            criticalChance: 23
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 2,
                description: '敏捷+2'
            }
        ],
        requirements: { level: 16 },
        value: 950
    },
    
    '秘银短弓': {
        id: 'mithril_shortbow',
        name: '秘银短弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'shortBow',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 18,
        description: '用秘银制作的轻便短弓',
        icon: './assets/icons/weapons/bow3.png',
        stats: {
            attack: 51,
            physicalPower: 51,
            weight: 3,
            agility: 6,
            criticalChance: 27
        },
        effects: [
            {
                type: 'attack_speed',
                value: 0.18,
                description: '攻击速度+18%'
            }
        ],
        requirements: { level: 18 },
        value: 1300
    },
    
    // 21-40级
    '精灵短弓': {
        id: 'elven_shortbow',
        name: '精灵短弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'shortBow',
        weaponType: 'one-handed',
        rarity: 'rare',
        level: 26,
        description: '精灵工匠制作的精美短弓',
        icon: './assets/icons/weapons/bow3.png',
        stats: {
            attack: 74,
            physicalPower: 74,
            weight: 3,
            agility: 7,
            criticalChance: 30
        },
        effects: [
            {
                type: 'hit_bonus',
                value: 0.07,
                description: '命中率+7%'
            }
        ],
        requirements: { level: 26 },
        value: 3000
    },
    
    '烈风短弓': {
        id: 'gale_shortbow',
        name: '烈风短弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'shortBow',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 32,
        description: '如狂风般迅捷的短弓',
        icon: './assets/icons/weapons/bow3.png',
        stats: {
            attack: 96,
            physicalPower: 96,
            weight: 2,
            agility: 9,
            criticalChance: 37
        },
        effects: [
            {
                type: 'attack_speed',
                value: 0.25,
                description: '攻击速度+25%'
            },
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 4,
                description: '敏捷+4'
            }
        ],
        requirements: { level: 32 },
        value: 5500
    },
    
    '神速之弓': {
        id: 'swiftwind_bow',
        name: '神速之弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'shortBow',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 40,
        description: '快到看不见箭矢的传说之弓',
        icon: './assets/icons/weapons/bow4.png',
        stats: {
            attack: 142,
            physicalPower: 142,
            weight: 2,
            agility: 13,
            criticalChance: 47
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 6,
                description: '敏捷+6'
            },
            {
                type: 'first_strike',
                description: '必定先手'
            },
            {
                type: 'critical_damage_bonus',
                value: 1.48,
                description: '暴击伤害+48%'
            }
        ],
        requirements: { level: 40 },
        value: 14000
    },
    
    // 60级传说
    '风暴之弓': {
        id: 'stormwind_bow',
        name: '风暴之弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'shortBow',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 60,
        description: '驾驭风暴之力的神弓',
        icon: './assets/icons/weapons/bow4.png',
        stats: {
            attack: 283,
            physicalPower: 283,
            weight: 1,
            agility: 18,
            criticalChance: 58
        },
        effects: [
            {
                type: 'attack_speed',
                value: 0.4,
                description: '攻击速度+40%'
            },
            {
                type: 'evasion_bonus',
                value: 0.12,
                description: '闪避率+12%'
            },
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 8,
                description: '敏捷+8'
            }
        ],
        requirements: { level: 60 },
        value: 62000
    },

    // ========== 长弓 ==========
    // 5-30级
    '长弓': {
        id: 'longbow',
        name: '长弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'longBow',
        weaponType: 'two-handed',
        rarity: 'common',
        level: 5,
        description: '标准的长弓',
        icon: './assets/icons/weapons/bow1.png',
        stats: {
            attack: 18,
            physicalPower: 16,
            weight: 5,
            agility: 2,
            criticalChance: 10
        },
        requirements: { level: 5 },
        value: 90
    },
    
    '战弓': {
        id: 'war_bow',
        name: '战弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'longBow',
        weaponType: 'two-handed',
        rarity: 'common',
        level: 8,
        description: '军队使用的战斗长弓',
        icon: './assets/icons/weapons/bow1.png',
        stats: {
            attack: 26,
            physicalPower: 24,
            weight: 5,
            agility: 3,
            criticalChance: 12
        },
        requirements: { level: 8 },
        value: 180
    },
    
    '复合弓': {
        id: 'composite_longbow',
        name: '复合弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'longBow',
        weaponType: 'two-handed',
        rarity: 'uncommon',
        level: 16,
        description: '使用复合材料增强威力的长弓',
        icon: './assets/icons/weapons/bow2.png',
        stats: {
            attack: 52,
            physicalPower: 50,
            weight: 6,
            agility: 4,
            criticalChance: 19
        },
        effects: [
            {
                type: 'hit_bonus',
                value: 0.06,
                description: '命中率+6%'
            }
        ],
        requirements: { level: 16 },
        value: 850
    },
    
    '精灵战弓': {
        id: 'elven_war_bow',
        name: '精灵战弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'longBow',
        weaponType: 'two-handed',
        rarity: 'rare',
        level: 20,
        description: '精灵战士使用的优雅长弓',
        icon: './assets/icons/weapons/bow2.png',
        stats: {
            attack: 68,
            physicalPower: 66,
            weight: 5,
            agility: 5,
            criticalChance: 24
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 3,
                description: '敏捷+3'
            },
            {
                type: 'hit_bonus',
                value: 0.08,
                description: '命中率+8%'
            }
        ],
        requirements: { level: 20 },
        value: 1550
    },
    
    '龙筋弓': {
        id: 'dragon_sinew_bow',
        name: '龙筋弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'longBow',
        weaponType: 'two-handed',
        rarity: 'epic',
        level: 28,
        description: '使用巨龙筋腱制成的强弓',
        icon: './assets/icons/weapons/bow3.png',
        stats: {
            attack: 102,
            physicalPower: 100,
            weight: 6,
            agility: 6,
            criticalChance: 32
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '龙族',
                value: 1.52,
                description: '对龙族+52%伤害'
            }
        ],
        requirements: { level: 28 },
        value: 3750
    },
    
    // 40-60级
    '破甲战弓': {
        id: 'armor_piercing_bow',
        name: '破甲战弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'longBow',
        weaponType: 'two-handed',
        rarity: 'epic',
        level: 42,
        description: '能穿透厚重护甲的强力战弓',
        icon: './assets/icons/weapons/bow3.png',
        stats: {
            attack: 188,
            physicalPower: 186,
            weight: 5,
            agility: 8,
            criticalChance: 42
        },
        effects: [
            {
                type: 'penetration',
                physical: 18,
                description: '无视18%物理抗性'
            }
        ],
        requirements: { level: 42 },
        value: 13000
    },
    
    '神射手之弓': {
        id: 'marksman_bow',
        name: '神射手之弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'longBow',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 60,
        description: '传说中百步穿杨的神弓',
        icon: './assets/icons/weapons/bow4.png',
        stats: {
            attack: 350,
            physicalPower: 348,
            weight: 4,
            agility: 13,
            criticalChance: 58
        },
        effects: [
            {
                type: 'hit_bonus',
                value: 0.15,
                description: '命中率+15%'
            },
            {
                type: 'critical_damage_bonus',
                value: 2.0,
                description: '暴击伤害×2.0'
            },
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 7,
                description: '敏捷+7'
            }
        ],
        requirements: { level: 60 },
        value: 52000
    },
    
    // 80级传说
    '审判之弓': {
        id: 'judgment_bow',
        name: '审判之弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'longBow',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 80,
        description: '审判罪恶的神圣之弓',
        icon: './assets/icons/weapons/bow4.png',
        stats: {
            attack: 665,
            physicalPower: 663,
            weight: 3,
            agility: 19,
            criticalChance: 76
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'criticalChance',
                value: 15,
                description: '暴击率+15%'
            },
            {
                type: 'penetration',
                physical: 38,
                description: '无视38%物理抗性'
            },
            {
                type: 'hit_bonus',
                value: 0.18,
                description: '命中率+18%'
            }
        ],
        requirements: { level: 80 },
        value: 168000
    },
    
    // 100级传说
    '弑神之弓': {
        id: 'god_slayer_bow',
        name: '弑神之弓',
        type: 'weapon',
        subType: 'bow',
        weaponCategory: 'bow',
        weaponSubCategory: 'longBow',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 100,
        description: '射落神明的终极之弓',
        icon: './assets/icons/weapons/bow4.png',
        stats: {
            attack: 1350,
            physicalPower: 1350,
            weight: 2,
            agility: 35,
            criticalChance: 95
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'all',
                value: 170,
                description: '全属性+170'
            },
            {
                type: 'guaranteed_hit',
                description: '暴击必定命中'
            },
            {
                type: 'penetration',
                physical: 50,
                description: '无视50%物理抗性'
            }
        ],
        requirements: { level: 100 },
        value: 1450000
    }
};