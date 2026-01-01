/* ============================================
   Article Generator - ゲームコア
   ============================================ */

/**
 * ゲームのコアロジックを管理するクラス
 */
class GameCore {
    constructor() {
        // 基本統計
        this.articles = new Decimal(0);
        this.articlesThisRun = new Decimal(0);
        this.totalArticlesEver = new Decimal(0);
        this.clickCount = 0;
        this.playTime = 0;

        // 転生関連
        this.toku = new Decimal(0);
        this.prestigeCount = 0;
        this.prestigeUpgrades = {};

        // 座禅関連
        this.totalZenCompleted = 0;
        this.zenProgress = 0;

        // 購入済みアップグレード
        this.purchasedUpgrades = {};

        // 施設
        this.buildings = [];

        // ゲームループ関連
        this.lastTick = Date.now();
        this.running = false;
        this.tickInterval = null;
    }

    /**
     * ゲームの初期化
     */
    init() {
        // 施設の初期化
        this.initBuildings();

        // セーブデータのロード
        this.loadGame();

        // イベントリスナーの設定
        this.setupEventListeners();

        // ゲームループの開始
        this.startGameLoop();

        // 自動保存の開始
        saveManager.startAutoSave(() => this.saveGame());

        // UIの初期更新
        this.updateUI();

        console.log('Article Generator 初期化完了');
    }

    /**
     * 施設の初期化
     */
    initBuildings() {
        this.buildings = BUILDINGS_DATA.map(data => new Building(data));
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // クリックイベント
        const clickTarget = document.getElementById('click-target');
        if (clickTarget) {
            clickTarget.addEventListener('click', (e) => this.handleClick(e));
            clickTarget.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleClick(e);
                }
            });
        }

        // 保存ボタン
        const saveButton = document.getElementById('save-button');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveGame();
                notificationManager.show('保存完了', 'ゲームを保存しました', 'success');
            });
        }

        // 転生ボタン
        const prestigeButton = document.getElementById('prestige-button');
        if (prestigeButton) {
            prestigeButton.addEventListener('click', () => this.showPrestigeModal());
        }

        // ページ離脱時の保存
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
    }

    /**
     * クリック処理
     * @param {Event} e クリックイベント
     */
    handleClick(e) {
        const clickPower = this.getClickPower();
        this.addArticles(clickPower);
        this.clickCount++;

        // クリックエフェクト表示 (設定でONの場合のみ)
        if (typeof settingsManager === 'undefined' || settingsManager.isParticlesEnabled()) {
            this.showClickEffect(e, clickPower);
        }

        // 般若心経コード表示更新
        this.updateCodeDisplay();

        // 座禅システムに通知
        if (typeof zenSystem !== 'undefined') {
            zenSystem.onUserAction();
        }
    }

    /**
     * 般若心経コードの表示更新
     */
    updateCodeDisplay() {
        const display = document.getElementById('code-display');
        if (!display) return;

        // 般若心経テキスト
        const sutra = "観自在菩薩行深般若波羅蜜多時照見五蘊皆空度一切苦厄舎利子色不異空空不異色色即是空空即是色受想行識亦復如是舎利子是諸法空相不生不滅不垢不浄不増不減是故空中無色無受想行識無眼耳鼻舌身意無色声香味触法無眼界乃至無意識界無無明亦無無明尽乃至無老死亦無老死尽無苦集滅道無智亦無得以無所得故菩提薩埵依般若波羅蜜多故心無罣礙無罣礙故無有恐怖遠離一切顛倒夢想究竟涅槃三世諸仏依般若波羅蜜多故得阿耨多羅三藐三菩提故知般若波羅蜜多是大神呪是大明呪是無上呪是無等等呪能除一切苦真実不虚故説般若波羅蜜多呪即説呪曰羯諦羯諦波羅羯諦波羅僧羯諦菩提薩婆訶般若心経";

        // 現在の進行度（クリック数）に合わせて文字を取得
        // クリックごとに2〜5文字進む
        const charsToAdd = 3;

        // セッション内の進行度を保持する必要があるが、簡易的に総クリック数を使う
        // テキストがいっぱいになったら古いものを消す（スクロール）

        if (!this.sutraIndex) this.sutraIndex = 0;

        const nextIndex = (this.sutraIndex + charsToAdd) % sutra.length;
        let textChunk = "";

        if (nextIndex > this.sutraIndex) {
            textChunk = sutra.substring(this.sutraIndex, nextIndex);
        } else {
            textChunk = sutra.substring(this.sutraIndex) + sutra.substring(0, nextIndex);
        }

        this.sutraIndex = nextIndex;

        // spanでラップして追加（フェードインアニメ用）
        const span = document.createElement('span');
        span.textContent = textChunk;
        span.style.animation = 'fadeIn 0.5s ease';
        display.appendChild(span);

        // 要素が増えすぎたら削除
        if (display.children.length > 20) {
            display.removeChild(display.firstChild);
        }

        // 自動スクロール（縦書きなので左へスクロールするのが正しいが、flex-direction: columnなら下へ）
        // CSSで writing-mode: vertical-rl を指定しているため、
        // 要素は右から左へ並ぶ... はずだが flex-direction 次第。
        // CSS実装では flex-direction: column; align-items: flex-start; とした。
        // vertical-rl の場合、column方向は「右から左」になるはず...? 
        // いや、vertical-rl の主軸は「上から下」、交差軸が「右から左」。
        // flex-direction: column だと主軸（上から下）に並ぶ。
        // なので、行の下に追加されていく形。
        display.scrollTop = display.scrollHeight; // 念のため
    }

    /**
     * クリック効率の取得
     * 人力施設の所有数に基づく
     * @returns {Decimal} クリック効率
     */
    getClickPower() {
        const manualBuilding = this.buildings[0];
        let basePower = manualBuilding.owned > 0 ? manualBuilding.owned : 1;

        // 人力施設のアップグレード倍率を適用
        const multiplier = this.getUpgradeMultiplier(0);

        // マルチスレッド輪廻の効果（転生時ボーナス）
        let prestigeMultiplier = 1;
        if (this.prestigeUpgrades['multithread_samsara']) {
            prestigeMultiplier = 2;
        }

        return new Decimal(basePower).times(multiplier).times(prestigeMultiplier);
    }

    /**
     * 記事を追加
     * @param {Decimal|number} amount 追加する量
     */
    addArticles(amount) {
        const decimalAmount = new Decimal(amount);
        this.articles = this.articles.plus(decimalAmount);
        this.articlesThisRun = this.articlesThisRun.plus(decimalAmount);
        this.totalArticlesEver = this.totalArticlesEver.plus(decimalAmount);
    }

    /**
     * 総CpS（Content per Second）の計算
     * @returns {Decimal} 総CpS
     */
    getTotalCps() {
        let totalCps = new Decimal(0);

        for (const building of this.buildings) {
            if (building.owned > 0) {
                const buildingCps = building.getCps(this.getUpgradeMultiplier(building.id));
                totalCps = totalCps.plus(buildingCps);
            }
        }

        // マルチスレッド輪廻の効果
        if (this.prestigeUpgrades['multithread_samsara']) {
            totalCps = totalCps.times(2);
        }

        // 除夜の鐘ブースト
        if (typeof bellEventSystem !== 'undefined' && bellEventSystem.isBoostActive()) {
            totalCps = totalCps.times(bellEventSystem.getBoostMultiplier());
        }

        return totalCps;
    }

    /**
     * 施設のアップグレード倍率を取得
     * @param {number} buildingId 施設ID
     * @returns {number} 倍率
     */
    getUpgradeMultiplier(buildingId) {
        let multiplier = 1;
        const building = this.buildings[buildingId];

        for (const threshold of UPGRADE_THRESHOLDS) {
            const upgradeId = this.getUpgradeId(buildingId, threshold.count);
            if (building.owned >= threshold.count && this.purchasedUpgrades[upgradeId]) {
                multiplier *= threshold.multiplier;
            }
        }

        return multiplier;
    }

    /**
     * アップグレードIDの生成
     * @param {number} buildingId 施設ID
     * @param {number} count 解放条件の数
     * @returns {string} アップグレードID
     */
    getUpgradeId(buildingId, count) {
        const prefixes = ['manual', 'ghost', 'copy', 'llm', 'pipeline', 'agi', 'void', 'monkey', 'integral'];
        return `${prefixes[buildingId]}_${count}`;
    }

    /**
     * 施設のコスト上昇倍率を取得
     * @returns {number} コスト上昇倍率
     */
    getCostMultiplier() {
        if (this.prestigeUpgrades['shiki_soku_ze_kuu']) {
            return CONSTANTS.BUILDING_COST_MULTIPLIER_REDUCED;
        }
        return CONSTANTS.BUILDING_COST_MULTIPLIER;
    }

    /**
     * ゲームループの開始
     */
    startGameLoop() {
        this.running = true;
        this.lastTick = Date.now();

        const tick = () => {
            if (!this.running) return;

            const now = Date.now();
            const deltaTime = (now - this.lastTick) / 1000;
            this.lastTick = now;

            this.update(deltaTime);

            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }

    /**
     * ゲームループの停止
     */
    stopGameLoop() {
        this.running = false;
    }

    /**
     * ゲーム更新（毎フレーム呼ばれる）
     * @param {number} deltaTime 前フレームからの経過時間（秒）
     */
    update(deltaTime) {
        // CpSに基づいて記事を生産
        const production = this.getTotalCps().times(deltaTime);
        if (production.gt(0)) {
            this.addArticles(production);
        }

        // プレイ時間の更新
        this.playTime += deltaTime;

        // UI更新（60fpsだと重いので間引く）
        this.updateUI();

        // 転生ボタンの表示制御
        this.checkPrestigeAvailability();
    }

    /**
     * UIの更新
     */
    updateUI() {
        // 記事数表示
        const articleCount = document.getElementById('article-count');
        if (articleCount) {
            articleCount.textContent = formatNumber(this.articles);
        }

        // CpS表示
        const cpsDisplay = document.getElementById('cps-display');
        if (cpsDisplay) {
            cpsDisplay.textContent = formatNumber(this.getTotalCps());
        }

        // クリック効率表示
        const clickPower = document.getElementById('click-power');
        if (clickPower) {
            clickPower.textContent = formatNumber(this.getClickPower());
        }

        // 得の表示
        if (this.toku.gt(0) || this.prestigeCount > 0) {
            const tokuContainer = document.getElementById('toku-container');
            const tokuCount = document.getElementById('toku-count');
            if (tokuContainer) tokuContainer.style.display = 'flex';
            if (tokuCount) tokuCount.textContent = formatNumber(this.toku);
        }

        // 施設リストの更新
        if (typeof buildingsManager !== 'undefined') {
            buildingsManager.updateDisplay();
        }

        // アップグレードリストの更新
        if (typeof upgradesManager !== 'undefined') {
            upgradesManager.updateDisplay();
        }
    }

    /**
     * 転生可能かチェック
     */
    checkPrestigeAvailability() {
        const prestigeButton = document.getElementById('prestige-button');
        if (prestigeButton) {
            const canPrestige = this.articlesThisRun.gte(CONSTANTS.PRESTIGE_THRESHOLD);
            const wasHidden = prestigeButton.style.display === 'none';

            if (canPrestige) {
                prestigeButton.style.display = 'inline-flex';

                // 初めて表示される時にトースト通知
                if (wasHidden) {
                    notificationManager.show(
                        '🪷 悟りを開けます',
                        '転生の準備が整いました。「悟りを開く」ボタンをクリックしてください。',
                        'success'
                    );
                }
            }
        }
    }

    /**
     * クリックエフェクトの表示
     * @param {Event} e クリックイベント
     * @param {Decimal} amount 生産量
     */
    showClickEffect(e, amount) {
        const particle = document.createElement('div');
        particle.className = 'click-particle';
        particle.textContent = '+' + formatNumber(amount);

        // クリック位置に配置（ランダムに散らす）
        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 50;
        particle.style.left = (e.clientX + offsetX) + 'px';
        particle.style.top = (e.clientY + offsetY) + 'px';

        document.body.appendChild(particle);

        // アニメーション終了後に削除
        setTimeout(() => particle.remove(), 1000);
    }

    /**
     * 転生モーダルの表示
     */
    showPrestigeModal() {
        if (typeof prestigeSystem !== 'undefined') {
            prestigeSystem.showModal();
        }
    }

    /**
     * ゲームの保存
     */
    saveGame() {
        const gameState = {
            articles: this.articles,
            articlesThisRun: this.articlesThisRun,
            totalArticlesEver: this.totalArticlesEver,
            clickCount: this.clickCount,
            playTime: this.playTime,
            buildings: this.buildings,
            purchasedUpgrades: this.purchasedUpgrades,
            toku: this.toku,
            prestigeCount: this.prestigeCount,
            prestigeUpgrades: this.prestigeUpgrades,
            totalZenCompleted: this.totalZenCompleted,
            zenProgress: this.zenProgress
        };

        saveManager.save(gameState);
    }

    /**
     * ゲームのロード
     */
    loadGame() {
        const saveData = saveManager.load();

        if (!saveData) {
            console.log('新規ゲームを開始します');
            return;
        }

        // 統計のロード
        this.articles = new Decimal(saveData.stats.articles || 0);
        this.articlesThisRun = new Decimal(saveData.stats.articlesThisRun || 0);
        this.totalArticlesEver = new Decimal(saveData.stats.totalArticlesEver || 0);
        this.clickCount = saveData.stats.clickCount || 0;
        this.playTime = saveData.stats.playTime || 0;

        // 施設のロード
        if (saveData.buildings) {
            for (const savedBuilding of saveData.buildings) {
                const building = this.buildings.find(b => b.id === savedBuilding.id);
                if (building) {
                    building.owned = savedBuilding.owned;
                }
            }
        }

        // アップグレードのロード
        this.purchasedUpgrades = saveData.upgrades || {};

        // 転生関連のロード
        if (saveData.prestige) {
            this.toku = new Decimal(saveData.prestige.toku || 0);
            this.prestigeCount = saveData.prestige.prestigeCount || 0;
            this.prestigeUpgrades = saveData.prestige.prestigeUpgrades || {};
        }

        // 座禅関連のロード
        if (saveData.zen) {
            this.totalZenCompleted = saveData.zen.totalZenCompleted || 0;
            this.zenProgress = saveData.zen.currentProgress || 0;
        }

        // オフライン報酬の計算
        this.calculateOfflineReward(saveData);

        console.log('ゲームをロードしました');
    }

    /**
     * オフライン報酬の計算と付与
     * @param {Object} saveData セーブデータ
     */
    calculateOfflineReward(saveData) {
        const offlineSeconds = saveManager.calculateOfflineTime(saveData);

        if (offlineSeconds < 60) {
            // 1分未満は無視
            return;
        }

        // オフライン時間の上限を適用
        const hasNirvana = this.prestigeUpgrades['serverless_nirvana'];
        const maxSeconds = hasNirvana ? CONSTANTS.OFFLINE_MAX_TIME_NIRVANA : CONSTANTS.OFFLINE_MAX_TIME_DEFAULT;
        const efficiency = hasNirvana ? CONSTANTS.OFFLINE_EFFICIENCY_NIRVANA : CONSTANTS.OFFLINE_EFFICIENCY_DEFAULT;

        const clampedSeconds = Math.min(offlineSeconds, maxSeconds);

        // オフライン生産量の計算
        const offlineCps = this.getTotalCps();
        const offlineProduction = offlineCps.times(clampedSeconds).times(efficiency);

        if (offlineProduction.gt(0)) {
            this.addArticles(offlineProduction);

            // 通知を表示
            const hours = Math.floor(clampedSeconds / 3600);
            const minutes = Math.floor((clampedSeconds % 3600) / 60);
            const timeString = hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;

            setTimeout(() => {
                notificationManager.show(
                    'オフライン報酬',
                    `${timeString}の間に ${formatNumber(offlineProduction)} 記事を生産しました！`,
                    'success'
                );
            }, 500);
        }
    }

    /**
     * 転生の実行
     */
    doPrestige() {
        if (typeof prestigeSystem !== 'undefined') {
            prestigeSystem.doPrestige();
        }
    }

    /**
     * ゲームのリセット（転生時）
     * 得と永続アップグレードは保持
     */
    resetForPrestige() {
        this.articles = new Decimal(0);
        this.articlesThisRun = new Decimal(0);
        this.clickCount = 0;

        // 施設のリセット
        for (const building of this.buildings) {
            building.owned = 0;
        }

        // アップグレードのリセット
        this.purchasedUpgrades = {};

        // UIの更新
        this.updateUI();
    }

    /**
     * 得を追加
     * @param {Decimal|number} amount 追加する得の量
     */
    addToku(amount) {
        this.toku = this.toku.plus(new Decimal(amount));
    }
}

// グローバルインスタンス
let game;
