"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import { generateSlug } from "@/lib/utils"

export default function NewCategoryPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  })
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "name" && !formData.slug) {
      // Auto-generate slug from name if slug is empty
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("categories").insert({
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Category created",
        description: "Your category has been created successfully.",
      })

      router.push("/admin/categories")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Category</h2>
        <p className="text-muted-foreground">Create a new category for your products</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="category-slug"
              value={formData.slug}
              onChange={handleChange}
              required
            />
            <p className="text-sm text-muted-foreground">
              The slug is used in the URL. It will be auto-generated from the name if left empty.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter category description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
