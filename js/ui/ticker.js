/* ============================================
   Article Generator - フレーバーテキストティッカー
   ============================================ */

/**
 * ニュースティッカー風のフレーバーテキストを表示するクラス
 */
class FlavorTicker {
    constructor() {
        this.container = document.getElementById('flavor-ticker');
        this.content = document.getElementById('flavor-content');

        this.messages = [];
        this.currentIndex = 0;
        this.typingSpeed = 50; // ms
        this.pauseTime = 4000; // ms
    }

    /**
     * 初期化
     */
    async init() {
        await this.loadMessages();
        if (this.container && this.content && this.messages.length > 0) {
            this.startTicker();
        }
    }

    /**
     * メッセージをJSONからロード
     */
    async loadMessages() {
        try {
            const response = await fetch('data/ticker_messages.json');
            const data = await response.json();
            this.messages = data.tickerMessages || [];
        } catch (e) {
            console.warn('ティッカーメッセージの読み込みに失敗、デフォルトを使用:', e);
            this.messages = [
                "システム: 正常に稼働中...",
                "南無阿弥陀仏...",
                "諸行無常..."
            ];
        }
    }

    /**
     * ティッカーの開始
     */
    startTicker() {
        this.showNextMessage();
    }

    /**
     * 次のメッセージを表示
     */
    showNextMessage() {
        // ランダムに選ぶ
        const nextIndex = Math.floor(Math.random() * this.messages.length);
        const message = this.messages[nextIndex];

        this.typeMessage(message);
    }

    /**
     * タイプライター風アニメーション
     */
    typeMessage(message) {
        this.content.textContent = "";
        this.content.style.opacity = '1';
        let i = 0;

        const type = () => {
            if (i < message.length) {
                this.content.textContent += message.charAt(i);
                i++;
                setTimeout(type, this.typingSpeed);
            } else {
                // 表示完了、少し待ってから次へ
                setTimeout(() => {
                    this.fadeOut();
                }, this.pauseTime);
            }
        };

        type();
    }

    /**
     * フェードアウト処理
     */
    fadeOut() {
        this.content.style.opacity = '0';
        setTimeout(() => {
            this.showNextMessage();
        }, 500); // CSS transition time
    }
}

// グローバルインスタンス
let flavorTicker;
