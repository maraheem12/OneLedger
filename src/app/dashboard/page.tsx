"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, X, Activity, DollarSign, Wallet, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/providers/AuthProvider";

// Define strict types corresponding to our DB output
interface RecordType {
  _id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
  notes?: string;
  createdBy?: { email: string; role: string };
}

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryTotals: Record<string, number>;
}

// Validation schema for creating a record
const createRecordSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
});

type CreateRecordValues = z.infer<typeof createRecordSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// Simple animated counter component acting as a Spring natively without heavy dependencies
function AnimatedCounter({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Fast start, slow fade end easing (ease-out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(value * easeProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setCount(value);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count.toFixed(2)}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  const [records, setRecords] = useState<RecordType[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [fetchingData, setFetchingData] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRecordValues>({
    resolver: zodResolver(createRecordSchema),
    defaultValues: {
      type: "INCOME",
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData(user.role);
    }
  }, [user]);

  const loadDashboardData = async (role: string) => {
    setFetchingData(true);
    try {
      const recordsPromise = axiosInstance.get("/records");
      
      if (role === "ADMIN" || role === "ANALYST") {
        const [recordsRes, summaryRes] = await Promise.all([
          recordsPromise,
          axiosInstance.get("/dashboard/summary")
        ]);
        setRecords(recordsRes.data.records);
        setSummary(summaryRes.data.summary);
      } else {
        const recordsRes = await recordsPromise;
        setRecords(recordsRes.data.records);
      }
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setFetchingData(false);
    }
  };

  const onSubmitRecord = async (data: CreateRecordValues) => {
    setFormError("");
    try {
      await axiosInstance.post("/records", data);
      setIsModalOpen(false);
      reset();
      // Reload UI organically Post-create
      if (user) loadDashboardData(user.role);
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Failed to create record");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record permanently?")) return;
    try {
      await axiosInstance.delete(`/records/${id}`);
      if (user) loadDashboardData(user.role);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete record.");
    }
  };

  // Prevent UI flashing until initialized securely
  if (isLoading || !user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50/50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-blue-600 mb-4" />
        </motion.div>
        <span className="text-gray-500 font-semibold animate-pulse">Establishing secure tunnel...</span>
      </div>
    );
  }

  // RBAC dynamic display limits
  const showSummary = user.role === "ADMIN" || user.role === "ANALYST";
  const showAdminControls = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 pb-24">
      {/* Top Navbar */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center transform -rotate-3 shadow-md shadow-blue-500/20">
              <Activity className="text-white w-5 h-5 rotate-3" />
            </div>
            <span className="font-extrabold text-xl tracking-tight hidden sm:block">OneLedger</span>
          </div>
          
          <div className="flex items-center gap-5">
             <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">{user.email}</p>
              <p className="text-xs text-blue-600 font-bold mt-1 tracking-widest">{user.role}</p>
            </div>
            <div className="h-6 w-px bg-gray-200"></div>
            <button
              onClick={logout}
              className="pl-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-2 space-y-10">
        
        {/* Animated Greeting Statement */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Welcome back, <span className="text-blue-600">{user.email}</span> <span className="text-gray-400 font-medium">({user.role})</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Here is your comprehensive financial overview.</p>
        </motion.div>

        {/* Dynamic RBAC Component: Analytics Summary */}
        {showSummary && summary && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-green-200 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <DollarSign className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Income</p>
                <div className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
                  <AnimatedCounter value={summary.totalIncome} prefix="$" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-red-200 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Activity className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Expenses</p>
                <div className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
                  <AnimatedCounter value={summary.totalExpenses} prefix="$" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-blue-200 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Wallet className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Net Balance</p>
                <div className={`text-3xl font-extrabold mt-1 tracking-tight ${summary.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  <AnimatedCounter value={summary.netBalance} prefix="$" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Main Data Table Area (Framed & Staggered) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="px-8 py-6 border-b border-gray-100 bg-white flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-gray-900">Transaction History</h2>
          </div>
          
          <div className="overflow-x-auto">
            {fetchingData ? (
               <div className="py-24 flex justify-center items-center text-gray-400">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
               </div>
            ) : records.length === 0 ? (
               <div className="py-24 text-center text-gray-500 font-semibold bg-gray-50/50">
                 No financial records found in the database.
               </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50 whitespace-nowrap">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date Issued</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction Type</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Category Designation</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Total Amount</th>
                    {showAdminControls && (
                      <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Manage</th>
                    )}
                  </tr>
                </thead>
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="bg-white divide-y divide-gray-50"
                >
                  {records.map((record) => (
                    <motion.tr variants={itemVariants} key={record._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-gray-600">
                        {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-4 py-1.5 inline-flex text-[11px] font-extrabold uppercase tracking-widest rounded-full ${
                          record.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{record.category}</div>
                        {record.notes && <div className="text-xs text-gray-400 font-medium mt-1">{record.notes}</div>}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-extrabold text-gray-900 tracking-tight">
                        ${record.amount.toFixed(2)}
                      </td>
                      {showAdminControls && (
                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
                            title="Delete Record"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            )}
          </div>
        </motion.div>
      </main>

      {/* Floating Action Button (FAB) strictly reserved for Admins */}
      {showAdminControls && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/40 flex items-center justify-center z-40 transform-gpu"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      )}

      {/* Animated Admin Creation Modal overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/30 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8 sm:p-10 border border-white/20"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create Record</h2>
              <p className="text-gray-500 font-medium mb-8">Register a localized financial activity entry into the database.</p>
              
              {formError && (
                <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 block"></span>
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmitRecord)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Transaction Scope</label>
                    <select
                      {...register("type")}
                      className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234B5563' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
                    >
                      <option value="INCOME">Income (Target +)</option>
                      <option value="EXPENSE">Expense (Target -)</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Logged Amount ($)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("amount")}
                        className={`block w-full pl-10 pr-4 py-3.5 bg-gray-50 border ${
                          errors.amount ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        } rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all`}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.amount && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 text-xs text-red-500 font-bold">{errors.amount.message}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category Sector</label>
                    <input
                      type="text"
                      placeholder="e.g. Infrastructure"
                      {...register("category")}
                      className={`block w-full px-4 py-3.5 bg-gray-50 border ${
                        errors.category ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all`}
                    />
                    <AnimatePresence>
                      {errors.category && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 text-xs text-red-500 font-bold">{errors.category.message}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Operational Notes <span className="text-gray-400 font-medium">(Optional)</span></label>
                  <input
                    type="text"
                    placeholder="Brief description outlining context"
                    {...register("notes")}
                    className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center py-4 px-4 bg-blue-600 text-white rounded-xl font-extrabold text-sm shadow-xl shadow-blue-500/30 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all disabled:opacity-70 mt-8"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Commit Transaction"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
