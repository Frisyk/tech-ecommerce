// app/admin/categories/new/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { createCategoryWithImage } from "@/lib/action/category";

// Define state structure for images
interface CategoryImageState {
  id: string;
  file: File;
  alt: string;
  previewUrl: string;
}

export default function NewCategoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [categoryImage, setCategoryImage] = useState<CategoryImageState | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  // Clean up object URL when component unmounts or image changes
  React.useEffect(() => {
    if (categoryImage?.previewUrl) {
      return () => {
        URL.revokeObjectURL(categoryImage.previewUrl);
      };
    }
  }, [categoryImage]);

  // Form Field Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image Handling Callbacks
  const handleFileSelectedForUpload = (file: File | null) => {
    if (file) {
      // If there's already an image, revoke its URL first
      if (categoryImage?.previewUrl) {
        URL.revokeObjectURL(categoryImage.previewUrl);
      }
      
      const newImage: CategoryImageState = {
        id: crypto.randomUUID(),
        file: file,
        alt: file.name,
        previewUrl: URL.createObjectURL(file),
      };
      setCategoryImage(newImage);
    }
  };

  const handleRemoveImage = () => {
    if (categoryImage?.previewUrl) {
      URL.revokeObjectURL(categoryImage.previewUrl);
    }
    setCategoryImage(null);
  };

  // Generate slug from name
  const generateSlugFromName = () => {
    if (formData.name) {
      const slug = formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  // Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const submissionData = new FormData();

    // Append all form data
    submissionData.append("name", formData.name);
    submissionData.append("slug", formData.slug);
    submissionData.append("description", formData.description);

    // Append image and alt text if available
    if (categoryImage) {
      submissionData.append("image", categoryImage.file, categoryImage.file.name);
      submissionData.append("imageAlt", categoryImage.alt);
    }

    try {
      const result = await createCategoryWithImage(submissionData);
      if (result.success) {
        toast({
          title: "Category Created",
          description: `Category "${formData.name}" created successfully.`,
        });
        router.push("/admin/categories");
      }
    } catch (error: any) {
      console.error("Category creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong creating the category.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Category</h2>
        <p className="text-muted-foreground">
          Add details and an optional image for your new category.
        </p>
      </div>

      {/* Form Start */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Category Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
              Enter information about the category.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name & Slug Row */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Electronics"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={generateSlugFromName}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug
                  <span className="text-xs text-muted-foreground ml-2">
                    (auto-generated, editable)
                  </span>
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="e.g., electronics"
                  value={formData.slug}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Description Row */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the category (optional)"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Image Card */}
        <Card>
          <CardHeader>
            <CardTitle>Category Image</CardTitle>
            <CardDescription>
              Upload an image to represent this category (optional).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                {/* Display existing image */}
                {categoryImage && (
                  <div className="relative group aspect-square">
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleRemoveImage}
                        disabled={isLoading}
                        aria-label="Remove this image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Image
                      src={categoryImage.previewUrl}
                      alt={categoryImage.alt || "Category image"}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"; // Fallback
                      }}
                    />
                  </div>
                )}

                {/* Upload new image slot */}
                {!categoryImage && (
                  <div className="aspect-square">
                    <ImageUpload onFileSelected={handleFileSelectedForUpload} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categories")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </Button>
        </div>
      </form>
      {/* Form End */}
    </div>
  );
}