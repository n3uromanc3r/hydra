window.hydra.renderers['tapestryfract2'] = {
    init: function(deck) {
        const defaults = {
            context: 'webgl',
            reactivity: {
                scale: {
                    enabled: true,
                    on: true,
                    cause: 'average',
                    effect: 'add',
                    strength: 1
                },
                color: {
                    enabled: true,
                    on: true,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                },
                alpha: {
                    enabled: false,
                    on: false,
                    cause: 'average',
                    effect: 'add',
                    strength: 100
                },
                amp: {
                    enabled: false,
                    on: false,
                    cause: 'average',
                    effect: 'add',
                    strength: 100
                }
            }
        };

        const ui = {
            fieldsets: [
                {
                    heading: 'Controls',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        { type: 'range', label: 'Spread', variable: 'spread', min: 0.01, max: 2, value: 0.5, step: 0.01, randomiseable: true },
                        { type: 'range', label: 'Strength', variable: 'strength', min: 0.01, max: 2, value: 1.0, step: 0.01, randomiseable: true },
                        { type: 'range', label: 'Speed', variable: 'speed', min: 0.000001, max: 0.01, value: 0.001, step: 0.000001, randomiseable: true },
                        { type: 'range', label: 'Iterations', variable: 'iterations', min: 1, max: 100, value: 25, step: 1, randomiseable: true },
                        { type: 'range', label: 'Hue Shift', variable: 'hueShift', min: 0.0, max: 1.0, value: 0.0, step: 0.01, randomiseable: true },
                        { type: 'range', label: 'Warp', variable: 'warp', min: 0.0, max: 2.0, value: 0.0, step: 0.01, randomiseable: true },
                        { type: 'select', label: 'Mode', variable: 'mode', options: [
                            { text: 'Default', value: 'Default', selected: true },
                            { text: 'Apollonian', value: 'Apollonian', selected: false },
                            { text: 'Kaleidoscope', value: 'Kaleidoscope', selected: false },
                        ], randomiseable: true}
                    ]
                }
            ]
        };

        

        deck.tapestryfract2 = window.hydra.renderer.init(deck, 'tapestryfract2', {defaults, ui});

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec2 mouse, iResolution;
            uniform float iGlobalTime, spread, strength, audioInput, audioInput2;
            uniform float iterations, hueShift, warp;
            uniform int mode;

            vec3 palette(float t) {
                return vec3(0.5 + 0.5*cos(6.2831*(vec3(0.1, 0.2, 0.3)*t + vec3(0.0, 0.33, 0.67) + hueShift)));
            }

            void main(void) {
                float gTime = iGlobalTime * 0.5;
                vec2 res = iResolution.xy;
                vec2 mou = mouse.xy;
                mou.x = sin(gTime * 0.3) * sin(gTime * 0.17) + sin(gTime * 0.3);
                mou.y = (1.0 - cos(gTime * 0.632)) * sin(gTime * 0.131) + cos(gTime * 0.3);
                mou = (mou + 1.0) * res;

                vec2 z = ((-res + 2.0 * gl_FragCoord.xy) / res.y);
                vec2 p = ((-res + 2.0 + mou) / res.y) * spread;
                float f = 3.0, g = 3.0;

                for (int i = 0; i < 100; i++) {
                    if (i >= int(iterations)) break;
                    float d = dot(z, z);
                    if (mode == 1) {
                        z = (z / d) + p * strength;
                    } else if (mode == 2) {
                        z = abs(z);
                        z = (z / d) + p * strength;
                    } else {
                        z = vec2(z.x, -z.y) / d + p * strength;
                    }
                    z.x = 1.0 - abs(z.x);
                    z += sin(gTime + float(i) * warp) * 0.01;
                    f = max(f - d, dot(z - p, z - p));
                    g = min(g * d, sin(dot(z + p, z + p)) + 1.0);
                }

                f = abs(-log(f) / audioInput);
                g = abs(-log(g) / audioInput2);
                vec3 col = palette(g);
                col *= vec3(f, g, f);

                gl_FragColor = vec4(min(col, 1.0), 1.0);
            }
        `;

        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
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

        function createProgram(vsSource, fsSource, gl) {
            const vs = compileShader(vsSource, gl.VERTEX_SHADER, gl);
            const fs = compileShader(fsSource, gl.FRAGMENT_SHADER, gl);
            const program = gl.createProgram();
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error("Program link failed: ", gl.getProgramInfoLog(program));
                return null;
            }
            return program;
        }

        deck.tapestryfract2.render = () => {
            const gl = deck.ctx;
            const program = createProgram(vertexShaderSource, fragmentShaderSource, gl);
            gl.useProgram(program);

            const posLoc = gl.getAttribLocation(program, "a_position");
            const uRes = gl.getUniformLocation(program, "iResolution");
            const uTime = gl.getUniformLocation(program, "iGlobalTime");
            const uCtrl1 = gl.getUniformLocation(program, "spread");
            const uCtrl2 = gl.getUniformLocation(program, "strength");
            const uAudio1 = gl.getUniformLocation(program, "audioInput");
            const uAudio2 = gl.getUniformLocation(program, "audioInput2");
            const uIter = gl.getUniformLocation(program, "iterations");
            const uHue = gl.getUniformLocation(program, "hueShift");
            const uWarp = gl.getUniformLocation(program, "warp");
            const uMode = gl.getUniformLocation(program, "mode");

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                -1, -1, 1, -1, -1, 1, 1, 1
            ]), gl.STATIC_DRAW);

            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(posLoc);
            gl.viewport(0, 0, deck.canvas.width, deck.canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.uniform2f(uRes, deck.canvas.width, deck.canvas.height);
            gl.uniform1f(uTime, performance.now() * deck.tapestryfract2.speed);
            gl.uniform1f(uCtrl1, deck.tapestryfract2.spread);
            gl.uniform1f(uCtrl2, deck.tapestryfract2.strength);

            let audio1 = 3.5, audio2 = 8.0;
            if (deck.reactivity.on && deck.reactivity.color.on) {
                audio1 = deck.reactivity.adjust('color', audio1);
                audio2 = deck.reactivity.adjust('color', audio2);
            }

            gl.uniform1f(uAudio1, audio1);
            gl.uniform1f(uAudio2, audio2);
            gl.uniform1f(uIter, deck.tapestryfract2.iterations);
            gl.uniform1f(uHue, deck.tapestryfract2.hueShift);
            gl.uniform1f(uWarp, deck.tapestryfract2.warp);
            gl.uniform1i(uMode, ["Default", "Apollonian", "Kaleidoscope"].indexOf(deck.tapestryfract2.mode));

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };

        return deck;
    }
};
