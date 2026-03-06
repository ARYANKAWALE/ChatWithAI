import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const IconEye = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </svg>
);

const Login = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { axios, setToken } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint =
        state === "login" ? "/api/user/login" : "/api/user/register";
      const body =
        state === "login" ? { email, password } : { name, email, password };

      const { data } = await axios.post(endpoint, body);

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      } else {
        toast.error(data.message || "Authentication failed ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass flex flex-col gap-4 m-auto items-start p-8 py-10 w-80 sm:w-[400px] rounded-2xl shadow-2xl shadow-black/20 page-enter"
    >
      {/* Header */}
      <div className="text-center w-full mb-3">
        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-primary/25">
          Q
        </div>
        <p className="text-2xl font-semibold text-gray-800 dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
            {state === "login" ? "Welcome Back" : "Create Account"}
          </span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {state === "login"
            ? "Sign in to continue chatting"
            : "Join us and start chatting"}
        </p>
      </div>

      {/* Name field (register only) */}
      {state === "register" && (
        <div className="floating-label-group w-full">
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder=" "
            className="border border-gray-200 dark:border-white/10 dark:bg-white/5 rounded-xl w-full p-3.5 pt-5 text-sm outline-none focus:border-primary dark:focus:border-primary/50 transition-colors dark:text-gray-200 peer"
            type="text"
            required
          />
          <label>Full Name</label>
        </div>
      )}

      {/* Email */}
      <div className="floating-label-group w-full">
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder=" "
          className="border border-gray-200 dark:border-white/10 dark:bg-white/5 rounded-xl w-full p-3.5 pt-5 text-sm outline-none focus:border-primary dark:focus:border-primary/50 transition-colors dark:text-gray-200 peer"
          type="email"
          required
        />
        <label>Email Address</label>
      </div>

      {/* Password */}
      <div className="floating-label-group w-full relative">
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder=" "
          className="border border-gray-200 dark:border-white/10 dark:bg-white/5 rounded-xl w-full p-3.5 pt-5 pr-12 text-sm outline-none focus:border-primary dark:focus:border-primary/50 transition-colors dark:text-gray-200 peer"
          type={showPassword ? "text" : "password"}
          required
        />
        <label>Password</label>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
        >
          {showPassword ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>

      {/* Toggle login/register */}
      {state === "register" ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => setState("login")}
            className="text-primary hover:text-primary-dark cursor-pointer font-medium transition-colors"
          >
            Sign in
          </span>
        </p>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <span
            onClick={() => setState("register")}
            className="text-primary hover:text-primary-dark cursor-pointer font-medium transition-colors"
          >
            Create one
          </span>
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="ripple bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all text-white w-full py-3.5 rounded-xl cursor-pointer font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>
              {state === "register" ? "Creating..." : "Signing in..."}
            </span>
          </>
        ) : state === "register" ? (
          "Create Account"
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
};

export default Login;
