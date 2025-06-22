window.hydra.renderers['geometricplay'] = {
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
                    heading: 'Fractal Controls',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'range',
                            label: 'Scale',
                            variable: 'scale',
                            min: 1.0,
                            max: 10.0,
                            value: 3.5,
                            step: 0.1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Hue',
                            variable: 'hue',
                            min: 0.0,
                            max: 1.0,
                            value: 0.08,
                            step: 0.01,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Rotation Speed',
                            variable: 'rotationSpeed',
                            min: 0.0,
                            max: 3.0,
                            value: 0.5,
                            step: 0.01,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Brightness',
                            variable: 'brightness',
                            min: 0.1,
                            max: 3.0,
                            value: 1.0,
                            step: 0.1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Folding Strength',
                            variable: 'fold',
                            min: 0.5,
                            max: 5.0,
                            value: 2.2,
                            step: 0.1,
                            randomiseable: true
                        },
                        {
                            type: 'select',
                            label: 'Fractal Type',
                            variable: 'mode',
                            options: [
                                { text: 'Classic Tunnel', value: 0, selected: true },
                                { text: 'Shattered Mirror', value: 1, selected: false },
                                { text: 'Wavy Mandala', value: 2, selected: false },
                                { text: 'Mandelbox', value: 3, selected: false },
                                { text: 'Quaternion Symmetry', value: 4, selected: false },
                                { text: 'Apollonian Flame', value: 5, selected: false }
                            ],
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Color',
                    class: 'flex',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Multi-Blend',
                            variable: 'multiBlend',
                            checked: false,
                            randomiseable: true
                        },
                        {
                            type: 'select',
                            label: 'Color Mode',
                            variable: 'colorMode',
                            options: [
                                { text: 'One', value: 1, selected: true },
                                { text: 'Two', value: 2, selected: false },
                                { text: 'Three', value: 3, selected: false },
                                { text: 'Four', value: 4, selected: false },
                                { text: 'Five', value: 5, selected: false },
                                { text: 'Six', value: 6, selected: false },
                                { text: 'Seven', value: 7, selected: false },
                                { text: 'Eight', value: 8, selected: false },
                                { text: 'Nine', value: 9, selected: false },
                            ],
                            containerClass: 'grow',
                            randomiseable: true
                        }
                    ]
                },
            ]
        };
        deck.geometricplay = window.hydra.renderer.init(deck, 'geometricplay', {defaults, ui});

        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;

            void main() {
                v_uv = a_position * 0.5 + 0.5; // Convert from [-1, 1] to [0, 1]
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            // Original shader by Yohei Nishitsuji (https://www.shadertoy.com/view/3Xj3Dy)

            precision mediump float;

            uniform vec2 iResolution;
            uniform float iTime;
            uniform float u_scale;
            uniform float u_hue;
            uniform float u_rotationSpeed;
            uniform float u_brightness;
            uniform float u_fold;
            uniform int u_mode;
            uniform int u_colorMode;
            uniform bool u_audioReactiveColor;
            uniform bool u_multiBlend;
            varying vec2 v_uv;

            // HSV to RGB conversion
            vec3 hsv(float h, float s, float v) {
                vec4 t = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
                vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
                return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
            }

            // 3D Rotation matrix function
            mat3 rotate3D(float angle, vec3 axis) {
                axis = normalize(axis);
                float s = sin(angle);
                float c = cos(angle);
                float oc = 1.0 - c;

                return mat3(
                    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
                    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
                    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
                );
            }

            // Mandelbox folding (mode 3)
            vec3 mandelboxFold(vec3 p, float scale) {
                float r2 = dot(p, p);
                if (r2 < 0.5) p *= 4.0;
                else if (r2 < 1.0) p /= r2;

                vec3 axis = normalize(vec3(
                    sin(iTime * 0.3),
                    cos(iTime * 0.2),
                    sin(iTime * 0.1 + p.z)
                ));

                vec3 box = clamp(p, -1.0, 1.0);
                p = mix(p, box * 2.0 - p, 0.85);

                float orbit = length(p.xy - vec2(0.5)) + sin(p.z + iTime * 0.5) * 0.2;
                p += 0.1 * sin(orbit * 4.0 + iTime); // orbit trap effect

                float s = scale + 0.3 * sin(dot(p, axis) * 2.0 + iTime);
                return p * s + vec3(1.0, 0.5, 0.0); // slight offset
            }

            // Quaternion-style symmetry fold (mode 4)
            vec3 quaternionFold(vec3 p) {
                p.xy = abs(p.xy);
                p.xz = abs(p.xz);
                float len = length(p);
                p = normalize(p) * len;
                p *= 2.0 / clamp(dot(p, p), 0.5, 10.0);
                return p;
            }

            // Apollonian-style fractal fold (mode 5)
            vec3 apollonianFold(vec3 p) {
                // Basic symmetry
                p = abs(p);

                // Log-based radial warping
                float r = length(p);
                float logR = log(1.0 + r * r);  // smooth contrast boost
                p *= 1.0 + 0.2 * sin(logR * 6.0 + iTime * 0.5);

                // Breathing scale factor with subtle time-space variation
                float d = dot(p, p);
                float k = 1.5 + 0.3 * sin(iTime * 0.6 + d * 2.0);

                // Asymmetric displacement — more chaos
                vec3 displacement = vec3(
                    1.2 + 0.2 * sin(iTime + p.y * 3.0),
                    1.1 + 0.3 * cos(iTime * 0.7 + p.z * 4.0),
                    1.3 + 0.25 * sin(p.x * 5.0 + iTime * 0.3)
                );

                // Fold logic
                p = k * p / d - displacement;

                // Extra ripple distortion — helps layering detail
                p += 0.04 * sin(p * 9.0 + vec3(1.0, 0.5, 2.0));

                return p;
            }

            void main() {
                vec2 r = iResolution.xy;
                vec2 FC = v_uv * r;

                float t = iTime;
                vec4 o = vec4(0.0, 0.0, 0.0, 1.0);
                float g = 0.0;

                for (int i = 1; i < 18; ++i) {
                    float e = 1.0;
                    float s = 1.0;

                    vec3 p = vec3((FC - 0.5 * r) / r.y * u_scale, g + 0.5);
                    p *= rotate3D(t * u_rotationSpeed, vec3(1.0, 1.0, 0.0));

                    for (int j = 0; j < 40; ++j) {
                        if (u_mode == 0) {
                            // Classic tunnel (default)
                            p = vec3(0.0, 3.01, 3.0) - abs(abs(p) * e - vec3(u_fold, 3.0, 3.0));
                        } else if (u_mode == 1) {
                            // Shattered mirror
                            p = abs(p * e - vec3(u_fold, 3.0, 3.0));
                        } else if (u_mode == 2) {
                            // Wavy mandala with radial symmetry & folding
                            float angle = atan(p.y, p.x);
                            float radius = length(p.xy);

                            // Increase symmetry segments
                            float segments = 10.0;
                            angle = mod(angle, 2.0 * 3.14159 / segments);
                            p.xy = vec2(cos(angle), sin(angle)) * radius;

                            // Apply sine-based deformation for detail
                            p += 0.4 * sin(p * 6.0 + vec3(u_fold, u_fold * 0.5, u_fold * 0.8));
                            p += 0.2 * sin(p * 12.0 + vec3(0.5, 0.3, 0.2));

                            // Slight temporal offset for glow and motion
                            p += 0.05 * sin(vec3(radius) + iTime * 2.0);
                        } else if (u_mode == 3) {
                            // Mandelbox folding
                            p = mandelboxFold(p, u_fold);
                        } else if (u_mode == 4) {
                            // Lightweight quaternion-style symmetry
                            p.xy = abs(p.xy);
                            p.xz = abs(p.xz);

                            // Add a gentle polar twist based on time
                            float angle = atan(p.y, p.x);
                            float radius = length(p.xy);
                            angle += sin(t + radius * 4.0) * 0.3;

                            // Reconstruct twisted position
                            p.xy = vec2(cos(angle), sin(angle)) * radius;

                            // Light fold to increase structure
                            p = abs(p - vec3(1.5, 0.5, 1.0));
                        } else if (u_mode == 5) {
                            // Apollonian flame
                            p = apollonianFold(p);
                        }
                        e = max(1.0, 10.0 / dot(p, p));
                        s *= e;
                    }

                    float safeY = max(abs(p.y), 0.0001);
                    g -= mod(length(p.yy - p.xy * 0.3), safeY) / s * 0.4;
                    
                    float hueShift = float(u_mode) * 0.08;

                    float hue = mod(u_hue + hueShift, 1.0); // ensure hue stays in [0,1]
                    float saturation = 0.7 + 0.3 * sin(p.z * 2.0 + p.x * 1.5); // higher color contrast
                    float value = clamp(pow(s / 4000.0, 0.6), 0.0, 1.0);       // softer brightness curve

                    if (u_colorMode == 2) {
                        hue = mod(u_hue + hueShift, 1.0); // ensure hue stays in [0,1]
                        saturation = 0.6 + 0.4 * sin(dot(p.xy, p.xy) * 1.5);
                        value = clamp(pow(s / 5000.0, 0.55), 0.0, 1.0);
                    } else if (u_colorMode == 3) {
                        hue = 0.55 + 0.15 * sin(p.z * 3.0 + iTime * 0.3);
                        saturation = 0.6 + 0.4 * sin(dot(p.xy, p.xy) * 1.5);
                        value = clamp(pow(s / 5000.0, 0.55), 0.0, 1.0);
                    } else if (u_colorMode == 4) {
                        hue = mod(0.5 + 0.5 * sin(length(p.xy) * 3.0 + p.z * 2.0 + iTime * 0.7), 1.0);
                        saturation = 0.6 + 0.4 * sin(dot(p.xy, p.xy) * 1.5);
                        value = clamp(pow(s / 5000.0, 0.55), 0.0, 1.0);
                    } else if (u_colorMode == 5) {
                        hue = mod(0.5 + 0.5 * sin(dot(p, vec3(0.9, 1.3, 1.7)) + iTime * 0.4), 1.0);
                        saturation = 0.6 + 0.4 * sin(dot(p.xy, p.xy) * 1.5);
                        value = clamp(pow(s / 5000.0, 0.55), 0.0, 1.0);
                    } else if (u_colorMode == 6) {
                        hue = mod(atan(p.y, p.x) / 6.2831 + iTime * 0.1, 1.0);
                        saturation = 0.6 + 0.4 * sin(dot(p.xy, p.xy) * 1.5);
                        value = clamp(pow(s / 5000.0, 0.55), 0.0, 1.0);
                    } else if (u_colorMode == 7) {
                        hue = mod(floor(p.z * 5.0 + iTime) / 6.0, 1.0);
                        saturation = 0.6 + 0.4 * sin(dot(p.xy, p.xy) * 1.5);
                        value = clamp(pow(s / 5000.0, 0.55), 0.0, 1.0);
                    } else if (u_colorMode == 8) {
                        hue = 0.5 + 0.5 * sin(0.4 * p.x + 0.6 * p.y + 0.8 * p.z + t * 0.6 + float(i) * 0.5);
                        saturation = 0.6 + 0.4 * sin(dot(p.xy, p.xy) * 1.5);
                        value = clamp(pow(s / 5000.0, 0.55), 0.0, 1.0);
                    } else if (u_colorMode == 9) {
                        hue = 0.5 + 0.5 * sin(0.4 * p.x + 0.6 * p.y + 0.8 * p.z + t * 0.6 + float(i) * 0.5);
                        hue = mod(u_hue + hue * 1.2, 1.0);
                        saturation = 0.6 + 0.4 * sin(dot(p.xy, p.xy) * 1.5);
                        value = clamp(pow(s / 5000.0, 0.55), 0.0, 1.0);
                    }

                    if (u_audioReactiveColor) {
                        hue = mod(u_hue + hue * 1.2, 1.0);
                    }

                    o.rgb += hsv(hue, saturation, value);

                    if (u_multiBlend) {
                        vec3 baseColor = hsv(hue, saturation, value);
                        vec3 altColor = hsv(mod(hue + 0.33, 1.0), saturation, value);
                        vec3 finalColor = mix(baseColor, altColor, 0.5 + 0.5 * sin(iTime + float(i)));
                        o.rgb += finalColor;
                    }
                }

                gl_FragColor = vec4(o.rgb * u_brightness, 1.0);
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

        deck.geometricplay.render = () => {

            const gl = deck.ctx;

            const program = createProgram(vertexShaderSource, fragmentShaderSource, gl);
            gl.useProgram(program);

            // Vertex buffer (fullscreen quad)
            const vertices = new Float32Array([
                -1.0, -1.0,
                1.0, -1.0,
                -1.0,  1.0,
                1.0,  1.0
            ]);

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            const a_position = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(a_position);
            gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

            // Uniforms
            const u_resolution = gl.getUniformLocation(program, "iResolution");
            const u_time = gl.getUniformLocation(program, "iTime");

            const u_scale = gl.getUniformLocation(program, "u_scale");
            const u_hue = gl.getUniformLocation(program, "u_hue");
            const u_rotationSpeed = gl.getUniformLocation(program, "u_rotationSpeed");
            const u_brightness = gl.getUniformLocation(program, "u_brightness");
            const u_fold = gl.getUniformLocation(program, "u_fold");
            const u_mode = gl.getUniformLocation(program, "u_mode");
            const u_colorMode = gl.getUniformLocation(program, "u_colorMode");
            const u_audioReactiveColor = gl.getUniformLocation(program, "u_audioReactiveColor");
            const u_multiBlend = gl.getUniformLocation(program, "u_multiBlend");

            let fold;

            if (deck.reactivity.on && deck.reactivity.scale.on) {
                fold = 0.5 + (deck.reactivity.adjust('scale', 1) * 0.05);
            } else {
                fold = deck.geometricplay.fold;
            }

            let hue;

            if (deck.reactivity.on && deck.reactivity.color.on) {
                hue = deck.reactivity.adjust('color', deck.geometricplay.hue) / 100;
            } else {
                hue = deck.geometricplay.hue;
            }

            gl.uniform1f(u_scale, deck.geometricplay.scale);
            gl.uniform1f(u_hue, hue);
            gl.uniform1f(u_rotationSpeed, deck.geometricplay.rotationSpeed);
            gl.uniform1f(u_brightness, deck.geometricplay.brightness);
            gl.uniform1f(u_fold, fold);
            gl.uniform1i(u_mode, deck.geometricplay.mode);
            gl.uniform1i(u_colorMode, deck.geometricplay.colorMode);
            gl.uniform1i(u_audioReactiveColor, deck.reactivity.on && deck.reactivity.color.on);
            gl.uniform1i(u_multiBlend, deck.geometricplay.multiBlend);

            gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);
            gl.uniform1f(u_time, performance.now() / 1000);

            // Clear
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Draw
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };

        return deck;
    }
};