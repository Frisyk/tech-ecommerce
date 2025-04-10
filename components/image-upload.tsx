// components/admin/products/ImageUpload.tsx
"use client";

import React, { useState, useCallback } from "react"; // Import React and useCallback
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
// import { uploadImageToSupabase } from "@/lib/action/products"; // <-- REMOVE: No longer uploading here

interface ImageUploadProps {
  // Modified prop: Now expects the File object
  onFileSelected: (file: File | null) => void;
  // Optional: prop to clear the selection from parent
  onFileRemoved?: () => void;
}

export function ImageUpload({ onFileSelected, onFileRemoved }: ImageUploadProps) {
  // Keep track of the file object itself
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // For preview generation
  const { toast } = useToast();

  // Use useCallback for stable function reference if passed down deeply
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset previous state
    if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
    }
    setSelectedFile(null);
    // Clear file input value to allow re-selecting the same file
    e.target.value = '';

    if (!file) {
        onFileSelected(null); // Notify parent that selection was cleared
        return;
    }

    // Client-side validation (optional but good UX)
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (png, jpg, gif, webp).",
        variant: "destructive",
      });
       onFileSelected(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
       onFileSelected(null);
      return;
    }

    setIsProcessing(true);
    try {
        // Generate preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setSelectedFile(file);
        // Pass the selected File object to the parent component
        onFileSelected(file);
    } catch (error) {
        console.error("Error creating object URL:", error);
        toast({
            title: "Preview Error",
            description: "Could not create image preview.",
            variant: "destructive",
        });
        setPreview(null);
        setSelectedFile(null);
        onFileSelected(null);
    } finally {
        setIsProcessing(false);
    }
  }, [preview, onFileSelected, toast]); // Dependencies for useCallback

  const handleRemovePreview = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setSelectedFile(null);
    // Notify parent that the file was removed
    onFileSelected(null);
    if (onFileRemoved) {
        onFileRemoved();
    }
     // Also clear the actual file input if possible (though it's hidden)
     const fileInput = document.getElementById("file-upload") as HTMLInputElement | null;
     if (fileInput) {
         fileInput.value = '';
     }
  }, [preview, onFileSelected, onFileRemoved]);

  return (
    <div className="space-y-4">
      {!preview ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-12 text-center">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag & drop or click to browse
          </p>
          <Button
            type="button" // Important: Prevent form submission
            variant="outline"
            disabled={isProcessing}
            onClick={() => document.getElementById("file-upload")?.click()}
            size="sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Select Image"
            )}
          </Button>
          <input
            id="file-upload"
            type="file"
            accept="image/png, image/jpeg, image/gif, image/webp" // Be more specific
            className="hidden"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
           <p className="text-xs text-muted-foreground mt-2">Max 5MB</p>
        </div>
      ) : (
        <div className="relative group">
          <div className="aspect-square w-full overflow-hidden rounded-lg border">
            <Image
              src={preview} // Preview uses Object URL
              alt={selectedFile?.name || "Preview"} // Use file name for alt
              className="h-full w-full object-cover"
              width={200} // Adjust size as needed
              height={200}
              onLoad={() => {
                 // Optional: revoke previous URL if needed, though handleRemovePreview covers it
              }}
              onError={(e) => { // Handle potential preview load errors
                 console.error("Image preview load error:", e);
                 toast({ title:"Preview Error", description:"Could not load image preview.", variant:"destructive"});
                 handleRemovePreview(); // Attempt to reset on error
              }}
            />
          </div>
          <Button
            type="button" // Important: Prevent form submission
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-7 w-7 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
            onClick={handleRemovePreview}
            aria-label="Remove image" // Accessibility
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}