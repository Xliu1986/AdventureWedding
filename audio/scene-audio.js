/* AdventureWedding — central scene music routing
   RC2.2 Wedding Music Edition
*/

const SCENE_AUDIO = {
    title: {
        bgm: null,
        ambient: null,
        fadeOutMs: 0
    },

    prologue: {
        bgm: null,
        ambient: null,
        fadeOutMs: 0
    },

    chapterTransition: {
        bgm: "tokyo",
        preload: "tokyo"
    },

    chapterIntro: {
        bgm: null,
        ambient: null,
        fadeOutMs: 0
    },

    chapterEnding: {
        bgm: null,
        ambient: null,
        fadeOutMs: 2400
    },

    tokyo: {
        bgm: "tokyo",
        preload: "tokyo"
    },

    tokyoStationCutscene: {
        bgm: "tokyo",
        preload: "tokyo"
    },

    sydneyLookout: {
        bgm: "sydney",
        preload: "sydney"
    },

    sydney: {
        bgm: "sydney",
        preload: "sydney"
    },

    transitionToColes: {
        bgm: "sydney",
        preload: "sydney"
    },

    transitionToSydney: {
        bgm: "sydney",
        preload: "sydney"
    },

    coles: {
        bgm: "sydney",
        preload: "sydney"
    },

    sydneyMemory: {
        bgm: "sydney",
        preload: "sydney"
    },

    sydneyAirport: {
        bgm: "sydney",
        preload: "sydney"
    },

    longnanTitle: {
        bgm: "longnan",
        preload: "longnan"
    },

    longnanIntro: {
        bgm: "longnan",
        preload: "longnan"
    },

    longnanLookout: {
        bgm: "longnan",
        preload: "longnan"
    },

    longnanTown: {
        bgm: "longnan",
        preload: "longnan"
    },

    longnanMemoryAlbum: {
        bgm: "longnan",
        preload: "longnan"
    },

    longnanCG: {
        bgm: "longnan",
        preload: "longnan"
    },

    longnanComplete: {
        bgm: "longnan",
        preload: "longnan"
    },

    weddingIntro: {
        bgm: "wedding",
        preload: "wedding"
    },

    weddingXiaoyuan: {
        bgm: "wedding",
        preload: "wedding"
    },

    weddingGatewayDialogue: {
        bgm: "wedding",
        preload: "wedding"
    },

    weddingGatewayCutscene: {
        bgm: "wedding",
        preload: "wedding"
    },

    weddingWhiteTransition: {
        bgm: "wedding",
        preload: "wedding"
    },

    weddingInvitation: {
        bgm: "wedding",
        preload: "wedding"
    },

    weddingContinuation: {
        bgm: "wedding",
        preload: "wedding"
    },

    finalEnding: {
        bgm: null,
        ambient: null,
        fadeOutMs: 2000
    }
};

const MEMORY_AUDIO_OVERRIDES = {};

window.SCENE_AUDIO = SCENE_AUDIO;
window.MEMORY_AUDIO_OVERRIDES = MEMORY_AUDIO_OVERRIDES;
