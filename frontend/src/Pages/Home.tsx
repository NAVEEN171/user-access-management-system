import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Navbar } from "../components/Navbar/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ArrowRight, Plus } from "lucide-react";

interface Software {
  id: string;
  name: string;
  description: string;
  accessLevels: string[];
  emoji?: string;
}
import { Laptop } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const { getCustomCookie, setCustomCookie, logout, fetchUserRequests } =
    useAuth();

  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>("");
  const [currentSoftware, setCurrentSoftware] = useState<Software | null>(null);
  const [requestReason, setRequestReason] = useState<string>("");

  const handleRequestClick = (software: Software) => {
    setCurrentSoftware(software);
    setIsRequestOpen(true);
  };
  const fetchRequests = async (accessToken: string) => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const response = await fetch(`${backendURL}/api/software/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        softwareId: currentSoftware?.id,
        reason: requestReason,
        accessType: selectedAccessLevel,
      }),
    });
    return response;
  };

  const handleRequestSubmit = async () => {
    const userId = getCustomCookie("userId");
    if (!userId) {
      logout();
      toast.error("Login needed");
    }
    const accessToken = getCustomCookie("accessToken");
    if (!accessToken) {
      console.error("login needed");
      return;
    }
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const response = await fetchRequests(accessToken);
    const data = await response.json();
    if (response.ok) {
      fetchUserRequests();
    }
    if (data?.code === "TOKEN_EXPIRED" && getCustomCookie("refreshToken")) {
      const refreshToken = getCustomCookie("refreshToken");
      const response = await fetch(`${backendURL}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      if (!response.ok) {
        logout();
      } else {
        const refreshData = await response.json();
        const fetchWithRefreshResponse = await fetchRequests(
          refreshData.accessToken
        );
        if (fetchWithRefreshResponse.ok) {
          fetchUserRequests();
          setCustomCookie("accessToken", refreshData.accessToken, null, true);
        }
      }
    }

    setIsRequestOpen(false);
    setRequestReason("");
    setSelectedAccessLevel("");
  };

  const fetchSoftwares = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/software/get-softwares"
      );
      if (response.ok) {
        const data = await response.json();
        setSoftwares(data.softwares);
      }
    } catch (err) {
      console.log("Error fetching software data:", err);
    }
  };

  useEffect(() => {
    fetchSoftwares();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto py-6 sm:py-10 px-4">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Available Software
          </h2>
          <div className="w-32 h-1 bg-blue-500 mx-auto mb-4 sm:mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Explore our suite of professional software tools designed to enhance
            your business operations
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 ">
          <Link to="/create-software">
            <Button className="flex gap-1 items-center w-fit mx-auto">
              <Plus size={18}></Plus>Create Software
            </Button>
          </Link>
          {softwares.map((software) => (
            <div
              key={software.id}
              className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-md hover:border-sky-500 transition-shadow"
            >
              <div className="flex items-start sm:items-center gap-2 w-full sm:w-auto mb-4 sm:mb-0">
                <div className="bg-sky-50 p-2 rounded-lg text-3xl mr-3 sm:mr-6">
                  <Laptop className="text-blue-500" size={22} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    {software.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    {software.description}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 rounded-md px-4 sm:px-6 text-sm sm:text-base"
                >
                  View
                </Button>
                <Button
                  onClick={() => handleRequestClick(software)}
                  className="bg-black text-white hover:bg-gray-800 leading-none gap-1 rounded-md px-4 sm:px-6 flex items-center text-sm sm:text-base"
                >
                  Request Access
                  <ArrowRight
                    className="text-white leading-none mt-1"
                    size={16}
                  />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-800">
                Request Access
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-gray-800">
                  Software: {currentSoftware?.name}
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Select the access level you would like to request
                </p>
                <Select
                  value={selectedAccessLevel}
                  onValueChange={setSelectedAccessLevel}
                >
                  <SelectTrigger className="w-full border-gray-300">
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentSoftware?.accessLevels.map((level) => (
                      <SelectItem
                        key={level}
                        value={level}
                        className="hover:bg-blue-50"
                      >
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Request
                </label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Please explain why you need access to this software..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRequestOpen(false)}
                className="text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestSubmit}
                disabled={!selectedAccessLevel || !requestReason.trim()}
                className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-500"
              >
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Home;
