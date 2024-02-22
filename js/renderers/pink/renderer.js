window.hydra.renderers['pink'] = {
    init: function(deck) {
        const defaults = {
            scale: 1
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Mods',
                    class: 'flex',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Beat Sync',
                            variable: 'beatSync',
                            checked: false
                        },
                        {
                            type: 'checkbox',
                            label: 'Quark Sync',
                            variable: 'quarkSync',
                            checked: false
                        }
                    ]
                }
            ]
        };
        deck.pink = window.hydra.renderer.init(deck, 'pink', defaults, ui);

        deck.pink.render = () => {
            deck.ctx.clearRect(0, 0, deck.canvas.width, deck.canvas.height);

            let radius;

            if (deck.pink.beatSync) {
                if (hydra.audio.bpm.beatOn) {
                    deck.pink.scale = 2.5;
                } else if (deck.pink.scale > 1 && deck.pink.scale !== 1) {
                    deck.pink.scale -= 0.1;
                } else {
                    deck.pink.scale = 1
                }
            }

            if (deck.pink.quarkSync) {
                radius = hydra.deck1.quark.radius * hydra.deck1.quark.scale;
                if (hydra.deck1.reactivity.on && hydra.deck1.reactivity.scale.enabled && hydra.deck1.reactivity.scale.on) {
                    radius = (radius/100) * (window.hydra.audio.percentage * deck.reactivity.scale.strength);
                }
            } else {
                radius = (deck.canvas.height/2) * deck.scale * deck.pink.scale;
            }

            const y = (Math.sqrt(3)/2)*(radius/2);
            const x = ((radius/2) * Math.sqrt(3))/2;

            deck.ctx.fillStyle = '#ff00e4';
            deck.ctx.beginPath();
            deck.ctx.moveTo(hydra.centerX, hydra.centerY-(radius/2));
            deck.ctx.lineTo(hydra.centerX+x, hydra.centerY+((radius/2)/2));
            deck.ctx.lineTo(hydra.centerX-x, hydra.centerY+((radius/2)/2));

            deck.ctx.fill();
        }

        return deck;
    }
};