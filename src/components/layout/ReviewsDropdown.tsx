import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

const categories = [
  { name: "Novel", href: "/novel" },
  { name: "Manga", href: "/manga" },
  { name: "Anime", href: "/anime" },
  { name: "Movie", href: "/movie" },
  { name: "Games", href: "/game" },
]

export function ReviewsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full px-3 py-1.5 h-auto">
          Reviews
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[120px]">
        {categories.map((category) => (
          <DropdownMenuItem key={category.href} asChild>
            <a
              href={category.href}
              className="w-full cursor-pointer"
            >
              {category.name}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
