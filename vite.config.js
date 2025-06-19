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
                // Other config
                ...templateCompilerOptions,
            }
        ),
    ],

    server: {
        host: '0.0.0.0',  // Достcуп с сети
        port: 8001,       // Порт для Vite
        strictPort: true,
        hmr: {
            host: '192.168.100.28', // ipconfig
        }
    }
});
