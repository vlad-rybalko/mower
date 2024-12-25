import { defineStore } from 'pinia';
import { usePlayerStore } from '@/components/stores/player.ts';

type Enemy = {
    id: number;
    x: number;
    y: number;
    radius: number;
    speed: number;
    image: HTMLImageElement;
};

export const useEnemyStore = defineStore('enemy', {
    state: () => ({
        enemies: [] as Enemy[],
        nextId: 1,
        playerStore: usePlayerStore(),
    }),

    actions: {
        // Спавн врага
        spawnEnemy(image: HTMLImageElement) {
            const edge = Math.floor(Math.random() * 4); // Случайный край экрана
            let x = 0;
            let y = 0;
            const radius = Math.floor(Math.random() * (60 - 30 + 1)) + 30;

            switch (edge) {
                case 0: // Верх
                    x = Math.random() * window.innerWidth;
                    y = 0;
                    break;
                case 1: // Низ
                    x = Math.random() * window.innerWidth;
                    y = window.innerHeight;
                    break;
                case 2: // Лево
                    x = 0;
                    y = Math.random() * window.innerHeight;
                    break;
                case 3: // Право
                    x = window.innerWidth;
                    y = Math.random() * window.innerHeight;
                    break;
            }

            this.enemies.push({
                id: this.nextId++, // Уникальный ID
                x,
                y,
                radius,
                speed: this.playerStore.speed * 0.5, // Скорость врага
                image,
            });
        },

        // Движение врагов
        updateEnemyPositions(playerX: number, playerY: number) {
            this.enemies.forEach((enemy) => {
                // Если у врага ещё нет направления, задаём его случайным образом
                if (!enemy.currentDirection) {
                    enemy.currentDirection = Math.random() * 2 * Math.PI; // случайный угол (направление)
                    enemy.lastDirectionChange = Date.now(); // запоминаем время изменения направления
                }

                // Проверяем, нужно ли убегать
                const dx = playerX - enemy.x;
                const dy = playerY - enemy.y;
                const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

                if (distanceToPlayer <= 300) {
                    // Если игрок в радиусе убегания, враги бегут от него
                    const escapeDx = enemy.x - playerX;
                    const escapeDy = enemy.y - playerY;
                    const escapeDistance = Math.sqrt(escapeDx * escapeDx + escapeDy * escapeDy);

                    if (escapeDistance > enemy.speed) {
                        enemy.x += (escapeDx / escapeDistance) * enemy.speed;
                        enemy.y += (escapeDy / escapeDistance) * enemy.speed;
                    }
                } else {
                    // Если игрок вне радиуса, враги двигаются в выбранном направлении
                    const randomSpeed = enemy.speed;
                    enemy.x += Math.cos(enemy.currentDirection) * randomSpeed;
                    enemy.y += Math.sin(enemy.currentDirection) * randomSpeed;
                }

                // Проверяем, нужно ли обновить направление
                const now = Date.now();
                if (now - enemy.lastDirectionChange > Math.random() * 2000 + 1000) {
                    // от 2 до 5 секунд
                    enemy.currentDirection = Math.random() * 2 * Math.PI; // новое случайное направление
                    enemy.lastDirectionChange = now; // обновляем время изменения направления
                }

                // Ограничиваем движение врагов границами карты
                if (enemy.x < 0) enemy.x = 0;
                if (enemy.x > window.innerWidth) enemy.x = window.innerWidth;
                if (enemy.y < 0) enemy.y = 0;
                if (enemy.y > window.innerHeight) enemy.y = window.innerHeight;
            });
        },

        removeEnemy(id: number) {
            this.enemies = this.enemies.filter((enemy) => enemy.id !== id);
        },
    },
});
