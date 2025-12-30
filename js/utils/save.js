/* ============================================
   Article Generator - セーブ/ロード管理
   ============================================ */

/**
 * セーブ/ロードを管理するクラス
 */
class SaveManager {
    constructor() {
        this.saveKey = CONSTANTS.SAVE_KEY;
        this.autoSaveInterval = null;
    }

    /**
     * ゲームデータを保存
     * @param {Object} gameState ゲームの状態オブジェクト
     * @returns {boolean} 保存成功かどうか
     */
    save(gameState) {
        try {
            const saveData = this.createSaveData(gameState);
            const saveString = JSON.stringify(saveData);
            localStorage.setItem(this.saveKey, saveString);
            console.log('ゲームを保存しました');
            return true;
        } catch (error) {
            console.error('保存に失敗しました:', error);
            return false;
        }
    }

    /**
     * ゲームデータをロード
     * @returns {Object|null} ロードしたデータ、またはnull
     */
    load() {
        try {
            const saveString = localStorage.getItem(this.saveKey);
            if (!saveString) {
                console.log('セーブデータが見つかりません');
                return null;
            }

            const saveData = JSON.parse(saveString);

            // バージョンチェックとマイグレーション
            if (saveData.version !== CONSTANTS.VERSION) {
                console.log(`セーブデータをマイグレーション: ${saveData.version} -> ${CONSTANTS.VERSION}`);
                return this.migrate(saveData);
            }

            return saveData;
        } catch (error) {
            console.error('ロードに失敗しました:', error);
            return null;
        }
    }

    /**
     * セーブデータの作成
     * @param {Object} gameState ゲームの状態
     * @returns {Object} セーブデータ
     */
    createSaveData(gameState) {
        return {
            version: CONSTANTS.VERSION,
            savedAt: Date.now(),

            // 基本統計
            stats: {
                articles: gameState.articles.toString(),
                articlesThisRun: gameState.articlesThisRun.toString(),
                totalArticlesEver: gameState.totalArticlesEver.toString(),
                clickCount: gameState.clickCount,
                playTime: gameState.playTime,
                lastSaveTime: Date.now()
            },

            // 施設所有状況
            buildings: gameState.buildings.map(b => ({
                id: b.id,
                owned: b.owned
            })),

            // アップグレード購入状況
            upgrades: gameState.purchasedUpgrades,

            // 転生関連
            prestige: {
                toku: gameState.toku.toString(),
                prestigeCount: gameState.prestigeCount,
                prestigeUpgrades: gameState.prestigeUpgrades
            },

            // 座禅システム
            zen: {
                totalZenCompleted: gameState.totalZenCompleted || 0,
                currentProgress: gameState.zenProgress || 0
            }
        };
    }

    /**
     * セーブデータのマイグレーション
     * 将来のバージョンアップに備えた処理
     * @param {Object} oldData 古いセーブデータ
     * @returns {Object} マイグレーション後のデータ
     */
    migrate(oldData) {
        // 現時点ではそのまま返す
        // 将来的にはここでバージョン間の差分を吸収
        oldData.version = CONSTANTS.VERSION;
        return oldData;
    }

    /**
     * セーブデータの削除
     * @returns {boolean} 削除成功かどうか
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('セーブデータを削除しました');
            return true;
        } catch (error) {
            console.error('セーブデータの削除に失敗しました:', error);
            return false;
        }
    }

    /**
     * セーブデータのエクスポート
     * @param {Object} gameState ゲームの状態
     * @returns {string} Base64エンコードされたセーブデータ
     */
    export(gameState) {
        try {
            const saveData = this.createSaveData(gameState);
            const saveString = JSON.stringify(saveData);
            return btoa(encodeURIComponent(saveString));
        } catch (error) {
            console.error('エクスポートに失敗しました:', error);
            return null;
        }
    }

    /**
     * セーブデータのインポート
     * @param {string} exportString Base64エンコードされたセーブデータ
     * @returns {Object|null} インポートしたデータ、またはnull
     */
    import(exportString) {
        try {
            const saveString = decodeURIComponent(atob(exportString));
            const saveData = JSON.parse(saveString);
            return saveData;
        } catch (error) {
            console.error('インポートに失敗しました:', error);
            return null;
        }
    }

    /**
     * 自動保存の開始
     * @param {Function} saveCallback 保存を実行するコールバック関数
     */
    startAutoSave(saveCallback) {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            saveCallback();
        }, CONSTANTS.AUTO_SAVE_INTERVAL);

        console.log(`自動保存を開始しました（${CONSTANTS.AUTO_SAVE_INTERVAL / 1000}秒ごと）`);
    }

    /**
     * 自動保存の停止
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('自動保存を停止しました');
        }
    }

    /**
     * セーブデータの存在確認
     * @returns {boolean} セーブデータが存在するかどうか
     */
    hasSaveData() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    /**
     * オフライン時間の計算
     * @param {Object} saveData ロードしたセーブデータ
     * @returns {number} オフライン時間（秒）
     */
    calculateOfflineTime(saveData) {
        if (!saveData || !saveData.stats || !saveData.stats.lastSaveTime) {
            return 0;
        }

        const now = Date.now();
        const lastSave = saveData.stats.lastSaveTime;
        const elapsedMs = now - lastSave;

        return Math.floor(elapsedMs / 1000);
    }
}

// グローバルインスタンス
const saveManager = new SaveManager();
