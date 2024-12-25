<template>
    <div class="canvas-container" @mousemove="updateTargetPosition">
        <canvas ref="canvas" />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue';
    import { usePlayerStore } from './stores/player';
    import { useEnemyStore } from './stores/enemyStore';

    const canvas = ref<HTMLCanvasElement | null>(null);
    const ctx = ref<CanvasRenderingContext2D | null>(null);
    const playerStore = usePlayerStore();
    const enemyStore = useEnemyStore();

    // Целевая позиция игрока
    const targetPosition = ref({ x: playerStore.x, y: playerStore.y });

    // Рисуем игрока
    const drawPlayer = () => {
        if (ctx.value) {
            ctx.value.beginPath();
            ctx.value.arc(playerStore.x, playerStore.y, 20, 0, Math.PI * 2);
            ctx.value.fillStyle = 'blue';
            ctx.value.fill();
            ctx.value.closePath();
        }
    };

    // Рисуем врагов
    const drawEnemies = () => {
        if (ctx.value) {
            enemyStore.enemies.forEach((enemy) => {
                ctx.value.beginPath();
                ctx.value.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
                ctx.value.fillStyle = 'red';
                ctx.value.fill();
                ctx.value.closePath();
            });
        }
    };

    // Перемещение игрока к цели
    const movePlayerTowardsTarget = () => {
        // console.log('movePlayerTowardsTarget');
        const dx = targetPosition.value.x - playerStore.x;
        const dy = targetPosition.value.y - playerStore.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > playerStore.speed) {
            playerStore.move(
                (dx / distance) * playerStore.speed,
                (dy / distance) * playerStore.speed,
            );
        }
    };

    // Метод для обновления целевой позиции игрока при движении мыши
    const updateTargetPosition = (event: MouseEvent) => {
        const rect = canvas.value.getBoundingClientRect();
        targetPosition.value.x = event.clientX - rect.left;
        targetPosition.value.y = event.clientY - rect.top;
    };

    // Обновление Canvas
    const updateCanvas = () => {
        if (ctx.value && canvas.value) {
            ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

            // Рисуем игрока
            drawPlayer();

            // Рисуем врагов
            drawEnemies();
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
                enemyStore.spawnEnemy();
            }, 3000);

            // Обновляем позиции врагов каждые 100 мс
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

        window.addEventListener('resize', resizeCanvas);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', resizeCanvas);
    });
</script>

<style scoped>
    .canvas-container {
        width: 100vw;
        height: 100vh;
        position: relative;
        overflow: hidden;
    }

    canvas {
        display: block;
        background-color: #f0f0f0;
    }
</style>
