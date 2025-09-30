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

   // 战斗中：可用技能列表（过滤冷却/资源，应用装备效果的消耗修正）
  getUsableSkills(battleState) {
    const player = battleState.player;
    const equipmentEffectService = window.gameCore?.getService('equipmentEffectService');
  
    return (player.skills || [])
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

    // 伤害/治疗计算
    const baseDmg = skill.baseDamage?.[lvIdx] ?? 0;
    const baseHeal = skill.baseHeal?.[lvIdx] ?? 0;
    const phyCoef = skill.scaling?.physicalPowerCoef?.[lvIdx] ?? 0;
    const magCoef = skill.scaling?.magicPowerCoef?.[lvIdx] ?? 0;

    const variance = Math.random() * 0.3 + 0.85; // 85%-115%
    const damageScaling =
      baseDmg +
      (phyCoef ? (player.physicalPower || 0) * phyCoef : 0) +
      (magCoef ? (player.magicPower || 0) * magCoef : 0);
    const finalDamage = Math.floor(damageScaling * variance);

    const healScaling =
      baseHeal +
      (magCoef ? (player.magicPower || 0) * magCoef : 0);
    const finalHeal = Math.floor(healScaling);

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
        // 伤害技能
        const enemy = battleState.enemies[targetIndex];
        const actualDamage = Math.max(1, finalDamage - (enemy.defense || 0));
        enemy.hp = Math.max(0, enemy.hp - actualDamage);
        totalDamage = actualDamage;
        details.push(`对${enemy.type}造成了${actualDamage}点伤害`);
        if (enemy.hp <= 0) details.push(`${enemy.type}被击败了`);
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
}

export default SkillService;