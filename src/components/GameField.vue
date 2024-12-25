<template>
    <div class="game-container" @mousemove="updateTargetPosition" ref="gameField">
        <canvas ref="canvas" />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue';
    import { usePlayerStore } from './stores/player';

    // Состояние
    const playerStore = usePlayerStore();
    const canvas = ref<HTMLCanvasElement | null>(null);
    const ctx = ref<CanvasRenderingContext2D | null>(null);
    const playerSize = 30; // Размер игрока

    // Переменные для целевой точки
    const targetX = ref(playerStore.x);
    const targetY = ref(playerStore.y);

    // Скорость движения
    const speed = 3; // Чем больше, тем быстрее

    // Обновляем размеры Canvas
    const updateCanvasSize = () => {
        if (canvas.value) {
            const container = canvas.value.parentElement as HTMLElement;
            canvas.value.width = container.offsetWidth;
            canvas.value.height = container.offsetHeight;
            drawPlayer(); // Перерисовать игрока после изменения размеров
        }
    };

    // Рисуем игрока
    const drawPlayer = () => {
        if (ctx.value && canvas.value) {
            const { x, y } = playerStore;
            ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height); // Очистка поля
            ctx.value.fillStyle = '#3498db'; // Цвет игрока
            ctx.value.fillRect(x, y, playerSize, playerSize); // Рисуем игрока
        }
    };

    // Обновляем целевую позицию на основе положения мыши
    const updateTargetPosition = (event: MouseEvent) => {
        if (canvas.value) {
            const rect = canvas.value.getBoundingClientRect();
            targetX.value = event.clientX - rect.left - playerSize / 2;
            targetY.value = event.clientY - rect.top - playerSize / 2;
        }
    };

    // Постоянное движение игрока к цели
    const moveTowardsTarget = () => {
        const dx = targetX.value - playerStore.x;
        const dy = targetY.value - playerStore.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > speed) {
            // Вычисляем шаг
            const stepX = (dx / distance) * speed;
            const stepY = (dy / distance) * speed;
            playerStore.move(stepX, stepY);
        }

        drawPlayer();
        requestAnimationFrame(moveTowardsTarget); // Постоянное обновление
    };

    // Инициализация
    onMounted(() => {
        if (canvas.value) {
            ctx.value = canvas.value.getContext('2d');
            updateCanvasSize(); // Устанавливаем размер при загрузке
            moveTowardsTarget(); // Запускаем движение
        }

        // Слушаем изменения размера окна
        window.addEventListener('resize', updateCanvasSize);
    });

    // Очистка
    onUnmounted(() => {
        window.removeEventListener('resize', updateCanvasSize);
    });
</script>

<style scoped>
    .game-container {
        position: relative;
        width: 100vw; /* Занимаем всю ширину окна */
        height: 100vh; /* Занимаем всю высоту окна */
        overflow: hidden;
    }

    canvas {
        display: block; /* Убираем ненужные отступы */
    }
</style>
