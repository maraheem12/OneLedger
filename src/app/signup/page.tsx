"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, UserCog, ArrowRight, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuth, User } from "@/providers/AuthProvider";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "VIEWER",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setServerError("");
    try {
      const response = await axiosInstance.post("/auth/signup", data);
      const { token, user } = response.data;
      login(token, user as User);
    } catch (err: any) {
      setServerError(
        err.response?.data?.error || "An unexpected error occurred. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-sky-100 px-4 py-8 overflow-hidden relative">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[100px] rounded-full mix-blend-multiply" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/20 blur-[100px] rounded-full mix-blend-multiply" />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-[2rem] p-8 sm:p-10 relative z-10"
        >
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/40 mb-6 rotate-3 transform-gpu"
            >
              <UserCog className="text-white w-8 h-8 -rotate-3" />
            </motion.div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">Join the platform to access analytics.</p>
          </div>

          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100/60 text-red-600 text-sm text-center font-semibold"
            >
              {serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={`block w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border ${
                    errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-white focus:border-blue-500 focus:ring-blue-500/20 shadow-inner shadow-gray-100"
                  } rounded-xl text-sm font-medium focus:outline-none focus:ring-4 transition-all duration-300 placeholder:text-gray-400 text-gray-800`}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 text-xs text-red-500 font-semibold tracking-wide flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 block"></span>
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`block w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border ${
                    errors.password ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-white focus:border-blue-500 focus:ring-blue-500/20 shadow-inner shadow-gray-100"
                  } rounded-xl text-sm font-medium focus:outline-none focus:ring-4 transition-all duration-300 placeholder:text-gray-400 text-gray-800`}
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 text-xs text-red-500 font-semibold tracking-wide flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 block"></span>
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Platform Role</label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="block w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-4 shadow-inner shadow-gray-100 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234B5563' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: 'right 1.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em' }}
                  >
                    <option value="VIEWER">Viewer (Read-only)</option>
                    <option value="ANALYST">Analyst (Metrics & Insights)</option>
                    <option value="ADMIN">Admin (Full Control)</option>
                  </select>
                )}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/30 hover:bg-blue-500 hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/login")}
              className="group text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
            >
              Already have an account? <span className="text-blue-600 group-hover:underline decoration-2 underline-offset-4 decoration-blue-500/30">Log in</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
