'use client'

import Image from 'next/image'
import htmllogo from '@/public/html-1.svg'
import csslogo from '@/public/css-3.svg'
import javscriptlogo from '@/public/logo-javascript.svg'
import reactlogo from '@/public/react-2.svg'
import nextjslogo from '@/public/next-js.svg'
import tailwindcsslogo from '@/public/tailwind-css-2.svg'
import phplogo from '@/public/php.svg'
import laravellogo from '@/public/laravel-2.svg'
import { Noticia } from '@/app/font'


const Home = () => {

	const skills = [
		{ id: 1, name: 'HTML', logo: htmllogo, progress: '80%' },
		{ id: 2, name: 'CSS', logo: csslogo, progress: '70%' },
		{ id: 3, name: 'JavaScript', logo: javscriptlogo, progress: '60%' },
		{ id: 4, name: 'react', logo: reactlogo, progress: '60%' },
		{ id: 5, name: 'nextjs', logo: nextjslogo, progress: '60%' },
		{ id: 6, name: 'taiwindcss', logo: tailwindcsslogo, progress: '60%' },
		{ id: 7, name: 'php', logo: phplogo, progress: '60%' },
		{ id: 8, name: 'laravel', logo: laravellogo, progress: '60%' },
	  ];

	//   console.log('render');
	  

    return(
        <div className={`h-full w-full font-noticia-text flex flex-col gap-5 justify-center items-center pb-5 ` + Noticia.className}>
			<div className="flex flex-col items-start w-full bg-[#13131379] rounded-lg p-6">
				<h1 className="text-[7vh]">About</h1>
				<p className="text-justify text-[3vh]">I am a student just beginning my journey in programming, with a strong determination to continuously learn and grow. With the foundational knowledge of programming that I have acquired, I am eager to explore more in-depth topics like web development, applications, and other technologies. </p>
			</div>
			<div className="flex flex-col items-start w-full bg-[#13131379] rounded-lg p-6">
				<h1 className="text-[7vh]">Skill</h1>
				<p className="text-[3vh]">The tools and technologies I have already learned</p>
				<div className="w-full flex flex-wrap gap-5 pt-5">
                    {skills.map((skill) => (
						<div key={skill.id} className="flex w-[18.5%] gap-2 mb-4">
							<div className="h-[5vh] w-[5vw]">
								<Image src={skill.logo} alt={`logo ${skill.name}`} className="w-full h-full" />
							</div>
							<div className="w-full flex flex-col gap-2">
								<h5 className="text-[2vh]">{skill.name}</h5>
								<div className="bg-white h-[10%] w-full">
									<div className="bg-blue-500 h-full" style={{ width: skill.progress }}></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
    )
}

export default Home
