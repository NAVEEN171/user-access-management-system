import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/ui/button";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
const Signup = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setCustomCookie, setUserId } = useAuth();

  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    } else if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    } else if (password.length < 8) {
      toast.error("Password must be at least 8 characters ");
      return;
    } else if (name.length < 5) {
      toast.error("Name must be at least 5 characters ");
      return;
    }
    setIsSubmitting(true);
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await fetch(`${backendURL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          password: password,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join our platform and start creating amazing things today"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <User size={18} />
          </div>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50/80 border border-gray-100 rounded-lg py-3 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="username"
            autoComplete="name"
          />
        </div>

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
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Lock size={18} />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-50/80 border border-gray-100 rounded-lg py-3 pl-10 pr-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Confirm Password"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full py-6 cursor-pointer bg-gray-900 hover:bg-black text-white rounded-lg font-medium mt-4"
          disabled={isSubmitting}
        >
          {!isSubmitting ? "Create Account" : "Creating Account.."}
        </Button>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
