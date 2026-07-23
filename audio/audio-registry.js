/* AdventureWedding — Audio Foundation registry
   Build v0.9.5

   Null values are intentional placeholders for future approved assets.
   The AudioManager treats them as missing assets and fails silently in play.
*/

const AUDIO_ASSETS = {
    bgm: {
        titleTheme: null,
        tokyoTheme: null,
        sydneyTheme: null,
        blueWorksTheme: null,
        longnanTheme: null,
        weddingTheme: null,
        creditsTheme: null
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
        pressStart: null,
        uiMove: null,
        uiConfirm: null,
        uiBack: null,
        dialogueTick: null,
        dialogueNext: null,
        interactionPrompt: null,
        albumOpen: null,
        albumClose: null,
        albumPage: null,
        memoryUnlock: null,
        chapterComplete: null,
        footstepStone: null,
        footstepGrass: null,
        footstepWood: null,
        footstepIndoor: null,
        tuotuoVoice: null,
        dazhiVoice: null
    }
};

const AUDIO_PRELOAD_GROUPS = {
    "core-ui": [
        ["sfx", "pressStart"],
        ["sfx", "uiConfirm"],
        ["sfx", "uiBack"],
        ["sfx", "dialogueTick"],
        ["sfx", "dialogueNext"]
    ],
    tokyo: [
        ["bgm", "tokyoTheme"],
        ["ambient", "tokyoStation"],
        ["ambient", "tokyoShrine"]
    ],
    sydney: [
        ["bgm", "sydneyTheme"],
        ["bgm", "blueWorksTheme"],
        ["ambient", "sydneyHarbour"],
        ["ambient", "colesStore"]
    ],
    longnan: [
        ["bgm", "longnanTheme"],
        ["ambient", "longnanTown"]
    ],
    wedding: [
        ["bgm", "weddingTheme"],
        ["ambient", "xiaoyuanGarden"]
    ]
};

window.AUDIO_ASSETS = AUDIO_ASSETS;
window.AUDIO_PRELOAD_GROUPS = AUDIO_PRELOAD_GROUPS;
