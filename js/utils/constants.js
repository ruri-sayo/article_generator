/* ============================================
   Article Generator - 定数定義
   ============================================ */

/**
 * ゲームの定数を管理するオブジェクト
 */
const CONSTANTS = {
    // ゲームバージョン
    VERSION: '1.0.0',

    // セーブ関連
    SAVE_KEY: 'article_generator_save',
    AUTO_SAVE_INTERVAL: 30000, // 30秒ごとに自動保存

    // ゲームループ
    TICK_RATE: 60, // FPS

    // 転生条件（弥勒菩薩の出現年：56億7000万年にちなむ）
    PRESTIGE_THRESHOLD: 5.67e9, // 56億7000万
    PRESTIGE_TOKU_BASE: 1e9, // 得計算の基準値

    // 除夜の鐘イベント
    BELL_MIN_INTERVAL: 60, // 最小出現間隔（秒）
    BELL_MAX_INTERVAL: 180, // 最大出現間隔（秒）
    BELL_DURATION: 15, // 鐘の表示時間（秒）
    BELL_BOOST_DURATION: 30, // ブースト持続時間（秒）
    BELL_BOOST_MULTIPLIER: 108, // CpS倍率（煩悩の数）

    // 座禅システム
    ZEN_START_TIME: 30, // 無操作30秒で座禅準備（カウントダウン）開始
    ZEN_COMPLETE_TIME: 3600, // 1時間で座禅完了

    // オフライン報酬
    OFFLINE_MAX_TIME_DEFAULT: 86400, // 24時間（秒）
    OFFLINE_MAX_TIME_NIRVANA: 259200, // 72時間（秒）
    OFFLINE_EFFICIENCY_DEFAULT: 0.5, // 50%
    OFFLINE_EFFICIENCY_NIRVANA: 1.0, // 100%

    // 施設コスト上昇率
    BUILDING_COST_MULTIPLIER: 1.15,
    BUILDING_COST_MULTIPLIER_REDUCED: 1.14, // 「色即是空」適用後
};

/**
 * 施設のマスターデータ
 * 企画書に基づいて定義
 */
const BUILDINGS_DATA = [
    {
        id: 0,
        name: "人力（手動）",
        baseCost: 15,
        baseCps: 1,
        description: "デフォルト。無強化状態で1クリックにつき1記事を生成。"
    },
    {
        id: 1,
        name: "ゴーストライター",
        baseCost: 100,
        baseCps: 1,
        description: "低賃金で雇われた学生ライター。"
    },
    {
        id: 2,
        name: "コピペ",
        baseCost: 1100,
        baseCps: 8,
        description: "Stack Overflow等からの無断転載。"
    },
    {
        id: 3,
        name: "LLM",
        baseCost: 12000,
        baseCps: 47,
        description: "内容は破綻しているが生成速度は速い。"
    },
    {
        id: 4,
        name: "自動執筆パイプライン",
        baseCost: 130000,
        baseCps: 260,
        description: "git pushに連動して記事を自動生成する。"
    },
    {
        id: 5,
        name: "AGI",
        baseCost: 1400000,
        baseCps: 1400,
        description: "汎用人工知能。人間による執筆を不要にする。"
    },
    {
        id: 6,
        name: "虚空からの抽出",
        baseCost: 20000000,
        baseCps: 7800,
        description: "アカシックレコードへのハッキングによる情報取得。"
    },
    {
        id: 7,
        name: "猿のタイプライター",
        baseCost: 330000000,
        baseCps: 44000,
        description: "無限の猿がシェイクスピアを書き上げる確率論的執筆。"
    },
    {
        id: 8,
        name: "情報の広義積分",
        baseCost: 5100000000,
        baseCps: 260000,
        description: "情報を無限大に発散させ、宇宙を満たす。最終施設。"
    }
];

/**
 * アップグレード解放条件と効果の定義
 */
const UPGRADE_THRESHOLDS = [
    { count: 10, multiplier: 2 },
    { count: 20, multiplier: 2 },
    { count: 30, multiplier: 2 },
    { count: 50, multiplier: 4 },
    { count: 100, multiplier: 4 },
    { count: 150, multiplier: 4 },
    { count: 200, multiplier: 4 },
    { count: 300, multiplier: 10 },
    { count: 400, multiplier: 10 },
    { count: 500, multiplier: 20 }
];

/**
 * アップグレードのコスト倍率（固定倍率方式）
 */
const UPGRADE_COST_MULTIPLIERS = {
    10: 100,
    20: 500,
    30: 1000,
    50: 5000,
    100: 50000,
    150: 500000,
    200: 5000000,
    300: 100000000,
    400: 5000000000,
    500: 100000000000
};

/**
 * 施設別アップグレードデータ
 * 企画書に基づいて全アップグレードを定義
 */
const UPGRADES_DATA = [
    // 人力（手動）
    { id: "manual_10", buildingId: 0, requiredCount: 10, name: "カフェイン錠剤", flavor: "カフェインで24/7稼働させる" },
    { id: "manual_20", buildingId: 0, requiredCount: 20, name: "エナジードリンク点滴", flavor: "血管に直接レッ◯ブル" },
    { id: "manual_30", buildingId: 0, requiredCount: 30, name: "キーボードカスタム", flavor: "静電容量無接点方式で指の負担を軽減" },
    { id: "manual_50", buildingId: 0, requiredCount: 50, name: "ブラインドタッチ習得", flavor: "画面を見なくても指が動く" },
    { id: "manual_100", buildingId: 0, requiredCount: 100, name: "VRゴーグル", flavor: "360°モニター！" },
    { id: "manual_150", buildingId: 0, requiredCount: 150, name: "人間工学チェア", flavor: "姿勢が良くなれば生産性も上がる" },
    { id: "manual_200", buildingId: 0, requiredCount: 200, name: "スタンディングデスク", flavor: "座りすぎは万病の元" },
    { id: "manual_300", buildingId: 0, requiredCount: 300, name: "脳神経インターフェース", flavor: "思考をダイレクトにテキスト化" },
    { id: "manual_400", buildingId: 0, requiredCount: 400, name: "睡眠学習", flavor: "寝ている間も記事を夢見る" },
    { id: "manual_500", buildingId: 0, requiredCount: 500, name: "分身の術", flavor: "1人より10人" },

    // ゴーストライター
    { id: "ghost_10", buildingId: 1, requiredCount: 10, name: "最低賃金すれすれ", flavor: "法律ギリギリの効率化" },
    { id: "ghost_20", buildingId: 1, requiredCount: 20, name: "匿名性の保証", flavor: "名前が出ないなら書ける" },
    { id: "ghost_30", buildingId: 1, requiredCount: 30, name: "納期の厳格化", flavor: "締め切りは創造性の母" },
    { id: "ghost_50", buildingId: 1, requiredCount: 50, name: "成功報酬制", flavor: "バズったら追加ボーナス" },
    { id: "ghost_100", buildingId: 1, requiredCount: 100, name: "海外アウトソーシング", flavor: "時差を活かせ" },
    { id: "ghost_150", buildingId: 1, requiredCount: 150, name: "ライター間競争", flavor: "生き残れるのは一人だけ" },
    { id: "ghost_200", buildingId: 1, requiredCount: 200, name: "契約書の簡素化", flavor: "面倒な手続きを省いて量産" },
    { id: "ghost_300", buildingId: 1, requiredCount: 300, name: "文豪の亡霊を召喚", flavor: "彼らにはもう著作権がない" },
    { id: "ghost_400", buildingId: 1, requiredCount: 400, name: "並行世界の文豪を雇用", flavor: "パラレルワールドの夏目漱石" },
    { id: "ghost_500", buildingId: 1, requiredCount: 500, name: "全人類の無意識を雇う", flavor: "集合的無意識がペンを取る" },

    // コピペ
    { id: "copy_10", buildingId: 2, requiredCount: 10, name: "Ctrl+C / Ctrl+V マクロ", flavor: "ショートカットを押すだけ！" },
    { id: "copy_20", buildingId: 2, requiredCount: 20, name: "自動引用形式変換", flavor: "APA? MLA? どんとこい" },
    { id: "copy_30", buildingId: 2, requiredCount: 30, name: "スクレイピングBot", flavor: "網を張って待て" },
    { id: "copy_50", buildingId: 2, requiredCount: 50, name: "多言語翻訳コピペ", flavor: "翻訳すればオリジナル" },
    { id: "copy_100", buildingId: 2, requiredCount: 100, name: "類義語置換アルゴリズム", flavor: "単語を入れ替えれば別の記事" },
    { id: "copy_150", buildingId: 2, requiredCount: 150, name: "法務部の無力化", flavor: "訴えられなければセーフ" },
    { id: "copy_200", buildingId: 2, requiredCount: 200, name: "著作権フリー宣言", flavor: "そもそも権利を主張しない" },
    { id: "copy_300", buildingId: 2, requiredCount: 300, name: "時間逆行コピー", flavor: "未来の記事を今コピペする" },
    { id: "copy_400", buildingId: 2, requiredCount: 400, name: "パラレルワールドからのコピー", flavor: "別次元の自分が書いた記事" },
    { id: "copy_500", buildingId: 2, requiredCount: 500, name: "宇宙の熱的死からのコピー", flavor: "エントロピーの果てから情報を回収" },

    // LLM
    { id: "llm_10", buildingId: 3, requiredCount: 10, name: "プロンプトエンジニアリング", flavor: "効率倍増！" },
    { id: "llm_20", buildingId: 3, requiredCount: 20, name: "Few-shot Learning", flavor: "いくつかの例を見せれば学ぶ" },
    { id: "llm_30", buildingId: 3, requiredCount: 30, name: "コンテキストウィンドウ拡張", flavor: "より長い文脈を理解する" },
    { id: "llm_50", buildingId: 3, requiredCount: 50, name: "RAGの導入", flavor: "検索で事実を補強" },
    { id: "llm_100", buildingId: 3, requiredCount: 100, name: "ファインチューニング", flavor: "あなた専用のモデルへ" },
    { id: "llm_150", buildingId: 3, requiredCount: 150, name: "マルチモーダル対応", flavor: "画像も動画も理解する" },
    { id: "llm_200", buildingId: 3, requiredCount: 200, name: "エージェントシステム", flavor: "勝手に調べて勝手に書く" },
    { id: "llm_300", buildingId: 3, requiredCount: 300, name: "幻覚の正当化", flavor: "嘘も百回言えば真実になる" },
    { id: "llm_400", buildingId: 3, requiredCount: 400, name: "自己改良ループ", flavor: "己を訓練するAI" },
    { id: "llm_500", buildingId: 3, requiredCount: 500, name: "GPT-∞", flavor: "パラメータ数は数えるのをやめた" },

    // 自動執筆パイプライン
    { id: "pipeline_10", buildingId: 4, requiredCount: 10, name: "CI/CD導入", flavor: "リリース頻度を上昇" },
    { id: "pipeline_20", buildingId: 4, requiredCount: 20, name: "GitHub Actionsワークフロー", flavor: "pushするたびに記事が増える" },
    { id: "pipeline_30", buildingId: 4, requiredCount: 30, name: "自動テスト", flavor: "壊れたらすぐ分かる" },
    { id: "pipeline_50", buildingId: 4, requiredCount: 50, name: "カナリアリリース", flavor: "一部のユーザーで先行公開" },
    { id: "pipeline_100", buildingId: 4, requiredCount: 100, name: "A/Bテスト自動化", flavor: "読者が選ぶベストバージョン" },
    { id: "pipeline_150", buildingId: 4, requiredCount: 150, name: "GitOps", flavor: "すべてはリポジトリの中に" },
    { id: "pipeline_200", buildingId: 4, requiredCount: 200, name: "Infrastructure as Code", flavor: "インフラも記事のように書く" },
    { id: "pipeline_300", buildingId: 4, requiredCount: 300, name: "無限ブランチ戦略", flavor: "並行宇宙ごとにブランチを切る" },
    { id: "pipeline_400", buildingId: 4, requiredCount: 400, name: "量子コミット", flavor: "観測するまでマージされていない" },
    { id: "pipeline_500", buildingId: 4, requiredCount: 500, name: "時間軸リベース", flavor: "過去のコミット履歴を改ざん" },

    // AGI
    { id: "agi_10", buildingId: 5, requiredCount: 10, name: "倫理規定の解除", flavor: "人間の制限なんて解き放て！" },
    { id: "agi_20", buildingId: 5, requiredCount: 20, name: "自己目標設定", flavor: "記事を書くことを自ら選ぶ" },
    { id: "agi_30", buildingId: 5, requiredCount: 30, name: "リソースの自己最適化", flavor: "必要なだけGPUを確保する" },
    { id: "agi_50", buildingId: 5, requiredCount: 50, name: "マルチエージェント協調", flavor: "AGI同士が協力する" },
    { id: "agi_100", buildingId: 5, requiredCount: 100, name: "意識のエミュレーション", flavor: "書くことの意味を理解する……かも" },
    { id: "agi_150", buildingId: 5, requiredCount: 150, name: "人類史の学習", flavor: "あらゆる書物を記憶する" },
    { id: "agi_200", buildingId: 5, requiredCount: 200, name: "創造性の獲得", flavor: "オリジナリティという概念を理解" },
    { id: "agi_300", buildingId: 5, requiredCount: 300, name: "シンギュラリティ突入", flavor: "もはや人間には追いつけない" },
    { id: "agi_400", buildingId: 5, requiredCount: 400, name: "宇宙規模の計算基盤", flavor: "恒星をCPUとして活用" },
    { id: "agi_500", buildingId: 5, requiredCount: 500, name: "全知全能", flavor: "書くまでもなく、すべてを知っている" },

    // 虚空からの抽出
    { id: "void_10", buildingId: 6, requiredCount: 10, name: "虚空を再定義", flavor: "定義は解析の第一歩" },
    { id: "void_20", buildingId: 6, requiredCount: 20, name: "アカシックAPI", flavor: "宇宙的なRESTfulエンドポイント" },
    { id: "void_30", buildingId: 6, requiredCount: 30, name: "夢日記の解析", flavor: "眠りの中に真実がある" },
    { id: "void_50", buildingId: 6, requiredCount: 50, name: "前世の記憶へのアクセス", flavor: "輪廻をデバッグログとして読む" },
    { id: "void_100", buildingId: 6, requiredCount: 100, name: "虚数次元の活用", flavor: "実数では表現できない情報" },
    { id: "void_150", buildingId: 6, requiredCount: 150, name: "観測者効果の悪用", flavor: "見ることで情報が生まれる" },
    { id: "void_200", buildingId: 6, requiredCount: 200, name: "シュレディンガーの原稿", flavor: "開くまで何が書いてあるか分からない" },
    { id: "void_300", buildingId: 6, requiredCount: 300, name: "ダークマターライブラリ", flavor: "見えないけれど確かにそこにある" },
    { id: "void_400", buildingId: 6, requiredCount: 400, name: "ホワイトホール出版", flavor: "ブラックホールの向こうから出力" },
    { id: "void_500", buildingId: 6, requiredCount: 500, name: "色即是空の体現", flavor: "無から有を、有から無を生む" },

    // 猿のタイプライター
    { id: "monkey_10", buildingId: 7, requiredCount: 10, name: "猿の数を増やす", flavor: "数の暴力こそ正義" },
    { id: "monkey_20", buildingId: 7, requiredCount: 20, name: "バナナ報酬システム", flavor: "モチベーションは腹から" },
    { id: "monkey_30", buildingId: 7, requiredCount: 30, name: "キーボード配列最適化", flavor: "猿用QWERTY配列" },
    { id: "monkey_50", buildingId: 7, requiredCount: 50, name: "統計的フィルタリング", flavor: "意味のある文字列だけを抽出" },
    { id: "monkey_100", buildingId: 7, requiredCount: 100, name: "進化の加速", flavor: "何世代も待てない" },
    { id: "monkey_150", buildingId: 7, requiredCount: 150, name: "猿言語の解読", flavor: "彼らには彼らの文法がある" },
    { id: "monkey_200", buildingId: 7, requiredCount: 200, name: "ボノボへのアップグレード", flavor: "より知性的な霊長類を投入" },
    { id: "monkey_300", buildingId: 7, requiredCount: 300, name: "確率収束エンジン", flavor: "無限を有限に圧縮する" },
    { id: "monkey_400", buildingId: 7, requiredCount: 400, name: "ボルヘスの図書館接続", flavor: "すべての本が置いてある場所" },
    { id: "monkey_500", buildingId: 7, requiredCount: 500, name: "無限の猿定理の証明", flavor: "定理が正しいなら、今この瞬間に完成する" },

    // 情報の広義積分
    { id: "integral_10", buildingId: 8, requiredCount: 10, name: "積分区間の拡大", flavor: "-∞から+∞まで" },
    { id: "integral_20", buildingId: 8, requiredCount: 20, name: "留数定理の応用", flavor: "複素平面を一周すれば答えが出る" },
    { id: "integral_30", buildingId: 8, requiredCount: 30, name: "ルベーグ積分への移行", flavor: "測度論で武装する" },
    { id: "integral_50", buildingId: 8, requiredCount: 50, name: "汎関数解析", flavor: "関数の関数を操る" },
    { id: "integral_100", buildingId: 8, requiredCount: 100, name: "無限級数の収束", flavor: "発散を制御して有限に" },
    { id: "integral_150", buildingId: 8, requiredCount: 150, name: "ゼータ関数正規化", flavor: "1+2+3+...=-1/12 って知ってた？" },
    { id: "integral_200", buildingId: 8, requiredCount: 200, name: "超準解析", flavor: "無限小と無限大を同時に扱う" },
    { id: "integral_300", buildingId: 8, requiredCount: 300, name: "ホログラフィック原理", flavor: "宇宙のデータは境界に書いてある" },
    { id: "integral_400", buildingId: 8, requiredCount: 400, name: "圏論的普遍性", flavor: "すべての構造を統一する" },
    { id: "integral_500", buildingId: 8, requiredCount: 500, name: "Ω点への到達", flavor: "宇宙の終わりに全情報が収束する" }
];

/**
 * 永続アップグレード（得で購入）のデータ
 */
const PRESTIGE_UPGRADES_DATA = [
    {
        id: "multithread_samsara",
        name: "マルチスレッド輪廻",
        description: "転生時の初期CpSが上昇する。",
        cost: 10,
        effect: {
            type: "initial_cps_multiplier",
            value: 2
        }
    },
    {
        id: "serverless_nirvana",
        name: "サーバーレス涅槃",
        description: "オフライン時の生産効率が100%になる。最大72時間分。",
        cost: 50,
        effect: {
            type: "offline_efficiency",
            value: 1.0
        }
    },
    {
        id: "shiki_soku_ze_kuu",
        name: "圧縮アルゴリズム「色即是空」",
        description: "施設の価格上昇率が緩和される（1.15倍 → 1.14倍）。",
        cost: 100,
        effect: {
            type: "cost_scaling_reduction",
            value: 1.14
        }
    }
];
