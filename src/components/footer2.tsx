import { cn } from "@/lib/utils"

interface FooterLink {
  name: string
  href: string
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

interface Footer2Props {
  description?: string
  sections?: FooterSection[]
  copyright?: string
  legalLinks?: FooterLink[]
  className?: string
}

type Props = Partial<Footer2Props>

const defaultProps: Footer2Props = {
  description: "Personal novel reviews and recommendations \u2014 honest takes, no fluff.",
  sections: [
    {
      title: "Explore",
      links: [
        { name: "Home", href: "/" },
        { name: "Novel Reviews", href: "/novel" },
        { name: "About", href: "/about" },
      ],
    },
    {
      title: "Connect",
      links: [
        { name: "GitHub", href: "https://github.com/rockyxwall" },
        { name: "Discord", href: "https://discord.gg/cunXbtHm5g" },
      ],
    },
  ],
  copyright: "\u00a9 2026 LazyNoman. All rights reserved.",
  legalLinks: [
    { name: "Privacy Policy", href: "#" },
  ],
}

const MAX_SECTIONS = 4

const Footer2 = (props: Props) => {
  const { description, sections, copyright, legalLinks, className } = {
    ...defaultProps,
    ...props,
  }

  const visibleSections = (sections ?? []).slice(0, MAX_SECTIONS)

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="mx-auto max-w-[1152px] px-6 py-12">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
          <div className="col-span-2 mb-8 lg:mb-0">
            <a
              href="/"
              className="text-lg font-heading font-bold tracking-tight no-underline"
            >
              LazyNoman
            </a>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          {visibleSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="mb-4 text-sm font-semibold tracking-tight">
                {section.title}
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {section.links.map((link, linkIdx) => (
                  <li
                    key={linkIdx}
                    className="font-medium transition-colors hover:text-primary"
                  >
                    <a href={link.href}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>{copyright}</p>
          <ul className="flex gap-4">
            {legalLinks?.map((link, linkIdx) => (
              <li
                key={linkIdx}
                className="underline transition-colors hover:text-primary"
              >
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

export { Footer2 }
