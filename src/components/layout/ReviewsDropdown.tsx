import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

interface Category {
  name: string;
  href: string;
}

interface ReviewsDropdownProps {
  categories: Category[];
}

export function ReviewsDropdown({ categories }: ReviewsDropdownProps) {
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
