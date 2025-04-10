// app/admin/products/new/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
// Removed Tab imports
import {
  Card,
  CardContent,
  CardDescription, // Import CardDescription
  CardHeader,    // Import CardHeader
  CardTitle,     // Import CardTitle
} from "@/components/ui/card"; // Added Card related imports
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { fetchCategories } from "@/lib/action/category";
import { createProductWithImages } from "@/lib/action/products";

// Define Category Type
interface Category {
  id: string;
  name: string;
}

// Define state structure for images
interface ProductImageState {
  id: string;
  file: File;
  alt: string;
  previewUrl: string;
}

export default function NewProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    categoryId: "",
    inventoryQuantity: "0",
    isFeatured: false,
    isActive: true,
  });
  const [productImages, setProductImages] = useState<ProductImageState[]>([]);

  const { toast } = useToast();
  const router = useRouter();

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data || []);
      } catch (err: any) {
        console.error("Failed to load categories:", err);
        toast({
          title: "Error loading categories",
          description: err.message || "Could not fetch categories.",
          variant: "destructive",
        });
      }
    };
    loadCategories();
  }, [toast]);

  // Clean up object URLs
  useEffect(() => {
    const urls = productImages.map((img) => img.previewUrl);
    return () => {
      urls.forEach(URL.revokeObjectURL);
      // console.log("Revoked preview URLs on cleanup/change"); // uncomment for debugging
    };
  }, [productImages]);

  // --- Form Field Handlers (Using useCallback for potential memoization benefits) ---
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSwitchChange = useCallback((name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // --- Image Handling Callbacks ---
  const handleFileSelectedForUpload = useCallback((file: File | null) => {
    if (file) {
      const newImage: ProductImageState = {
        id: crypto.randomUUID(),
        file: file,
        alt: file.name,
        previewUrl: URL.createObjectURL(file),
      };
      setProductImages((prev) => [...prev, newImage]);
    }
  }, []);

  const handleRemoveImage = useCallback((idToRemove: string) => {
    setProductImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === idToRemove);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
        // console.log("Revoked preview URL on remove:", imageToRemove.previewUrl); // uncomment for debugging
      }
      return prev.filter((image) => image.id !== idToRemove);
    });
  }, []);

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productImages.length === 0) {
      toast({
        title: "Missing Image",
        description: "Please add at least one product image.",
        variant: "destructive",
      });
      return; // Stop submission if no images
    }
    setIsLoading(true);

    const submissionData = new FormData();

    // Append all form data
    submissionData.append("name", formData.name);
    submissionData.append("description", formData.description);
    submissionData.append("price", formData.price);
    submissionData.append("compareAtPrice", formData.compareAtPrice);
    submissionData.append("categoryId", formData.categoryId || "none");
    submissionData.append("inventoryQuantity", formData.inventoryQuantity);
    submissionData.append("isFeatured", String(formData.isFeatured));
    submissionData.append("isActive", String(formData.isActive));

    // Append images and alt texts
    productImages.forEach((imgState) => {
      submissionData.append("images", imgState.file, imgState.file.name);
      submissionData.append("altTexts", imgState.alt);
    });

    try {
      const result = await createProductWithImages(submissionData);
      if (result.success) {
        toast({
          title: "Product Created",
          description: `Product "${formData.name}" created successfully.`,
        });
        router.push("/admin/products");
      }
    } catch (error: any) {
      console.error("Product creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong creating the product.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render JSX ---
  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Product</h2>
        <p className="text-muted-foreground">
          Add details and images for your new product.
        </p>
      </div>

      {/* Form Start */}
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Product Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Enter the main information about the product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name & Category Row */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Organic Cotton T-Shirt"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    handleSelectChange("categoryId", value)
                  }
                  disabled={isLoading}
                >
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

            {/* Description Row */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description of the product (optional)"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                disabled={isLoading}
              />
            </div>

            {/* Pricing & Inventory Row */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">
                    Rp
                  </span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="1" // Sesuaikan step jika perlu (misal 0.01 untuk desimal)
                    min="0"
                    placeholder="150000"
                    value={formData.price}
                    onChange={handleChange}
                    className="pl-8" // Padding for Rp symbol
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare at Price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">
                    Rp
                  </span>
                  <Input
                    id="compareAtPrice"
                    name="compareAtPrice"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Optional (e.g., 200000)"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                    className="pl-8"
                    disabled={isLoading}
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
                  step="1"
                  placeholder="0"
                  value={formData.inventoryQuantity}
                  onChange={handleChange}
                  required // Usually required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Switches Row */}
            <div className="grid gap-6 md:grid-cols-2 pt-4">
              <div className="flex items-center space-x-3">
                <Switch
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("isFeatured", checked)
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor="isFeatured"
                  className="cursor-pointer text-sm font-medium"
                >
                  Featured Product
                  <p className="text-xs text-muted-foreground">
                     Display this product prominently.
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("isActive", checked)
                  }
                  disabled={isLoading}
                />
                 <Label
                  htmlFor="isActive"
                  className="cursor-pointer text-sm font-medium"
                 >
                  Product Status: Active
                  <p className="text-xs text-muted-foreground">
                     Make this product visible in your store.
                  </p>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Images Card */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              Upload one or more images. The first image will be the main display image. Drag to reorder (feature not implemented).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"> {/* Responsive Grid */}
                {/* Display existing images */}
                {productImages.map((imageState, index) => (
                  <div key={imageState.id} className="relative group aspect-square">
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                       <Button
                         type="button"
                         variant="destructive"
                         size="icon"
                         className="h-8 w-8"
                         onClick={() => handleRemoveImage(imageState.id)}
                         disabled={isLoading}
                         aria-label="Remove this image"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                    <Image
                      src={imageState.previewUrl}
                      alt={imageState.alt || `Product image ${index + 1}`}
                      width={150}
                      height={150}
                      className="h-full w-full object-cover rounded-lg border"
                       onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"; // Fallback
                       }}
                    />
                    {/* Optional: Display index/order number */}
                    {/* <span className="absolute bottom-1 right-1 bg-background/80 text-foreground text-xs px-1 rounded-sm">{index + 1}</span> */}
                  </div>
                ))}

                {/* Upload new image slot */}
                <div className="aspect-square">
                  <ImageUpload onFileSelected={handleFileSelectedForUpload} />
                </div>
              </div>
              {productImages.length === 0 && (
                <p className="text-sm text-center text-destructive-foreground bg-destructive/10 p-3 rounded-md border border-destructive">
                  No images added yet. Please add at least one image.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4"> {/* Buttons at the end */}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || productImages.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
      {/* Form End */}
    </div>
  );
}