"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import { generateSlug } from "@/lib/utils"

export default function NewProductPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    categoryId: "",
    inventoryQuantity: "0",
    isFeatured: false,
    isActive: true,
  })
  const [categories, setCategories] = useState<any[]>([])
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  // Fetch categories on component mount
  useState(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name").order("name")

      if (data) {
        setCategories(data)
      }
    }

    fetchCategories()
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const slug = generateSlug(formData.name)

      const { data, error } = await supabase
        .from("products")
        .insert({
          name: formData.name,
          slug,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          compare_at_price: formData.compareAtPrice ? Number.parseFloat(formData.compareAtPrice) : null,
          category_id: formData.categoryId || null,
          inventory_quantity: Number.parseInt(formData.inventoryQuantity),
          is_featured: formData.isFeatured,
          is_active: formData.isActive,
        })
        .select("id")
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Product created",
        description: "Your product has been created successfully.",
      })

      router.push("/admin/products")
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
        <h2 className="text-3xl font-bold tracking-tight">New Product</h2>
        <p className="text-muted-foreground">Create a new product for your store</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  className="pl-7"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare at Price</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                <Input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventoryQuantity">Inventory</Label>
              <Input
                id="inventoryQuantity"
                name="inventoryQuantity"
                type="number"
                min="0"
                placeholder="0"
                value={formData.inventoryQuantity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => handleSwitchChange("isFeatured", checked)}
              />
              <Label htmlFor="isFeatured">Featured Product</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
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
              "Create Product"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
