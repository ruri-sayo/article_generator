/* ============================================
   Article Generator - 数値表示ユーティリティ
   ============================================ */

/**
 * 数値をフォーマットして表示用文字列に変換
 * @param {Decimal|number} value フォーマットする値
 * @returns {string} フォーマットされた文字列
 */
function formatNumber(value) {
    // Decimalオブジェクトに変換
    const decimal = value instanceof Decimal ? value : new Decimal(value);

    // 負の数は0として扱う
    if (decimal.lt(0)) {
        return '0';
    }

    // 1,000未満: そのまま表示
    if (decimal.lt(1000)) {
        return decimal.toNumber().toFixed(0);
    }

    // 1,000〜999,999: カンマ区切り
    if (decimal.lt(1e6)) {
        return decimal.toNumber().toLocaleString('ja-JP');
    }

    // 10^6以上: 科学的記数法
    return decimal.toExponential(2);
}

/**
 * 時間を読みやすい形式にフォーマット
 * @param {number} seconds 秒数
 * @returns {string} フォーマットされた時間
 */
function formatTime(seconds) {
    if (seconds < 60) {
        return `${Math.floor(seconds)}秒`;
    }

    if (seconds < 3600) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}分${s}秒`;
    }

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}時間${m}分`;
}

/**
 * PV表示を管理するクラス
 */
class PVDisplay {
    constructor() {
        this.currentPV = 3;
        this.element = document.getElementById('pv-count');
        this.updateInterval = null;
    }

    /**
     * 初期化
     */
    init() {
        this.update();
        this.startUpdateLoop();
    }

    /**
     * PV値の更新
     */
    update() {
        // 3または4の整数値をランダムに選択（虚無感の表現）
        this.currentPV = Math.random() < 0.5 ? 3 : 4;

        if (this.element) {
            this.element.textContent = this.currentPV;
        }
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
     * 現在のPV値を取得
     * @returns {number} 現在のPV値
     */
    getValue() {
        return this.currentPV;
    }
}

// グローバルインスタンス
let pvDisplay;
