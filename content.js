// ./content.js

(() => {
    'use strict';

    const TARGET = "div.popover-hoverable[popover-text], div.popover-hoverable[uib-popover]";

    const getCopyText = (el) =>
        el.getAttribute('popover-text') || el.getAttribute('uib-popover') || '';

    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.focus(); ta.select();
                document.execCommand('copy');
                ta.remove();
            }
        } catch (e) {
            console.warn('Copy failed', e);
        }
    }

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.textContent = msg;
        Object.assign(toast.style, {
            position: 'fixed',
            zIndex: 2147483647,
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 12px',
            background: 'rgba(0,0,0,.85)',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '12px',
            userSelect: 'none',
            pointerEvents: 'none',
            transition: 'opacity .25s ease'
        });
        document.body.appendChild(toast);
        setTimeout(() => (toast.style.opacity = '0'), 1200);
        setTimeout(() => toast.remove(), 1600);
    }

    function enhance(el) {
        if (el.dataset.lgCopyProcessed === '1') return;
        const textToCopy = getCopyText(el);
        if (!textToCopy) return;

        el.dataset.lgCopyProcessed = '1';
        el.style.textDecoration = 'underline';
        el.style.cursor = 'pointer';
        if (!el.style.color) el.style.color = '#0a58ca';
        el.setAttribute('title', 'Copy link');
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');

        const handler = async (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            await copyToClipboard(textToCopy);
            showToast('Copied');
        };
        el.addEventListener('click', handler);
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') handler(e);
        });
    }

    function scan(root = document) {
        root.querySelectorAll(TARGET).forEach(enhance);
    }

    function init() {
        scan();
        const mo = new MutationObserver((mut) => {
            for (const m of mut) {
                if (m.type === 'childList') {
                    m.addedNodes.forEach((n) => {
                        if (n.nodeType !== 1) return;
                        if (n.matches?.(TARGET)) enhance(n);
                        scan(n);
                    });
                } else if (m.type === 'attributes' && m.target.matches?.(TARGET)) {
                    enhance(m.target);
                }
            }
        });
        mo.observe(document.documentElement, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['popover-text', 'uib-popover']
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();