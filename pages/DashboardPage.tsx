
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import { useTheme } from '../hooks/useTheme';
import { getUserPlans, savePlan, deletePlan } from '../firebase/firestoreService';
import { auth } from '../firebase/firebaseConfig';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { ChartBarIcon, CurrencyDollarIcon, UserGroupIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const sampleRevenueData = [
  { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 }, { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 }, { name: 'Jun', revenue: 5500 },
];

const sampleDebtStatusData = [
  { name: 'Paid', value: 400 },
  { name: 'Overdue', value: 150 },
  { name: 'Pending', value: 250 },
];
const COLORS = ['#0088FE', '#FF8042', '#00C49F'];

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, formatCurrency } = useLocalization();
  const { theme } = useTheme();
  const [debtFilterDate, setDebtFilterDate] = useState(new Date().toISOString().slice(0, 7));

  const [plans, setPlans] = useState<any[]>([]);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(true);

  const fetchPlans = async () => {
    if (auth.currentUser) {
      setLoadingPlans(true);
      const result = await getUserPlans(auth.currentUser.uid);
      setPlans(result);
      setLoadingPlans(false);
    }
  };

  const handleAddPlan = async () => {
    if (!newPlanTitle.trim() || !auth.currentUser) return;
    await savePlan(auth.currentUser.uid, {
      title: newPlanTitle,
      content: "Mô tả mặc định hoặc sinh từ AI",
    });
    setNewPlanTitle("");
    fetchPlans();
  };

  const handleDeletePlan = async (planId: string) => {
    await deletePlan(planId);
    fetchPlans();
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
        {t('dashboard')}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        {t('welcomeMessage', { name: currentUser?.name || currentUser?.username || 'User' })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="h-10 w-10 opacity-75" />
            <div>
              <p className="text-sm font-medium uppercase tracking-wider">{t('totalRevenue')}</p>
              <p className="text-3xl font-bold">{formatCurrency(125350000, 'VND')}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-10 w-10 opacity-75" />
            <div>
              <p className="text-sm font-medium uppercase tracking-wider">{t('totalDebtCollection')}</p>
              <p className="text-3xl font-bold">{formatCurrency(3500000, 'VND')}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center space-x-3">
            <ClipboardDocumentListIcon className="h-10 w-10 opacity-75" />
            <div>
              <p className="text-sm font-medium uppercase tracking-wider">{t('activeProductionPlans')}</p>
              <p className="text-3xl font-bold">12</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="h-10 w-10 opacity-75" />
            <div>
              <p className="text-sm font-medium uppercase tracking-wider">{t('newOrders')}</p>
              <p className="text-3xl font-bold">5</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('monthlyRevenue')}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleRevenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="name" className="text-xs text-gray-500 dark:text-gray-400" />
              <YAxis className="text-xs text-gray-500 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                  borderRadius: '0.5rem',
                  border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'
                }}
                itemStyle={{ color: theme === 'dark' ? '#e5e7eb' : '#1f2937' }}
                cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                formatter={(value: number) => formatCurrency(value, 'VND')}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#357ABD" name={t('revenue')} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title={t('debtStatus')}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sampleDebtStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${t(name.toLowerCase()) || name} ${(percent * 100).toFixed(0)}%`}
              >
                {sampleDebtStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value, 'VND')} />
              <Legend formatter={(value) => t(value.toLowerCase()) || value} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title={t('recentActivities')}>
          <ul>
            <li className="py-2 border-b border-gray-200 dark:border-gray-700 text-sm">New customer "Versal" added.</li>
            <li className="py-2 border-b border-gray-200 dark:border-gray-700 text-sm">Product "2029" production completed for order #123.</li>
            <li className="py-2 text-sm">Payment received from "Farid (24-103)".</li>
          </ul>
        </Card>
        <Card title={t('dailyDebtCollection')}>
          <div className="mb-4">
            <Input
              type="month"
              label={t('filterByDateMonthYear')}
              value={debtFilterDate}
              onChange={(e) => setDebtFilterDate(e.target.value)}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Showing debt collection for {debtFilterDate}. (Demo - no actual data filtering)
          </p>
        </Card>
      </div>

      <Card title="📝 Kế hoạch của bạn">
        <div className="mb-4 flex gap-2">
          <input
            className="border border-gray-300 rounded px-4 py-2 flex-1"
            placeholder="Tiêu đề kế hoạch mới"
            value={newPlanTitle}
            onChange={(e) => setNewPlanTitle(e.target.value)}
          />
          <button
            onClick={handleAddPlan}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Thêm
          </button>
        </div>
        {loadingPlans ? (
          <p>Đang tải...</p>
        ) : plans.length === 0 ? (
          <p>Chưa có kế hoạch nào.</p>
        ) : (
          <ul className="space-y-2">
            {plans.map((plan) => (
              <li
                key={plan.id}
                className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded flex justify-between items-center"
              >
                <span>{plan.title}</span>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Xoá
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
