/* AdventureWedding — central scene audio routing
   Build v0.9.5
*/

const SCENE_AUDIO = {
    title: {
        bgm: "titleTheme",
        ambient: null,
        preload: "core-ui"
    },

    prologue: {
        bgm: "titleTheme",
        ambient: null,
        preload: "core-ui"
    },

    tokyo: {
        bgm: "tokyoTheme",
        ambient: "tokyoStation",
        preload: "tokyo"
    },

    tokyoStationCutscene: {
        bgm: "tokyoTheme",
        ambient: "tokyoStation",
        preload: "tokyo"
    },

    chapterTransition: {
        bgm: null,
        ambient: null
    },

    sydneyLookout: {
        bgm: "sydneyTheme",
        ambient: "sydneyHarbour",
        preload: "sydney"
    },

    sydney: {
        bgm: "sydneyTheme",
        ambient: "sydneyHarbour",
        preload: "sydney"
    },

    transitionToColes: {
        bgm: "sydneyTheme",
        ambient: null,
        preload: "sydney"
    },

    transitionToSydney: {
        bgm: "sydneyTheme",
        ambient: null,
        preload: "sydney"
    },

    coles: {
        bgm: "sydneyTheme",
        ambient: "colesStore",
        preload: "sydney"
    },

    sydneyMemory: {
        bgm: "sydneyTheme",
        ambient: null,
        preload: "sydney"
    },

    sydneyAirport: {
        bgm: "sydneyTheme",
        ambient: null,
        preload: "sydney"
    },

    longnanTitle: {
        bgm: "longnanTheme",
        ambient: null,
        preload: "longnan"
    },

    longnanIntro: {
        bgm: "longnanTheme",
        ambient: null,
        preload: "longnan"
    },

    longnanLookout: {
        bgm: "longnanTheme",
        ambient: "longnanTown",
        preload: "longnan"
    },

    longnanTown: {
        bgm: "longnanTheme",
        ambient: "longnanTown",
        preload: "longnan"
    },

    longnanMemoryAlbum: {
        bgm: "longnanTheme",
        ambient: null,
        preload: "longnan"
    },

    longnanCG: {
        bgm: "longnanTheme",
        ambient: null,
        preload: "longnan"
    },

    longnanComplete: {
        bgm: "longnanTheme",
        ambient: null,
        preload: "longnan"
    },

    weddingIntro: {
        bgm: "weddingTheme",
        ambient: null,
        preload: "wedding"
    },

    weddingXiaoyuan: {
        bgm: "weddingTheme",
        ambient: "xiaoyuanGarden",
        preload: "wedding"
    },

    weddingGatewayDialogue: {
        bgm: "weddingTheme",
        ambient: "xiaoyuanGarden",
        preload: "wedding"
    },

    weddingGatewayCutscene: {
        bgm: "weddingTheme",
        ambient: "xiaoyuanGarden",
        preload: "wedding"
    },

    weddingWhiteTransition: {
        bgm: "weddingTheme",
        ambient: null,
        preload: "wedding"
    },

    weddingInvitation: {
        bgm: "weddingTheme",
        ambient: null,
        preload: "wedding"
    },

    weddingContinuation: {
        bgm: "weddingTheme",
        ambient: null,
        preload: "wedding"
    },

    chapterIntro: {
        preserve: true
    },

    chapterEnding: {
        preserve: true
    },

    finalEnding: {
        bgm: "creditsTheme",
        ambient: null
    }
};

const MEMORY_AUDIO_OVERRIDES = {
    blueWorksMemory: "blueWorksTheme"
};

window.SCENE_AUDIO = SCENE_AUDIO;
window.MEMORY_AUDIO_OVERRIDES = MEMORY_AUDIO_OVERRIDES;
