import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { LogOut, Plus, FileText, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import UploadModal from '../components/UploadModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = 'http://localhost:5000';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/invoice/all`, {
        headers: { 'x-auth-token': token }
      });
      setInvoices(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Analytics Calculations
  const totalSpent = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  
  const categoryData = invoices.reduce((acc, inv) => {
    const cat = inv.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + (inv.amount || 0);
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(16, 185, 129, 0.8)', // emerald
          'rgba(245, 158, 11, 0.8)', // amber
          'rgba(239, 68, 68, 0.8)',  // red
          'rgba(139, 92, 246, 0.8)', // violet
          'rgba(107, 114, 128, 0.8)' // gray
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">SmartInvoice</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard Overivew</h2>
            <p className="text-slate-500 mt-1">Manage and analyze your processed invoices.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Spending</p>
              <h3 className="text-3xl font-bold text-slate-900">${totalSpent.toFixed(2)}</h3>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Invoices Processed</p>
              <h3 className="text-3xl font-bold text-slate-900">{invoices.length}</h3>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
              <FileText className="w-8 h-8" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Top Category</p>
              <h3 className="text-2xl font-bold text-slate-900 truncate max-w-[150px]">
                {Object.keys(categoryData).length > 0 ? 
                  Object.keys(categoryData).reduce((a, b) => categoryData[a] > categoryData[b] ? a : b) : 
                  'N/A'}
              </h3>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl text-amber-600">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Invoices Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Recent Invoices</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Vendor</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                        No invoices processed yet. Upload one to get started!
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{inv.vendor}</td>
                        <td className="px-6 py-4 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {inv.date}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {inv.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          ${inv.amount ? inv.amount.toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Spend by Category Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Spend by Category</h3>
            {invoices.length > 0 ? (
              <div className="relative h-64 w-full">
                <Doughnut data={doughnutData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                No data available
              </div>
            )}
          </div>
        </div>
      </main>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={fetchInvoices}
      />
    </div>
  );
}
