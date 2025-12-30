/* ============================================
   Article Generator - 通知システム
   ============================================ */

/**
 * 通知の種類
 */
const NotificationType = {
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    INFO: 'info'
};

/**
 * 通知を管理するクラス
 */
class NotificationManager {
    constructor() {
        this.container = document.getElementById('notification-area');
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 4000; // 4秒
    }

    /**
     * 通知を表示
     * @param {string} title タイトル
     * @param {string} message メッセージ
     * @param {string} type 通知の種類（success, warning, error, info）
     * @param {number} duration 表示時間（ミリ秒）
     */
    show(title, message, type = 'info', duration = null) {
        if (!this.container) return;

        // 最大数を超えたら古い通知を削除
        while (this.notifications.length >= this.maxNotifications) {
            this.removeOldest();
        }

        // 通知要素の作成
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;

        // クリックで閉じる
        notification.addEventListener('click', () => {
            this.remove(notification);
        });

        // コンテナに追加
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // 一定時間後に自動削除
        const displayDuration = duration || this.defaultDuration;
        setTimeout(() => {
            this.remove(notification);
        }, displayDuration);
    }

    /**
     * 通知を削除
     * @param {HTMLElement} notification 通知要素
     */
    remove(notification) {
        if (!notification || !notification.parentNode) return;

        // フェードアウトアニメーション
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    /**
     * 最も古い通知を削除
     */
    removeOldest() {
        if (this.notifications.length > 0) {
            this.remove(this.notifications[0]);
        }
    }

    /**
     * すべての通知を削除
     */
    clearAll() {
        for (const notification of [...this.notifications]) {
            this.remove(notification);
        }
    }

    /**
     * 成功通知のショートカット
     * @param {string} title タイトル
     * @param {string} message メッセージ
     */
    success(title, message) {
        this.show(title, message, NotificationType.SUCCESS);
    }

    /**
     * 警告通知のショートカット
     * @param {string} title タイトル
     * @param {string} message メッセージ
     */
    warning(title, message) {
        this.show(title, message, NotificationType.WARNING);
    }

    /**
     * エラー通知のショートカット
     * @param {string} title タイトル
     * @param {string} message メッセージ
     */
    error(title, message) {
        this.show(title, message, NotificationType.ERROR, 6000); // エラーは長めに表示
    }

    /**
     * 情報通知のショートカット
     * @param {string} title タイトル
     * @param {string} message メッセージ
     */
    info(title, message) {
        this.show(title, message, NotificationType.INFO);
    }
}

// グローバルインスタンス
let notificationManager;
