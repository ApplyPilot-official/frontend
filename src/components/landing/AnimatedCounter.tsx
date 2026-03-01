"use client";

import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

export default function AnimatedCounter({
    target,
    suffix = "",
    prefix = "",
}: {
    target: number;
    suffix?: string;
    prefix?: string;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const end = target;
        const duration = 2000;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}
