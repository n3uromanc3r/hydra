window.hydra = (function(){
    return {
        boot: function(settings) {
            this.markup.init(settings, () => {
                this.body = document.querySelector('body');

                this.mixedCanvas = document.getElementById('mixed-canvas');
                this.mixedCtx = this.mixedCanvas.getContext('2d');

                this.centerX;
                this.centerY;

                this.mouseX;
                this.mouseY;

                this.settings = settings;

                this.audio.init();

                this.mirrorEnabled = false;
                this.mirrorMode = 'vert';

                this.deck1 = this.deck.init(1, (settings.deck1.visual || 'quark'));
                this.deck2 = this.deck.init(2, (settings.deck2.visual || 'pink'));

                window.addEventListener('presets-loaded', function(e) {
                    hydra[`deck${e.detail}`].presets.select(settings[`deck${e.detail}`].preset || 1);
                });

                this.crossfader.init();
                this.composition.init();
                this.effects.init();
                this.handlers.init();
                this.modal.init();
                this.keyboard.init();
                this.midi.init();
                this.themes.init();

                this.helpers.detectSizes();

                this.composition.setMode('overlay');

                window.onresize = hydra.helpers.detectSizes;
                this.mouse.init();
                window.requestAnimationFrame(this.render);
            });
        },
        markup: {
            init: function(settings, callback) {
                // insert base markup here
                const visualSelectorDropdowns = document.querySelectorAll('.visual-selector');
                visualSelectorDropdowns.forEach(visualSelectorDropdown => {
                    const selectedVisual = settings[`deck${visualSelectorDropdown.dataset.deck}`].visual;
                    Object.keys(hydra.renderers).sort().forEach(renderer => {
                        if (settings.renderers.includes(renderer)) {
                            visualSelectorDropdown.add(new Option(renderer, renderer, renderer == selectedVisual, renderer == selectedVisual));
                        }
                    });
                });

                if (typeof callback == 'function') {
                    callback();
                }
            },
            injectRendererTabUI: function(deck, name, ui) {
                // insert renderer tab markup here
                const uiContainer = document.querySelector(`[data-deck="${deck.id}"].visual-settings`);
                let markup = hydra.markup.openTabPanel(deck.id, name, null, 'data-tab-panel="renderer"');

                if (ui.fieldsets) {
                    ui.fieldsets.forEach(fieldset => {
                        markup += hydra.markup.generateFieldset(deck.id, name, fieldset);
                    });
                }
                markup += hydra.markup.closeTabPanel();
                uiContainer.insertAdjacentHTML('beforeend', markup);
            },
            injectRandomisationTabUI: function(deck, name, ui) {
                // insert renderer-related randomisation markup here
                const uiContainer = document.querySelector(`[data-deck="${deck.id}"].visual-settings [data-tab-panel="randomisation"]`);
                let markup = hydra.markup.openTabPanel(deck.id, name, 'renderer');

                if (ui.fieldsets) {
                    ui.fieldsets.forEach(fieldset => {
                        markup += hydra.markup.generateRandomisationFieldset(deck.id, name, fieldset);
                    });
                }

                markup += hydra.markup.closeTabPanel();
                uiContainer.insertAdjacentHTML('beforeend', markup);
            },
            injectRendererKeyboardShortcutUI: function(deck, name, ui) {
                const uiContainer = document.querySelector(`#modal .guide [data-target="keyboard-shortcuts"]`);
                let markup = `<div data-visual="${name}"><ul>`;

                const groups = {};

                for (const shortcut in ui) {
                    ui[shortcut].shortcut = shortcut.toUpperCase();
                    if (groups[ui[shortcut].category]) {
                        groups[ui[shortcut].category].push(ui[shortcut]);
                    } else {
                        groups[ui[shortcut].category] = [ui[shortcut]];
                    }
                }

                for (const group in groups) {
                    markup += `<li class="kbd-section-heading">${group}</li>`;

                    markup += `<li>
                            <ul class="flex">`

                    groups[group].forEach(item => {
                        markup += `<li class="claimed"><kbd>${item.shortcut}</kbd> <span>${item.label}</span></li>`;
                    });

                    markup += `</ul>
                        </li>`;
                }

                markup += `</ul><hr><div>
                        <div class="heading">Key:</div>
                            <ul class="legend">
                                <li>
                                    <span class="claimed"></span>
                                    <label>Claimed</label>
                                </li>
                            </ul>
                        </div>
                    </div>
                `;
                uiContainer.insertAdjacentHTML('beforeend', markup);
            },
            injectRendererGuideUI: function(deck, name, ui) {
                const uiContainer = document.querySelector(`#modal .guide [data-target="user-guide"]`);
                let markup = `<div data-visual="${name}"></div>`;
                uiContainer.insertAdjacentHTML('beforeend', markup);
            },
            openTabPanel: function(deckId, name, className, attributes) {
                return `<div ${attributes || ''} data-visual="${name}" data-deck="${deckId}" class="${className || '' } hide">`;
            },
            closeTabPanel: function() {
                return `</div>`;
            },
            generateFieldset: function(deckId, name, fieldset) {
                let markup = `<fieldset>`;

                if (fieldset.heading) {
                    markup += `<div class="heading">${fieldset.heading}</div>`;
                }

                markup += `<group class="${fieldset.class || ''}" ${fieldset.attributes || ''}>`;

                fieldset.items.forEach(item => {
                    if (item.type == 'group') {
                        markup += `<div class="inline-field-group ${item.class || ''}">`;

                        if (item.heading) {
                            markup += `<div class="heading">${item.heading}</div>`;
                        }

                        item.items.forEach(groupItem => {
                            markup += hydra.markup.generateItem(deckId, name, groupItem);
                        });

                        markup += `</div>`;

                    } else {
                        markup += hydra.markup.generateItem(deckId, name, item);
                    }
                });

                markup += `</group>
                </fieldset>`;

                return markup;
            },
            generateCheckboxInput: function(deckId, name, item) {
                let markup = `<div class="inline-input ${item.containerClass || ''}" data-assignable>`;

                if (item.label) {
                    markup += `<span class="input-label">${item.label}</span>`;
                }

                markup += `<label class="switch">
                        <input type="checkbox" ${item.checked ? 'checked' : ''} class="${item.class || ''}" data-deck="${deckId}" data-visual="${name}"
                            data-variable="${item.variable}" ${item.randomiseable ? 'data-randomiseable' : ''} ${item.disabled ? 'disabled' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>`;

                return markup;
            },
            generateRangeOrNumberInput: function(deckId, name, item) {
                let markup = `<div class="inline-input ${item.containerClass || ''}" data-assignable>`;

                if (item.label) {
                    markup += `<span class="input-label">${item.label}`;

                    if (item.subLabel) {
                        markup += `<sub>${item.subLabel}</sub>`;
                    }

                    markup += `</span>`;
                }

                markup += `<span class="value">${item.value}</span>
                    <input type="${item.type}" min="${item.min}" max="${item.max}" step="${item.step}" value="${item.value}" class="${item.class || ''}"
                        data-deck="${deckId}" data-visual="${name}" data-variable="${item.variable}" ${item.randomiseable ? 'data-randomiseable' : ''}
                        ${item.trigger ? 'data-trigger="' + item.trigger + '"' : ''} ${item.dispatchEvent ? 'data-dispatch-event="' + item.dispatchEvent + '"' : ''}
                        ${item.disabled ? 'disabled' : ''}>
                </div>`;

                return markup;
            },
            generateColorInput: function(deckId, name, item) {
                let markup = `<div class="inline-input ${item.containerClass || ''}">`;

                if (item.label) {
                    markup += `<span class="input-label">${item.label}</span>`;
                }

                markup += `<input type="color" value="${item.value}" class="${item.class || ''}" data-deck="${deckId}" data-visual="${name}"
                    data-variable="${item.variable}" ${item.randomiseable ? 'data-randomiseable' : ''} ${item.disabled ? 'disabled' : ''}>
                </div>`;

                return markup;
            },
            generateButton: function(deckId, name, item) {
                let markup = `<div class="inline-input ${item.containerClass || ''}" data-assignable>`;

                if (item.label) {
                    markup += `<span class="input-label">${item.label}</span>`
                }

                markup += `<button class="${item.class || ''}" data-deck="${deckId}" data-visual="${name}" data-variable="${item.variable}"
                    data-options="${item.options}" ${item.randomiseable ? 'data-randomiseable' : ''} ${item.trigger ? 'data-trigger="' + item.trigger + '"' : ''}
                    ${item.disabled ? 'disabled' : ''}>${item.text}</button>
                </div>`;

                return markup;
            },
            generateButtonRadioSwitchGroup: function(deckId, name, item) {
                let markup = `<div class="inline-input ${item.containerClass || ''}" data-assignable>`;

                if (item.label) {
                    markup += `<span class="input-label">${item.label}</span>`
                }

                markup += `<div class="button-group button-radio-switch-group">`;

                item.buttons.forEach(btn => {
                    markup += `<div><button class="${btn.class || ''}${item.active == btn.text ? 'on' : ''}" data-deck="${deckId}" data-visual="${name}" data-variable="${item.variable}"
                        data-options="${btn.options}" ${btn.randomiseable ? 'data-randomiseable' : ''}
                        ${btn.disabled ? 'disabled' : ''}>${btn.text}</button></div>`;
                });

                markup += `</div></div>`;

                return markup;
            },
            generateSelectInput: function(deckId, name, item) {
                let markup = `<div class="inline-input ${item.containerClass || ''}">`;

                if (item.label) {
                    markup += `<span class="input-label">${item.label}</span>`;
                }

                markup += `<select class="${item.class || ''}" data-deck="${deckId}" data-visual="${name}" data-variable="${item.variable}" ${item.disabled ? 'disabled' : ''}>`;

                item.options.forEach(option => {
                    markup += `<option value="${option.value}"${option.selected ? ' selected' : ''}>${option.text}</option>`;
                });

                markup += `</select>
                </div>`;

                return markup;
            },
            generateColorMeter: function(deckId, name, item) {
                let markup = `<div class="inline-input ${item.containerClass || ''}">`;

                if (item.label) {
                    markup += `<span class="input-label">${item.label}</span>`;
                }

                markup += `<div class="color-meter ${item.color}"><div></div></div>
                </div>`;

                return markup;
            },
            generateFileInput: function(deckId, name, item) {
                let markup = `<div class="inline-input ${item.containerClass || ''}">`;

                if (item.label) {
                    markup += `<span class="input-label">${item.label}</span>`;
                }

                markup += `<input type="file" data-deck="${deckId}" data-visual="${name}" data-variable="${item.variable}">
                </div>`;

                return markup;
            },
            generateTextarea: function(deckId, name, item) {
                let markup = `<div class="inline-input ${item.containerClass || ''}">`;

                if (item.label) {
                    markup += `<span class="input-label">${item.label}</span>`;
                }

                markup += `<textarea data-deck="${deckId}" data-visual="${name}" data-variable="${item.variable}"></textarea>
                </div>`;

                return markup;
            },
            generateEmptySlot: function() {
                return `<div class="inline-input"></div>`;
            },
            generateItem: function(deckId, name, item) {
                if (item.type == 'checkbox') {
                    return this.generateCheckboxInput(deckId, name, item);
                }

                if (item.type == 'range' || item.type == 'number') {
                    return this.generateRangeOrNumberInput(deckId, name, item);
                }

                if (item.type == 'color') {
                    return this.generateColorInput(deckId, name, item);
                }

                if (item.type == 'button') {
                    return this.generateButton(deckId, name, item);
                }

                if (item.type == 'buttonRadioSwitchGroup') {
                    return this.generateButtonRadioSwitchGroup(deckId, name, item);
                }

                if (item.type == 'select') {
                    return this.generateSelectInput(deckId, name, item);
                }

                if (item.type == 'color-meter') {
                    return this.generateColorMeter(deckId, name, item);
                }

                if (item.type == 'file') {
                    return this.generateFileInput(deckId, name, item);
                }

                if (item.type == 'textarea') {
                    return this.generateTextarea(deckId, name, item);
                }

                if (item.type == 'empty') {
                    return this.generateEmptySlot();
                }
            },
            generateRandomisationFieldset: function(deckId, name, fieldset) {
                let markup = `<fieldset>`;

                if (fieldset.heading) {
                    markup += `<div class="heading">${fieldset.heading}</div>`;
                }

                markup += `<group>`;

                fieldset.items.forEach(item => {
                    if (item.type == 'group') {
                        markup += `<div class="inline-block">`;

                        if (item.heading) {
                            markup += `<div class="heading">${item.heading}</div>`;
                        }

                        item.items.forEach(groupItem => {
                            markup += hydra.markup.generateRandomisationToggle(deckId, name, groupItem);
                        });

                        markup += `</div>`;

                    } else {
                        markup += hydra.markup.generateRandomisationToggle(deckId, name, item);
                    }
                });

                markup += `</group>
                </fieldset>`;

                return markup;
            },
            generateRandomisationToggle: function(deckId, name, item) {
                if (item.type == 'empty') return '';

                let markup = `<div class="inline-input" data-assignable>`;

                if (item.label) {
                    markup += `<span class="input-label">${item.label || item.heading || ''}`;

                    if (item.subLabel) {
                        markup += `<sub>${item.subLabel}</sub>`;
                    }

                    markup += `</span>`;
                }

                markup += `<label class="switch">
                        <input type="checkbox" ${item.randomiseable ? 'checked' : ''} data-deck="${deckId}" data-visual="${name}"
                            data-target="${item.variable}" data-toggle-randomisation>
                        <span class="slider"></span>
                    </label>
                </div>`

                return markup;
            }
        },
        deck: {
            init: function(id, visual) {
                let deck = {};
                deck.id = id;
                deck.canvas = document.getElementById(`deck-${deck.id}-canvas`);
                deck.ctx = deck.canvas.getContext(visual.context || '2d');
                deck.pipeCanvas = document.getElementById(`deck-${deck.id}-pipe-canvas`);
                deck.pipeCtx = deck.pipeCanvas.getContext('2d');
                deck.videoEl = document.getElementById(`deck-${deck.id}-video`);
                deck.streamEl = document.getElementById(`deck-${deck.id}-stream`);
                deck.crossfaderAlpha = 1;
                deck.raised = id == 2;
                deck.scale = 0.75;
                deck.current = null;
                deck.visibleTab = 'renderer';

                deck.getCurrentContext = function() {
                    if (deck.ctx instanceof CanvasRenderingContext2D) return '2d';
                    if (deck.ctx instanceof WebGLRenderingContext) return 'webgl';
                    if (deck.ctx instanceof WebGL2RenderingContext) return 'webgl2';
                    return 'unknown';
                };

                deck.updateContext = function(newContext) {
                    let oldCanvas = document.getElementById(`deck-${deck.id}-canvas`);

                    const newCanvas = document.createElement('canvas');
                    newCanvas.id = oldCanvas.id;
                    newCanvas.width = oldCanvas.width;
                    newCanvas.height = oldCanvas.height;
                    newCanvas.className = oldCanvas.className;
                    newCanvas.style.cssText = oldCanvas.style.cssText;

                    oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);

                    deck.canvas = document.getElementById(`deck-${deck.id}-canvas`);
                    deck.ctx = deck.canvas.getContext(newContext);
                };

                deck.visual = {
                    select: function(visual) {
                        this.current = visual;
                        deck.current = deck[visual];

                        let newContext = deck[visual].context || '2d';

                        if (newContext !== deck.getCurrentContext()) {
                            deck.updateContext(newContext);
                        }

                        if (newContext == '2d') {
                            deck.ctx.setTransform(1, 0, 0, 1, 0, 0);
                            deck.ctx.clearRect(0, 0, deck.canvas.width, deck.canvas.height);
                        }

                        const visualSettingsPanels = document.querySelectorAll(`[data-deck="${deck.id}"].visual-settings > div:not(.effects):not(.reactivity):not(.randomisation)`);
                        visualSettingsPanels.forEach(panel => {
                            if (deck.visibleTab == 'renderer') {
                                panel.className = (panel.dataset.deck == deck.id) && (panel.dataset.visual == deck.visual.current) ? 'show' : 'hide';
                            }
                        });

                        const randomisationRendererPanels = document.querySelectorAll(`[data-deck="${deck.id}"] [data-tab-panel="randomisation"] .renderer`);
                        randomisationRendererPanels.forEach(randomisationRendererPanel => randomisationRendererPanel.classList.add('hide'));

                        const currentRandomisationRendererPanel = document.querySelector(`[data-deck="${deck.id}"] [data-tab-panel="randomisation"] .renderer[data-visual="${visual}"]`);
                        if (currentRandomisationRendererPanel) {
                            currentRandomisationRendererPanel.classList.remove('hide');
                        }

                        deck.reactivity.update();
                        deck.presets.updateBtns();
                        deck.randomisation.update();
                        hydra.modal.update(deck);
                    },
                    reset: function() {
                        if (deck.current.presets && deck.current.presets.length) {
                            deck.presets.select(1);
                        }
                    }
                }

                deck.randomisation = {
                    init: function () {
                        this.panel = document.querySelector(`[data-deck="${deck.id}"] [data-tab-panel="randomisation"]`);
                    },
                    update: function() {
                        // TODO - add renderer input specific randomisation options...
                        // let markup = '';
                        // deck.current.inputs.forEach(input => {
                        //     markup += ``;
                        // });
                        // this.panel.innerHTML = markup;

                        const randomisationToggleBtns = document.querySelectorAll(`[data-deck="${deck.id}"] [data-tab-panel="randomisation"] input[type="checkbox"]`);
                        if (randomisationToggleBtns.length) {
                            randomisationToggleBtns.forEach(randomisationToggleBtn => {
                                randomisationToggleBtn.addEventListener('input', function(e) {

                                    const target = e.target.dataset.target.startsWith('data-')
                                        ? document.querySelector(`[data-deck="${deck.id}"] [${e.target.dataset.target}]`)
                                        : document.querySelector(`[data-deck="${deck.id}"][data-visual="${deck.visual.current}"][data-variable="${e.target.dataset.target}"]`);
                                    e.target.checked ? target.setAttribute('data-randomiseable', '') : target.removeAttribute('data-randomiseable');
                                });
                            });
                        }
                    }
                }

                deck.readouts = {
                    init: function() {
                        const variables = document.querySelectorAll(`[data-deck="${deck.id}"][data-variable]`);
                        variables.forEach(variable => {
                            const displayEl = document.querySelector(`[data-deck-${deck.id}-${variable.dataset.variable}-display]`);
                            deck[variable.dataset.variable] = variable.value;
                            if (displayEl) {
                                displayEl.innerText = hydra.helpers.formatValue(variable.value, variable.dataset.precision || 2);
                            }
                            variable.addEventListener('input', function(e) {
                                deck[variable.dataset.variable] = variable.value;
                                if (displayEl) {
                                    displayEl.innerText = hydra.helpers.formatValue(variable.value, variable.dataset.precision || 2);
                                }
                            });
                        });
                    }
                }

                deck.controls = {
                    init: function() {
                        this.visualSelectorDropdown = document.querySelector(`[data-deck="${deck.id}"].visual-selector`);
                        this.visualSelectorDropdown.addEventListener('input', function(e) {
                            deck.visual.select(e.target.value);
                        });

                        this.sendBtn = document.querySelector(`[data-deck="${deck.id}"][data-send]`);
                        this.sendBtn.addEventListener('click', function(e) {
                            const tooltip = e.target.closest('.relative').querySelector('.tooltip');
                            deck.presets.send(tooltip);
                        });

                        this.receiveBtn = document.querySelector(`[data-deck="${deck.id}"][data-receive]`);
                        this.receiveBtn.addEventListener('click', function(e) {
                            const tooltip = e.target.closest('.relative').querySelector('.tooltip');
                            deck.presets.receive(tooltip);
                        });

                        this.saveBtn = document.querySelector(`[data-deck="${deck.id}"][data-save]`);
                        this.saveBtn.addEventListener('click', function(e) {
                            deck.presets.save();
                        });

                        this.randomiseBtn = document.querySelector(`[data-deck="${deck.id}"][data-randomise]`);
                        this.randomiseBtn.addEventListener('click', function(e) {
                            hydra.helpers.randomise(deck);
                        });

                        this.reactBtn = document.querySelector(`[data-deck="${deck.id}"][data-react]`);
                        this.reactBtn.addEventListener('click', function(e) {
                            if (!hydra.audio.listening) {
                                hydra.audio.listen();
                            }
                            this.classList.toggle('orange');
                            deck.reactivity.on = !deck.reactivity.on;
                            if (!hydra.deck1.reactivity.on && !hydra.deck2.reactivity.on) {
                                hydra.audio.stopListening();
                            }
                        });

                        this.claimBtn = document.querySelector(`[data-deck="${deck.id}"][data-claim]`);
                        this.claimBtn.addEventListener('click', function(e) {
                            if (!e.target.classList.contains('on')) {
                                document.querySelectorAll(`[data-claim]`).forEach(btn => btn.classList.remove('on'));
                                e.target.classList.add('on');
                                hydra.keyboard.claimed = deck.id;
                            } else {
                                e.target.classList.remove('on');
                                hydra.keyboard.claimed = false;
                            }
                        });

                        this.guideBtn = document.querySelector(`[data-deck="${deck.id}"][data-guide]`);
                        this.guideBtn.addEventListener('click', function(e) {
                            if (deck.current.keyboardShortcuts) {
                                hydra.modal.showKeyboardShortcutTab();
                                hydra.modal.showKeyboardShortcutPanel(deck.visual.current);
                            } else {
                                hydra.modal.hideKeyboardShortcutTab();
                            }

                            if (deck.current.guide) {
                                hydra.modal.showGuideTab();
                                hydra.modal.showGuidePanel(deck.visual.current);
                            } else {
                                hydra.modal.hideGuideTab();
                            }

                            hydra.modal.open('guide');
                        });

                        this.revertBtn = document.querySelector(`[data-deck="${deck.id}"][data-revert]`);
                        this.revertBtn.addEventListener('click', function(e) {
                            deck.presets.select(deck.presets.current);
                        });

                        this.importFileInputs = document.querySelectorAll('[data-target="import-export"] input[type="file"]');
                        this.importFileInputs.forEach(importFileInput => {
                            importFileInput.addEventListener('change', function(e) {
                                const submitBtn = e.target.closest('form').querySelector('button');
                                submitBtn.disabled = false;
                            });
                        });

                        this.exportPresetsBtn = document.querySelector(`[data-deck="${deck.id}"][data-export-presets]`);
                        this.exportPresetsBtn.addEventListener('click', function(e) {
                            deck.presets.export();
                        });

                        this.factoryResetPresetsBtn = document.querySelector(`[data-deck="${deck.id}"][data-factory-reset-presets]`);
                        this.factoryResetPresetsBtn.addEventListener('click', function(e) {
                            deck.presets.reset();
                            const messageEl = e.target.closest('fieldset').querySelector('.message');
                            messageEl.textContent = 'Factory reset successful!';
                            setTimeout(() => {
                                messageEl.textContent = '';
                            }, 2000);
                        });

                        this.presetBtns = document.querySelectorAll(`.preset[data-deck="${deck.id}"]`);
                        this.presetBtns.forEach(btn => {
                            btn.addEventListener('click', function(e) {
                                if (!e.target.disabled) {
                                    deck.presets.select(e.target.dataset.preset);
                                }
                            });
                        });

                        this.prevPresetBtn = document.querySelector(`[data-deck="${deck.id}"][data-previous-preset]`);
                        this.prevPresetBtn.addEventListener('click', function(e) {
                            deck.presets.previous();
                        });

                        this.nextPresetBtn = document.querySelector(`[data-deck="${deck.id}"][data-next-preset]`);
                        this.nextPresetBtn.addEventListener('click', function(e) {
                            deck.presets.next();
                        });

                        this.tabBtns = document.querySelectorAll(`[data-deck="${deck.id}"][data-tab]`);
                        this.tabBtns.forEach(tabBtn => {
                            tabBtn.addEventListener('click', function(e) {
                                const relatedTabBtns = this.parentElement.parentElement.querySelectorAll(`[data-deck="${deck.id}"][data-tab]`);
                                relatedTabBtns.forEach(btn => btn.classList.remove('on'));
                                e.target.classList.add('on');

                                const tabPanels = document.querySelectorAll(`[data-deck="${deck.id}"] [data-tab-panel]`);
                                tabPanels.forEach(tabPanel => tabPanel.classList.add('hide'));

                                const tab = e.target.dataset.tab;
                                const tabPanel = document.querySelector(tab == 'renderer'
                                    ? `[data-deck="${deck.id}"] [data-tab-panel="${tab}"][data-visual="${deck.visual.current}"]`
                                    : `[data-deck="${deck.id}"] [data-tab-panel="${tab}"]`);
                                tabPanel.classList.remove('hide');
                                deck.visibleTab = tab;
                            });
                        });

                        ['scale', 'color', 'alpha', 'amp'].forEach(reactor => {
                            this[`${reactor}EnabledToggleBtn`] = document.querySelector(`[data-deck="${deck.id}"][data-${reactor}-enabled]`);
                            this[`${reactor}EnabledToggleBtn`].addEventListener('click', function(e) {
                                deck.reactivity[reactor].on = e.target.checked;
                            });

                            this[`${reactor}StrengthInput`] = document.querySelector(`[data-deck="${deck.id}"][data-${reactor}-strength]`);
                            this[`${reactor}StrengthInput`].addEventListener('input', function(e) {
                                deck.reactivity[reactor].strength = parseInt(e.target.value);
                                e.target.parentElement.querySelector('.value').textContent = e.target.value;
                            });

                            this[`${reactor}CauseToggleBtns`] = document.querySelectorAll(`[data-deck="${deck.id}"][data-${reactor}-cause]`);
                            this[`${reactor}CauseToggleBtns`].forEach(btn => {
                                btn.addEventListener('click', function(e) {
                                    deck.controls[`${reactor}CauseToggleBtns`].forEach(btn => btn.classList.remove('on'));
                                    e.target.classList.add('on');
                                    deck.reactivity[reactor].cause = e.target.textContent.toLowerCase();
                                });
                            });

                            this[`${reactor}EffectToggleBtns`] = document.querySelectorAll(`[data-deck="${deck.id}"][data-${reactor}-effect]`);
                            this[`${reactor}EffectToggleBtns`].forEach(btn => {
                                btn.addEventListener('click', function(e) {
                                    deck.controls[`${reactor}EffectToggleBtns`].forEach(btn => btn.classList.remove('on'));
                                    e.target.classList.add('on');
                                    deck.reactivity[reactor].effect = e.target.textContent.toLowerCase();
                                });
                            });
                        });

                        this.blurToggleBtn = document.querySelector(`[data-deck="${deck.id}"][data-blur-toggle]`);
                        this.blurToggleBtn.addEventListener('click', function(e) {
                            deck.filters.items.blur.on = e.target.checked;
                            deck.filters.update();
                        });

                        this.blurValueInput = document.querySelector(`[data-deck="${deck.id}"][data-blur-value]`);
                        this.blurValueInput.addEventListener('input', function(e) {
                            deck.filters.items.blur.change(parseInt(e.target.value));
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        })

                        this.brightnessToggleBtn = document.querySelector(`[data-deck="${deck.id}"][data-brightness-toggle]`);
                        this.brightnessToggleBtn.addEventListener('click', function(e) {
                            deck.filters.items.brightness.on = e.target.checked;
                            deck.filters.update();
                        });

                        this.brightnessValueInput = document.querySelector(`[data-deck="${deck.id}"][data-brightness-value]`);
                        this.brightnessValueInput.addEventListener('input', function(e) {
                            deck.filters.items.brightness.change(parseFloat(e.target.value));
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        })

                        this.contrastToggleBtn = document.querySelector(`[data-deck="${deck.id}"][data-contrast-toggle]`);
                        this.contrastToggleBtn.addEventListener('click', function(e) {
                            deck.filters.items.contrast.on = e.target.checked;
                            deck.filters.update();
                        });

                        this.contrastValueInput = document.querySelector(`[data-deck="${deck.id}"][data-contrast-value]`);
                        this.contrastValueInput.addEventListener('input', function(e) {
                            deck.filters.items.contrast.change(parseFloat(e.target.value));
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        })

                        this.dropShadowToggleBtn = document.querySelector(`[data-deck="${deck.id}"][data-drop-shadow-toggle]`);
                        this.dropShadowToggleBtn.addEventListener('click', function(e) {
                            deck.filters.items.dropShadow.on = e.target.checked;
                            deck.filters.update();
                        });

                        this.dropShadowColorInput = document.querySelector(`[data-deck="${deck.id}"][data-drop-shadow-color]`);
                        this.dropShadowColorInput.addEventListener('input', function(e) {
                            deck.filters.items.dropShadow.change(
                                parseInt(deck.controls.dropShadowOffsetXInput.value),
                                parseInt(deck.controls.dropShadowOffsetYInput.value),
                                parseInt(deck.controls.dropShadowBlurInput.value),
                                e.target.value
                            );
                        })

                        this.dropShadowOffsetXInput = document.querySelector(`[data-deck="${deck.id}"][data-drop-shadow-offset-x]`);
                        this.dropShadowOffsetXInput.addEventListener('input', function(e) {
                            deck.filters.items.dropShadow.change(
                                parseInt(e.target.value),
                                parseInt(deck.controls.dropShadowOffsetYInput.value),
                                parseInt(deck.controls.dropShadowBlurInput.value),
                                deck.controls.dropShadowColorInput.value
                            );
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        })

                        this.dropShadowOffsetYInput = document.querySelector(`[data-deck="${deck.id}"][data-drop-shadow-offset-y]`);
                        this.dropShadowOffsetYInput.addEventListener('input', function(e) {
                            deck.filters.items.dropShadow.change(
                                parseInt(deck.controls.dropShadowOffsetXInput.value),
                                parseInt(e.target.value),
                                parseInt(deck.controls.dropShadowBlurInput.value),
                                deck.controls.dropShadowColorInput.value
                            );
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        })

                        this.dropShadowBlurInput = document.querySelector(`[data-deck="${deck.id}"][data-drop-shadow-blur]`);
                        this.dropShadowBlurInput.addEventListener('input', function(e) {
                            deck.filters.items.dropShadow.change(
                                parseInt(deck.controls.dropShadowOffsetXInput.value),
                                parseInt(deck.controls.dropShadowOffsetYInput.value),
                                parseInt(e.target.value),
                                deck.controls.dropShadowColorInput.value
                            );
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        })

                        this.grayscaleToggleBtn = document.querySelector(`[data-deck="${deck.id}"][data-grayscale-toggle]`);
                        this.grayscaleToggleBtn.addEventListener('click', function(e) {
                            deck.filters.items.grayscale.on = e.target.checked;
                            deck.filters.update();
                        });

                        this.grayscaleValueInput = document.querySelector(`[data-deck="${deck.id}"][data-grayscale-value]`);
                        this.grayscaleValueInput.addEventListener('input', function(e) {
                            deck.filters.items.grayscale.change(parseFloat(e.target.value));
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        })

                        this.hueRotateToggleBtn = document.querySelector(`[data-deck="${deck.id}"][data-hue-rotate-toggle]`);
                        this.hueRotateToggleBtn.addEventListener('click', function(e) {
                            deck.filters.items.hueRotate.on = e.target.checked;
                            deck.filters.update();
                        });

                        this.hueRotateValueInput = document.querySelector(`[data-deck="${deck.id}"][data-hue-rotate-value]`);
                        this.hueRotateValueInput.addEventListener('input', function(e) {
                            deck.filters.items.hueRotate.change(parseFloat(e.target.value));
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        })

                        this.invertToggleBtn = document.querySelector(`[data-deck="${deck.id}"][data-invert-toggle]`);
                        this.invertToggleBtn.addEventListener('click', function(e) {
                            deck.filters.items.invert.on = e.target.checked;
                            deck.filters.update();
                        });

                        this.invertValueInput = document.querySelector(`[data-deck="${deck.id}"][data-invert-value]`);
                        this.invertValueInput.addEventListener('input', function(e) {
                            deck.filters.items.invert.change(parseFloat(e.target.value));
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        })

                        this.opacityToggleBtn = document.querySelector(`[data-deck="${deck.id}"][data-opacity-toggle]`);
                        this.opacityToggleBtn.addEventListener('click', function(e) {
                            deck.filters.items.opacity.on = e.target.checked;
                            deck.filters.update();
                        });

                        this.opacityValueInput = document.querySelector(`[data-deck="${deck.id}"][data-opacity-value]`);
                        this.opacityValueInput.addEventListener('input', function(e) {
                            deck.filters.items.opacity.change(parseFloat(e.target.value));
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        })

                        this.saturateToggleBtn = document.querySelector(`[data-deck="${deck.id}"][data-saturate-toggle]`);
                        this.saturateToggleBtn.addEventListener('click', function(e) {
                            deck.filters.items.saturate.on = e.target.checked;
                            deck.filters.update();
                        });

                        this.saturateValueInput = document.querySelector(`[data-deck="${deck.id}"][data-saturate-value]`);
                        this.saturateValueInput.addEventListener('input', function(e) {
                            deck.filters.items.saturate.change(parseFloat(e.target.value));
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        })

                        this.sepiaToggleBtn = document.querySelector(`[data-deck="${deck.id}"][data-sepia-toggle]`);
                        this.sepiaToggleBtn.addEventListener('click', function(e) {
                            deck.filters.items.sepia.on = e.target.checked;
                            deck.filters.update();
                        });

                        this.sepiaValueInput = document.querySelector(`[data-deck="${deck.id}"][data-sepia-value]`);
                        this.sepiaValueInput.addEventListener('input', function(e) {
                            deck.filters.items.sepia.change(parseFloat(e.target.value));
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;
                        });
                    }
                }

                deck.presets = {
                    current: 1,
                    init: function() {
                        this.presetsContainer = document.querySelector(`[data-deck="${deck.id}"].presets`);
                        this.presetBtns = this.presetsContainer.querySelectorAll('.preset');
                    },
                    reset: function() {
                        deck.current.presets = deck[deck.visual.current].presetsDefault;
                        this.updateBtns();
                    },
                    updateBtns: function() {
                        this.clearBtns();

                        if (deck.current.presets && deck.current.presets.length) {
                            deck.current.presets.forEach((preset, i) => {
                                deck.controls.presetBtns[i].disabled = false;
                            });
                            deck.presets.select(1)
                        } else {
                            console.debug('no presets found');
                        }
                    },
                    clearBtns: function() {
                        deck.controls.presetBtns.forEach(btn => {
                            btn.className = 'preset';
                            btn.disabled = true;
                        });
                    },
                    select: function(preset) {
                        if (this.presetsContainer.classList.contains('saving-preset')) {
                            try {
                                const currentPresetConfiguration = this.getCurrentPresetConfiguration();

                                deck.current.presets[preset-1] = currentPresetConfiguration.settings;

                                this.presetsContainer.classList.remove('saving-preset');

                                this.select(preset);

                                this.disableEmpty();

                            } catch(e) {
                                console.debug(e);
                            }

                        } else {
                            deck.controls.presetBtns.forEach(btn => {
                                btn.classList.remove('active');
                            });
                            deck.controls.presetBtns[preset-1].classList.add('active');
                            this.current = parseInt(preset);

                            deck.ctx.setTransform(1, 0, 0, 1, 0, 0);
                            deck.ctx.clearRect(0, 0, deck.canvas.width, deck.canvas.height);

                            const selectedPreset = deck.current.presets[preset-1];
                            this.load(selectedPreset);
                        }
                    },
                    previous: function() {
                        if (deck.current.presets && deck.current.presets.length) {
                            const previous = this.current == 1 ? deck.current.presets.length : (this.current - 1);
                            this.select(previous);
                        } else if (deck.current.managesOwnPresets) {
                            deck.current.previousPreset();
                        }
                    },
                    next: function() {
                        if (deck.current.presets && deck.current.presets.length) {
                            const next = this.current == deck.current.presets.length ? 1 : (this.current + 1);
                            this.select(next);
                        } else if (deck.current.managesOwnPresets) {
                            deck.current.nextPreset();
                        }
                    },
                    load: function(preset) {
                        for (const option in preset) {
                            // TODO get non-renderer variables here too and set them (effects, reactivity, randomisation)
                            let input = document.querySelectorAll(`[data-visual="${deck.visual.current}"][data-deck="${deck.id}"][data-variable="${option}"]`);

                            if (!input) {
                                console.debug(`No input found for: [data-visual="${deck.visual.current}"][data-deck="${deck.id}"][data-variable="${option}"]`)
                                continue;
                            }

                            // standard input
                            if (input.length == 1) {
                                input = input[0];

                                if (input.type == 'number' || input.type == 'range' || input.type == 'color' || input.type == 'textarea') {
                                    input.value = preset[option];
                                    input.dispatchEvent(new Event('input', { bubbles: true }));
                                } else if (input.type == 'checkbox') {
                                    input.checked = preset[option];
                                    input.dispatchEvent(new Event('input', { bubbles: true }));
                                } else if (input.type == 'submit') {
                                    deck.current[option] = preset[option];
                                    input.textContent = preset[option];
                                }

                            // grouped input (button radio switch group)
                            } else {
                                deck.current[option] = preset[option];
                                input.forEach(groupedInput => {
                                    if (groupedInput.textContent == preset[option]) {
                                        groupedInput.click();
                                    }
                                });
                            }

                            if (typeof deck.current.updateDisabledUIComponents == 'function') {
                                deck.current.updateDisabledUIComponents();
                            }
                        }
                    },
                    send: function(tooltip) {
                        const currentPresetConfiguration = JSON.stringify(this.getCurrentPresetConfiguration());
                        try {
                            navigator.clipboard
                                .writeText(currentPresetConfiguration).then(function() {
                                    console.debug('Preset copied!', currentPresetConfiguration);
                                    deck.presets.displayTooltip(tooltip, 'success', 'Copied to clipboard!');
                                }, function(err) {
                                    console.error('Could not copy preset: ', err);
                                    deck.presets.displayTooltip(tooltip, 'error', 'Failed to copy to clipboard');
                                });
                        } catch (err) {
                            deck.presets.displayTooltip(tooltip, 'error', 'Browser doesn\'t support clipboard API');
                        }
                    },
                    receive: function(tooltip) {
                        try {
                            navigator.clipboard
                                .readText().then(function(presetConfiguration) {
                                    presetConfiguration = JSON.parse(presetConfiguration);

                                    if (presetConfiguration.name !== deck.visual.current) {
                                        deck.presets.displayTooltip(tooltip, 'error', 'Preset is not valid for current visual renderer');
                                        throw new Error('Preset is not valid for current visual renderer');
                                    }

                                    deck.presets.load(presetConfiguration.settings);
                                    deck.presets.displayTooltip(tooltip, 'success', 'Loaded from clipboard!');
                                }, function(err) {
                                    console.error('Could not receive preset: ', err);
                                    deck.presets.displayTooltip(tooltip, 'error', 'Failed to load from clipboard');
                                });
                        } catch (err) {
                            deck.presets.displayTooltip(tooltip, 'error', 'Browser doesn\'t support clipboard API');
                        }
                    },
                    save: function() {
                        this.presetsContainer.classList.toggle('saving-preset');

                        if (this.presetsContainer.classList.contains('saving-preset')) {
                            if (deck.current.presets) {
                                const length = (deck.current.presets.length < 30) ? deck.current.presets.length + 1 : 30;
                                [...deck.presets.presetBtns].slice(0, length).forEach(preset => {
                                    preset.disabled = false;
                                });
                            } else {
                                deck.current.presets = [];
                                deck.presets.presetBtns[0].disabled = false;
                            }
                        } else {
                            this.disableEmpty();
                        }
                    },
                    import: function(target, input) {
                        if (typeof window.FileReader !== 'function') {
                            console.debug("The file API isn't supported on this browser yet.");
                            return;
                        } else if (!input.files) {
                            console.debug("This browser doesn't seem to support the `files` property of file inputs.");
                        } else if (!input.files[0]) {
                            console.debug("Please select a file before clicking 'Import'.");
                        } else if (input.files[0].type != 'application/json') {
                            console.debug("File selected for import is not a valid JSON file.");
                        } else {
                            const file = input.files[0];
                            const fr = new FileReader();

                            const messageEl = target.closest('fieldset').querySelector('.message');

                            fr.addEventListener(
                                'load',
                                (e) => {
                                    const data = e.target.result;
                                    const json = JSON.parse(data);
                                    let message;

                                    if (deck.visual.current == json.renderer) {
                                        deck.current.presets = json.presets;
                                        deck.presets.updateBtns();
                                        message = 'Import successful!';
                                    } else {
                                        message = 'Invalid presets for current renderer';
                                    }

                                    messageEl.textContent = message;
                                    setTimeout(() => {
                                        messageEl.textContent = '';
                                    }, 2000);
                                },
                                false,
                            );

                            fr.addEventListener(
                                'error',
                                () => {
                                    messageEl.textContent = 'Import failed';
                                    setTimeout(() => {
                                        messageEl.textContent = '';
                                    }, 2000);
                                },
                                false,
                            );

                            fr.readAsText(file);
                        }
                    },
                    export: function() {
                        const data = JSON.stringify({
                            renderer: deck.visual.current,
                            presets: deck.current.presets
                        });
                        hydra.files.export(data, deck.visual.current + '-presets.json', 'application/json');
                    },
                    getCurrentPresetConfiguration: function() {
                        const currentPresetConfiguration = {
                            name: deck.visual.current,
                            settings: {}
                        };
                        deck.current.inputs.forEach(input => {
                            if (input.dataset.variable) {
                                const inputs = document.querySelectorAll(`[data-visual="${deck.visual.current}"][data-deck="${deck.id}"][data-variable="${input.dataset.variable}"]`);
                                if (inputs.length > 1) {
                                    inputs.forEach(groupedInput => {
                                        if (groupedInput.classList.contains('on')) {
                                            currentPresetConfiguration.settings[input.dataset.variable] = groupedInput.textContent;
                                        }
                                    });
                                } else {
                                    if (input.type == 'number' || input.type == 'range' || input.type == 'color' || input.type == 'textarea') {
                                        currentPresetConfiguration.settings[input.dataset.variable] = input.value;
                                    } else if (input.type == 'checkbox') {
                                        currentPresetConfiguration.settings[input.dataset.variable] = input.checked;
                                    } else if (input.type == 'submit') {
                                        currentPresetConfiguration.settings[input.dataset.variable] = input.textContent;
                                    }
                                }
                            }
                        });
                        return currentPresetConfiguration;
                    },
                    disableEmpty: function() {
                        [...deck.presets.presetBtns].slice(deck.current.presets.length).forEach(preset => {
                            preset.disabled = true;
                        });
                    },
                    displayTooltip(tooltip, status, message) {
                        tooltip.textContent = message;
                        tooltip.classList.remove('hide', 'transparent');
                        tooltip.classList.add(status);
                        setTimeout(() => {
                            tooltip.classList.add('transparent');
                            setTimeout(() => {
                                tooltip.classList.add('hide');
                                tooltip.classList.remove(status);
                            }, 350);
                        }, 2000);
                    }
                }

                deck.reactivity = {
                    on: false,
                    defaults: {
                        scale: {
                            enabled: false,
                            on: false,
                            cause: 'average',
                            effect: 'add',
                            strength: 100
                        },
                        color: {
                            enabled: false,
                            on: false,
                            cause: 'average',
                            effect: 'add',
                            strength: 100
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
                    },
                    adjust: function(type, value) {
                        const strength = deck.reactivity[type].strength;
                        const cause = deck.reactivity[type].cause;
                        const effect = deck.reactivity[type].effect;

                        const impactor = window.hydra.audio[cause];

                        if (effect == 'add') {
                            return value + (impactor * (strength/10));
                        } else if (effect == 'subtract') {
                            const adjustedValue = value - (impactor * (strength/10));
                            return adjustedValue >= 0 ? adjustedValue : 0;
                        } else if (effect == 'multiply') {
                            return (value/100) * (impactor * strength);
                        }
                    },
                    init: function() {
                        this.inputs = [
                            deck.controls.scaleStrengthInput,
                        ];
                        this.scale = this.defaults.scale;
                        this.color = this.defaults.color;
                        this.alpha = this.defaults.alpha;
                        this.amp = this.defaults.amp;
                    },
                    update: function() {
                        const currentReactivityConfig = _.cloneDeep({...deck.reactivity.defaults, ...deck[deck.visual.current].reactivity});
                        for (let option in currentReactivityConfig) {
                            if (document.querySelector(`[data-deck="${deck.id}"][data-${option}-enabled]`).checked && (!currentReactivityConfig[option].on || !currentReactivityConfig[option].enabled)) {
                                document.querySelector(`[data-deck="${deck.id}"][data-${option}-enabled]`).click();
                            }

                            document.querySelector(`[data-deck="${deck.id}"][data-${option}-enabled]`).disabled = !currentReactivityConfig[option].enabled;
                            document.querySelector(`[data-deck="${deck.id}"][data-${option}-strength]`).disabled = !currentReactivityConfig[option].enabled;
                            document.querySelectorAll(`[data-deck="${deck.id}"][data-${option}-cause]`).forEach(item => item.disabled = !currentReactivityConfig[option].enabled)
                            document.querySelectorAll(`[data-deck="${deck.id}"][data-${option}-effect]`).forEach(item => item.disabled = !currentReactivityConfig[option].enabled)

                            if (currentReactivityConfig[option].enabled) {
                                document.querySelector(`[data-deck="${deck.id}"][data-${option}-strength]`).value = currentReactivityConfig[option].strength;
                                document.querySelector(`[data-deck="${deck.id}"][data-${option}-strength]`).closest('div').querySelector('.value').textContent = currentReactivityConfig[option].strength;
                                document.querySelector(`[data-deck="${deck.id}"][data-${option}-cause="${currentReactivityConfig[option].cause}"]`).click();
                                document.querySelector(`[data-deck="${deck.id}"][data-${option}-effect="${currentReactivityConfig[option].effect}"]`).click();
                            }

                            if (!document.querySelector(`[data-deck="${deck.id}"][data-${option}-enabled]`).checked && currentReactivityConfig[option].enabled && currentReactivityConfig[option].on) {
                                document.querySelector(`[data-deck="${deck.id}"][data-${option}-enabled]`).click();
                            }
                        }
                        deck.reactivity.scale = currentReactivityConfig.scale;
                        deck.reactivity.color = currentReactivityConfig.color;
                        deck.reactivity.alpha = currentReactivityConfig.alpha;
                        deck.reactivity.amp = currentReactivityConfig.amp;
                    }
                }

                deck.filters = {
                    items: {
                        blur: {
                            on: false,
                            label: 'blur',
                            value: 0,
                            toggle: function() {
                                this.on = !this.on;
                            },
                            change: function(value) {
                                this.value = `${value}px`;
                                deck.filters.update();
                            }
                        },
                        brightness: {
                            on: false,
                            label: 'brightness',
                            value: 1,
                            toggle: function() {
                                this.on = !this.on;
                            },
                            change: function(value) {
                                this.value = value;
                                deck.filters.update();
                            }
                        },
                        contrast: {
                            on: false,
                            label: 'contrast',
                            value: 1,
                            toggle: function() {
                                this.on = !this.on;
                            },
                            change: function(value) {
                                this.value = value;
                                deck.filters.update();
                            }
                        },
                        dropShadow: {
                            on: false,
                            label: 'drop-shadow',
                            value: null,
                            toggle: function() {
                                this.on = !this.on;
                            },
                            change: function(offsetX, offsetY, blurRadius, color) {
                                this.value = `${offsetX}px ${offsetY}px ${blurRadius}px ${color}`;
                                deck.filters.update();
                            }
                        },
                        grayscale: {
                            on: false,
                            label: 'grayscale',
                            value: 0,
                            toggle: function() {
                                this.on = !this.on;
                            },
                            change: function(value) {
                                this.value = value;
                                deck.filters.update();
                            }
                        },
                        hueRotate: {
                            on: false,
                            label: 'hue-rotate',
                            value: '0deg',
                            toggle: function() {
                                this.on = !this.on;
                            },
                            change: function(value) {
                                this.value = `${value}deg`;
                                deck.filters.update();
                            }
                        },
                        invert: {
                            on: false,
                            label: 'invert',
                            value: 0,
                            toggle: function() {
                                this.on = !this.on;
                            },
                            change: function(value) {
                                this.value = value;
                                deck.filters.update();
                            }
                        },
                        opacity: {
                            on: false,
                            label: 'opacity',
                            value: 1,
                            toggle: function() {
                                this.on = !this.on;
                            },
                            change: function(value) {
                                this.value = value;
                                deck.filters.update();
                            }
                        },
                        saturate: {
                            on: false,
                            label: 'saturate',
                            value: 1,
                            toggle: function() {
                                this.on = !this.on;
                            },
                            change: function(value) {
                                this.value = value;
                                deck.filters.update();
                            }
                        },
                        sepia: {
                            on: false,
                            label: 'sepia',
                            value: 0,
                            toggle: function() {
                                this.on = !this.on;
                            },
                            change: function(value) {
                                this.value = value;
                                deck.filters.update();
                            }
                        }
                    },
                    string: '',
                    update: function() {
                        this.string = 'none';
                        let stringItems = [];
                        let filter;
                        for (let item in deck.filters.items) {
                            filter =  deck.filters.items[item];
                            if (filter.on) {
                                stringItems.push(`${filter.label}(${filter.value})`);
                            }
                        }
                        if (stringItems.length) {
                            this.string = stringItems.join(' ');
                        }
                    },
                    apply: function() {
                        deck.pipeCtx.filter = deck.filters.string;
                    },
                    init: function() {
                        this.inputs = [
                            deck.controls.blurToggleBtn,
                            deck.controls.blurValueInput,
                            deck.controls.brightnessToggleBtn,
                            deck.controls.brightnessValueInput,
                            deck.controls.contrastToggleBtn,
                            deck.controls.contrastValueInput,
                            deck.controls.dropShadowToggleBtn,
                            deck.controls.dropShadowColorInput,
                            deck.controls.dropShadowOffsetXInput,
                            deck.controls.dropShadowOffsetYInput,
                            deck.controls.dropShadowBlurInput,
                            deck.controls.grayscaleToggleBtn,
                            deck.controls.grayscaleValueInput,
                            deck.controls.hueRotateToggleBtn,
                            deck.controls.hueRotateValueInput,
                            deck.controls.invertToggleBtn,
                            deck.controls.invertValueInput,
                            deck.controls.opacityToggleBtn,
                            deck.controls.opacityValueInput,
                            deck.controls.saturateToggleBtn,
                            deck.controls.saturateValueInput,
                            deck.controls.sepiaToggleBtn,
                            deck.controls.sepiaValueInput,
                        ];
                    }
                };

                deck.mouse = {
                    init: function() {
                        deck.mouse.x = 0;
                        deck.mouse.y = 0;
                        deck.mouse.lockedPosition = false;

                        deck.pipeCanvas.addEventListener('click', function() {
                            deck.mouse.lockedPosition = !deck.mouse.lockedPosition;
                        });
                    }
                }

                deck.render = () => {
                    deck.current.render();
                }

                deck.presets.init();
                deck.readouts.init();
                deck.controls.init();
                deck.reactivity.init();
                deck.filters.init();
                deck.randomisation.init();
                deck.mouse.init();

                for (const renderer in hydra.renderers) {
                    deck = hydra.renderers[renderer].init(deck);
                }

                deck.visual.select(visual);

                return deck;
            }
        },
        renderers: {},
        guides: {},
        renderer: {
            init: function(deck, name, config) {

                const {defaults, ui, presets, keyboardShortcuts, guide} = config;

                // merge any incoming defaults with our initial renderer object
                deck[name] = {...{}, ...defaults};

                // fetch our presets (json) via ajax
                if (presets) {
                    this.importPresets(deck, name, presets);
                }

                // inject renderer tab markup here...
                if (ui) {
                    hydra.markup.injectRendererTabUI(deck, name, ui);
                }

                if (keyboardShortcuts && Object.keys(keyboardShortcuts).length) {
                    if (deck[name].keyboardShortcuts === undefined) {
                        deck[name].keyboardShortcuts = keyboardShortcuts;
                        hydra.markup.injectRendererKeyboardShortcutUI(deck, name, keyboardShortcuts);
                    }
                }

                // initialise guide
                if (guide && guide.content && guide.content.length) {
                    if (hydra.guides.name === undefined) {
                        hydra.guides[name] = guide;
                        hydra.markup.injectRendererGuideUI(deck, name, guide);
                    }
                }

                // apply event listeners
                const inputs = document.querySelectorAll(`[data-deck="${deck.id}"][data-visual="${name}"][data-variable]`);
                inputs.forEach((input, index) => {

                    deck[name][`${input.dataset.variable}Input`] = input;

                    if (input.type == 'checkbox') {
                        deck[name][input.dataset.variable] = input.checked;

                        input.addEventListener('input', function(e) {
                            deck[name][input.dataset.variable] = e.target.checked;
                        });
                    } else if (input.type == 'number' || input.type == 'range') {
                        const isInt = (Number.isInteger(input.step) || input.step === undefined);

                        deck[name][input.dataset.variable] = isInt
                            ? parseInt(input.value)
                            : parseFloat(input.value);

                        input.addEventListener('input', function(e) {
                            deck[name][input.dataset.variable] = isInt
                                ? parseInt(e.target.value)
                                : parseFloat(e.target.value);
                            e.target.parentElement.querySelector('.value').textContent = e.target.value;

                            hydra.helpers.dispatchEvent(deck, name, e.target.dataset.dispatchEvent, 'input')
                            hydra.helpers.triggerFunction(deck, name, e.target.dataset.trigger);
                        });
                    } else if (input.type == 'color') {
                        deck[name][input.dataset.variable] = hydra.helpers.hexToRgb(input.value);

                        input.addEventListener('input', function(e) {
                            deck[name][input.dataset.variable] = hydra.helpers.hexToRgb(e.target.value);
                        });
                    } else if (input.type == 'submit') {

                        const buttonsWithSameVariableAssignment = document.querySelectorAll(`[data-deck="${deck.id}"][data-visual="${name}"][data-variable="${input.dataset.variable}"]`);
                        const belongsToButtonRadioSwitchGroup = buttonsWithSameVariableAssignment.length > 1;

                        if (belongsToButtonRadioSwitchGroup) {

                            const btnRadioSwitchGroupItems = buttonsWithSameVariableAssignment;

                            deck[name][`${input.dataset.variable}Inputs`] = btnRadioSwitchGroupItems;

                            btnRadioSwitchGroupItems.forEach(btnRadioSwitchGroupItem => {

                                btnRadioSwitchGroupItem.addEventListener('click', function(e) {
                                    btnRadioSwitchGroupItems.forEach(item => {
                                        item.classList.remove('on');
                                    });
                                    e.target.classList.add('on');
                                    deck[name][input.dataset.variable] = btnRadioSwitchGroupItem.textContent;
                                });

                                if (btnRadioSwitchGroupItem.classList.contains('on')) {
                                    deck[name][input.dataset.variable] = btnRadioSwitchGroupItem.textContent;
                                }
                            });

                        } else {
                            deck[name][input.dataset.variable] = input.textContent;
                            input.options = input.dataset.options?.split(',') || [];

                            input.addEventListener('click', function(e) {
                                if (input.options.length) {
                                    const index = input.options.indexOf(e.target.textContent);
                                    const option = input.options[index+1] !== undefined ? input.options[index+1] : input.options[0];

                                    deck[name][input.dataset.variable] = option;
                                    input.textContent = option;
                                }

                                hydra.helpers.dispatchEvent(deck, name, e.target.dataset.dispatchEvent, 'input')
                                hydra.helpers.triggerFunction(deck, name, e.target.dataset.trigger);
                            });
                        }

                    } else if (input.tagName == 'SELECT') {
                        deck[name][input.dataset.variable] = input.value;

                        input.addEventListener('change', function(e) {
                            deck[name][input.dataset.variable] = input.value;
                        });
                    } else if (input.type == 'textarea') {
                        deck[name][input.dataset.variable] = input.value;

                        input.addEventListener('input', function(e) {
                            deck[name][input.dataset.variable] = e.target.value;
                        });
                    }

                });

                // insert renderer randomisation markup here
                if (ui) {
                    hydra.markup.injectRandomisationTabUI(deck, name, ui);
                }

                const effectsRandomisationInputs = document.querySelectorAll(`[data-deck="${deck.id}"] [data-tab-panel="randomisation"] .effects input[type="checkbox"]`);
                const rendererRandomisationInputs = document.querySelectorAll(`[data-deck="${deck.id}"] [data-tab-panel="randomisation"] [data-visual="${name}"].renderer input[type="checkbox"]`);

                // merge all our possible inputs into the deck
                deck[name].inputs = [...inputs, ...deck.filters.inputs, ...deck.reactivity.inputs, ...effectsRandomisationInputs, ...rendererRandomisationInputs];

                return deck[name];
            },
            importPresets: function(deck, name, json) {
                fetch(json)
                    .then((response) => response.json())
                    .then((responseData) => responseData.presets)
                    .then(response => (deck[name].presets = response))
                    .then(response => {
                        // assigning our defaults for factory reset usage
                        deck[name].presetsDefault = [...response];

                        // if the renderer is in use by the deck, dispatch a notification
                        if (deck.visual.current == name) {
                            deck.visual.select(name);
                            window.dispatchEvent(new CustomEvent('presets-loaded', { detail: deck.id }));
                        }
                    });
            }
        },
        crossfader: {
            init: function() {
                this.display = document.getElementById('crossfader-display');
                this.input = document.getElementById('crossfader');

                this.calculateAlphas = (crossfaderValue) => {
                    crossfaderValue = parseFloat(crossfaderValue);
                    hydra.deck1.crossfaderAlpha = 1 - crossfaderValue <= 1 ? 1 - crossfaderValue : 1;
                    hydra.deck2.crossfaderAlpha = 1 + crossfaderValue <= 1 ? 1 + crossfaderValue : 1;
                };

                this.updateDisplay = () => {
                    this.display.innerText = `D1 ${hydra.helpers.formatValue(hydra.deck1.crossfaderAlpha, 4)} -.- D2 ${hydra.helpers.formatValue(hydra.deck2.crossfaderAlpha, 4)}`;
                };

                this.input.addEventListener('input', function(e) {
                    hydra.crossfader.calculateAlphas(e.target.value);
                    hydra.crossfader.updateDisplay();
                });

                this.updateDisplay();

                return crossfader;
            }
        },
        composition: {
            init: function() {
                this.selector = document.getElementById('composition-mode-selector');
                this.options = this.selector.querySelectorAll('option');

                this.setMode = (mode) => {
                    hydra.mixedCtx.globalCompositeOperation = mode;
                };
                this.previousMode = () => {
                    const current = this.selector.selectedIndex;
                    this.selector.value = this.options[(current - 1) >= 0 ? current - 1 : this.options.length - 1].value;
                    this.selector.dispatchEvent(new Event('input', { bubbles: true }));
                };
                this.nextMode = () => {
                    const current = this.selector.selectedIndex;
                    this.selector.value = this.options[(current + 1) < this.options.length ? current + 1 : 0].value;
                    this.selector.dispatchEvent(new Event('input', { bubbles: true }));
                };
            }
        },
        effects: {
            init: function() {
                this.kaleidoscope = {};

                this.kaleidoscope.output = {
                    enabled: false,
                    angle: 68,
                    toggle: document.getElementById('kaleidoscope-output-toggle')
                };
                this.kaleidoscope.deck1 = {
                    enabled: false,
                    angle: 68,
                    toggle: document.getElementById('kaleidoscope-deck1-toggle')
                };
                this.kaleidoscope.deck2 = {
                    enabled: false,
                    angle: 68,
                    toggle: document.getElementById('kaleidoscope-deck2-toggle')
                };

                this.kaleidoscope.sliderContainers = document.querySelectorAll('.kaleidoscope-slider-container');
                this.kaleidoscope.toggles = document.querySelectorAll('.kaleidoscope-toggle');
                this.kaleidoscope.angleInputs = document.querySelectorAll('.kaleidoscope-angle');

                this.kaleidoscope.clip = (ctx, canvas) => {
                    ctx.save();

                    ctx.beginPath();
                    ctx.moveTo(canvas.width/2, canvas.height/2);
                    ctx.lineTo(canvas.width,0);
                    ctx.lineTo(canvas.width/2, 0);
                    ctx.closePath();
                    ctx.clip();
                };

                this.kaleidoscope.apply = (ctx, canvas, angle) => {
                    ctx.restore();

                    ctx.save();
                    ctx.translate(0, 0);
                    ctx.beginPath();
                    ctx.moveTo(canvas.width/2, canvas.height/2);
                    ctx.lineTo(canvas.width, canvas.height/2);
                    ctx.lineTo(canvas.width, 0);
                    ctx.lineTo(canvas.width/2, 0);
                    ctx.closePath();
                    ctx.clip();

                    ctx.save();
                    ctx.translate(canvas.width/2, canvas.height/2);
                    ctx.rotate((Math.PI / 180) * -angle);
                    ctx.translate(-canvas.width/2, -canvas.height/2);
                    ctx.scale(1,-1);
                    ctx.drawImage(canvas, 0, -canvas.height);
                    ctx.scale(1,-1);

                    ctx.drawImage(canvas, 0, canvas.height);
                    ctx.restore();
                    ctx.restore();

                    ctx.save();
                    ctx.scale(1,-1);
                    ctx.drawImage(canvas, 0, -canvas.height);
                    ctx.restore();

                    ctx.save();
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1,1);
                    ctx.drawImage(canvas, 0, 0);
                    ctx.restore();
                }

                this.kaleidoscope.toggles.forEach(toggle => {
                    toggle.addEventListener('click', function(e) {
                        const target = e.target.dataset.target;
                        const angleInput = e.target.parentElement.parentElement.parentElement.querySelector('.kaleidoscope-angle');
                        const sliderContainer = e.target.parentElement.parentElement.parentElement.querySelector('.kaleidoscope-slider-container');
                        e.target.classList.toggle('on');
                        hydra.effects.kaleidoscope[target].enabled = e.target.classList.contains('on');
                        sliderContainer.classList.toggle('disabled');

                        if (hydra.effects.kaleidoscope[target].enabled && hydra.effects.mirror[target].enabled) {
                            hydra.effects.mirror[target].toggle.dispatchEvent(new Event('click', { bubbles: true }));
                        }

                        if (hydra.effects.kaleidoscope[target].enabled && hydra.effects.radial[target].enabled) {
                            hydra.effects.radial[target].toggle.dispatchEvent(new Event('click', { bubbles: true }));
                        }
                    });
                });

                this.kaleidoscope.angleInputs.forEach(angleInput => {
                    angleInput.addEventListener('input', function(e) {
                        const target = e.target.dataset.target;
                        hydra.effects.kaleidoscope[target].angle = parseFloat(e.target.value);
                        e.target.parentElement.querySelector('.value').textContent = e.target.value;
                    });
                });

                this.mirror = {}

                this.mirror.output = {
                    enabled: false,
                    mode: 'vert',
                    startPosition: 'top-right',
                    layerMode: 'screen',
                    toggle: document.getElementById('mirror-output-toggle')
                };
                this.mirror.deck1 = {
                    enabled: false,
                    mode: 'vert',
                    startPosition: 'top-right',
                    layerMode: 'screen',
                    toggle: document.getElementById('mirror-deck1-toggle')
                };
                this.mirror.deck2 = {
                    enabled: false,
                    mode: 'vert',
                    startPosition: 'top-right',
                    layerMode: 'screen',
                    toggle: document.getElementById('mirror-deck2-toggle')
                };

                this.mirror.toggles = document.querySelectorAll('.mirror-toggle');
                this.mirror.mirrorModeBtns = document.querySelectorAll('.mirror-mode');
                this.mirror.mirrorStartPositionBtns = document.querySelectorAll('.mirror-start-position');
                this.mirror.mirrorLayerModeSelects = document.querySelectorAll('.mirror-layer-mode-selector');

                this.mirror.clip = (ctx, canvas, mode, startPosition) => {
                    ctx.save();

                    if (mode == 'vert') {
                        if (startPosition == 'top-right' || startPosition == 'bottom-right') {
                            ctx.beginPath();
                            ctx.moveTo(canvas.width/2, 0);
                            ctx.lineTo(canvas.width, 0);
                            ctx.lineTo(canvas.width, canvas.height);
                            ctx.lineTo(canvas.width/2, canvas.height);
                            ctx.closePath();
                            ctx.clip();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(canvas.width/2, 0);
                            ctx.lineTo(canvas.width/2, canvas.height);
                            ctx.lineTo(0, canvas.height);
                            ctx.closePath();
                            ctx.clip();
                        }
                    }

                    if (mode == 'hori') {
                        if (startPosition == 'top-right' || startPosition == 'top-left') {
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(canvas.width, 0);
                            ctx.lineTo(canvas.width, canvas.height/2);
                            ctx.lineTo(0, canvas.height/2);
                            ctx.closePath();
                            ctx.clip();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(0, canvas.height/2);
                            ctx.lineTo(canvas.width, canvas.height/2);
                            ctx.lineTo(canvas.width, canvas.height);
                            ctx.lineTo(0, canvas.height);
                            ctx.closePath();
                            ctx.clip();
                        }
                    }

                    if (mode == 'quad') {
                        if (startPosition == 'top-right') {
                            ctx.beginPath();
                            ctx.moveTo(canvas.width/2, 0);
                            ctx.lineTo(canvas.width, 0);
                            ctx.lineTo(canvas.width, canvas.height/2);
                            ctx.lineTo(canvas.width/2, canvas.height/2);
                            ctx.closePath();
                            ctx.clip();
                        } else if (startPosition == 'bottom-right') {
                            ctx.beginPath();
                            ctx.moveTo(canvas.width/2, canvas.height/2);
                            ctx.lineTo(canvas.width, canvas.height/2);
                            ctx.lineTo(canvas.width, canvas.height);
                            ctx.lineTo(canvas.width/2, canvas.height);
                            ctx.closePath();
                            ctx.clip();
                        } else if (startPosition == 'bottom-left') {
                            ctx.beginPath();
                            ctx.moveTo(0, canvas.height/2);
                            ctx.lineTo(canvas.width/2, canvas.height/2);
                            ctx.lineTo(canvas.width/2, canvas.height);
                            ctx.lineTo(0, canvas.height);
                            ctx.closePath();
                            ctx.clip();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(canvas.width/2, 0);
                            ctx.lineTo(canvas.width/2, canvas.height/2);
                            ctx.lineTo(0, canvas.height/2);
                            ctx.closePath();
                            ctx.clip();
                        }
                    }
                };

                this.mirror.apply = (ctx, canvas, mode, layerMode) => {
                    if (mode == 'vert' || mode == 'hori' || mode == 'quad') {
                        ctx.restore();
                    }

                    if (mode == 'quad' || mode == 'hori') {
                        ctx.save();
                        ctx.translate(0, canvas.height);
                        ctx.scale(1,-1);
                        ctx.drawImage(canvas, 0, 0);
                        ctx.restore();
                    }

                    if (mode !== 'hori') {
                        ctx.save();
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1,1);
                        if (mode == 'layer') {
                            ctx.globalCompositeOperation = layerMode;
                        }
                        ctx.drawImage(canvas, 0, 0);
                        ctx.restore();
                    }
                }

                this.mirror.toggles.forEach(toggle => {
                    toggle.addEventListener('click', function(e) {
                        const target = e.target.dataset.target;
                        const mirrorMode = e.target.parentElement.parentElement.querySelector('.mirror-mode');
                        e.target.classList.toggle('on');
                        hydra.effects.mirror[target].enabled = e.target.classList.contains('on');

                        const mirrorModeCycleBtnsContainer = e.target.parentElement.parentElement.parentElement.querySelector('.mirror-mode-buttons-container');
                        mirrorModeCycleBtnsContainer.classList.toggle('disabled');

                        const mirrorStartPositionCycleBtnsContainer = e.target.parentElement.parentElement.parentElement.querySelector('.mirror-start-position-buttons-container');
                        mirrorStartPositionCycleBtnsContainer.classList.toggle('disabled');

                        const mirrorLayerModeSelectContainer = e.target.parentElement.parentElement.parentElement.querySelector('.mirror-layer-mode-selector-container');
                        if (hydra.effects.mirror[target].mode == 'layer') {
                            mirrorLayerModeSelectContainer.classList.remove('disabled');
                        } else {
                            mirrorLayerModeSelectContainer.classList.add('disabled');
                        }

                        if (hydra.effects.mirror[target].enabled && hydra.effects.kaleidoscope[target].enabled) {
                            hydra.effects.kaleidoscope[target].toggle.dispatchEvent(new Event('click', { bubbles: true }));
                        }

                        if (hydra.effects.mirror[target].enabled && hydra.effects.radial[target].enabled) {
                            hydra.effects.radial[target].toggle.dispatchEvent(new Event('click', { bubbles: true }));
                        }
                    });
                });

                this.mirror.mirrorModeBtns.forEach(mirrorModeBtn => {
                    mirrorModeBtn.addEventListener('click', function(e) {
                        const mirrorModeBtns = e.target.parentElement.parentElement.querySelectorAll('.mirror-mode')
                        mirrorModeBtns.forEach(btn => {
                            btn.classList.remove('vert','hori','quad','layer');
                        });
                        const target = e.target.dataset.target;
                        hydra.effects.mirror[target].mode = e.target.textContent;
                        e.target.classList.add(e.target.textContent);

                        const mirrorLayerModeSelectContainer = e.target.parentElement.parentElement.parentElement.parentElement.querySelector('.mirror-layer-mode-selector-container');
                        if (hydra.effects.mirror[target].mode == 'layer') {
                            mirrorLayerModeSelectContainer.classList.remove('disabled');
                        } else {
                            mirrorLayerModeSelectContainer.classList.add('disabled');
                        }
                    });
                });

                this.mirror.mirrorStartPositionBtns.forEach(mirrorStartPositionBtn => {
                    mirrorStartPositionBtn.addEventListener('click', function(e) {
                        const mirrorStartPositionBtns = e.target.parentElement.parentElement.querySelectorAll('.mirror-start-position')
                        mirrorStartPositionBtns.forEach(btn => {
                            btn.classList.remove('active');
                        });
                        const target = e.target.dataset.target;
                        hydra.effects.mirror[target].startPosition = e.target.dataset.startPosition;
                        e.target.classList.add('active');
                    });
                });

                this.mirror.mirrorLayerModeSelects.forEach(mirrorLayerModeSelect => {
                    mirrorLayerModeSelect.addEventListener('change', function(e) {
                        const target = e.target.dataset.target;
                        hydra.effects.mirror[target].layerMode = this.value;
                    });
                });

                this.radial = {};

                this.radial.output = {
                    enabled: false,
                    mode: 'one',
                    clipAngle: 10,
                    applyAngle: 10,
                    toggle: document.getElementById('radial-output-toggle')
                };
                this.radial.deck1 = {
                    enabled: false,
                    mode: 'one',
                    clipAngle: 10,
                    applyAngle: 10,
                    toggle: document.getElementById('radial-deck1-toggle')
                };
                this.radial.deck2 = {
                    enabled: false,
                    mode: 'one',
                    clipAngle: 10,
                    applyAngle: 10,
                    toggle: document.getElementById('radial-deck2-toggle')
                };

                this.radial.sliderContainers = document.querySelectorAll('.radial-slider-container');
                this.radial.toggles = document.querySelectorAll('.radial-toggle');
                this.radial.radialModeBtns = document.querySelectorAll('.radial-mode');
                this.radial.angleInputs = document.querySelectorAll('.radial-angle');

                this.radial.clip = (ctx, canvas, angle) => {
                    ctx.save();

                    const hypotenuse = canvas.width/2;
                    const opposite = hypotenuse * Math.sin(angle * Math. PI / 180.0);

                    ctx.beginPath();
                    ctx.moveTo(canvas.width/2, canvas.height/2);
                    ctx.lineTo(canvas.width, canvas.height/2);
                    ctx.lineTo(canvas.width, canvas.height/2 + opposite);
                    ctx.closePath();
                    ctx.clip();
                };

                this.radial.apply = (ctx, canvas, mode, angle) => {
                    ctx.restore();

                    if (mode == 'one') {
                        for (let i = 0; i < 360; i += angle) {
                            ctx.save();
                            ctx.translate(canvas.width/2, canvas.height/2);
                            ctx.rotate((Math.PI / 180) * i);
                            ctx.translate(-canvas.width/2, -canvas.height/2);
                            ctx.scale(1,-1);
                            ctx.drawImage(canvas, 0, -canvas.height);
                            ctx.scale(1,-1);
                            ctx.restore();
                        }
                    } else if (mode == 'two') {
                        for (let i = 0; i < 360; i += angle) {
                            ctx.save();
                            ctx.translate(canvas.width/2, canvas.height/2);
                            ctx.rotate((Math.PI / 180) * (i*2));
                            ctx.translate(-canvas.width/2, -canvas.height/2);
                            ctx.scale(1,-1);
                            ctx.drawImage(canvas, 0, -canvas.height);
                            ctx.scale(1,-1);
                            ctx.restore();
                        }
                    } else if (mode == 'three') {
                        for (let i = 0; i < 360; i += angle) {
                            ctx.save();
                            ctx.translate(canvas.width/2, canvas.height/2);
                            ctx.rotate((Math.PI / 180) * i);
                            ctx.translate(-canvas.width/2, -canvas.height/2);
                            ctx.drawImage(canvas, 0, 0);
                            ctx.restore();
                        }
                    }
                }

                this.radial.toggles.forEach(toggle => {
                    toggle.addEventListener('click', function(e) {
                        const target = e.target.dataset.target;
                        const sliderContainers = e.target.parentElement.parentElement.parentElement.querySelectorAll('.radial-slider-container');
                        e.target.classList.toggle('on');
                        hydra.effects.radial[target].enabled = e.target.classList.contains('on');

                        sliderContainers.forEach(sliderContainer => sliderContainer.classList.toggle('disabled'));

                        const radialModeCycleBtnsContainer = e.target.parentElement.parentElement.parentElement.querySelector('.radial-mode-buttons-container');
                        radialModeCycleBtnsContainer.classList.toggle('disabled');

                        if (hydra.effects.radial[target].enabled && hydra.effects.mirror[target].enabled) {
                            hydra.effects.mirror[target].toggle.dispatchEvent(new Event('click', { bubbles: true }));
                        }

                        if (hydra.effects.radial[target].enabled && hydra.effects.kaleidoscope[target].enabled) {
                            hydra.effects.kaleidoscope[target].toggle.dispatchEvent(new Event('click', { bubbles: true }));
                        }
                    });
                });

                this.radial.radialModeBtns.forEach(radialModeBtn => {
                    radialModeBtn.addEventListener('click', function(e) {
                        const radialModeBtns = e.target.parentElement.parentElement.querySelectorAll('.radial-mode')
                        radialModeBtns.forEach(btn => {
                            btn.classList.remove('one','two','three');
                        });
                        const target = e.target.dataset.target;
                        hydra.effects.radial[target].mode = e.target.textContent;
                        e.target.classList.add(e.target.textContent);
                    });
                });

                this.radial.angleInputs.forEach(angleInput => {
                    angleInput.addEventListener('input', function(e) {
                        const target = e.target.dataset.target;
                        const type = e.target.dataset.type;
                        const angle = parseFloat(e.target.value);

                        if (type == 'both') {
                            hydra.effects.radial[target].clipAngle = angle;
                            hydra.effects.radial[target].applyAngle = angle;
                        } else {
                            hydra.effects.radial[target][`${type}Angle`] = angle;
                        }

                        e.target.parentElement.querySelector('.value').textContent = e.target.value;
                    });
                });
            }
        },
        handlers: {
            init: function() {
                const deckResetBtns = document.querySelectorAll('.reset');
                deckResetBtns.forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        hydra[`deck${e.target.dataset.deck}`].visual.reset();
                    });
                })

                const raiseToTopBtns = document.querySelectorAll('.raise-to-top');
                raiseToTopBtns.forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        raiseToTopBtns.forEach(button => {
                            button.classList.remove('raised');
                        });
                        e.target.classList.add('raised');
                        if (e.target.dataset.deck == 1) {
                            hydra.deck1.raised = true;
                            hydra.deck2.raised = false;
                        } else {
                            hydra.deck1.raised = false;
                            hydra.deck2.raised = true;
                        }
                    });
                });

                const modeInput = document.getElementById('composition-mode-selector');
                modeInput.addEventListener('input', function(e) {
                    hydra.mixedCtx.globalCompositeOperation = e.target.value;
                });

                const settingsOpenBtn = document.getElementById('modal-open');
                settingsOpenBtn.addEventListener('click', function(e) {
                    hydra.modal.open('settings');
                });

                const modalCloseBtn = document.getElementById('modal-close');
                modalCloseBtn.addEventListener('click', function(e) {
                    hydra.modal.close();
                });

                const launchCanvasSelectorBtns = document.querySelectorAll('[data-canvas-to-stream]');
                launchCanvasSelectorBtns.forEach(launchCanvasSelectorBtn => {
                    launchCanvasSelectorBtn.addEventListener('click', function(e) {
                        launchCanvasSelectorBtns.forEach(btn => btn.classList.remove('on'));
                        launchCanvasSelectorBtn.classList.add('on');
                        hydra.streamer.canvasToStream = e.target.dataset.canvasToStream;
                    });
                });

                const launchBtn = document.getElementById('launch');
                launchBtn.addEventListener('click', function(e) {
                    hydra.streamer.launch();
                });

                const recordBtn = document.getElementById('record');
                recordBtn.addEventListener('click', function(e) {
                    if (!hydra.recorder.initialised) {
                        hydra.recorder.init(hydra.mixedCanvas, 5000000);
                    }
                    if (e.target.textContent == 'Record') {
                        hydra.recorder.start();
                        e.target.textContent = 'Stop';
                    } else {
                        hydra.recorder.stop();
                        e.target.textContent = 'Record';
                    }
                });

                const tapBpmBtn = document.getElementById('tap-bpm');
                tapBpmBtn.addEventListener('click', function(e) {
                    hydra.audio.bpm.calculate();
                });

                const syncBtn = document.getElementById('sync');
                syncBtn.addEventListener('click', function(e) {
                    hydra.audio.bpm.sync();
                });

                const assignBtn = document.getElementById('assign');
                assignBtn.addEventListener('click', function(e) {
                    if (hydra.body.classList.contains('assigning')) {
                        hydra.midi.cancelAssignment();
                    } else {
                        hydra.body.classList.add('assigning');
                    }
                });

                const assignableInputs = document.querySelectorAll('[data-assignable]');
                assignableInputs.forEach(assignableInput => {
                    assignableInput.addEventListener('mousedown', function(e) {
                        if (hydra.body.classList.contains('assigning')) {
                            hydra.midi.assigning = assignableInput.querySelector('input') || assignableInput.querySelector('button');
                            hydra.body.classList.add('selected');
                        }
                    });
                });

                const importBtns = document.querySelectorAll('[data-import]');
                importBtns.forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const type = e.target.parentElement.parentElement.dataset.type
                        const input = e.target.parentNode.elements[0];

                        if (type =='presets') {
                            const deck = e.target.dataset.deck;
                            hydra[`deck${deck}`].presets.import(e.target, input);
                        } else {
                            hydra.midi.import(e.target, input);
                        }
                    });
                });

                const exportMidiAssignmentsBtn = document.querySelector('[data-export-midi-assignments]');
                exportMidiAssignmentsBtn.addEventListener('click', function(e) {
                    hydra.midi.export();
                });

                const factoryResetMidiAssignmentsBtn = document.querySelector('[data-factory-reset-midi-assignments]');
                factoryResetMidiAssignmentsBtn.addEventListener('click', function(e) {
                    hydra.midi.reset();
                });

                const resolutionSelector = document.getElementById('resolution-selector');
                resolutionSelector.addEventListener('change', function(e) {
                    hydra.resolution.current = this.value;
                    hydra.helpers.detectSizes();

                    let ratio;

                    if (hydra.resolution.current == 'match') {
                        ratio = 1;
                    } else {
                        const width = this.value == '720p' ? 1280 : 1920;
                        ratio = width / hydra.mixedCanvas.getBoundingClientRect().width;
                    }

                    hydra.resolution.ratio = ratio;
                    hydra.resolution.ratio = ratio;
                });
            }
        },
        modal: {
            isOpen: false,
            init: function() {
                this.element = document.getElementById('modal');
                this.guideSection = this.element.querySelector('.guide.modal-section');
                this.guideSectionKeyboardShortcutTab = this.guideSection.querySelector('[data-tab-target="keyboard-shortcuts"]');
                this.guideSectionGuideTab = this.guideSection.querySelector('[data-tab-target="user-guide"]');

                const tabs = this.element.querySelectorAll('.tab');
                tabs.forEach(tab => {
                    tab.addEventListener('click', function(e) {
                        const tabTarget = e.target.dataset.tabTarget;

                        const relatedTabs = e.target.closest('.tabs').querySelectorAll('.tab');
                        relatedTabs.forEach(tab => tab.classList.remove('active'));

                        e.target.classList.add('active');

                        const section = e.target.closest('.modal-section');
                        const sections = section.querySelectorAll(':scope > div');
                        sections.forEach(section => section.classList.add('hide'));
                        section.querySelector(`[data-target="${tabTarget}"]`).classList.remove('hide');
                    });
                });
            },
            open: function(section) {
                this.element.classList.remove('hide');
                this.element.querySelectorAll('.modal-section').forEach(section => {
                    section.classList.add('hide');
                });
                this.element.querySelector(`.${section}`).classList.remove('hide');
                this.isOpen = true;
            },
            close: function() {
                this.element.classList.add('hide');
                this.isOpen = false;
            },
            showKeyboardShortcutTab: function() {
                this.guideSectionKeyboardShortcutTab.classList.remove('hide');
            },
            showKeyboardShortcutPanel: function(visual) {
                this.guideSection.querySelectorAll(`[data-target="keyboard-shortcuts"] > div`).forEach(panel => panel.classList.add('hide'));
                this.guideSection.querySelector(`[data-target="keyboard-shortcuts"] > div[data-visual="${visual}"]`).classList.remove('hide');
            },
            hideKeyboardShortcutTab: function() {
                this.guideSectionKeyboardShortcutTab.classList.add('hide');
            },
            showGuideTab: function() {
                this.guideSectionGuideTab.classList.remove('hide');
            },
            showGuidePanel: function(visual) {
                this.guideSection.querySelectorAll(`[data-tab-target="user-guide"] > div`).forEach(panel => panel.classList.add('hide'));
                this.guideSection.querySelector(`[data-tab-target="user-guide"] > div[data-visual="${visual}"]`).classList.remove('hide');
            },
            hideGuideTab: function() {
                this.guideSectionGuideTab.classList.add('hide');
            },
            update: function(deck) {
                if (deck.current.keyboardShortcuts || deck.current.guide) {
                    deck.controls.guideBtn.disabled = false;
                } else {
                    deck.controls.guideBtn.disabled = true;
                }
            }
        },
        mouse: {
            init: function() {
                window.onmousemove = (e) => {
                    hydra.mouseX = e.clientX;
                    hydra.mouseY = e.clientY;

                    if (!hydra.deck1.mouse.lockedPosition) {
                        hydra.deck1.mouse.x = hydra.mouseX;
                        hydra.deck1.mouse.y = hydra.mouseY;
                    }

                    if (!hydra.deck2.mouse.lockedPosition) {
                        hydra.deck2.mouse.x = hydra.mouseX;
                        hydra.deck2.mouse.y = hydra.mouseY;
                    }
                };
            }
        },
        render: function() {
            hydra.deck1.ctx.globalAlpha = hydra.deck1.pipeCtx.globalAlpha = hydra.deck1.alpha;
            hydra.deck2.ctx.globalAlpha = hydra.deck2.pipeCtx.globalAlpha = hydra.deck2.alpha;

            hydra.mixedCtx.clearRect(0, 0, hydra.mixedCanvas.width, hydra.mixedCanvas.height);

            if (!hydra.deck1.current.clearsSelf) {
                hydra.deck1.ctx.clearRect(0, 0, hydra.mixedCanvas.width, hydra.mixedCanvas.height);
            }
            hydra.deck1.pipeCtx.clearRect(0, 0, hydra.deck1.pipeCanvas.width, hydra.deck1.pipeCanvas.height);

            if (!hydra.deck2.current.clearsSelf) {
                hydra.deck2.ctx.clearRect(0, 0, hydra.mixedCanvas.width, hydra.mixedCanvas.height);
            }
            hydra.deck2.pipeCtx.clearRect(0, 0, hydra.deck2.pipeCanvas.width, hydra.deck2.pipeCanvas.height);

            hydra.deck1.render();
            if (hydra.effects.kaleidoscope.deck1.enabled) {
                hydra.effects.kaleidoscope.clip(hydra.deck1.pipeCtx, hydra.deck1.pipeCanvas);
            }
            if (hydra.effects.mirror.deck1.enabled) {
                hydra.effects.mirror.clip(hydra.deck1.pipeCtx, hydra.deck1.pipeCanvas, hydra.effects.mirror.deck1.mode, hydra.effects.mirror.deck1.startPosition);
            }
            if (hydra.effects.radial.deck1.enabled) {
                hydra.effects.radial.clip(hydra.deck1.pipeCtx, hydra.deck1.pipeCanvas, hydra.effects.radial.deck1.clipAngle);
            }
            hydra.deck1.pipeCtx.save();
            hydra.deck1.filters.apply();
            hydra.deck1.pipeCtx.drawImage(hydra.deck1.canvas, 0, 0);
            hydra.deck1.pipeCtx.restore();
            if (hydra.effects.kaleidoscope.deck1.enabled) {
                hydra.effects.kaleidoscope.apply(hydra.deck1.pipeCtx, hydra.deck1.pipeCanvas, hydra.effects.kaleidoscope.deck1.angle);
            }
            if (hydra.effects.mirror.deck1.enabled) {
                hydra.effects.mirror.apply(hydra.deck1.pipeCtx, hydra.deck1.pipeCanvas, hydra.effects.mirror.deck1.mode, hydra.effects.mirror.deck1.layerMode);
            }
            if (hydra.effects.radial.deck1.enabled) {
                hydra.effects.radial.apply(hydra.deck1.pipeCtx, hydra.deck1.pipeCanvas, hydra.effects.radial.deck1.mode, hydra.effects.radial.deck1.applyAngle);
            }

            hydra.deck2.render();
            if (hydra.effects.kaleidoscope.deck2.enabled) {
                hydra.effects.kaleidoscope.clip(hydra.deck2.pipeCtx, hydra.deck2.pipeCanvas);
            }
            if (hydra.effects.mirror.deck2.enabled) {
                hydra.effects.mirror.clip(hydra.deck2.pipeCtx, hydra.deck2.pipeCanvas, hydra.effects.mirror.deck2.mode, hydra.effects.mirror.deck2.startPosition);
            }
            if (hydra.effects.radial.deck2.enabled) {
                hydra.effects.radial.clip(hydra.deck2.pipeCtx, hydra.deck2.pipeCanvas, hydra.effects.radial.deck2.clipAngle);
            }
            hydra.deck2.pipeCtx.save();
            hydra.deck2.filters.apply();
            hydra.deck2.pipeCtx.drawImage(hydra.deck2.canvas, 0, 0);
            hydra.deck2.pipeCtx.restore();
            if (hydra.effects.kaleidoscope.deck2.enabled) {
                hydra.effects.kaleidoscope.apply(hydra.deck2.pipeCtx, hydra.deck2.pipeCanvas, hydra.effects.kaleidoscope.deck2.angle);
            }
            if (hydra.effects.mirror.deck2.enabled) {
                hydra.effects.mirror.apply(hydra.deck2.pipeCtx, hydra.deck2.pipeCanvas, hydra.effects.mirror.deck2.mode, hydra.effects.mirror.deck2.layerMode);
            }
            if (hydra.effects.radial.deck2.enabled) {
                hydra.effects.radial.apply(hydra.deck2.pipeCtx, hydra.deck2.pipeCanvas, hydra.effects.radial.deck2.mode, hydra.effects.radial.deck2.applyAngle);
            }

            if (hydra.effects.kaleidoscope.output.enabled) {
                hydra.effects.kaleidoscope.clip(hydra.mixedCtx, hydra.mixedCanvas);
            }

            if (hydra.effects.mirror.output.enabled) {
                hydra.effects.mirror.clip(hydra.mixedCtx, hydra.mixedCanvas, hydra.effects.mirror.output.mode, hydra.effects.mirror.output.startPosition);
            }

            if (hydra.effects.radial.output.enabled) {
                hydra.effects.radial.clip(hydra.mixedCtx, hydra.mixedCanvas, hydra.effects.radial.output.applyAngle);
            }

            if (hydra.deck1.raised) {
                hydra.mixedCtx.globalAlpha = hydra.deck1.crossfaderAlpha;
                hydra.mixedCtx.drawImage(hydra.deck1.pipeCanvas, 0, 0);
                hydra.mixedCtx.globalAlpha = 1;
            }

            hydra.mixedCtx.globalAlpha = hydra.deck2.crossfaderAlpha;
            hydra.mixedCtx.drawImage(hydra.deck2.pipeCanvas, 0, 0);
            hydra.mixedCtx.globalAlpha = 1;

            if (!hydra.deck1.raised) {
                hydra.mixedCtx.globalAlpha = hydra.deck1.crossfaderAlpha;
                hydra.mixedCtx.drawImage(hydra.deck1.pipeCanvas, 0, 0);
                hydra.mixedCtx.globalAlpha = 1;
            }

            if (hydra.effects.kaleidoscope.output.enabled) {
                hydra.effects.kaleidoscope.apply(hydra.mixedCtx, hydra.mixedCanvas, hydra.effects.kaleidoscope.output.angle);
            }

            if (hydra.effects.mirror.output.enabled) {
                hydra.effects.mirror.apply(hydra.mixedCtx, hydra.mixedCanvas, hydra.effects.mirror.output.mode, hydra.effects.mirror.output.layerMode);
            }

            if (hydra.effects.radial.output.enabled) {
                hydra.effects.radial.apply(hydra.mixedCtx, hydra.mixedCanvas, hydra.effects.radial.output.mode, hydra.effects.radial.output.angle);
            }

            if (!hydra.audio.listening) {
                hydra.audio.knightrider();
            }

            hydra.audio.bpm.beatDetection();

            window.requestAnimationFrame(hydra.render);
        },
        audio: {
            average: 0,
            percentage: 0,
            bpm: {
                current: null,
                syncPoint: null,
                beatsFromSyncPoint: null,
                beatDuration: null,
                beatOn: false,
                display: document.querySelector('[data-bpm-display]'),
                calculationProperties: {
                    init: function() {
                        this.beatTimestamps = [];
                        this.shouldClear = false;
                    },
                    interval: null,
                },
                beatDetection: function() {
                    if (hydra.audio.bpm.syncPoint && hydra.audio.bpm.beatDuration && !hydra.audio.bpm.beatsFromSyncPoint) {
                        hydra.audio.bpm.beatsFromSyncPoint = 1;
                    }
                    if (hydra.audio.bpm.beatsFromSyncPoint && (hydra.audio.bpm.syncPoint + (hydra.audio.bpm.beatsFromSyncPoint * hydra.audio.bpm.beatDuration)) <= Date.now()) {
                        hydra.audio.bpm.beatOn = true;
                        hydra.audio.bpm.beatsFromSyncPoint++;
                    } else if (hydra.audio.bpm.beatOn) {
                        hydra.audio.bpm.beatOn = false;
                    }
                },
                sync: function() {
                    if (hydra.audio.bpm.syncPoint) {
                        hydra.audio.bpm.beatOn = true;
                        hydra.audio.bpm.syncPoint = Date.now();
                        hydra.audio.bpm.beatsFromSyncPoint = 1;
                    }
                },
                calculate: function() {
                    clearInterval(hydra.audio.bpm.calculationProperties.interval);
                    if (hydra.audio.bpm.calculationProperties.shouldClear) {
                        hydra.audio.bpm.calculationProperties.init();
                    }
                    hydra.audio.bpm.beatOn = true;

                    const now = Date.now();
                    const msInMin = 60000;
                    hydra.audio.bpm.calculationProperties.beatTimestamps.push(now);
                    const numberOfBeats = hydra.audio.bpm.calculationProperties.beatTimestamps.length;
                    const x = numberOfBeats - 1;
                    const y = hydra.audio.bpm.calculationProperties.beatTimestamps[x] - hydra.audio.bpm.calculationProperties.beatTimestamps[0];

                    const bpm = msInMin * x / y;

                    if (numberOfBeats >= 2) {
                        hydra.audio.bpm.current = bpm.toFixed(2).toString().padStart(6, ' ');
                        hydra.audio.bpm.display.textContent = hydra.audio.bpm.current;
                    }

                    hydra.audio.bpm.syncPoint = now;
                    hydra.audio.bpm.beatDuration = msInMin / bpm;
                    hydra.audio.bpm.beatsFromSyncPoint = 1;

                    hydra.audio.bpm.calculationProperties.interval = setInterval(function() {
                        hydra.audio.bpm.calculationProperties.shouldClear = true;
                    }, 2200);
                }
            },
            listening: false,
            init: function() {
                this.meterCanvas = document.getElementById('audio-meter');
                this.meterCtx = this.meterCanvas.getContext('2d');
                this.bpm.calculationProperties.init();
            },
            listen: function() {
                try {
                    navigator.mediaDevices.getUserMedia({
                        audio: true
                    }).then(this.configureMediaProcessing);
                    this.listening = true;
                } catch (err) {
                    // bad things happened... weird browser, lacking ssl?
                }
            },
            stopListening: function() {
                hydra.audio.listening = false;
            },
            configureMediaProcessing: function(stream) {
                hydra.audio.context = new AudioContext();
                hydra.audio.source = hydra.audio.context.createMediaStreamSource(stream);
                hydra.audio.processor = hydra.audio.context.createScriptProcessor(1024, 1, 1);
                hydra.audio.analyser = hydra.audio.context.createAnalyser();

                hydra.audio.analyser.smoothingTimeConstant = 0.8;
                hydra.audio.analyser.fftSize = 512;

                hydra.audio.source.connect(hydra.audio.analyser);
                hydra.audio.analyser.connect(hydra.audio.processor);
                hydra.audio.processor.connect(hydra.audio.context.destination);

                hydra.audio.processor.onaudioprocess = () => {
                    hydra.audio.uint8Array = new Uint8Array(hydra.audio.analyser.frequencyBinCount);
                    let values = 0;
                    const length = hydra.audio.uint8Array.length;

                    hydra.audio.analyser.getByteFrequencyData(hydra.audio.uint8Array);

                    for (let i = 0; i < length; i++) {
                        values += (hydra.audio.uint8Array[i]);
                    }

                    hydra.audio.average = values / hydra.audio.analyser.frequencyBinCount;
                    hydra.audio.percentage = (100 / hydra.audio.analyser.frequencyBinCount) * hydra.audio.average;

                    hydra.audio.showLevels();
                }
            },
            showLevels: function() {
                this.meterCtx.clearRect(0, 0, this.meterCanvas.width, this.meterCanvas.height);

                this.meterCtx.save();
                const gradient = this.meterCtx.createLinearGradient(0, 0, this.meterCanvas.width, 0);

                gradient.addColorStop(0, '#76b14c');
                gradient.addColorStop(0.5, '#76b14c');
                gradient.addColorStop(0.75, '#c6b13d');
                gradient.addColorStop(1, '#e62323');

                this.meterCtx.fillStyle = gradient;

                this.meterCtx.fillRect(0, 0 , ((this.meterCanvas.width / 100) * (hydra.audio.percentage*3)), 60);
                this.meterCtx.restore();

                this.meterCtx.fillStyle = '#0d0d0d';
                let divisions = 60;
                for (let i = 0; i < divisions; i++) {
                    this.meterCtx.fillRect((this.meterCanvas.width / divisions) * i, 0 , 3, 60);
                }
            },
            knightrider: function() {
                hydra.audio.meterCtx.clearRect(0, 0, hydra.audio.meterCanvas.width, hydra.audio.meterCanvas.height);

                hydra.audio.meterCtx.save();

                hydra.audio.meterCtx.fillStyle = '#540707';

                const x = hydra.helpers.sine(Date.now(), (hydra.audio.meterCanvas.width+60)*5)

                hydra.audio.meterCtx.fillRect((x/5)-50, 0 , 50, 60);
                hydra.audio.meterCtx.restore();

                hydra.audio.meterCtx.fillStyle = '#0d0d0d';
                let divisions = 60;
                for (let i = 0; i < divisions; i++) {
                    hydra.audio.meterCtx.fillRect((hydra.audio.meterCanvas.width / divisions) * i, 0 , 3, 60);
                }
            }
        },
        recorder: {
            initialised: false,
            init: function(canvas, videoBitsPerSecond) {
                this.mediaSource = new MediaSource();
                this.mediaRecorder;
                this.recordedBlobs;
                this.sourceBuffer;
                this.stream = canvas.captureStream();
                this.options = {
                    mimeType: this.getSupportedType(),
                    videoBitsPerSecond: videoBitsPerSecond || 2500000 // 2.5Mbps
                };
                this.initialised = true;
            },
            getSupportedType: function() {
                const types = [
                    'video/mpeg\;codecs=h264',
                    'video/webm\;codecs=h264',
                    'video/webm',
                    'video/webm,codecs=vp9',
                    'video/vp8',
                    'video/webm\;codecs=vp8',
                    'video/webm\;codecs=daala',
                    'video/mpeg'
                ];
                let supportedType = null;

                for (let i in types) {
                    if (MediaRecorder.isTypeSupported(types[i])) {
                        supportedType = types[i];
                        break;
                    }
                }

                return supportedType;
            },
            handleDataAvailable: function(event) {
                if (event.data && event.data.size > 0) {
                    hydra.recorder.recordedBlobs.push(event.data);
                }
            },
            handleStop: function(event) {
                console.debug('Recorder stopped: ', event);
                hydra.recorder.download();
            },
            start: function() {
                hydra.recorder.recordedBlobs = [];
                try {
                    hydra.recorder.mediaRecorder = new MediaRecorder(hydra.recorder.stream, hydra.recorder.options);
                } catch (e0) {
                    console.debug('Unable to create MediaRecorder with options Object: ', e0);
                    try {
                        hydra.recorder.options = {mimeType: 'video/webm,codecs=vp9'};
                        hydra.recorder.mediaRecorder = new MediaRecorder(hydra.recorder.stream, hydra.recorder.options);
                    } catch (e1) {
                        console.debug('Unable to create MediaRecorder with options Object: ', e1);
                        try {
                            hydra.recorder.options = 'video/vp8'; // Chrome 47
                            hydra.recorder.mediaRecorder = new MediaRecorder(hydra.recorder.stream, hydra.recorder.options);
                        } catch (e2) {
                            console.error('MediaRecorder is not supported by this browser.\n\n' +
                                'Try Firefox 29 or later, or Chrome 47 or later, ' +
                                'with Enable experimental Web Platform features enabled from chrome://flags.');
                            console.error('Exception while creating MediaRecorder:', e2);
                            return;
                        }
                    }
                }
                console.debug('Created MediaRecorder', hydra.recorder.mediaRecorder, 'with options', hydra.recorder.options);
                hydra.recorder.mediaRecorder.onstop = hydra.recorder.handleStop;
                hydra.recorder.mediaRecorder.ondataavailable = hydra.recorder.handleDataAvailable;
                hydra.recorder.mediaRecorder.start(100); // collect 100ms of data
                console.debug('MediaRecorder started', hydra.recorder.mediaRecorder);
            },
            stop: function() {
                hydra.recorder.mediaRecorder.stop();
            },
            download: function() {
                const blob = new Blob(hydra.recorder.recordedBlobs, {type: 'video/webm'});
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'hydra.webm';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
            }
        },
        resolution: {
            current: 'match',
            ratio: 1
        },
        streamer: {
            canvasToStream: 'mix',
            launch: function() {
                const canvas = this.canvasToStream == 'mix' ? hydra.mixedCanvas : hydra[`deck${this.canvasToStream}`].pipeCanvas;
                const stream = canvas.captureStream()
                const popUpWindow = window.open('', '_blank', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no');
                popUpWindow.document.body.style = 'background: black; margin: 0;';
                const videoEl = document.createElement('video');
                videoEl.autoplay = true;
                videoEl.muted = true;
                videoEl.style = 'aspect-ratio: 16 / 9; width: 100%; height: 100%;';
                const remoteVideo = popUpWindow.document.body.appendChild(videoEl);
                remoteVideo.srcObject = stream;
            }
        },
        files: {
            export: function(content, fileName, contentType) {
                let file = new Blob([content], {type: contentType});
                let a = document.createElement('a');
                a.href = URL.createObjectURL(file);
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(a.href);
            }
        },
        keyboard: {
            claimed: false,
            whitelist: [
                'Escape',
                '`',
                'Backspace',
                '\\',
                ';',
                '\'',
                'Enter',
                'z',
                'x',
                'c',
                'v',
                'b',
                'n',
                'm',
                ',',
                '.',
                '/',
                'Shift',
                'Alt',
                ' ',
                'AltGraph',
                'ArrowLeft',
                'ArrowRight',
            ],
            init: function() {
                window.addEventListener('keydown', function(e) {
                    console.debug(e.key);
                    if ((!hydra.keyboard.claimed && !hydra.keyboard.whitelist.includes(e.key)) || (document.activeElement.type == 'textarea')) {
                        return;
                    }
                    switch (e.key) {
                        case 'Escape':
                            if (hydra.body.classList.contains('assigning')) {
                                hydra.midi.cancelAssignment();
                            }
                            if (hydra.modal.isOpen) {
                                document.getElementById('modal-close').click();
                            }
                            const savingPreset = document.querySelector('.saving-preset');
                            if (savingPreset) {
                                const deck = savingPreset.dataset.deck;
                                document.querySelector(`[data-deck="${deck}"][data-save]`).click();
                            }
                            break;
                        case '`':
                            document.getElementById('sync').click();
                            break;
                        case '1':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.select(1);
                            break;
                        case '2':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.select(2);
                            break;
                        case '3':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.select(3);
                            break;
                        case '4':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.select(4);
                            break;
                        case '5':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.select(5);
                            break;
                        case '6':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.select(6);
                            break;
                        case '7':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.select(7);
                            break;
                        case '8':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.select(8);
                            break;
                        case '9':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.select(9);
                            break;
                        case '0':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.select(10);
                            break;
                        case '-':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.previous();
                            break;
                        case '=':
                            hydra[`deck${hydra.keyboard.claimed}`].presets.next();
                            break;
                        case 'Backspace':
                            if (!hydra.midi.assigning) {
                                document.getElementById('assign').click();
                            }
                            break;
                        case 'q':
                        case 'w':
                        case 'e':
                        case 'r':
                        case 't':
                        case 'y':
                        case 'u':
                        case 'i':
                        case 'o':
                        case 'p':
                        case '[':
                        case ']':
                        case '§':
                            if (hydra.keyboard.claimed && hydra[`deck${hydra.keyboard.claimed}`].current.keyboardShortcuts && hydra[`deck${hydra.keyboard.claimed}`].current.keyboardShortcuts[e.key]
                            && hydra[`deck${hydra.keyboard.claimed}`].current.keyboardShortcuts[e.key].action) {
                                hydra[`deck${hydra.keyboard.claimed}`].current.keyboardShortcuts[e.key].action();
                            }
                            break;
                        case '\\':
                            document.getElementById('record').click();
                            break;
                        case 'a':
                        case 's':
                        case 'd':
                        case 'f':
                        case 'g':
                        case 'h':
                        case 'j':
                        case 'k':
                        case 'l':
                        case ';':
                        case '\'':
                            if (hydra.keyboard.claimed && hydra[`deck${hydra.keyboard.claimed}`].current.keyboardShortcuts && hydra[`deck${hydra.keyboard.claimed}`].current.keyboardShortcuts[e.key]
                            && hydra[`deck${hydra.keyboard.claimed}`].current.keyboardShortcuts[e.key].action) {
                                hydra[`deck${hydra.keyboard.claimed}`].current.keyboardShortcuts[e.key].action();
                            }
                            break;
                        case 'Enter':
                            const kaleidoscopeToggleBtn = !hydra.keyboard.claimed
                                ? 'kaleidoscope-output-toggle'
                                : `kaleidoscope-deck${hydra.keyboard.claimed}-toggle`;
                            document.getElementById(kaleidoscopeToggleBtn).click();
                            break;
                        case 'z':
                            const mirrorVertBtn = !hydra.keyboard.claimed
                                ? '[data-target="output"].mirror-mode.applies-vert'
                                : `[data-target="deck${hydra.keyboard.claimed}"].mirror-mode.applies-vert`;
                            document.querySelector(mirrorVertBtn).click();
                            break;
                        case 'x':
                            const mirrorHoriBtn = !hydra.keyboard.claimed
                                ? '[data-target="output"].mirror-mode.applies-hori'
                                : `[data-target="deck${hydra.keyboard.claimed}"].mirror-mode.applies-hori`;
                            document.querySelector(mirrorHoriBtn).click();
                            break;
                        case 'c':
                            const mirrorQuadBtn = !hydra.keyboard.claimed
                                ? '[data-target="output"].mirror-mode.applies-quad'
                                : `[data-target="deck${hydra.keyboard.claimed}"].mirror-mode.applies-quad`;
                            document.querySelector(mirrorQuadBtn).click();
                            break;
                        case 'v':
                            const mirrorLayerBtn = !hydra.keyboard.claimed
                                ? '[data-target="output"].mirror-mode.applies-layer'
                                : `[data-target="deck${hydra.keyboard.claimed}"].mirror-mode.applies-layer`;
                            document.querySelector(mirrorLayerBtn).click();
                            break;
                        case 'b':
                            const mirrorStartPositionBottomLeftBtn = !hydra.keyboard.claimed
                                ? '[data-target="output"].mirror-start-position.applies-bottom-left'
                                : `[data-target="deck${hydra.keyboard.claimed}"].mirror-start-position.applies-bottom-left`;
                            document.querySelector(mirrorStartPositionBottomLeftBtn).click();
                            break;
                        case 'n':
                            const mirrorStartPositionTopLeftBtn = !hydra.keyboard.claimed
                                ? '[data-target="output"].mirror-start-position.applies-top-left'
                                : `[data-target="deck${hydra.keyboard.claimed}"].mirror-start-position.applies-top-left`;
                            document.querySelector(mirrorStartPositionTopLeftBtn).click();
                            break;
                        case 'm':
                            const mirrorStartPositionTopRightBtn = !hydra.keyboard.claimed
                                ? '[data-target="output"].mirror-start-position.applies-top-right'
                                : `[data-target="deck${hydra.keyboard.claimed}"].mirror-start-position.applies-top-right`;
                            document.querySelector(mirrorStartPositionTopRightBtn).click();
                            break;
                        case ',':
                            const mirrorStartPositionBottomRightBtn = !hydra.keyboard.claimed
                                ? '[data-target="output"].mirror-start-position.applies-bottom-right'
                                : `[data-target="deck${hydra.keyboard.claimed}"].mirror-start-position.applies-bottom-right`;
                            document.querySelector(mirrorStartPositionBottomRightBtn).click();
                            break;
                        case '.':
                            let mirrorLayerModeSelectPrev = !hydra.keyboard.claimed
                                ? '[data-target="output"].mirror-layer-mode-selector'
                                : `[data-target="deck${hydra.keyboard.claimed}"].mirror-layer-mode-selector`;
                            mirrorLayerModeSelectPrev = document.querySelector(mirrorLayerModeSelectPrev);
                            const mirrorLayerModeSelectPrevCurrent = mirrorLayerModeSelectPrev.selectedIndex;
                            const mirrorLayerModeSelectPrevOptions = mirrorLayerModeSelectPrev.querySelectorAll('option');
                            const mirrorLayerModeSelectPrevItemIndex = (mirrorLayerModeSelectPrevCurrent - 1) >= 0 ? mirrorLayerModeSelectPrevCurrent - 1 : mirrorLayerModeSelectPrevOptions.length - 1;

                            mirrorLayerModeSelectPrev.value = mirrorLayerModeSelectPrevOptions[mirrorLayerModeSelectPrevItemIndex].value;
                            mirrorLayerModeSelectPrev.dispatchEvent(new Event('change', { bubbles: true }));
                            break;
                        case '/':
                            let mirrorLayerModeSelectNext = !hydra.keyboard.claimed
                                ? '[data-target="output"].mirror-layer-mode-selector'
                                : `[data-target="deck${hydra.keyboard.claimed}"].mirror-layer-mode-selector`;
                            mirrorLayerModeSelectNext = document.querySelector(mirrorLayerModeSelectNext);
                            const mirrorLayerModeSelectNextCurrent = mirrorLayerModeSelectNext.selectedIndex;
                            const mirrorLayerModeSelectNextOptions = mirrorLayerModeSelectNext.querySelectorAll('option');
                            const mirrorLayerModeSelectNextItemIndex = (mirrorLayerModeSelectNextCurrent + 1) < mirrorLayerModeSelectNextOptions.length ? mirrorLayerModeSelectNextCurrent + 1 : 0;

                            mirrorLayerModeSelectNext.value = mirrorLayerModeSelectNextOptions[mirrorLayerModeSelectNextItemIndex].value;
                            mirrorLayerModeSelectNext.dispatchEvent(new Event('change', { bubbles: true }));
                            break;
                        case 'Shift':
                            const mirrorToggleBtn = !hydra.keyboard.claimed
                                ? 'mirror-output-toggle'
                                : `mirror-deck${hydra.keyboard.claimed}-toggle`;
                            document.getElementById(mirrorToggleBtn).click();
                            break;
                        case 'Alt':
                            hydra.composition.previousMode();
                            break;
                        case ' ':
                            document.getElementById('tap-bpm').click();
                            break;
                        case 'AltGraph':
                            hydra.composition.nextMode();
                            break;
                        case 'ArrowUp':
                            document.querySelector(`[data-deck="${hydra.keyboard.claimed}"].raise-to-top`).click();
                            break;
                        case 'ArrowDown':
                            document.querySelector(`[data-deck="${hydra.keyboard.claimed == 1 ? 2 : 1}"].raise-to-top`).click();
                            break;
                        case 'ArrowLeft':
                            document.querySelector('[data-deck="1"][data-claim]').click();
                            break;
                        case 'ArrowRight':
                            document.querySelector('[data-deck="2"][data-claim]').click();
                            break;
                    }
                });
            }
        },
        midi: {
            assigning: false,
            init: function() {
                this.requestAccess();
            },
            requestAccess: function() {
                try {
                    navigator.requestMIDIAccess()
                        .then(this.onMIDISuccess, this.onMIDIFailure);
                } catch (err) {
                    // bad things happened... weird browser, lacking ssl?
                }
            },
            onMIDISuccess: function(midiAccess) {
                for (let input of midiAccess.inputs.values()) {
                    input.onmidimessage = hydra.midi.getMIDIMessage;
                }
            },
            onMIDIFailure: function() {
                console.debug('Could not access MIDI devices.');
            },
            getMIDIMessage: function(midiMessage) {
                console.debug(midiMessage)
                switch (midiMessage.data[0]) {
                    // pad/key
                    case 144:
                        try {
                            if (hydra.midi.assigning) {
                                if (hydra.midi.assigning.type == 'checkbox' || hydra.midi.assigning.type == 'submit') {
                                    hydra.midi.assignments.padsKeys[midiMessage.data[1]] = hydra.midi.assigning;
                                    hydra.midi.cancelAssignment();
                                }
                            } else {
                                if (hydra.keyboard.claimed) {
                                    hydra.midi.assignments.pads[midiMessage.data[1]]
                                        ? hydra.midi.assignments.padsKeys[midiMessage.data[1]].click()
                                        : hydra[`deck${hydra.keyboard.claimed}`].presets.select(midiMessage.data[1] - 47);
                                } else {
                                    hydra.midi.assignments.padsKeys[midiMessage.data[1]].click();
                                }
                            }

                        } catch (e) {}
                        break;
                    // dial
                    case 176:
                        if (hydra.midi.assigning) {
                            hydra.midi.assignments.dials[midiMessage.data[1]] = hydra.midi.assigning;
                            const assignmentEl = document.querySelector(`[data-target="midi-assignments"] [data-assignment="${midiMessage.data[1]}"]`);
                            if (assignmentEl) {
                                assignmentEl.textContent = `${hydra.midi.assigning.dataset.variable} [D${hydra.midi.assigning.dataset.deck} ${hydra.midi.assigning.dataset.visual}]`;
                            }
                            hydra.midi.cancelAssignment();
                        } else {
                            try {
                                const dial = hydra.midi.assignments.dials[parseInt(midiMessage.data[1])];
                                const min = dial.min;
                                const max = dial.max;
                                const incrementSize = (Math.abs(min - max)/128);

                                if (Math.sign(min) == -1) {
                                    dial.value = (incrementSize - Math.abs(min) - incrementSize) + (incrementSize * midiMessage.data[2]);
                                } else {
                                    dial.value = (max/128) * midiMessage.data[2];
                                }

                                dial.dispatchEvent(new Event('input', { bubbles: true }));
                            } catch (e) {}
                        }
                        break;
                    // joystick
                    case 224:
                        const value = ((2 / 128) * midiMessage.data[2]) - 1;
                        hydra.crossfader.input.value = value;
                        hydra.crossfader.input.dispatchEvent(new Event('input', { bubbles: true }));
                        break;
                }

            },
            cancelAssignment: function() {
                hydra.body.classList.remove('assigning');
                hydra.body.classList.remove('selected');
                hydra.midi.assigning = false;
            },
            assignments: {
                padsKeys: {},
                dials: {},
                sticks: {}
            },
            import: function(target, input) {
                if (typeof window.FileReader !== 'function') {
                    console.debug("The file API isn't supported on this browser yet.");
                    return;
                } else if (!input.files) {
                    console.debug("This browser doesn't seem to support the `files` property of file inputs.");
                } else if (!input.files[0]) {
                    console.debug("Please select a file before clicking 'Import'.");
                } else if (input.files[0].type != 'application/json') {
                    console.debug("File selected for import is not a valid JSON file.");
                } else {
                    const file = input.files[0];
                    const fr = new FileReader();

                    const messageEl = target.closest('fieldset').querySelector('.message');

                    fr.addEventListener(
                        'load',
                        (e) => {
                            const data = e.target.result;
                            const json = JSON.parse(data);

                            for (key in json.assignments) {
                                for (entry in json.assignments[key]) {
                                    const input = json.assignments[key][entry];
                                    json.assignments[key][entry] = document.querySelector(`[data-deck="${input.deck}"][data-visual="${input.visual}"][data-variable="${input.variable}"]`);
                                }
                            }

                            hydra.midi.assignments = json.assignments;

                            messageEl.textContent = 'Import successful!';
                            setTimeout(() => {
                                messageEl.textContent = '';
                            }, 2000);
                        },
                        false,
                    );

                    fr.addEventListener(
                        'error',
                        () => {
                            messageEl.textContent = 'Import failed';
                            setTimeout(() => {
                                messageEl.textContent = '';
                            }, 2000);
                        },
                        false,
                    );

                    fr.readAsText(file);
                }
            },
            export: function() {
                let assignments = hydra.midi.assignments;

                for (key in assignments) {
                    for (entry in assignments[key]) {
                        const input = assignments[key][entry];
                        assignments[key][entry] = {deck: input.dataset.deck, visual: input.dataset.visual, variable: input.dataset.variable};
                    }
                }

                const data = JSON.stringify({
                    assignments: assignments
                });

                hydra.files.export(data, 'midi-assignments.json', 'application/json');
            },
            reset: function() {
                this.assignments = {
                    padsKeys: {},
                    dials: {},
                    sticks: {}
                };
            }
        },
        themes: {
            init: function() {
                this.select = document.getElementById('theme-selection');
                hydra.settings.themes.forEach(theme => {
                    hydra.themes.select.add(new Option(theme, theme, theme == 'default', theme == 'default'));
                });

                this.select.addEventListener('change', function(e) {
                    hydra.body.className = this.value;
                    hydra.helpers.detectSizes();
                });
            }
        },
        helpers: {
            sine: function(count, iterations) {
                count = (180/(iterations/2)) * count;
                return iterations/2 + Math.cos((count)*Math.PI/180)*iterations/2;
            },
            hexToRgb: function(hex) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            },
            rgbToHsl: function(r, g, b) {
                r /= 255;
                g /= 255;
                b /= 255;

                const l = Math.max(r, g, b);
                const s = l - Math.min(r, g, b);
                const h = s
                    ? l === r
                    ? (g - b) / s
                    : l === g
                    ? 2 + (b - r) / s
                    : 4 + (r - g) / s
                    : 0;

                return [
                    60 * h < 0 ? 60 * h + 360 : 60 * h,
                    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
                    (100 * (2 * l - s)) / 2,
                ];
            },
            hslToRgb: function(h, s, l) {
                s /= 100;
                l /= 100;

                const k = n => (n + h / 30) % 12;
                const a = s * Math.min(l, 1 - l);
                const f = n =>
                l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

                return {
                    r: 255 * f(0),
                    g: 255 * f(8),
                    b: 255 * f(4)
                };
            },
            hueShift: function(r, g, b, degree) {
                const hsl = hydra.helpers.rgbToHsl(r, g, b);

                let h = hsl[0];
                let s = hsl[1];
                let l = hsl[2];

                h += parseInt(degree);

                if (h > 360) {
                    h -= 360;
                } else if (h < 0) {
                    h += 360;
                }

                return hydra.helpers.hslToRgb(h, s, l);
            },
            formatValue: function(value, precision) {
                const n = 10 * (10 * precision);
                return (Math.round(value * n) / n).toFixed(precision);
            },
            detectSizes: function() {
                // weird bug where composition mode resets to 'source-over' on resize, so let's save our current mode and re-apply it afterwards...
                const currentMode = hydra.mixedCtx.globalCompositeOperation;

                if (hydra.resolution.current === 'match') {
                    hydra.deck1.canvas.width = hydra.deck1.pipeCanvas.getBoundingClientRect().width;
                    hydra.deck1.canvas.height = hydra.deck1.pipeCanvas.getBoundingClientRect().height;

                    hydra.deck1.pipeCanvas.width = hydra.deck1.pipeCanvas.getBoundingClientRect().width;
                    hydra.deck1.pipeCanvas.height = hydra.deck1.pipeCanvas.getBoundingClientRect().height;

                    hydra.mixedCanvas.width = hydra.mixedCanvas.getBoundingClientRect().width;
                    hydra.mixedCanvas.height = hydra.mixedCanvas.getBoundingClientRect().height;

                    hydra.deck2.canvas.width = hydra.deck2.pipeCanvas.getBoundingClientRect().width;
                    hydra.deck2.canvas.height = hydra.deck2.pipeCanvas.getBoundingClientRect().height;

                    hydra.deck2.pipeCanvas.width = hydra.deck2.pipeCanvas.getBoundingClientRect().width;
                    hydra.deck2.pipeCanvas.height = hydra.deck2.pipeCanvas.getBoundingClientRect().height;

                    hydra.centerX = hydra.deck1.canvas.width/2;
                    hydra.centerY = hydra.deck1.canvas.height/2;

                } else {
                    const width = hydra.resolution.current == '720p' ? 1280 : 1920;
                    const height = hydra.resolution.current == '720p' ? 720 : 1080;

                    hydra.deck1.canvas.width = width;
                    hydra.deck1.canvas.height = height;

                    hydra.deck1.pipeCanvas.width = width;
                    hydra.deck1.pipeCanvas.height = height;

                    hydra.mixedCanvas.width = width;
                    hydra.mixedCanvas.height = height;

                    hydra.deck2.canvas.width = width;
                    hydra.deck2.canvas.height = height;

                    hydra.deck2.pipeCanvas.width = width;
                    hydra.deck2.pipeCanvas.height = height;

                    hydra.centerX = width/2;
                    hydra.centerY = height/2;
                }
                // re-apply composition mode - hacky but works
                hydra.mixedCtx.globalCompositeOperation = currentMode;

                hydra.audio.meterCanvas.width = hydra.audio.meterCanvas.getBoundingClientRect().width;
                hydra.audio.meterCanvas.height = hydra.audio.meterCanvas.getBoundingClientRect().height;

                const sliderHeight = document.querySelector('.extend').clientHeight - document.getElementById('sliders').clientHeight - 65;

                document.querySelectorAll('.deck-alpha').forEach((slider, i) => {
                    slider.style.width = `${sliderHeight}px`;
                    slider.style.top = `${sliderHeight/2}px`;
                    if (i == 0) {
                        slider.style.left =`-${sliderHeight/2 - 39 - 15}px`;
                    } else {
                        slider.style.right =`-${sliderHeight/2 - 39 - 15}px`;
                    }
                });
            },
            randomise: function(deck) {
                let inputs;

                deck.ctx.setTransform(1, 0, 0, 1, 0, 0);
                deck.ctx.clearRect(0, 0, deck.canvas.width, deck.canvas.height);

                const countDecimals = (number) => {
                    if ((number % 1) != 0)
                        return number.toString().split(".")[1].length;
                    return 0;
                }

                const randomValue = (min, max, precision) => {
                    if (Math.random() > 0.5) {
                        const number = Math.random() * (max - min + 1) + min;
                        const multiplier = Math.pow(10, precision || 0);
                        return Math.round(number * multiplier) / multiplier;
                    } else {
                        let number = Math.random() * (max - min) + min;
                        number = parseFloat(number.toFixed(countDecimals(precision)));
                        if (precision == 0) {
                            number = Math.round(number);
                        }
                        return number;
                    }
                }

                const randomColor = () => {
                    return '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
                }

                deck.current.inputs.forEach(function(input) {
                    if (typeof input.dataset.randomiseable !== 'undefined') {
                        if (Math.random() > 0.25) {
                            if (input.type == 'number' || input.type == 'range') {
                                const min = parseFloat(input.min) || 0;
                                const max = parseFloat(input.max) || 1000;
                                const step = parseFloat(input.step) || 1;
                                const randomisedValue = randomValue(min, max, step);
                                input.value = randomisedValue;
                            } else if (input.type == 'checkbox') {
                                const randomisedValue = randomValue(0, 1, 0);
                                input.checked = randomisedValue;
                            } else if (input.type == 'color') {
                                input.value = randomColor();
                            }

                            if (input.type == 'submit') {
                                input.dispatchEvent(new Event('click', { bubbles: true }));
                            } else if (input.type == 'checkbox') {
                                input.dispatchEvent(new Event('click', { bubbles: true }));
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            } else {
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }
                    }
                });
            },
            dispatchEvent: function(deck, visual, property, type) {
                if (property) {
                    deck[visual][property].dispatchEvent(new Event(type, { bubbles: true }));
                }
            },
            triggerFunction: function(deck, visual, fn) {
                if (fn) {
                    deck[visual][fn]();
                }
            },
            incrementRangeInput(input) {
                if ((parseFloat(input.value) + parseFloat(input.step)) <= parseFloat(input.max)) {
                    input.value = parseFloat(input.value) + parseFloat(input.step);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            },
            decrementRangeInput(input) {
                if ((parseFloat(input.value) - parseFloat(input.step)) >= parseFloat(input.min)) {
                    input.value = parseFloat(input.value) - parseFloat(input.step);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }
    }
})();