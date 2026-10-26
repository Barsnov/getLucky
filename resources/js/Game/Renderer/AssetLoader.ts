import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class AssetLoaderService {
    private loader = new GLTFLoader();
    private cache = new Map<string, Promise<THREE.Group>>();

    /**
     * Загружает GLTF-модель (с кэшированием) и возвращает её клон, готовый к добавлению в сцену.
     */
    public async loadModelClone(url: string, scale: [number, number, number] = [0.2, 0.2, 0.2]): Promise<THREE.Group> {
        if (!this.cache.has(url)) {
            const loadPromise = new Promise<THREE.Group>((resolve, reject) => {
                this.loader.load(
                    url,
                    (gltf) => {
                        resolve(gltf.scene);
                    },
                    undefined,
                    (error) => {
                        console.error(`Ошибка загрузки 3D-модели ${url}:`, error);
                        reject(error);
                    }
                );
            });
            this.cache.set(url, loadPromise);
        }

        const originalScene = await this.cache.get(url)!;
        const clone = originalScene.clone(true);
        clone.scale.set(scale[0], scale[1], scale[2]);

        clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });

        return clone;
    }
}

export const AssetLoader = new AssetLoaderService();
