/* AdventureWedding — Core Sound Effects registry
   Build v0.9.6

   BGM and ambient values remain intentionally empty until approved music and
   ambience arrive. Core SFX are tiny original handmade placeholder WAVs.
*/

const SFX_BASE = "assets/audio/sfx/";
const numberedSFX = (prefix, count) => Array.from(
    { length: count },
    (_, index) => `${SFX_BASE}${prefix}-${index + 1}.wav`
);

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
        pressStart: `${SFX_BASE}press-start.wav`,
        uiMove: `${SFX_BASE}ui-move.wav`,
        uiConfirm: `${SFX_BASE}ui-confirm.wav`,
        uiBack: `${SFX_BASE}ui-back.wav`,
        menuOpen: `${SFX_BASE}menu-open.wav`,
        menuClose: `${SFX_BASE}menu-close.wav`,
        dialogueTick: `${SFX_BASE}dialogue-tick.wav`,
        dialogueNext: `${SFX_BASE}dialogue-next.wav`,
        moriVoice: `${SFX_BASE}mori-voice.wav`,
        leleVoice: `${SFX_BASE}lele-voice.wav`,
        tuotuoVoice: numberedSFX("tuotuo-voice", 3),
        dazhiVoice: numberedSFX("dazhi-voice", 3),
        interactionPrompt: `${SFX_BASE}object-inspect.wav`,
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
        footstepStone: numberedSFX("footstep-stone", 8),
        footstepGrass: numberedSFX("footstep-grass", 8),
        footstepWood: numberedSFX("footstep-wood", 8),
        footstepIndoor: numberedSFX("footstep-indoor", 8),
        footstepSand: numberedSFX("footstep-sand", 8)
    }
};

const AUDIO_PRELOAD_GROUPS = {
    "core-ui": [
        ["sfx", "pressStart"],
        ["sfx", "uiConfirm"],
        ["sfx", "uiBack"],
        ["sfx", "menuOpen"],
        ["sfx", "menuClose"],
        ["sfx", "dialogueTick"],
        ["sfx", "dialogueNext"],
        ["sfx", "objectInspect"]
    ],
    tokyo: [
        ["bgm", "tokyoTheme"],
        ["ambient", "tokyoStation"],
        ["ambient", "tokyoShrine"],
        ["sfx", "footstepStone"],
        ["sfx", "flowerRustle"],
        ["sfx", "shrineWindBell"]
    ],
    sydney: [
        ["bgm", "sydneyTheme"],
        ["bgm", "blueWorksTheme"],
        ["ambient", "sydneyHarbour"],
        ["ambient", "colesStore"],
        ["sfx", "footstepStone"],
        ["sfx", "footstepIndoor"],
        ["sfx", "blueWorksVinyl"]
    ],
    longnan: [
        ["bgm", "longnanTheme"],
        ["ambient", "longnanTown"],
        ["sfx", "footstepStone"],
        ["sfx", "footstepWood"],
        ["sfx", "riverTouch"]
    ],
    wedding: [
        ["bgm", "weddingTheme"],
        ["ambient", "xiaoyuanGarden"],
        ["sfx", "footstepGrass"],
        ["sfx", "footstepWood"],
        ["sfx", "chapterComplete"]
    ]
};

window.AUDIO_ASSETS = AUDIO_ASSETS;
window.AUDIO_PRELOAD_GROUPS = AUDIO_PRELOAD_GROUPS;
