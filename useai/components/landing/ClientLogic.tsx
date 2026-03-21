'use client';

import { useEffect } from 'react';

export default function ClientLogic() {
    useEffect(() => {
        // === Cursor Logic ===
        const cd = document.getElementById('cd');
        const cr = document.getElementById('cr');
        let mx = 0, my = 0, rx = 0, ry = 0;

        const onMouseMove = (e: MouseEvent) => {
            mx = e.clientX; my = e.clientY;
            if (cd) { cd.style.left = mx + 'px'; cd.style.top = my + 'px'; }
        };
        document.addEventListener('mousemove', onMouseMove);

        let rafId: number;
        const loop = () => {
            rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
            if (cr) { cr.style.left = rx + 'px'; cr.style.top = ry + 'px'; }
            rafId = requestAnimationFrame(loop);
        };
        loop();

        const addHov = () => document.body.classList.add('hov');
        const rmHov = () => document.body.classList.remove('hov');
        const addClk = () => document.body.classList.add('clk');
        const rmClk = () => document.body.classList.remove('clk');

        const bindHovers = () => {
            document.querySelectorAll('a, button, .bn, .tc, .pc, .step, .ic').forEach(el => {
                el.addEventListener('mouseenter', addHov);
                el.addEventListener('mouseleave', rmHov);
            });
        };

        bindHovers();
        document.addEventListener('mousedown', addClk);
        document.addEventListener('mouseup', rmClk);

        // === Scroll Nav ===
        const onScroll = () => {
            const nav = document.getElementById('nav');
            if (nav) nav.classList.toggle('stuck', window.scrollY > 40);
        };
        window.addEventListener('scroll', onScroll);

        // === Intersection Reveal ===
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
        }, { threshold: 0.1 });

        const startObservingRef = () => {
            document.querySelectorAll('.reveal, .step, .bn, .tc, .pc, .stat-col, .phone').forEach(el => io.observe(el));
        };
        startObservingRef();

        // === Counter Animation ===
        const cio = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const el = e.target as HTMLElement;
                const v = +(el.dataset.v || 0);
                const s = el.dataset.s || '';
                const d = 2000;
                const t = performance.now();

                const tick = (now: number) => {
                    const p = Math.min(Math.max((now - t) / d, 0), 1);
                    const val = Math.floor((1 - Math.pow(1 - p, 3)) * v);
                    el.textContent = val.toLocaleString('en-IN') + s;
                    if (p < 1) requestAnimationFrame(tick);
                    else el.textContent = v.toLocaleString('en-IN') + s;
                };
                requestAnimationFrame(tick);
                cio.unobserve(el);
            });
        }, { threshold: 0.6 });

        const startCounterObservingRef = () => {
            document.querySelectorAll('.counter[data-v]').forEach(el => cio.observe(el));
        };
        startCounterObservingRef();

        // === Click Burst Animation ===
        const onClick = (e: MouseEvent) => {
            for (let i = 0; i < 6; i++) {
                const p = document.createElement('div');
                const a = (i / 6) * 360;
                const d = 30 + Math.random() * 40;
                Object.assign(p.style, {
                    position: 'fixed', left: e.clientX + 'px', top: e.clientY + 'px',
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: i % 2 === 0 ? '#e8420a' : '#1a1917',
                    pointerEvents: 'none', zIndex: '99999',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s'
                });
                document.body.appendChild(p);
                requestAnimationFrame(() => {
                    p.style.transform = `translate(${Math.cos(a * Math.PI / 180) * d}px, ${Math.sin(a * Math.PI / 180) * d - 20}px) scale(0)`;
                    p.style.opacity = '0';
                });
                setTimeout(() => p.remove(), 550);
            }
        };
        document.addEventListener('click', onClick);

        // Initial staggered delays setting dynamically (fallback if css misses it)
        document.querySelectorAll('.step').forEach((s, idx) => { (s as HTMLElement).style.transitionDelay = (idx * 0.08) + 's'; });
        document.querySelectorAll('.stat-col').forEach((s, idx) => { (s as HTMLElement).style.transitionDelay = (idx * 0.1) + 's'; });

        // Using a MutationObserver to re-bind hovers when DOM dynamically updates (React children updates)
        const observer = new MutationObserver(() => {
            bindHovers();
            startObservingRef();
            startCounterObservingRef();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', addClk);
            document.removeEventListener('mouseup', rmClk);
            document.removeEventListener('click', onClick);
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(rafId);
            io.disconnect();
            cio.disconnect();
            observer.disconnect();
            document.querySelectorAll('a, button, .bn, .tc, .pc, .step, .ic').forEach(el => {
                el.removeEventListener('mouseenter', addHov);
                el.removeEventListener('mouseleave', rmHov);
            });
        };
    }, []);

    return null;
}
