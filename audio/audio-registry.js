/* AdventureWedding — Music registry
   RC2.2 Wedding Music Edition

   Private wedding-invitation build: four owner-supplied chapter songs.
   SFX remain registered nowhere in this build and AudioManager keeps SFX muted.
*/

const MUSIC_BASE = "assets/audio/music/";

const MUSIC = {
    tokyo: {
        id: "tokyo",
        title: "Crazy for You",
        artist: "Saito Marina",
        src: `${MUSIC_BASE}tokyo.m4a?v=final-test-005`,
        loop: true
    },

    sydney: {
        id: "sydney",
        title: "Just Don't Want to Be Lonely",
        artist: "John Scofield",
        src: `${MUSIC_BASE}sydney.m4a?v=final-test-005`,
        loop: true
    },

    longnan: {
        id: "longnan",
        title: "初夏雨后",
        artist: "谢明祥",
        src: `${MUSIC_BASE}longnan.m4a?v=final-test-005`,
        loop: true
    },

    wedding: {
        id: "wedding",
        title: "Ending",
        artist: "梁博",
        src: `${MUSIC_BASE}wedding.m4a?v=final-test-005`,
        loop: true
    }
};

const AUDIO_PRELOAD_GROUPS = {
    tokyo: [["music", "tokyo"], ["music", "sydney"]],
    sydney: [["music", "sydney"], ["music", "longnan"]],
    longnan: [["music", "longnan"], ["music", "wedding"]],
    wedding: [["music", "wedding"]]
};

window.MUSIC = MUSIC;
window.AUDIO_PRELOAD_GROUPS = AUDIO_PRELOAD_GROUPS;
