import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-20 text-center">
      {/* Background gradient effects (CSS-only, no hardcoding) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/50 bg-accent/5">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium text-foreground">Powered by AI-driven insights</span>
      </div>

      {/* Main heading */}
      <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance leading-tight text-foreground">
        Discover Government <span className="text-accent">Schemes</span> Built For You
      </h1>

      {/* Subheading */}
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl text-balance">
        Find eligible government schemes in seconds. Get personalized recommendations, step-by-step guidance, and eligibility checks—all powered by AI.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <Link href="/auth">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <button className="px-8 py-3 border border-border rounded-lg font-medium hover:bg-accent/5 transition-colors">
          Learn More
        </button>
      </div>

      {/* Features showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full mt-12">
        {[
          { title: 'AI-Powered', description: 'Smart recommendations based on your profile' },
          { title: 'Instant Eligibility', description: 'Check if you qualify in seconds' },
          { title: 'Step-by-Step Guide', description: 'Easy application process walkthrough' },
        ].map((feature, i) => (
          <div key={i} className="p-6 rounded-xl border border-border bg-card hover:border-accent/50 transition-colors">
            <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
