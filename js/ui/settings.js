/* ============================================
   Article Generator - 設定画面管理
   ============================================ */

/**
 * 設定画面を管理するクラス
 */
class SettingsManager {
    constructor() {
        // 設定のデフォルト値
        this.settings = {
            particlesEnabled: true,
            soundEnabled: true, // 将来用
            fallEffectEnabled: true // 記事落下エフェクト
        };

        this.modal = document.getElementById('settings-modal');
        this.closeButton = document.getElementById('settings-close');
        this.resetButton = document.getElementById('settings-reset-save');

        // 設定項目のエレメント
        this.particlesToggle = document.getElementById('setting-particles');
        this.soundToggle = document.getElementById('setting-sound');
    }

    /**
     * 初期化
     */
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.applySettings();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // 設定ボタン（フッター等に追加される想定）
        const settingsBtn = document.getElementById('settings-button');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showModal());
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

        // 設定変更の監視
        if (this.particlesToggle) {
            this.particlesToggle.addEventListener('change', (e) => {
                this.settings.particlesEnabled = e.target.checked;
                this.saveSettings();
                this.applySettings();
            });
        }

        if (this.soundToggle) {
            this.soundToggle.addEventListener('change', (e) => {
                this.settings.soundEnabled = e.target.checked;
                this.saveSettings();
                this.applySettings();
            });
        }

        // セーブデータリセット
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => {
                if (confirm('本当に全ての進行状況をリセットしますか？この操作は取り消せません。')) {
                    saveManager.deleteSave();
                    location.reload();
                }
            });
        }

        // 記事落下エフェクト設定
        const fallEffectToggle = document.getElementById('setting-fall-effect');
        if (fallEffectToggle) {
            fallEffectToggle.checked = this.settings.fallEffectEnabled !== false;
            fallEffectToggle.addEventListener('change', (e) => {
                this.settings.fallEffectEnabled = e.target.checked;
                this.saveSettings();
                if (typeof articleFallEffect !== 'undefined') {
                    articleFallEffect.setEnabled(e.target.checked);
                }
            });
        }

        // データエクスポート
        const exportBtn = document.getElementById('settings-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSaveData());
        }

        // データインポート
        const importBtn = document.getElementById('settings-import');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importSaveData());
        }
    }

    /**
     * セーブデータをエクスポート
     */
    exportSaveData() {
        if (!game) return;

        const exportString = saveManager.export(game);
        if (!exportString) {
            notificationManager.show('エラー', 'エクスポートに失敗しました', 'error');
            return;
        }

        // クリップボードにコピー
        navigator.clipboard.writeText(exportString).then(() => {
            notificationManager.show(
                '📋 エクスポート完了',
                'セーブデータをクリップボードにコピーしました',
                'success'
            );
        }).catch(() => {
            // クリップボードが使えない場合はテキストエリアで表示
            const textarea = document.createElement('textarea');
            textarea.value = exportString;
            textarea.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; height: 200px; z-index: 9999;';
            document.body.appendChild(textarea);
            textarea.select();
            alert('上記のテキストをコピーしてください。OKを押すと閉じます。');
            document.body.removeChild(textarea);
        });
    }

    /**
     * セーブデータをインポート
     */
    importSaveData() {
        const importString = prompt('エクスポートしたセーブデータを貼り付けてください:');
        if (!importString) return;

        const saveData = saveManager.import(importString);
        if (!saveData) {
            notificationManager.show('エラー', 'インポートに失敗しました。データが正しいか確認してください。', 'error');
            return;
        }

        // 確認ダイアログ
        if (!confirm('現在の進行状況をインポートしたデータで上書きしますか？')) {
            return;
        }

        // LocalStorageに保存してリロード
        localStorage.setItem(CONSTANTS.SAVE_KEY, JSON.stringify(saveData));
        notificationManager.show('✅ インポート完了', 'ページを再読み込みします...', 'success');
        setTimeout(() => location.reload(), 1500);
    }

    /**
     * 設定のロード
     */
    loadSettings() {
        const saved = localStorage.getItem('article_generator_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };

                // UIへの反映
                if (this.particlesToggle) this.particlesToggle.checked = this.settings.particlesEnabled;
                if (this.soundToggle) this.soundToggle.checked = this.settings.soundEnabled;

                // 記事落下エフェクト
                const fallEffectToggle = document.getElementById('setting-fall-effect');
                if (fallEffectToggle) {
                    fallEffectToggle.checked = this.settings.fallEffectEnabled !== false;
                }
            } catch (e) {
                console.error('設定の読み込みに失敗:', e);
            }
        }
    }

    /**
     * 設定の保存
     */
    saveSettings() {
        localStorage.setItem('article_generator_settings', JSON.stringify(this.settings));
    }

    /**
     * 設定の適用
     */
    applySettings() {
        // パーティクルの有効無効はGameCoreなどが参照する
        // グローバルにアクセス可能にするか、イベントを発火する
        window.settings = this.settings;

        // 記事落下エフェクト
        if (typeof articleFallEffect !== 'undefined') {
            articleFallEffect.setEnabled(this.settings.fallEffectEnabled !== false);
        }
    }

    /**
     * モーダルの表示
     */
    showModal() {
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

    /**
     * パーティクルが有効かどうか
     */
    isParticlesEnabled() {
        return this.settings.particlesEnabled;
    }

    /**
     * 記事落下エフェクトが有効かどうか
     */
    isFallEffectEnabled() {
        return this.settings.fallEffectEnabled !== false;
    }
}

// グローバルインスタンス
let settingsManager;
