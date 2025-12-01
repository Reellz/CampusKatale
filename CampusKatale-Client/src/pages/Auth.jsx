import React, { useState } from "react";
import { useSignIn, useSignUp, useAuth } from "@clerk/clerk-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { isSignedIn } = useAuth();

  const toggleForm = (form) => {
    setIsLogin(form === "login");
    setError(null);
    clearFields();
  };

  const clearFields = () => {
    setEmail("");
    setPassword("");
    setName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signInLoaded || !signUpLoaded) return;

    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // 🔐 Login flow
        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === "complete") {
          clearFields();
          navigate("/");
        } else {
          setError("Login incomplete. Please try again.");
        }
      } else {
        // 🆕 Signup flow (No email verification)
        const result = await signUp.create({
          emailAddress: email,
          password,
          firstName: name,
        });

        if (result.status === "complete") {
          clearFields();
          navigate("/");
        } else {
          console.log("Sign-up next step:", result);
          setError("Signup incomplete. Please try again.");
        }
      }
    } catch (err) {
      console.error("Clerk Error:", err);
      setError(err.errors ? err.errors[0].message : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      if (isLogin && signInLoaded) {
        await signIn.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: "/",
        });
      } else if (signUpLoaded) {
        await signUp.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: "/",
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const goHome = () => navigate("/");

  if (isSignedIn) navigate("/");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] font-[Lexend]">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-lg bg-white">
        {/* Tabs */}
        <div className="flex justify-around bg-[#F9FAFB] p-2 rounded-t-3xl mb-6">
          <button
            onClick={() => toggleForm("login")}
            className={`w-1/2 py-2 rounded-2xl font-semibold transition-all ${
              isLogin ? "bg-[#177529] text-white" : "text-[#0C0D19]"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => toggleForm("signup")}
            className={`w-1/2 py-2 rounded-2xl font-semibold transition-all ${
              !isLogin ? "bg-[#177529] text-white" : "text-[#0C0D19]"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div
          className="flex w-[200%] transition-transform duration-500"
          style={{ transform: isLogin ? "translateX(0%)" : "translateX(-50%)" }}
        >
          {/* Login Form */}
          <div className="w-1/2 p-10 flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-4 rounded-lg border border-gray-300"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-4 rounded-lg border border-gray-300 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center -mt-3">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="p-4 rounded-xl font-bold text-white bg-[#177529] hover:bg-[#97C040] transition-all"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 font-medium mb-2">Or sign in with</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleOAuth("oauth_google")}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-300 hover:shadow-md transition-all w-24"
                >
                  <FcGoogle size={20} /> Google
                </button>
                <button
                  onClick={() => handleOAuth("oauth_apple")}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-300 hover:shadow-md transition-all w-24"
                >
                  <FaApple size={18} /> Apple
                </button>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="w-1/2 p-10 flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-4 rounded-lg border border-gray-300"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-4 rounded-lg border border-gray-300"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-4 rounded-lg border border-gray-300 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center -mt-3">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="p-4 rounded-xl font-bold text-white bg-[#177529] hover:bg-[#97C040] transition-all"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 font-medium mb-2">Or sign up with</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleOAuth("oauth_google")}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-300 hover:shadow-md transition-all w-24"
                >
                  <FcGoogle size={20} /> Google
                </button>
                <button
                  onClick={() => handleOAuth("oauth_apple")}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-300 hover:shadow-md transition-all w-24"
                >
                  <FaApple size={18} /> Apple
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-6 mb-4">
          <button
            onClick={goHome}
            className="px-6 py-3 rounded-xl font-semibold text-[#177529] border border-[#177529] hover:bg-[#177529] hover:text-white transition-all shadow-md"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
