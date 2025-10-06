/**
 * 机制测试装备
 * 所有装备等级要求为1级，用于快速测试各种战斗机制
 */

const TestEquipmentArray = [
    // ========== 武器测试装备 ==========
    
    // 测试：DOT效果 - 中毒
    {
        id: 'test_poison_dagger',
        name: '[测试]中毒匕首',
        type: 'weapon',
        subType: 'weapon1',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】100%几率触发中毒，持续5回合，每回合20伤害',
        icon: 'assets/icons/weapons/dagger5.png',
        stats: {
            attack: 30,
            physicalPower: 50,
            criticalChance: 15
        },
        effects: [
            {
                type: 'dot_effect',
                dotType: 'poison',
                damage: 20,
                duration: 5,
                triggerChance: 1.0,
                description: '攻击100%几率中毒5回合(20伤害/回合)'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：DOT效果 - 灼烧
    {
        id: 'test_fire_sword',
        name: '[测试]灼烧剑',
        type: 'weapon',
        subType: 'weapon1',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】100%几率触发灼烧，持续4回合，每回合25伤害',
        icon: 'assets/icons/weapons/sword5.png',
        stats: {
            attack: 35,
            physicalPower: 60
        },
        effects: [
            {
                type: 'dot_effect',
                dotType: 'burn',
                damage: 25,
                duration: 4,
                triggerChance: 1.0,
                description: '攻击100%几率灼烧4回合(25伤害/回合)'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：DOT效果 - 流血
    {
        id: 'test_bleed_axe',
        name: '[测试]流血斧',
        type: 'weapon',
        subType: 'weapon1',
        weaponCategory: 'axe',
        weaponSubCategory: 'oneHandAxe',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】100%几率触发流血，持续6回合，每回合15伤害',
        icon: 'assets/icons/weapons/axe4.png',
        stats: {
            attack: 40,
            physicalPower: 70
        },
        effects: [
            {
                type: 'dot_effect',
                dotType: 'bleed',
                damage: 15,
                duration: 6,
                triggerChance: 1.0,
                description: '攻击100%几率流血6回合(15伤害/回合)'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：破甲
    {
        id: 'test_penetration_bow',
        name: '[测试]破甲弓',
        type: 'weapon',
        subType: 'weapon1',
        weaponCategory: 'bow',
        weaponSubCategory: 'longBow',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】无视50%物理抗性（上限）',
        icon: 'assets/icons/weapons/bow4.png',
        stats: {
            attack: 45,
            physicalPower: 80,
            agility: 10
        },
        effects: [
            {
                type: 'penetration',
                physical: 50,
                description: '无视目标50%物理抗性'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：闪避加成
    {
        id: 'test_evasion_dagger',
        name: '[测试]闪避匕首',
        type: 'weapon',
        subType: 'weapon1',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】闪避率+20%',
        icon: 'assets/icons/weapons/dagger4.png',
        stats: {
            attack: 25,
            physicalPower: 40,
            agility: 15,
            weight: -3
        },
        effects: [
            {
                type: 'evasion_bonus',
                value: 20,
                description: '闪避率+20%'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：斩杀
    {
        id: 'test_execute_scythe',
        name: '[测试]斩杀镰刀',
        type: 'weapon',
        subType: 'weapon1',
        weaponCategory: 'axe',
        weaponSubCategory: 'scythe',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】目标HP<50%时直接击杀',
        icon: 'assets/icons/weapons/scythe2.png',
        stats: {
            attack: 50,
            physicalPower: 90,
            criticalChance: 25
        },
        effects: [
            {
                type: 'execute',
                threshold: 0.5,
                description: '目标HP低于50%时直接击杀'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：吸血
    {
        id: 'test_lifesteal_sword',
        name: '[测试]吸血剑',
        type: 'weapon',
        subType: 'weapon1',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】吸取50%伤害作为生命值（上限）',
        icon: 'assets/icons/weapons/sword4.png',
        stats: {
            attack: 38,
            physicalPower: 65
        },
        effects: [
            {
                type: 'lifesteal',
                percent: 0.5,
                description: '吸取造成伤害的50%作为生命值'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：暴击伤害加成
    {
        id: 'test_crit_damage_dagger',
        name: '[测试]暴击匕首',
        type: 'weapon',
        subType: 'weapon1',
        weaponCategory: 'sword',
        weaponSubCategory: 'dagger',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】高暴击率+高暴击伤害',
        icon: 'assets/icons/weapons/dagger3.png',
        stats: {
            attack: 32,
            physicalPower: 55,
            criticalChance: 50
        },
        effects: [
            {
                type: 'critical_damage_bonus',
                value: 2.0,
                description: '暴击伤害提升100%（3倍伤害）'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：对特定目标伤害加成
    {
        id: 'test_damage_bonus_hammer',
        name: '[测试]伤害加成锤',
        type: 'weapon',
        subType: 'weapon1',
        weaponCategory: 'hammer',
        weaponSubCategory: 'oneHandHammer',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】对不死族伤害+200%',
        icon: 'assets/icons/weapons/hammer2.png',
        stats: {
            attack: 42,
            physicalPower: 75
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '不死族',
                value: 3.0,
                description: '对不死族伤害提升200%'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：法术消耗减少
    {
        id: 'test_spell_cost_staff',
        name: '[测试]法术消耗法杖',
        type: 'weapon',
        subType: 'weapon1',
        weaponCategory: 'staff',
        weaponSubCategory: 'staff',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】所有法术消耗-50%',
        icon: 'assets/icons/weapons/staff3.png',
        stats: {
            attack: 20,
            magicPower: 100,
            maxMana: 80
        },
        effects: [
            {
                type: 'spell_cost_reduction',
                value: 0.5,
                description: '所有法术消耗减少50%'
            },
            {
                type: 'mana_regeneration',
                value: 15,
                description: '每回合恢复15点法力值'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // ========== 盾牌测试装备 ==========

    // 测试：格挡
    {
        id: 'test_block_shield',
        name: '[测试]格挡盾',
        type: 'weapon',
        subType: 'weapon2',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】格挡率75%（上限）',
        icon: '🛡️',
        stats: {
            physicalResistance: 15,
            magicResistance: 10,
            maxHp: 80,
            weight: 8
        },
        effects: [
            {
                type: 'block_chance',
                value: 75,
                description: '格挡率75%（上限）'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：全抗性
    {
        id: 'test_all_resistance_shield',
        name: '[测试]全抗盾',
        type: 'weapon',
        subType: 'weapon2',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】物抗和魔抗+25%',
        icon: '🛡️',
        stats: {
            maxHp: 100,
            weight: 6
        },
        effects: [
            {
                type: 'all_resistance',
                value: 25,
                description: '物理和魔法抗性+25%'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // ========== 防具测试装备 ==========

    // 测试：HP回复
    {
        id: 'test_hp_regen_chest',
        name: '[测试]HP回复胸甲',
        type: 'armor',
        subType: 'chest',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】每回合恢复30点HP',
        icon: 'assets/icons/armors/chest_superior_plate.png',
        stats: {
            maxHp: 150,
            physicalResistance: 12,
            weight: 10
        },
        effects: [
            {
                type: 'hp_regeneration',
                value: 30,
                description: '每回合恢复30点生命值'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：伤害减免
    {
        id: 'test_damage_reduction_helmet',
        name: '[测试]伤害减免头盔',
        type: 'armor',
        subType: 'helmet',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】受到伤害-30%',
        icon: 'assets/icons/armors/helmet_full_knight_plate.png',
        stats: {
            maxHp: 80,
            physicalResistance: 8,
            magicResistance: 8,
            weight: 5
        },
        effects: [
            {
                type: 'damage_reduction',
                value: 0.3,
                description: '受到的所有伤害减少30%'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：MP回复
    {
        id: 'test_mana_regen_legs',
        name: '[测试]MP回复护腿',
        type: 'armor',
        subType: 'legs',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】每回合恢复20点MP',
        icon: 'assets/icons/armors/legs_cloth_pants.png',
        stats: {
            maxMana: 100,
            magicResistance: 10,
            weight: 2
        },
        effects: [
            {
                type: 'mana_regeneration',
                value: 20,
                description: '每回合恢复20点法力值'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：SP回复
    {
        id: 'test_stamina_regen_boots',
        name: '[测试]SP回复靴子',
        type: 'armor',
        subType: 'boots',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】每回合恢复20点SP',
        icon: 'assets/icons/armors/boots_plate.png',
        stats: {
            maxStamina: 100,
            agility: 8,
            weight: 3
        },
        effects: [
            {
                type: 'stamina_regeneration',
                value: 20,
                description: '每回合恢复20点耐力值'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：元素抗性
    {
        id: 'test_fire_resistance_chest',
        name: '[测试]元素抗性胸甲',
        type: 'armor',
        subType: 'chest',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】火焰伤害-80%',
        icon: 'assets/icons/armors/chest_superior_chainmail.png',
        stats: {
            maxHp: 100,
            physicalResistance: 10,
            weight: 8
        },
        effects: [
            {
                type: 'elemental_resistance',
                element: 'fire',
                value: 0.8,
                description: '火焰伤害减少80%'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // ========== 饰品测试装备 ==========

    // 测试：技能消耗减少
    {
        id: 'test_skill_cost_ring',
        name: '[测试]技能消耗戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】所有技能消耗-50%',
        icon: 'assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            maxStamina: 80,
            agility: 10
        },
        effects: [
            {
                type: 'skill_cost_reduction',
                value: 0.5,
                description: '所有技能消耗减少50%'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：属性加成
    {
        id: 'test_stat_bonus_amulet',
        name: '[测试]属性加成护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】所有核心属性大幅提升',
        icon: 'assets/icons/ringtiles/amulet_arcane.png',
        stats: {
            attack: 20,
            physicalPower: 30,
            magicPower: 30
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'maxHp',
                value: 200,
                description: '最大HP+200'
            },
            {
                type: 'stat_bonus',
                stat: 'maxMana',
                value: 100,
                description: '最大法力+100'
            },
            {
                type: 'stat_bonus',
                stat: 'maxStamina',
                value: 100,
                description: '最大耐力+100'
            },
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 20,
                description: '敏捷+20'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：元素附加伤害
    {
        id: 'test_elemental_damage_ring',
        name: '[测试]元素伤害戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】附加50点火焰伤害',
        icon: 'assets/icons/ringtiles/ring_silver_adventurer.png',
        stats: {
            attack: 15,
            magicPower: 25
        },
        effects: [
            {
                type: 'elemental_damage',
                element: 'fire',
                value: 50,
                description: '附加50点火焰伤害'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // ========== 组合测试装备 ==========

    // 测试：多重效果组合 - 终极武器
    {
        id: 'test_ultimate_weapon',
        name: '[测试]组合武器',
        type: 'weapon',
        subType: 'weapon1',
        weaponCategory: 'sword',
        weaponSubCategory: 'oneHandSword',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】集成多种效果的终极测试武器',
        icon: 'assets/icons/weapons/sword5.png',
        stats: {
            attack: 50,
            physicalPower: 100,
            magicPower: 50,
            criticalChance: 30,
            agility: 15,
            weight: -2
        },
        effects: [
            {
                type: 'lifesteal',
                percent: 0.3,
                description: '吸取30%伤害作为生命值'
            },
            {
                type: 'penetration',
                physical: 30,
                magic: 30,
                description: '无视目标30%物理和魔法抗性'
            },
            {
                type: 'critical_damage_bonus',
                value: 1.5,
                description: '暴击伤害提升50%'
            },
            {
                type: 'dot_effect',
                dotType: 'burn',
                damage: 15,
                duration: 3,
                triggerChance: 0.5,
                description: '50%几率灼烧3回合'
            },
            {
                type: 'execute',
                threshold: 0.2,
                description: '目标HP<20%时直接击杀'
            }
        ],
        requirements: { level: 1 },
        value: 1
    },

    // 测试：多重效果组合 - 终极防御
    {
        id: 'test_ultimate_armor',
        name: '[测试]组合铠甲',
        type: 'armor',
        subType: 'chest',
        rarity: 'legendary',
        level: 1,
        description: '【机制测试】集成多种防御效果的终极铠甲',
        icon: 'assets/icons/armors/chest_superior_plate.png',
        stats: {
            maxHp: 300,
            maxMana: 100,
            maxStamina: 100,
            physicalResistance: 20,
            magicResistance: 20,
            weight: 12
        },
        effects: [
            {
                type: 'hp_regeneration',
                value: 20,
                description: '每回合恢复20点生命值'
            },
            {
                type: 'mana_regeneration',
                value: 10,
                description: '每回合恢复10点法力值'
            },
            {
                type: 'stamina_regeneration',
                value: 10,
                description: '每回合恢复10点耐力值'
            },
            {
                type: 'damage_reduction',
                value: 0.25,
                description: '受到伤害减少25%'
            },
            {
                type: 'elemental_resistance',
                element: 'fire',
                value: 0.5,
                description: '火焰伤害减少50%'
            }
        ],
        requirements: { level: 1 },
        value: 1
    }
];

// 转换为对象格式（以name为key）
export const TestEquipment = TestEquipmentArray.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
}, {});