// services/SkillService.js - 技能系统服务
import SkillsDB from '../data/Skills.js';

class SkillService {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.cooldowns = new Map(); // key: skillId, value: remaining rounds
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 冷却递减改为由战斗服务在回合切换时显式调用，避免重复递减
  }

  getPlayer() {
    const gs = window.gameCore?.getService('gameStateService');
    return gs?.getState()?.player;
  }

  getGameStateService() {
    return window.gameCore?.getService('gameStateService');
  }

  getBattleService() {
    return window.gameCore?.getService('battleService');
  }

  // UI入口：显示技能页面
  showSkills() {
    console.log('[SkillService] showSkills() 被调用');
    const player = this.getPlayer();
    const allSkills = SkillsDB.getAllSkills();
    const learnable = this.getLearnableSkills(player);
    const upgradable = this.getUpgradableSkills(player);

    console.log('[SkillService] 发出 ui:skills:show 事件');
    this.eventBus.emit('ui:skills:show', {
      player,
      allSkills,
      learnable,
      upgradable,
      describe: (skill, level) => SkillsDB.describeLevel(skill, level),
    }, 'game');
  }

  // 学习或升级逻辑判断
  getLearnableSkills(player) {
    const learnedIds = new Set((player.skills || []).map(s => s.id));
    return SkillsDB.getAllSkills()
      .filter(skill => !learnedIds.has(skill.id))
      .filter(skill => {
        // 修改逻辑：显示满足前置条件的技能，即使技能点不足
        const check = this.canLearnIgnoreSkillPoints(player, skill.id);
        return check.ok;
      });
  }

  // 新增方法：检查是否可学习（忽略技能点限制）
  canLearnIgnoreSkillPoints(player, skillId) {
    const skill = SkillsDB.getSkillById(skillId);
    if (!skill) return { ok: false, reason: '技能不存在' };
    
    // 要求等级
    if (skill.requirements?.minLevel && player.level < skill.requirements.minLevel) {
      return { ok: false, reason: `需要等级${skill.requirements.minLevel}` };
    }
    
    // 前置技能
    if (skill.requirements?.requires?.length) {
      for (const req of skill.requirements.requires) {
        const got = (player.skills || []).find(s => s.id === req.id);
        if (!got || (got.level || 0) < req.level) {
          return { ok: false, reason: `需要技能 ${req.id} Lv.${req.level}` };
        }
      }
    }
    
    return { ok: true };
  }

  // 新增：检查武器要求
  checkWeaponRequirement(requiredWeapons) {
    const gameStateService = this.getGameStateService();
    const player = gameStateService?.getState()?.player;
    if (!player) return false;
    
    const weapon1 = player.equipment?.weapon1;
    if (!weapon1) return false;
    
    const weaponCategory = weapon1.weaponCategory;
    const weaponSubCategory = weapon1.weaponSubCategory;
    
    // 检查是否匹配任一要求
    return requiredWeapons.some(req => {
      if (req === 'dagger') {
        return weaponSubCategory === 'dagger';
      }
      return weaponCategory === req;
    });
  }

  getUpgradableSkills(player) {
    return (player.skills || [])
      .filter(ps => {
        const skill = SkillsDB.getSkillById(ps.id);
        if (!skill) return false;
        return ps.level < skill.maxLevel;
      })
      .filter(ps => this.canUpgrade(player, ps.id).ok);
  }

  canLearn(player, skillId) {
    const skill = SkillsDB.getSkillById(skillId);
    if (!skill) return { ok: false, reason: '技能不存在' };
    if ((player.skillPoints || 0) <= 0) return { ok: false, reason: '技能点不足' };
    // 要求等级
    if (skill.requirements?.minLevel && player.level < skill.requirements.minLevel) {
      return { ok: false, reason: `需要等级${skill.requirements.minLevel}` };
    }
    // 前置技能
    if (skill.requirements?.requires?.length) {
      for (const req of skill.requirements.requires) {
        const got = (player.skills || []).find(s => s.id === req.id);
        if (!got || (got.level || 0) < req.level) {
          return { ok: false, reason: `需要技能 ${req.id} Lv.${req.level}` };
        }
      }
    }
    return { ok: true };
  }

  canUpgrade(player, skillId) {
    const skill = SkillsDB.getSkillById(skillId);
    if (!skill) return { ok: false, reason: '技能不存在' };
    const owned = (player.skills || []).find(s => s.id === skillId);
    if (!owned) return { ok: false, reason: '未学习此技能' };
    if (owned.level >= skill.maxLevel) return { ok: false, reason: '已达最高等级' };
    if ((player.skillPoints || 0) <= 0) return { ok: false, reason: '技能点不足' };
    return { ok: true };
  }

  learnSkill(skillId) {
    const gs = this.getGameStateService();
    const player = gs.getState().player;
    
    // 检查是否已经学习过此技能
    const owned = (player.skills || []).find(s => s.id === skillId);
    if (owned) {
      return { success: false, message: '已经学习过此技能' };
    }
    
    const check = this.canLearn(player, skillId);
    if (!check.ok) return { success: false, message: check.reason };

    const skill = SkillsDB.getSkillById(skillId);
    const newSkills = [...(player.skills || []), { id: skillId, level: 1, equipped: false, cooldownLeft: 0 }];
    const updates = { skills: newSkills, skillPoints: (player.skillPoints || 0) - 1 };
    // 应用被动技能的永久加成
    this.applyPassiveEffectsOnLearnOrUpgrade(updates, player, skill, 1);

    gs.updatePlayerStats(updates);
    console.log('[SkillService] 学习技能后发出 skills:updated 事件');
    this.eventBus.emit('skills:updated', gs.getState().player, 'game');

    return { success: true, message: `学习了技能【${skill.name}】` };
  }

  upgradeSkill(skillId) {
    const gs = this.getGameStateService();
    const player = gs.getState().player;
    const check = this.canUpgrade(player, skillId);
    if (!check.ok) return { success: false, message: check.reason };

    const skill = SkillsDB.getSkillById(skillId);
    const newSkills = (player.skills || []).map(s => {
      if (s.id === skillId) {
        const newLevel = Math.min(s.level + 1, skill.maxLevel);
        return { ...s, level: newLevel };
      }
      return s;
    });
    const updates = { skills: newSkills, skillPoints: (player.skillPoints || 0) - 1 };
    const newLevel = (player.skills || []).find(s => s.id === skillId)?.level + 1;
    this.applyPassiveEffectsOnLearnOrUpgrade(updates, player, skill, newLevel);

    gs.updatePlayerStats(updates);
    console.log('[SkillService] 升级技能后发出 skills:updated 事件');
    this.eventBus.emit('skills:updated', gs.getState().player, 'game');

    return { success: true, message: `升级了技能【${skill.name}】到 Lv.${newLevel}` };
  }

  applyPassiveEffectsOnLearnOrUpgrade(updates, playerBefore, skill, level) {
    if (skill.kind !== 'passive') return;
    const data = skill.effect?.data || {};
    const idx = Math.max(0, Math.min(level - 1, skill.maxLevel - 1));

    // 增加资源上限与基础强度
    const addMaxStamina = (data.maxStamina?.[idx]) || 0;
    const addMaxMana = (data.maxMana?.[idx]) || 0;
    const addPhysicalPower = (data.physicalPower?.[idx]) || 0;
    const addMagicPower = (data.magicPower?.[idx]) || 0;

    const newMaxStamina = (playerBefore.maxStamina || 0) + addMaxStamina;
    const newMaxMana = (playerBefore.maxMana || 0) + addMaxMana;

    updates.maxStamina = newMaxStamina;
    updates.maxMana = newMaxMana;

    // 当前值不超过上限
    updates.stamina = Math.min(playerBefore.stamina || 0, newMaxStamina);
    updates.mana = Math.min(playerBefore.mana || 0, newMaxMana);

    // 基础强度加成到 stats
    const stats = { ...(playerBefore.stats || {}) };
    stats.basePhysicalPower = (stats.basePhysicalPower || 0) + addPhysicalPower;
    stats.baseMagicPower = (stats.baseMagicPower || 0) + addMagicPower;
    updates.stats = stats;
  }

  // 技能装备管理：最多装备4个技能
  equipSkill(skillId, slotIndex = null) {
    const gs = this.getGameStateService();
    const player = gs.getState().player;
    const skill = (player.skills || []).find(s => s.id === skillId);
    
    if (!skill) {
      return { success: false, message: '未学习此技能' };
    }
    
    const equippedSkills = (player.skills || []).filter(s => s.equipped);
    
    // 如果已装备，则卸下
    if (skill.equipped) {
      return this.unequipSkill(skillId);
    }
    
    // 检查是否已达上限
    if (equippedSkills.length >= 6 && slotIndex === null) {
      return { success: false, message: '技能槽已满，请先卸下其他技能' };
    }
    
    // 如果指定了槽位且该槽位有技能，先卸下
    if (slotIndex !== null && slotIndex >= 0 && slotIndex < 6) {
      const skillInSlot = equippedSkills[slotIndex];
      if (skillInSlot) {
        this.unequipSkill(skillInSlot.id);
      }
    }
    
    // 装备技能
    const newSkills = (player.skills || []).map(s =>
      s.id === skillId ? { ...s, equipped: true } : s
    );
    
    gs.updatePlayerStats({ skills: newSkills });
    this.eventBus.emit('skills:updated', gs.getState().player, 'game');
    
    const skillData = SkillsDB.getSkillById(skillId);
    return { success: true, message: `已装备技能【${skillData?.name || skillId}】` };
  }

  unequipSkill(skillId) {
    const gs = this.getGameStateService();
    const player = gs.getState().player;
    const skill = (player.skills || []).find(s => s.id === skillId);
    
    if (!skill) {
      return { success: false, message: '未学习此技能' };
    }
    
    if (!skill.equipped) {
      return { success: false, message: '该技能未装备' };
    }
    
    // 卸下技能
    const newSkills = (player.skills || []).map(s =>
      s.id === skillId ? { ...s, equipped: false } : s
    );
    
    gs.updatePlayerStats({ skills: newSkills });
    this.eventBus.emit('skills:updated', gs.getState().player, 'game');
    
    const skillData = SkillsDB.getSkillById(skillId);
    return { success: true, message: `已卸下技能【${skillData?.name || skillId}】` };
  }

  getEquippedSkills(player = null) {
    if (!player) {
      player = this.getPlayer();
    }
    const equipped = (player.skills || [])
      .filter(s => s.equipped)
      .map(ps => {
        const skill = SkillsDB.getSkillById(ps.id);
        return skill ? { ...ps, skillData: skill } : null;
      })
      .filter(Boolean);
    
    // 确保最多返回6个，并按装备顺序排序
    return equipped.slice(0, 6);
  }

   // 战斗中：可用技能列表（只返回已装备的技能，过滤冷却/资源）
  getUsableSkills(battleState) {
    const player = battleState.player;
    const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
  
    return (player.skills || [])
      .filter(ps => ps.equipped) // 只返回已装备的技能
      .map(ps => {
        const skill = SkillsDB.getSkillById(ps.id);
        return skill ? { skill, level: ps.level, cooldownLeft: ps.cooldownLeft || 0 } : null;
      })
      .filter(Boolean)
      .filter(({ skill, level, cooldownLeft }) => {
        if (cooldownLeft && cooldownLeft > 0) return false;
        const lvIdx = level - 1;
        const baseMp = skill.cost?.mp?.[lvIdx] ?? 0;
        const baseSp = skill.cost?.sp?.[lvIdx] ?? 0;
  
        let finalMp = baseMp;
        let finalSp = baseSp;
  
        if (equipmentEffectService && typeof equipmentEffectService.modifySkillCost === 'function') {
          const costData = { skillId: skill.id, originalCost: { mp: baseMp, sp: baseSp } };
          const modified = equipmentEffectService.modifySkillCost(costData);
          finalMp = modified.modifiedCost?.mp ?? baseMp;
          finalSp = modified.modifiedCost?.sp ?? baseSp;
        }
  
        return (player.mana || 0) >= finalMp && (player.stamina || 0) >= finalSp;
      });
  }

  canUseSkill(battleState, skillId) {
    const player = battleState.player;
    const owned = (player.skills || []).find(s => s.id === skillId);
    if (!owned) return { ok: false, reason: '未学习此技能' };
    if ((owned.cooldownLeft || 0) > 0) return { ok: false, reason: '冷却中' };
    const skill = SkillsDB.getSkillById(skillId);
    
    // 新增：武器前提检查
    if (skill.weaponRequirement && skill.weaponRequirement.length > 0) {
      const hasValidWeapon = this.checkWeaponRequirement(skill.weaponRequirement);
      if (!hasValidWeapon) {
        const weaponNames = {
          'sword': '剑',
          'dagger': '匕首',
          'hammer': '锤',
          'axe': '斧',
          'bow': '弓',
          'staff': '法杖'
        };
        const reqNames = skill.weaponRequirement.map(w => weaponNames[w] || w).join('或');
        return { ok: false, reason: `需要装备${reqNames}` };
      }
    }
    
    const lvIdx = (owned.level || 1) - 1;
  
    const baseMpCost = skill.cost?.mp?.[lvIdx] ?? 0;
    const baseSpCost = skill.cost?.sp?.[lvIdx] ?? 0;
  
    let finalMpCost = baseMpCost;
    let finalSpCost = baseSpCost;
  
    const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
    if (equipmentEffectService && typeof equipmentEffectService.modifySkillCost === 'function') {
      const costData = { skillId, originalCost: { mp: baseMpCost, sp: baseSpCost } };
      const modified = equipmentEffectService.modifySkillCost(costData);
      finalMpCost = modified.modifiedCost?.mp ?? baseMpCost;
      finalSpCost = modified.modifiedCost?.sp ?? baseSpCost;
    }
  
    if ((player.mana || 0) < finalMpCost) return { ok: false, reason: '法力不足' };
    if ((player.stamina || 0) < finalSpCost) return { ok: false, reason: '耐力不足' };
    return { ok: true };
  }

  // 在战斗中释放技能（自动1v1目标为0；多目标可由调用方传入）
  useSkill(skillId, targetIndex) {
    const battleService = this.getBattleService();
    const battleState = battleService?.getBattleState();
    if (!battleService || !battleState || !battleState.isActive) {
      return { success: false, message: '当前没有进行中的战斗' };
    }
    const player = battleState.player;
    const enemies = battleState.enemies.filter(e => e.hp > 0);
    const owned = (player.skills || []).find(s => s.id === skillId);
    const skill = SkillsDB.getSkillById(skillId);
    if (!owned || !skill) return { success: false, message: '技能不可用' };

    // 自动目标（1v1）
    if (typeof targetIndex !== 'number') {
      targetIndex = enemies.length === 1 ? battleState.enemies.indexOf(enemies[0]) : 0;
    }
    const check = this.canUseSkill(battleState, skillId);
    if (!check.ok) return { success: false, message: check.reason };

    const lvIdx = (owned.level || 1) - 1;
    const baseMpCost = skill.cost?.mp?.[lvIdx] ?? 0;
    const baseSpCost = skill.cost?.sp?.[lvIdx] ?? 0;
    const cooldown = skill.cooldown?.[lvIdx] ?? 0;

    // 装备效果修改技能消耗
    let finalMpCost = baseMpCost;
    let finalSpCost = baseSpCost;
    const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
    if (equipmentEffectService && typeof equipmentEffectService.modifySkillCost === 'function') {
      const costData = { skillId, originalCost: { mp: baseMpCost, sp: baseSpCost } };
      const modified = equipmentEffectService.modifySkillCost(costData);
      finalMpCost = modified.modifiedCost?.mp ?? baseMpCost;
      finalSpCost = modified.modifiedCost?.sp ?? baseSpCost;
      // 事件广播（用于其他监听器日志）
      this.eventBus.emit('skill:cost:calculate', modified, 'game');
      console.debug(`[EFF] 技能消耗修正: MP ${baseMpCost} -> ${finalMpCost}, SP ${baseSpCost} -> ${finalSpCost}`);
    }

    let logMessage = '';
    let totalDamage = 0;
    let totalHeal = 0;

    // 资源消耗（应用装备效果后的消耗）
    player.mana = Math.max(0, (player.mana || 0) - finalMpCost);
    player.stamina = Math.max(0, (player.stamina || 0) - finalSpCost);

    // 伤害/治疗计算 - 统一公式（不在此处应用随机）
    const baseDmg = skill.baseDamage?.[lvIdx] ?? 0;
    const baseHeal = skill.baseHeal?.[lvIdx] ?? 0;
    const attackPower = player.attack || 0;

    // 技能伤害计算（统一公式）：
    // damage = (baseDamage + attackPower * 0.5) * (power/100 + 0.8)
    let finalDamage = 0;
    if (baseDmg > 0) {
      const power = skill.type === 'physical'
        ? (player.physicalPower || 0)
        : (skill.type === 'magic' ? (player.magicPower || 0) : 0);
      const unifiedDamage = (baseDmg + attackPower * 0.5) * (power / 100 + 0.8);
      finalDamage = Math.floor(unifiedDamage);
    }

    // 治疗计算沿用原逻辑（无随机）
    let finalHeal = 0;
    if (baseHeal > 0) {
      const magicPowerRatio = (player.magicPower || 0) / 100;
      const healAmount = baseHeal * 0.7 + attackPower * magicPowerRatio * 0.5;
      finalHeal = Math.floor(healAmount);
    }

    // 按类型应用（确保总是生成清晰的日志消息）
    if (skill.kind === 'active') {
      const baseMessage = `你施放【${skill.name}】`;
      const details = [];

      if (skill.type === 'support' && finalHeal > 0) {
        const oldHp = player.hp;
        player.hp = Math.min(player.maxHp, player.hp + finalHeal);
        totalHeal = player.hp - oldHp;
        details.push(`恢复了${totalHeal}点生命值`);
      } else if (skill.type !== 'support') {
        // 伤害技能 - 支持多段攻击和特殊效果
        const enemy = battleState.enemies[targetIndex];
        const battleService = this.getBattleService();
        const effectManager = window.gameCore?.getService('effectManager');
        
        // 检查多段攻击
        const hitCount = skill.specialEffects?.multiHit?.count || 1;
        let totalSkillDamage = 0;
        
        for (let hitIndex = 0; hitIndex < hitCount; hitIndex++) {
          // 检查敌人是否闪避（应用技能命中率加成）
          const hitBonus = this.calculateSkillHitBonus(skill, owned.level);
          const dodged = battleService && battleService.checkDodge ?
            battleService.checkDodge(player, enemy, hitBonus) : false;
          
          if (dodged) {
            if (hitCount === 1) {
              details.push(`${enemy.type}敏捷地闪避了你的${skill.name}！`);
            }
            continue;
          }
          
          let hitDamage = finalDamage;
          
          // 检查标记加成
          if (effectManager) {
            const markBonus = effectManager.getDamageBonus(enemy);
            if (markBonus > 0) {
              hitDamage = Math.floor(hitDamage * (1 + markBonus));
            }
          }
          
          // 检查玩家技能暴击（应用技能暴击率加成）
          const skillCritBonus = this.calculateSkillCritBonus(skill, owned.level);
          const isCritical = battleService && battleService.checkCriticalHit ?
            battleService.checkCriticalHit('player', skillCritBonus) : false;
          
          if (isCritical) {
            // 检查技能是否有自定义暴击倍率
            const critMultiplier = this.getSkillCritMultiplier(skill, owned.level);
            hitDamage = Math.floor(hitDamage * critMultiplier);
          }
          
          // 应用装备效果
          const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
          if (equipmentEffectService) {
            const damageData = {
              attacker: 'player',
              target: 'enemy',
              damage: hitDamage,
              damageType: skill.type,
              targetType: enemy.type || '',
              isCritical: isCritical
            };
            
            const modifiedData = equipmentEffectService.modifyDamage(damageData);
            hitDamage = modifiedData.modifiedDamage || hitDamage;
          }
          
          // 应用无视抗性（在最终一步统一应用随机浮动 90%-110%）
          const variance = Math.random() * 0.2 + 0.9;
          const variedDamage = Math.floor(hitDamage * variance);

          let actualDamage = variedDamage;
          if (skill.specialEffects?.penetration) {
            const penetration = skill.type === 'physical'
              ? (skill.specialEffects.penetration.physical || 0)
              : (skill.specialEffects.penetration.magic || 0);
            const originalResist = skill.type === 'physical'
              ? (enemy.physicalResistance || 0)
              : (enemy.magicResistance || 0);
            const effectiveResist = Math.max(0, originalResist - penetration);
            actualDamage = Math.floor(variedDamage * (1 - effectiveResist / 100));
          } else {
            actualDamage = battleService?.applyResistance(variedDamage, skill.type, enemy) || variedDamage;
          }

          actualDamage = Math.max(1, actualDamage - (enemy.defense || 0));
          enemy.hp = Math.max(0, enemy.hp - actualDamage);
          totalSkillDamage += actualDamage;
        }
        
        totalDamage = totalSkillDamage;
        
        // 生成伤害消息
        if (totalSkillDamage > 0) {
          if (hitCount > 1) {
            details.push(`连续攻击${hitCount}次，对${enemy.type}造成了${totalSkillDamage}点伤害`);
          } else {
            details.push(`对${enemy.type}造成了${totalSkillDamage}点伤害`);
          }
          
          // 检查即死效果
          if (skill.specialEffects?.execute && enemy.hp > 0) {
            const threshold = skill.specialEffects.execute.threshold;
            const hpPercent = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 0;
            if (hpPercent < threshold) {
              enemy.hp = 0;
              details.push(`触发即死效果！${enemy.type}被瞬间击杀`);
            }
          }
          
          if (enemy.hp <= 0) {
            details.push(`${enemy.type}被击败了`);
          }
          
          // 吸血效果
          if (skill.specialEffects?.lifesteal) {
            const healAmount = Math.floor(totalSkillDamage * skill.specialEffects.lifesteal.percent);
            const oldHp = player.hp;
            player.hp = Math.min(player.maxHp, player.hp + healAmount);
            const actualHeal = player.hp - oldHp;
            if (actualHeal > 0) {
              details.push(`吸取了${actualHeal}点生命值`);
            }
          }
        }
        
        // 应用特殊效果（DOT、控制、标记）
        if (effectManager && enemy.hp > 0) {
          // DOT效果
          if (skill.specialEffects?.dot) {
            effectManager.applyDOT(enemy, skill.specialEffects.dot, skillId);
            const dotName = {
              'burn': '灼烧',
              'poison': '中毒',
              'bleed': '流血'
            }[skill.specialEffects.dot.type] || skill.specialEffects.dot.type;
            details.push(`附加${dotName}效果`);
          }
          
          // 控制效果
          if (skill.specialEffects?.cc) {
            const ccResult = effectManager.applyCC(enemy, skill.specialEffects.cc, skillId);
            if (ccResult) {
              const ccName = {
                'stun': '晕眩',
                'freeze': '冰冻',
                'slow': '减速'
              }[skill.specialEffects.cc.type] || skill.specialEffects.cc.type;
              details.push(`附加${ccName}效果`);
            }
          }
          
          // 标记效果
          if (skill.specialEffects?.mark) {
            effectManager.applyMark(enemy, skill.specialEffects.mark, skillId);
            const bonus = Math.floor(skill.specialEffects.mark.damageBonus * 100);
            details.push(`标记敌人(受伤+${bonus}%)`);
          }
          
          // 反伤效果（应用到玩家自身）
          if (skill.specialEffects?.reflect) {
            effectManager.applyReflect(player, skill.specialEffects.reflect, skillId);
            const reflectPercent = Math.floor(skill.specialEffects.reflect.percent * 100);
            details.push(`获得${reflectPercent}%反伤护盾`);
          }
        }
      }

      // 特殊效果
      if (skill.effect?.kind === 'buff' && skill.effect.data?.defendNext) {
        player.defending = true;
        details.push('进入守备姿态');
      }
      if (skill.effect?.kind === 'restore' && Array.isArray(skill.effect.data?.mana)) {
        const gain = skill.effect.data.mana[lvIdx] || 0;
        const oldMana = player.mana;
        player.mana = Math.min(player.maxMana, player.mana + gain);
        const actual = player.mana - oldMana;
        if (actual > 0) {
          details.push(`恢复${actual}点法力`);
        }
      }

      // 组装日志
      if (details.length > 0) {
        logMessage = `${baseMessage}，${details.join('，')}！`;
      } else {
        logMessage = `${baseMessage}，但当前状态未产生效果。`;
      }
    }

    // 设置冷却
    owned.cooldownLeft = cooldown;

    // 写入战斗日志
    battleState.battleLog.push({
      type: 'player',
      message: logMessage,
      round: battleState.round
    });

    // 同步顶部栏玩家资源与技能冷却到全局状态
    const gs = this.getGameStateService();
    if (gs) {
      const pState = gs.getState().player;
      const syncedSkills = (pState.skills || []).map(s =>
        s.id === skillId ? { ...s, cooldownLeft: cooldown } : s
      );
      gs.updatePlayerStats({
        hp: player.hp,
        mana: player.mana,
        stamina: player.stamina,
        skills: syncedSkills
      });
    }

    // 刷新UI
    this.eventBus.emit('ui:battle:update', battleState, 'game');
    this.eventBus.emit('battle:skill:used', { skillId, level: owned.level, totalDamage, totalHeal }, 'game');

    return { success: true, message: logMessage };
  }

  // 冷却递减（旧：仅全局玩家；保留以兼容可能的外部调用）
  decreaseCooldowns() {
    const gs = this.getGameStateService();
    const player = gs.getState().player;
    const newSkills = (player.skills || []).map(s => {
      const left = Math.max(0, (s.cooldownLeft || 0) - 1);
      return { ...s, cooldownLeft: left };
    });
    gs.updatePlayerStats({ skills: newSkills });
  }

  // 冷却递减（新）：在战斗回合切换到玩家前，由BattleService显式调用，确保战斗内与全局状态同步
  tickCooldowns(battleState) {
    if (!battleState || !battleState.player) return;
    const player = battleState.player;

    // 递减战斗内技能冷却
    player.skills = (player.skills || []).map(s => {
      const left = Math.max(0, (s.cooldownLeft || 0) - 1);
      return { ...s, cooldownLeft: left };
    });

    // 同步到全局状态（用于技能页与顶部栏的一致显示）
    const gs = this.getGameStateService();
    if (gs) {
      const pState = gs.getState().player;
      const synced = (pState.skills || []).map(s => {
        const inBattle = player.skills.find(ps => ps.id === s.id);
        const left = inBattle ? (inBattle.cooldownLeft || 0) : (s.cooldownLeft || 0);
        return { ...s, cooldownLeft: left };
      });
      gs.updatePlayerStats({ skills: synced });
    }
  }

  // 计算技能命中率加成
  calculateSkillHitBonus(skill, level) {
    // 如果技能直接定义了命中率加成，使用它
    if (skill.hitBonus && Array.isArray(skill.hitBonus)) {
      const lvIdx = Math.max(0, Math.min(level - 1, skill.hitBonus.length - 1));
      return skill.hitBonus[lvIdx] || 0;
    }

    // 否则根据武器类型和技能特性自动计算
    let baseHitBonus = 0;

    // 1. 武器类型基础命中率加成
    if (skill.weaponRequirement && skill.weaponRequirement.length > 0) {
      const weaponType = skill.weaponRequirement[0];
      const weaponHitBonusMap = {
        'dagger': 18,     // 匕首：快速精准 15%-20%
        'bow': 12,        // 弓：瞄准精准 10%-15%
        'sword': 10,      // 剑：平衡 8%-12%
        'axe': 4,         // 斧：重型笨重 3%-5%
        'hammer': 5       // 锤：重型笨重 3%-6%
      };
      baseHitBonus = weaponHitBonusMap[weaponType] || 8;
    } else {
      // 通用技能
      if (skill.type === 'magic') {
        baseHitBonus = 12; // 魔法技能：法术制导 10%-15%
      } else {
        baseHitBonus = 7;  // 通用物理：基础 5%-8%
      }
    }

    // 2. 技能特性额外调整
    const tags = skill.tags || [];
    const specialEffects = skill.specialEffects || {};

    // 快速/连击类：+3%
    if (tags.includes('连击') || specialEffects.multiHit) {
      baseHitBonus += 3;
    }

    // 暴击导向：+2%
    if (tags.includes('暴击')) {
      baseHitBonus += 2;
    }

    // 精准/瞄准类：+5%
    if (skill.name.includes('瞄准') || skill.name.includes('精准') ||
        skill.name.includes('精确') || tags.includes('精准')) {
      baseHitBonus += 5;
    }

    // AOE范围技能：-4%（范围大但精准度降低）
    if (skill.target === 'aoe' && !tags.includes('精准')) {
      baseHitBonus -= 4;
    }

    // 重击/强力类：-2%
    if (tags.includes('强力') || tags.includes('重击') || tags.includes('爆发')) {
      baseHitBonus -= 2;
    }

    // 破甲类：+1%（精确打击弱点）
    if (tags.includes('破甲') || specialEffects.penetration) {
      baseHitBonus += 1;
    }

    // 支援/增益技能：必中
    if (skill.type === 'support') {
      baseHitBonus = 100; // 支援技能必定命中
    }

    // 确保在合理范围内
    return Math.max(0, Math.min(25, baseHitBonus));
  }

  // 计算技能暴击率加成
  calculateSkillCritBonus(skill, level) {
    // 如果技能直接定义了暴击率加成，使用它
    if (skill.critBonus && Array.isArray(skill.critBonus)) {
      const lvIdx = Math.max(0, Math.min(level - 1, skill.critBonus.length - 1));
      return skill.critBonus[lvIdx] || 0;
    }

    // 否则根据技能特性自动计算（仅针对描述中提到暴击的技能）
    const description = skill.description || '';
    const tags = skill.tags || [];

    // 如果描述中提到暴击率加成，尝试解析
    const critMatch = description.match(/暴击率\+(\d+)%/);
    if (critMatch) {
      return parseInt(critMatch[1]) || 0;
    }

    // 如果标签包含"暴击"，给予默认加成
    if (tags.includes('暴击')) {
      // 根据武器类型给予默认暴击加成
      if (skill.weaponRequirement) {
        const weaponType = skill.weaponRequirement[0];
        if (weaponType === 'dagger') return 15;  // 匕首高暴击
        if (weaponType === 'bow') return 10;     // 弓箭中等暴击
        if (weaponType === 'sword') return 8;    // 剑类中等暴击
      }
      return 5; // 其他暴击技能默认+5%
    }

    return 0; // 无暴击加成
  }

  // 获取技能暴击伤害倍率
  getSkillCritMultiplier(skill, level) {
    // 如果技能直接定义了暴击倍率，使用它
    if (skill.critMultiplier && Array.isArray(skill.critMultiplier)) {
      const lvIdx = Math.max(0, Math.min(level - 1, skill.critMultiplier.length - 1));
      return skill.critMultiplier[lvIdx] || 1.5;
    }

    // 检查描述中的特殊暴击倍率
    const description = skill.description || '';
    
    // 暴击×2倍
    if (description.includes('暴击时造成2倍伤害') || description.includes('暴击×2')) {
      return 2.0;
    }
    
    // 暴击×2.5倍
    if (description.includes('暴击时造成2.5倍伤害') || description.includes('暴击×2.5')) {
      return 2.5;
    }
    
    // 暴击×3倍
    if (description.includes('暴击×3') || description.includes('必定暴击×3')) {
      return 3.0;
    }
    
    // 暴击×4倍
    if (description.includes('暴击×4') || description.includes('必定暴击×4')) {
      return 4.0;
    }

    // 默认暴击倍率
    return 1.5;
  }
}

export default SkillService;