import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Howl } from 'howler';


export const useAudioStore = defineStore('audio', () => {
    // Состояние громкости
    const sfxVolume = ref(0.4);
    const bgmVolume = ref(0.1);

    // Справочник звуковых эффектов
    const sfx = {
        pointer: new Howl({ src: ['/sounds/HighHex.mp3'] }),
        attack: new Howl({ src: ['/sounds/Sword.wav'] }),
        whoosh: new Howl({ src: ['/sounds/WhooshCamera.mp3'] }),
        wrong: new Howl({ src: ['/sounds/Wrong.mp3'] }),
        whip: new Howl({ src: ['/sounds/WhooshChip.flac'] }),
        hexAction: new Howl({ src: ['/sounds/WhipChip.wav'] }),
        upgrade: new Howl({ src: ['/sounds/Upgrade.wav'] }),
        shield: new Howl({ src: ['/sounds/Shield.wav'] }),
    };

    // Фоновая музыка
    const playlist = [
        '/sounds/Sneaky-Snitch.mp3',
        '/sounds/Monkeys.mp3',
        '/sounds/Fluffing-a-Duck.mp3',
        '/sounds/Elevator-music.mp3',
    ];
    
    const currentIndex = ref(0);
    const currentBgm = ref<Howl | null>(null);
    const fadeInterval = ref<ReturnType<typeof setInterval> | null>(null);

    
    // --- ACTIONS ---

    // Воспроизведение эффекта
    const playSfx = (name: keyof typeof sfx) => {
        const sound = sfx[name];
        if (sound) {
            sound.volume(sfxVolume.value);
            sound.play();
        }
    };

    const clearFade = () => {
        if (fadeInterval.value) {
            clearInterval(fadeInterval.value);
            fadeInterval.value = null;
        }
    };

    // Управление плейлистом
    const playBgm = () => {
        clearFade();
        if (currentBgm.value) currentBgm.value.unload();

        currentBgm.value = new Howl({
            src: [playlist[currentIndex.value]],
            volume: bgmVolume.value,
            onend: () => {
                currentIndex.value = (currentIndex.value + 1) % playlist.length;
                playBgm();
            },
        });
        currentBgm.value.play();
    };

    // Фоновая музыка стартового экрана (с плавным изменением громкости)
    const playWelcomeBgm = () => {
        clearFade();
        if (currentBgm.value) currentBgm.value.unload();

        let vol = 0.02;
        currentBgm.value = new Howl({
            src: ['/sounds/Elevator-music.mp3'],
            volume: vol,
            loop: true,
        });
        currentBgm.value.play();

        fadeInterval.value = setInterval(() => {
            if (vol < 0.2 && currentBgm.value) {
                vol = Math.min(0.2, +(vol + 0.01).toFixed(2));
                currentBgm.value.volume(vol);
            } else {
                clearFade();
            }
        }, 500);
    };

    const fadeWelcomeBgm = (targetVolume = 0.02, stepMs = 1000) => {
        clearFade();
        if (!currentBgm.value) return;

        let vol = currentBgm.value.volume();
        fadeInterval.value = setInterval(() => {
            if (vol > targetVolume && currentBgm.value) {
                vol = Math.max(targetVolume, +(vol - 0.01).toFixed(2));
                currentBgm.value.volume(vol);
            } else {
                clearFade();
            }
        }, stepMs);
    };

    const stopBgm = () => {
        clearFade();
        if (currentBgm.value) {
            currentBgm.value.stop();
            currentBgm.value.unload();
            currentBgm.value = null;
        }
    };

    return { 
        sfxVolume, 
        bgmVolume, 
        playSfx, 
        playBgm, 
        playWelcomeBgm,
        fadeWelcomeBgm,
        stopBgm 
    };
});