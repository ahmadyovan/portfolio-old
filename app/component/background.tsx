import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";
import { elements } from "@/app/component/background-elements";

const Background = React.memo(() => {
    const pathname = usePathname();

    const variants = useMemo(() => ({
        initial: { x: -420, opacity: 0, y: -500, rotate: -40 },
        animate: { x: 0, opacity: 1, y: 0 },
        exit: { x: 370, opacity: 0, y: 440 },
    }), []);

    // State untuk menyimpan ukuran jendela
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    // Mengambil ukuran jendela hanya di sisi klien
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Set ukuran jendela saat komponen dimount
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // useMotionValue untuk mengatur posisi mouse
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Mengubah nilai gerakan berdasarkan posisi mouse
    const moveX = useTransform(mouseX, [0, windowSize.width], [50, -50]);
    const moveY = useTransform(mouseY, [0, windowSize.height], [25, -25]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        // Update nilai motion value hanya di sisi klien
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    }, [mouseX, mouseY]);

    useEffect(() => {
        if (windowSize.width && windowSize.height) {
            window.addEventListener('mousemove', handleMouseMove);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleMouseMove, windowSize]);

    // console.log('render');
    

    return (
        <div className="absolute h-full w-full overflow-hidden">
            <div className="h-full w-full bg-black bg-transparent z-[1] absolute"></div>
            <AnimatePresence mode="wait">
                <motion.div key={pathname}>
                    {elements.map((elem, index) => (
                        <motion.div 
                            key={index} 
                            className="absolute" 
                            style={elem.style} 
                            variants={variants} 
                            initial="initial"
                            animate="animate"
                            exit="exit" 
                            transition={elem.transition}>
                            <motion.div
                                className={`${elem.backgroundColor} w-full h-full`}
                                style={{
                                    x: moveX,
                                    y: moveY,
									transition: `all ${elem.transition.duration}s linear`,
                                }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
});

Background.displayName = 'Background';

export default Background;
