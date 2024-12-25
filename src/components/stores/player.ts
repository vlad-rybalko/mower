import { defineStore } from 'pinia';

// Тип для оружия
type Weapon = {
    damage: number;
    range: number;
};

export const usePlayerStore = defineStore('player', {
    state: () => ({
        // Координаты игрока
        x: 50,
        y: 50,

        // Параметры здоровья
        maxHealth: 100, // Максимальное здоровье
        currentHealth: 100, // Текущее здоровье

        // Оружие
        weapons: {
            katana: { damage: 20, range: 50 } as Weapon, // Катана
            flamethrower: { damage: 10, range: 150 } as Weapon, // Огнемёт
        },

        // Текущее оружие: строгое указание возможных значений
        currentWeapon: 'katana' as keyof (typeof usePlayerStore)['state']['weapons'],
    }),

    actions: {
        // Перемещение игрока
        move(dx: number, dy: number) {
            this.x += dx;
            this.y += dy;
        },

        // Уменьшение здоровья
        takeDamage(amount: number) {
            this.currentHealth -= amount;
            if (this.currentHealth < 0) this.currentHealth = 0;
        },

        // Пополнение здоровья
        heal(amount: number) {
            this.currentHealth += amount;
            if (this.currentHealth > this.maxHealth) this.currentHealth = this.maxHealth;
        },

        // Смена оружия
        switchWeapon(weapon: keyof typeof this.weapons) {
            this.currentWeapon = weapon;
        },

        // Получение урона текущего оружия
        getCurrentWeaponDamage(): number {
            return this.weapons[this.currentWeapon].damage;
        },

        // Получение радиуса текущего оружия
        getCurrentWeaponRange(): number {
            return this.weapons[this.currentWeapon].range;
        },
    },
});
