/* ============================================
   Article Generator - 除夜の鐘イベントシステム
   ============================================ */

/**
 * 除夜の鐘イベントを管理するクラス
 * ランダムに鐘が出現し、クリックすると30秒間CpSが108倍になる
 */
class BellEventSystem {
    constructor() {
        this.bellElement = document.getElementById('bell-event');
        this.boostIndicator = document.getElementById('bell-boost-indicator');
        this.boostTimer = document.getElementById('boost-timer');

        // 状態管理
        this.isActive = false; // 鐘が画面に表示されているか
        this.isBoosted = false; // ブースト中か
        this.boostMultiplier = 1; // 現在のブースト倍率
        this.boostEndTime = 0; // ブースト終了時刻
        this.nextSpawnTime = 0; // 次の鐘出現時刻

        this.setupEventListeners();
        this.scheduleNextBell();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        if (this.bellElement) {
            this.bellElement.addEventListener('click', () => this.onBellClick());
        }
    }

    /**
     * 次の鐘出現をスケジュール
     */
    scheduleNextBell() {
        const minInterval = CONSTANTS.BELL_MIN_INTERVAL * 1000;
        const maxInterval = CONSTANTS.BELL_MAX_INTERVAL * 1000;
        const delay = minInterval + Math.random() * (maxInterval - minInterval);

        this.nextSpawnTime = Date.now() + delay;

        setTimeout(() => {
            if (!this.isActive && !this.isBoosted) {
                this.spawnBell();
            } else {
                // ブースト中や鐘表示中は次のスケジュールを遅らせる
                this.scheduleNextBell();
            }
        }, delay);
    }

    /**
     * 鐘を画面上に出現させる
     */
    spawnBell() {
        if (!this.bellElement) return;

        this.isActive = true;

        // ランダムな位置を計算（ヘッダーとフッターを避ける）
        const padding = 80; // 画面端からのマージン
        const headerHeight = 70;
        const footerHeight = 50;
        const navHeight = window.innerWidth <= 768 ? 64 : 0;

        const x = padding + Math.random() * (window.innerWidth - padding * 2 - 60);
        const y = headerHeight + padding + Math.random() * (window.innerHeight - headerHeight - footerHeight - navHeight - padding * 2 - 60);

        this.bellElement.style.left = `${x}px`;
        this.bellElement.style.top = `${y}px`;
        this.bellElement.style.display = 'block';

        console.log(`🔔 除夜の鐘が出現しました (${Math.round(x)}, ${Math.round(y)})`);

        // 一定時間後に消える
        setTimeout(() => {
            if (this.isActive) {
                this.hideBell();
                this.scheduleNextBell();
            }
        }, CONSTANTS.BELL_DURATION * 1000);
    }

    /**
     * 鐘を非表示にする
     */
    hideBell() {
        if (this.bellElement) {
            this.bellElement.style.display = 'none';
        }
        this.isActive = false;
    }

    /**
     * 鐘がクリックされた時の処理
     */
    onBellClick() {
        if (!this.isActive) return;

        // 鐘を消す
        this.hideBell();

        // ブーストを開始
        this.startBoost();

        // 通知
        notificationManager.show(
            '🔔 除夜の鐘！',
            `${CONSTANTS.BELL_BOOST_DURATION}秒間、生産量が${CONSTANTS.BELL_BOOST_MULTIPLIER}倍になります！`,
            'success'
        );

        console.log(`🔔 鐘がクリックされました！ ${CONSTANTS.BELL_BOOST_MULTIPLIER}倍ブースト開始`);
    }

    /**
     * ブーストを開始
     */
    startBoost() {
        this.isBoosted = true;
        this.boostMultiplier = CONSTANTS.BELL_BOOST_MULTIPLIER;
        this.boostEndTime = Date.now() + CONSTANTS.BELL_BOOST_DURATION * 1000;

        // ブーストインジケーターを表示
        if (this.boostIndicator) {
            this.boostIndicator.style.display = 'flex';
        }

        // タイマー更新を開始
        this.updateBoostTimer();
    }

    /**
     * ブーストタイマーを更新
     */
    updateBoostTimer() {
        if (!this.isBoosted) return;

        const remaining = Math.max(0, Math.ceil((this.boostEndTime - Date.now()) / 1000));

        if (this.boostTimer) {
            this.boostTimer.textContent = `${remaining}s`;
        }

        if (remaining <= 0) {
            this.endBoost();
        } else {
            requestAnimationFrame(() => this.updateBoostTimer());
        }
    }

    /**
     * ブーストを終了
     */
    endBoost() {
        this.isBoosted = false;
        this.boostMultiplier = 1;

        // インジケーターを非表示
        if (this.boostIndicator) {
            this.boostIndicator.style.display = 'none';
        }

        // 次の鐘をスケジュール
        this.scheduleNextBell();

        console.log('🔔 ブースト終了');
    }

    /**
     * 現在のブースト倍率を取得
     * @returns {number} ブースト倍率
     */
    getBoostMultiplier() {
        return this.boostMultiplier;
    }

    /**
     * ブースト中かどうか
     * @returns {boolean}
     */
    isBoostActive() {
        return this.isBoosted;
    }
}

// グローバルインスタンス
let bellEventSystem;
