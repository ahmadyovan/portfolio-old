import { Inter, Noticia_Text, Roboto_Mono } from 'next/font/google'
 
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})
 
export const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export const Noticia = Noticia_Text({ 
    weight: ['400'], 
    subsets: ['latin-ext'] 
});