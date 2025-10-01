// views/SaveManagerView.js
class SaveManagerView {
    constructor(eventBus, gameView) {
        this.eventBus = eventBus;
        this.gameView = gameView; // 引用主视图以复用通知/开始页显示等逻辑
    }

    // 存档管理器（加载/保存/导入/导出/删除）
    openSaveManager(mode = 'load') {
        const fromStartPage = !!this.gameView?.startView || !!document.getElementById('fallback-start');

        // 隐藏开始页面
        if (this.gameView && typeof this.gameView.hideStartPage === 'function') {
            this.gameView.hideStartPage();
        }

        const existing = document.querySelector('.save-manager-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'save-manager-modal';
        modal.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.5);
            display: flex; align-items: center; justify-content: center;
            z-index: 9999;
        `;
        const box = document.createElement('div');
        box.style.cssText = `
            background:#1f2430; color:#fff; width: 720px; max-width: 96%;
            border-radius:12px; padding:20px; box-shadow:0 8px 24px rgba(0,0,0,.45);
        `;
        const title = mode === 'manage' ? '💾 存档管理' : '📂 选择要加载的存档';
        box.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <h3 style="margin: 0; color: ${mode === 'manage' ? '#2196F3' : '#4CAF50'};">${title}</h3>
                <div>
                    <button class="quick-action-button" id="importBtn" style="
                        background: #ff9800; border: none; color: white; padding: 8px 16px;
                        border-radius: 6px; cursor: pointer; font-weight: 600; margin-right: 8px;">📥 导入存档</button>
                    <button class="quick-action-button" id="backToStartBtn" style="
                        background: #666; border: none; color: white; padding: 8px 16px;
                        border-radius: 6px; cursor: pointer; font-weight: 600;">🔙 返回</button>
                </div>
            </div>
            ${mode === 'load' ? `
            <div style="margin-bottom: 15px; padding: 10px; background: #2a3142; border-radius: 8px; border-left: 4px solid #4CAF50;">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                    💡 <strong>提示：</strong>选择一个存档槽位来加载游戏进度。
                </p>
            </div>` : ''}
            <div id="slotsContainer"></div>
            <div style="margin-top: 15px; padding: 10px; background: #2a3142; border-radius: 8px; font-size: 12px; opacity: 0.85; border-left: 4px solid #2196F3;">
                <p style="margin: 0;">
                    📋 <strong>操作说明：</strong>共有 6 个存档槽位。点击"导出"可将存档保存为 JSON 文件进行备份或分享，点击"导入存档"可从文件恢复进度。
                </p>
            </div>
        `;
        modal.appendChild(box);
        document.body.appendChild(modal);

        const container = box.querySelector('#slotsContainer');
        const saveService = window.gameCore?.getService('saveService');
        const list = saveService?.listSaves?.() || new Array(6).fill(null);
        container.innerHTML = this._renderSlotsHTML(list, mode);

        this._setupSaveManagerEvents(modal, mode);

        // 返回按钮 - 始终显示，用于返回上一个界面
        box.querySelector('#backToStartBtn')?.addEventListener('click', () => {
            modal.remove();
            if (fromStartPage) {
                if (this.gameView && typeof this.gameView.showStartPage === 'function') {
                    this.gameView.showStartPage();
                }
            } else {
                // 如果不是从开始页面来的，返回游戏主界面（可根据需要补充逻辑）
            }
        });

        // 导入按钮
        box.querySelector('#importBtn')?.addEventListener('click', () => {
            this._promptImport(false /*autoLoad*/, () => {
                const updated = saveService?.listSaves?.() || new Array(6).fill(null);
                container.innerHTML = this._renderSlotsHTML(updated, mode);
                this._setupSaveManagerEvents(modal, mode);
            });
        });
    }

    _renderSlotsHTML(list, mode) {
        const saveService = window.gameCore?.getService('saveService');
        const latest = saveService?.getLatestSlot?.();
        const cards = list.map((slot, i) => {
            const isEmpty = !slot;
            const statusText = isEmpty ? '空槽位' : '有存档';
            const statusColor = isEmpty ? '#4CAF50' : '#2196F3';
            const isLatest = latest && latest.index === i;

            if (isEmpty) {
                return `
                <div class="slot-card" style="background: #2a3142; border-radius: 8px; padding: 15px; margin: 8px 0; border: 2px solid ${statusColor};">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 5px;">
                                槽位 ${i + 1}
                                <span style="font-size: 12px; color: ${statusColor}; margin-left: 8px;">● ${statusText}</span>
                            </div>
                            <div style="opacity: 0.85; font-size: 12px; margin-bottom: 3px;">推荐选择</div>
                        </div>
                        <div>
                            <button class="quick-action-button save-btn" data-slot="${i}" style="
                                background: ${statusColor};
                                border: none;
                                color: white;
                                padding: 10px 20px;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: 600;
                            ">保存到此槽位</button>
                        </div>
                    </div>
                </div>`;
            }

            const dt = slot.updatedAt ? new Date(slot.updatedAt).toLocaleString() : '-';
            const subtitle = `Lv.${slot.summary.level || 1}｜${slot.summary.name || '冒险者'}｜${slot.summary.location || '-'}`;
            return `
            <div class="slot-card" style="background: #2a3142; border-radius: 8px; padding: 15px; margin: 8px 0; border: 2px solid ${statusColor};">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 5px;">
                            槽位 ${i + 1}
                            <span style="font-size: 12px; color: ${statusColor}; margin-left: 8px;">● ${statusText}</span>
                            ${isLatest ? '<span style="font-size: 12px; color: #ffd54f; margin-left: 6px;">最新</span>' : ''}
                        </div>
                        <div style="opacity: 0.85; font-size: 12px; margin-bottom: 3px;">${subtitle}</div>
                        <div style="opacity: 0.7; font-size: 11px;">更新时间: ${dt}</div>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="quick-action-button load-btn" data-slot="${i}" style="
                            background: #4CAF50;
                            border: none;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 12px;
                        ">加载</button>
                        <button class="quick-action-button save-btn" data-slot="${i}" style="
                            background: #2196F3;
                            border: none;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 12px;
                        ">保存</button>
                        <button class="quick-action-button export-btn" data-slot="${i}" style="
                            background: #ff9800;
                            border: none;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 12px;
                        ">导出</button>
                        <button class="quick-action-button delete-btn" data-slot="${i}" style="
                            background: #f44336;
                            border: none;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 12px;
                        ">删除</button>
                    </div>
                </div>
            </div>`;
        }).join('');
        return `<div>${cards}</div>`;
    }

    _setupSaveManagerEvents(modal, mode) {
        const saveService = window.gameCore?.getService('saveService');

        modal.querySelectorAll('.load-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    saveService.loadFromSlot(slot);
                    modal.remove();
                }
            });
        });
        modal.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    saveService.saveToSlot(slot, { label: '手动存档' });
                    // 保存后立即刷新列表，保持与删除一致的实时反馈
                    const container = modal.querySelector('#slotsContainer');
                    const list = saveService.listSaves();
                    container.innerHTML = this._renderSlotsHTML(list, mode);
                    this._setupSaveManagerEvents(modal, mode);
                }
            });
        });
        modal.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    saveService.exportSlot(slot);
                }
            });
        });
        modal.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    const confirmed = await window.gameDialog.confirm({
                        title: '删除存档',
                        message: `确认删除槽位 ${slot + 1} 的存档？\n\n⚠️ 此操作无法撤销！`,
                        icon: '🗑️',
                        confirmText: '删除',
                        cancelText: '取消',
                        confirmType: 'danger'
                    });

                    if (confirmed) {
                        saveService.deleteSlot(slot);
                        const container = modal.querySelector('#slotsContainer');
                        const list = saveService.listSaves();
                        container.innerHTML = this._renderSlotsHTML(list, mode);
                        this._setupSaveManagerEvents(modal, mode);
                    }
                }
            });
        });
    }

    _promptImport(autoLoad = false, onDone) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.style.display = 'none';
        document.body.appendChild(input);
        input.addEventListener('change', async () => {
            const file = input.files && input.files[0];
            if (file) {
                const text = await file.text();
                const saveService = window.gameCore?.getService('saveService');
                const res = saveService.importToSlot(text);
                if (res.success) {
                    if (autoLoad) {
                        saveService.loadFromSlot(res.slot);
                    }
                    if (typeof onDone === 'function') onDone(res);
                } else {
                    this._notify(res.error || '导入失败', 'error');
                }
            }
            document.body.removeChild(input);
        });
        input.click();
    }

    // 显示新游戏存档位置选择对话框
    showNewGameSlotSelection() {
        const existing = document.querySelector('.new-game-slot-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'new-game-slot-modal';
        modal.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.7);
            display: flex; align-items: center; justify-content: center;
            z-index: 10001;
        `;

        const box = document.createElement('div');
        box.style.cssText = `
            background: #1f2430; color: #fff; width: 600px; max-width: 96%;
            border-radius: 12px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,.6);
        `;

        box.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #4CAF50;">🌱 选择新游戏存档位置</h3>
                <button class="quick-action-button" id="backToStartFromNewGame" style="
                    background: #666; border: none; color: white; padding: 8px 16px; border-radius: 6px;
                    cursor: pointer; font-weight: 600;">🔙 返回</button>
            </div>
            <div style="margin-bottom: 15px; padding: 10px; background: #2a3142; border-radius: 8px; border-left: 4px solid #ff9800;">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                    ⚠️ <strong>重要提示：</strong>选择存档槽位后将开始新游戏，该槽位的现有存档将被覆盖！
                </p>
            </div>
            <div id="newGameSlotsContainer"></div>
        `;

        modal.appendChild(box);
        document.body.appendChild(modal);

        const container = box.querySelector('#newGameSlotsContainer');
        const saveService = window.gameCore?.getService('saveService');
        const list = saveService?.listSaves?.() || new Array(6).fill(null);

        container.innerHTML = this._renderNewGameSlotsHTML(list);
        this._setupNewGameSlotEvents(modal);

        box.querySelector('#backToStartFromNewGame')?.addEventListener('click', () => {
            modal.remove();
            // 通知 StartView 新游戏流程已取消
            this.eventBus?.emit?.('start:new-game:cancelled', {}, 'game');
            if (this.gameView && typeof this.gameView.showStartPage === 'function') {
                this.gameView.showStartPage();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.eventBus?.emit?.('start:new-game:cancelled', {}, 'game');
                if (this.gameView && typeof this.gameView.showStartPage === 'function') {
                    this.gameView.showStartPage();
                }
            }
        });
    }

    _renderNewGameSlotsHTML(list) {
        const cards = list.map((slot, i) => {
            const isEmpty = !slot;
            const statusText = isEmpty ? '空槽位' : '有存档 - 将被覆盖';
            const statusColor = isEmpty ? '#4CAF50' : '#ff9800';
            const subtitle = isEmpty ? '推荐选择' :
                `Lv.${slot.summary.level || 1}｜${slot.summary.name || '冒险者'}｜${slot.summary.location || '-'}`;
            const updateTime = slot ? new Date(slot.updatedAt).toLocaleString() : '-';

            return `
            <div class="new-game-slot-card" style="background: #2a3142; border-radius: 8px; padding: 15px; margin: 8px 0; border: 2px solid ${isEmpty ? '#4CAF50' : '#ff9800'};">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 5px;">
                            槽位 ${i + 1}
                            <span style="font-size: 12px; color: ${statusColor}; margin-left: 8px;">● ${statusText}</span>
                        </div>
                        <div style="opacity: 0.85; font-size: 12px; margin-bottom: 3px;">${subtitle}</div>
                        ${!isEmpty ? `<div style="opacity: 0.7; font-size: 11px;">更新时间: ${updateTime}</div>` : ''}
                    </div>
                    <div>
                        <button class="new-game-slot-btn" data-slot="${i}" style="
                            background: ${isEmpty ? '#4CAF50' : '#ff9800'};
                            border: none;
                            color: white;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">
                            ${isEmpty ? '选择此槽位' : '覆盖此槽位'}
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');

        return `<div>${cards}</div>`;
    }

    _setupNewGameSlotEvents(modal) {
        modal.querySelectorAll('.new-game-slot-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    const saveService = window.gameCore?.getService('saveService');
                    const list = saveService?.listSaves?.() || [];
                    const hasExisting = list[slot] !== null;

                    const confirmMsg = hasExisting ?
                        `确定要在槽位 ${slot + 1} 开始新游戏吗？\n\n⚠️ 这将覆盖现有存档！` :
                        `确定要在槽位 ${slot + 1} 开始新游戏吗？`;

                    const confirmed = await window.gameDialog.confirm({
                        title: '开始新游戏',
                        message: confirmMsg,
                        icon: hasExisting ? '⚠️' : '🌱',
                        confirmText: '开始',
                        cancelText: '取消',
                        confirmType: hasExisting ? 'warning' : 'success'
                    });

                    if (confirmed) {
                        modal.remove();
                        this.startNewGameInSlot(slot);
                    }
                }
            });
        });
    }

    // 在指定槽位开始新游戏
    startNewGameInSlot(slotIndex) {
        const saveService = window.gameCore?.getService('saveService');
        if (saveService) {
            const result = saveService.startNewGame();
            if (result.success) {
                saveService.saveToSlot(slotIndex, { label: '新游戏' });

                if (this.gameView && typeof this.gameView.hideStartPage === 'function') {
                    this.gameView.hideStartPage();
                }

                this._notify(`🌱 新游戏已在槽位 ${slotIndex + 1} 开始！`, 'success');

                // 通知 StartView 能接收的新游戏事件
                this.eventBus?.emit?.('start:new-game', { slot: slotIndex }, 'game');

                const gameContainer = document.querySelector('.game-container');
                if (gameContainer) {
                    gameContainer.classList.remove('hidden');
                    gameContainer.style.display = 'block';
                }

                const actionInput = document.getElementById('actionInput');
                if (actionInput) {
                    actionInput.focus();
                }
            } else {
                this._notify('新游戏启动失败', 'error');
                if (this.gameView && typeof this.gameView.showStartPage === 'function') {
                    this.gameView.showStartPage();
                }
            }
        }
    }

    // 复用主视图通知
    _notify(message, type = 'info') {
        if (this.gameView && typeof this.gameView.showNotification === 'function') {
            this.gameView.showNotification(message, type);
        } else {
            console.log(`[Notification][${type}] ${message}`);
        }
    }
}

export default SaveManagerView;

// 全局暴露（可选）
window.SaveManagerView = SaveManagerView;