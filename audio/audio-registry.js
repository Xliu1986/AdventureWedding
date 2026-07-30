/* AdventureWedding — Audio asset registry
   RC2.1 Original Soundtrack — Mobile Integration

   Chapter BGM assets are original handmade JRPG-style loops. SFX remain
   registered for future use, but playback is currently disabled by AudioManager.
*/

const BGM_BASE = "assets/audio/bgm/";
const SFX_BASE = "assets/audio/sfx/";
const VOICE_BASE = `${SFX_BASE}voices/`;
const numberedSFX = (prefix, count) => Array.from(
    { length: count },
    (_, index) => `${SFX_BASE}${prefix}-${index + 1}.wav`
);
const numberedVoiceSFX = (prefix, count) => Array.from(
    { length: count },
    (_, index) => `${VOICE_BASE}${prefix}-${String(index + 1).padStart(2, "0")}.wav`
);

const AUDIO_ASSETS = {
    bgm: {
        titleTheme: `${BGM_BASE}adventurewedding-main.ogg`,
        mainTheme: `${BGM_BASE}adventurewedding-main.ogg`,
        tokyoTheme: `${BGM_BASE}tokyo-spring.ogg`,
        sydneyTheme: `${BGM_BASE}sydney-together.ogg`,
        blueWorksTheme: `${BGM_BASE}sydney-together.ogg`,
        longnanTheme: `${BGM_BASE}longnan-homecoming.ogg`,
        weddingTheme: `${BGM_BASE}xiaoyuan-wedding.ogg`,
        xiaoyuanTheme: `${BGM_BASE}xiaoyuan-wedding.ogg`,
        creditsTheme: `${BGM_BASE}tokyo-to-forever.ogg`
    },

    ambient: {
        tokyoStation: null,
        tokyoShrine: null,
        sydneyHarbour: null,
        colesStore: null,
        longnanTown: null,
        xiaoyuanGarden: null
    },

    sfx: {
        pressStart: `${SFX_BASE}press-start.wav`,
        uiMove: `${SFX_BASE}ui-move.wav`,
        uiConfirm: `${SFX_BASE}ui-confirm.wav`,
        uiBack: `${SFX_BASE}ui-back.wav`,
        menuOpen: `${SFX_BASE}menu-open.wav`,
        menuClose: `${SFX_BASE}menu-close.wav`,
        dialogueNext: `${SFX_BASE}dialogue-next.wav`,
        moriVoice: `${SFX_BASE}mori-voice.wav`,
        leleVoice: `${SFX_BASE}lele-voice.wav`,
        tuotuoVoice: numberedVoiceSFX("tuotuo", 5),
        dazhiVoice: numberedVoiceSFX("dazhi", 5),
        interactionPrompt: `${SFX_BASE}interaction.wav`,
        objectInspect: `${SFX_BASE}object-inspect.wav`,
        npcInteraction: `${SFX_BASE}npc-interaction.wav`,
        albumOpen: `${SFX_BASE}album-open.wav`,
        albumClose: `${SFX_BASE}album-close.wav`,
        albumPage: `${SFX_BASE}album-page.wav`,
        photoAdded: `${SFX_BASE}photo-added.wav`,
        memoryUnlock: `${SFX_BASE}memory-unlock.wav`,
        chapterComplete: `${SFX_BASE}chapter-complete.wav`,
        cgFadeIn: `${SFX_BASE}cg-fade-in.wav`,
        cgFadeOut: `${SFX_BASE}cg-fade-out.wav`,
        doorWood: `${SFX_BASE}door-wood.wav`,
        bridgeCreak: `${SFX_BASE}bridge-creak.wav`,
        flowerRustle: `${SFX_BASE}flower-rustle.wav`,
        shrineWindBell: `${SFX_BASE}shrine-wind-bell.wav`,
        riverTouch: `${SFX_BASE}river-touch.wav`,
        blueWorksVinyl: `${SFX_BASE}blueworks-vinyl.wav`,
        // Footstep audio was intentionally removed in v0.9.6.2.
    }
};

const BGM_TRACKS = {
    mainTheme: {
        id: "mainTheme",
        title: "AdventureWedding Main Theme",
        src: `${BGM_BASE}adventurewedding-main.ogg`,
        loop: true,
        loopStartSeconds: 0,
        loopEndSeconds: 146.666667,
        defaultVolume: 0.60,
        tempo: 72,
        key: "G major"
    },
    tokyoTheme: {
        id: "tokyoTheme",
        title: "Tokyo Spring",
        src: `${BGM_BASE}tokyo-spring.ogg`,
        loop: true,
        loopStartSeconds: 0,
        loopEndSeconds: 174.545437,
        defaultVolume: 0.58,
        tempo: 88,
        key: "D major"
    },
    sydneyTheme: {
        id: "sydneyTheme",
        title: "Sydney Together",
        src: `${BGM_BASE}sydney-together.ogg`,
        loop: true,
        loopStartSeconds: 0,
        loopEndSeconds: 204,
        defaultVolume: 0.56,
        tempo: 84,
        key: "A major"
    },
    longnanTheme: {
        id: "longnanTheme",
        title: "Longnan Homecoming",
        src: `${BGM_BASE}longnan-homecoming.ogg`,
        loop: true,
        loopStartSeconds: 0,
        loopEndSeconds: 197.647042,
        defaultVolume: 0.57,
        tempo: 68,
        key: "C major"
    },
    xiaoyuanTheme: {
        id: "xiaoyuanTheme",
        title: "Xiaoyuan Wedding",
        src: `${BGM_BASE}xiaoyuan-wedding.ogg`,
        loop: true,
        loopStartSeconds: 0,
        loopEndSeconds: 180,
        defaultVolume: 0.55,
        tempo: 76,
        key: "F major"
    },
    creditsTheme: {
        id: "creditsTheme",
        title: "Tokyo to Forever",
        src: `${BGM_BASE}tokyo-to-forever.ogg`,
        loop: false,
        defaultVolume: 0.58,
        tempo: 70,
        key: "G major"
    }
};

const BGM_ASSETS = {
    ...BGM_TRACKS,
    titleTheme: BGM_TRACKS.mainTheme,
    blueWorksTheme: BGM_TRACKS.sydneyTheme,
    weddingTheme: BGM_TRACKS.xiaoyuanTheme
};

const AUDIO_PRELOAD_GROUPS = {
    "core-ui": [
        ["sfx", "pressStart"],
        ["sfx", "uiConfirm"],
        ["sfx", "uiBack"],
        ["sfx", "menuOpen"],
        ["sfx", "menuClose"],
        ["sfx", "dialogueNext"],
        ["sfx", "interactionPrompt"],
        ["sfx", "objectInspect"],
        ["sfx", "albumOpen"],
        ["sfx", "albumPage"],
        ["sfx", "albumClose"]
    ],
    tokyo: [
        ["bgm", "tokyoTheme"],
        ["ambient", "tokyoStation"],
        ["ambient", "tokyoShrine"],
        ["sfx", "flowerRustle"],
        ["sfx", "shrineWindBell"]
    ],
    sydney: [
        ["bgm", "sydneyTheme"],
        ["bgm", "blueWorksTheme"],
        ["ambient", "sydneyHarbour"],
        ["ambient", "colesStore"],
        ["sfx", "blueWorksVinyl"]
    ],
    longnan: [
        ["bgm", "longnanTheme"],
        ["ambient", "longnanTown"],
        ["sfx", "riverTouch"]
    ],
    wedding: [
        ["bgm", "weddingTheme"],
        ["ambient", "xiaoyuanGarden"],
        ["sfx", "chapterComplete"]
    ]
};

window.AUDIO_ASSETS = AUDIO_ASSETS;
window.BGM_TRACKS = BGM_TRACKS;
window.BGM_ASSETS = BGM_ASSETS;
window.AUDIO_PRELOAD_GROUPS = AUDIO_PRELOAD_GROUPS;
