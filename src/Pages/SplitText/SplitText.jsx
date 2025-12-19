// src/components/SplitText/SplitText.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * SplitText component (GSAP-powered but DOES NOT require the paid SplitText plugin).
 *
 * Props:
 *  - text: string
 *  - className: string (applied to wrapper element)
 *  - delay: number (ms) - initial delay before first char/word animation
 *  - duration: number (seconds) - duration of each item's animation
 *  - ease: string - GSAP easing string (e.g. "power3.out" or cubic-bezier)
 *  - splitType: "chars" | "words"
 *  - from: { opacity?, y? } - starting values for each item
 *  - to: { opacity?, y? } - ending values for each item
 *  - threshold: number (0..1) - used to compute ScrollTrigger start position
 *  - rootMargin: string (like "-100px") - used to compute start offset (keeps signature similar to IntersectionObserver)
 *  - textAlign: css textAlign for wrapper
 *  - tag: string - tag name for wrapper (p/h1/h2/...)
 *  - stagger: number (ms) - time between each item's start (defaults 40)
 *  - onLetterAnimationComplete: callback after animation done
 */
const SplitText = ({
    text = "",
    className = "",
    delay = 100,
    duration = 0.6,
    ease = "power3.out",
    splitType = "chars",
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    threshold = 0.1,
    rootMargin = "-100px",
    textAlign = "center",
    tag = "p",
    stagger = 40,
    onLetterAnimationComplete,
}) => {
    const elRef = useRef(null);
    const animRef = useRef(null);
    const completedRef = useRef(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);

    // Wait for fonts to load (so measurements and layout are stable)
    useEffect(() => {
        if (document.fonts && document.fonts.status === "loaded") {
            setFontsLoaded(true);
        } else if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => setFontsLoaded(true));
        } else {
            // browser doesn't support Font Loading API -> continue
            setFontsLoaded(true);
        }
    }, []);

    // Build parts to render (characters or words). For words we keep a sep so spacing preserved.
    const parts = useMemo(() => {
        if (!text) return [];
        if (splitType?.toLowerCase?.() === "words") {
            const words = text.split(/\s+/);
            return words.map((w, i) => ({ type: "word", content: w, sep: i < words.length - 1 ? " " : "" }));
        }
        // default: characters (handle unicode)
        return Array.from(text).map((ch) => ({ type: "char", content: ch }));
    }, [text, splitType]);

    // compute ScrollTrigger start string from threshold and rootMargin
    const computeStart = () => {
        const startPct = (1 - Math.min(Math.max(Number(threshold) || 0, 0), 1)) * 100;
        const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(String(rootMargin || ""));
        const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
        const marginUnit = marginMatch ? marginMatch[2] || "px" : "px";
        const sign = marginValue === 0 ? "" : marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`;
        return `top ${startPct}%${sign}`;
    };

    useEffect(() => {
        const el = elRef.current;
        if (!el || !text || parts.length === 0 || !fontsLoaded) return;

        // kill previous animation for this element if any
        if (animRef.current) {
            try {
                animRef.current.scrollTrigger && animRef.current.scrollTrigger.kill();
            } catch (_) { }
            try {
                animRef.current.kill();
            } catch (_) { }
            animRef.current = null;
        }

        // Select targets we created: chars or words
        const selector = splitType?.toLowerCase?.() === "words" ? ".split-word" : ".split-char";
        const targets = Array.from(el.querySelectorAll(selector));
        if (!targets.length) return;

        // Build tween: from -> to with stagger and ScrollTrigger
        const start = computeStart();

        const tween = gsap.fromTo(
            targets,
            { ...from },
            {
                ...to,
                duration: Number(duration) || 0.6,
                ease: ease || "power3.out",
                stagger: (stagger || 40) / 1000, // gsap stagger in seconds
                delay: (delay || 0) / 1000, // initial delay in seconds
                force3D: true,
                willChange: "transform, opacity",
                // Attach ScrollTrigger to the tween so it runs when in view
                scrollTrigger: {
                    trigger: el,
                    start,
                    once: true,
                    fastScrollEnd: true,
                    anticipatePin: 0.4,
                    onEnter: () => {
                        /* no-op */
                    },
                },
                onComplete: () => {
                    completedRef.current = true;
                    if (typeof onLetterAnimationComplete === "function") onLetterAnimationComplete();
                },
            }
        );

        animRef.current = tween;

        // cleanup on unmount / deps change
        return () => {
            try {
                tween.scrollTrigger && tween.scrollTrigger.kill();
            } catch (_) { }
            try {
                tween.kill();
            } catch (_) { }
            animRef.current = null;
        };
        // intentionally include important deps
    }, [
        text,
        parts.length,
        fontsLoaded,
        delay,
        duration,
        ease,
        JSON.stringify(from),
        JSON.stringify(to),
        splitType,
        threshold,
        rootMargin,
        stagger,
        onLetterAnimationComplete,
    ]);

    // Render wrapper tag with spans for characters/words
    const content = parts.map((p, idx) => {
        if (p.type === "word") {
            return (
                // keep the entire word in one span, preserve trailing space in accessible way
                <span
                    key={idx}
                    className="split-word inline-block"
                    aria-hidden={false}
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                    data-split-index={idx}
                >
                    {p.content}
                    <span aria-hidden="true">{p.sep}</span>
                </span>
            );
        }
        // char
        return (
            <span
                key={idx}
                className="split-char inline-block"
                style={{ display: "inline-block", whiteSpace: "pre" }}
                data-split-index={idx}
            >
                {p.content}
            </span>
        );
    });

    // choose tag
    const Tag = tag || "p";
    const wrapperStyle = { textAlign, wordWrap: "break-word", willChange: "transform, opacity" };
    const classes = `split-parent overflow-hidden inline-block whitespace-normal ${className}`.trim();

    return (
        <Tag ref={elRef} style={wrapperStyle} className={classes} aria-label={text}>
            {content}
        </Tag>
    );
};

export default SplitText;