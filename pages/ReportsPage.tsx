
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Card from '../components/ui/Card';
import { BarChart, PieChart, LineChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const sampleData = [
  { name: 'Category A', value: 400 },
  { name: 'Category B', value: 300 },
  { name: 'Category C', value: 300 },
  { name: 'Category D', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


const ReportsPage: React.FC = () => {
  const { t, formatCurrency } = useLocalization();
  return (
    <Card title={t('statisticalReports')}>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        {t('statisticalReportsDescription') || 'View comprehensive reports on revenue, expenses, profits, debts, worker salaries, and material costs.'}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title={t('revenueVsExpense') || "Revenue vs Expense"}>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[{name: 'Jan', revenue: 4000, expense: 2400}, {name: 'Feb', revenue: 3000, expense: 1398}, {name: 'Mar', revenue: 5000, expense: 3800}]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value, 'VND')} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name={t('revenue') || "Revenue"} />
                    <Line type="monotone" dataKey="expense" stroke="#82ca9d" name={t('expense') || "Expense"}/>
                </LineChart>
            </ResponsiveContainer>
        </Card>
        <Card title={t('costDistribution') || "Cost Distribution"}>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={sampleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                         {sampleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value, 'VND')} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
      </div>
      {/* More report sections as needed */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-md text-center">
        <p className="text-gray-500 dark:text-gray-400">{t('moreReportsComingSoon') || 'More detailed reports and export options are under development.'}</p>
      </div>
    </Card>
  );
};
// Add to locales.ts
// vi: { statisticalReportsDescription: 'Xem báo cáo toàn diện về doanh thu, chi phí, lợi nhuận, công nợ, lương công nhân và chi phí vật tư.', revenueVsExpense: 'Doanh thu vs Chi phí', expense: 'Chi phí', costDistribution: 'Phân bổ Chi phí', moreReportsComingSoon: 'Các báo cáo chi tiết hơn và tùy chọn xuất đang được phát triển.' }
// ru: { statisticalReportsDescription: 'Просмотр комплексных отчетов о доходах, расходах, прибыли, долгах, зарплатах рабочих и затратах на материалы.', revenueVsExpense: 'Доходы vs Расходы', expense: 'Расходы', costDistribution: 'Распределение затрат', moreReportsComingSoon: 'Более подробные отчеты и опции экспорта находятся в разработке.' }


export default ReportsPage;
