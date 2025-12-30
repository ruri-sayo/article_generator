/* ============================================
   Article Generator - 座禅システム
   ============================================ */

/**
 * 座禅（放置プレイ）システムを管理するクラス
 */
class ZenSystem {
    constructor() {
        this.lastActionTime = Date.now();
        this.zenStartTime = null;
        this.zenProgress = 0; // 秒単位
        this.isVisible = true;
        this.isZenActive = false;

        this.modal = document.getElementById('zen-gauge-modal');
        this.progressFill = document.getElementById('zen-progress');
        this.timeDisplay = document.getElementById('zen-time-display');
        this.katsuDisplay = document.getElementById('katsu-display');

        this.updateInterval = null;
    }

    /**
     * 初期化
     */
    init() {
        this.setupEventListeners();
        this.startUpdateLoop();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ユーザーアクションの監視
        const actionEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'wheel'];

        actionEvents.forEach(event => {
            document.addEventListener(event, () => this.onUserAction(), { passive: true });
        });

        // Page Visibility API
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;

            if (document.hidden && this.isZenActive) {
                // タブが非表示になったら座禅を一時停止
                this.pauseZen();
            } else if (!document.hidden) {
                // タブが表示されたら時間を更新
                this.lastActionTime = Date.now();
            }
        });
    }

    /**
     * ユーザーアクション時の処理
     */
    onUserAction() {
        // 座禅中（1分経過後）だった場合、「喝！」を表示
        if (this.isZenActive && this.zenProgress >= CONSTANTS.ZEN_START_TIME) {
            this.showKatsu();
        }

        this.resetZen();
        this.lastActionTime = Date.now();
    }

    /**
     * 座禅状態のリセット
     */
    resetZen() {
        this.zenStartTime = null;
        this.zenProgress = 0;
        this.isZenActive = false;
        this.hideZenGauge();
    }

    /**
     * 座禅の一時停止
     */
    pauseZen() {
        // タブ非表示中は座禅の進行を停止
        // 実装上は特に何もしない（update時にisVisibleをチェック）
    }

    /**
     * 更新ループの開始
     */
    startUpdateLoop() {
        // 1秒ごとに更新
        this.updateInterval = setInterval(() => {
            this.update();
        }, 1000);
    }

    /**
     * 更新ループの停止
     */
    stopUpdateLoop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * 更新処理（1秒ごとに呼ばれる）
     */
    update() {
        // タブが非表示の場合は更新しない
        if (!this.isVisible) return;

        const now = Date.now();
        const elapsedSinceAction = (now - this.lastActionTime) / 1000;

        // 1分以上無操作で座禅開始
        if (elapsedSinceAction >= CONSTANTS.ZEN_START_TIME) {
            if (!this.isZenActive) {
                this.startZen();
            }

            // 座禅開始からの経過時間を計算
            if (this.zenStartTime) {
                this.zenProgress = (now - this.zenStartTime) / 1000;
                this.updateZenGauge();

                // 1時間達成で座禅完了
                if (this.zenProgress >= CONSTANTS.ZEN_COMPLETE_TIME) {
                    this.completeZen();
                }
            }
        }
    }

    /**
     * 座禅の開始
     */
    startZen() {
        this.isZenActive = true;
        this.zenStartTime = Date.now();
        this.showZenGauge();

        console.log('座禅を開始しました');
    }

    /**
     * 座禅の完了
     */
    completeZen() {
        if (!game) return;

        // 得を1獲得
        game.addToku(1);
        game.totalZenCompleted = (game.totalZenCompleted || 0) + 1;

        // 通知
        notificationManager.show(
            '座禅完了',
            '得を 1 獲得しました。心が静まりました。',
            'success'
        );

        // リセット
        this.resetZen();

        // セーブ
        game.saveGame();

        console.log('座禅完了: 得+1');
    }

    /**
     * 座禅ゲージの表示
     */
    showZenGauge() {
        if (this.modal) {
            this.modal.style.display = 'flex';
        }
    }

    /**
     * 座禅ゲージの非表示
     */
    hideZenGauge() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    /**
     * 座禅ゲージの更新
     */
    updateZenGauge() {
        if (this.progressFill) {
            const progress = (this.zenProgress / CONSTANTS.ZEN_COMPLETE_TIME) * 100;
            this.progressFill.style.width = `${Math.min(100, progress)}%`;
        }

        if (this.timeDisplay) {
            const current = this.formatTime(this.zenProgress);
            const total = this.formatTime(CONSTANTS.ZEN_COMPLETE_TIME);
            this.timeDisplay.textContent = `${current} / ${total}`;
        }
    }

    /**
     * 時間のフォーマット
     * @param {number} seconds 秒数
     * @returns {string} フォーマットされた時間
     */
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    /**
     * 「喝！」の表示
     */
    showKatsu() {
        if (!this.katsuDisplay) return;

        // 既存の表示をクリア
        this.katsuDisplay.classList.remove('active');

        // 強制的にリフローを発生させてアニメーションをリセット
        void this.katsuDisplay.offsetWidth;

        // 表示
        this.katsuDisplay.style.display = 'block';
        this.katsuDisplay.classList.add('active');

        // 5秒後に非表示
        setTimeout(() => {
            this.katsuDisplay.style.display = 'none';
            this.katsuDisplay.classList.remove('active');
        }, 5000);

        console.log('喝！');
    }

    /**
     * 現在の座禅進捗を取得（セーブ用）
     * @returns {number} 進捗（秒）
     */
    getProgress() {
        return this.zenProgress;
    }

    /**
     * 座禅進捗を設定（ロード用）
     * @param {number} progress 進捗（秒）
     */
    setProgress(progress) {
        if (progress > 0) {
            this.zenProgress = progress;
            // 座禅中だった場合は再開
            if (progress >= CONSTANTS.ZEN_START_TIME) {
                this.isZenActive = true;
                this.zenStartTime = Date.now() - (progress * 1000);
                this.showZenGauge();
                this.updateZenGauge();
            }
        }
    }
}

// グローバルインスタンス
let zenSystem;
