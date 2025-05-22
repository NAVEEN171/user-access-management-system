import { useState, useEffect } from "react";
import {
  Check,
  X,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  Lock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

interface User {
  id: string;
  username: string;
  password: string;
  role: string;
}

interface Software {
  id: string;
  name: string;
  description: string;
  accessLevels: string[];
}

interface AccessRequest {
  id: string;
  userId: string;
  softwareId: string;
  accessType: string;
  reason: string;
  status: string;
  software: Software;
  user: User;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-200 font-medium"
        >
          Pending
        </Badge>
      );
    case "Approved":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 font-medium"
        >
          Approved
        </Badge>
      );
    case "Rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-200 font-medium"
        >
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const currentUserRole = "Manager";

const Dashboard = () => {
  const { user, setCustomCookie, logout, getCustomCookie } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);

  const fetchAccessRequests = async () => {
    const BackendURL = import.meta.env.VITE_BACKEND_URL;
    const response = await fetch(`${BackendURL}/api/software/get-requests`);
    if (response.ok) {
      const data = await response.json();
      setRequests(data.requests);
      setFilteredRequests(data.requests);
    }
  };

  useEffect(() => {
    fetchAccessRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (statusFilter !== "All") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.software?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [statusFilter, searchTerm, requests]);

  const patchRequest = async (
    accessToken: string,
    requestId: string,
    newStatus: string
  ) => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const response = await fetch(
      `${backendURL}/api/software/requests/${requestId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );
    return response;
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;

      let accessToken = getCustomCookie("accessToken");
      if (!accessToken) {
        console.error("Login needed");
        return;
      }

      let response = await patchRequest(accessToken, requestId, newStatus);
      let data = await response.json();

      if (response.ok) {
        console.log("Status update success:", data);
        const updatedRequests = requests.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        );

        setRequests(updatedRequests);
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

        const retryResponse = await patchRequest(
          accessToken,
          requestId,
          newStatus
        );
        const retryData = await retryResponse.json();

        if (retryResponse.ok) {
          const updatedRequests = requests.map((req) =>
            req.id === requestId ? { ...req, status: newStatus } : req
          );

          setRequests(updatedRequests);
        } else {
          console.log("Status update failed even after refresh:", retryData);
        }
      }
    } catch (error) {
      console.log("Error updating status:", error);
    }
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
            You need to Manager and login to access this dashboard
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

  if (user.role !== "Manager") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="max-w-md w-full text-center space-y-8 rounded-2xl bg-white p-8 shadow-lg">
          <div className="flex justify-center">
            <div className="bg-sky-100 p-4 rounded-full">
              <Lock color="blue" className="h-12 w-12 " />
            </div>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            Managers can access dashboard
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-blue-600 text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Software Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="bg-blue-400 text-white bg-opacity-20 px-3 py-1 rounded-full text-sm flex items-center">
              <Calendar size={14} className="mr-2" />
              May 22, 2025
            </div>
            <div className="bg-blue-400 text-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
              Welcome, {currentUserRole}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Software Access Requests
                </CardTitle>
                <p className="text-gray-500 mt-1 text-sm">
                  Manage and approve access requests from your team
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1.5">
                  {filteredRequests.length} Active Requests
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search by user or software..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 h-11 w-full focus:!ring-1 focus:!ring-blue-500 focus:!border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                  <Filter size={16} className="text-blue-600" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40 border-0 bg-transparent focus:ring-0 p-0 h-auto shadow-none">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-600">
                      Request ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      User
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Software
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Access Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Reason
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request, index) => (
                      <TableRow
                        key={request.id}
                        className={`transition-colors hover:bg-gray-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                      >
                        <TableCell className="font-medium text-blue-600">
                          Req-{index}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {request.user?.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.user?.role}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {request.software?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.software?.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-600 border-none"
                          >
                            {request.accessType}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="max-w-xs truncate"
                          title={request.reason}
                        >
                          {request.reason}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          {request.status === "Pending" ? (
                            <div className="flex justify-end space-x-2">
                              <Button
                                onClick={() =>
                                  handleStatusChange(request.id, "Approved")
                                }
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 transition-colors"
                              >
                                <Check size={16} className="mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() =>
                                  handleStatusChange(request.id, "Rejected")
                                }
                                variant="outline"
                                size="sm"
                                className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 transition-colors"
                              >
                                <X size={16} className="mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                                >
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-white border border-gray-100 shadow-lg rounded-lg p-1"
                              >
                                <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 rounded focus:bg-gray-50">
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 rounded focus:bg-gray-50">
                                  View History
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500 p-8">
                          <Search size={36} className="mb-2 text-gray-300" />
                          <p className="font-medium text-gray-600">
                            No matching requests found
                          </p>
                          <p className="text-sm mt-1">
                            Try adjusting your search filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
              <div>
                Showing {filteredRequests.length} of {requests.length} requests
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {requests.filter((r) => r.status === "Pending").length}
                  </p>
                </div>
                <div className="bg-sky-100 p-3 rounded-full">
                  <Filter size={20} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Approved</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {requests.filter((r) => r.status === "Approved").length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Check size={20} className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rejected</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {requests.filter((r) => r.status === "Rejected").length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <X size={20} className="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {requests.length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <MoreVertical size={20} className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
