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

    
    // --- ACTIONS ---

    // Воспроизведение эффекта
    const playSfx = (name: keyof typeof sfx) => {
        const sound = sfx[name];
        if (sound) {
            sound.volume(sfxVolume.value);
            sound.play();
        }
    };

    // Управление плейлистом
    const playBgm = () => {
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

    const stopBgm = () => {
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
        stopBgm 
    };
});