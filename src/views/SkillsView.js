// views/SkillsView.js - 技能页面视图
import SkillsDB from '../data/Skills.js';
import SkillTreeLayoutEngine from '../utils/SkillTreeLayoutEngine.js';
import SkillTreeInteraction from '../utils/SkillTreeInteraction.js';
import SkillTreeConnector from '../utils/SkillTreeConnector.js';

class SkillsView {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.modal = null;
    this.lastPayload = null;
    
    // 交互式技能树相关
    this.treeInteraction = null;
    this.treeConnector = null;
    this.currentTreeData = null;
    
    // 视图状态持久化键名
    this.STORAGE_KEY = 'skillsTreeView:v2';

    // 默认聚焦参数（可按需调整）
    this.DEFAULT_FOCUS_SCALE = 0.75;
    this.DEFAULT_FOCUS_OFFSET_X = -280;   // 正值向右
    this.DEFAULT_FOCUS_OFFSET_Y = 290;  // 正值代表让节点更靠上显示（内部会取负）
    
    // 三个分类独立的连接线偏移量配置
    this.CATEGORY_OFFSETS = {
      physical: { x: -1880, y: -148 },  // 物理技能树偏移（当前默认值）
      magic: { x: -1955, y: -148 },     // 魔法技能树偏移（需要调整）
      passive: { x: -380, y: -148 }    // 被动技能树偏移（需要调整）
    };

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
        <div class="skills-body-with-slots">
          <!-- 左侧技能装备槽 -->
          <div class="skills-equipment-area">
            <!-- 视图切换按钮移到技能槽上方 -->
            <div class="skills-view-switcher">
              <button class="view-btn active" data-view="tree" id="viewBtnTree">
                🌳 技能树
              </button>
              <button class="view-btn" data-view="list" id="viewBtnList">
                📋 列表
              </button>
            </div>
            
            <h4>⚔️ 战斗技能槽</h4>
            <div class="skill-slots" id="skillSlots">
              ${this.renderSkillSlots(player)}
            </div>
            <div class="skill-slot-hint">拖拽或点击技能装备/卸下<br>最多装备6个技能</div>
          </div>
          
          <!-- 右侧技能展示区域 -->
          <div class="skills-list-area">
            <!-- 技能树视图 -->
            <div class="skills-tree-view" id="skillsTreeView">
              ${this.renderSkillTree(player, allSkills)}
            </div>
            
            <!-- 列表视图（原有的） -->
            <div class="skills-list-view hidden" id="skillsListView">
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
        </div>
      </div>
    `;

    
    // 将弹窗插入DOM并设置引用后再初始化交互式技能树
    document.body.appendChild(modal);
    this.modal = modal;
    this.initInteractiveTree(player, allSkills);

    // 绑定事件
    const closeBtn = modal.querySelector('.close-button');
    closeBtn.addEventListener('click', () => this.close());

    this.bindSkillCardEvents(modal);
    this.bindSkillSlotEvents(modal);
    this.bindViewSwitchEvents(modal);
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
    
    // 更新技能槽
    const skillSlots = this.modal.querySelector('#skillSlots');
    if (skillSlots) {
      skillSlots.innerHTML = this.renderSkillSlots(player);
    }
    
    // 更新已掌握技能区域（列表视图）
    const ownedSkillsGrid = this.modal.querySelector('#ownedSkillsGrid');
    if (ownedSkillsGrid) {
      ownedSkillsGrid.innerHTML = this.renderOwnedSkills(player, allSkills, upgradable, describe);
    }
    
    // 更新可学习技能区域（列表视图）
    const learnableSkillsGrid = this.modal.querySelector('#learnableSkillsGrid');
    if (learnableSkillsGrid) {
      learnableSkillsGrid.innerHTML = this.renderLearnableSkills(learnable, describe);
    }
    
    // 🆕 更新技能树视图
    this.refreshSkillTree(player, allSkills);
    
    // 重新绑定事件监听器
    this.rebindSkillEvents();
    this.bindSkillSlotEvents(this.modal);
  }
  
  // 🆕 刷新技能树视图
  refreshSkillTree(player, allSkills) {
    if (!this.currentTreeData) return;
    
    const skillService = window.gameCore?.getService('skillService');
    if (!skillService) return;
    
    console.log('[SkillsView] 刷新技能树视图');
    
    // 重新渲染当前激活的分类
    const activeTab = this.modal.querySelector('.tree-tab.active');
    if (!activeTab) return;
    
    const category = activeTab.dataset.category;
    const container = this.modal.querySelector(`#${category}Nodes`);
    if (!container) return;
    
    // 使用布局引擎重新计算
    const layoutEngine = new SkillTreeLayoutEngine({
      nodeWidth: 100,
      nodeHeight: 100,
      levelHeight: 150,
      siblingSpacing: 50,
      subtreeSpacing: 80
    });
    
    const result = layoutEngine.simpleLayout(allSkills, category);
    
    if (result.nodes.length === 0) {
      container.innerHTML = '<div class="no-skills-message">该分类暂无技能</div>';
      return;
    }
    
    // 更新节点状态
    result.nodes.forEach(node => {
      node.data.state = this.getNodeState(node.data, player, skillService);
    });
    
    // 重新渲染节点
    const nodesHTML = result.nodes.map(node => {
      return this.renderInteractiveNode(node, player, skillService);
    }).join('');
    
    container.innerHTML = nodesHTML;
    
    // 更新树数据
    this.currentTreeData[category] = { nodes: result.nodes, bounds: result.bounds };
    
    // 重新绘制连接线
    this.drawConnectionsForCategory(category);
    
    // 重新绑定节点事件
    this.bindInteractiveNodeEvents();
  }
  
  // 重新绑定技能按钮事件
  rebindSkillEvents() {
    if (!this.modal) return;
    this.bindSkillCardEvents(this.modal);
  }

  // 绑定技能卡片事件
  bindSkillCardEvents(modal) {
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

    // 点击已掌握的技能卡片装备/卸下
    modal.querySelectorAll('.skill-card.owned').forEach(card => {
      card.addEventListener('click', (e) => {
        // 避免触发升级按钮的事件
        if (e.target.closest('.upgrade-btn')) return;
        
        const skillId = card.dataset.skillId;
        if (skillId) {
          this.toggleEquipSkill(skillId);
        }
      });

      // 拖拽开始
      card.addEventListener('dragstart', (e) => {
        const skillId = card.dataset.skillId;
        e.dataTransfer.setData('text/plain', skillId);
        e.dataTransfer.setData('application/json', JSON.stringify({ skillId }));
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('dragging');
      });

      // 拖拽结束
      card.addEventListener('dragend', (e) => {
        card.classList.remove('dragging');
      });
    });
  }

  // 绑定技能槽事件
  bindSkillSlotEvents(modal) {
    const slots = modal.querySelectorAll('.skill-slot');
    
    slots.forEach((slot, index) => {
      // 点击槽位卸下技能
      slot.addEventListener('click', (e) => {
        const skillId = slot.dataset.skillId;
        if (skillId) {
          this.unequipSkillFromSlot(skillId);
        }
      });

      // 拖拽放置
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        slot.classList.add('drag-over');
      });

      slot.addEventListener('dragleave', (e) => {
        if (!slot.contains(e.relatedTarget)) {
          slot.classList.remove('drag-over');
        }
      });

      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        
        try {
          const jsonData = e.dataTransfer.getData('application/json');
          const textData = e.dataTransfer.getData('text/plain');
          
          let skillId;
          if (jsonData) {
            const data = JSON.parse(jsonData);
            skillId = data.skillId;
          } else if (textData) {
            skillId = textData;
          }
          
          if (skillId) {
            this.equipSkillToSlot(skillId, index);
          }
        } catch (error) {
          console.error('[SkillsView] 拖拽失败:', error);
          this.notify('装备技能失败', 'error');
        }
      });
    });
  }

  // 渲染技能槽
  renderSkillSlots(player) {
    const equippedSkills = (player.skills || []).filter(s => s.equipped);
    const slots = [];
    
    for (let i = 0; i < 6; i++) {
      const skill = equippedSkills[i];
      if (skill) {
        const skillData = SkillsDB.getSkillById(skill.id);
        slots.push(`
          <div class="skill-slot filled" data-skill-id="${skill.id}" data-slot-index="${i}" draggable="false">
            <div class="skill-slot-content">
              <div class="skill-slot-name">${skillData?.name || skill.id}</div>
              <div class="skill-slot-level">Lv.${skill.level}</div>
              <div class="skill-slot-icon">✨</div>
            </div>
            <div class="skill-slot-remove">×</div>
          </div>
        `);
      } else {
        slots.push(`
          <div class="skill-slot empty" data-slot-index="${i}">
            <div class="skill-slot-placeholder">
              <div class="slot-number">${i + 1}</div>
              <div class="slot-hint">拖拽技能至此</div>
            </div>
          </div>
        `);
      }
    }
    
    return slots.join('');
  }

  renderOwnedSkills(player, allSkills, upgradable, describe) {
    const uSet = new Set((upgradable || []).map(s => s.id));
    const owned = (player.skills || []).map(ps => {
      const skill = allSkills.find(s => s.id === ps.id) || SkillsDB.getSkillById(ps.id);
      if (!skill) return '';
      const lv = ps.level || 1;
      const canUpgrade = uSet.has(ps.id);
      const isEquipped = ps.equipped || false;
      return `
        <div class="skill-card owned ${isEquipped ? 'equipped' : ''}" data-skill-id="${skill.id}" draggable="true">
          <div class="skill-title">
            ${skill.name} <span class="lv">Lv.${lv}</span>
            ${isEquipped ? '<span class="equipped-badge">已装备</span>' : ''}
          </div>
          ${this.renderWeaponRequirement(skill)}
          <div class="skill-desc">${describe(skill, lv)}</div>
          ${this.renderSpecialEffects(skill)}
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
          ${this.renderWeaponRequirement(skill)}
          <div class="skill-desc">${describe(skill, 1)}</div>
          ${this.renderSpecialEffects(skill)}
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

  // 构建技能树结构（按分类和等级层级）
  buildSkillTree(allSkills) {
    const tree = {
      physical: [],
      magic: [],
      passive: []
    };
    
    allSkills.forEach(skill => {
      const category = skill.tags?.includes('物理') ? 'physical'
                     : skill.tags?.includes('魔法') ? 'magic'
                     : 'passive';
      
      tree[category].push({
        ...skill,
        tier: this.calculateSkillTier(skill, allSkills)
      });
    });
    
    // 按层级排序
    ['physical', 'magic', 'passive'].forEach(cat => {
      tree[cat].sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
    });
    
    return tree;
  }
  
  // 计算技能层级（基于前置条件的深度）
  calculateSkillTier(skill, allSkills, visited = new Set()) {
    if (visited.has(skill.id)) return 0;
    visited.add(skill.id);
    
    if (!skill.requirements?.requires?.length) {
      return 0; // 基础技能
    }
    
    let maxTier = 0;
    skill.requirements.requires.forEach(req => {
      const reqSkill = allSkills.find(s => s.id === req.id);
      if (reqSkill) {
        const reqTier = this.calculateSkillTier(reqSkill, allSkills, new Set(visited));
        maxTier = Math.max(maxTier, reqTier + 1);
      }
    });
    
    return maxTier;
  }
  
  // 渲染技能树（新版：可交互树状图）
  renderSkillTree(player, allSkills) {
    const learnedSkillIds = new Set((player.skills || []).map(s => s.id));
    const skillService = window.gameCore?.getService('skillService');
    
    return `
      <div class="skill-tree-tabs">
        <button class="tree-tab active" data-category="physical">⚔️ 物理</button>
        <button class="tree-tab" data-category="magic">✨ 魔法</button>
        <button class="tree-tab" data-category="passive">🛡️ 被动</button>
      </div>
      
      <!-- 交互式技能树容器 -->
      <div class="interactive-tree-container">
        <!-- 控制栏 -->
        <div class="tree-controls">
          <button id="zoomIn" title="放大 (+)">🔍+</button>
          <button id="zoomOut" title="缩小 (-)">🔍-</button>
          <button id="zoomReset" title="重置视图 (0)">⟲</button>
          <button id="fitScreen" title="适应屏幕 (F)">⛶</button>
          <span id="scaleDisplay">100%</span>
        </div>
        
        <!-- 画布容器 -->
        <div class="tree-canvas-wrapper" id="treeCanvasWrapper">
          <div class="tree-canvas" id="treeCanvas">
            <!-- SVG连接线层 -->
            <svg class="tree-connections" id="treeConnections">
              <defs></defs>
            </svg>
            
            <!-- 节点层（动态渲染） -->
            <div class="tree-nodes-container" id="treeNodesContainer">
              <!-- 物理技能树 -->
              <div class="tree-category-nodes active" data-category="physical" id="physicalNodes"></div>
              <!-- 魔法技能树 -->
              <div class="tree-category-nodes" data-category="magic" id="magicNodes"></div>
              <!-- 被动技能树 -->
              <div class="tree-category-nodes" data-category="passive" id="passiveNodes"></div>
            </div>
          </div>
        </div>
        
        <!-- 提示信息 -->
        <div class="tree-hint">
          💡 滚轮缩放 | 拖动平移 | 点击节点操作
        </div>
      </div>
    `;
  }
  
  // 渲染单个技能分类的树状图
  renderSkillCategory(skills, category, player, learnedSkillIds, skillService) {
    const categoryClass = category === 'physical' ? 'active' : 'hidden';
    
    // 按层级分组
    const tiers = {};
    skills.forEach(skill => {
      const tier = skill.tier || 0;
      if (!tiers[tier]) tiers[tier] = [];
      tiers[tier].push(skill);
    });
    
    let html = `<div class="tree-category" data-category="${category}" class="${categoryClass}">`;
    
    Object.keys(tiers).sort((a, b) => a - b).forEach(tier => {
      const tierSkills = tiers[tier];
      html += `
        <div class="skill-tier" data-tier="${tier}">
          <div class="tier-label">Tier ${parseInt(tier) + 1}</div>
          <div class="tier-nodes">
            ${tierSkills.map(skill => this.renderSkillNode(skill, player, learnedSkillIds, skillService)).join('')}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  // 渲染单个技能节点
  renderSkillNode(skill, player, learnedSkillIds, skillService) {
    const isLearned = learnedSkillIds.has(skill.id);
    const playerSkill = isLearned ? player.skills.find(s => s.id === skill.id) : null;
    const isEquipped = playerSkill?.equipped || false;
    const level = playerSkill?.level || 0;
    const maxLevel = skill.maxLevel || 5;
    
    // 判断节点状态（修复：添加upgradable状态）
    let state = 'locked';
    let canUpgrade = false;
    
    if (isLearned) {
      // 已学习的技能
      if (level < maxLevel) {
        // 未满级，检查是否可以升级
        canUpgrade = skillService && skillService.canUpgrade(player, skill.id).ok;
        state = canUpgrade ? 'upgradable' : 'owned';
      } else {
        // 已满级
        state = 'maxlevel';
      }
      
      // 已装备的优先级最高
      if (isEquipped) {
        state = 'equipped';
      }
    } else if (skillService) {
      // 未学习，检查是否满足前置条件
      const canLearn = skillService.canLearnIgnoreSkillPoints(player, skill.id);
      if (canLearn.ok) {
        state = 'learnable';
      }
    }
    
    // 获取技能图标
    const icon = this.getSkillIcon(skill);
    
    return `
      <div class="skill-tree-node ${state}"
           data-skill-id="${skill.id}"
           data-state="${state}"
           data-skill-data='${JSON.stringify({
             id: skill.id,
             name: skill.name,
             level: level,
             maxLevel: maxLevel,
             isLearned: isLearned,
             isEquipped: isEquipped,
             canUpgrade: canUpgrade
           })}'
           title="${skill.name}">
        <div class="node-main">
          <div class="node-icon">${icon}</div>
          ${isLearned ? `<div class="node-level">Lv.${level}/${maxLevel}</div>` : ''}
          ${isEquipped ? '<div class="node-equipped">✓</div>' : ''}
          ${canUpgrade && !isEquipped ? '<div class="node-upgradable">⬆</div>' : ''}
        </div>
        <div class="node-name">${skill.name}</div>
      </div>
    `;
  }
  
  // 获取技能图标
  getSkillIcon(skill) {
    // 根据技能类型和标签返回图标
    if (skill.tags?.includes('火焰')) return '🔥';
    if (skill.tags?.includes('冰霜')) return '❄️';
    if (skill.tags?.includes('雷电')) return '⚡';
    if (skill.tags?.includes('神圣')) return '✨';
    if (skill.tags?.includes('暗黑')) return '🌑';
    if (skill.tags?.includes('剑术')) return '⚔️';
    if (skill.tags?.includes('重击')) return '🔨';
    if (skill.tags?.includes('射击')) return '🏹';
    
    // 默认图标
    return skill.tags?.includes('物理') ? '⚔️' : skill.tags?.includes('魔法') ? '✨' : '🛡️';
  }
  
  // 绑定视图切换事件
  bindViewSwitchEvents(modal) {
    const viewBtns = modal.querySelectorAll('.view-btn');
    const treeView = modal.querySelector('#skillsTreeView');
    const listView = modal.querySelector('#skillsListView');
    
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        
        // 更新按钮状态
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 切换视图
        if (view === 'tree') {
          treeView.classList.remove('hidden');
          listView.classList.add('hidden');
        } else {
          treeView.classList.add('hidden');
          listView.classList.remove('hidden');
        }
      });
    });
    
    // 技能树分类切换
    const treeTabs = modal.querySelectorAll('.tree-tab');
    const treeCategories = modal.querySelectorAll('.tree-category');
    
    treeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.category;
        
        // 更新标签状态
        treeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 切换分类
        treeCategories.forEach(cat => {
          if (cat.dataset.category === category) {
            cat.classList.remove('hidden');
          } else {
            cat.classList.add('hidden');
          }
        });
      });
    });
    
    // 技能树节点鼠标悬浮事件（显示tooltip）
    modal.querySelectorAll('.skill-tree-node').forEach(node => {
      node.addEventListener('mouseenter', (e) => {
        const skillId = node.dataset.skillId;
        this.showSkillTooltip(node, skillId);
      });
      
      node.addEventListener('mouseleave', () => {
        this.hideSkillTooltip();
      });
    });
    
    // 技能树节点点击事件（修复：显示操作弹窗而不是直接操作）
    modal.querySelectorAll('.skill-tree-node').forEach(node => {
      node.addEventListener('click', (e) => {
        const skillId = node.dataset.skillId;
        const state = node.dataset.state;
        
        // 锁定状态不可点击
        if (state === 'locked') {
          return;
        }
        
        // 隐藏tooltip
        this.hideSkillTooltip();
        
        // 显示操作弹窗
        this.showSkillActionDialog(skillId, state);
      });
    });
  }

  // 渲染武器要求
  renderWeaponRequirement(skill) {
    if (!skill.weaponRequirement || skill.weaponRequirement.length === 0) {
      return '';
    }
    
    const weaponIcons = {
      'sword': '⚔️',
      'dagger': '🗡️',
      'hammer': '🔨',
      'axe': '🪓',
      'bow': '🏹',
      'staff': '🪄',
      'spear': '🔱',
      'mace': '⚒️'
    };
    
    const weaponNames = {
      'sword': '剑',
      'dagger': '匕首',
      'hammer': '锤',
      'axe': '斧',
      'bow': '弓',
      'staff': '法杖',
      'spear': '矛',
      'mace': '锤棍'
    };
    
    const icons = skill.weaponRequirement.map(w => weaponIcons[w] || '⚔️').join('');
    const names = skill.weaponRequirement.map(w => weaponNames[w] || w).join('/');
    
    // 检查玩家是否满足武器要求
    // 从全局状态读取已装备武器（兼容双持）
    const gameStateService = window.gameCore?.getService('gameStateService');
    const playerState = gameStateService?.getState()?.player;
    const equipment = playerState?.equipment || {};
    const equippedWeapon = equipment.weapon1 || equipment.weapon2 || null;

    // 要求数组：如 ['sword','dagger','bow','staff','axe','hammer']
    const required = Array.isArray(skill.weaponRequirement) ? skill.weaponRequirement : [];
    let isMet = false;
    if (equippedWeapon) {
      // 装备上暴露的类型维度：subType（如 'sword','dagger'）、weaponSubCategory（如 'dagger','oneHandSword'）、weaponCategory（如 'sword','bow'）
      const candidates = [equippedWeapon.subType, equippedWeapon.weaponSubCategory, equippedWeapon.weaponCategory].filter(Boolean);
      isMet = required.some(req => candidates.includes(req));
    }
    
    return `
      <div class="weapon-requirement ${isMet ? 'met' : 'not-met'}">
        <span class="weapon-icons">${icons}</span>
        <span class="weapon-text">需要：${names}</span>
        ${!isMet ? '<span class="not-met-indicator">❌</span>' : '<span class="met-indicator">✓</span>'}
      </div>
    `;
  }

  // 渲染技能特殊效果徽章
  renderSpecialEffects(skill) {
    if (!skill.specialEffects) return '';
    
    const effects = [];
    const se = skill.specialEffects;
    
    // 多段攻击
    if (se.multiHit) {
      effects.push(`<div class="effect-badge multi-hit">⚡×${se.multiHit.count}</div>`);
    }
    
    // DOT效果
    if (se.dot) {
      const dotIcons = { burn: '🔥', poison: '🟢', bleed: '🩸' };
      const icon = dotIcons[se.dot.type] || '💢';
      effects.push(`<div class="effect-badge dot">${icon}${se.dot.duration}回合</div>`);
    }
    
    // 控制效果
    if (se.cc) {
      const ccIcons = { stun: '💫', freeze: '❄️', slow: '🐌' };
      const icon = ccIcons[se.cc.type] || '💫';
      effects.push(`<div class="effect-badge cc">${icon}${se.cc.duration}回合</div>`);
    }
    
    // 吸血
    if (se.lifesteal) {
      effects.push(`<div class="effect-badge lifesteal">🧛${Math.floor(se.lifesteal.percent*100)}%</div>`);
    }
    
    // 穿透
    if (se.penetration) {
      if (se.penetration.physical > 0) {
        effects.push(`<div class="effect-badge pen">🗡️-${se.penetration.physical}%抗性</div>`);
      }
      if (se.penetration.magic > 0) {
        effects.push(`<div class="effect-badge pen">✨-${se.penetration.magic}%魔抗</div>`);
      }
    }
    
    // 斩杀
    if (se.execute) {
      effects.push(`<div class="effect-badge execute">💀<${Math.floor(se.execute.threshold*100)}%</div>`);
    }
    
    // 标记
    if (se.mark) {
      effects.push(`<div class="effect-badge mark">🎯+${Math.floor(se.mark.damageBonus*100)}%</div>`);
    }
    
    // 反伤
    if (se.reflect) {
      effects.push(`<div class="effect-badge reflect">🛡️${Math.floor(se.reflect.percent*100)}%</div>`);
    }
    
    return effects.length > 0 ? `
      <div class="special-effects-container">
        ${effects.join('')}
      </div>
    ` : '';
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

  // 装备技能到槽位
  equipSkillToSlot(skillId, slotIndex) {
    const skillService = window.gameCore?.getService('skillService');
    if (!skillService) return;
    
    const res = skillService.equipSkill(skillId, slotIndex);
    // 已取消技能装备通知
    // this.notify(res.message, res.success ? 'success' : 'warning');
  }

  // 从槽位卸下技能
  unequipSkillFromSlot(skillId) {
    const skillService = window.gameCore?.getService('skillService');
    if (!skillService) return;
    
    const res = skillService.unequipSkill(skillId);
    // 已取消技能卸下通知
    // this.notify(res.message, res.success ? 'success' : 'warning');
  }

  // ==================== 新增：Tooltip 功能 ====================
  
  showSkillTooltip(nodeElement, skillId) {
    // 移除已存在的tooltip
    this.hideSkillTooltip();
    
    const skill = SkillsDB.getSkillById(skillId);
    if (!skill) return;
    
    const skillService = window.gameCore?.getService('skillService');
    const player = skillService?.getPlayer();
    const playerSkill = player?.skills?.find(s => s.id === skillId);
    const level = playerSkill?.level || 1;
    const maxLevel = skill.maxLevel || 5;
    
    // 创建tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'skill-tooltip';
    tooltip.id = 'skillTooltip';
    
    // 填充内容
    tooltip.innerHTML = this.renderTooltipContent(skill, playerSkill, level, maxLevel, player);
    
    // 添加到body
    document.body.appendChild(tooltip);
    
    // 定位tooltip
    this.positionTooltip(tooltip, nodeElement);
  }
  
  hideSkillTooltip() {
    const tooltip = document.getElementById('skillTooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }
  
  renderTooltipContent(skill, playerSkill, level, maxLevel, player) {
    const isLearned = !!playerSkill;
    const lvIdx = level - 1;
    
    // 基础数据
    const baseDmg = skill.baseDamage?.[lvIdx] ?? 0;
    const baseHeal = skill.baseHeal?.[lvIdx] ?? 0;
    const mpCost = skill.cost?.mp?.[lvIdx] ?? 0;
    const spCost = skill.cost?.sp?.[lvIdx] ?? 0;
    const cooldown = skill.cooldown?.[lvIdx] ?? 0;
    
    // 升级预览
    let upgradePreview = '';
    if (isLearned && level < maxLevel) {
      const nextLvIdx = level;
      const nextDmg = skill.baseDamage?.[nextLvIdx] ?? 0;
      const nextHeal = skill.baseHeal?.[nextLvIdx] ?? 0;
      const nextMp = skill.cost?.mp?.[nextLvIdx] ?? 0;
      const nextSp = skill.cost?.sp?.[nextLvIdx] ?? 0;
      
      upgradePreview = `
        <div class="tooltip-upgrade-preview">
          <div class="upgrade-title">升级至 Lv.${level + 1}：</div>
          ${baseDmg > 0 ? `<div class="upgrade-change">基础伤害：${baseDmg} → <span class="new-value">${nextDmg}</span> <span class="increase">(+${nextDmg - baseDmg})</span></div>` : ''}
          ${baseHeal > 0 ? `<div class="upgrade-change">基础治疗：${baseHeal} → <span class="new-value">${nextHeal}</span> <span class="increase">(+${nextHeal - baseHeal})</span></div>` : ''}
          ${mpCost !== nextMp ? `<div class="upgrade-change">消耗MP：${mpCost} → <span class="new-value">${nextMp}</span> <span class="increase">(${nextMp > mpCost ? '+' : ''}${nextMp - mpCost})</span></div>` : ''}
          ${spCost !== nextSp ? `<div class="upgrade-change">消耗SP：${spCost} → <span class="new-value">${nextSp}</span> <span class="increase">(${nextSp > spCost ? '+' : ''}${nextSp - spCost})</span></div>` : ''}
        </div>
      `;
    }
    
    // 前置条件
    let requirements = '<div class="req-item met">✓ 无前置要求</div>';
    if (skill.requirements) {
      const reqs = [];
      if (skill.requirements.minLevel) {
        const met = player.level >= skill.requirements.minLevel;
        reqs.push(`<div class="req-item ${met ? 'met' : ''}">${met ? '✓' : '✗'} 等级 ≥ ${skill.requirements.minLevel}</div>`);
      }
      if (skill.requirements.requires?.length) {
        skill.requirements.requires.forEach(req => {
          const reqSkill = player?.skills?.find(s => s.id === req.id);
          const met = reqSkill && reqSkill.level >= req.level;
          const reqSkillData = SkillsDB.getSkillById(req.id);
          reqs.push(`<div class="req-item ${met ? 'met' : ''}">${met ? '✓' : '✗'} ${reqSkillData?.name || req.id} Lv.${req.level}</div>`);
        });
      }
      if (reqs.length > 0) {
        requirements = reqs.join('');
      }
    }
    
    return `
      <div class="tooltip-header">
        <span class="tooltip-icon">${this.getSkillIcon(skill)}</span>
        <span class="tooltip-name">${skill.name}</span>
        <span class="tooltip-level">${isLearned ? `Lv.${level}/${maxLevel}` : 'Lv.1'}</span>
      </div>
      
      <div class="tooltip-tags">
        ${(skill.tags || []).map(tag => `<span class="tag ${tag === '物理' ? 'physical' : tag === '魔法' ? 'magic' : ''}">${tag}</span>`).join('')}
      </div>
      
      ${this.renderWeaponRequirement(skill)}
      
      <div class="tooltip-stats">
        ${baseDmg > 0 ? `<div class="stat-row"><span class="stat-label">基础伤害：</span><span class="stat-value">${baseDmg}</span></div>` : ''}
        ${baseHeal > 0 ? `<div class="stat-row"><span class="stat-label">基础治疗：</span><span class="stat-value">${baseHeal}</span></div>` : ''}
        <div class="stat-row">
          <span class="stat-label">消耗：</span>
          <span class="stat-value">MP: ${mpCost} / SP: ${spCost}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">冷却：</span>
          <span class="stat-value">${cooldown}回合</span>
        </div>
      </div>
      
      ${this.renderSpecialEffects(skill)}
      
      ${!isLearned ? `
        <div class="tooltip-requirements">
          <div class="req-title">前置条件：</div>
          ${requirements}
        </div>
      ` : ''}
      
      ${upgradePreview}
      
      <div class="tooltip-description">
        ${SkillsDB.describeLevel(skill, level)}
      </div>
    `;
  }
  
  positionTooltip(tooltip, nodeElement) {
    const rect = nodeElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // 默认显示在右侧
    let left = rect.right + 10;
    let top = rect.top;
    
    // 边界检测：如果右侧空间不足，显示在左侧
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = rect.left - tooltipRect.width - 10;
    }
    
    // 边界检测：如果上方空间不足，向下调整
    if (top + tooltipRect.height > window.innerHeight - 10) {
      top = window.innerHeight - tooltipRect.height - 10;
    }
    
    // 确保不超出屏幕顶部
    if (top < 10) {
      top = 10;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }
  
  // ==================== 新增：操作弹窗功能 ====================
  
  showSkillActionDialog(skillId, state) {
    // 移除已存在的弹窗
    this.hideSkillActionDialog();
    
    const skill = SkillsDB.getSkillById(skillId);
    if (!skill) return;
    
    const skillService = window.gameCore?.getService('skillService');
    const player = skillService?.getPlayer();
    const playerSkill = player?.skills?.find(s => s.id === skillId);
    const isLearned = !!playerSkill;
    const level = playerSkill?.level || 0;
    const maxLevel = skill.maxLevel || 5;
    const isEquipped = playerSkill?.equipped || false;
    const skillPoints = player?.skillPoints || 0;
    
    // 创建弹窗
    const dialog = document.createElement('div');
    dialog.className = 'skill-action-dialog';
    dialog.id = 'skillActionDialog';
    
    // 判断可用操作
    const canLearn = !isLearned && skillService.canLearn(player, skillId).ok;
    const canUpgrade = isLearned && level < maxLevel && skillService.canUpgrade(player, skillId).ok;
    const canEquip = isLearned && !isEquipped;
    const canUnequip = isLearned && isEquipped;
    
    dialog.innerHTML = `
      <div class="dialog-overlay"></div>
      <div class="dialog-box">
        <button class="dialog-close">×</button>
        
        <div class="dialog-skill-info">
          <div class="skill-icon-large">${this.getSkillIcon(skill)}</div>
          <div class="skill-title">
            <h3>${skill.name}</h3>
            <p class="skill-level">${isLearned ? `当前等级：Lv.${level}/${maxLevel}` : '未学习'}</p>
          </div>
        </div>
        
        ${isLearned ? `
          <div class="dialog-current-effect">
            <h4>当前效果</h4>
            <div class="effect-text">${SkillsDB.describeLevel(skill, level)}</div>
          </div>
        ` : ''}
        
        ${canUpgrade ? `
          <div class="dialog-upgrade-effect">
            <h4>升级至 Lv.${level + 1} 后</h4>
            <div class="effect-text">${SkillsDB.describeLevel(skill, level + 1)}</div>
          </div>
        ` : ''}
        
        <div class="dialog-actions">
          ${canLearn ? `
            <button class="btn-learn" data-action="learn" data-skill="${skillId}" ${skillPoints <= 0 ? 'disabled' : ''}>
              学习技能 ${skillPoints > 0 ? '(消耗 1 技能点)' : '(技能点不足)'}
            </button>
          ` : ''}
          
          ${canUpgrade ? `
            <button class="btn-upgrade" data-action="upgrade" data-skill="${skillId}" ${skillPoints <= 0 ? 'disabled' : ''}>
              升级技能 ${skillPoints > 0 ? '(消耗 1 技能点)' : '(技能点不足)'}
            </button>
          ` : ''}
          
          ${level >= maxLevel && !canUpgrade ? `
            <div class="maxlevel-hint">✨ 技能已达最高等级</div>
          ` : ''}
          
          ${canEquip ? `
            <button class="btn-equip" data-action="equip" data-skill="${skillId}">
              装备到技能槽
            </button>
          ` : ''}
          
          ${canUnequip ? `
            <button class="btn-unequip" data-action="unequip" data-skill="${skillId}">
              从技能槽卸下
            </button>
          ` : ''}
          
          <button class="btn-cancel" data-action="cancel">
            取消
          </button>
        </div>
        
        <div class="dialog-hint">
          <span class="hint-icon">💡</span>
          <span>技能点剩余：${skillPoints}</span>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 绑定事件
    this.bindDialogEvents(dialog);
  }
  
  hideSkillActionDialog() {
    const dialog = document.getElementById('skillActionDialog');
    if (dialog) {
      dialog.remove();
    }
  }
  
  bindDialogEvents(dialog) {
    // 关闭按钮
    const closeBtn = dialog.querySelector('.dialog-close');
    closeBtn.addEventListener('click', () => this.hideSkillActionDialog());
    
    // 遮罩点击关闭
    const overlay = dialog.querySelector('.dialog-overlay');
    overlay.addEventListener('click', () => this.hideSkillActionDialog());
    
    // 操作按钮
    const actionBtns = dialog.querySelectorAll('[data-action]');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const skillId = btn.dataset.skill;
        
        if (action === 'cancel') {
          this.hideSkillActionDialog();
          return;
        }
        
        // 执行操作
        let result;
        switch (action) {
          case 'learn':
            this.learnSkill(skillId);
            break;
          case 'upgrade':
            this.upgradeSkill(skillId);
            break;
          case 'equip':
            this.toggleEquipSkill(skillId);
            break;
          case 'unequip':
            this.toggleEquipSkill(skillId);
            break;
        }
        
        // 关闭弹窗
        this.hideSkillActionDialog();
      });
    });
  }

  // ==================== 交互式技能树功能 ====================
  
  /**
   * 初始化交互式技能树
   */
  async initInteractiveTree(player, allSkills) {
    console.log('[SkillsView] 初始化交互式技能树');
    
    // 等待DOM渲染完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const wrapper = this.modal.querySelector('#treeCanvasWrapper');
    const canvas = this.modal.querySelector('#treeCanvas');
    const svg = this.modal.querySelector('#treeConnections');
    
    if (!wrapper || !canvas || !svg) {
      console.error('[SkillsView] 技能树容器未找到');
      return;
    }
    
    // 创建布局引擎
    const layoutEngine = new SkillTreeLayoutEngine({
      nodeWidth: 100,
      nodeHeight: 100,
      levelHeight: 150,
      siblingSpacing: 50,
      subtreeSpacing: 80
    });
    
    // 创建交互控制器
    this.treeInteraction = new SkillTreeInteraction(wrapper, canvas, {
      initialScale: 1,
      initialX: 0,
      initialY: 0,
      minScale: 0.3,
      maxScale: 3,
      onTransformChange: (transform) => {
        // 守护：界面可能已关闭或DOM尚未就绪
        if (!this.modal) return;
        const percent = Math.round(transform.scale * 100);
        const scaleDisplay = this.modal.querySelector('#scaleDisplay');
        if (scaleDisplay) {
          scaleDisplay.textContent = `${percent}%`;
        }
      }
    });
    
    // 创建连接线绘制器（使用物理技能树的默认偏移量）
    const physicalOffsets = this.CATEGORY_OFFSETS.physical;
    this.treeConnector = new SkillTreeConnector(svg, {
      strokeWidth: 2,
      curveStyle: 'bezier',
      showArrows: true,
      // 优先级：全局调试偏移 > 物理技能树默认偏移
      offsetX: (typeof window !== 'undefined' && window.SKILL_CONN_OFFSET && typeof window.SKILL_CONN_OFFSET.x === 'number')
        ? window.SKILL_CONN_OFFSET.x
        : physicalOffsets.x,
      offsetY: (typeof window !== 'undefined' && window.SKILL_CONN_OFFSET && typeof window.SKILL_CONN_OFFSET.y === 'number')
        ? window.SKILL_CONN_OFFSET.y
        : physicalOffsets.y
    });

    // 暴露全局调试方法：运行时调整偏移并重绘当前分类
    if (typeof window !== 'undefined') {
      window.setSkillConnectionsOffset = (x, y) => {
        try {
          const ox = Number(x) || 0;
          const oy = Number(y) || 0;
          this.treeConnector?.setOffsets(ox, oy);
          const activeCategory = this.getActiveCategory();
          this.drawConnectionsForCategory(activeCategory);
          console.log('[SkillsView] 已应用连接线偏移:', { x: ox, y: oy });
        } catch (err) {
          console.warn('[SkillsView] 应用连接线偏移失败:', err);
        }
      };
      
      // 新增：为特定分类设置偏移的调试方法
      window.setSkillCategoryOffset = (category, x, y) => {
        try {
          const ox = Number(x) || 0;
          const oy = Number(y) || 0;
          if (this.CATEGORY_OFFSETS[category]) {
            this.CATEGORY_OFFSETS[category] = { x: ox, y: oy };
            console.log(`[SkillsView] 更新${category}分类偏移:`, { x: ox, y: oy });
            
            // 如果当前就是这个分类，立即应用
            const activeCategory = this.getActiveCategory();
            if (activeCategory === category) {
              this.treeConnector?.setOffsets(ox, oy);
              this.drawConnectionsForCategory(activeCategory);
            }
          }
        } catch (err) {
          console.warn('[SkillsView] 设置分类偏移失败:', err);
        }
      };
    }
    
    // 渲染所有分类的技能树
    this.renderAllCategoryTrees(player, allSkills, layoutEngine);
    
    // 绑定控制按钮
    this.bindTreeControls();
    
    // 绑定分类切换事件（重新绘制连接线）
    this.bindTreeCategorySwitchWithConnections();
    
    // 🆕 首次渲染后：恢复持久化状态 或 智能聚焦
    requestAnimationFrame(() => {
      this.restoreOrSmartFocus(player);
    });
    
    console.log('[SkillsView] 交互式技能树初始化完成');
  }
  
  /**
   * 恢复持久化状态或执行智能聚焦
   * @param {Object} player - 玩家对象
   */
  restoreOrSmartFocus(player) {
    const savedState = this.loadTreeViewState();
    
    if (savedState && savedState.activeCategory && savedState.categories) {
      // 有持久化状态：恢复
      const { activeCategory, categories } = savedState;
      
      console.log(`[SkillsView] 恢复持久化状态：分类=${activeCategory}`);
      
      // 切换到保存的分类
      const tab = this.modal.querySelector(`.tree-tab[data-category="${activeCategory}"]`);
      if (tab && !tab.classList.contains('active')) {
        tab.click();
      }
      
      // 恢复该分类的 transform
      if (categories[activeCategory] && this.treeInteraction) {
        this.treeInteraction.setTransform(categories[activeCategory], true);
      }
      
      // 同步 SVG viewBox
      const treeData = this.currentTreeData?.[activeCategory];
      if (treeData && this.treeConnector?.updateViewBox) {
        this.treeConnector.updateViewBox(treeData.bounds, 100);
      }
    } else {
      // 无持久化状态：智能聚焦
      console.log('[SkillsView] 无持久化状态，执行智能聚焦');
      
      const activeCategory = this.getActiveCategory();
      const treeData = this.currentTreeData?.[activeCategory];
      
      if (treeData) {
        // 同步 SVG viewBox
        if (this.treeConnector?.updateViewBox) {
          this.treeConnector.updateViewBox(treeData.bounds, 100);
        }
        
        // 计算目标节点
        const targetNode = this.computeTargetNode(activeCategory, player);
        
        if (targetNode) {
          // 聚焦到目标节点：默认缩放 + X/Y 偏移
          this.focusOnNodeWithDefaults(
            targetNode,
            this.DEFAULT_FOCUS_SCALE,
            this.DEFAULT_FOCUS_OFFSET_X,
            this.DEFAULT_FOCUS_OFFSET_Y,
            true
          );
        } else {
          // 兜底：fitToScreen
          console.log('[SkillsView] 无可聚焦节点，使用 fitToScreen');
          this.treeInteraction?.fitToScreen(treeData.bounds, 50, true);
        }
      }
    }
  }
  
  /**
   * 渲染所有分类的技能树
   */
  renderAllCategoryTrees(player, allSkills, layoutEngine) {
    const categories = ['physical', 'magic', 'passive'];
    const skillService = window.gameCore?.getService('skillService');
    
    categories.forEach(category => {
      const container = this.modal.querySelector(`#${category}Nodes`);
      if (!container) return;
      
      // 使用简化布局
      const result = layoutEngine.simpleLayout(allSkills, category);
      
      if (result.nodes.length === 0) {
        container.innerHTML = '<div class="no-skills-message">该分类暂无技能</div>';
        return;
      }
      
      // 渲染节点
      const nodesHTML = result.nodes.map(node => {
        // 添加节点状态信息
        node.data.state = this.getNodeState(node.data, player, skillService);
        
        return this.renderInteractiveNode(node, player, skillService);
      }).join('');
      
      container.innerHTML = nodesHTML;
      
      // 保存树数据用于绘制连接线
      if (!this.currentTreeData) {
        this.currentTreeData = {};
      }
      this.currentTreeData[category] = { nodes: result.nodes, bounds: result.bounds };
      
      // 如果是当前激活的分类，绘制连接线
      if (container.classList.contains('active')) {
        this.drawConnectionsForCategory(category);
      }
    });
    
    // 绑定节点事件
    this.bindInteractiveNodeEvents();
  }
  
  /**
   * 渲染单个交互式节点（绝对定位）
   */
  renderInteractiveNode(node, player, skillService) {
    const skill = node.data;
    const playerSkill = player.skills?.find(s => s.id === skill.id);
    const isLearned = !!playerSkill;
    const level = playerSkill?.level || 0;
    const maxLevel = skill.maxLevel || 5;
    const isEquipped = playerSkill?.equipped || false;
    const state = skill.state || 'locked';
    
    // 检查是否可升级
    let canUpgrade = false;
    if (isLearned && level < maxLevel && skillService) {
      canUpgrade = skillService.canUpgrade(player, skill.id).ok;
    }
    
    const icon = this.getSkillIcon(skill);
    
    return `
      <div class="skill-tree-node interactive ${state}"
           data-skill-id="${skill.id}"
           data-state="${state}"
           style="left: ${node.x}px; top: ${node.y}px;"
           title="${skill.name}"
           ${isLearned ? 'draggable="true"' : ''}>
        <div class="node-main">
          <div class="node-icon">${icon}</div>
          ${isLearned ? `<div class="node-level">Lv.${level}/${maxLevel}</div>` : ''}
          ${isEquipped ? '<div class="node-equipped">✓</div>' : ''}
        </div>
        ${canUpgrade && !isEquipped ? '<div class="node-upgradable" data-action="upgrade" title="点击升级">⬆</div>' : ''}
        <div class="node-name">${skill.name}</div>
      </div>
    `;
  }
  
  /**
   * 获取节点状态
   */
  getNodeState(skill, player, skillService) {
    const playerSkill = player.skills?.find(s => s.id === skill.id);
    const isLearned = !!playerSkill;
    const level = playerSkill?.level || 0;
    const maxLevel = skill.maxLevel || 5;
    const isEquipped = playerSkill?.equipped || false;
    
    if (isLearned) {
      if (isEquipped) return 'equipped';
      if (level < maxLevel && skillService?.canUpgrade(player, skill.id).ok) return 'upgradable';
      if (level >= maxLevel) return 'maxlevel';
      return 'owned';
    } else if (skillService) {
      const canLearn = skillService.canLearnIgnoreSkillPoints(player, skill.id);
      if (canLearn.ok) return 'learnable';
    }
    
    return 'locked';
  }
  
  /**
   * 绘制指定分类的连接线
   */
  drawConnectionsForCategory(category) {
    if (!this.currentTreeData || !this.currentTreeData[category]) return;
    
    const { nodes, bounds } = this.currentTreeData[category];
    
    // 🆕 切换分类时更新连接线偏移量
    const categoryOffsets = this.CATEGORY_OFFSETS[category];
    if (categoryOffsets && this.treeConnector) {
      // 优先使用全局调试偏移，否则使用分类默认偏移
      const offsetX = (typeof window !== 'undefined' && window.SKILL_CONN_OFFSET && typeof window.SKILL_CONN_OFFSET.x === 'number')
        ? window.SKILL_CONN_OFFSET.x
        : categoryOffsets.x;
      const offsetY = (typeof window !== 'undefined' && window.SKILL_CONN_OFFSET && typeof window.SKILL_CONN_OFFSET.y === 'number')
        ? window.SKILL_CONN_OFFSET.y
        : categoryOffsets.y;
        
      this.treeConnector.setOffsets(offsetX, offsetY);
      console.log(`[SkillsView] 为分类 ${category} 设置连接线偏移:`, { x: offsetX, y: offsetY });
    }
    
    // 为节点添加父子关系（用于绘制连接线）
    nodes.forEach(node => {
      // 清空之前的父节点引用
      node.parent = null;
      
      if (node.data.requirements?.requires && node.data.requirements.requires.length > 0) {
        // 设置第一个前置技能为主父节点（绘制实线）
        const firstReq = node.data.requirements.requires[0];
        const parentNode = nodes.find(n => n.id === firstReq.id);
        if (parentNode) {
          node.parent = parentNode;
        }
        
        // 其他前置技能会被 SkillTreeConnector.getPrerequisites() 自动处理（绘制虚线）
      }
    });
    
    console.log(`[SkillsView] 为分类 ${category} 设置了 ${nodes.filter(n => n.parent).length} 个主连接`);
    
    // 更新SVG视图范围，确保连接线坐标系与节点一致
    if (bounds && this.treeConnector?.updateViewBox) {
      this.treeConnector.updateViewBox(bounds, 100);
    }
    
    this.treeConnector.drawConnections(nodes);
  }
  
  /**
   * 绑定节点交互事件
   */
  bindInteractiveNodeEvents() {
    const nodes = this.modal.querySelectorAll('.skill-tree-node.interactive');
    
    nodes.forEach(node => {
      const skillId = node.dataset.skillId;
      const state = node.dataset.state;
      
      // 鼠标悬浮
      node.addEventListener('mouseenter', () => {
        this.showSkillTooltip(node, skillId);
      });
      
      node.addEventListener('mouseleave', () => {
        this.hideSkillTooltip();
      });
      
      // 可升级箭头点击事件（需要先绑定，阻止冒泡）
      const upgradeArrow = node.querySelector('.node-upgradable[data-action="upgrade"]');
      if (upgradeArrow) {
        upgradeArrow.addEventListener('click', (e) => {
          e.stopPropagation(); // 阻止冒泡到节点
          this.hideSkillTooltip();
          this.upgradeSkill(skillId);
        });
      }
      
      // 点击节点 - 根据状态直接执行操作
      node.addEventListener('click', (e) => {
        // 如果点击的是升级箭头，已经处理过了
        if (e.target.closest('.node-upgradable[data-action="upgrade"]')) {
          return;
        }
        
        e.stopPropagation();
        this.hideSkillTooltip();
        
        if (state === 'locked') {
          this.notify('技能被锁定，请先满足前置条件', 'warning');
          return;
        }
        
        // 根据状态执行不同操作
        if (state === 'learnable') {
          // 可学习：直接学习
          this.learnSkill(skillId);
        } else if (state === 'owned' || state === 'equipped' || state === 'upgradable' || state === 'maxlevel') {
          // 已学习：装备/卸下
          this.toggleEquipSkill(skillId);
        }
      });
      
      // 拖拽事件（仅已学习的技能）
      if (state !== 'locked' && state !== 'learnable') {
        node.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', skillId);
          e.dataTransfer.setData('application/json', JSON.stringify({ skillId }));
          e.dataTransfer.effectAllowed = 'move';
          node.classList.add('dragging');
          this.hideSkillTooltip();
        });
        
        node.addEventListener('dragend', (e) => {
          node.classList.remove('dragging');
        });
      }
    });
  }
  
  /**
   * 绑定技能树控制按钮
   */
  bindTreeControls() {
    const zoomIn = this.modal.querySelector('#zoomIn');
    const zoomOut = this.modal.querySelector('#zoomOut');
    const zoomReset = this.modal.querySelector('#zoomReset');
    const fitScreen = this.modal.querySelector('#fitScreen');
    
    if (zoomIn) {
      zoomIn.addEventListener('click', () => {
        this.treeInteraction?.zoomIn();
      });
    }
    
    if (zoomOut) {
      zoomOut.addEventListener('click', () => {
        this.treeInteraction?.zoomOut();
      });
    }
    
    if (zoomReset) {
      zoomReset.addEventListener('click', () => {
        this.treeInteraction?.resetView(true);
      });
    }
    
    if (fitScreen) {
      fitScreen.addEventListener('click', () => {
        // 获取当前激活分类的边界
        const activeCategory = this.modal.querySelector('.tree-category-nodes.active');
        if (activeCategory) {
          const category = activeCategory.dataset.category;
          const treeData = this.currentTreeData?.[category];
          if (treeData) {
            this.treeInteraction?.fitToScreen(treeData.bounds, 50, true);
          }
        }
      });
    }
    
    // 键盘快捷键
    const handleKeyboard = (e) => {
      if (!this.modal) return;
      
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          this.treeInteraction?.zoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          this.treeInteraction?.zoomOut();
          break;
        case '0':
          e.preventDefault();
          this.treeInteraction?.resetView(true);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          fitScreen?.click();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyboard);
    
    // 保存引用以便清理
    this._keyboardHandler = handleKeyboard;
  }
  
  /**
   * 绑定技能树分类切换（带连接线更新）
   */
  bindTreeCategorySwitchWithConnections() {
    const treeTabs = this.modal.querySelectorAll('.tree-tab');
    const treeCategories = this.modal.querySelectorAll('.tree-category-nodes');
    
    treeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.category;
        
        // 更新标签状态
        treeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 切换分类显示
        treeCategories.forEach(cat => {
          if (cat.dataset.category === category) {
            cat.classList.add('active');
          } else {
            cat.classList.remove('active');
          }
        });
        
        // 重新绘制连接线
        this.drawConnectionsForCategory(category);
        
        // 适应屏幕
        const treeData = this.currentTreeData?.[category];
        if (treeData && this.treeInteraction) {
          // 延迟一帧以确保DOM更新完成
          requestAnimationFrame(() => {
            this.treeInteraction.fitToScreen(treeData.bounds, 50, true);
          });
        }
      });
    });
  }

  // 切换技能装备状态（点击技能卡片时）
  toggleEquipSkill(skillId) {
    const skillService = window.gameCore?.getService('skillService');
    if (!skillService) return;
    
    const player = skillService.getPlayer();
    const skill = (player.skills || []).find(s => s.id === skillId);
    
    if (!skill) return;
    
    if (skill.equipped) {
      const res = skillService.unequipSkill(skillId);
      // 已取消技能卸下通知
      // this.notify(res.message, res.success ? 'success' : 'warning');
    } else {
      const res = skillService.equipSkill(skillId);
      // 已取消技能装备通知
      // this.notify(res.message, res.success ? 'success' : 'warning');
    }
  }

  notify(message, type = 'info') {
    this.eventBus.emit('ui:notification', message, 'game');
  }

  // ==================== 视图状态持久化功能 ====================
  
  /**
   * 从 localStorage 加载技能树视图状态
   * @returns {Object|null} 状态对象或 null
   */
  loadTreeViewState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        console.log('[SkillsView] 加载持久化状态:', state);
        return state;
      }
    } catch (error) {
      console.warn('[SkillsView] 加载持久化状态失败:', error);
    }
    return null;
  }
  
  /**
   * 保存技能树视图状态到 localStorage
   * @param {String} activeCategory - 当前激活的分类
   * @param {Object} categoryTransforms - 各分类的 transform
   */
  saveTreeViewState(activeCategory, categoryTransforms) {
    try {
      const state = {
        activeCategory,
        categories: categoryTransforms,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      console.log('[SkillsView] 保存持久化状态:', state);
    } catch (error) {
      console.warn('[SkillsView] 保存持久化状态失败:', error);
    }
  }
  
  /**
   * 获取当前激活的分类
   * @returns {String} 分类名称
   */
  getActiveCategory() {
    const activeTab = this.modal?.querySelector('.tree-tab.active');
    return activeTab?.dataset.category || 'physical';
  }
  
  /**
   * 计算目标聚焦节点（智能选择算法）
   * @param {String} category - 分类名称
   * @param {Object} player - 玩家对象
   * @returns {Object|null} 目标节点或 null
   */
  computeTargetNode(category, player) {
    if (!this.currentTreeData || !this.currentTreeData[category]) {
      return null;
    }
    
    const nodes = this.currentTreeData[category].nodes;
    if (!nodes || nodes.length === 0) {
      return null;
    }
    
    // 优先级：upgradable > learnable > equipped > owned > 最新习得 > 根节点
    
    // 1. 可升级节点
    let target = nodes.find(n => n.data.state === 'upgradable');
    if (target) {
      console.log('[SkillsView] 智能聚焦：选择可升级节点', target.data.name);
      return target;
    }
    
    // 2. 可学习节点
    target = nodes.find(n => n.data.state === 'learnable');
    if (target) {
      console.log('[SkillsView] 智能聚焦：选择可学习节点', target.data.name);
      return target;
    }
    
    // 3. 已装备节点
    target = nodes.find(n => n.data.state === 'equipped');
    if (target) {
      console.log('[SkillsView] 智能聚焦：选择已装备节点', target.data.name);
      return target;
    }
    
    // 4. 已掌握但未装备节点
    target = nodes.find(n => n.data.state === 'owned' || n.data.state === 'maxlevel');
    if (target) {
      console.log('[SkillsView] 智能聚焦：选择已掌握节点', target.data.name);
      return target;
    }
    
    // 5. 最新习得技能（从玩家技能列表末尾查找）
    if (player.skills && player.skills.length > 0) {
      for (let i = player.skills.length - 1; i >= 0; i--) {
        const skillId = player.skills[i].id;
        target = nodes.find(n => n.id === skillId);
        if (target) {
          console.log('[SkillsView] 智能聚焦：选择最新习得技能', target.data.name);
          return target;
        }
      }
    }
    
    // 6. 兜底：选择根节点（无前置条件的节点）
    const rootNodes = nodes.filter(n => !n.data.requirements || !n.data.requirements.requires || n.data.requirements.requires.length === 0);
    if (rootNodes.length > 0) {
      target = rootNodes[0];
      console.log('[SkillsView] 智能聚焦：选择根节点（兜底）', target.data.name);
      return target;
    }
    
    // 7. 最后兜底：第一个节点
    console.log('[SkillsView] 智能聚焦：选择第一个节点（最终兜底）', nodes[0].data.name);
    return nodes[0];
  }
  
  /**
   * 聚焦到指定节点（带默认缩放和偏移）
   * @param {Object} node - 目标节点
   * @param {Number} scale - 缩放比例，默认 this.DEFAULT_FOCUS_SCALE
   * @param {Number} offsetX - 水平偏移，正值向右，默认 this.DEFAULT_FOCUS_OFFSET_X
   * @param {Number} offsetY - 垂直偏移，正值代表让节点更靠上显示（内部会取负），默认 this.DEFAULT_FOCUS_OFFSET_Y
   * @param {Boolean} animated - 是否动画，默认 true
   */
  focusOnNodeWithDefaults(
    node,
    scale = this.DEFAULT_FOCUS_SCALE,
    offsetX = this.DEFAULT_FOCUS_OFFSET_X,
    offsetY = this.DEFAULT_FOCUS_OFFSET_Y,
    animated = true
  ) {
    if (!node || !this.treeInteraction) {
      return;
    }
    
    console.log(`[SkillsView] 聚焦节点: ${node.data.name}, scale=${scale}, offsetX=${offsetX}, offsetY=${offsetY}`);
    
    // 使用布局坐标系的节点尺寸（100x100），避免混用已缩放的屏幕尺寸导致偏移错误
    const targetCanvasPos = { x: node.x + 50, y: node.y + 50 };
    
    // 使用扩展后的 centerOnNode
    // 注意：为实现“节点在视窗稍偏上”，这里将 offsetY 取负值
    this.treeInteraction.centerOnNode(
      targetCanvasPos,
      scale,
      animated,
      { x: offsetX, y: -Math.abs(offsetY) }
    );
  }

  close() {
    // 💾 保存视图状态到 localStorage
    if (this.treeInteraction && this.currentTreeData) {
      const activeCategory = this.getActiveCategory();
      const categoryTransforms = {};
      
      // 保存当前激活分类的 transform
      const currentTransform = this.treeInteraction.getTransform();
      categoryTransforms[activeCategory] = currentTransform;
      
      // 尝试从已有状态中恢复其他分类的 transform（避免丢失）
      const existingState = this.loadTreeViewState();
      if (existingState && existingState.categories) {
        ['physical', 'magic', 'passive'].forEach(cat => {
          if (cat !== activeCategory && existingState.categories[cat]) {
            categoryTransforms[cat] = existingState.categories[cat];
          }
        });
      }
      
      // 补充从内存中保存的其他分类 transform
      if (this._categoryTransforms) {
        ['physical', 'magic', 'passive'].forEach(cat => {
          if (!categoryTransforms[cat] && this._categoryTransforms[cat]) {
            categoryTransforms[cat] = this._categoryTransforms[cat];
          }
        });
      }
      
      this.saveTreeViewState(activeCategory, categoryTransforms);
    }
    
    // 清理键盘事件监听
    if (this._keyboardHandler) {
      document.removeEventListener('keydown', this._keyboardHandler);
      this._keyboardHandler = null;
    }
    
    // 清理交互控制器
    if (this.treeInteraction) {
      this.treeInteraction.destroy();
      this.treeInteraction = null;
    }
    
    // 清理树数据
    this.currentTreeData = null;
    this.treeConnector = null;
    this._categoryTransforms = null;
    
    // 移除弹窗
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}

export default SkillsView;

// 全局可用（调试）
window.SkillsView = SkillsView;