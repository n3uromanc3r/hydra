window.hydra.renderers["lines"] = {
    init: function (deck) {
        const defaults = {};
        const ui = {
            fieldsets: [
                {
                    heading: "Color",
                    class: "flex-grid",
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: "color",
                            label: "Color",
                            variable: "color",
                            value: "#ff0000",
                            randomiseable: true,
                        },
                        {
                            type: "button",
                            label: "Foreground Mode",
                            variable: "colorMode",
                            text: "normal",
                            options: "normal,cycle",
                            randomiseable: true,
                        },
                        {
                            type: "button",
                            label: "Background Mode",
                            variable: "bgColorMode",
                            text: "black",
                            options: "black,match,opposite",
                            randomiseable: true,
                        },
                    ],
                },
                {
                    heading: "Rotation",
                    class: "flex-grid",
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: "range",
                            label: "Angle",
                            variable: "angle",
                            min: 0,
                            max: 360,
                            value: 0,
                            step: 1,
                            randomiseable: true,
                        },
                    ],
                },
                {
                    class: "flex-grid",
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: "checkbox",
                            label: "Auto",
                            variable: "autoRotate",
                            checked: true,
                            randomiseable: true,
                        },
                        {
                            type: "range",
                            label: "Auto Speed",
                            variable: "autoRotateSpeed",
                            min: 0,
                            max: 50,
                            value: 1,
                            step: 0.01,
                            randomiseable: true,
                        },
                    ],
                },
                {
                    heading: "Shape",
                    class: "flex-grid",
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: "range",
                            label: "Count",
                            variable: "count",
                            min: 1,
                            max: 1000,
                            value: 100,
                            step: 1,
                            randomiseable: true,
                        },
                        {
                            type: "range",
                            label: "Width",
                            variable: "width",
                            min: 1,
                            max: 1000,
                            value: 5,
                            step: 1,
                            randomiseable: true,
                        },
                        {
                            type: "range",
                            label: "Gap",
                            variable: "gap",
                            min: 0,
                            max: 1000,
                            value: 15,
                            step: 1,
                            randomiseable: true,
                        },
                    ],
                },
                {
                    heading: "Movement",
                    class: "flex-grid",
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: "range",
                            label: "Speed",
                            variable: "speed",
                            min: 0,
                            max: 100,
                            value: 0.0001,
                            step: 0.0001,
                            randomiseable: true,
                        },
                    ],
                },
            ],
        };
        deck.lines = window.hydra.renderer.init(deck, "lines", {
            defaults,
            ui,
            presets: "./js/renderers/lines/presets.json",
        });

        let width;
        let height;
        let objectWidth;
        let repeatWidth;
        let xpos = 0;
        let xposPrevious;
        let y;
        let count;
        let r;
        let g;
        let b;

        let gap;

        let rotationInRadians;
        let counter = 0;

        deck.lines.render = () => {
            width = deck.lines.width;
            height = deck.canvas.height;

            objectWidth = deck.lines.width + deck.lines.gap;
            repeatCount = deck.canvas.width / objectWidth;
            repeatWidth = Math.floor(repeatCount) * objectWidth;

            xpos = xpos >= -repeatWidth ? xpos - deck.lines.speed : 0;
            y = 0;

            count = deck.lines.count;

            gap = deck.lines.gap;

            r =
            deck.lines.colorMode == "cycle"
            ? ((Math.sin(Date.now() / 2500) + 1) / 2) * 255
            : deck.lines.color.r;
            g =
            deck.lines.colorMode == "cycle"
            ? ((Math.sin(Date.now() / 3500) + 1) / 2) * 255
            : deck.lines.color.g;
            b =
            deck.lines.colorMode == "cycle"
            ? ((Math.sin(Date.now() / 4500) + 1) / 2) * 255
            : deck.lines.color.b;

            deck.ctx.save();

            deck.ctx.translate(hydra.centerX, hydra.centerY);

            rotationInRadians =
            ((deck.lines.angle + (deck.lines.autoRotate ? counter : 0)) * Math.PI) /
            180;
            deck.ctx.rotate(rotationInRadians);

            xposPrevious = xpos;

            for (count; count >= 0; count--) {
                deck.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                deck.ctx.fillRect(
                    -hydra.centerX + xpos - height,
                    -hydra.centerY - height,
                    width,
                    height * 3,
                );
                xpos = xpos + width + gap;
            }

            xpos = xposPrevious;

            deck.ctx.rotate(-rotationInRadians);
            deck.ctx.translate(-hydra.centerX, -hydra.centerY);

            deck.ctx.restore();

            counter = counter == 360 ? 0 : counter + deck.lines.autoRotateSpeed;
        };

        return deck;
    },
};
