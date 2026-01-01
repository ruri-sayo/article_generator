/* ============================================
   Article Generator - 施設管理
   ============================================ */

/**
 * 個別の施設を表すクラス
 */
class Building {
    /**
     * @param {Object} data 施設の基本データ
     */
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.baseCost = new Decimal(data.baseCost);
        this.baseCps = new Decimal(data.baseCps);
        this.description = data.description;
        this.owned = 0;
    }

    /**
     * 現在の購入コストを計算
     * @returns {Decimal} 現在のコスト
     */
    getCurrentCost() {
        const costMultiplier = game ? game.getCostMultiplier() : CONSTANTS.BUILDING_COST_MULTIPLIER;
        return this.baseCost.times(Decimal.pow(costMultiplier, this.owned)).floor();
    }

    /**
     * この施設の総CpSを計算
     * @param {number} upgradeMultiplier アップグレード倍率
     * @returns {Decimal} 総CpS
     */
    getCps(upgradeMultiplier = 1) {
        return this.baseCps.times(this.owned).times(upgradeMultiplier);
    }

    /**
     * 購入可能かどうか
     * @param {Decimal} articles 現在の記事数
     * @returns {boolean} 購入可能かどうか
     */
    canAfford(articles) {
        return articles.gte(this.getCurrentCost());
    }

    /**
     * 指定個数購入した場合の総コストを計算
     * @param {number} count 購入個数
     * @returns {Decimal} 総コスト
     */
    calculateBulkCost(count) {
        const costMultiplier = game ? game.getCostMultiplier() : CONSTANTS.BUILDING_COST_MULTIPLIER;
        let totalCost = new Decimal(0);

        for (let i = 0; i < count; i++) {
            const cost = this.baseCost.times(Decimal.pow(costMultiplier, this.owned + i)).floor();
            totalCost = totalCost.plus(cost);
        }

        return totalCost;
    }

    /**
     * 所持金で購入できる最大個数を計算
     * @param {Decimal} articles 現在の記事数
     * @returns {number} 最大購入可能個数
     */
    calculateMaxPurchasable(articles) {
        let count = 0;
        let spent = new Decimal(0);
        const costMultiplier = game ? game.getCostMultiplier() : CONSTANTS.BUILDING_COST_MULTIPLIER;

        while (count < 1000) { // 無限ループ防止
            const cost = this.baseCost.times(Decimal.pow(costMultiplier, this.owned + count)).floor();
            if (spent.plus(cost).gt(articles)) break;
            spent = spent.plus(cost);
            count++;
        }

        return count;
    }

    /**
     * 施設を購入
     * @param {number} count 購入個数（デフォルト: 1）
     * @returns {number} 実際に購入できた個数
     */
    purchase(count = 1) {
        if (!game) return 0;

        if (count === 'max') {
            count = this.calculateMaxPurchasable(game.articles);
        }

        if (count <= 0) return 0;

        const cost = this.calculateBulkCost(count);

        if (!game.articles.gte(cost)) {
            return 0;
        }

        game.articles = game.articles.minus(cost);
        this.owned += count;

        return count;
    }
}

/**
 * 施設UIを管理するクラス
 */
class BuildingsManager {
    constructor() {
        this.container = document.getElementById('buildings-list');
        this.purchaseMode = 1; // 1, 10, 100, 'max'
        this.modeButtons = null;
    }

    /**
     * 初期化
     */
    init() {
        this.createPurchaseModeUI();
        this.renderBuildings();
    }

    /**
     * 購入モード切り替えUIの作成
     */
    createPurchaseModeUI() {
        if (!this.container) return;

        const modeContainer = document.createElement('div');
        modeContainer.className = 'purchase-mode-selector';
        modeContainer.innerHTML = `
            <button class="mode-btn active" data-mode="1">x1</button>
            <button class="mode-btn" data-mode="10">x10</button>
            <button class="mode-btn" data-mode="100">x100</button>
            <button class="mode-btn" data-mode="max">Max</button>
        `;

        this.container.parentElement.insertBefore(modeContainer, this.container);

        this.modeButtons = modeContainer.querySelectorAll('.mode-btn');
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setPurchaseMode(btn.dataset.mode));
        });
    }

    /**
     * 購入モードを設定
     * @param {string|number} mode モード ('1', '10', '100', 'max')
     */
    setPurchaseMode(mode) {
        this.purchaseMode = mode === 'max' ? 'max' : parseInt(mode);

        // ボタンのアクティブ状態を更新
        if (this.modeButtons) {
            this.modeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode == mode);
            });
        }

        this.updateDisplay();
    }

    /**
     * 施設リストの描画
     */
    renderBuildings() {
        if (!this.container || !game) return;

        this.container.innerHTML = '';

        for (const building of game.buildings) {
            const card = this.createBuildingCard(building);
            this.container.appendChild(card);
        }
    }

    /**
     * 施設カードの作成
     * @param {Building} building 施設オブジェクト
     * @returns {HTMLElement} カード要素
     */
    createBuildingCard(building) {
        const card = document.createElement('div');
        card.className = 'building-card';
        card.dataset.buildingId = building.id;

        // 購入個数と総コストを計算
        let buyCount = this.purchaseMode === 'max'
            ? building.calculateMaxPurchasable(game.articles)
            : this.purchaseMode;

        const cost = this.purchaseMode === 1
            ? building.getCurrentCost()
            : building.calculateBulkCost(buyCount);

        const canAfford = game && game.articles.gte(cost) && buyCount > 0;
        if (canAfford) {
            card.classList.add('affordable');
        }

        const cps = building.getCps(game ? game.getUpgradeMultiplier(building.id) : 1);
        const buyLabel = this.purchaseMode === 1 ? '' : ` (x${buyCount})`;

        card.innerHTML = `
            <div class="building-header">
                <span class="building-name">${building.name}${buyLabel}</span>
                <span class="building-owned">${building.owned}</span>
            </div>
            <div class="building-stats">
                <span class="building-cps">+${formatNumber(building.baseCps)}/s</span>
                <span class="building-cost ${canAfford ? 'affordable' : 'expensive'}">
                    📄 ${formatNumber(cost)}
                </span>
            </div>
        `;

        // クリックイベント
        card.addEventListener('click', () => this.handlePurchase(building.id));

        // ツールチップ（ホバー時）
        card.title = `${building.description}\n現在の生産: ${formatNumber(cps)}/秒`;

        return card;
    }

    /**
     * 施設購入の処理
     * @param {number} buildingId 施設ID
     */
    handlePurchase(buildingId) {
        if (!game) return;

        const building = game.buildings[buildingId];
        if (!building) return;

        const purchasedCount = building.purchase(this.purchaseMode);

        if (purchasedCount > 0) {
            // 購入成功
            this.updateDisplay();

            // エフェクト
            const card = this.container.querySelector(`[data-building-id="${buildingId}"]`);
            if (card) {
                card.classList.add('animate-purchase-flash');
                setTimeout(() => card.classList.remove('animate-purchase-flash'), 500);
            }

            // アップグレードの解放をチェック
            if (typeof upgradesManager !== 'undefined') {
                upgradesManager.checkUnlocks();
            }

            // 座禅システムに通知
            if (typeof zenSystem !== 'undefined') {
                zenSystem.onUserAction();
            }
        } else {
            // 購入失敗（資金不足）
            const card = this.container.querySelector(`[data-building-id="${buildingId}"]`);
            if (card) {
                card.classList.add('animate-shake');
                setTimeout(() => card.classList.remove('animate-shake'), 500);
            }
        }
    }

    /**
     * 表示の更新
     */
    updateDisplay() {
        if (!this.container || !game) return;

        const cards = this.container.querySelectorAll('.building-card');

        cards.forEach(card => {
            const buildingId = parseInt(card.dataset.buildingId);
            const building = game.buildings[buildingId];
            if (!building) return;

            // 購入個数と総コストを計算
            let buyCount = this.purchaseMode === 'max'
                ? building.calculateMaxPurchasable(game.articles)
                : this.purchaseMode;

            const cost = this.purchaseMode === 1
                ? building.getCurrentCost()
                : building.calculateBulkCost(buyCount);

            const canAfford = game.articles.gte(cost) && buyCount > 0;

            // 購入可能状態の更新
            card.classList.toggle('affordable', canAfford);

            // 名前の更新（購入個数表示）
            const nameSpan = card.querySelector('.building-name');
            const buyLabel = this.purchaseMode === 1 ? '' : ` (x${buyCount})`;
            if (nameSpan) {
                const baseName = BUILDINGS_DATA[buildingId].name;
                nameSpan.textContent = baseName + buyLabel;
            }

            // 所有数の更新
            const ownedSpan = card.querySelector('.building-owned');
            if (ownedSpan) {
                ownedSpan.textContent = building.owned;
            }

            // CpSの更新 (アップグレード反映)
            const cpsSpan = card.querySelector('.building-cps');
            if (cpsSpan) {
                const cps = building.getCps(game ? game.getUpgradeMultiplier(building.id) : 1);
                cpsSpan.textContent = `+${formatNumber(cps)}/s`;
            }

            // コストの更新
            const costSpan = card.querySelector('.building-cost');
            if (costSpan) {
                costSpan.textContent = '📄 ' + formatNumber(cost);
                costSpan.classList.toggle('affordable', canAfford);
                costSpan.classList.toggle('expensive', !canAfford);
            }
        });
    }
}

// グローバルインスタンス
let buildingsManager;
