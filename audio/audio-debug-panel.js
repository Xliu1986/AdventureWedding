/* AdventureWedding — Hidden Audio Diagnostics
   Build v0.9.6.3.1

   Shift + A opens this lightweight panel. It uses the existing AudioManager and
   never creates another AudioContext.
*/

(function () {
    "use strict";

    const CORE_TEST_BUTTONS = [
        ["pressStart", "PRESS START"],
        ["uiMove", "Cursor"],
        ["uiConfirm", "Confirm"],
        ["uiBack", "Back"],
        ["dialogueNext", "Next"],
        ["interactionPrompt", "Interact"],
        ["albumOpen", "Album Open"],
        ["albumPage", "Page"],
        ["albumClose", "Album Close"],
        ["memoryUnlock", "Memory"],
        ["chapterComplete", "Chapter"],
        ["cgFadeIn", "CG In"],
        ["cgFadeOut", "CG Out"],
        ["tuotuoVoice", "Tuotuo"],
        ["dazhiVoice", "Dazhi"]
    ];

    let panel = null;
    let statusNode = null;
    let visible = false;
    let refreshTimer = 0;

    function createPanel() {
        if (panel) return panel;

        panel = document.createElement("aside");
        panel.id = "audioDebugPanel";
        panel.style.cssText = [
            "position:fixed",
            "right:12px",
            "bottom:12px",
            "z-index:99999",
            "width:min(360px,calc(100vw - 24px))",
            "max-height:70vh",
            "overflow:auto",
            "padding:12px",
            "display:none",
            "background:rgba(4,12,26,.94)",
            "border:3px solid #d9a84a",
            "box-shadow:0 8px 28px rgba(0,0,0,.45)",
            "color:#fff7d8",
            "font:14px monospace"
        ].join(";");

        const title = document.createElement("div");
        title.textContent = "Audio Diagnostics";
        title.style.cssText = "font-size:16px;color:#ffd36b;margin-bottom:8px;";
        panel.appendChild(title);

        statusNode = document.createElement("pre");
        statusNode.style.cssText = "white-space:pre-wrap;margin:0 0 10px;line-height:1.35;";
        panel.appendChild(statusNode);

        const grid = document.createElement("div");
        grid.style.cssText = "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;";
        CORE_TEST_BUTTONS.forEach(([id, label]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.style.cssText = [
                "padding:8px",
                "background:#10223b",
                "border:2px solid #d9a84a",
                "color:#fff7d8",
                "font:13px monospace"
            ].join(";");
            button.addEventListener("click", async () => {
                await window.AudioManager?.unlock?.();
                window.AudioManager?.playSFX?.(id, { volume: 0.9, throttleMs: 0 });
                refreshStatus();
            });
            grid.appendChild(button);
        });
        panel.appendChild(grid);

        const testButton = document.createElement("button");
        testButton.type = "button";
        testButton.textContent = "Run decode test";
        testButton.style.cssText = "width:100%;margin-top:8px;padding:8px;background:#17314f;border:2px solid #d9a84a;color:#fff7d8;font:13px monospace;";
        testButton.addEventListener("click", async () => {
            await window.AudioManager?.unlock?.();
            const result = await window.testCoreSFX?.();
            console.table?.(result);
            refreshStatus();
        });
        panel.appendChild(testButton);

        document.body.appendChild(panel);
        return panel;
    }

    function refreshStatus() {
        if (!statusNode) return;
        const status = window.getAudioStatus?.() || {};
        statusNode.textContent = [
            `context: ${status.contextState || "missing"}`,
            `unlocked: ${Boolean(status.unlocked)}`,
            `master: ${Number(status.masterVolume ?? 0).toFixed(2)}`,
            `sfx: ${Number(status.sfxVolume ?? 0).toFixed(2)}`,
            `muted: master=${Boolean(status.masterMuted)} sfx=${Boolean(status.sfxMuted)}`,
            `buffers: ${status.loadedBuffers ?? 0}`,
            `failed: ${status.failedAssets?.length ?? 0}`,
            `last: ${status.lastPlayedSFX || "-"}`
        ].join("\n");
    }

    function setVisible(nextVisible) {
        visible = nextVisible;
        createPanel();
        panel.style.display = visible ? "block" : "none";
        if (visible) {
            refreshStatus();
            window.clearInterval(refreshTimer);
            refreshTimer = window.setInterval(refreshStatus, 600);
        } else {
            window.clearInterval(refreshTimer);
            refreshTimer = 0;
        }
    }

    window.addEventListener("keydown", event => {
        if (!event.shiftKey || event.code !== "KeyA") return;
        event.preventDefault();
        setVisible(!visible);
    });
})();
