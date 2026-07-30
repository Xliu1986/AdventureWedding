/* AdventureWedding — Hidden BGM Diagnostics
   RC2.1 Original Soundtrack — Mobile Integration

   Shift + M opens this lightweight panel. It uses the existing AudioManager,
   never creates another AudioContext, and never plays SFX.
*/

(function () {
    "use strict";

    const BGM_TEST_BUTTONS = [
        ["titleTheme", "Main"],
        ["tokyoTheme", "Tokyo"],
        ["sydneyTheme", "Sydney"],
        ["longnanTheme", "Longnan"],
        ["weddingTheme", "Wedding"],
        ["creditsTheme", "Credits"]
    ];

    let panel = null;
    let statusNode = null;
    let volumeInput = null;
    let visible = false;
    let refreshTimer = 0;

    function buttonStyle() {
        return [
            "padding:8px",
            "background:#10223b",
            "border:2px solid #d9a84a",
            "color:#fff7d8",
            "font:13px monospace",
            "cursor:pointer"
        ].join(";");
    }

    function createButton(label, onClick) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.style.cssText = buttonStyle();
        button.addEventListener("click", async () => {
            await onClick();
            refreshStatus();
        });
        return button;
    }

    function createPanel() {
        if (panel) return panel;

        panel = document.createElement("aside");
        panel.id = "audioDebugPanel";
        panel.style.cssText = [
            "position:fixed",
            "right:12px",
            "bottom:12px",
            "z-index:99999",
            "width:min(380px,calc(100vw - 24px))",
            "max-height:72vh",
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
        title.textContent = "BGM Diagnostics · Shift+M";
        title.style.cssText = "font-size:16px;color:#ffd36b;margin-bottom:8px;";
        panel.appendChild(title);

        statusNode = document.createElement("pre");
        statusNode.style.cssText = "white-space:pre-wrap;margin:0 0 10px;line-height:1.35;";
        panel.appendChild(statusNode);

        const controls = document.createElement("div");
        controls.style.cssText = "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;";
        controls.appendChild(createButton("Unlock", () => window.AudioManager?.unlock?.()));
        controls.appendChild(createButton("Stop", () => window.AudioManager?.stop?.({ fadeOutMs: 300 })));
        controls.appendChild(createButton("Duck", () => window.AudioManager?.duck?.("debug", 0.45, 250)));
        controls.appendChild(createButton("Unduck", () => window.AudioManager?.unduck?.("debug", 250)));
        controls.appendChild(createButton("Music On", () => window.AudioManager?.setMusicEnabled?.(true)));
        controls.appendChild(createButton("Music Off", () => window.AudioManager?.setMusicEnabled?.(false)));
        panel.appendChild(controls);

        const grid = document.createElement("div");
        grid.style.cssText = "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px;";
        BGM_TEST_BUTTONS.forEach(([id, label]) => {
            grid.appendChild(createButton(label, async () => {
                await window.AudioManager?.unlock?.();
                window.AudioManager?.play?.(id, { restart: true });
            }));
        });
        panel.appendChild(grid);

        const volumeWrap = document.createElement("label");
        volumeWrap.textContent = "BGM volume ";
        volumeWrap.style.cssText = "display:block;margin-top:10px;";
        volumeInput = document.createElement("input");
        volumeInput.type = "range";
        volumeInput.min = "0";
        volumeInput.max = "1";
        volumeInput.step = "0.01";
        volumeInput.value = String(window.AudioManager?.getStatus?.().bgmVolume ?? 0.6);
        volumeInput.style.cssText = "width:100%;";
        volumeInput.addEventListener("input", () => {
            window.AudioManager?.setCategoryVolume?.("bgm", Number(volumeInput.value));
            refreshStatus();
        });
        volumeWrap.appendChild(volumeInput);
        panel.appendChild(volumeWrap);

        document.body.appendChild(panel);
        return panel;
    }

    function refreshStatus() {
        if (!statusNode) return;
        const status = window.AudioManager?.getStatus?.() || window.getAudioStatus?.() || {};
        if (volumeInput && Number.isFinite(status.bgmVolume)) {
            volumeInput.value = String(status.bgmVolume);
        }
        statusNode.textContent = [
            `context: ${status.contextState || "missing"}`,
            `unlocked: ${Boolean(status.unlocked)}`,
            `music: ${status.musicEnabled ? "enabled" : "disabled"}`,
            `track: ${status.currentTrackId || status.currentBGM || "-"}`,
            `time: ${Number(status.playbackTime ?? 0).toFixed(2)}s`,
            `loop: ${Boolean(status.loop)} ${Number(status.loopStart ?? 0).toFixed(2)}-${Number(status.loopEnd ?? 0).toFixed(2)}`,
            `master: ${Number(status.masterVolume ?? 0).toFixed(2)}`,
            `bgm: ${Number(status.bgmVolume ?? 0).toFixed(2)} effective=${Number(status.effectiveBGMVolume ?? 0).toFixed(2)}`,
            `duck: ${(status.duckingState || []).map(item => `${item.reason}:${item.amount}`).join(", ") || "-"}`,
            `loading: ${status.loadingState || "idle"}`,
            `active: ${status.activePlaybackInstanceCount ?? 0}`,
            `buffers: ${status.loadedBuffers ?? status.decodedBufferCount ?? 0}`,
            `failed: ${status.failedAssets?.length ?? status.failedAssetCount ?? 0}`,
            `last error: ${status.lastAudioError || "-"}`
        ].join("\n");
    }

    function setVisible(nextVisible) {
        visible = nextVisible;
        createPanel();
        panel.style.display = visible ? "block" : "none";
        if (visible) {
            refreshStatus();
            window.clearInterval(refreshTimer);
            refreshTimer = window.setInterval(refreshStatus, 500);
        } else {
            window.clearInterval(refreshTimer);
            refreshTimer = 0;
        }
    }

    window.addEventListener("keydown", event => {
        if (!event.shiftKey || event.code !== "KeyM") return;
        event.preventDefault();
        setVisible(!visible);
    });
})();
