import { defineStore } from 'pinia';
import { usePlayerStore } from '@/components/stores/player.ts';

type Enemy = {
    id: number;
    x: number;
    y: number;
    radius: number;
    speed: number;
};

export const useEnemyStore = defineStore('enemy', {
    state: () => ({
        enemies: [] as Enemy[],
        nextId: 1,
        playerStore: usePlayerStore(),
    }),

    actions: {
        // Спавн врага
        spawnEnemy() {
            const edge = Math.floor(Math.random() * 4); // Случайный край экрана
            let x = 0;
            let y = 0;
            const radius = 20;

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
                id: this.nextId++,
                x,
                y,
                radius,
                speed: this.playerStore.speed * 0.5, // Скорость врага
            });
        },

        // Движение врагов к игроку
        updateEnemyPositions(playerX: number, playerY: number) {
            this.enemies.forEach((enemy) => {
                const dx = playerX - enemy.x;
                const dy = playerY - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > enemy.speed) {
                    enemy.x += (dx / distance) * enemy.speed;
                    enemy.y += (dy / distance) * enemy.speed;
                }
            });
        },
    },
});
