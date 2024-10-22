'use client'

import Image from 'next/image'
import gamedev from "@/public/game_dev.jpeg"
import courseScheduler from "@/public/course-schedule-app.png"
import { useEffect, useMemo, useState } from "react";
import { Noticia } from '@/app/font';
import { AnimatePresence, motion } from 'framer-motion';


const Home = () => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isHovering, setIsHovering] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const projects = useMemo(() => [
		{
			name: 'Course-Schedule-App',
			image: courseScheduler,
			category: 'Web',
			description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa sunt facere unde nisi reprehenderit ullam esse laudantium voluptatibus asperiores qui saepe vero consectetur consequuntur nobis fugit quaerat, incidunt quia quasi!',
		},
		{
			name: 'Project Game',
			image: gamedev,
			category: 'Game',
			description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa sunt facere unde nisi reprehenderit ullam esse laudantium voluptatibus asperiores qui saepe vero consectetur consequuntur nobis fugit quaerat, incidunt quia quasi!',
		},
		// Add more projects to the array
	], []);

	useEffect(() => {
		const id = setInterval(() => {
		if (!isHovering) {
			setCurrentIndex((currentIndex + 1) % projects.length);
		}
		}, 3000);
		return () => {
		clearInterval(id);
		};
	}, [projects, currentIndex, isHovering]);

	const handlePrev = () => {
		setCurrentPage(currentPage - 1);
		setCurrentIndex((currentIndex - 1 + projects.length) % projects.length);
	};
	
	const handleNext = () => {
		setCurrentPage(currentPage + 1);
		setCurrentIndex((currentIndex + 1) % projects.length);
	};

	const handleMouseEnter = () => {
		setIsHovering(true);
	};

	const handleMouseLeave = () => {
		setIsHovering(false);
	};

	const variant = {
		initial: { x: 50, opacity: 0},
		animate: { x: 0, opacity: 1},
		exit: { x: -50, opacity: 0},
	};
	

	return (
		<div
		className={`h-full w-full font-noticia-text flex items-center ` + Noticia.className}
		>
		<div className="h-full w-full flex flex-col gap-10 py-32 items-center justify-center">
			<h1 className="text-[7vh]">Project</h1>

			
			{currentIndex >= 0 && currentIndex < projects.length && (
				<AnimatePresence mode='wait'>
					<motion.div key={currentIndex} className="h-full w-full flex">
						<div className="h-[100%] w-[100%] flex items-start">
							<div className="h-[70%] w-full translate-x-[10%]">
								<motion.div className='h-full w-full z-[9]' initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5 }} variants={variant}>
									<p className="text-[3vh] text-start z-10 w-2/4 bg-gradient-to-r from-neutral-800 to-transparent p-5 absolute opacity-80">
										{projects[currentIndex].category}
									</p>
									<Image src={projects[currentIndex].image} loading="lazy" alt={`logo ${projects[currentIndex].name}`} className="w-full h-full object-cover rounded-lg" />
								</motion.div>
							</div>
						</div>
					<div className="h-[100%] w-[100%] flex flex-col justify-center gap-10 items-center">
						<motion.div initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, delay: 0.2 }} variants={variant}>
							<h1 className="text-5xl">{projects[currentIndex].name}</h1>
						</motion.div>
						<div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="h-[80%] w-full  -translate-x-[10%] ">
							<motion.div className='w-full h-full p-10 rounded-lg text-justify bg-neutral-800 overflow-hidden ' initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, delay: 0.4 }} variants={variant}>
								<div >
									<p className="text-[2vh]">{projects[currentIndex].description}</p>
								</div>
							</motion.div>
						</div>
					</div>
					</motion.div>
				</AnimatePresence>
			)}
			

			<div className="flex gap-10 justify-center">
			<button onClick={handlePrev}>
				Prev
			</button>
			<button onClick={handleNext}>
				Next
			</button>
			</div>
		</div>
		</div>
	);
};

export default Home;