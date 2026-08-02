import { defineConfig } from 'vite';
import { templateCompilerOptions } from '@tresjs/core'
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        vue(
            {
                // Config for Tres.js
                ...templateCompilerOptions,
            }
        ),
    ],

    server: {
        host: '0.0.0.0',
        hmr: {
            host: 'localhost',
        },
        cors: true, // Разрешаем CORS-запросы
    },
});
