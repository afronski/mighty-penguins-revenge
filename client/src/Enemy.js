(function (jaws, Entity, Constants) {
    "use strict";

    var TextHeight = 10,
        DescriptionOptions = {
            color: Constants.HudColor,

            fontSize: Constants.SmallestFontSize,
            fontFace: Constants.FontFace
        };

    // Private methods.

    function getDescription() {
        return this.nick + " (" + this.health.toString() + ")";
    }

    // Constructor.

    function Enemy(options) {
        var textLength;

        Entity.call(this, options);

        this.initialize("Enemy.png");

        this.descriptionOptions = jaws.clone(DescriptionOptions);

        this.descriptionOptions.text = getDescription.call(this);
        textLength = Math.round(this.descriptionOptions.text.length / 2);

        this.descriptionOptions.x = this.x - textLength * Constants.Scale;
        this.descriptionOptions.y = this.y - Constants.EntitySize.Height * Constants.Scale - TextHeight;

        this.description = new jaws.Text(this.descriptionOptions);

        this.prepare = function () {
            var textLength;

            this.descriptionOptions.text = getDescription.call(this);
            textLength = Math.round(this.descriptionOptions.text.length / 2);

            this.descriptionOptions.x = this.x - textLength * Constants.Scale;
            this.descriptionOptions.y = this.y - Constants.EntitySize.Height * Constants.Scale - TextHeight;

            this.description.set(this.descriptionOptions);
        };

        this.draw = function () {
            Entity.prototype.draw.call(this);

            this.description.draw();
        };
    }

    Enemy.prototype = Entity.prototype;

    window.Enemy = Enemy;

} (window.jaws, window.Entity, window.Constants));