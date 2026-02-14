import { Hero } from '@/components/sections/Hero'
import { Install } from '@/components/sections/Install'
import { Workflow } from '@/components/sections/Workflow'
import { Features } from '@/components/sections/Features'
import { CallToAction } from '@/components/sections/CallToAction'

/**
 * Homepage component
 * Displays hero section and features
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Install />
      <Workflow />
      <Features />
      <CallToAction />
    </>
  )
}
