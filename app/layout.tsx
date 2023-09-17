import '../dist/globals.css'
import {JSX} from 'react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <html lang="en">
      <body 
        id={'root'}
        className={inter.className + ' ' + 
          'flex p-4 h-screen w-screen'} 
      >
        {children}
      </body>
    </html>
  )
}