/* ============================================
   Article Generator - 統計画面管理
   ============================================ */

/**
 * 統計情報を管理・表示するクラス
 */
class StatsManager {
    constructor() {
        this.modal = document.getElementById('stats-modal');
        this.closeButton = document.getElementById('stats-close');

        // 統計表示用の要素
        this.elements = {
            totalArticles: document.getElementById('stat-total-articles'),
            totalClicks: document.getElementById('stat-total-clicks'),
            playTime: document.getElementById('stat-play-time'),
            prestigeCount: document.getElementById('stat-prestige-count'),
            totalZen: document.getElementById('stat-total-zen'),
            currentCps: document.getElementById('stat-current-cps')
        };
    }

    /**
     * 初期化
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // 統計ボタン（フッター等に追加）
        const statsBtn = document.getElementById('stats-button');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => this.showModal());
        }

        // 閉じるボタン
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.hideModal());
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
     * 統計情報の更新
     */
    updateStats() {
        if (!game) return;

        if (this.elements.totalArticles) {
            this.elements.totalArticles.textContent = formatNumber(game.totalArticlesEver);
        }
        if (this.elements.totalClicks) {
            this.elements.totalClicks.textContent = game.clickCount.toLocaleString();
        }
        if (this.elements.playTime) {
            this.elements.playTime.textContent = this.formatTime(game.playTime);
        }
        if (this.elements.prestigeCount) {
            this.elements.prestigeCount.textContent = game.prestigeCount.toLocaleString();
        }
        if (this.elements.totalZen) {
            this.elements.totalZen.textContent = (game.totalZenCompleted || 0).toLocaleString();
        }
        if (this.elements.currentCps) {
            this.elements.currentCps.textContent = formatNumber(game.getTotalCps());
        }
    }

    /**
     * 時間のフォーマット (秒 -> HH:MM:SS)
     */
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}時間 ${m}分 ${s}秒`;
    }

    /**
     * モーダルの表示
     */
    showModal() {
        this.updateStats();
        if (this.modal) {
            this.modal.style.display = 'flex';
            this.modal.classList.add('active');
        }
    }

    /**
     * モーダルの非表示
     */
    hideModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.modal.classList.remove('active');
        }
    }
}

// グローバルインスタンス
let statsManager;
