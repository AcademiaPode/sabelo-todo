import React, { useState, useEffect } from 'react';

export const AnimatedNumber = ({ target }: { target: number }) => {
    const [current, setCurrent] = useState(0);
    const ref = React.useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    let start = 0;
                    const end = target;
                    if (start === end) {
                        setCurrent(end);
                        return;
                    }

                    const duration = 1500;
                    const startTime = Date.now();

                    const step = () => {
                        const now = Date.now();
                        const time = now - startTime;
                        const progress = Math.min(time / duration, 1);
                        const value = Math.floor(progress * (end - start) + start);
                        setCurrent(value);
                        if (progress < 1) {
                            requestAnimationFrame(step);
                        }
                    };
                    requestAnimationFrame(step);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [target]);

    return <span ref={ref}>{current.toLocaleString()}</span>;
};
