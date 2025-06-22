window.hydra.renderers['tapestryfract'] = {
    init: function(deck) {
        const defaults = {
            context: 'webgl'
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Controls',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Spread',
                            variable: 'spread',
                            min: 0.01,
                            max: 2,
                            value: 0.5,
                            step: 0.01,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Strength',
                            variable: 'strength',
                            min: 0.01,
                            max: 2,
                            value: 1,
                            step: 0.01,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Speed',
                            variable: 'speed',
                            min: 0.000001,
                            max: 0.01,
                            value: 0.001,
                            step: 0.000001,
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.tapestryfract = window.hydra.renderer.init(deck, 'tapestryfract', {defaults, ui});

        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;

            uniform vec2 mouse;
            uniform vec2 iResolution;  // Screen resolution (width, height)
            uniform float iGlobalTime;  // Global time
            uniform float spread;
            uniform float strength;

            void main(void)
            {
                float gTime = iGlobalTime * 0.5;
                float f = 3.0;
                float g = 3.0;
                vec2 res = iResolution.xy;
                vec2 mou = mouse.xy;

                // Simulate mouse movement with sine waves
                mou.x = sin(gTime * 0.3) * sin(gTime * 0.17) * 1.0 + sin(gTime * 0.3);
                mou.y = (1.0 - cos(gTime * 0.632)) * sin(gTime * 0.131) * 1.0 + cos(gTime * 0.3);
                mou = (mou + 1.0) * res;

                vec2 z = ((-res + 2.0 * gl_FragCoord.xy) / res.y);
                vec2 p = ((-res + 2.0 + mou) / res.y) * spread;

                for (int i = 0; i < 25; i++) 
                {
                    float d = dot(z, z);
                    z = (vec2(z.x, -z.y) / d) + p * strength;
                    z.x = 1.0 - abs(z.x);
                    f = max(f - d, (dot(z - p, z - p)));
                    g = min(g * d, sin(dot(z + p, z + p)) + 1.0);
                }

                f = abs(-log(f) / 3.5);
                g = abs(-log(g) / 8.0);

                gl_FragColor = vec4(min(vec3(g, g * f, f), 1.0), 1.0);
            }
        `;

        function compileShader(source, type, gl) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader compile failed: ", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }


        function createProgram(vertexShaderSource, fragmentShaderSource, gl) {
            const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER, gl);
            const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER, gl);

            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error("Program link failed: ", gl.getProgramInfoLog(program));
                return null;
            }
            return program;
        }

        deck.tapestryfract.render = () => {

            const program = createProgram(vertexShaderSource, fragmentShaderSource, deck.ctx);
            deck.ctx.useProgram(program);

            const positionAttributeLocation = deck.ctx.getAttribLocation(program, "a_position");
            const resolutionUniformLocation = deck.ctx.getUniformLocation(program, "iResolution");
            const timeUniformLocation = deck.ctx.getUniformLocation(program, "iGlobalTime");
            const spreadUniformLocation = deck.ctx.getUniformLocation(program, "spread");
            const strengthUniformLocation = deck.ctx.getUniformLocation(program, "strength");

            // Create vertex buffer for a full-screen quad
            const vertices = new Float32Array([
                -1.0, -1.0,
                1.0, -1.0,
                -1.0,  1.0,
                1.0,  1.0
            ]);

            const buffer = deck.ctx.createBuffer();
            deck.ctx.bindBuffer(deck.ctx.ARRAY_BUFFER, buffer);
            deck.ctx.bufferData(deck.ctx.ARRAY_BUFFER, vertices, deck.ctx.STATIC_DRAW);

            // Set up attributes
            deck.ctx.vertexAttribPointer(positionAttributeLocation, 2, deck.ctx.FLOAT, false, 0, 0);
            deck.ctx.enableVertexAttribArray(positionAttributeLocation);

            // Animation loop
            deck.ctx.viewport(0, 0, deck.canvas.width, deck.canvas.height);
            deck.ctx.clear(deck.ctx.COLOR_BUFFER_BIT);

            // Set uniform values
            deck.ctx.uniform2f(resolutionUniformLocation, deck.canvas.width, deck.canvas.height);
            deck.ctx.uniform1f(timeUniformLocation, performance.now() * deck.tapestryfract.speed);
            deck.ctx.uniform1f(spreadUniformLocation, deck.tapestryfract.spread);
            deck.ctx.uniform1f(strengthUniformLocation, deck.tapestryfract.strength);

            deck.ctx.drawArrays(deck.ctx.TRIANGLE_STRIP, 0, 4);
        };

        return deck;
    }
};