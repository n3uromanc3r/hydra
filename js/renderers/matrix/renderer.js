window.hydra.renderers['matrix'] = {
    init: function(deck) {
        const defaults = {
            clearsSelf: true,
            katakana: 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン',
            latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            nums: '0123456789',
            fontSize: 10,
            columns: 0,
            rainDrops: [],
            calculatedAt: null,
            calculatedProperties: false,
            calculateProperties: () => {
                deck.matrix.alphabet = deck.matrix.katakana + deck.matrix.latin + deck.matrix.nums;

                deck.matrix.columns = deck.canvas.width / deck.matrix.fontSize;

                for (let x = 0; x < deck.matrix.columns; x++) {
                    deck.matrix.rainDrops[x] = 1;
                }

                deck.matrix.calculatedProperties = true;
                deck.matrix.calculatedAt = deck.canvas.width;
            }
        };
        deck.matrix = window.hydra.renderer.init(deck, 'matrix', {defaults});
        deck.matrix.shouldRender = true;

        deck.matrix.render = () => {
            if (!deck.matrix.calculatedProperties || (deck.matrix.calculatedAt && (deck.matrix.calculatedAt != deck.canvas.width))) {
                deck.matrix.calculateProperties();
            } else {
                if (deck.matrix.shouldRender) {
                    // gradually fades out previous rendered content
                    deck.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                    deck.ctx.fillRect(0, 0, deck.canvas.width, deck.canvas.height);

                    deck.ctx.fillStyle = '#0F0';
                    deck.ctx.font = deck.matrix.fontSize + 'px monospace';

                    for(let i = 0; i < deck.matrix.rainDrops.length; i++)
                    {
                        const text = deck.matrix.alphabet.charAt(Math.floor(Math.random() * deck.matrix.alphabet.length));
                        deck.ctx.fillText(text, i * deck.matrix.fontSize, deck.matrix.rainDrops[i] * deck.matrix.fontSize);

                        if(deck.matrix.rainDrops[i] * deck.matrix.fontSize > deck.canvas.height && Math.random() > 0.985){
                            deck.matrix.rainDrops[i] = 0;
                        }
                        deck.matrix.rainDrops[i]++;
                    }
                    deck.matrix.shouldRender = false;
                } else {
                    deck.matrix.shouldRender = true;
                }
            }
        }

        return deck;
    }
};