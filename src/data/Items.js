// data/Items.js - 物品和装备数据库
class ItemsDB {
    constructor() {
        this.items = this.initializeItems();
        this.equipment = this.initializeEquipment();
    }

    initializeItems() {
        return {
            // 消耗品 - 治疗药水系列
            '小瓶治疗药水': {
                id: 'healing_potion_small',
                name: '小瓶治疗药水',
                type: 'consumable',
                subType: 'healing',
                description: '恢复30点生命值的小瓶药水',
                effect: { type: 'heal', value: 30 },
                rarity: 'common',
                icon: './assets/icons/potion/potion_healing_small.png',
                stackable: true,
                maxStack: 99,
                value: 15
            },
            '中瓶治疗药水': {
                id: 'healing_potion_medium',
                name: '中瓶治疗药水',
                type: 'consumable',
                subType: 'healing',
                description: '恢复60点生命值的中瓶药水',
                effect: { type: 'heal', value: 60 },
                rarity: 'common',
                icon: './assets/icons/potion/potion_healing_medium.png',
                stackable: true,
                maxStack: 99,
                value: 30
            },
            '大瓶治疗药水': {
                id: 'healing_potion_large',
                name: '大瓶治疗药水',
                type: 'consumable',
                subType: 'healing',
                description: '恢复100点生命值的大瓶药水',
                effect: { type: 'heal', value: 100 },
                rarity: 'uncommon',
                icon: './assets/icons/potion/potion_healing_large.png',
                stackable: true,
                maxStack: 99,
                value: 60
            },
            '特大瓶治疗药水': {
                id: 'healing_potion_extra_large',
                name: '特大瓶治疗药水',
                type: 'consumable',
                subType: 'healing',
                description: '恢复200点生命值的特大瓶药水',
                effect: { type: 'heal', value: 200 },
                rarity: 'rare',
                icon: './assets/icons/potion/potion_healing_extra_large.png',
                stackable: true,
                maxStack: 50,
                value: 120
            },

            // 消耗品 - 法力药水系列
            '小瓶法力药水': {
                id: 'mana_potion_small',
                name: '小瓶法力药水',
                type: 'consumable',
                subType: 'mana',
                description: '恢复20点法力值的小瓶蓝色药水',
                effect: { type: 'restore_mana', value: 20 },
                rarity: 'common',
                icon: './assets/icons/potion/potion_mana_small.png',
                stackable: true,
                maxStack: 99,
                value: 12
            },
            '中瓶法力药水': {
                id: 'mana_potion_medium',
                name: '中瓶法力药水',
                type: 'consumable',
                subType: 'mana',
                description: '恢复40点法力值的中瓶蓝色药水',
                effect: { type: 'restore_mana', value: 40 },
                rarity: 'common',
                icon: './assets/icons/potion/potion_mana_medium.png',
                stackable: true,
                maxStack: 99,
                value: 25
            },
            '大瓶法力药水': {
                id: 'mana_potion_large',
                name: '大瓶法力药水',
                type: 'consumable',
                subType: 'mana',
                description: '恢复80点法力值的大瓶蓝色药水',
                effect: { type: 'restore_mana', value: 80 },
                rarity: 'uncommon',
                icon: './assets/icons/potion/potion_mana_large.png',
                stackable: true,
                maxStack: 99,
                value: 50
            },
            '特大瓶法力药水': {
                id: 'mana_potion_extra_large',
                name: '特大瓶法力药水',
                type: 'consumable',
                subType: 'mana',
                description: '恢复150点法力值的特大瓶蓝色药水',
                effect: { type: 'restore_mana', value: 150 },
                rarity: 'rare',
                icon: './assets/icons/potion/potion_mana_extra_large.png',
                stackable: true,
                maxStack: 50,
                value: 100
            },

            // 消耗品 - 耐力药水系列
            '小瓶耐力药水': {
                id: 'stamina_potion_small',
                name: '小瓶耐力药水',
                type: 'consumable',
                subType: 'stamina',
                description: '恢复15点耐力值的小瓶绿色药水',
                effect: { type: 'restore_stamina', value: 15 },
                rarity: 'common',
                icon: './assets/icons/potion/potion_stamina_small.png',
                stackable: true,
                maxStack: 99,
                value: 10
            },
            '中瓶耐力药水': {
                id: 'stamina_potion_medium',
                name: '中瓶耐力药水',
                type: 'consumable',
                subType: 'stamina',
                description: '恢复30点耐力值的中瓶绿色药水',
                effect: { type: 'restore_stamina', value: 30 },
                rarity: 'common',
                icon: './assets/icons/potion/potion_stamina_medium.png',
                stackable: true,
                maxStack: 99,
                value: 20
            },
            '大瓶耐力药水': {
                id: 'stamina_potion_large',
                name: '大瓶耐力药水',
                type: 'consumable',
                subType: 'stamina',
                description: '恢复60点耐力值的大瓶绿色药水',
                effect: { type: 'restore_stamina', value: 60 },
                rarity: 'uncommon',
                icon: './assets/icons/potion/potion_stamina_large.png',
                stackable: true,
                maxStack: 99,
                value: 40
            },
            '特大瓶耐力药水': {
                id: 'stamina_potion_extra_large',
                name: '特大瓶耐力药水',
                type: 'consumable',
                subType: 'stamina',
                description: '恢复120点耐力值的特大瓶绿色药水',
                effect: { type: 'restore_stamina', value: 120 },
                rarity: 'rare',
                icon: './assets/icons/potion/potion_stamina_extra_large.png',
                stackable: true,
                maxStack: 50,
                value: 80
            },

            // 消耗品 - 增益药水
            '力量药水': {
                id: 'strength_potion',
                name: '力量药水',
                type: 'consumable',
                subType: 'buff',
                description: '临时增加12点攻击力，持续5回合',
                effect: { 
                    type: 'temp_buff', 
                    stats: { attack: 12 },
                    duration: 5 
                },
                rarity: 'uncommon',
                icon: './assets/icons/potion/potion_strength.png',
                stackable: true,
                maxStack: 20,
                value: 60
            },
            '防御药水': {
                id: 'defense_potion',
                name: '防御药水',
                type: 'consumable',
                subType: 'buff',
                description: '临时增加10点防御力，持续5回合',
                effect: { 
                    type: 'temp_buff', 
                    stats: { defense: 10 },
                    duration: 5 
                },
                rarity: 'uncommon',
                icon: './assets/icons/potion/potion_defense.png',
                stackable: true,
                maxStack: 20,
                value: 55
            },
            '速度药水': {
                id: 'speed_potion',
                name: '速度药水',
                type: 'consumable',
                subType: 'buff',
                description: '临时增加3点速度，持续8回合',
                effect: { 
                    type: 'temp_buff', 
                    stats: { speed: 3 },
                    duration: 8 
                },
                rarity: 'uncommon',
                icon: './assets/icons/potion/potion_speed.png',
                stackable: true,
                maxStack: 20,
                value: 45
            },
            '暴击药水': {
                id: 'critical_potion',
                name: '暴击药水',
                type: 'consumable',
                subType: 'buff',
                description: '临时增加15%暴击率，持续6回合',
                effect: { 
                    type: 'temp_buff', 
                    stats: { criticalChance: 15 },
                    duration: 6 
                },
                rarity: 'rare',
                icon: './assets/icons/potion/potion_critical.png',
                stackable: true,
                maxStack: 15,
                value: 80
            },
            '物理强化药水': {
                id: 'physical_boost_potion',
                name: '物理强化药水',
                type: 'consumable',
                subType: 'buff',
                description: '临时增加15点物理强度，持续4回合',
                effect: { 
                    type: 'temp_buff', 
                    stats: { physicalPower: 15 },
                    duration: 4 
                },
                rarity: 'rare',
                icon: './assets/icons/potion/potion_physical_boost.png',
                stackable: true,
                maxStack: 15,
                value: 90
            },
            '魔法强化药水': {
                id: 'magic_boost_potion',
                name: '魔法强化药水',
                type: 'consumable',
                subType: 'buff',
                description: '临时增加18点魔法强度，持续4回合',
                effect: { 
                    type: 'temp_buff', 
                    stats: { magicPower: 18 },
                    duration: 4 
                },
                rarity: 'rare',
                icon: './assets/icons/potion/potion_magic_boost.png',
                stackable: true,
                maxStack: 15,
                value: 95
            },

            // 消耗品 - 特殊药水
            '魅惑药水': {
                id: 'charm_potion',
                name: '魅惑药水',
                type: 'consumable',
                subType: 'special',
                description: '有几率让敌人暂时成为盟友',
                effect: { 
                    type: 'status_effect', 
                    effect: 'charm',
                    duration: 3,
                    chance: 0.6
                },
                rarity: 'rare',
                icon: './assets/icons/potion/potion_charm.png',
                stackable: true,
                maxStack: 10,
                value: 150
            },
            '毒药': {
                id: 'poison_potion',
                name: '毒药',
                type: 'consumable',
                subType: 'poison',
                description: '涂抹在武器上，造成持续毒伤',
                effect: { 
                    type: 'weapon_coating', 
                    effect: 'poison',
                    damage: 5,
                    duration: 5
                },
                rarity: 'uncommon',
                icon: './assets/icons/potion/potion_poison.png',
                stackable: true,
                maxStack: 20,
                value: 35
            },

            // 材料
            '铁矿石': {
                id: 'iron_ore',
                name: '铁矿石',
                type: 'material',
                subType: 'ore',
                description: '用于锻造武器和防具的基础材料',
                rarity: 'common',
                icon: '⛏️',
                stackable: true,
                maxStack: 99,
                value: 8
            },
            '皮革': {
                id: 'leather',
                name: '皮革',
                type: 'material',
                subType: 'hide',
                description: '制作轻甲的基础材料',
                rarity: 'common',
                icon: '🦌',
                stackable: true,
                maxStack: 99,
                value: 12
            },
            '魔法水晶': {
                id: 'magic_crystal',
                name: '魔法水晶',
                type: 'material',
                subType: 'crystal',
                description: '蕴含魔法能量的珍贵水晶',
                rarity: 'rare',
                icon: '💎',
                stackable: true,
                maxStack: 50,
                value: 100
            },

            // 货币
            '铜币': {
                id: 'copper_coin',
                name: '铜币',
                type: 'currency',
                subType: 'coin',
                description: '基础货币',
                rarity: 'common',
                icon: '🪙',
                stackable: true,
                maxStack: 9999,
                value: 1
            },
            '银币': {
                id: 'silver_coin',
                name: '银币',
                type: 'currency',
                subType: 'coin',
                description: '中级货币，价值100铜币',
                rarity: 'uncommon',
                icon: '🥈',
                stackable: true,
                maxStack: 999,
                value: 100
            },
            '金币': {
                id: 'gold_coin',
                name: '金币',
                type: 'currency',
                subType: 'coin',
                description: '高级货币，价值100银币',
                rarity: 'rare',
                icon: '🥇',
                stackable: true,
                maxStack: 999,
                value: 10000
            }
        };
    }

    initializeEquipment() {
        return {
            // 武器 - 剑类（单手）
            '廉价铁剑': {
                id: 'wooden_sword',
                name: '廉价铁剑',
                type: 'weapon',
                subType: 'sword',
                weaponType: 'one-handed',
                description: '简陋的廉价铁剑',
                rarity: 'common',
                icon: './assets/icons/weapons/sword1.png',
                level: 1,
                stats: {
                    attack: 8,
                    physicalPower: 3
                },
                requirements: { minLevel: 1 },
                durability: { current: 50, max: 50 },
                value: 15
            },
            '铁剑': {
                id: 'iron_sword',
                name: '铁剑',
                type: 'weapon',
                subType: 'sword',
                weaponType: 'one-handed',
                description: '普通的铁制剑，增加攻击力',
                rarity: 'common',
                icon: './assets/icons/weapons/sword2.png',
                level: 2,
                stats: {
                    attack: 15,
                    physicalPower: 6
                },
                requirements: { minLevel: 2 },
                durability: { current: 100, max: 100 },
                value: 50
            },
            '精制铁剑': {
                id: 'refined_iron_sword',
                name: '精制铁剑',
                type: 'weapon',
                subType: 'sword',
                weaponType: 'one-handed',
                description: '经过精心锻造的铁剑，锋利无比',
                rarity: 'uncommon',
                icon: './assets/icons/weapons/sword3.png',
                level: 3,
                stats: {
                    attack: 22,
                    physicalPower: 9,
                    criticalChance: 5
                },
                requirements: { minLevel: 3 },
                durability: { current: 120, max: 120 },
                value: 120
            },
            '钢剑': {
                id: 'steel_sword',
                name: '钢剑',
                type: 'weapon',
                subType: 'sword',
                weaponType: 'one-handed',
                description: '坚固的钢制长剑，平衡性极佳',
                rarity: 'uncommon',
                icon: './assets/icons/weapons/sword4.png',
                level: 4,
                stats: {
                    attack: 30,
                    physicalPower: 12,
                    speed: 2
                },
                requirements: { minLevel: 4 },
                durability: { current: 150, max: 150 },
                value: 200
            },
            '银剑': {
                id: 'silver_sword',
                name: '银剑',
                type: 'weapon',
                subType: 'sword',
                weaponType: 'one-handed',
                description: '银制长剑，对邪恶生物有特效',
                rarity: 'rare',
                icon: './assets/icons/weapons/sword5.png',
                level: 5,
                stats: {
                    attack: 38,
                    physicalPower: 15,
                    criticalChance: 8
                },
                effects: [
                    { type: 'damage_bonus', target: 'undead', value: 1.5, description: '对不死生物伤害+50%' }
                ],
                requirements: { minLevel: 5 },
                durability: { current: 180, max: 180 },
                value: 400
            },

            // 武器 - 匕首类
            '小刀': {
                id: 'knife',
                name: '小刀',
                type: 'weapon',
                subType: 'dagger',
                weaponType: 'one-handed',
                description: '简单的小刀，速度快但攻击力低',
                rarity: 'common',
                icon: './assets/icons/weapons/knife.png',
                level: 1,
                stats: {
                    attack: 6,
                    physicalPower: 2,
                    speed: 3,
                    criticalChance: 8
                },
                requirements: { minLevel: 1 },
                durability: { current: 40, max: 40 },
                value: 12
            },
            '铁匕首': {
                id: 'iron_dagger',
                name: '铁匕首',
                type: 'weapon',
                subType: 'dagger',
                weaponType: 'one-handed',
                description: '锋利的铁制匕首，适合快速攻击',
                rarity: 'common',
                icon: './assets/icons/weapons/dagger1.png',
                level: 2,
                stats: {
                    attack: 12,
                    physicalPower: 4,
                    speed: 4,
                    criticalChance: 12
                },
                requirements: { minLevel: 2 },
                durability: { current: 60, max: 60 },
                value: 35
            },
            '精制匕首': {
                id: 'refined_dagger',
                name: '精制匕首',
                type: 'weapon',
                subType: 'dagger',
                weaponType: 'one-handed',
                description: '经过精心打磨的匕首，暴击率极高',
                rarity: 'uncommon',
                icon: './assets/icons/weapons/dagger2.png',
                level: 3,
                stats: {
                    attack: 18,
                    physicalPower: 6,
                    speed: 5,
                    criticalChance: 18
                },
                requirements: { minLevel: 3 },
                durability: { current: 80, max: 80 },
                value: 80
            },
            '毒刃匕首': {
                id: 'poison_dagger',
                name: '毒刃匕首',
                type: 'weapon',
                subType: 'dagger',
                weaponType: 'one-handed',
                description: '涂有剧毒的匕首，攻击时有几率中毒敌人',
                rarity: 'rare',
                icon: './assets/icons/weapons/dagger3.png',
                level: 4,
                stats: {
                    attack: 24,
                    physicalPower: 8,
                    speed: 6,
                    criticalChance: 20
                },
                effects: [
                    { type: 'poison_chance', value: 0.3, damage: 3, duration: 4, description: '30%几率使敌人中毒' }
                ],
                requirements: { minLevel: 4 },
                durability: { current: 100, max: 100 },
                value: 180
            },
            '暗影匕首': {
                id: 'shadow_dagger',
                name: '暗影匕首',
                type: 'weapon',
                subType: 'dagger',
                weaponType: 'one-handed',
                description: '神秘的暗影匕首，攻击时有几率造成额外伤害',
                rarity: 'epic',
                icon: './assets/icons/weapons/dagger4.png',
                level: 5,
                stats: {
                    attack: 30,
                    physicalPower: 10,
                    speed: 7,
                    criticalChance: 25
                },
                effects: [
                    { type: 'shadow_strike', value: 0.25, multiplier: 1.5, description: '25%几率造成1.5倍伤害' }
                ],
                requirements: { minLevel: 5 },
                durability: { current: 120, max: 120 },
                value: 350
            },

            // 武器 - 斧类
            '手斧': {
                id: 'hand_axe',
                name: '手斧',
                type: 'weapon',
                subType: 'axe',
                weaponType: 'one-handed',
                description: '简单的单手斧，攻击力不错',
                rarity: 'common',
                icon: './assets/icons/weapons/axe1.png',
                level: 1,
                stats: {
                    attack: 12,
                    physicalPower: 5,
                    speed: -1
                },
                requirements: { minLevel: 1 },
                durability: { current: 70, max: 70 },
                value: 25
            },
            '战斧': {
                id: 'battle_axe',
                name: '战斧',
                type: 'weapon',
                subType: 'axe',
                weaponType: 'one-handed',
                description: '重型战斧，攻击力强但速度慢',
                rarity: 'uncommon',
                icon: './assets/icons/weapons/axe2.png',
                level: 3,
                stats: {
                    attack: 28,
                    physicalPower: 12,
                    criticalChance: 8,
                    speed: -2
                },
                requirements: { minLevel: 3 },
                durability: { current: 120, max: 120 },
                value: 150
            },
            '双刃战斧': {
                id: 'double_axe',
                name: '双刃战斧',
                type: 'weapon',
                subType: 'axe',
                weaponType: 'two-handed',
                description: '双面刃的重型战斧，威力惊人',
                rarity: 'rare',
                icon: './assets/icons/weapons/axe3.png',
                level: 4,
                stats: {
                    attack: 42,
                    physicalPower: 18,
                    criticalChance: 12,
                    speed: -3
                },
                requirements: { minLevel: 4 },
                durability: { current: 150, max: 150 },
                value: 280
            },
            '巨魔战斧': {
                id: 'troll_axe',
                name: '巨魔战斧',
                type: 'weapon',
                subType: 'axe',
                weaponType: 'two-handed',
                description: '巨魔使用的巨大战斧，破坏力极强',
                rarity: 'epic',
                icon: './assets/icons/weapons/axe4.png',
                level: 6,
                stats: {
                    attack: 55,
                    physicalPower: 25,
                    criticalChance: 15,
                    speed: -2
                },
                effects: [
                    { type: 'armor_break', value: 0.2, description: '20%几率破坏敌人护甲' }
                ],
                requirements: { minLevel: 6 },
                durability: { current: 200, max: 200 },
                value: 500
            },

            // 武器 - 锤类
            '木棒': {
                id: 'club',
                name: '木棒',
                type: 'weapon',
                subType: 'club',
                weaponType: 'one-handed',
                description: '简陋的木棒，原始但有效',
                rarity: 'common',
                icon: './assets/icons/weapons/club1.png',
                level: 1,
                stats: {
                    attack: 10,
                    physicalPower: 4,
                    speed: -1
                },
                requirements: { minLevel: 1 },
                durability: { current: 50, max: 50 },
                value: 8
            },
            '战锤': {
                id: 'war_hammer',
                name: '战锤',
                type: 'weapon',
                subType: 'hammer',
                weaponType: 'one-handed',
                description: '重型战锤，对护甲有额外伤害',
                rarity: 'uncommon',
                icon: './assets/icons/weapons/hammer1.png',
                level: 3,
                stats: {
                    attack: 26,
                    physicalPower: 14,
                    speed: -2
                },
                effects: [
                    { type: 'armor_penetration', value: 0.3, description: '无视30%护甲' }
                ],
                requirements: { minLevel: 3 },
                durability: { current: 140, max: 140 },
                value: 180
            },
            '雷神之锤': {
                id: 'thunder_hammer',
                name: '雷神之锤',
                type: 'weapon',
                subType: 'hammer',
                weaponType: 'two-handed',
                description: '传说中的雷神之锤，攻击时有几率释放闪电',
                rarity: 'legendary',
                icon: './assets/icons/weapons/hammer2.png',
                level: 7,
                stats: {
                    attack: 60,
                    physicalPower: 28,
                    criticalChance: 18,
                    speed: -1
                },
                effects: [
                    { type: 'lightning_strike', value: 0.25, damage: 20, description: '25%几率释放闪电攻击' },
                    { type: 'armor_penetration', value: 0.5, description: '无视50%护甲' }
                ],
                requirements: { minLevel: 7 },
                durability: { current: 300, max: 300 },
                value: 1200
            },

            // 武器 - 法杖类
            '木杖': {
                id: 'wooden_staff',
                name: '木杖',
                type: 'weapon',
                subType: 'staff',
                weaponType: 'two-handed',
                description: '简单的木制法杖',
                rarity: 'common',
                icon: './assets/icons/weapons/staff1.png',
                level: 1,
                stats: {
                    attack: 5,
                    magicPower: 8,
                    maxMana: 10
                },
                requirements: { minLevel: 1 },
                durability: { current: 60, max: 60 },
                value: 25
            },
            '法师杖': {
                id: 'mage_staff',
                name: '法师杖',
                type: 'weapon',
                subType: 'staff',
                weaponType: 'two-handed',
                description: '镶嵌水晶的法师专用法杖',
                rarity: 'uncommon',
                icon: './assets/icons/weapons/staff2.png',
                level: 3,
                stats: {
                    attack: 12,
                    magicPower: 20,
                    maxMana: 25
                },
                effects: [
                    { type: 'spell_cost_reduction', value: 0.1, description: '法术消耗-10%' }
                ],
                requirements: { minLevel: 3 },
                durability: { current: 100, max: 100 },
                value: 150
            },
            '奥术法杖': {
                id: 'arcane_staff',
                name: '奥术法杖',
                type: 'weapon',
                subType: 'staff',
                weaponType: 'two-handed',
                description: '蕴含强大奥术能量的高级法杖',
                rarity: 'rare',
                icon: './assets/icons/weapons/staff3.png',
                level: 5,
                stats: {
                    attack: 18,
                    magicPower: 35,
                    maxMana: 40,
                    criticalChance: 10
                },
                effects: [
                    { type: 'spell_cost_reduction', value: 0.15, description: '法术消耗-15%' },
                    { type: 'mana_regeneration', value: 2, description: '每回合回复2点法力' }
                ],
                requirements: { minLevel: 5 },
                durability: { current: 150, max: 150 },
                value: 500
            },

            // 武器 - 法杖类（单手）
            '魔法棒': {
                id: 'magic_wand',
                name: '魔法棒',
                type: 'weapon',
                subType: 'wand',
                weaponType: 'one-handed',
                description: '小巧的魔法棒，适合快速施法',
                rarity: 'common',
                icon: './assets/icons/weapons/wand1.png',
                level: 2,
                stats: {
                    attack: 8,
                    magicPower: 12,
                    maxMana: 15,
                    speed: 2
                },
                requirements: { minLevel: 2 },
                durability: { current: 70, max: 70 },
                value: 60
            },
            '水晶法杖': {
                id: 'crystal_wand',
                name: '水晶法杖',
                type: 'weapon',
                subType: 'wand',
                weaponType: 'one-handed',
                description: '镶嵌纯净水晶的高级法杖',
                rarity: 'rare',
                icon: './assets/icons/weapons/wand2.png',
                level: 4,
                stats: {
                    attack: 15,
                    magicPower: 25,
                    maxMana: 30,
                    speed: 3,
                    criticalChance: 8
                },
                effects: [
                    { type: 'spell_power_boost', value: 0.2, description: '法术威力+20%' }
                ],
                requirements: { minLevel: 4 },
                durability: { current: 120, max: 120 },
                value: 300
            },

            // 武器 - 弓类
            '短弓': {
                id: 'short_bow',
                name: '短弓',
                type: 'weapon',
                subType: 'bow',
                weaponType: 'two-handed',
                description: '简单的短弓，射程有限但易于使用',
                rarity: 'common',
                icon: './assets/icons/weapons/bow1.png',
                level: 1,
                stats: {
                    attack: 10,
                    physicalPower: 4,
                    speed: 2,
                    criticalChance: 5
                },
                requirements: { minLevel: 1 },
                durability: { current: 80, max: 80 },
                value: 30
            },
            '长弓': {
                id: 'long_bow',
                name: '长弓',
                type: 'weapon',
                subType: 'bow',
                weaponType: 'two-handed',
                description: '标准的长弓，射程和威力都不错',
                rarity: 'uncommon',
                icon: './assets/icons/weapons/bow2.png',
                level: 3,
                stats: {
                    attack: 20,
                    physicalPower: 8,
                    speed: 3,
                    criticalChance: 12
                },
                requirements: { minLevel: 3 },
                durability: { current: 120, max: 120 },
                value: 120
            },
            '复合弓': {
                id: 'composite_bow',
                name: '复合弓',
                type: 'weapon',
                subType: 'bow',
                weaponType: 'two-handed',
                description: '高级复合弓，威力强大射程远',
                rarity: 'rare',
                icon: './assets/icons/weapons/bow3.png',
                level: 5,
                stats: {
                    attack: 32,
                    physicalPower: 14,
                    speed: 4,
                    criticalChance: 18
                },
                effects: [
                    { type: 'piercing_shot', value: 0.2, description: '20%几率穿透攻击' }
                ],
                requirements: { minLevel: 5 },
                durability: { current: 160, max: 160 },
                value: 400
            },
            '精灵战弓': {
                id: 'elven_bow',
                name: '精灵战弓',
                type: 'weapon',
                subType: 'bow',
                weaponType: 'two-handed',
                description: '精灵工匠制作的传奇战弓，精准度极高',
                rarity: 'legendary',
                icon: './assets/icons/weapons/bow4.png',
                level: 6,
                stats: {
                    attack: 45,
                    physicalPower: 20,
                    speed: 5,
                    criticalChance: 25
                },
                effects: [
                    { type: 'piercing_shot', value: 0.3, description: '30%几率穿透攻击' },
                    { type: 'wind_arrow', value: 0.15, description: '15%几率发射风之箭' }
                ],
                requirements: { minLevel: 6 },
                durability: { current: 200, max: 200 },
                value: 800
            },

            // 防具 - 头盔
            '布帽': {
                id: 'cloth_hood',
                name: '布帽',
                type: 'armor',
                subType: 'helmet',
                description: '简单的布制头套',
                rarity: 'common',
                icon: './assets/icons/armors/helmet_cloth_hood.png',
                level: 1,
                stats: {
                    defense: 2,
                    maxHp: 3
                },
                requirements: { minLevel: 1 },
                durability: { current: 30, max: 30 },
                value: 10
            },
            '皮帽': {
                id: 'leather_helmet',
                name: '皮帽',
                type: 'armor',
                subType: 'helmet',
                description: '简单的皮制头盔',
                rarity: 'common',
                icon: './assets/icons/armors/helmet_leather.png',
                level: 1,
                stats: {
                    defense: 4,
                    maxHp: 8
                },
                requirements: { minLevel: 1 },
                durability: { current: 50, max: 50 },
                value: 25
            },
            '镶钉皮盔': {
                id: 'studded_leather_helmet',
                name: '镶钉皮盔',
                type: 'armor',
                subType: 'helmet',
                description: '镶嵌铁钉的皮制头盔，防护力更强',
                rarity: 'uncommon',
                icon: './assets/icons/armors/helmet_studded_leather.png',
                level: 2,
                stats: {
                    defense: 6,
                    maxHp: 12
                },
                requirements: { minLevel: 2 },
                durability: { current: 70, max: 70 },
                value: 45
            },
            '锁子甲头盔': {
                id: 'chainmail_helmet',
                name: '锁子甲头盔',
                type: 'armor',
                subType: 'helmet',
                description: '铁环编织的链甲头盔',
                rarity: 'uncommon',
                icon: './assets/icons/armors/helmet_chainmail.png',
                level: 3,
                stats: {
                    defense: 9,
                    maxHp: 18
                },
                requirements: { minLevel: 3 },
                durability: { current: 100, max: 100 },
                value: 80
            },
            '带角铁盔': {
                id: 'horned_iron_helmet',
                name: '带角铁盔',
                type: 'armor',
                subType: 'helmet',
                description: '装饰有角的铁制头盔，威武霸气',
                rarity: 'uncommon',
                icon: './assets/icons/armors/helmet_horned_iron.png',
                level: 3,
                stats: {
                    defense: 10,
                    maxHp: 20,
                    attack: 2
                },
                effects: [
                    { type: 'intimidation', value: 0.1, description: '10%几率震慑敌人' }
                ],
                requirements: { minLevel: 3 },
                durability: { current: 120, max: 120 },
                value: 120
            },
            '板甲头盔': {
                id: 'plate_helmet',
                name: '板甲头盔',
                type: 'armor',
                subType: 'helmet',
                description: '厚重的钢制板甲头盔',
                rarity: 'rare',
                icon: './assets/icons/armors/helmet_plate.png',
                level: 4,
                stats: {
                    defense: 15,
                    maxHp: 30
                },
                requirements: { minLevel: 4 },
                durability: { current: 150, max: 150 },
                value: 200
            },
            '全封式骑士头盔': {
                id: 'full_knight_helmet',
                name: '全封式骑士头盔',
                type: 'armor',
                subType: 'helmet',
                description: '完全封闭的骑士头盔，防护力极强',
                rarity: 'epic',
                icon: './assets/icons/armors/helmet_full_knight_plate.png',
                level: 5,
                stats: {
                    defense: 20,
                    maxHp: 40
                },
                effects: [
                    { type: 'damage_reduction', value: 0.1, description: '受到伤害-10%' }
                ],
                requirements: { minLevel: 5 },
                durability: { current: 200, max: 200 },
                value: 400
            },

            // 防具 - 胸甲
            '布袍': {
                id: 'cloth_robe',
                name: '布袍',
                type: 'armor',
                subType: 'chest',
                description: '简单的布制长袍',
                rarity: 'common',
                icon: './assets/icons/armors/chest_cloth_robe.png',
                level: 1,
                stats: {
                    defense: 3,
                    maxHp: 5,
                    maxMana: 5
                },
                requirements: { minLevel: 1 },
                durability: { current: 40, max: 40 },
                value: 15
            },
            '布面甲': {
                id: 'padded_armor',
                name: '布面甲',
                type: 'armor',
                subType: 'chest',
                description: '填充棉花的布制护甲',
                rarity: 'common',
                icon: './assets/icons/armors/chest_padded_armor.png',
                level: 1,
                stats: {
                    defense: 5,
                    maxHp: 10
                },
                requirements: { minLevel: 1 },
                durability: { current: 50, max: 50 },
                value: 25
            },
            '皮甲': {
                id: 'leather_armor',
                name: '皮甲',
                type: 'armor',
                subType: 'chest',
                description: '简单的皮制护甲，增加防御力',
                rarity: 'common',
                icon: './assets/icons/armors/chest_leather_armor.png',
                level: 1,
                stats: {
                    defense: 8,
                    maxHp: 15
                },
                requirements: { minLevel: 1 },
                durability: { current: 70, max: 70 },
                value: 40
            },
            '镶钉皮甲': {
                id: 'studded_leather_armor',
                name: '镶钉皮甲',
                type: 'armor',
                subType: 'chest',
                description: '镶嵌铁钉的皮制护甲',
                rarity: 'uncommon',
                icon: './assets/icons/armors/chest_studded_leather.png',
                level: 2,
                stats: {
                    defense: 12,
                    maxHp: 20
                },
                requirements: { minLevel: 2 },
                durability: { current: 90, max: 90 },
                value: 70
            },
            '链甲': {
                id: 'chainmail',
                name: '链甲',
                type: 'armor',
                subType: 'chest',
                description: '铁环编织的链式护甲',
                rarity: 'uncommon',
                icon: './assets/icons/armors/chest_chainmail.png',
                level: 2,
                stats: {
                    defense: 15,
                    maxHp: 25,
                    speed: -1
                },
                requirements: { minLevel: 2 },
                durability: { current: 120, max: 120 },
                value: 100
            },
            '板甲': {
                id: 'plate_armor',
                name: '板甲',
                type: 'armor',
                subType: 'chest',
                description: '厚重的钢制板甲，防护力极强',
                rarity: 'rare',
                icon: './assets/icons/armors/chest_plate_armor.png',
                level: 4,
                stats: {
                    defense: 25,
                    maxHp: 40,
                    speed: -3
                },
                effects: [
                    { type: 'damage_reduction', value: 0.1, description: '受到伤害-10%' }
                ],
                requirements: { minLevel: 4 },
                durability: { current: 200, max: 200 },
                value: 300
            },
            '高级皮甲': {
                id: 'superior_leather_armor',
                name: '高级皮甲',
                type: 'armor',
                subType: 'chest',
                description: '精制的高级皮甲，轻便且防护力强',
                rarity: 'rare',
                icon: './assets/icons/armors/chest_superior_leather.png',
                level: 3,
                stats: {
                    defense: 18,
                    maxHp: 30,
                    speed: 1
                },
                requirements: { minLevel: 3 },
                durability: { current: 140, max: 140 },
                value: 180
            },
            '高级镶钉皮甲': {
                id: 'superior_studded_armor',
                name: '高级镶钉皮甲',
                type: 'armor',
                subType: 'chest',
                description: '使用优质材料制作的镶钉皮甲',
                rarity: 'rare',
                icon: './assets/icons/armors/chest_superior_studded.png',
                level: 3,
                stats: {
                    defense: 20,
                    maxHp: 35
                },
                requirements: { minLevel: 3 },
                durability: { current: 160, max: 160 },
                value: 220
            },
            '高级锁子甲': {
                id: 'superior_chainmail',
                name: '高级锁子甲',
                type: 'armor',
                subType: 'chest',
                description: '精工制作的高级锁子甲',
                rarity: 'rare',
                icon: './assets/icons/armors/chest_superior_chainmail.png',
                level: 4,
                stats: {
                    defense: 22,
                    maxHp: 38,
                    speed: -1
                },
                requirements: { minLevel: 4 },
                durability: { current: 180, max: 180 },
                value: 280
            },
            '高级板甲': {
                id: 'superior_plate_armor',
                name: '高级板甲',
                type: 'armor',
                subType: 'chest',
                description: '大师级工匠制作的顶级板甲',
                rarity: 'epic',
                icon: './assets/icons/armors/chest_superior_plate.png',
                level: 5,
                stats: {
                    defense: 35,
                    maxHp: 60,
                    speed: -2
                },
                effects: [
                    { type: 'damage_reduction', value: 0.15, description: '受到伤害-15%' },
                    { type: 'reflect_damage', value: 0.1, description: '反弹10%伤害' }
                ],
                requirements: { minLevel: 5 },
                durability: { current: 250, max: 250 },
                value: 600
            },

            // 防具 - 护腿
            '布裤': {
                id: 'cloth_pants',
                name: '布裤',
                type: 'armor',
                subType: 'legs',
                description: '简单的布制裤子',
                rarity: 'common',
                icon: './assets/icons/armors/legs_cloth_pants.png',
                level: 1,
                stats: {
                    defense: 2,
                    maxHp: 5
                },
                requirements: { minLevel: 1 },
                durability: { current: 35, max: 35 },
                value: 12
            },
            '皮裤': {
                id: 'leather_pants',
                name: '皮裤',
                type: 'armor',
                subType: 'legs',
                description: '简单的皮制护腿',
                rarity: 'common',
                icon: './assets/icons/armors/legs_leather_pants.png',
                level: 1,
                stats: {
                    defense: 4,
                    maxHp: 10
                },
                requirements: { minLevel: 1 },
                durability: { current: 50, max: 50 },
                value: 25
            },
            '镶钉皮裤': {
                id: 'studded_pants',
                name: '镶钉皮裤',
                type: 'armor',
                subType: 'legs',
                description: '镶嵌铁钉的皮制护腿',
                rarity: 'uncommon',
                icon: './assets/icons/armors/legs_studded_pants.png',
                level: 2,
                stats: {
                    defense: 6,
                    maxHp: 15
                },
                requirements: { minLevel: 2 },
                durability: { current: 70, max: 70 },
                value: 45
            },
            '锁子甲裤': {
                id: 'chainmail_pants',
                name: '锁子甲裤',
                type: 'armor',
                subType: 'legs',
                description: '铁环编织的链甲护腿',
                rarity: 'uncommon',
                icon: './assets/icons/armors/legs_chainmail_pants.png',
                level: 3,
                stats: {
                    defense: 9,
                    maxHp: 20
                },
                requirements: { minLevel: 3 },
                durability: { current: 90, max: 90 },
                value: 70
            },
            '板甲裤': {
                id: 'plate_pants',
                name: '板甲裤',
                type: 'armor',
                subType: 'legs',
                description: '厚重的钢制板甲护腿',
                rarity: 'rare',
                icon: './assets/icons/armors/legs_plate_pants.png',
                level: 4,
                stats: {
                    defense: 15,
                    maxHp: 30
                },
                requirements: { minLevel: 4 },
                durability: { current: 140, max: 140 },
                value: 180
            },

            // 防具 - 靴子
            '布鞋': {
                id: 'cloth_shoes',
                name: '布鞋',
                type: 'armor',
                subType: 'boots',
                description: '简单的布制鞋子',
                rarity: 'common',
                icon: './assets/icons/armors/boots_cloth_shoes.png',
                level: 1,
                stats: {
                    defense: 1,
                    speed: 1
                },
                requirements: { minLevel: 1 },
                durability: { current: 25, max: 25 },
                value: 8
            },
            '皮靴': {
                id: 'leather_boots',
                name: '皮靴',
                type: 'armor',
                subType: 'boots',
                description: '舒适的皮制靴子',
                rarity: 'common',
                icon: './assets/icons/armors/boots_leather.png',
                level: 1,
                stats: {
                    defense: 3,
                    speed: 2
                },
                requirements: { minLevel: 1 },
                durability: { current: 40, max: 40 },
                value: 18
            },
            '镶钉皮靴': {
                id: 'studded_boots',
                name: '镶钉皮靴',
                type: 'armor',
                subType: 'boots',
                description: '镶嵌铁钉的皮制靴子',
                rarity: 'uncommon',
                icon: './assets/icons/armors/boots_studded.png',
                level: 2,
                stats: {
                    defense: 5,
                    speed: 2,
                    maxHp: 8
                },
                requirements: { minLevel: 2 },
                durability: { current: 60, max: 60 },
                value: 35
            },
            '锁子甲靴': {
                id: 'chainmail_boots',
                name: '锁子甲靴',
                type: 'armor',
                subType: 'boots',
                description: '铁环编织的链甲靴子',
                rarity: 'uncommon',
                icon: './assets/icons/armors/boots_chainmail.png',
                level: 3,
                stats: {
                    defense: 7,
                    speed: 1,
                    maxHp: 12
                },
                requirements: { minLevel: 3 },
                durability: { current: 80, max: 80 },
                value: 60
            },
            '板甲靴': {
                id: 'plate_boots',
                name: '板甲靴',
                type: 'armor',
                subType: 'boots',
                description: '厚重的钢制板甲靴子',
                rarity: 'rare',
                icon: './assets/icons/armors/boots_plate.png',
                level: 4,
                stats: {
                    defense: 12,
                    maxHp: 20,
                    speed: -1
                },
                requirements: { minLevel: 4 },
                durability: { current: 120, max: 120 },
                value: 120
            },

            // 饰品 - 戒指
            '新人冒险家之戒': {
                id: 'novice_adventurer_ring',
                name: '新人冒险家之戒',
                type: 'accessory',
                subType: 'ring',
                description: '新手冒险者的标志戒指',
                rarity: 'common',
                icon: './assets/icons/ringtiles/ring_novice_adventurer.png',
                level: 1,
                stats: {
                    maxHp: 10,
                    maxMana: 5
                },
                requirements: { minLevel: 1 },
                value: 50
            },
            '黑铁级冒险家之戒': {
                id: 'iron_adventurer_ring',
                name: '黑铁级冒险家之戒',
                type: 'accessory',
                subType: 'ring',
                description: '黑铁级冒险者的荣誉戒指',
                rarity: 'uncommon',
                icon: './assets/icons/ringtiles/ring_iron_adventurer.png',
                level: 2,
                stats: {
                    attack: 3,
                    defense: 3,
                    maxHp: 15
                },
                requirements: { minLevel: 2 },
                value: 120
            },
            '白银级冒险家之戒': {
                id: 'silver_adventurer_ring',
                name: '白银级冒险家之戒',
                type: 'accessory',
                subType: 'ring',
                description: '白银级冒险者的荣誉戒指',
                rarity: 'rare',
                icon: './assets/icons/ringtiles/ring_silver_adventurer.png',
                level: 3,
                stats: {
                    attack: 5,
                    defense: 5,
                    maxHp: 25,
                    maxMana: 15
                },
                requirements: { minLevel: 3 },
                value: 250
            },
            '黄金级冒险家之戒': {
                id: 'gold_adventurer_ring',
                name: '黄金级冒险家之戒',
                type: 'accessory',
                subType: 'ring',
                description: '黄金级冒险者的荣誉戒指',
                rarity: 'epic',
                icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
                level: 4,
                stats: {
                    attack: 8,
                    defense: 8,
                    maxHp: 40,
                    maxMana: 25,
                    speed: 2
                },
                effects: [
                    { type: 'experience_boost', value: 0.1, description: '经验获得+10%' }
                ],
                requirements: { minLevel: 4 },
                value: 500
            },

            // 饰品 - 护符
            '生命护符': {
                id: 'life_amulet',
                name: '生命护符',
                type: 'accessory',
                subType: 'amulet',
                description: '增强生命力的神秘护符',
                rarity: 'uncommon',
                icon: './assets/icons/ringtiles/amulet_life.png',
                level: 2,
                stats: {
                    maxHp: 30,
                    defense: 3
                },
                effects: [
                    { type: 'health_regeneration', value: 1, description: '每回合回复1点生命' }
                ],
                requirements: { minLevel: 2 },
                value: 150
            },
            '防御护符': {
                id: 'defense_amulet',
                name: '防御护符',
                type: 'accessory',
                subType: 'amulet',
                description: '提供额外防护的护符',
                rarity: 'uncommon',
                icon: './assets/icons/ringtiles/amulet_defense.png',
                level: 2,
                stats: {
                    defense: 8,
                    maxHp: 20
                },
                effects: [
                    { type: 'damage_reduction', value: 0.05, description: '受到伤害-5%' }
                ],
                requirements: { minLevel: 2 },
                value: 140
            },
            '奥术护符': {
                id: 'arcane_amulet',
                name: '奥术护符',
                type: 'accessory',
                subType: 'amulet',
                description: '蕴含奥术能量的神秘护符',
                rarity: 'rare',
                icon: './assets/icons/ringtiles/amulet_arcane.png',
                level: 3,
                stats: {
                    magicPower: 15,
                    maxMana: 30,
                    criticalChance: 5
                },
                effects: [
                    { type: 'spell_cost_reduction', value: 0.1, description: '法术消耗-10%' }
                ],
                requirements: { minLevel: 3 },
                value: 300
            },
            '白刃护符': {
                id: 'blade_amulet',
                name: '白刃护符',
                type: 'accessory',
                subType: 'amulet',
                description: '增强近战能力的战士护符',
                rarity: 'rare',
                icon: './assets/icons/ringtiles/amulet_blade.png',
                level: 3,
                stats: {
                    attack: 10,
                    physicalPower: 8,
                    criticalChance: 8
                },
                effects: [
                    { type: 'weapon_mastery', value: 0.1, description: '武器熟练度+10%' }
                ],
                requirements: { minLevel: 3 },
                value: 280
            },

            // 饰品 - 背包
            '小型背包': {
                id: 'small_backpack',
                name: '小型背包',
                type: 'accessory',
                subType: 'backpack',
                description: '简单的小背包，增加少量背包容量',
                rarity: 'common',
                icon: './assets/icons/MISC/backpack_small.png',
                level: 1,
                stats: {
                    inventorySlots: 3
                },
                requirements: { minLevel: 1 },
                value: 50
            },
            '中型背包': {
                id: 'medium_backpack',
                name: '中型背包',
                type: 'accessory',
                subType: 'backpack',
                description: '标准的中型背包，提供适中的存储空间',
                rarity: 'common',
                icon: './assets/icons/MISC/backpack_medium.png',
                level: 2,
                stats: {
                    inventorySlots: 6
                },
                requirements: { minLevel: 2 },
                value: 120
            },
            '大型背包': {
                id: 'large_backpack',
                name: '大型背包',
                type: 'accessory',
                subType: 'backpack',
                description: '专为长途旅行设计的大容量背包',
                rarity: 'uncommon',
                icon: './assets/icons/MISC/backpack_large.png',
                level: 3,
                stats: {
                    inventorySlots: 10,
                    speed: 1
                },
                requirements: { minLevel: 3 },
                value: 250
            }
        };
    }

    // 获取物品数据
    getItem(itemName) {
        return this.items[itemName] || null;
    }

    // 获取装备数据
    getEquipment(equipmentName) {
        return this.equipment[equipmentName] || null;
    }

    // 获取所有物品
    getAllItems() {
        return { ...this.items };
    }

    // 获取所有装备
    getAllEquipment() {
        return { ...this.equipment };
    }

    // 根据类型获取装备
    getEquipmentByType(type, subType = null) {
        const result = [];
        for (const [name, equipment] of Object.entries(this.equipment)) {
            if (equipment.type === type) {
                if (!subType || equipment.subType === subType) {
                    result.push({ name, ...equipment });
                }
            }
        }
        return result;
    }

    // 根据等级获取装备
    getEquipmentByLevel(minLevel, maxLevel = null) {
        const result = [];
        for (const [name, equipment] of Object.entries(this.equipment)) {
            if (equipment.level >= minLevel) {
                if (!maxLevel || equipment.level <= maxLevel) {
                    result.push({ name, ...equipment });
                }
            }
        }
        return result;
    }

    // 获取稀有度颜色
    getRarityColor(rarity) {
        const colors = {
            'common': '#ffffff',
            'uncommon': '#1eff00',
            'rare': '#0070dd',
            'epic': '#a335ee',
            'legendary': '#ff8000'
        };
        return colors[rarity] || colors.common;
    }

    // 检查装备需求
    checkEquipmentRequirements(equipment, player) {
        if (!equipment.requirements) return { canEquip: true };

        const requirements = equipment.requirements;
        const issues = [];

        if (requirements.minLevel && player.level < requirements.minLevel) {
            issues.push(`需要等级 ${requirements.minLevel}`);
        }

        if (requirements.minStrength && (player.strength || 0) < requirements.minStrength) {
            issues.push(`需要力量 ${requirements.minStrength}`);
        }

        if (requirements.minIntelligence && (player.intelligence || 0) < requirements.minIntelligence) {
            issues.push(`需要智力 ${requirements.minIntelligence}`);
        }

        return {
            canEquip: issues.length === 0,
            issues: issues
        };
    }
}

const itemsDB = new ItemsDB();
export default itemsDB;