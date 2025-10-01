// views/BattleView.js
class BattleView {
    constructor(eventBus, gameView) {
        this.eventBus = eventBus;
        this.gameView = gameView; // 引用主 GameView，用于控制输入启用/禁用
    }

    // 显示战斗界面
    show(battleState) {
        // 禁用游戏输入（通过主视图控制）
        if (this.gameView && typeof this.gameView.disableInput === 'function') {
            this.gameView.disableInput();
        }

        // 创建战斗界面
        const battleModal = document.createElement('div');
        battleModal.className = 'battle-modal';
        battleModal.innerHTML = `
            <div class="battle-content">
                <div class="battle-header">
                    <h3>⚔️ 战斗 - 第${battleState.round}回合</h3>
                </div>
                <div class="battle-main">
                    <div class="battle-participants">
                        <div class="player-section">
                            <h4>🛡️ ${battleState.player.name || '冒险者'}</h4>
                            <div class="hp-bar">
                                <div class="hp-fill" style="width: ${(battleState.player.hp / battleState.player.maxHp) * 100}%"></div>
                                <span class="hp-text">${battleState.player.hp}/${battleState.player.maxHp}</span>
                            </div>
                            <div class="hp-bar mp-bar">
                                <div class="hp-fill mp-fill" style="width: ${((battleState.player.mana || 0) / (battleState.player.maxMana || 1)) * 100}%"></div>
                                <span class="hp-text">${battleState.player.mana || 0}/${battleState.player.maxMana || 0} MP</span>
                            </div>
                            <div class="hp-bar sp-bar">
                                <div class="hp-fill sp-fill" style="width: ${((battleState.player.stamina || 0) / (battleState.player.maxStamina || 1)) * 100}%"></div>
                                <span class="hp-text">${battleState.player.stamina || 0}/${battleState.player.maxStamina || 0} SP</span>
                            </div>
                        </div>
                        <div class="enemies-section">
                            ${battleState.enemies.map((enemy, index) => `
                                <div class="enemy ${enemy.hp <= 0 ? 'defeated' : ''}" data-index="${index}">
                                    <h4>👹 ${enemy.type}</h4>
                                    <div class="hp-bar">
                                        <div class="hp-fill enemy-hp" style="width: ${(enemy.hp / enemy.maxHp) * 100}%"></div>
                                        <span class="hp-text">${enemy.hp}/${enemy.maxHp}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="battle-log" id="battleLog">
                        ${battleState.battleLog.map(log => `
                            <div class="log-entry ${log.type}">${log.message}</div>
                        `).join('')}
                    </div>
                    <div class="battle-actions" id="battleActions">
                        ${this.generateBattleActions(battleState)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(battleModal);
        this.setupBattleEvents(battleModal, battleState);
    }

    generateBattleActions(battleState) {
        if (battleState.turn !== 'player') {
            return '<div class="waiting-message">等待敌人行动...</div>';
        }

        const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);
        const skillService = window.gameCore?.getService('skillService');
        const usableSkills = skillService ? skillService.getUsableSkills(battleState) : [];

        return `
            <div class="action-buttons">
                <button class="battle-action-btn attack-btn" data-action="攻击">⚔️ 攻击</button>
                <button class="battle-action-btn skill-btn" data-action="技能">✨ 技能</button>
                <button class="battle-action-btn defend-btn" data-action="防御">🛡️ 防御</button>
                <button class="battle-action-btn item-btn" data-action="使用物品">🧪 使用物品</button>
                <button class="battle-action-btn escape-btn" data-action="逃跑">🏃 逃跑</button>
            </div>
            ${aliveEnemies.length > 1 ? `
            <div class="target-selection hidden" id="targetSelection">
                <h4>选择目标：</h4>
                ${aliveEnemies.map((enemy, index) => `
                    <button class="target-btn" data-target="${battleState.enemies.indexOf(enemy)}">
                        ${enemy.type} (${enemy.hp}/${enemy.maxHp})
                    </button>
                `).join('')}
            </div>` : '' }
            <div class="skills-selection hidden" id="skillsSelection">
                <h4>选择技能：</h4>
                ${usableSkills.length > 0 ? usableSkills.map(({ skill, level }) => `
                    <button class="skill-btn" data-skill="${skill.id}" data-level="${level}">
                        ${skill.name} Lv.${level}
                    </button>
                `).join('') : '<div class="no-skills">暂无可用技能（资源不足或冷却中）</div>'}
            </div>
        `;
    }

    setupBattleEvents(modal, battleState) {
        const actionButtons = modal.querySelectorAll('.battle-action-btn');
        const targetSelection = modal.querySelector('#targetSelection');
        const skillsSelection = modal.querySelector('#skillsSelection');

        const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);
        const singleTargetIndex = aliveEnemies.length === 1 ? battleState.enemies.indexOf(aliveEnemies[0]) : null;

        actionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;

                if (action === '攻击') {
                    // 1v1直接攻击，无需选择目标
                    if (singleTargetIndex !== null) {
                        this.executeBattleAction('攻击', singleTargetIndex);
                    } else {
                        // 多目标时显示目标选择
                        if (targetSelection) targetSelection.classList.remove('hidden');
                    }
                } else if (action === '技能') {
                    // 打开技能选择列表
                    if (skillsSelection) skillsSelection.classList.remove('hidden');
                } else {
                    // 直接执行行动
                    this.executeBattleAction(action);
                }
            });
        });

        // 目标选择事件（用于多目标时）
        const targetButtons = modal.querySelectorAll('.target-btn');
        targetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = parseInt(btn.dataset.target);
                this.executeBattleAction('攻击', target);
                if (targetSelection) targetSelection.classList.add('hidden');
            });
        });

        // 技能选择事件
        const skillButtons = modal.querySelectorAll('.skills-selection .skill-btn');
        skillButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const skillId = btn.dataset.skill;
                if (singleTargetIndex !== null) {
                    this.executeBattleAction('技能', singleTargetIndex, null, skillId);
                } else {
                    // 多目标下默认选第一个存活敌人（后续可扩展为选择目标）
                    const fallbackIndex = aliveEnemies.length > 0 ? battleState.enemies.indexOf(aliveEnemies[0]) : 0;
                    this.executeBattleAction('技能', fallbackIndex, null, skillId);
                }
                if (skillsSelection) skillsSelection.classList.add('hidden');
            });
        });
    }

    executeBattleAction(action, target, item, skillId) {
        const battleService = window.gameCore?.getService('battleService');
        if (battleService) {
            battleService.handleBattleAction({ action, target, item, skillId });
        }
    }

    update(battleState) {
        const battleModal = document.querySelector('.battle-modal');
        if (!battleModal) return;

        // 更新回合数
        const header = battleModal.querySelector('.battle-header h3');
        if (header) {
            header.textContent = `⚔️ 战斗 - 第${battleState.round}回合`;
        }

        // 更新HP条
        const playerHpFill = battleModal.querySelector('.player-section .hp-fill');
        const playerHpText = battleModal.querySelector('.player-section .hp-text');
        if (playerHpFill && playerHpText) {
            const hpPercent = (battleState.player.hp / battleState.player.maxHp) * 100;
            playerHpFill.style.width = hpPercent + '%';
            playerHpText.textContent = `${battleState.player.hp}/${battleState.player.maxHp}`;
        }
        // 更新MP/SP
        const playerMpFill = battleModal.querySelector('.player-section .mp-fill');
        const playerSpFill = battleModal.querySelector('.player-section .sp-fill');
        const mpTextEl = battleModal.querySelector('.player-section .mp-bar .hp-text');
        const spTextEl = battleModal.querySelector('.player-section .sp-bar .hp-text');
        if (playerMpFill && mpTextEl) {
            const mpPercent = ((battleState.player.mana || 0) / (battleState.player.maxMana || 1)) * 100;
            playerMpFill.style.width = mpPercent + '%';
            mpTextEl.textContent = `${battleState.player.mana || 0}/${battleState.player.maxMana || 0} MP`;
        }
        if (playerSpFill && spTextEl) {
            const spPercent = ((battleState.player.stamina || 0) / (battleState.player.maxStamina || 1)) * 100;
            playerSpFill.style.width = spPercent + '%';
            spTextEl.textContent = `${battleState.player.stamina || 0}/${battleState.player.maxStamina || 0} SP`;
        }

        // 更新敌人HP
        battleState.enemies.forEach((enemy, index) => {
            const enemyDiv = battleModal.querySelector(`.enemy[data-index="${index}"]`);
            if (enemyDiv) {
                const hpFill = enemyDiv.querySelector('.hp-fill');
                const hpText = enemyDiv.querySelector('.hp-text');
                if (hpFill && hpText) {
                    const hpPercent = (enemy.hp / enemy.maxHp) * 100;
                    hpFill.style.width = hpPercent + '%';
                    hpText.textContent = `${enemy.hp}/${enemy.maxHp}`;
                }

                if (enemy.hp <= 0) {
                    enemyDiv.classList.add('defeated');
                }
            }
        });

        // 更新战斗日志
        const battleLog = battleModal.querySelector('#battleLog');
        if (battleLog) {
            battleLog.innerHTML = battleState.battleLog.map(log => `
                <div class="log-entry ${log.type}">${log.message}</div>
            `).join('');
            battleLog.scrollTop = battleLog.scrollHeight;
        }

        // 更新行动按钮
        const battleActions = battleModal.querySelector('#battleActions');
        if (battleActions) {
            battleActions.innerHTML = this.generateBattleActions(battleState);
            this.setupBattleEvents(battleModal, battleState);
        }
    }

    hide() {
        const battleModal = document.querySelector('.battle-modal');
        if (battleModal) {
            battleModal.remove();
        }

        // 重新启用游戏输入（通过主视图控制）
        if (this.gameView && typeof this.gameView.enableInput === 'function') {
            this.gameView.enableInput();
        }
    }
}

export default BattleView;

// 确保类在全局可用（可选）
window.BattleView = BattleView;