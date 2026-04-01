"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Define strict types corresponding to our DB output
interface User {
  id: string;
  email: string;
  role: "VIEWER" | "ANALYST" | "ADMIN";
}

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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<RecordType[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state for ADMINs to create new records
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("INCOME");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    // Basic verification of token presence
    const token = getToken();
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Once user is identified, fetch the appropriate data block
    fetchData(parsedUser.role);
  }, [router]);

  const fetchData = async (role: string) => {
    await fetchRecords();
    
    // We only fetch summary metrics if the user is an ADMIN or ANALYST
    if (role === "ADMIN" || role === "ANALYST") {
      await fetchSummary();
    }
    
    setLoading(false);
  };

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/records", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout(); // Token might be expired or invalid
      }
    } catch (err) {
      console.error("Failed to fetch records:", err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          type,
          category,
          notes,
        }),
      });
      
      if (res.ok) {
        // Reset form controls
        setAmount("");
        setCategory("");
        setNotes("");
        // Reload dashboard state to update both list and summary
        fetchData(user!.role);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || "Failed to create record"}`);
      }
    } catch (err) {
      console.error("Create Record Exception:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this record?")) return;
    
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      
      if (res.ok) {
        fetchData(user!.role);
      } else {
        alert("Failed to delete record. Ensure you have Admin privileges.");
      }
    } catch (err) {
      console.error("Delete Action Exception:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-300 rounded-full mb-4"></div>
          <p className="text-gray-500 font-medium">Authorizing & Fetching Dashboard Context...</p>
        </div>
      </div>
    );
  }

  // Determine RBAC toggles for UI render structure
  const showSummary = user.role === "ADMIN" || user.role === "ANALYST";
  const showAdminControls = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">OneLedger Dashboard</h1>
            <p className="text-gray-500 mt-1">Logged in as {user.email}</p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase ${
              user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' :
              user.role === 'ANALYST' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {user.role}
            </span>
            <button 
              onClick={handleLogout} 
              className="px-4 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Dynamic RBAC Component: Analytics Summary */}
        {showSummary && summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
              <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Income</span>
              <span className="text-3xl font-bold text-green-600 mt-2">${summary.totalIncome.toFixed(2)}</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
              <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Expenses</span>
              <span className="text-3xl font-bold text-red-600 mt-2">${summary.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
              <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Net Balance</span>
              <span className={`text-3xl font-bold mt-2 ${summary.netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ${summary.netBalance.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Data Table */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Financial Records Database</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    {showAdminControls && (
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Manage</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                          record.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.category}</div>
                        {record.notes && <div className="text-xs text-gray-400">{record.notes}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ${record.amount.toFixed(2)}
                      </td>
                      {showAdminControls && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md text-xs transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={showAdminControls ? 5 : 4} className="px-6 py-12 text-center text-gray-400">
                        No financial records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic RBAC Component: Admin Record Creator */}
          {showAdminControls && (
            <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 h-fit sticky top-8">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h2 className="text-lg font-bold text-gray-800">Add New Entry</h2>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Transaction Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="0.00"
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    placeholder="e.g. Server Hosting"
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Context Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Details about this entry"
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all mt-6"
                >
                  Create Record
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
