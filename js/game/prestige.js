/* ============================================
   Article Generator - 転生（プレステージ）システム
   ============================================ */

/**
 * 転生システムを管理するクラス
 */
class PrestigeSystem {
    constructor() {
        this.modal = document.getElementById('prestige-modal');
        this.confirmBtn = document.getElementById('prestige-confirm');
        this.cancelBtn = document.getElementById('prestige-cancel');

        this.setupEventListeners();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        if (this.confirmBtn) {
            this.confirmBtn.addEventListener('click', () => this.doPrestige());
        }

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.hideModal());
        }

        // モーダル外クリックで閉じる
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hideModal();
                }
            });
        }
    }

    /**
     * 転生可能かどうか
     * @returns {boolean} 転生可能かどうか
     */
    canPrestige() {
        if (!game) return false;
        return game.articlesThisRun.gte(CONSTANTS.PRESTIGE_THRESHOLD);
    }

    /**
     * 獲得できる得の量を計算
     * @returns {Decimal} 獲得できる得
     */
    calculateTokuGain() {
        if (!game) return new Decimal(0);

        // 得 = ∛(今回生産 / 10^9)
        const gain = game.articlesThisRun.div(CONSTANTS.PRESTIGE_TOKU_BASE).cbrt().floor();
        return Decimal.max(0, gain);
    }

    /**
     * 転生モーダルの表示
     */
    showModal() {
        if (!this.modal || !this.canPrestige()) return;

        // 情報の更新
        const articlesSpan = document.getElementById('prestige-articles');
        const gainSpan = document.getElementById('prestige-gain');

        if (articlesSpan) {
            articlesSpan.textContent = formatNumber(game.articlesThisRun);
        }

        if (gainSpan) {
            gainSpan.textContent = formatNumber(this.calculateTokuGain());
        }

        this.modal.style.display = 'flex';
        this.modal.classList.add('active');
    }

    /**
     * 転生モーダルを非表示
     */
    hideModal() {
        if (!this.modal) return;

        this.modal.style.display = 'none';
        this.modal.classList.remove('active');
    }

    /**
     * 転生の実行
     */
    doPrestige() {
        if (!game || !this.canPrestige()) return;

        // 得の獲得
        const tokuGain = this.calculateTokuGain();
        game.addToku(tokuGain);
        game.prestigeCount++;

        // モーダルを閉じる
        this.hideModal();

        // ゲームのリセット
        game.resetForPrestige();

        // 通知
        notificationManager.show(
            '悟りに達しました',
            `得を ${formatNumber(tokuGain)} 獲得しました！（累計転生: ${game.prestigeCount}回）`,
            'success'
        );

        // 転生ボタンを非表示
        const prestigeButton = document.getElementById('prestige-button');
        if (prestigeButton) {
            prestigeButton.style.display = 'none';
        }

        // アップグレードリストをリセット
        if (typeof upgradesManager !== 'undefined') {
            upgradesManager.init();
        }

        // 施設リストを更新
        if (typeof buildingsManager !== 'undefined') {
            buildingsManager.renderBuildings();
        }

        // セーブ
        game.saveGame();

        console.log(`転生完了: 得+${tokuGain.toString()}, 累計転生${game.prestigeCount}回`);
    }

    /**
     * 永続アップグレードを持っているか確認
     * @param {string} upgradeId アップグレードID
     * @returns {boolean} 持っているかどうか
     */
    hasUpgrade(upgradeId) {
        if (!game) return false;
        return !!game.prestigeUpgrades[upgradeId];
    }

    /**
     * 永続アップグレードを購入
     * @param {string} upgradeId アップグレードID
     * @returns {boolean} 購入成功かどうか
     */
    purchasePrestigeUpgrade(upgradeId) {
        if (!game) return false;

        const upgradeData = PRESTIGE_UPGRADES_DATA.find(u => u.id === upgradeId);
        if (!upgradeData) return false;

        // すでに購入済み
        if (this.hasUpgrade(upgradeId)) return false;

        // コストチェック
        const cost = new Decimal(upgradeData.cost);
        if (game.toku.lt(cost)) return false;

        // 購入
        game.toku = game.toku.minus(cost);
        game.prestigeUpgrades[upgradeId] = true;

        notificationManager.show(
            '永続アップグレード購入！',
            `「${upgradeData.name}」を取得しました`,
            'success'
        );

        game.saveGame();
        return true;
    }

    /**
     * 永続アップグレードの効果を取得
     * @param {string} effectType 効果タイプ
     * @returns {number|null} 効果値
     */
    getEffect(effectType) {
        for (const upgrade of PRESTIGE_UPGRADES_DATA) {
            if (this.hasUpgrade(upgrade.id) && upgrade.effect.type === effectType) {
                return upgrade.effect.value;
            }
        }
        return null;
    }
}

// グローバルインスタンス
let prestigeSystem;
