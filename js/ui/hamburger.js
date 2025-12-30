/* ============================================
   Article Generator - ハンバーガーメニュー
   ============================================ */

/**
 * ハンバーガーメニューの管理クラス
 */
class HamburgerMenu {
    constructor() {
        this.btn = document.getElementById('hamburger-btn');
        this.dropdown = document.getElementById('hamburger-dropdown');
        this.isOpen = false;
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // トグル
        if (this.btn) {
            this.btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        // 外部クリックで閉じる
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.dropdown.contains(e.target) && e.target !== this.btn) {
                this.close();
            }
        });

        // メニュー項目
        const saveBtn = document.getElementById('menu-save');
        const statsBtn = document.getElementById('menu-stats');
        const settingsBtn = document.getElementById('menu-settings');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (game) {
                    game.saveGame();
                    notificationManager.show('保存完了', 'ゲームを保存しました', 'success');
                }
                this.close();
            });
        }

        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                if (typeof statsManager !== 'undefined') {
                    statsManager.showModal();
                }
                this.close();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                if (typeof settingsManager !== 'undefined') {
                    settingsManager.showModal();
                }
                this.close();
            });
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.dropdown) {
            this.dropdown.classList.add('active');
            this.isOpen = true;
        }
        if (this.btn) {
            this.btn.classList.add('active');
        }
    }

    close() {
        if (this.dropdown) {
            this.dropdown.classList.remove('active');
            this.isOpen = false;
        }
        if (this.btn) {
            this.btn.classList.remove('active');
        }
    }
}

// グローバルインスタンス
let hamburgerMenu;
