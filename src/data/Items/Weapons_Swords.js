// 剑类武器数据（单手剑、双手剑、匕首）
export const Weapons_Swords = {
    // ========== 单手剑 ==========
    // 1-20级
    '生锈短剑': {
        id: 'rusty_short_sword',
        name: '生锈短剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 1,
        description: '一把生锈的短剑，勉强能用',
        icon: './assets/icons/weapons/sword1.png',
        stats: {
            attack: 8,
            physicalPower: 10,
            weight: 4
        },
        requirements: { level: 1 },
        value: 15
    },
    
    '铁剑': {
        id: 'iron_sword',
        name: '铁剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 3,
        description: '普通的铁制长剑',
        icon: './assets/icons/weapons/sword1.png',
        stats: {
            attack: 12,
            physicalPower: 15,
            weight: 5
        },
        requirements: { level: 3 },
        value: 50
    },
    
    '锻铁剑': {
        id: 'forged_iron_sword',
        name: '锻铁剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 5,
        description: '经过锻造强化的铁剑',
        icon: './assets/icons/weapons/sword2.png',
        stats: {
            attack: 16,
            physicalPower: 19,
            weight: 5
        },
        requirements: { level: 5 },
        value: 90
    },
    
    '精铁剑': {
        id: 'refined_iron_sword',
        name: '精铁剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'uncommon',
        level: 6,
        description: '使用精炼铁材打造的优质剑',
        icon: './assets/icons/weapons/sword2.png',
        stats: {
            attack: 19,
            physicalPower: 22,
            weight: 5,
            criticalChance: 3
        },
        requirements: { level: 6 },
        value: 130
    },
    
    '钢剑': {
        id: 'steel_sword',
        name: '钢剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'uncommon',
        level: 8,
        description: '坚固的钢制长剑',
        icon: './assets/icons/weapons/sword2.png',
        stats: {
            attack: 24,
            physicalPower: 28,
            weight: 6,
            agility: 1,
            criticalChance: 3
        },
        requirements: { level: 8 },
        value: 200
    },
    
    '白银剑': {
        id: 'silver_sword',
        name: '白银剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'rare',
        level: 10,
        description: '用银制成的特殊武器，对不死族有奇效',
        icon: './assets/icons/weapons/sword3.png',
        stats: {
            attack: 30,
            physicalPower: 35,
            weight: 5,
            agility: 2,
            criticalChance: 5
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '不死族',
                value: 1.3,
                description: '对不死族伤害+30%'
            }
        ],
        requirements: { level: 10 },
        value: 380
    },
    
    '秘银剑': {
        id: 'mithril_sword',
        name: '秘银剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 18,
        description: '用传说中的秘银锻造的轻盈利剑',
        icon: './assets/icons/weapons/sword4.png',
        stats: {
            attack: 51,
            physicalPower: 56,
            weight: 5,
            agility: 3,
            criticalChance: 8
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalPower',
                value: 8,
                description: '物理强度+8'
            }
        ],
        requirements: { level: 18 },
        value: 1100
    },
    
    // 21-40级
    '龙鳞剑': {
        id: 'dragonscale_sword',
        name: '龙鳞剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'rare',
        level: 30,
        description: '剑柄镶嵌龙鳞的强力武器',
        icon: './assets/icons/weapons/sword4.png',
        stats: {
            attack: 88,
            physicalPower: 95,
            weight: 6,
            agility: 2,
            criticalChance: 7
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '龙族',
                value: 1.4,
                description: '对龙族伤害+40%'
            }
        ],
        requirements: { level: 30 },
        value: 3300
    },
    
    '圣银剑': {
        id: 'holy_silver_blade',
        name: '圣银剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 40,
        description: '经过圣光祝福的白银之剑，对邪恶生物有压倒性优势',
        icon: './assets/icons/weapons/sword5.png',
        stats: {
            attack: 135,
            physicalPower: 145,
            weight: 4,
            agility: 5,
            criticalChance: 14
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '邪恶',
                value: 1.5,
                description: '对邪恶生物伤害+50%'
            },
            {
                type: 'critical_damage_bonus',
                value: 1.35,
                description: '暴击伤害+35%'
            }
        ],
        requirements: { level: 40 },
        value: 9000
    },
    
    // 60级传说
    '神话之刃': {
        id: 'mythical_blade',
        name: '神话之刃',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 60,
        description: '传说中的神器，拥有毁灭性的力量',
        icon: './assets/icons/weapons/sword5.png',
        stats: {
            attack: 248,
            physicalPower: 267,
            weight: 4,
            agility: 6,
            criticalChance: 18
        },
        effects: [
            {
                type: 'critical_damage_bonus',
                value: 1.5,
                description: '暴击伤害+50%'
            },
            {
                type: 'stat_bonus',
                stat: 'physicalPower',
                value: 25,
                description: '物理强度+25'
            }
        ],
        requirements: { level: 60 },
        value: 35000
    },

    // ========== 双手剑 ==========
    // 5-30级
    '粗糙大剑': {
        id: 'crude_greatsword',
        name: '粗糙大剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'twoHandSword',
        weaponType: 'two-handed',
        rarity: 'common',
        level: 5,
        description: '粗制滥造的双手大剑',
        icon: './assets/icons/weapons/sword3.png',
        stats: {
            attack: 22,
            physicalPower: 20,
            weight: 11,
            agility: -2
        },
        requirements: { level: 5 },
        value: 95
    },
    
    '铁质巨剑': {
        id: 'iron_greatsword',
        name: '铁质巨剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'twoHandSword',
        weaponType: 'two-handed',
        rarity: 'common',
        level: 8,
        description: '沉重的铁制双手剑',
        icon: './assets/icons/weapons/sword3.png',
        stats: {
            attack: 30,
            physicalPower: 28,
            weight: 12,
            agility: -2,
            criticalChance: 2
        },
        requirements: { level: 8 },
        value: 185
    },
    
    '重剑': {
        id: 'heavy_sword',
        name: '重剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'twoHandSword',
        weaponType: 'two-handed',
        rarity: 'uncommon',
        level: 12,
        description: '需要双手持握的沉重巨剑',
        icon: './assets/icons/weapons/sword4.png',
        stats: {
            attack: 42,
            physicalPower: 40,
            weight: 13,
            agility: -2,
            criticalChance: 4
        },
        requirements: { level: 12 },
        value: 450
    },
    
    '钢制巨剑': {
        id: 'steel_greatsword',
        name: '钢制巨剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'twoHandSword',
        weaponType: 'two-handed',
        rarity: 'rare',
        level: 20,
        description: '用精钢锻造的强力巨剑',
        icon: './assets/icons/weapons/sword4.png',
        stats: {
            attack: 72,
            physicalPower: 70,
            weight: 15,
            agility: -3,
            criticalChance: 7
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalPower',
                value: 10,
                description: '物理强度+10'
            }
        ],
        requirements: { level: 20 },
        value: 1550
    },
    
    '符文巨剑': {
        id: 'runic_greatsword',
        name: '符文巨剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'twoHandSword',
        weaponType: 'two-handed',
        rarity: 'epic',
        level: 28,
        description: '刻有古老符文的巨大双手剑',
        icon: './assets/icons/weapons/sword5.png',
        stats: {
            attack: 106,
            physicalPower: 104,
            weight: 16,
            agility: -2,
            criticalChance: 11
        },
        effects: [
            {
                type: 'critical_damage_bonus',
                value: 1.35,
                description: '暴击伤害+35%'
            }
        ],
        requirements: { level: 28 },
        value: 3750
    },
    
    // 40-60级
    '烈焰巨剑': {
        id: 'flame_greatsword',
        name: '烈焰巨剑',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'twoHandSword',
        weaponType: 'two-handed',
        rarity: 'epic',
        level: 42,
        description: '燃烧着永恒火焰的巨剑',
        icon: './assets/icons/weapons/sword5.png',
        stats: {
            attack: 182,
            physicalPower: 180,
            weight: 15,
            agility: -2,
            criticalChance: 13
        },
        effects: [
            {
                type: 'dot_effect',
                dotType: 'burn',
                damage: 12,
                duration: 2,
                description: '攻击附加灼烧2回合(12伤害)'
            }
        ],
        requirements: { level: 42 },
        value: 12000
    },
    
    '神话之刃': {
        id: 'mythical_greatsword',
        name: '神话之刃',
        type: 'weapon',
        subType: 'sword',
        weaponCategory: 'sword',
        weaponSubCategory: 'twoHandSword',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 60,
        description: '传说中英雄使用的双手神剑',
        icon: './assets/icons/weapons/sword5.png',
        stats: {
            attack: 310,
            physicalPower: 308,
            weight: 13,
            agility: 0,
            criticalChance: 22
        },
        effects: [
            {
                type: 'critical_damage_bonus',
                value: 1.8,
                description: '暴击伤害×1.8'
            },
            {
                type: 'stat_bonus',
                stat: 'physicalPower',
                value: 35,
                description: '物理强度+35'
            },
            {
                type: 'damage_bonus',
                target: '全部',
                value: 1.15,
                description: '所有伤害+15%'
            }
        ],
        requirements: { level: 60 },
        value: 45000
    },

    // ========== 匕首 ==========
    // 1-20级
    '生锈小刀': {
        id: 'rusty_knife',
        name: '生锈小刀',
        type: 'weapon',
        subType: 'dagger',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 1,
        description: '一把生锈的小刀',
        icon: './assets/icons/weapons/dagger1.png',
        stats: {
            attack: 6,
            physicalPower: 8,
            weight: 2,
            agility: 3,
            criticalChance: 12
        },
        requirements: { level: 1 },
        value: 12
    },
    
    '铁匕首': {
        id: 'iron_dagger',
        name: '铁匕首',
        type: 'weapon',
        subType: 'dagger',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 3,
        description: '锋利的铁制匕首',
        icon: './assets/icons/weapons/dagger1.png',
        stats: {
            attack: 10,
            physicalPower: 12,
            weight: 2,
            agility: 4,
            criticalChance: 16
        },
        requirements: { level: 3 },
        value: 35
    },
    
    '锋利匕首': {
        id: 'sharp_dagger',
        name: '锋利匕首',
        type: 'weapon',
        subType: 'dagger',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'uncommon',
        level: 5,
        description: '经过精心打磨的锋利匕首',
        icon: './assets/icons/weapons/dagger2.png',
        stats: {
            attack: 14,
            physicalPower: 17,
            weight: 2,
            agility: 5,
            criticalChance: 20
        },
        requirements: { level: 5 },
        value: 75
    },
    
    '毒刃': {
        id: 'poison_blade',
        name: '毒刃',
        type: 'weapon',
        subType: 'dagger',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'rare',
        level: 10,
        description: '淬毒的致命匕首',
        icon: './assets/icons/weapons/dagger3.png',
        stats: {
            attack: 25,
            physicalPower: 30,
            weight: 2,
            agility: 6,
            criticalChance: 28
        },
        effects: [
            {
                type: 'dot_effect',
                dotType: 'poison',
                damage: 8,
                duration: 2,
                chance: 0.4,
                description: '攻击有40%几率中毒2回合'
            }
        ],
        requirements: { level: 10 },
        value: 350
    },
    
    '暗影刃': {
        id: 'shadow_blade',
        name: '暗影刃',
        type: 'weapon',
        subType: 'dagger',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'rare',
        level: 16,
        description: '藏于暗影中的刺客之刃',
        icon: './assets/icons/weapons/dagger4.png',
        stats: {
            attack: 38,
            physicalPower: 43,
            weight: 2,
            agility: 7,
            criticalChance: 30
        },
        effects: [
            {
                type: 'evasion_bonus',
                value: 0.06,
                description: '闪避率+6%'
            }
        ],
        requirements: { level: 16 },
        value: 850
    },
    
    '秘银匕首': {
        id: 'mithril_dagger',
        name: '秘银匕首',
        type: 'weapon',
        subType: 'dagger',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 18,
        description: '轻若无物的秘银匕首',
        icon: './assets/icons/weapons/dagger5.png',
        stats: {
            attack: 44,
            physicalPower: 49,
            weight: 1,
            agility: 8,
            criticalChance: 34
        },
        effects: [
            {
                type: 'penetration',
                physical: 15,
                description: '暴击时无视目标15%物理抗性'
            }
        ],
        requirements: { level: 18 },
        value: 1200
    },
    
    // 21-40级
    '致命之刃': {
        id: 'lethal_blade',
        name: '致命之刃',
        type: 'weapon',
        subType: 'dagger',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 30,
        description: '专为刺杀设计的完美武器',
        icon: './assets/icons/weapons/dagger5.png',
        stats: {
            attack: 82,
            physicalPower: 89,
            weight: 2,
            agility: 10,
            criticalChance: 42
        },
        effects: [
            {
                type: 'critical_damage_bonus',
                value: 1.38,
                description: '暴击伤害+38%'
            }
        ],
        requirements: { level: 30 },
        value: 4750
    },
    
    '影舞之刃': {
        id: 'shadowdance_blade',
        name: '影舞之刃',
        type: 'weapon',
        subType: 'dagger',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 40,
        description: '传说中的刺客神器，如同影子般优雅致命',
        icon: './assets/icons/weapons/dagger5.png',
        stats: {
            attack: 127,
            physicalPower: 137,
            weight: 1,
            agility: 14,
            criticalChance: 50
        },
        effects: [
            {
                type: 'evasion_bonus',
                value: 0.12,
                description: '闪避率+12%'
            },
            {
                type: 'stat_bonus',
                stat: 'criticalChance',
                value: 10,
                description: '暴击率+10%'
            },
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 5,
                description: '敏捷+5'
            }
        ],
        requirements: { level: 40 },
        value: 14500
    },
    
    // 60级传说
    '死神之牙': {
        id: 'reapers_fang',
        name: '死神之牙',
        type: 'weapon',
        subType: 'dagger',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 60,
        description: '死神的獠牙，收割生命的终极武器',
        icon: './assets/icons/weapons/dagger5.png',
        stats: {
            attack: 238,
            physicalPower: 256,
            weight: 1,
            agility: 17,
            criticalChance: 58
        },
        effects: [
            {
                type: 'execute',
                threshold: 0.35,
                description: '攻击低于35%HP目标直接击杀'
            },
            {
                type: 'critical_damage_bonus',
                value: 2.0,
                description: '暴击伤害×2.0'
            }
        ],
        requirements: { level: 60 },
        value: 58000
    }
};