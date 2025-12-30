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
     * 施設を購入
     * @returns {boolean} 購入成功かどうか
     */
    purchase() {
        const cost = this.getCurrentCost();

        if (!game || !game.articles.gte(cost)) {
            return false;
        }

        game.articles = game.articles.minus(cost);
        this.owned++;

        return true;
    }
}

/**
 * 施設UIを管理するクラス
 */
class BuildingsManager {
    constructor() {
        this.container = document.getElementById('buildings-list');
    }

    /**
     * 初期化
     */
    init() {
        this.renderBuildings();
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

        const canAfford = game && building.canAfford(game.articles);
        if (canAfford) {
            card.classList.add('affordable');
        }

        const cost = building.getCurrentCost();
        const cps = building.getCps(game ? game.getUpgradeMultiplier(building.id) : 1);

        card.innerHTML = `
            <div class="building-header">
                <span class="building-name">${building.name}</span>
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

        if (building.purchase()) {
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

            // 購入可能状態の更新
            const canAfford = building.canAfford(game.articles);
            card.classList.toggle('affordable', canAfford);

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
                const cost = building.getCurrentCost();
                costSpan.textContent = '📄 ' + formatNumber(cost);
                costSpan.classList.toggle('affordable', canAfford);
                costSpan.classList.toggle('expensive', !canAfford);
            }
        });
    }
}

// グローバルインスタンス
let buildingsManager;
