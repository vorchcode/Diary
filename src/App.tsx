import { useState } from 'react'
import { Opening } from './components/safespace/Opening'
import { ComfortMessages } from './components/safespace/ComfortMessages'
import { Journal } from './components/safespace/Journal'
import { LetItOut } from './components/safespace/LetItOut'
import { BreakBubble } from './components/safespace/BreakBubble'
import { PetalCatch } from './components/safespace/PetalCatch'
import { Closing } from './components/safespace/Closing'
import { MusicToggle } from './components/safespace/MusicToggle'
import { Reveal } from './components/safespace/Reveal'

export default function App() {
  const [entered, setEntered] = useState(false)

  const enter = () => {
    setEntered(true)
    setTimeout(() => {
      document.getElementById('after-opening')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <main className="relative">
      <MusicToggle />
      <Opening onEnter={enter} />

      {entered && (
        <div id="after-opening" className="animate-fade-up">
          <ComfortMessages />

          <Journal />

          <section className="px-6 py-24">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <div className="mb-12 text-center">
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Release</p>
                  <h2 className="mt-3 text-3xl font-light sm:text-4xl">Soft ways to let go</h2>
                </div>
              </Reveal>
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-2">
                <LetItOut />
                <BreakBubble />
                <PetalCatch />
              </div>
            </div>
          </section>

          <Closing />
        </div>
      )}
    </main>
  )
}
