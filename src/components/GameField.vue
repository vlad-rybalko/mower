<template>
    <div class="canvas-container">
        <canvas ref="canvas" @mousemove="updateTargetPosition" />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue';
    import { usePlayerStore } from './stores/player';
    import { useEnemyStore } from './stores/enemyStore';

    // Импорт изображений
    import playerImageSrc from '../assets/player.png';
    import enemyImage1 from '../assets/enemy1.png';
    import enemyImage2 from '../assets/enemy2.png';
    import enemyImage3 from '../assets/enemy3.png';
    import enemyImage4 from '../assets/enemy4.png';
    import enemyImage5 from '../assets/enemy5.png';
    import enemyImage6 from '../assets/enemy6.png';
    import enemyImage7 from '../assets/enemy7.png';

    const canvas = ref<HTMLCanvasElement | null>(null);
    const ctx = ref<CanvasRenderingContext2D | null>(null);
    const playerStore = usePlayerStore();
    const enemyStore = useEnemyStore();

    // Целевая позиция игрока
    const targetPosition = ref({ x: playerStore.x, y: playerStore.y });

    // Загрузка изображения игрока
    const playerImage = new Image();
    playerImage.src = playerImageSrc;

    // Загрузка изображений врагов
    const enemyImages = [
        enemyImage1,
        enemyImage2,
        enemyImage3,
        enemyImage4,
        enemyImage5,
        enemyImage6,
        enemyImage7,
    ].map((src) => {
        const img = new Image();
        img.src = src;
        return img;
    });

    // Рисуем игрока
    const drawPlayer = () => {
        if (ctx.value && playerImage.complete) {
            ctx.value.drawImage(playerImage, playerStore.x - 20, playerStore.y - 20, 70, 70); // Размер изображения 40x40
        }
    };

    // Рисуем врагов
    const drawEnemies = () => {
        if (ctx.value) {
            enemyStore.enemies.forEach((enemy) => {
                if (enemy.image && enemy.image.complete) {
                    ctx.value.drawImage(
                        enemy.image,
                        enemy.x - enemy.radius,
                        enemy.y - enemy.radius,
                        enemy.radius * 2,
                        enemy.radius * 2,
                    );
                }
            });
        }
    };

    // Перемещение игрока к цели
    const movePlayerTowardsTarget = () => {
        const dx = targetPosition.value.x - playerStore.x;
        const dy = targetPosition.value.y - playerStore.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const step = Math.min(playerStore.speed, distance);
            playerStore.move((dx / distance) * step, (dy / distance) * step);
        }
    };

    // Метод для обновления целевой позиции игрока при движении мыши
    const updateTargetPosition = (event: MouseEvent) => {
        if (canvas.value) {
            const rect = canvas.value.getBoundingClientRect();
            targetPosition.value.x = event.clientX - rect.left;
            targetPosition.value.y = event.clientY - rect.top;
        }
    };

    // Проверяем столкновение врагов с игроком
    const checkCollisions = () => {
        enemyStore.enemies.forEach((enemy) => {
            const dx = playerStore.x - enemy.x;
            const dy = playerStore.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= enemy.radius + 20) {
                // Радиус игрока + радиус врага
                playerStore.takeDamage(10); // Уменьшаем здоровье игрока
                enemyStore.removeEnemy(enemy.id); // Удаляем врага при столкновении
            }
        });
    };

    // Обработка атаки игрока
    const handleAttack = (event: KeyboardEvent) => {
        if (event.code === 'Space') {
            if (playerStore.currentWeapon === 'katana') {
                enemyStore.enemies = enemyStore.enemies.filter((enemy) => {
                    const dx = playerStore.x - enemy.x;
                    const dy = playerStore.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Убиваем врагов в радиусе 50
                    return distance > 150;
                });
            }
        }
    };

    // Обновление Canvas
    const updateCanvas = () => {
        if (ctx.value && canvas.value) {
            ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

            // Рисуем игрока
            drawPlayer();

            // Рисуем врагов
            drawEnemies();

            // Проверяем столкновения
            checkCollisions();
        }

        requestAnimationFrame(updateCanvas);
    };

    // Обновление размеров Canvas при изменении окна
    const resizeCanvas = () => {
        if (canvas.value) {
            canvas.value.width = window.innerWidth;
            canvas.value.height = window.innerHeight;
        }
    };

    onMounted(() => {
        if (canvas.value) {
            canvas.value.width = window.innerWidth;
            canvas.value.height = window.innerHeight;
            ctx.value = canvas.value.getContext('2d');

            // Спавн врагов каждые 3 секунды
            setInterval(() => {
                const randomImage = enemyImages[Math.floor(Math.random() * enemyImages.length)];
                enemyStore.spawnEnemy(randomImage); // Передаём случайное изображение
            }, 3000);

            // Обновляем позиции врагов каждые 16 мс
            setInterval(() => {
                enemyStore.updateEnemyPositions(playerStore.x, playerStore.y);
            }, 16);

            // Двигаем игрока к цели каждые 16 мс
            setInterval(() => {
                movePlayerTowardsTarget();
            }, 16);

            // Запускаем рендеринг
            updateCanvas();
        }

        // Слушаем нажатие клавиши пробел на объекте window
        window.addEventListener('keydown', handleAttack);
        window.addEventListener('resize', resizeCanvas);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleAttack);
        window.removeEventListener('resize', resizeCanvas);
    });
</script>

<style scoped>
    .canvas-container {
        width: 100vw;
        height: 100vh;
        position: relative;
        overflow: hidden;
        background: url('../meadow-horse-grass-lug-loshad.jpg') no-repeat center center;
        background-size: cover;
    }

    canvas {
        display: block;
    }
</style>
