/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import axios from "axios";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const Page = () => {
  const router = useRouter();
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);
    setUploadStatus("uploading");
    setError("");

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User not logged in. Please sign up first.");
      }

      console.log("📤 Uploading resume for user ID:", userId);
      console.log("📤 Backend URL:", backendUrl);
      console.log("📤 Full URL:", `${backendUrl}/resume/upload`);

      // Step 1: Upload and parse resume
      const formData = new FormData();
      formData.append("resume", file);

      const uploadResponse = await axios.post(
        `${backendUrl}/resume/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Upload response:", uploadResponse.data);

      if (!uploadResponse.data?.data) {
        throw new Error("Invalid response from server");
      }

      const { summary, skills } = uploadResponse.data.data;

      if (!summary || !skills || !Array.isArray(skills)) {
        throw new Error("Invalid data format from server");
      }

      console.log("📊 Extracted ", {
        summaryLength: summary.length,
        skillsCount: skills.length,
        firstSkill: skills[0],
      });

      // Step 2: Store skills and summary in database
      console.log("💾 Storing user skills and summary...");

      const storeResponse = await axios.post(
        `${backendUrl}/user/storeUserSkillsAndSummary`,
        {
          userId: parseInt(userId, 10),
          skills: skills,
          resumeSummary: summary,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Store response:", storeResponse.data);

      setUploadStatus("success");

      // Redirect to test page after 1.5 seconds
      setTimeout(() => {
        router.push("/assessment/test");
      }, 1500);
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      console.error("❌ Error message:", err.message);

      let errorMessage = "Upload failed. Please try again.";

      if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || "Bad request - Invalid data format";
      } else if (err.response?.status === 404) {
        errorMessage = "Backend route not found. Please check server is running and routes are configured.";
        // ❌ REMOVED: Do NOT redirect on error
        // setTimeout(() => router.push("/auth/signup"), 2000);
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setUploadStatus("error");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxSize: 10485760, // 10MB
  });

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Resume Upload</CardTitle>
          <CardDescription className="text-gray-400">
            Upload your resume to get personalized skill analysis and career
            recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadStatus === "success" ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Resume parsed successfully!
              </h3>
              <p className="text-gray-400">Redirecting to assessment...</p>
            </div>
          ) : (
            <>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${
                    isDragActive
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 hover:border-gray-500"
                  }
                  ${
                    uploadStatus === "uploading"
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                `}
              >
                <input {...getInputProps()} />
                {uploadStatus === "uploading" ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Processing resume...</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Parsing PDF and extracting skills
                    </p>
                  </div>
                ) : (
                  <>
                    {uploadedFile ? (
                      <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    )}
                    <p className="text-white font-semibold mb-2">
                      {uploadedFile
                        ? uploadedFile.name
                        : "Drop your resume here"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      or click to browse (PDF only, max 10MB)
                    </p>
                  </>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 text-sm font-semibold mb-1">Error</p>
                    <p className="text-red-300 text-sm">{error}</p>
                    <p className="text-red-400 text-xs mt-2">
                      Check browser console (F12) for detailed error information
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-700"
                  disabled={uploadStatus === "uploading"}
                >
                  Skip for now
                </Button>
                {uploadStatus === "error" && (
                  <Button
                    onClick={() => {
                      setUploadStatus("idle");
                      setError("");
                      setUploadedFile(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
