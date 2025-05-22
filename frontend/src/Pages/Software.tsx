import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";

import { Navbar } from "../components/Navbar/Navbar";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

const SoftwareCreation = () => {
  const [softwareName, setSoftwareName] = useState("");
  const [softwareDescription, setSoftwareDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getCustomCookie, setCustomCookie, logout, user } = useAuth();

  const validateForm = () => {
    const errors = [];

    if (!softwareName.trim()) {
      errors.push("Software name is required");
    } else if (softwareName.trim().length < 4) {
      errors.push("Software name must be at least 4 characters long");
    }

    if (!softwareDescription.trim()) {
      errors.push("Software description is required");
    } else {
      const wordCount = softwareDescription.trim().split(/\s+/).length;
      if (wordCount < 10) {
        errors.push("Software description must be at least 10 words long");
      }
    }

    return errors;
  };
  const createSoftwareRequest = async (accessToken: string) => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const response = await fetch(`${backendURL}/api/software/create-software`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: softwareName,
        description: softwareDescription,
        accessLevels: ["Read", "Write", "Admin"],
      }),
    });

    return response;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        toast.error(error);
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;
      let accessToken = getCustomCookie("accessToken");

      if (!accessToken) {
        console.error("Login needed");
        return;
      }
      setIsSubmitting(true);

      let response = await createSoftwareRequest(accessToken);
      let data = await response.json();

      if (response.ok) {
        console.log("Software created successfully:", data);
        toast.success("Software created successfully!");
      } else if (!getCustomCookie("refreshToken")) {
        logout();
        return;
      } else if (
        data?.code === "TOKEN_EXPIRED" &&
        getCustomCookie("refreshToken")
      ) {
        const refreshToken = getCustomCookie("refreshToken");

        const refreshResponse = await fetch(
          `${backendURL}/api/auth/refresh-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        if (!refreshResponse.ok) {
          logout();
          return;
        }

        const refreshData = await refreshResponse.json();
        let accessToken = refreshData.accessToken;
        setCustomCookie("accessToken", accessToken, null, true);

        const retryResponse = await createSoftwareRequest(accessToken);
        const retryData = await retryResponse.json();

        if (retryResponse.ok) {
          console.log(
            "Software created successfully after token refresh:",
            retryData
          );
          toast.success("Software created successfully!");
        } else {
          console.error(
            "Failed to create software even after token refresh:",
            retryData
          );
        }
      } else {
        console.error("Failed to create software:", data.message || data);
      }
    } catch (error) {
      console.error("Error creating software:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="max-w-md w-full text-center space-y-8 rounded-2xl bg-white p-8 shadow-lg">
          <div className="flex justify-center">
            <div className="bg-sky-100 p-4 rounded-full">
              <Lock color="blue" className="h-12 w-12 " />
            </div>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            You need to be Admin and logged in to access this dashboard
          </h1>

          <div className="pt-2">
            <Link to="/login">
              <Button
                className="w-full transition-all hover:shadow-md"
                size="lg"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== "Admin") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="max-w-md w-full text-center space-y-8 rounded-2xl bg-white p-8 shadow-lg">
          <div className="flex justify-center">
            <div className="bg-sky-100 p-4 rounded-full">
              <Lock color="blue" className="h-12 w-12 " />
            </div>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            admin can access create software
          </h1>

          <div className="pt-2">
            <Link to="/">
              <Button
                className="w-full transition-all hover:shadow-md"
                size="lg"
              >
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create New Software
            </CardTitle>
            <CardDescription>
              Add a new software project to your collection. Make sure to
              provide detailed information.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="softwareName"
                  className="text-sm font-medium text-gray-700"
                >
                  Software Name
                </Label>
                <Input
                  id="softwareName"
                  type="text"
                  placeholder="Enter software name (minimum 4 characters)"
                  value={softwareName}
                  onChange={(e) => setSoftwareName(e.target.value)}
                  className={`w-full ${
                    softwareName && softwareName.length < 4
                      ? "border-red-500 focus:ring-red-500"
                      : softwareName.length >= 4
                      ? "border-green-500 focus:ring-green-500"
                      : ""
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="softwareDescription"
                  className="text-sm font-medium text-gray-700"
                >
                  Software Description
                </Label>
                <Textarea
                  id="softwareDescription"
                  placeholder="Describe your software in detail (minimum 10 words)"
                  value={softwareDescription}
                  onChange={(e) => setSoftwareDescription(e.target.value)}
                  rows={4}
                  className={`w-full resize-none ${
                    softwareDescription &&
                    getWordCount(softwareDescription) < 10
                      ? "border-red-500 focus:ring-red-500"
                      : getWordCount(softwareDescription) >= 10
                      ? "border-green-500 focus:ring-green-500"
                      : ""
                  }`}
                />
              </div>

              <Button
                type="button"
                onClick={handleSubmit}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Software"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SoftwareCreation;
