(function () {
    const DEFAULTS = {
        title: 'Confirm action',
        message: '',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        variant: 'default',
        defaultValue: ''
    };

    let activeDialog = null;

    function ensureDialog() {
        if (activeDialog) return activeDialog;

        const overlay = document.createElement('div');
        overlay.className = 'atlas-confirm-overlay';
        overlay.setAttribute('role', 'presentation');
        overlay.innerHTML = `
            <div class="atlas-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="atlasConfirmTitle" aria-describedby="atlasConfirmMessage">
                <div class="atlas-confirm-mark" aria-hidden="true">!</div>
                <div class="atlas-confirm-copy">
                    <h2 id="atlasConfirmTitle"></h2>
                    <p id="atlasConfirmMessage"></p>
                    <input id="atlasConfirmInput" class="atlas-confirm-input" type="text">
                </div>
                <div class="atlas-confirm-actions">
                    <button type="button" class="atlas-confirm-btn atlas-confirm-cancel"></button>
                    <button type="button" class="atlas-confirm-btn atlas-confirm-accept"></button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        activeDialog = {
            overlay,
            dialog: overlay.querySelector('.atlas-confirm-dialog'),
            title: overlay.querySelector('#atlasConfirmTitle'),
            message: overlay.querySelector('#atlasConfirmMessage'),
            input: overlay.querySelector('#atlasConfirmInput'),
            confirmButton: overlay.querySelector('.atlas-confirm-accept'),
            cancelButton: overlay.querySelector('.atlas-confirm-cancel')
        };

        return activeDialog;
    }

    function normalizeOptions(options) {
        if (typeof options === 'string') {
            return { ...DEFAULTS, message: options };
        }

        return { ...DEFAULTS, ...(options || {}) };
    }

    function openDialog(options) {
        const settings = normalizeOptions(options);
        const elements = ensureDialog();
        const previouslyFocused = document.activeElement;
        const mode = settings.mode || 'confirm';

        elements.title.textContent = settings.title;
        elements.message.textContent = settings.message;
        elements.confirmButton.textContent = settings.confirmLabel;
        elements.cancelButton.textContent = settings.cancelLabel;
        elements.dialog.dataset.variant = settings.variant;
        elements.dialog.dataset.mode = mode;
        elements.input.value = settings.defaultValue || '';
        elements.input.placeholder = settings.placeholder || '';
        elements.input.setAttribute('aria-label', settings.inputLabel || settings.title || 'Input');
        elements.overlay.classList.add('is-visible');
        document.body.classList.add('atlas-confirm-open');

        return new Promise(resolve => {
            let settled = false;

            function close(result) {
                if (settled) return;
                settled = true;
                elements.overlay.classList.remove('is-visible');
                document.body.classList.remove('atlas-confirm-open');
                document.removeEventListener('keydown', onKeydown);
                elements.confirmButton.removeEventListener('click', onConfirm);
                elements.cancelButton.removeEventListener('click', onCancel);
                elements.overlay.removeEventListener('click', onOverlayClick);

                if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                    previouslyFocused.focus();
                }

                resolve(result);
            }

            function onConfirm() {
                if (mode === 'prompt') {
                    close(elements.input.value);
                } else {
                    close(true);
                }
            }

            function onCancel() {
                close(mode === 'prompt' ? null : false);
            }

            function onOverlayClick(event) {
                if (event.target === elements.overlay) close(false);
            }

            function onKeydown(event) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    close(mode === 'prompt' ? null : false);
                }

                if (event.key === 'Enter' && mode === 'prompt') {
                    event.preventDefault();
                    close(elements.input.value);
                }

                if (event.key === 'Tab') {
                    const focusable = mode === 'alert'
                        ? [elements.confirmButton]
                        : mode === 'prompt'
                            ? [elements.input, elements.cancelButton, elements.confirmButton]
                            : [elements.cancelButton, elements.confirmButton];
                    const currentIndex = focusable.indexOf(document.activeElement);

                    if (event.shiftKey && currentIndex <= 0) {
                        event.preventDefault();
                        focusable[focusable.length - 1].focus();
                    } else if (!event.shiftKey && currentIndex === focusable.length - 1) {
                        event.preventDefault();
                        focusable[0].focus();
                    }
                }
            }

            elements.confirmButton.addEventListener('click', onConfirm);
            elements.cancelButton.addEventListener('click', onCancel);
            elements.overlay.addEventListener('click', onOverlayClick);
            document.addEventListener('keydown', onKeydown);

            requestAnimationFrame(() => {
                if (mode === 'prompt') {
                    elements.input.focus();
                    elements.input.select();
                } else if (mode === 'alert') {
                    elements.confirmButton.focus();
                } else {
                    elements.cancelButton.focus();
                }
            });
        });
    }

    window.atlasConfirm = function atlasConfirm(options) {
        return openDialog({ ...normalizeOptions(options), mode: 'confirm' });
    };

    window.atlasAlert = function atlasAlert(options) {
        const settings = normalizeOptions(options);
        return openDialog({
            ...settings,
            title: settings.title || 'Notice',
            confirmLabel: settings.confirmLabel || 'OK',
            mode: 'alert'
        });
    };

    window.atlasPrompt = function atlasPrompt(options) {
        const settings = normalizeOptions(options);
        return openDialog({
            ...settings,
            title: settings.title || 'Input',
            confirmLabel: settings.confirmLabel || 'Save',
            mode: 'prompt'
        });
    };
})();
