// views/SkillsView.js - 技能页面视图
import SkillsDB from '../data/Skills.js';

class SkillsView {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.modal = null;
    this.lastPayload = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 打开技能页面
    this.eventBus.on('ui:skills:show', this.showSkillsInterface.bind(this), 'game');
    // 技能学习/升级后刷新页面
    this.eventBus.on('skills:updated', this.refreshIfOpen.bind(this), 'game');
  }

  refreshIfOpen(player) {
    if (this.modal && this.lastPayload) {
      console.log('[SkillsView] refreshIfOpen 被调用 - 直接更新内容而不重建界面');
      const skillService = window.gameCore?.getService('skillService');
      if (skillService) {
        // 获取最新数据并直接更新界面内容，而不是重建整个弹窗
        const allSkills = SkillsDB.getAllSkills();
        const learnable = skillService.getLearnableSkills(player);
        const upgradable = skillService.getUpgradableSkills(player);
        const describe = (skill, level) => SkillsDB.describeLevel(skill, level);
        
        this.updateSkillsContent(player, allSkills, learnable, upgradable, describe);
      }
    }
  }

  showSkillsInterface(payload) {
    console.log('[SkillsView] showSkillsInterface 被调用');
    this.lastPayload = payload;
    const { player, allSkills, learnable, upgradable, describe } = payload;

    // 如果弹窗已存在，直接更新内容而不重建
    if (this.modal) {
      console.log('[SkillsView] 弹窗已存在，直接更新内容避免闪现');
      this.updateSkillsContent(player, allSkills, learnable, upgradable, describe);
      return;
    }

    // 只有在弹窗不存在时才创建新弹窗
    console.log('[SkillsView] 创建新的技能弹窗');

    // 构建弹窗
    const modal = document.createElement('div');
    modal.className = 'skills-modal';
    modal.innerHTML = `
      <div class="skills-content">
        <div class="skills-header">
          <h3>🧠 技能页</h3>
          <button class="close-button">×</button>
        </div>
        <div class="skills-topbar">
          <div class="top-stat">等级: Lv.${player.level}</div>
          <div class="top-stat">经验: ${player.experience}</div>
          <div class="top-stat">技能点: <span id="skillsPointsTop">${player.skillPoints || 0}</span></div>
          <div class="top-stat">MP: ${player.mana || 0}/${player.maxMana || 0}</div>
          <div class="top-stat">SP: ${player.stamina || 0}/${player.maxStamina || 0}</div>
        </div>
        <div class="skills-body">
          <div class="skills-section">
            <h4>📚 已掌握技能</h4>
            <div class="skills-grid" id="ownedSkillsGrid">
              ${this.renderOwnedSkills(player, allSkills, upgradable, describe)}
            </div>
          </div>
          <div class="skills-section">
            <h4>🌱 可学习技能</h4>
            <div class="skills-grid" id="learnableSkillsGrid">
              ${this.renderLearnableSkills(learnable, describe)}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;

    // 绑定事件
    const closeBtn = modal.querySelector('.close-button');
    closeBtn.addEventListener('click', () => this.close());

    // 学习事件
    modal.querySelectorAll('.skill-card .learn-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const skillId = btn.dataset.skill;
        this.learnSkill(skillId);
      });
    });

    // 升级事件
    modal.querySelectorAll('.skill-card .upgrade-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const skillId = btn.dataset.skill;
        this.upgradeSkill(skillId);
      });
    });
  }

  // 新增方法：更新技能内容而不重建弹窗
  updateSkillsContent(player, allSkills, learnable, upgradable, describe) {
    if (!this.modal) return;
    
    console.log('[SkillsView] 更新技能内容，避免重建弹窗');
    
    // 更新顶部状态栏
    const skillsPointsElement = this.modal.querySelector('#skillsPointsTop');
    if (skillsPointsElement) {
      skillsPointsElement.textContent = player.skillPoints || 0;
    }
    
    // 更新已掌握技能区域
    const ownedSkillsGrid = this.modal.querySelector('#ownedSkillsGrid');
    if (ownedSkillsGrid) {
      ownedSkillsGrid.innerHTML = this.renderOwnedSkills(player, allSkills, upgradable, describe);
    }
    
    // 更新可学习技能区域
    const learnableSkillsGrid = this.modal.querySelector('#learnableSkillsGrid');
    if (learnableSkillsGrid) {
      learnableSkillsGrid.innerHTML = this.renderLearnableSkills(learnable, describe);
    }
    
    // 重新绑定事件监听器
    this.rebindSkillEvents();
  }
  
  // 重新绑定技能按钮事件
  rebindSkillEvents() {
    if (!this.modal) return;
    
    // 学习事件
    this.modal.querySelectorAll('.skill-card .learn-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const skillId = btn.dataset.skill;
        this.learnSkill(skillId);
      });
    });

    // 升级事件
    this.modal.querySelectorAll('.skill-card .upgrade-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const skillId = btn.dataset.skill;
        this.upgradeSkill(skillId);
      });
    });
  }

  renderOwnedSkills(player, allSkills, upgradable, describe) {
    const uSet = new Set((upgradable || []).map(s => s.id));
    const owned = (player.skills || []).map(ps => {
      const skill = allSkills.find(s => s.id === ps.id) || SkillsDB.getSkillById(ps.id);
      if (!skill) return '';
      const lv = ps.level || 1;
      const canUpgrade = uSet.has(ps.id);
      return `
        <div class="skill-card owned">
          <div class="skill-title">
            ${skill.name} <span class="lv">Lv.${lv}</span>
          </div>
          <div class="skill-desc">${describe(skill, lv)}</div>
          <div class="skill-tags">${(skill.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
          <div class="skill-actions">
            ${canUpgrade ? `<button class="primary-button upgrade-btn" data-skill="${skill.id}">升级</button>`
                         : `<button class="secondary-button" disabled>不可升级</button>`}
          </div>
        </div>
      `;
    });

    if (owned.length === 0) {
      return '<div class="empty-hint">尚未掌握任何技能</div>';
    }
    return owned.join('');
  }

  renderLearnableSkills(learnable, describe) {
    if (!learnable || learnable.length === 0) {
      return '<div class="empty-hint">暂无可学习技能（未满足前置条件）</div>';
    }

    return learnable.map(skill => {
      // 检查技能点是否足够
      const skillService = window.gameCore?.getService('skillService');
      const player = skillService?.getPlayer();
      const canAfford = (player?.skillPoints || 0) > 0;
      
      return `
        <div class="skill-card learnable ${!canAfford ? 'insufficient-points' : ''}">
          <div class="skill-title">${skill.name} <span class="lv">Lv.1</span></div>
          <div class="skill-desc">${describe(skill, 1)}</div>
          <div class="skill-tags">${(skill.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
          <div class="skill-req">${this.renderRequirements(skill)}</div>
          <div class="skill-actions">
            ${canAfford
              ? `<button class="primary-button learn-btn" data-skill="${skill.id}">学习</button>`
              : `<button class="secondary-button" disabled title="技能点不足">学习 (技能点不足)</button>`
            }
          </div>
        </div>
      `;
    }).join('');
  }

  renderRequirements(skill) {
    const reqs = [];
    if (skill.requirements?.minLevel) {
      reqs.push(`需要等级 ≥ ${skill.requirements.minLevel}`);
    }
    if (skill.requirements?.requires?.length) {
      reqs.push(
        ...skill.requirements.requires.map(r => `需要技能 ${r.id} Lv.${r.level}`)
      );
    }
    if (reqs.length === 0) return '<span class="req ok">无前置要求</span>';
    return `<span class="req">${reqs.join('；')}</span>`;
  }

  learnSkill(skillId) {
    const skillService = window.gameCore?.getService('skillService');
    if (!skillService) return;
    const res = skillService.learnSkill(skillId);
    this.notify(res.message, res.success ? 'success' : 'warning');
    // 移除直接刷新调用，依赖 skills:updated 事件自动刷新
    console.log('[SkillsView] 学习技能完成，等待 skills:updated 事件刷新');
  }

  upgradeSkill(skillId) {
    const skillService = window.gameCore?.getService('skillService');
    if (!skillService) return;
    const res = skillService.upgradeSkill(skillId);
    this.notify(res.message, res.success ? 'success' : 'warning');
    // 移除直接刷新调用，依赖 skills:updated 事件自动刷新
    console.log('[SkillsView] 升级技能完成，等待 skills:updated 事件刷新');
  }

  notify(message, type = 'info') {
    this.eventBus.emit('ui:notification', message, 'game');
  }

  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}

export default SkillsView;

// 全局可用（调试）
window.SkillsView = SkillsView;