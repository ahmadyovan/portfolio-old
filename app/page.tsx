'use client'

import { motion } from "framer-motion";
// import { motion } from "framer-motion";

const Home = () => {

	const variant = {
		initial: { x: -100, opacity: 1},
		animate: { x: 0, opacity: 1},
		exit: { x: 100, opacity: 1},
	}	

	return (
		<div className={`h-full w-full font-noticia-text flex items-center`}>
			<div className="flex flex-col pl-[5%] items-end pt-32">
				<motion.div variants={variant} initial='initial' animate='animate' exit='exit' transition={{type: "tween", duration: 0.6, ease: "easeOut"}}>
					<h1 className="text-[8vh] text-neutral-300 leading-[7vh]">AHMAD YOVAN</h1>
				</motion.div>
				<motion.div variants={variant} initial='initial' animate='animate' exit='exit' transition={{type: "tween", duration: 0.6, ease: "easeOut"}}>
					<h2 className="text-[5vh] text-purple-700">PORTFOLIO</h2>
				</motion.div>
			</div>
		</div>
	);
};

export default Home