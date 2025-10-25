"use client";

import axios from "axios";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

const backendTestUrl = process.env.NEXT_PUBLIC_TEST_URL;
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const Page = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus("idle");

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("input_resume", file); // Append file directly

      // First request to generate summary
      const generateResponse = await axios.post(
        `${backendTestUrl}/generate_summary`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
            );
            setUploadProgress(progress);
          },
        }
      );

      const data = generateResponse.data;

      // Get user ID from localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User not logged in");
      

      // Second request to store data
      await axios.post(
        `${backendUrl}/user/storeUserSkillsAndSummary`,
        {
          userId,
          resumeSummary: data.profile_summary,
          skills: data.skills,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setUploadStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
      }
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>Resume Upload</CardTitle>
          <CardDescription>
            Drop your resume here or click to select
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-500 bg-opacity-10"
                : "border-gray-600 hover:border-gray-500"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">
              {file
                ? file.name
                : "Drag & drop your resume here, or click to select"}
            </p>
          </div>

          {file && !uploading && (
            <Button onClick={uploadFile} className="w-full mt-4">
              Upload Resume
            </Button>
          )}

          {uploading && (
            <Progress value={uploadProgress} className="w-full mt-4" />
          )}

          {uploadStatus === "success" && (
            <Alert variant="default" className="mt-4 bg-green-500 text-white">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your resume has been uploaded successfully.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === "error" && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was an error uploading your resume. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
