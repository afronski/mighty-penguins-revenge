(function () {
    "use strict";

    window.Constants = {
        Scale: 5,

        EntitySize: {
            Width: 6,
            Height: 11
        },

        FirePosition: 22,

        FrameDurationForEntity: 125,

        JumpingVelocity: -10,
        MovingVelocity: 4,

        MaxGravity: 10,
        WorldGravity: 0.5,

        CollisionMargin: 5,

        FontSize: 70,
        SmallFontSize: 35,
        SmallestFontSize: 20,

        FontFace: "VT323",

        ForegroundColor: "black",
        BackgroundColor: "white",
        HudColor: "white",

        GameStateKey: "LastGameState",
        BackgroundAudioMutedStateKey: "MutedBackgroundAudio",

        SocketResource: {
            resource: "ws"
        }
    };

} ());