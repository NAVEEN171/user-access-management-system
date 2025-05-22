import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/ui/button";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setCustomCookie, setUserId, setUser } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !password) {
      toast.error("Please fill in all fields");
      return;
    } else if (password.length < 8) {
      toast.error("Password must be at least 8 characters ");
      return;
    } else if (userName.length < 5) {
      toast.error("Username must be at least 5 characters ");
      return;
    }

    const backendURL = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await fetch(`${backendURL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userName,
          password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setCustomCookie("accessToken", data.accessToken, null, true);
        setCustomCookie("refreshToken", data.refreshToken, 24, false);
        setCustomCookie("userId", data.user.id, 24, false);
        setIsLoggedIn(true);
        setUserId(data.user.id);

        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AuthLayout
      title="Sign in with email"
      subtitle="Join our platform and start creating amazing things today"
    >
      <form onSubmit={handleSubmit} className="space-y-5 ">
        <div className="space-y-2">
          <div className="relative ">
            <div className="absolute  left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={18} />
            </div>
            <input
              id="username"
              type="username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-gray-50/80 border border-gray-100 rounded-lg py-3 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="username"
              autoComplete="username"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50/80 border border-gray-100 rounded-lg py-3 pl-10 pr-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-6 bg-gray-900 hover:bg-black text-white rounded-lg font-medium mt-4"
        >
          Get Started
        </Button>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline font-medium"
            >
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
