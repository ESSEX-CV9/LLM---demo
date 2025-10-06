// services/CurrencyService.js - 货币管理服务
class CurrencyService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('currency:add', this.addCurrency.bind(this), 'game');
        this.eventBus.on('currency:remove', this.removeCurrency.bind(this), 'game');
        this.eventBus.on('currency:check', this.canAfford.bind(this), 'game');
    }

    /**
     * 获取当前货币（铜币）
     */
    getCurrency() {
        const gameStateService = window.gameCore?.getService('gameStateService');
        const player = gameStateService?.getState()?.player;
        return player?.currency || 0;
    }

    /**
     * 增加货币
     * @param {number} amount - 铜币数量
     */
    addCurrency(amount) {
        if (amount <= 0) return false;

        const gameStateService = window.gameCore?.getService('gameStateService');
        if (!gameStateService) return false;

        const player = gameStateService.getState().player;
        const oldCurrency = player.currency || 0;
        const newCurrency = oldCurrency + amount;

        gameStateService.updatePlayerStats({ currency: newCurrency });

        // 格式化货币显示
        const display = this.formatDisplay(amount);
        const message = `💰 获得了 ${display.gold > 0 ? display.gold + '金 ' : ''}${display.silver > 0 ? display.silver + '银 ' : ''}${display.copper}铜`;

        this.eventBus.emit('ui:notification', {
            message: message,
            type: 'success'
        }, 'game');

        this.eventBus.emit('currency:updated', {
            oldAmount: oldCurrency,
            newAmount: newCurrency,
            change: amount
        }, 'game');

        return true;
    }

    /**
     * 减少货币
     * @param {number} amount - 铜币数量
     */
    removeCurrency(amount) {
        if (amount <= 0) return false;

        const gameStateService = window.gameCore?.getService('gameStateService');
        if (!gameStateService) return false;

        const player = gameStateService.getState().player;
        const oldCurrency = player.currency || 0;

        if (oldCurrency < amount) {
            this.eventBus.emit('ui:notification', {
                message: '💰 金币不足！',
                type: 'warning'
            }, 'game');
            return false;
        }

        const newCurrency = oldCurrency - amount;
        gameStateService.updatePlayerStats({ currency: newCurrency });

        // 格式化货币显示
        const display = this.formatDisplay(amount);
        const message = `💰 花费了 ${display.gold > 0 ? display.gold + '金 ' : ''}${display.silver > 0 ? display.silver + '银 ' : ''}${display.copper}铜`;

        this.eventBus.emit('ui:notification', {
            message: message,
            type: 'info'
        }, 'game');

        this.eventBus.emit('currency:updated', {
            oldAmount: oldCurrency,
            newAmount: newCurrency,
            change: -amount
        }, 'game');

        return true;
    }

    /**
     * 检查是否买得起
     * @param {number} amount - 铜币数量
     */
    canAfford(amount) {
        const currentCurrency = this.getCurrency();
        return currentCurrency >= amount;
    }

    /**
     * 格式化货币显示
     * @param {number} copperAmount - 铜币数量
     * @returns {{gold: number, silver: number, copper: number}}
     */
    formatDisplay(copperAmount = null) {
        const amount = copperAmount !== null ? copperAmount : this.getCurrency();
        
        const gold = Math.floor(amount / 10000);
        const silver = Math.floor((amount % 10000) / 100);
        const copper = amount % 100;

        return { gold, silver, copper };
    }

    /**
     * 将金/银/铜转换为铜币
     * @param {number} gold - 金币数量
     * @param {number} silver - 银币数量
     * @param {number} copper - 铜币数量
     * @returns {number} 总铜币数
     */
    convertToCopper(gold = 0, silver = 0, copper = 0) {
        return gold * 10000 + silver * 100 + copper;
    }

    /**
     * 从铜币转换为金/银/铜
     * @param {number} copperAmount - 铜币数量
     * @returns {{gold: number, silver: number, copper: number}}
     */
    convertFromCopper(copperAmount) {
        return this.formatDisplay(copperAmount);
    }

    /**
     * 获取格式化的货币字符串
     * @param {number} copperAmount - 铜币数量（可选，默认使用当前货币）
     * @returns {string} 格式化的货币字符串
     */
    getFormattedString(copperAmount = null) {
        const display = this.formatDisplay(copperAmount);
        const parts = [];
        
        if (display.gold > 0) parts.push(`${display.gold}金`);
        if (display.silver > 0) parts.push(`${display.silver}银`);
        if (display.copper > 0 || parts.length === 0) parts.push(`${display.copper}铜`);
        
        return parts.join(' ');
    }
}

export default CurrencyService;