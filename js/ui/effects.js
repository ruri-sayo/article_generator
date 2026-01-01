/* ============================================
   Article Generator - 記事落下エフェクト
   ============================================ */

/**
 * 記事落下エフェクトを管理するクラス（Canvas使用）
 */
class ArticleFallEffect {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.pileHeight = 0; // 積もった高さ
        this.maxPileRatio = 0.25; // 画面の最大1/4まで
        this.enabled = true;
        this.animationId = null;

        this.init();
    }

    /**
     * 初期化
     */
    init() {
        this.createCanvas();
        this.setupResizeHandler();
        this.startAnimation();
    }

    /**
     * Canvasを作成
     */
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'article-fall-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    /**
     * Canvasサイズを調整
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * リサイズハンドラ
     */
    setupResizeHandler() {
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * パーティクルを生成
     * @param {number} count 生成数
     */
    spawnParticles(count = 1) {
        if (!this.enabled) return;

        for (let i = 0; i < count; i++) {
            const particle = {
                x: Math.random() * this.canvas.width,
                y: -30,
                width: 20 + Math.random() * 15,
                height: 25 + Math.random() * 10,
                speed: 2 + Math.random() * 3,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                opacity: 0.8 + Math.random() * 0.2,
                color: this.getRandomColor(),
                settled: false
            };
            this.particles.push(particle);
        }
    }

    /**
     * ランダムな色を取得
     */
    getRandomColor() {
        const colors = [
            '#c5a059', // 黄金色
            '#e06377', // 蓮色
            '#4f46e5', // アクセント
            '#7c3aed', // 紫
            '#f0f0f0', // 白
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * アニメーションループを開始
     */
    startAnimation() {
        const animate = () => {
            if (!this.enabled) {
                this.animationId = requestAnimationFrame(animate);
                return;
            }

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // 積もった部分を描画
            if (this.pileHeight > 0) {
                this.drawPile();
            }

            // パーティクルを更新・描画
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];

                if (!p.settled) {
                    // 落下
                    p.y += p.speed;
                    p.rotation += p.rotationSpeed;

                    // 地面（または積もった上）に到達したか
                    const groundLevel = this.canvas.height - this.pileHeight;
                    if (p.y + p.height >= groundLevel) {
                        p.settled = true;
                        p.y = groundLevel - p.height;

                        // 積もりを増やす（上限あり）
                        const maxPile = this.canvas.height * this.maxPileRatio;
                        if (this.pileHeight < maxPile) {
                            this.pileHeight += 0.5;
                        }

                        // 一定時間後に消す
                        setTimeout(() => {
                            const idx = this.particles.indexOf(p);
                            if (idx > -1) {
                                this.particles.splice(idx, 1);
                            }
                        }, 3000 + Math.random() * 2000);
                    }
                }

                // 描画
                this.drawParticle(p);
            }

            this.animationId = requestAnimationFrame(animate);
        };

        this.animationId = requestAnimationFrame(animate);
    }

    /**
     * パーティクルを描画
     */
    drawParticle(p) {
        this.ctx.save();
        this.ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
        this.ctx.rotate(p.rotation);
        this.ctx.globalAlpha = p.opacity;

        // 紙のような形状
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);

        // 線で文字っぽく
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const lineY = -p.height / 2 + 5 + i * 7;
            const lineWidth = p.width * (0.5 + Math.random() * 0.4);
            this.ctx.beginPath();
            this.ctx.moveTo(-p.width / 2 + 3, lineY);
            this.ctx.lineTo(-p.width / 2 + 3 + lineWidth, lineY);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    /**
     * 積もった部分を描画
     */
    drawPile() {
        const gradient = this.ctx.createLinearGradient(
            0, this.canvas.height - this.pileHeight,
            0, this.canvas.height
        );
        gradient.addColorStop(0, 'rgba(240, 240, 240, 0.6)');
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0.8)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();

        // 波打った上端を作成
        this.ctx.moveTo(0, this.canvas.height);
        for (let x = 0; x <= this.canvas.width; x += 10) {
            const waveHeight = Math.sin(x * 0.05 + Date.now() * 0.001) * 5;
            this.ctx.lineTo(x, this.canvas.height - this.pileHeight + waveHeight);
        }
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * エフェクトの有効/無効を切り替え
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.particles = [];
            this.pileHeight = 0;
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }

    /**
     * 有効かどうか
     */
    isEnabled() {
        return this.enabled;
    }
}

// グローバルインスタンス
let articleFallEffect;
