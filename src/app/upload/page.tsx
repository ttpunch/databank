"use client";
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast"; // Import the useToast hook
import { Button } from "@/components/ui/button"; // Adjust the import based on your button component
import { Input } from "@/components/ui/input"; // Adjust the import based on your input component
import { Card, CardContent } from "@/components/ui/card"; // Adjust the import based on your card component

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false); // State to manage upload status
  const { toast } = useToast(); // Initialize the toast function

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast({
        title: "Upload Error",
        description: "Please select a file to upload.",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true); // Set uploading state to true

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      toast({
        title: "Upload Successful",
        description: `File uploaded successfully: ${result.message}`,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Upload Failed",
          description: `Error: ${error.message}`,
        });
      } else {
        toast({
          title: "Upload Error",
          description: 'An unknown error occurred',
        });
      }
    } finally {
      setIsUploading(false); // Reset uploading state
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="max-w-lg w-full p-6 shadow-lg rounded-lg bg-white">
        <CardContent>
          <h1 className="text-2xl font-bold mb-4 text-gray-800 text-center">Upload File</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              type="file" 
              onChange={handleFileChange} 
              className="border rounded-md p-2 w-full bg-gray-50" 
            />
            <Button 
              type="submit" 
              className={`w-full ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold py-2 rounded-md transition`}
              disabled={isUploading} // Disable button while uploading
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;