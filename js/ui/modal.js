/* ============================================
   Article Generator - モーダル管理
   ============================================ */

/**
 * モーダルを管理するクラス
 */
class ModalManager {
    constructor() {
        this.activeModals = [];
    }

    /**
     * モーダルを表示
     * @param {string} modalId モーダルのID
     */
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.display = 'flex';
        modal.classList.add('active');
        this.activeModals.push(modalId);

        // ESCキーで閉じる
        document.addEventListener('keydown', this.handleEscKey);
    }

    /**
     * モーダルを非表示
     * @param {string} modalId モーダルのID
     */
    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.display = 'none';
        modal.classList.remove('active');

        const index = this.activeModals.indexOf(modalId);
        if (index > -1) {
            this.activeModals.splice(index, 1);
        }

        // アクティブなモーダルがなければESCリスナーを削除
        if (this.activeModals.length === 0) {
            document.removeEventListener('keydown', this.handleEscKey);
        }
    }

    /**
     * すべてのモーダルを非表示
     */
    hideAll() {
        for (const modalId of [...this.activeModals]) {
            this.hide(modalId);
        }
    }

    /**
     * ESCキーのハンドラ
     * @param {KeyboardEvent} e キーボードイベント
     */
    handleEscKey = (e) => {
        if (e.key === 'Escape' && this.activeModals.length > 0) {
            // 最後に開いたモーダルを閉じる
            const lastModal = this.activeModals[this.activeModals.length - 1];
            this.hide(lastModal);
        }
    }

    /**
     * 確認ダイアログを表示
     * @param {string} title タイトル
     * @param {string} message メッセージ
     * @param {Function} onConfirm 確認時のコールバック
     * @param {Function} onCancel キャンセル時のコールバック
     */
    confirm(title, message, onConfirm, onCancel = null) {
        // 動的にモーダルを作成
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'confirm-modal-' + Date.now();

        modal.innerHTML = `
            <div class="modal-content">
                <h2>${title}</h2>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-buttons">
                    <button class="btn-primary confirm-btn">確認</button>
                    <button class="btn-secondary cancel-btn">キャンセル</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // イベントリスナー
        const confirmBtn = modal.querySelector('.confirm-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');

        confirmBtn.addEventListener('click', () => {
            modal.remove();
            if (onConfirm) onConfirm();
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
            if (onCancel) onCancel();
        });

        // 背景クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (onCancel) onCancel();
            }
        });
    }

    /**
     * アラートダイアログを表示
     * @param {string} title タイトル
     * @param {string} message メッセージ
     * @param {Function} onClose 閉じる時のコールバック
     */
    alert(title, message, onClose = null) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'alert-modal-' + Date.now();

        modal.innerHTML = `
            <div class="modal-content">
                <h2>${title}</h2>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-buttons">
                    <button class="btn-primary close-btn">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            modal.remove();
            if (onClose) onClose();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (onClose) onClose();
            }
        });
    }
}

// グローバルインスタンス
let modalManager;
