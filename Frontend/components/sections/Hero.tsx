import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, FileSearch, Rocket, UserRoundCheck, Sprout, GraduationCap, BriefcaseBusiness } from 'lucide-react'

export function Hero() {
  const personas = [
    { icon: GraduationCap, name: 'Student', text: 'Scholarships, internships, fee support' },
    { icon: Sprout, name: 'Farmer', text: 'Subsidies, crop protection, farm credit' },
    { icon: BriefcaseBusiness, name: 'Job Seeker', text: 'Skill missions, apprenticeships, placements' },
    { icon: Rocket, name: 'Entrepreneur', text: 'Startup grants, credit, mentoring' },
  ]

  return (
    <section className="relative min-h-screen px-4 pt-28 pb-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 left-[-8rem] h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-24 right-[-7rem] h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-secondary/25 blur-3xl" />
      </div>

      <div className="container mx-auto relative">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-border bg-card/85 p-7 sm:p-10 shadow-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2">
            <BadgeCheck className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/75">
              Verified Scheme Discovery
            </span>
          </div>

          <div className="mt-7 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.04] text-foreground">
                Find Government Schemes in Seconds
              </h1>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl">
                Guided discovery + decision assistant that helps you shortlist schemes, check eligibility, and get next actions without guesswork.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link href="/auth">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-full px-8">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="lg" variant="outline" className="rounded-full px-8 border-border hover:bg-accent/10">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/15 p-2 text-primary">
                    <FileSearch className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Personalized Schemes</p>
                    <p className="text-sm text-muted-foreground">Matches based on persona, profile, and location.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-accent/25 p-2 text-foreground">
                    <BadgeCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Eligibility Check</p>
                    <p className="text-sm text-muted-foreground">See what you match and what to fix before applying.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-secondary/30 p-2 text-foreground">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Step-by-Step Guidance</p>
                    <p className="text-sm text-muted-foreground">Clear actions and resources from discovery to submission.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <UserRoundCheck className="h-4 w-4" />
              Personas Preview
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {personas.map(persona => {
                const Icon = persona.icon
                return (
                  <div key={persona.name} className="rounded-2xl border border-border bg-background/70 p-3">
                    <div className="mb-2 inline-flex rounded-xl bg-accent/20 p-2">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <p className="text-sm font-semibold">{persona.name}</p>
                    <p className="text-xs text-muted-foreground">{persona.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
