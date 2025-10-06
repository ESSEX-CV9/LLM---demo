// views/MerchantView.js - 巡游商人交易界面
class MerchantView {
    constructor(eventBus, gameView) {
        this.eventBus = eventBus;
        this.gameView = gameView;
        this.currentInventory = null;
        this.globalTooltipEl = null;
        this.globalTooltipAnchor = null;
        this._globalTooltipReposition = null;
        this._globalScrollTargets = null;
        this._suppressedInlineTooltip = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('ui:merchant:show', this.show.bind(this), 'game');
        this.eventBus.on('ui:merchant:hide', this.hide.bind(this), 'game');
        this.eventBus.on('merchant:inventory:updated', this.updateInventory.bind(this), 'game');
        this.eventBus.on('currency:updated', this.updateCurrencyDisplay.bind(this), 'game');
    }

    /**
     * 显示商人界面
     */
    show(data) {
        this.currentInventory = data.inventory;
        
        // 创建模态窗口
        const modal = document.createElement('div');
        modal.id = 'merchantModal';
        modal.className = 'merchant-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        `;

        const content = document.createElement('div');
        content.className = 'merchant-content';
        content.style.cssText = `
            background: linear-gradient(135deg, #2a3142 0%, #1e2533 100%);
            border-radius: 12px;
            padding: 24px;
            width: 90vw;
            max-width: 1200px;
            height: 85vh;
            max-height: 800px;
            display: flex;
            flex-direction: row;
            gap: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border: 2px solid rgba(255, 215, 0, 0.3);
            color: white;
            overflow: hidden;
        `;

        // 添加响应式样式和滚动条隐藏
        const style = document.createElement('style');
        style.textContent = `
            /* 隐藏滚动条但保持滚动功能 */
            .merchant-goods::-webkit-scrollbar {
                width: 0px;
                height: 0px;
            }
            .merchant-goods {
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            
            /* 响应式布局 */
            @media (max-width: 476px) {
                .merchant-content {
                    flex-direction: column !important;
                    width: 95vw !important;
                    height: 90vh !important;
                    padding: 16px !important;
                    gap: 12px !important;
                }
                .merchant-left-panel {
                    width: 100% !important;
                    max-height: 40vh !important;
                }
                .merchant-right-panel {
                    width: 100% !important;
                    flex: 1 !important;
                }
                .merchant-header h2 {
                    font-size: 20px !important;
                }
                .goods-grid {
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
                }
            }
        `;
        document.head.appendChild(style);

        content.innerHTML = this.generateMerchantHTML(data);
        modal.appendChild(content);
        document.body.appendChild(modal);

        // 设置事件监听
        this.setupMerchantEvents(modal);
        
        // 绑定商品卡片事件
        this.setupItemCardEvents(modal);
    }

    /**
     * 生成商人界面HTML
     */
    generateMerchantHTML(data) {
        const currencyService = window.gameCore?.getService('currencyService');
        const currencyDisplay = currencyService?.formatDisplay() || { gold: 0, silver: 0, copper: 0 };

        return `
            <!-- 左侧面板 -->
            <div class="merchant-left-panel" style="
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <div class="merchant-header" style="margin-bottom: 16px;">
                    <h2 style="margin: 0 0 10px 0; color: #ffd700; font-size: 28px; text-align: center;">
                        🏪 巡游商人
                    </h2>
                    <div style="font-size: 13px; opacity: 0.8; text-align: center; margin-bottom: 12px;">
                        "旅行者，看看我的商品吧！都是好东西！"
                    </div>
                    <div id="merchantCurrencyDisplay" style="
                        background: rgba(0, 0, 0, 0.3);
                        padding: 8px 16px;
                        border-radius: 8px;
                        text-align: center;
                        border: 1px solid rgba(255, 215, 0, 0.3);
                        font-size: 14px;
                    ">
                        💰 你的金币:
                        <span style="color: #ffd700;">${currencyDisplay.gold}</span>金
                        <span style="color: #c0c0c0;">${currencyDisplay.silver}</span>银
                        <span style="color: #cd7f32;">${currencyDisplay.copper}</span>铜
                    </div>
                </div>

                <div class="merchant-goods" style="
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 8px;
                ">
                    ${this.generateGoodsHTML(data.inventory)}
                </div>
            </div>

            <!-- 右侧面板 -->
            <div class="merchant-right-panel" style="
                width: 320px;
                display: flex;
                flex-direction: column;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                padding: 20px;
                border: 1px solid rgba(255, 215, 0, 0.2);
            ">
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🏪</div>
                    <h3 style="color: #ffd700; margin-bottom: 12px;">商人的话</h3>
                    <p style="opacity: 0.8; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                        欢迎光临！我的货物都是从各地精心搜罗来的。
                        <br><br>
                        你看中了什么就告诉我，价格公道，童叟无欺！
                        <br><br>
                        如果你有不需要的东西，我也愿意收购。
                    </p>
                    
                    <!-- 出售物品按钮 -->
                    <button id="sellItemBtn" class="quick-action-button" style="
                        padding: 10px 20px;
                        font-size: 14px;
                        background: #4CAF50;
                        border: none;
                        color: white;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s;
                        width: 100%;
                        margin-bottom: 12px;
                    ">
                        💰 出售物品
                    </button>
                    
                    <div style="
                        background: rgba(255, 215, 0, 0.1);
                        padding: 12px;
                        border-radius: 6px;
                        border: 1px solid rgba(255, 215, 0, 0.3);
                        font-size: 12px;
                        opacity: 0.7;
                        margin-top: auto;
                    ">
                        💡 提示：点击商品卡片查看详情<br>
                        点击购买按钮即可交易<br>
                        点击"出售物品"可以卖给商人
                    </div>
                </div>

                <button id="closeMerchantBtn" class="quick-action-button" style="
                    padding: 12px 24px;
                    font-size: 16px;
                    background: #666;
                    border: none;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: 16px;
                    width: 100%;
                ">
                    关闭商店
                </button>
            </div>
        `;
    }

    /**
     * 生成商品列表HTML
     */
    generateGoodsHTML(inventory) {
        if (!inventory || inventory.length === 0) {
            return '<div style="text-align: center; padding: 40px; opacity: 0.6;">商人的货物已经卖光了...</div>';
        }

        // 按类别分组
        const categories = {
            basic_consumable: { title: '📦 基础消耗品', items: [] },
            advanced_consumable: { title: '⭐ 高级药水', items: [] },
            equipment: { title: '⚔️ 装备', items: [] },
            random: { title: '🎲 特殊商品', items: [] }
        };

        for (const item of inventory) {
            const category = item.category || 'random';
            if (categories[category]) {
                categories[category].items.push(item);
            }
        }

        let html = '';
        for (const [key, category] of Object.entries(categories)) {
            if (category.items.length > 0) {
                html += `
                    <div class="goods-category" style="margin-bottom: 24px;">
                        <h3 style="
                            color: #ffd700;
                            font-size: 16px;
                            margin-bottom: 12px;
                            padding-bottom: 8px;
                            border-bottom: 2px solid rgba(255, 215, 0, 0.3);
                        ">
                            ${category.title}
                        </h3>
                        <div class="goods-grid" style="
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                            gap: 12px;
                        ">
                            ${category.items.map(item => this.generateItemCard(item)).join('')}
                        </div>
                    </div>
                `;
            }
        }

        return html;
    }

    /**
     * 生成单个商品卡片（紧凑版）
     */
    generateItemCard(item) {
        const rarityColor = this.gameView?.getRarityColor(item.data.rarity) || '#ffffff';
        const icon = item.data.icon || '📦';
        
        // 处理图标
        let iconHTML;
        if (icon.startsWith('./assets/') || icon.startsWith('assets/')) {
            const base = window.CDN_BASE_URL || '';
            const src = base + icon.replace(/^\.\//, '');
            iconHTML = `<img src="${src}" alt="${item.name}" style="width: 64px; height: 64px; object-fit: contain;">`;
        } else {
            iconHTML = `<span style="font-size: 64px;">${icon}</span>`;
        }

        return `
            <div class="merchant-item-card"
                 data-item="${item.name}"
                 data-item-data='${JSON.stringify(item).replace(/'/g, "&apos;")}'
                 style="
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid ${rarityColor}40;
                border-radius: 8px;
                padding: 8px;
                transition: all 0.2s;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                position: relative;
            ">
                <div class="item-icon" style="margin-bottom: 6px;">
                    ${iconHTML}
                </div>
                <div class="item-name" style="
                    color: ${rarityColor};
                    font-weight: bold;
                    font-size: 12px;
                    margin-bottom: 4px;
                    line-height: 1.2;
                    word-break: break-word;
                    min-height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    ${item.name}
                </div>
                <div style="
                    color: #ffd700;
                    font-size: 11px;
                    font-weight: bold;
                    margin-bottom: 2px;
                ">
                    💰 ${this.formatPrice(item.unitPrice)}
                </div>
                <div style="font-size: 10px; opacity: 0.6;">
                    库存: ${item.quantity}
                </div>
                
                <!-- 隐藏的详细信息用于悬浮提示 -->
                <div class="item-tooltip" style="display: none;">
                    ${this.generateItemTooltip(item)}
                </div>
            </div>
        `;
    }
    
    /**
     * 生成物品悬浮提示内容
     */
    generateItemTooltip(item) {
        const rarityColor = this.gameView?.getRarityColor(item.data.rarity) || '#ffffff';
        const isEquipment = item.data.type === 'weapon' || item.data.type === 'armor' || item.data.type === 'accessory';
        
        let tooltipHTML = `
            <div class="tooltip-name" style="color: ${rarityColor}; font-weight: bold; margin-bottom: 8px;">
                ${item.name}
            </div>
            <div class="tooltip-description" style="opacity: 0.9; margin-bottom: 8px; line-height: 1.4;">
                ${item.data.description || ''}
            </div>
        `;
        
        if (isEquipment && item.data.stats) {
            tooltipHTML += this.gameView?.generateEquipmentTooltip(item.data) || '';
        } else {
            tooltipHTML += this.gameView?.generateItemTooltip(item.data) || '';
        }
        
        // 添加价格和库存信息
        tooltipHTML += `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">
                <div style="color: #ffd700; margin-bottom: 4px;">
                    💰 单价: ${this.formatPrice(item.unitPrice)}
                </div>
                <div style="opacity: 0.7; font-size: 11px;">
                    📦 库存: ${item.quantity}
                </div>
            </div>
        `;
        
        return tooltipHTML;
    }

    /**
     * 格式化价格显示
     */
    formatPrice(copperAmount) {
        const gold = Math.floor(copperAmount / 10000);
        const silver = Math.floor((copperAmount % 10000) / 100);
        const copper = copperAmount % 100;

        const parts = [];
        if (gold > 0) parts.push(`${gold}金`);
        if (silver > 0) parts.push(`${silver}银`);
        if (copper > 0 || parts.length === 0) parts.push(`${copper}铜`);

        return parts.join(' ');
    }

    /**
     * 设置商人界面事件
     */
    setupMerchantEvents(modal) {
        // 关闭按钮
        const closeBtn = modal.querySelector('#closeMerchantBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.background = '#555';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.background = '#666';
            });
        }

        // 出售物品按钮
        const sellBtn = modal.querySelector('#sellItemBtn');
        if (sellBtn) {
            sellBtn.addEventListener('click', () => {
                this.showSellItemDialog();
            });
            sellBtn.addEventListener('mouseenter', () => {
                sellBtn.style.background = '#45a049';
            });
            sellBtn.addEventListener('mouseleave', () => {
                sellBtn.style.background = '#4CAF50';
            });
        }

        // 绑定商品卡片事件
        this.setupItemCardEvents(modal);

        // ESC键关闭
        this.escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        };
        document.addEventListener('keydown', this.escHandler);
    }
    
    /**
     * 设置商品卡片事件（独立方法，便于更新后重新绑定）
     */
    setupItemCardEvents(modal) {
        const itemCards = modal.querySelectorAll('.merchant-item-card');
        itemCards.forEach(card => {
            // 点击显示购买对话框
            card.addEventListener('click', (e) => {
                const itemName = card.dataset.item;
                const itemDataStr = card.dataset.itemData;
                try {
                    const itemData = JSON.parse(itemDataStr.replace(/&apos;/g, "'"));
                    this.showPurchaseDialog(itemData);
                } catch (err) {
                    console.error('解析物品数据失败:', err);
                }
            });
            
            // 悬浮效果和提示
            card.addEventListener('mouseenter', () => {
                card.style.background = 'rgba(255, 255, 255, 0.1)';
                card.style.transform = 'translateY(-4px) scale(1.05)';
                card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                
                // 显示全局提示
                const tooltipEl = card.querySelector('.item-tooltip');
                if (tooltipEl) {
                    this.showGlobalTooltip(card, tooltipEl.innerHTML);
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.background = 'rgba(255, 255, 255, 0.05)';
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = 'none';
                
                // 隐藏全局提示
                this.hideGlobalTooltip();
            });
        });
    }

    /**
     * 显示购买对话框
     */
    showPurchaseDialog(itemData) {
        const merchantService = window.gameCore?.getService('merchantService');
        const currencyService = window.gameCore?.getService('currencyService');
        
        if (!merchantService || !currencyService) {
            console.error('[MerchantView] 服务不可用');
            return;
        }
        
        const rarityColor = this.gameView?.getRarityColor(itemData.data.rarity) || '#ffffff';
        const icon = itemData.data.icon || '📦';
        
        // 处理图标
        let iconHTML;
        if (icon.startsWith('./assets/') || icon.startsWith('assets/')) {
            const base = window.CDN_BASE_URL || '';
            const src = base + icon.replace(/^\.\//, '');
            iconHTML = `<img src="${src}" alt="${itemData.name}" style="width: 80px; height: 80px; object-fit: contain;">`;
        } else {
            iconHTML = `<span style="font-size: 80px;">${icon}</span>`;
        }
        
        // 创建对话框
        const dialog = document.createElement('div');
        dialog.className = 'purchase-dialog-overlay';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease-out;
        `;
        
        const dialogContent = document.createElement('div');
        dialogContent.className = 'purchase-dialog-content';
        dialogContent.style.cssText = `
            background: linear-gradient(135deg, #2a3142 0%, #1e2533 100%);
            border-radius: 12px;
            padding: 24px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border: 2px solid ${rarityColor}80;
            color: white;
            animation: slideUp 0.3s ease-out;
        `;
        
        dialogContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="margin-bottom: 12px;">
                    ${iconHTML}
                </div>
                <h3 style="color: ${rarityColor}; margin: 0 0 8px 0;">${itemData.name}</h3>
                <p style="opacity: 0.8; font-size: 13px; margin: 0;">${itemData.data.description || ''}</p>
            </div>
            
            <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>单价:</span>
                    <span style="color: #ffd700;">💰 ${this.formatPrice(itemData.unitPrice)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>库存:</span>
                    <span>📦 ${itemData.quantity}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                    <span>购买数量:</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button id="decreaseBtn" style="
                            width: 32px;
                            height: 32px;
                            background: rgba(255, 255, 255, 0.1);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            color: white;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 18px;
                            line-height: 1;
                        ">-</button>
                        <input type="number" id="quantityInput" value="1" min="1" max="${itemData.quantity}" style="
                            width: 60px;
                            text-align: center;
                            padding: 6px;
                            background: rgba(255, 255, 255, 0.1);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            color: white;
                            border-radius: 4px;
                            font-size: 16px;
                        ">
                        <button id="increaseBtn" style="
                            width: 32px;
                            height: 32px;
                            background: rgba(255, 255, 255, 0.1);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            color: white;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 18px;
                            line-height: 1;
                        ">+</button>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                    <span style="font-weight: bold;">总价:</span>
                    <span id="totalPrice" style="color: #ffd700; font-weight: bold;">💰 ${this.formatPrice(itemData.unitPrice)}</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 8px;">
                <button id="cancelBtn" style="
                    flex: 1;
                    padding: 12px;
                    background: #666;
                    border: none;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                ">取消</button>
                <button id="confirmBtn" style="
                    flex: 1;
                    padding: 12px;
                    background: #4CAF50;
                    border: none;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    transition: all 0.2s;
                ">确认购买</button>
            </div>
        `;
        
        dialog.appendChild(dialogContent);
        document.body.appendChild(dialog);
        
        // 设置事件监听
        const quantityInput = dialogContent.querySelector('#quantityInput');
        const totalPriceEl = dialogContent.querySelector('#totalPrice');
        const decreaseBtn = dialogContent.querySelector('#decreaseBtn');
        const increaseBtn = dialogContent.querySelector('#increaseBtn');
        const cancelBtn = dialogContent.querySelector('#cancelBtn');
        const confirmBtn = dialogContent.querySelector('#confirmBtn');
        
        const updateTotalPrice = () => {
            const quantity = parseInt(quantityInput.value) || 1;
            const total = itemData.unitPrice * quantity;
            totalPriceEl.textContent = `💰 ${this.formatPrice(total)}`;
            
            // 检查是否能支付
            const canAfford = currencyService.canAfford(total);
            confirmBtn.disabled = !canAfford;
            confirmBtn.style.opacity = canAfford ? '1' : '0.5';
            confirmBtn.style.cursor = canAfford ? 'pointer' : 'not-allowed';
            if (!canAfford) {
                confirmBtn.textContent = '金币不足';
            } else {
                confirmBtn.textContent = '确认购买';
            }
        };
        
        quantityInput.addEventListener('input', () => {
            let val = parseInt(quantityInput.value) || 1;
            val = Math.max(1, Math.min(itemData.quantity, val));
            quantityInput.value = val;
            updateTotalPrice();
        });
        
        decreaseBtn.addEventListener('click', () => {
            let val = parseInt(quantityInput.value) || 1;
            if (val > 1) {
                quantityInput.value = val - 1;
                updateTotalPrice();
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            let val = parseInt(quantityInput.value) || 1;
            if (val < itemData.quantity) {
                quantityInput.value = val + 1;
                updateTotalPrice();
            }
        });
        
        // 统一关闭购买弹窗的函数，确保彻底清理
        const closePurchaseDialog = () => {
            try {
                // 移除键盘监听
                if (escHandler) {
                    document.removeEventListener('keydown', escHandler);
                }
            } catch(e) {}
            // 移除所有购买弹窗遮罩
            document.querySelectorAll('.purchase-dialog-overlay').forEach(el => {
                if (el && el.parentNode) el.parentNode.removeChild(el);
            });
            // 移除可能存在的内容容器
            document.querySelectorAll('.purchase-dialog-content').forEach(el => {
                if (el && el.parentNode) el.parentNode.removeChild(el);
            });
        };

        // ESC关闭（需要在按钮监听器之前定义）
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closePurchaseDialog();
            }
        };
        document.addEventListener('keydown', escHandler);
        
        cancelBtn.addEventListener('click', () => {
            closePurchaseDialog();
        });
        
        confirmBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value) || 1;
            const result = this.handlePurchase(itemData.name, quantity);
            
            // 只有购买成功时才关闭对话框
            if (result && result.success) {
                closePurchaseDialog();
            }
            // 如果购买失败，对话框保持打开，用户可以修改数量或取消
        });
        
        // 点击背景关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                closePurchaseDialog();
            }
        });
        
        // 初始化价格
        updateTotalPrice();
    }
    
    /**
     * 处理购买
     */
    handlePurchase(itemName, quantity) {
        const merchantService = window.gameCore?.getService('merchantService');
        if (!merchantService) {
            console.error('[MerchantView] 商人服务不可用');
            return { success: false, message: '商人服务不可用' };
        }

        const result = merchantService.buyItem(itemName, quantity);
        
        if (result.success) {
            // 购买成功，刷新界面
            this.eventBus.emit('ui:notification', {
                message: result.message,
                type: 'success'
            }, 'game');
        }
        
        // 返回结果，让调用者知道是否成功
        return result;
    }

    /**
     * 显示出售物品对话框
     */
    showSellItemDialog() {
        const inventoryService = window.gameCore?.getService('inventoryService');
        if (!inventoryService) {
            this.eventBus.emit('ui:notification', {
                message: '背包系统不可用',
                type: 'error'
            }, 'game');
            return;
        }

        const allItems = inventoryService.getAllItems();
        if (allItems.length === 0) {
            this.eventBus.emit('ui:notification', {
                message: '你没有任何可以出售的物品',
                type: 'warning'
            }, 'game');
            return;
        }

        // 创建出售对话框
        const dialog = document.createElement('div');
        dialog.className = 'sell-dialog-overlay';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            animation: fadeIn 0.2s ease-out;
        `;

        const dialogContent = document.createElement('div');
        dialogContent.className = 'sell-dialog-content';
        dialogContent.style.cssText = `
            background: linear-gradient(135deg, #2a3142 0%, #1e2533 100%);
            border-radius: 12px;
            padding: 24px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border: 2px solid rgba(76, 175, 80, 0.5);
            color: white;
            animation: slideUp 0.3s ease-out;
        `;

        dialogContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #4CAF50; margin: 0 0 8px 0;">💰 出售物品</h3>
                <p style="opacity: 0.8; font-size: 13px; margin: 0;">选择要出售给商人的物品（出售价格为物品价值的50%）</p>
            </div>
            <div id="sellItemsGrid" style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 12px;
                margin-bottom: 20px;
            ">
                ${this.generateSellItemsGrid(allItems)}
            </div>
            <div style="display: flex; gap: 8px;">
                <button id="cancelSellBtn" style="
                    flex: 1;
                    padding: 12px;
                    background: #666;
                    border: none;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">取消</button>
            </div>
        `;

        dialog.appendChild(dialogContent);
        document.body.appendChild(dialog);

        // 设置事件
        const cancelBtn = dialogContent.querySelector('#cancelSellBtn');
        cancelBtn.addEventListener('click', () => {
            dialog.remove();
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });

        // ESC关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                dialog.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // 绑定物品卡片点击事件
        this.setupSellItemCardEvents(dialogContent);
    }

    /**
     * 生成出售物品网格
     */
    generateSellItemsGrid(items) {
        if (items.length === 0) {
            return '<div style="text-align: center; padding: 20px; opacity: 0.6;">没有可出售的物品</div>';
        }

        return items.map(item => {
            const rarityColor = this.gameView?.getRarityColor(item.rarity) || '#ffffff';
            const icon = item.icon || '📦';
            const sellPrice = Math.floor((item.value || 1) * 0.5);

            let iconHTML;
            if (icon.startsWith('./assets/') || icon.startsWith('assets/')) {
                const base = window.CDN_BASE_URL || '';
                const src = base + icon.replace(/^\.\//, '');
                iconHTML = `<img src="${src}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: contain;">`;
            } else {
                iconHTML = `<span style="font-size: 48px;">${icon}</span>`;
            }

            return `
                <div class="sell-item-card" data-item="${item.name}" style="
                    background: rgba(255, 255, 255, 0.05);
                    border: 2px solid ${rarityColor}40;
                    border-radius: 8px;
                    padding: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                ">
                    <div style="margin-bottom: 4px;">${iconHTML}</div>
                    <div style="color: ${rarityColor}; font-size: 11px; font-weight: bold; margin-bottom: 2px;">
                        ${item.name}
                    </div>
                    <div style="font-size: 10px; opacity: 0.6; margin-bottom: 2px;">
                        x${item.quantity}
                    </div>
                    <div style="color: #4CAF50; font-size: 10px; font-weight: bold;">
                        💰 ${this.formatPrice(sellPrice)}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 设置出售物品卡片事件
     */
    setupSellItemCardEvents(dialogContent) {
        const cards = dialogContent.querySelectorAll('.sell-item-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.background = 'rgba(76, 175, 80, 0.2)';
                card.style.transform = 'translateY(-2px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.background = 'rgba(255, 255, 255, 0.05)';
                card.style.transform = 'translateY(0)';
            });
            card.addEventListener('click', () => {
                const itemName = card.dataset.item;
                this.showSellQuantityDialog(itemName);
            });
        });
    }

    /**
     * 显示出售数量选择对话框
     */
    showSellQuantityDialog(itemName) {
        const inventoryService = window.gameCore?.getService('inventoryService');
        const item = inventoryService.getItem(itemName);
        
        if (!item) return;

        const sellPrice = Math.floor((item.value || 1) * 0.5);
        const rarityColor = this.gameView?.getRarityColor(item.rarity) || '#ffffff';

        const dialog = document.createElement('div');
        dialog.className = 'sell-quantity-dialog-overlay';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10002;
            animation: fadeIn 0.2s ease-out;
        `;

        const dialogContent = document.createElement('div');
        dialogContent.style.cssText = `
            background: linear-gradient(135deg, #2a3142 0%, #1e2533 100%);
            border-radius: 12px;
            padding: 24px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border: 2px solid ${rarityColor}80;
            color: white;
            animation: slideUp 0.3s ease-out;
        `;

        dialogContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: ${rarityColor}; margin: 0 0 8px 0;">出售 ${item.name}</h3>
                <p style="opacity: 0.8; font-size: 13px; margin: 0;">单价: ${this.formatPrice(sellPrice)} (原价的50%)</p>
            </div>
            <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>拥有数量:</span>
                    <span>📦 ${item.quantity}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                    <span>出售数量:</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button id="decreaseSellBtn" style="
                            width: 32px; height: 32px;
                            background: rgba(255, 255, 255, 0.1);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            color: white; border-radius: 4px;
                            cursor: pointer; font-size: 18px;
                        ">-</button>
                        <input type="number" id="sellQuantityInput" value="1" min="1" max="${item.quantity}" style="
                            width: 60px; text-align: center; padding: 6px;
                            background: rgba(255, 255, 255, 0.1);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            color: white; border-radius: 4px; font-size: 16px;
                        ">
                        <button id="increaseSellBtn" style="
                            width: 32px; height: 32px;
                            background: rgba(255, 255, 255, 0.1);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            color: white; border-radius: 4px;
                            cursor: pointer; font-size: 18px;
                        ">+</button>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                    <span style="font-weight: bold;">获得金币:</span>
                    <span id="sellTotalPrice" style="color: #4CAF50; font-weight: bold;">💰 ${this.formatPrice(sellPrice)}</span>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button id="cancelSellQuantityBtn" style="
                    flex: 1; padding: 12px;
                    background: #666; border: none;
                    color: white; border-radius: 6px;
                    cursor: pointer; font-size: 14px;
                ">取消</button>
                <button id="confirmSellBtn" style="
                    flex: 1; padding: 12px;
                    background: #4CAF50; border: none;
                    color: white; border-radius: 6px;
                    cursor: pointer; font-size: 14px; font-weight: bold;
                ">确认出售</button>
            </div>
        `;

        dialog.appendChild(dialogContent);
        document.body.appendChild(dialog);

        // 设置事件
        const quantityInput = dialogContent.querySelector('#sellQuantityInput');
        const totalPriceEl = dialogContent.querySelector('#sellTotalPrice');
        const decreaseBtn = dialogContent.querySelector('#decreaseSellBtn');
        const increaseBtn = dialogContent.querySelector('#increaseSellBtn');
        const cancelBtn = dialogContent.querySelector('#cancelSellQuantityBtn');
        const confirmBtn = dialogContent.querySelector('#confirmSellBtn');

        const updateTotalPrice = () => {
            const quantity = parseInt(quantityInput.value) || 1;
            const total = sellPrice * quantity;
            totalPriceEl.textContent = `💰 ${this.formatPrice(total)}`;
        };

        quantityInput.addEventListener('input', () => {
            let val = parseInt(quantityInput.value) || 1;
            val = Math.max(1, Math.min(item.quantity, val));
            quantityInput.value = val;
            updateTotalPrice();
        });

        decreaseBtn.addEventListener('click', () => {
            let val = parseInt(quantityInput.value) || 1;
            if (val > 1) {
                quantityInput.value = val - 1;
                updateTotalPrice();
            }
        });

        increaseBtn.addEventListener('click', () => {
            let val = parseInt(quantityInput.value) || 1;
            if (val < item.quantity) {
                quantityInput.value = val + 1;
                updateTotalPrice();
            }
        });

        cancelBtn.addEventListener('click', () => {
            dialog.remove();
        });

        confirmBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value) || 1;
            this.handleSell(itemName, quantity);
            dialog.remove();
            // 同时关闭出售物品选择对话框
            document.querySelector('.sell-dialog-overlay')?.remove();
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    /**
     * 处理出售
     */
    handleSell(itemName, quantity) {
        const merchantService = window.gameCore?.getService('merchantService');
        if (!merchantService) {
            this.eventBus.emit('ui:notification', {
                message: '商人服务不可用',
                type: 'error'
            }, 'game');
            return;
        }

        merchantService.sellItem(itemName, quantity);
    }

    /**
     * 更新库存显示
     */
    updateInventory(data) {
        this.currentInventory = data.inventory;
        
        const modal = document.getElementById('merchantModal');
        if (!modal) return;

        const content = modal.querySelector('.merchant-content');
        if (content) {
            // 重新生成商品列表
            const goodsContainer = content.querySelector('.merchant-goods');
            if (goodsContainer) {
                goodsContainer.innerHTML = this.generateGoodsHTML(data.inventory);
                
                // 重新绑定商品卡片事件（包括点击和悬浮）
                this.setupItemCardEvents(modal);
            }
        }
    }

    /**
     * 更新货币显示
     */
    updateCurrencyDisplay(data) {
        const currencyDisplay = document.getElementById('merchantCurrencyDisplay');
        if (!currencyDisplay) return;

        const currencyService = window.gameCore?.getService('currencyService');
        const display = currencyService?.formatDisplay() || { gold: 0, silver: 0, copper: 0 };

        currencyDisplay.innerHTML = `
            💰 你的金币: 
            <span style="color: #ffd700;">${display.gold}</span>金 
            <span style="color: #c0c0c0;">${display.silver}</span>银 
            <span style="color: #cd7f32;">${display.copper}</span>铜
        `;
    }

    /**
     * 隐藏商人界面
     */
    hide() {
        // 防止重复调用
        if (this.isHiding) {
            console.log('[MerchantView] 正在关闭中，忽略重复调用');
            return;
        }
        
        this.isHiding = true;
        console.log('[MerchantView] 开始关闭商人界面');
        
        const modal = document.getElementById('merchantModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                
                // 在动画完成并移除模态框后触发关闭事件
                console.log('[MerchantView] 商人界面已关闭，触发ui:merchant:hide事件');
                this.eventBus.emit('ui:merchant:hide', {}, 'game');
                // 重置标志
                this.isHiding = false;
            }, 300);
        } else {
            // 如果没有模态框，说明已经关闭了，不需要再emit事件
            console.log('[MerchantView] 没有找到商人模态框，不触发事件（已经关闭）');
            this.isHiding = false;
        }

        // 移除ESC键监听
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
            this.escHandler = null;
        }

        // 通知商人服务关闭
        const merchantService = window.gameCore?.getService('merchantService');
        if (merchantService) {
            merchantService.currentInventory = null;
        }
    }
    
    /**
     * 显示全局提示（类似InventoryView）
     */
    showGlobalTooltip(anchor, html) {
        try {
            if (!this.globalTooltipEl) {
                this.globalTooltipEl = document.createElement('div');
                this.globalTooltipEl.className = 'global-merchant-tooltip';
                this.globalTooltipEl.style.cssText = `
                    position: fixed;
                    z-index: 1000001;
                    pointer-events: none;
                    background: rgba(0, 0, 0, 0.95);
                    color: #fff;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.8);
                    border: 1px solid rgba(255,255,255,0.2);
                    max-width: 320px;
                    min-width: 200px;
                    opacity: 0;
                    transition: opacity 0.15s ease-out;
                `;
                document.body.appendChild(this.globalTooltipEl);
            }

            this.globalTooltipEl.innerHTML = html;
            this.globalTooltipAnchor = anchor;

            this.repositionGlobalTooltip();
            this.globalTooltipEl.style.opacity = '1';

            this._globalTooltipReposition = () => this.repositionGlobalTooltip();

            this._globalScrollTargets = [];
            const addScrollTarget = (el) => {
                if (el && typeof el.addEventListener === 'function') {
                    el.addEventListener('scroll', this._globalTooltipReposition, true);
                    this._globalScrollTargets.push(el);
                }
            };

            const modal = document.getElementById('merchantModal');
            const content = modal ? modal.querySelector('.merchant-content') : null;
            const goods = modal ? modal.querySelector('.merchant-goods') : null;

            addScrollTarget(window);
            addScrollTarget(document);
            addScrollTarget(modal);
            addScrollTarget(content);
            addScrollTarget(goods);

            window.addEventListener('resize', this._globalTooltipReposition, true);
        } catch (e) {
            console.warn('[MerchantView] showGlobalTooltip error:', e);
        }
    }

    /**
     * 重新定位全局提示
     */
    repositionGlobalTooltip() {
        try {
            if (!this.globalTooltipEl || !this.globalTooltipAnchor) return;

            const rect = this.globalTooltipAnchor.getBoundingClientRect();
            const margin = 8;

            const ttRect = this.globalTooltipEl.getBoundingClientRect();

            let top = rect.top - ttRect.height - margin;
            let left = rect.left + rect.width / 2 - ttRect.width / 2;

            const clamp = (min, v, max) => Math.max(min, Math.min(v, max));
            left = clamp(10, left, window.innerWidth - ttRect.width - 10);

            if (top < 10) {
                top = rect.bottom + margin;
            }
            if (top + ttRect.height > window.innerHeight - 10) {
                top = window.innerHeight - ttRect.height - 10;
            }

            this.globalTooltipEl.style.left = `${Math.round(left)}px`;
            this.globalTooltipEl.style.top = `${Math.round(top)}px`;
        } catch (e) {
            console.warn('[MerchantView] repositionGlobalTooltip error:', e);
        }
    }

    /**
     * 隐藏全局提示
     */
    hideGlobalTooltip() {
        try {
            if (this._globalTooltipReposition) {
                window.removeEventListener('resize', this._globalTooltipReposition, true);
            }
            if (this._globalScrollTargets && this._globalScrollTargets.length) {
                for (const el of this._globalScrollTargets) {
                    el.removeEventListener('scroll', this._globalTooltipReposition, true);
                }
                this._globalScrollTargets = null;
            }
            this._globalTooltipReposition = null;

            if (this.globalTooltipEl && this.globalTooltipEl.parentNode) {
                const el = this.globalTooltipEl;
                el.style.opacity = '0';
                setTimeout(() => {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                }, 150);
            }

            this.globalTooltipEl = null;
            this.globalTooltipAnchor = null;
        } catch (e) {
            console.warn('[MerchantView] hideGlobalTooltip error:', e);
        }
    }
}

export default MerchantView;