/* ============================================
   Article Generator - デバッグモード
   ============================================ */

/**
 * デバッグモードを管理するクラス
 * URLパラメータ ?debug=true で有効化
 */
class DebugMode {
    constructor() {
        this.enabled = false;
        this.panel = null;

        this.checkEnabled();
        if (this.enabled) {
            this.init();
        }
    }

    /**
     * デバッグモードが有効か確認
     */
    checkEnabled() {
        const params = new URLSearchParams(window.location.search);
        this.enabled = params.get('debug') === 'true';

        if (this.enabled) {
            console.log('%c🐛 デバッグモード有効', 'color: #ffd700; font-size: 16px; font-weight: bold;');
        }
    }

    /**
     * 初期化
     */
    init() {
        this.createPanel();
        this.addKeyboardShortcuts();
    }

    /**
     * デバッグパネルを作成
     */
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'debug-panel';
        this.panel.innerHTML = `
            <div class="debug-header">
                🐛 Debug Panel
                <button class="debug-toggle-btn" id="debug-minimize">−</button>
            </div>
            <div class="debug-content" id="debug-content">
                <div class="debug-section">
                    <h4>リソース操作</h4>
                    <button class="debug-btn" id="debug-add-1k">+1K 記事</button>
                    <button class="debug-btn" id="debug-add-1m">+1M 記事</button>
                    <button class="debug-btn" id="debug-add-1b">+1B 記事</button>
                    <button class="debug-btn" id="debug-add-toku">+10 得</button>
                </div>
                <div class="debug-section">
                    <h4>施設操作</h4>
                    <button class="debug-btn" id="debug-add-all-buildings">全施設+10</button>
                    <button class="debug-btn" id="debug-unlock-all-upgrades">全アップグレード解放</button>
                </div>
                <div class="debug-section">
                    <h4>ゲーム状態</h4>
                    <button class="debug-btn" id="debug-reach-prestige">転生条件達成</button>
                    <button class="debug-btn" id="debug-trigger-bell">鐘を出現</button>
                    <button class="debug-btn" id="debug-spawn-articles">記事エフェクト</button>
                </div>
                <div class="debug-section">
                    <h4>ログ</h4>
                    <div id="debug-log" class="debug-log"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.panel);
        this.addStyles();
        this.setupEventListeners();
    }

    /**
     * スタイルを追加
     */
    addStyles() {
        const style = document.createElement('style');
        style.id = 'debug-styles';
        style.textContent = `
            #debug-panel {
                position: fixed;
                top: 100px;
                right: 10px;
                width: 250px;
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #ffd700;
                border-radius: 8px;
                z-index: 9999;
                font-size: 12px;
                font-family: monospace;
                color: #fff;
            }

            .debug-header {
                background: #ffd700;
                color: #000;
                padding: 8px;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
            }

            .debug-toggle-btn {
                background: none;
                border: none;
                font-size: 16px;
                cursor: pointer;
            }

            .debug-content {
                padding: 10px;
                max-height: 400px;
                overflow-y: auto;
            }

            .debug-content.minimized {
                display: none;
            }

            .debug-section {
                margin-bottom: 10px;
            }

            .debug-section h4 {
                color: #ffd700;
                margin-bottom: 5px;
                font-size: 11px;
            }

            .debug-btn {
                display: inline-block;
                margin: 2px;
                padding: 4px 8px;
                background: #333;
                border: 1px solid #555;
                color: #fff;
                cursor: pointer;
                border-radius: 4px;
                font-size: 10px;
            }

            .debug-btn:hover {
                background: #555;
                border-color: #ffd700;
            }

            .debug-log {
                max-height: 100px;
                overflow-y: auto;
                background: #111;
                padding: 5px;
                border-radius: 4px;
                font-size: 10px;
            }

            .debug-log-entry {
                padding: 2px 0;
                border-bottom: 1px solid #222;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // 最小化ボタン
        document.getElementById('debug-minimize')?.addEventListener('click', () => {
            const content = document.getElementById('debug-content');
            content.classList.toggle('minimized');
        });

        // 各ボタンのイベント
        document.getElementById('debug-add-1k')?.addEventListener('click', () => {
            dev.addArticles(1000);
            this.log('+1,000 記事');
        });

        document.getElementById('debug-add-1m')?.addEventListener('click', () => {
            dev.addArticles(1e6);
            this.log('+1,000,000 記事');
        });

        document.getElementById('debug-add-1b')?.addEventListener('click', () => {
            dev.addArticles(1e9);
            this.log('+1,000,000,000 記事');
        });

        document.getElementById('debug-add-toku')?.addEventListener('click', () => {
            dev.addToku(10);
            this.log('+10 得');
        });

        document.getElementById('debug-add-all-buildings')?.addEventListener('click', () => {
            game.buildings.forEach((b, i) => dev.addBuilding(i, 10));
            this.log('全施設 +10');
        });

        document.getElementById('debug-unlock-all-upgrades')?.addEventListener('click', () => {
            UPGRADES_DATA.forEach(u => {
                game.purchasedUpgrades[u.id] = true;
            });
            upgradesManager.renderUpgrades();
            this.log('全アップグレード解放');
        });

        document.getElementById('debug-reach-prestige')?.addEventListener('click', () => {
            dev.reachPrestige();
            this.log('転生条件達成');
        });

        document.getElementById('debug-trigger-bell')?.addEventListener('click', () => {
            if (typeof bellEventSystem !== 'undefined') {
                bellEventSystem.spawnBell();
                this.log('鐘を出現させました');
            }
        });

        document.getElementById('debug-spawn-articles')?.addEventListener('click', () => {
            if (typeof articleFallEffect !== 'undefined') {
                articleFallEffect.spawnParticles(20);
                this.log('記事エフェクト x20');
            }
        });
    }

    /**
     * キーボードショートカットを追加
     */
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+D でパネルの表示切替
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                if (this.panel) {
                    this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
                }
            }
        });
    }

    /**
     * ログを追加
     */
    log(message) {
        const logEl = document.getElementById('debug-log');
        if (logEl) {
            const entry = document.createElement('div');
            entry.className = 'debug-log-entry';
            entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            logEl.insertBefore(entry, logEl.firstChild);

            // 最大20件
            while (logEl.children.length > 20) {
                logEl.removeChild(logEl.lastChild);
            }
        }
        console.log(`[Debug] ${message}`);
    }

    /**
     * 有効かどうか
     */
    isEnabled() {
        return this.enabled;
    }
}

// グローバルインスタンス
let debugMode;
