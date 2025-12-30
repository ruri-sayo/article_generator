/* ============================================
   Article Generator - アップグレード管理
   ============================================ */

/**
 * 個別のアップグレードを表すクラス
 */
class Upgrade {
    /**
     * @param {Object} data アップグレードの基本データ
     */
    constructor(data) {
        this.id = data.id;
        this.buildingId = data.buildingId;
        this.requiredCount = data.requiredCount;
        this.name = data.name;
        this.flavorText = data.flavor;

        // 解放条件からマルチプライヤーを取得
        const threshold = UPGRADE_THRESHOLDS.find(t => t.count === this.requiredCount);
        this.multiplier = threshold ? threshold.multiplier : 1;

        this.unlocked = false;
        this.purchased = false;
    }

    /**
     * 購入コストを計算
     * @returns {Decimal} コスト
     */
    getCost() {
        if (!game) return new Decimal(0);

        const building = game.buildings[this.buildingId];
        const costMultiplier = UPGRADE_COST_MULTIPLIERS[this.requiredCount] || 100;

        return building.baseCost.times(costMultiplier);
    }

    /**
     * 解放条件を満たしているかチェック
     * @returns {boolean} 解放可能かどうか
     */
    canUnlock() {
        if (!game) return false;

        const building = game.buildings[this.buildingId];
        return building.owned >= this.requiredCount;
    }

    /**
     * 購入可能かどうか
     * @returns {boolean} 購入可能かどうか
     */
    canAfford() {
        if (!game) return false;
        return game.articles.gte(this.getCost());
    }

    /**
     * アップグレードを購入
     * @returns {boolean} 購入成功かどうか
     */
    purchase() {
        if (!game || this.purchased || !this.canAfford()) {
            return false;
        }

        game.articles = game.articles.minus(this.getCost());
        this.purchased = true;
        game.purchasedUpgrades[this.id] = true;

        return true;
    }
}

/**
 * アップグレードUIを管理するクラス
 */
class UpgradesManager {
    constructor() {
        this.container = document.getElementById('upgrades-list');
        this.upgrades = [];
    }

    /**
     * 初期化
     */
    init() {
        this.initUpgrades();
        this.checkUnlocks();
    }

    /**
     * アップグレードの初期化
     */
    initUpgrades() {
        this.upgrades = UPGRADES_DATA.map(data => {
            const upgrade = new Upgrade(data);

            // セーブデータから購入状態を復元
            if (game && game.purchasedUpgrades[upgrade.id]) {
                upgrade.purchased = true;
                upgrade.unlocked = true;
            }

            return upgrade;
        });
    }

    /**
     * アップグレードの解放をチェック
     */
    checkUnlocks() {
        let newUnlocks = false;

        for (const upgrade of this.upgrades) {
            if (!upgrade.unlocked && upgrade.canUnlock()) {
                upgrade.unlocked = true;
                newUnlocks = true;

                // 通知
                notificationManager.show(
                    'アップグレード解放！',
                    `「${upgrade.name}」が購入可能になりました`,
                    'info'
                );
            }
        }

        if (newUnlocks) {
            this.renderUpgrades();
        }
    }

    /**
     * アップグレードリストの描画
     */
    renderUpgrades() {
        if (!this.container) return;

        // 解放済みで未購入のアップグレードを取得
        const availableUpgrades = this.upgrades.filter(u => u.unlocked && !u.purchased);

        if (availableUpgrades.length === 0) {
            this.container.innerHTML = '<p class="empty-message">解放されたアップグレードがありません</p>';
            return;
        }

        this.container.innerHTML = '';

        // 施設IDでグループ化してソート
        availableUpgrades.sort((a, b) => {
            if (a.buildingId !== b.buildingId) {
                return a.buildingId - b.buildingId;
            }
            return a.requiredCount - b.requiredCount;
        });

        for (const upgrade of availableUpgrades) {
            const card = this.createUpgradeCard(upgrade);
            this.container.appendChild(card);
        }
    }

    /**
     * アップグレードカードの作成
     * @param {Upgrade} upgrade アップグレードオブジェクト
     * @returns {HTMLElement} カード要素
     */
    createUpgradeCard(upgrade) {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.dataset.upgradeId = upgrade.id;

        const canAfford = upgrade.canAfford();
        if (canAfford) {
            card.classList.add('affordable');
        }

        const building = game ? game.buildings[upgrade.buildingId] : null;
        const buildingName = building ? building.name : '';

        card.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-effect">×${upgrade.multiplier}</span>
            </div>
            <div class="upgrade-flavor">${upgrade.flavorText}</div>
            <div class="upgrade-meta">
                <span class="upgrade-building">${buildingName}</span>
                <span class="upgrade-cost">📄 ${formatNumber(upgrade.getCost())}</span>
            </div>
        `;

        // クリックイベント
        card.addEventListener('click', () => this.handlePurchase(upgrade.id));

        return card;
    }

    /**
     * アップグレード購入の処理
     * @param {string} upgradeId アップグレードID
     */
    handlePurchase(upgradeId) {
        const upgrade = this.upgrades.find(u => u.id === upgradeId);
        if (!upgrade) return;

        if (upgrade.purchase()) {
            // 購入成功
            notificationManager.show(
                'アップグレード購入！',
                `「${upgrade.name}」を購入しました`,
                'success'
            );

            this.renderUpgrades();

            // 施設のCpS表示を更新
            if (typeof buildingsManager !== 'undefined') {
                buildingsManager.updateDisplay();
            }

            // 座禅システムに通知
            if (typeof zenSystem !== 'undefined') {
                zenSystem.onUserAction();
            }
        } else {
            // 購入失敗
            const card = this.container.querySelector(`[data-upgrade-id="${upgradeId}"]`);
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
        if (!this.container) return;

        const cards = this.container.querySelectorAll('.upgrade-card');

        cards.forEach(card => {
            const upgradeId = card.dataset.upgradeId;
            const upgrade = this.upgrades.find(u => u.id === upgradeId);
            if (!upgrade) return;

            // 購入可能状態の更新
            const canAfford = upgrade.canAfford();
            card.classList.toggle('affordable', canAfford);

            // コストの更新
            const costSpan = card.querySelector('.upgrade-cost');
            if (costSpan) {
                costSpan.textContent = '📄 ' + formatNumber(upgrade.getCost());
            }
        });
    }

    /**
     * 特定の施設のアップグレード倍率を取得
     * @param {number} buildingId 施設ID
     * @returns {number} 倍率
     */
    getMultiplierForBuilding(buildingId) {
        let multiplier = 1;

        for (const upgrade of this.upgrades) {
            if (upgrade.buildingId === buildingId && upgrade.purchased) {
                multiplier *= upgrade.multiplier;
            }
        }

        return multiplier;
    }
}

// グローバルインスタンス
let upgradesManager;
