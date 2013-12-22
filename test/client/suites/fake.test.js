(function (fake) {
    "use strict";

    test("Fake client-side test", function () {
        ok(fake(), "Fake test not passed!");
    });

} (window.fake));