/* ============================================
   Article Generator - モバイルUI管理
   ============================================ */

/**
 * モバイル版のタブナビゲーション等を管理するクラス
 */
class MobileUIManager {
    constructor() {
        this.navButtons = document.querySelectorAll('.nav-btn[data-target]');
        this.panels = {
            'click-area': document.getElementById('click-area'),
            'buildings-panel': document.getElementById('buildings-panel'),
            'upgrades-panel': document.getElementById('upgrades-panel')
        };
        this.settingsBtn = document.getElementById('mobile-settings-btn');
    }

    init() {
        this.setupEventListeners();
        this.handleResize();

        // 初期状態: click-area をアクティブに
        this.switchTab('click-area');
    }

    setupEventListeners() {
        // タブ切り替えボタン
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                this.switchTab(targetId);
            });
        });

        // モバイル用設定ボタン
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => {
                if (typeof settingsManager !== 'undefined') {
                    settingsManager.showModal();
                }
            });
        }

        // リサイズ監視
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * タブ切り替え処理
     * @param {string} targetId 表示するパネルのID
     */
    switchTab(targetId) {
        // ボタンの見た目更新
        this.navButtons.forEach(btn => {
            if (btn.getAttribute('data-target') === targetId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // モバイル表示時のみ、パネルの表示切り替えを行う
        // PC表示時は全て表示されるべき（CSSで制御）だが、
        // クラス付与はしておいてCSSで .active の有無に関わらず表示するようにする
        Object.keys(this.panels).forEach(id => {
            const panel = this.panels[id];
            if (panel) {
                if (id === targetId) {
                    panel.classList.add('active-tab');
                } else {
                    panel.classList.remove('active-tab');
                }
            }
        });
    }

    handleResize() {
        // リサイズ時の処理（必要であれば）
    }
}

// グローバルインスタンス
let mobileUIManager;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    mobileUIManager = new MobileUIManager();
    mobileUIManager.init();
});
