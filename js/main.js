/* ============================================
   Article Generator - メインエントリーポイント
   ============================================ */

/**
 * ゲームの初期化
 */
function initGame() {
    console.log('Article Generator を初期化中...');
    console.log(`バージョン: ${CONSTANTS.VERSION}`);

    // グローバルインスタンスの初期化
    notificationManager = new NotificationManager();
    modalManager = new ModalManager();
    pvDisplay = new PVDisplay();

    // ゲームコアの初期化
    game = new GameCore();
    game.init();

    // サブシステムの初期化
    buildingsManager = new BuildingsManager();
    buildingsManager.init();

    upgradesManager = new UpgradesManager();
    upgradesManager.init();

    prestigeSystem = new PrestigeSystem();

    zenSystem = new ZenSystem();
    zenSystem.init();

    // PV表示の初期化
    pvDisplay.init();

    // 初期表示の更新
    buildingsManager.renderBuildings();
    upgradesManager.renderUpgrades();

    console.log('Article Generator 初期化完了！');

    // 開始メッセージ
    if (!saveManager.hasSaveData()) {
        notificationManager.show(
            'Article Generator へようこそ！',
            '画面中央のモニターをクリックして記事を生成しましょう',
            'info',
            6000
        );
    }
}

/**
 * DOMContentLoaded イベントでゲームを開始
 */
document.addEventListener('DOMContentLoaded', () => {
    // break_infinity.jsが読み込まれているか確認
    if (typeof Decimal === 'undefined') {
        console.error('break_infinity.js が読み込まれていません');
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; 
                        background: #1a1a2e; color: #e5e7eb; font-family: sans-serif; text-align: center;">
                <div>
                    <h1>エラー</h1>
                    <p>必須ライブラリが読み込まれていません。</p>
                    <p>break_infinity.js を配置してください。</p>
                </div>
            </div>
        `;
        return;
    }

    initGame();
});

/**
 * エラーハンドリング
 */
window.onerror = function (message, source, lineno, colno, error) {
    console.error('ゲームエラー:', message, source, lineno, colno, error);

    // セーブを試みる
    if (game) {
        try {
            game.saveGame();
            console.log('エラー発生時に緊急セーブを実行しました');
        } catch (e) {
            console.error('緊急セーブに失敗:', e);
        }
    }

    return false;
};

/**
 * 開発者用コンソールコマンド
 */
const dev = {
    /**
     * 記事を追加（デバッグ用）
     * @param {number|string} amount 追加する量
     */
    addArticles: function (amount) {
        if (game) {
            game.addArticles(new Decimal(amount));
            console.log(`${amount} 記事を追加しました`);
        }
    },

    /**
     * 得を追加（デバッグ用）
     * @param {number} amount 追加する量
     */
    addToku: function (amount) {
        if (game) {
            game.addToku(amount);
            console.log(`${amount} 得を追加しました`);
        }
    },

    /**
     * 施設を追加（デバッグ用）
     * @param {number} buildingId 施設ID
     * @param {number} count 追加する数
     */
    addBuilding: function (buildingId, count = 1) {
        if (game && game.buildings[buildingId]) {
            game.buildings[buildingId].owned += count;
            buildingsManager.renderBuildings();
            upgradesManager.checkUnlocks();
            console.log(`施設 ${game.buildings[buildingId].name} を ${count} 個追加しました`);
        }
    },

    /**
     * セーブデータの削除（デバッグ用）
     */
    resetGame: function () {
        if (confirm('本当にセーブデータを削除しますか？この操作は取り消せません。')) {
            saveManager.deleteSave();
            location.reload();
        }
    },

    /**
     * ゲーム状態の表示（デバッグ用）
     */
    showState: function () {
        if (game) {
            console.log({
                articles: game.articles.toString(),
                articlesThisRun: game.articlesThisRun.toString(),
                totalArticlesEver: game.totalArticlesEver.toString(),
                toku: game.toku.toString(),
                prestigeCount: game.prestigeCount,
                cps: game.getTotalCps().toString(),
                clickPower: game.getClickPower().toString(),
                buildings: game.buildings.map(b => ({ name: b.name, owned: b.owned }))
            });
        }
    },

    /**
     * 転生条件を達成（デバッグ用）
     */
    reachPrestige: function () {
        this.addArticles(1e14);
        console.log('転生条件（100兆記事）を達成しました');
    },

    /**
     * ヘルプを表示
     */
    help: function () {
        console.log(`
Article Generator 開発者コマンド:
--------------------------------
dev.addArticles(amount)     - 記事を追加
dev.addToku(amount)         - 得を追加
dev.addBuilding(id, count)  - 施設を追加
dev.resetGame()             - セーブデータを削除
dev.showState()             - ゲーム状態を表示
dev.reachPrestige()         - 転生条件を達成
dev.help()                  - このヘルプを表示
        `);
    }
};

console.log('開発者コマンドが利用可能です。dev.help() で確認してください。');
