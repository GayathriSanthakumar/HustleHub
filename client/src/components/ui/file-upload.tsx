import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileWarning, Check, X } from 'lucide-react';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  description?: string;
  value?: File | null;
  error?: string;
}

export function FileUpload({
  onFileChange,
  accept = "image/jpeg, image/png, application/pdf",
  maxSize = 10, // 10 MB default
  label = "Upload a file",
  description = "PNG, JPG, PDF up to 10MB",
  value,
  error,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(value || null);
  const [fileError, setFileError] = useState<string | null>(error || null);

  const handleFileChange = (file: File | null) => {
    // Reset error
    setFileError(null);
    
    // Validate file
    if (file) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setFileError(`File size must be less than ${maxSize}MB`);
        return;
      }
      
      // Check file type if accept is provided
      if (accept && !accept.split(', ').some(type => file.type === type)) {
        setFileError(`File type must be ${accept.replace(/,/g, ' or ')}`);
        return;
      }
    }
    
    // Set the file
    setSelectedFile(file);
    onFileChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileChange(null);
  };

  return (
    <div className="space-y-2">
      {selectedFile ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <div className="text-sm font-medium truncate max-w-[200px]">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRemoveFile}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`relative flex justify-center border-2 border-dashed rounded-md p-6 transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : fileError 
                ? 'border-destructive bg-destructive/5' 
                : 'border-muted-foreground/20 hover:border-muted-foreground/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-2 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <div className="text-sm font-medium">{label}</div>
            <div className="flex text-sm text-muted-foreground">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
              >
                <span>Upload a file</span>
                <Input
                  id="file-upload"
                  ref={inputRef}
                  type="file"
                  className="sr-only"
                  accept={accept}
                  onChange={handleInputChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      )}
      {fileError && (
        <div className="flex items-center text-destructive text-sm">
          <FileWarning className="h-3.5 w-3.5 mr-1.5" />
          {fileError}
        </div>
      )}
    </div>
  );
}
