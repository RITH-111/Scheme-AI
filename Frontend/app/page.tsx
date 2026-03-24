import { NavBar } from '@/components/sections/NavBar'
import { Hero } from '@/components/sections/Hero'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <Hero />
    </main>
  )
}
