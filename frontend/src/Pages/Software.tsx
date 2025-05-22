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

// Mock Navbar component since we don't have the actual one
import { Navbar } from "../components/Navbar/Navbar";

const SoftwareCreation = () => {
  const [softwareName, setSoftwareName] = useState("");
  const [softwareDescription, setSoftwareDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors = [];

    // Check if fields are empty
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
      toast.success("Software created successfully!");

      setSoftwareName("");
      setSoftwareDescription("");
    } catch (error) {
      toast.error("Failed to create software. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

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
