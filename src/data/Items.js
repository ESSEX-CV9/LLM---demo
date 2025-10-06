// data/Items.js - 物品和装备数据库（兼容层）
// 导入新的模块化数据库
import ModularItemsDB from './Items/index.js';

/**
 * ItemsDB类 - 向后兼容的包装类
 * 内部使用模块化的Items数据库，但提供原有的接口以保持兼容性
 */
class ItemsDB {
    constructor() {
        // 使用新的模块化数据库
        this.modularDB = ModularItemsDB;
        
        // 为了兼容性，保留对旧方法的引用
        // 但实际数据来自模块化数据库
    }

    /**
     * @deprecated 使用 getItemByName 代替
     * 获取物品数据（包括消耗品）
     */
    getItem(itemName) {
        return this.modularDB.getItemByName(itemName);
    }

    /**
     * @deprecated 使用 getItemByName 代替
     * 获取装备数据
     */
    getEquipment(equipmentName) {
        return this.modularDB.getItemByName(equipmentName);
    }

    /**
     * 获取所有物品（新接口）
     */
    getAllItems() {
        return this.modularDB.getAllItems();
    }

    /**
     * @deprecated 装备也是物品的一部分，使用 getAllItems 或 getItemsByType 代替
     * 获取所有装备
     */
    getAllEquipment() {
        const allItems = this.modularDB.getAllItems();
        const equipment = {};
        
        for (const [key, item] of Object.entries(allItems)) {
            if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
                equipment[key] = item;
            }
        }
        
        return equipment;
    }

    /**
     * 根据类型获取装备/物品
     * @param {string} type - 物品类型 (weapon, armor, accessory, consumable等)
     * @param {string|null} subType - 子类型（可选）
     */
    getEquipmentByType(type, subType = null) {
        return this.modularDB.getItemsByType(type, subType);
    }

    /**
     * 根据等级获取装备/物品
     * @param {number} minLevel - 最小等级
     * @param {number|null} maxLevel - 最大等级（可选）
     */
    getEquipmentByLevel(minLevel, maxLevel = null) {
        return this.modularDB.getItemsByLevelRange(minLevel, maxLevel || 999);
    }

    /**
     * 获取稀有度对应的颜色
     * @param {string} rarity - 稀有度
     */
    getRarityColor(rarity) {
        return this.modularDB.getRarityColor(rarity);
    }

    /**
     * 检查装备需求是否满足
     * @param {Object} equipment - 装备对象
     * @param {Object} player - 玩家对象
     * @returns {Object} { canEquip: boolean, issues: string[] }
     */
    checkEquipmentRequirements(equipment, player) {
        if (!equipment.requirements) return { canEquip: true };

        const requirements = equipment.requirements;
        const issues = [];

        if (requirements.level && player.level < requirements.level) {
            issues.push(`需要等级 ${requirements.level}`);
        }
        
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
    
    // ===== 新增的便捷方法（直接转发到模块化数据库）=====
    
    /**
     * 通过ID获取物品
     */
    getItemById(id) {
        return this.modularDB.getItemById(id);
    }
    
    /**
     * 通过名称获取物品
     */
    getItemByName(name) {
        return this.modularDB.getItemByName(name);
    }
    
    /**
     * 获取指定稀有度的物品
     */
    getItemsByRarity(rarity, type = null) {
        return this.modularDB.getItemsByRarity(rarity, type);
    }
    
    /**
     * 按武器大类获取武器
     */
    getWeaponsByCategory(category) {
        return this.modularDB.getWeaponsByCategory(category);
    }
    
    /**
     * 按护甲类型获取护甲
     */
    getArmorsByType(armorType) {
        return this.modularDB.getArmorsByType(armorType);
    }
    
    /**
     * 获取所有消耗品
     */
    getConsumables() {
        return this.modularDB.getConsumables();
    }
    
    /**
     * 获取所有饰品
     */
    getAccessories() {
        return this.modularDB.getAccessories();
    }
    
    /**
     * 搜索物品
     */
    searchItems(query) {
        return this.modularDB.searchItems(query);
    }
    
    /**
     * 获取随机物品
     */
    getRandomItemByLevel(level, type = null) {
        return this.modularDB.getRandomItemByLevel(level, type);
    }
    
    /**
     * @deprecated 数据现在从模块化文件加载，此方法仅为兼容性保留
     * 返回空对象以保持接口兼容，实际数据请通过 modularDB 访问
     */
    initializeItems() {
        console.warn('[ItemsDB] initializeItems() 已废弃，数据来自模块化文件');
        return {};
    }

    /**
     * @deprecated 数据现在从模块化文件加载，此方法仅为兼容性保留
     * 返回空对象以保持接口兼容，实际数据请通过 modularDB 访问
     */
    initializeEquipment() {
        console.warn('[ItemsDB] initializeEquipment() 已废弃，数据来自模块化文件');
        return {};
    }
}

const itemsDB = new ItemsDB();
export default itemsDB;