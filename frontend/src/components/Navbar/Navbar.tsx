import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Bell, Check, X, Clock, Laptop, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const Navbar = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    getCustomCookie,
    setIsLoggedIn,
    isLoggedIn,
    userId,
    logout,
    setUserId,
    requests,
    fetchUserRequests,
  } = useAuth();

  useEffect(() => {
    const userId = getCustomCookie("userId");
    if (userId) {
      setIsLoggedIn(true);
      setUserId(userId);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchUserRequests();
  }, [userId]);

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <Check className="text-green-500" size={16} />;
      case "Rejected":
        return <X className="text-red-500" size={16} />;
      default:
        return <Clock className="text-yellow-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <nav className="p-4 bg-[#1E88E5] relative">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-white">Software Dashboard</div>

        <div className="hidden md:flex space-x-4 items-center">
          <div className="relative">
            <Button
              variant="ghost"
              className="p-2 text-white cursor-pointer relative"
              onClick={toggleNotifications}
            >
              <Bell size={22} />
            </Button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800">
                    Notifications
                  </h3>
                </div>

                {requests.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-start">
                          <div className="bg-blue-50 p-2 rounded mr-3">
                            <Laptop className="text-blue-500" size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-gray-800">
                                {request.software.name}
                              </p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(
                                  request.status
                                )}`}
                              >
                                {getStatusIcon(request.status)}
                                {request.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {request.accessType} access
                            </p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              Reason: {request.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No notifications at this time
                  </div>
                )}
              </div>
            )}
          </div>

          {!isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button className="bg-black text-white hover:bg-gray-800 rounded-md px-4 sm:px-6">
                  Login
                </Button>
              </Link>

              <Link to="/signup">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 rounded-md px-4 sm:px-6">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button className="bg-black text-white hover:bg-gray-800 rounded-md px-4 sm:px-6">
                  Dashboard
                </Button>
              </Link>

              <Button
                onClick={() => {
                  logout();
                }}
                className="bg-white text-blue-600 hover:bg-gray-100 rounded-md px-4 sm:px-6"
              >
                Logout
              </Button>
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center space-x-2">
          <div className="relative">
            <Button
              variant="ghost"
              className="p-2 text-white cursor-pointer relative"
              onClick={toggleNotifications}
            >
              <Bell size={22} />
            </Button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800">
                    Notifications
                  </h3>
                </div>

                {requests.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-start">
                          <div className="bg-blue-50 p-2 rounded mr-3">
                            <Laptop className="text-blue-500" size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-gray-800">
                                {request.software.name}
                              </p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(
                                  request.status
                                )}`}
                              >
                                {getStatusIcon(request.status)}
                                {request.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {request.accessType} access
                            </p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              Reason: {request.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No notifications at this time
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            className="p-2 text-white cursor-pointer"
            onClick={toggleMobileMenu}
          >
            <Menu size={22} />
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleMobileMenu}
          ></div>
          <div className="fixed right-0 top-0 h-full w-1/2 bg-white shadow-lg">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
                <Button
                  variant="ghost"
                  className="p-2 text-gray-600 hover:text-gray-800"
                  onClick={toggleMobileMenu}
                >
                  <X size={20} />
                </Button>
              </div>

              {!isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={toggleMobileMenu}>
                    <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-md py-3">
                      Login
                    </Button>
                  </Link>

                  <Link to="/signup" onClick={toggleMobileMenu}>
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md py-3">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/dashboard" onClick={toggleMobileMenu}>
                    <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-md py-3">
                      Dashboard
                    </Button>
                  </Link>

                  <Button
                    onClick={() => {
                      logout();
                      toggleMobileMenu();
                    }}
                    className="w-full bg-red-600 text-white hover:bg-red-700 rounded-md py-3"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
