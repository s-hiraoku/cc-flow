import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Keyboard,
  LineChart,
  Palette,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

type Feature = {
  name: string;
  description: string;
  icon: LucideIcon;
};

type Highlight = {
  title: string;
  description: string;
};

type Step = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const navigation = [
  { label: "Editor", href: "/editor" },
  {
    label: "CLI Docs",
    href: "https://github.com/s-hiraoku/cc-flow/tree/main/docs",
    external: true,
  },
  {
    label: "GitHub",
    href: "https://github.com/s-hiraoku/cc-flow",
    external: true,
  },
];

const features: Feature[] = [
  {
    name: "Focus-friendly canvas",
    description:
      "Navigate every agent with the keyboard, track focus with high-contrast rings, and rely on descriptive labels for screen readers.",
    icon: Keyboard,
  },
  {
    name: "Adaptive theming",
    description:
      "Auto-adjust between light, dark, and high-contrast color tokens so workflows stay legible in any environment.",
    icon: Palette,
  },
  {
    name: "Workflow transparency",
    description:
      "Preview live JSON output while you edit to validate branching, inputs, and automation details at a glance.",
    icon: LineChart,
  },
  {
    name: "Secure hand-off",
    description:
      "Export validated flows directly into cc-flow-cli commands with guardrails that catch breaking changes early.",
    icon: ShieldCheck,
  },
];

const highlights: Highlight[] = [
  {
    title: "Screen reader-ready",
    description:
      "All nodes, actions, and connections announce readable names so assistive tech mirrors what you see on screen.",
  },
  {
    title: "Reduced motion aware",
    description:
      "Animations respect prefers-reduced-motion, switching to subtle fades without distracting movement.",
  },
  {
    title: "Accessible contrast",
    description:
      "We target WCAG AA contrast and offer color tokens that work on glassmorphism and solid surfaces alike.",
  },
];

const steps: Step[] = [
  {
    title: "Structure agents visually",
    description:
      "Drag, duplicate, and connect actions with keyboard shortcuts or pointer gestures. Each step stays aligned with smart guides.",
    icon: Workflow,
  },
  {
    title: "Audit logic instantly",
    description:
      "Hover to view connection summaries, expand validation hints, and lock your flow when hand-off is ready.",
    icon: Sparkles,
  },
  {
    title: "Export with confidence",
    description:
      "Share a clean cc-flow-cli command or JSON output with teammates, including notes and testing reminders.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 scroll-smooth">
      <a
        href="#main-content"
        className="absolute left-6 top-6 z-50 -translate-y-32 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition-transform focus-visible:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span aria-hidden className="rounded-full bg-indigo-500/20 p-2 text-indigo-300">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-semibold tracking-tight text-white">CC-Flow Web</span>
          </div>
          <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navigation.map((item) => {
              const baseClasses =
                "rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400";

              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseClasses} text-slate-300 hover:text-white focus-visible:text-white`}
                  >
                    {item.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${baseClasses} text-slate-300 hover:text-white focus-visible:text-white`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/30 transition-transform hover:-translate-y-0.5 hover:bg-indigo-300 focus-visible:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              Open Editor
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
        <nav
          aria-label="Primary mobile"
          className="mx-auto flex w-full max-w-7xl items-center gap-3 overflow-x-auto px-4 pb-4 pt-2 text-sm font-medium md:hidden"
        >
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200 backdrop-blur transition-colors hover:border-indigo-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              {item.label}
              {item.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
            </a>
          ))}
        </nav>
      </header>

      <main id="main-content" className="relative isolate">
        <div className="pointer-events-none absolute inset-x-0 top-[-18rem] -z-10 transform-gpu overflow-hidden blur-3xl">
          <div
            className="relative left-[max(50%,25rem)] aspect-[1155/678] w-[72.1875rem] -translate-x-1/2 bg-gradient-to-tr from-indigo-500 via-sky-500 to-purple-500 opacity-30"
            aria-hidden
          />
        </div>

        <section
          aria-labelledby="hero-heading"
          className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:py-24"
        >
          <div className="flex-1 space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Crafted for inclusive automation teams
            </span>
            <h1
              id="hero-heading"
              className="text-balance text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl"
            >
              Design and share CC-Flow workflows without friction
            </h1>
            <p className="max-w-2xl text-lg text-slate-300 sm:text-xl">
              Build flows with confidence using smart templates, live validation, and assistive-friendly navigation. Every detail is tuned so experts and newcomers can collaborate quickly.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/editor"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-indigo-500/30 transition-transform hover:-translate-y-0.5 hover:bg-indigo-300 focus-visible:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              >
                Launch the editor
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="https://github.com/s-hiraoku/cc-flow/tree/main/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-slate-100 transition hover:border-indigo-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              >
                Browse the docs
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner backdrop-blur motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-4">
                <dt className="text-sm text-slate-300">Optimised for accessibility</dt>
                <dd className="mt-1 text-2xl font-semibold text-white">Keyboard-first controls</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner backdrop-blur motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-6">
                <dt className="text-sm text-slate-300">Team onboarding</dt>
                <dd className="mt-1 text-2xl font-semibold text-white">5-minute walkthrough</dd>
              </div>
            </dl>
          </div>

          <div className="flex-1">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-lg motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-right-8">
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-500/20 via-transparent to-purple-500/10" aria-hidden />
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span className="font-semibold uppercase tracking-wider">Workflow preview</span>
                <span className="rounded-full bg-white/10 px-2 py-1 font-mono text-[10px]">Live sync</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-inner">
                  <p className="text-sm font-semibold text-slate-100">Visual builder</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Hover a node to reveal quick actions, press <kbd className="rounded border border-white/20 bg-white/10 px-1">Tab</kbd> to focus the next agent, and use <kbd className="rounded border border-white/20 bg-white/10 px-1">Shift</kbd> + <kbd className="rounded border border-white/20 bg-white/10 px-1">Space</kbd> to pin details.
                  </p>
                </div>
                <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-sm leading-relaxed text-slate-200">
{`{
  "flowId": "support-escalation",
  "entry": "triageAgent",
  "agents": [
    {
      "id": "triageAgent",
      "type": "classifier",
      "fallback": "escalationAgent"
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="features-heading"
          className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="max-w-3xl">
            <h2 id="features-heading" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Ship inclusive workflows faster
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              CC-Flow Web keeps you in flow with approachable controls, friendly defaults, and the guardrails teams expect in production automation.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.name}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:bg-white/10 focus-within:-translate-y-1"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                  <feature.icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{feature.description}</p>
                </div>
                <span className="mt-auto text-xs font-semibold uppercase tracking-wide text-indigo-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Learn more
                </span>
                <span className="sr-only">Feature details for {feature.name}</span>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="experience-heading"
          className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <h2 id="experience-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Built to stay accessible as your flows scale
              </h2>
              <p className="text-lg text-slate-300">
                Inclusive defaults keep the editor approachable for every teammate while motion and depth reinforce hierarchy without overwhelming.
              </p>
              <ul className="space-y-4">
                {highlights.map((highlight) => (
                  <li key={highlight.title} className="flex gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-white">{highlight.title}</p>
                      <p className="text-sm text-slate-300">{highlight.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-6">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-right-6"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                      <step.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="cta-heading"
          className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8"
        >
          <div className="overflow-hidden rounded-3xl border border-indigo-400/40 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 p-[1px] shadow-2xl">
            <div className="flex flex-col gap-8 rounded-3xl bg-slate-950/95 px-8 py-10 sm:px-12 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <h2 id="cta-heading" className="text-3xl font-semibold text-white">
                  Ready to build your next agent workflow?
                </h2>
                <p className="max-w-xl text-base text-slate-300">
                  Spin up CC-Flow Web locally or inside your pipeline. Share annotated previews, gather feedback, and export production-ready configurations in minutes.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/editor"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                >
                  Start in the editor
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <a
                  href="https://github.com/s-hiraoku/cc-flow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-slate-100 transition hover:border-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                >
                  View the repository
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} CC-Flow. Built for accessible automation teams.</p>
          <div className="flex gap-4">
            <a
              href="https://github.com/s-hiraoku/cc-flow/tree/main/docs/accessibility"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              Accessibility guide
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href="https://github.com/s-hiraoku/cc-flow/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              Report an issue
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
