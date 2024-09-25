'use client'

import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './component/navigation';
import Background from './component/background';

function FrozenRouter({ children }: { children: React.ReactNode }) {
	const context = useContext(LayoutRouterContext);
	const frozen = useRef(context).current;

	return frozen ? (
		<LayoutRouterContext.Provider value={frozen}>
			{children}
		</LayoutRouterContext.Provider>
	) : (
		<>{children}</>
	);
}

const PageTransitionEffect = React.memo(({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const routes = useMemo(() => ['/', '/about', '/project'], []);

  const variants = {
		hidden: { opacity: 0},
		enter: { opacity: 1},
		exit: { opacity: 0},
	};
  
  const isScrollingRef = useRef(false);

  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (isScrollingRef.current) {
		console.log('delay scrolling');
      	return;
	  
    } else {
		console.log('scrolling');
		
	}

    const currentIndex = routes.indexOf(pathname);
    const direction = e.deltaY > 0 ? 1 : -1;
    const newIndex = (currentIndex + direction + routes.length) % routes.length;

    if (newIndex !== currentIndex) {
      isScrollingRef.current = true;
      router.push(routes[newIndex]);
      console.log('navigate to next route');
	  
      setTimeout(() => {
        isScrollingRef.current = false;
		console.log('end of delay scrolling');
		
      }, 3000);
    }
  }, [pathname, router, routes]);

  useEffect(() => {
    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, [handleScroll]);

//   console.log('render');
  

  return (
    <div className='h-screen w-screen flex overflow-hidden'>
      <div className="h-full w-full flex px-10">
          <AnimatePresence mode='wait'>
            <motion.div key={pathname} className='h-full w-full z-10'>
              <motion.div  className="h-full w-full z-10 pl-[5%]"  initial={"hidden"} animate="enter" exit="exit" variants={variants} transition={{ ease: 'easeInOut', duration: 0.5 }}>
                <FrozenRouter>
                  {children}  
                </FrozenRouter>
              </motion.div>
            </motion.div>
					</AnimatePresence>
        <div className="h-full w-1/5 flex items-center justify-end p-10 z-10">
          <Navigation />
        </div>
      </div>
      <Background />  
    </div>
  );
});

PageTransitionEffect.displayName = 'PageTransitionEffect';

export default PageTransitionEffect;