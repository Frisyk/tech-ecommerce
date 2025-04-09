"use client"

import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductSortProps {
  defaultValue?: string
}

export function ProductSort({ defaultValue = "newest" }: ProductSortProps) {
  const router = useRouter()

  const handleValueChange = (value: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set("sort", value)
    router.push(url.toString())
  }

  return (
    <div className="hidden md:flex md:items-center md:gap-2">
      <Select defaultValue={defaultValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
