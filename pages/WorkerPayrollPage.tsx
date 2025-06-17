
import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import { initialWorkerGroups } from '../../data/initialWorkerGroups';
import { initialProducts } from '../../data/initialProducts';
import { initialCustomers } from '../../data/initialCustomers';
import Select from '../../components/ui/Select';
import { DailyProductProductionByGroups, OverallPayrollRecord, MonthlyMemberSummary } from '../../types';
import { formatDate, generateUniqueId } from '../../utils/helpers';
import { mockDailyProductionData as initialMockDailyProductionData } from '../data/mockDailyProductionData'; // Renamed import
import OverallPayrollDetailModal from './payroll/OverallPayrollDetailModal'; 
import AddProductionRecordModal from './payroll/AddProductionRecordModal'; // New Modal
import { PlusIcon } from '@heroicons/react/24/outline';

// Generate mock overall payroll data dynamically
const generateMockOverallPayrollData = (): OverallPayrollRecord[] => {
    const records: OverallPayrollRecord[] = [];
    const currentYear = new Date().getFullYear();
    const months = ["06", "07", "08"]; // Example for a few months

    months.forEach(monthStr => {
        initialWorkerGroups.forEach((group, index) => {
            const totalProducts = group.totalProductsMade || (group.members.length * (50 + Math.floor(Math.random() * 20)));
            const totalSalary = group.totalSalary || (totalProducts * (50000 + Math.floor(Math.random() * 5000)));

            const memberSummaries: MonthlyMemberSummary[] = group.members.map(member => ({
                id: member.id, 
                memberId: member.id,
                memberName: member.name,
                totalProductsByMember: group.members.length > 0 ? Math.round(totalProducts / group.members.length) : 0,
                totalSalaryByMember: group.members.length > 0 ? Math.round(totalSalary / group.members.length) : 0,
            }));

            records.push({
                id: `op-${monthStr}-${group.id}`, 
                workerGroupId: group.id,
                workerGroupName: group.name,
                month: `${monthStr}/${currentYear}`,
                totalProducts: totalProducts,
                totalSalary: totalSalary,
                status: Math.random() > 0.5 ? 'Paid' : 'Pending',
                memberSummaries: memberSummaries,
            });
        });
    });
    return records.sort((a,b) => b.month.localeCompare(a.month));
};


const WorkerPayrollPage: React.FC = () => {
  const { t, formatCurrency, language } = useLocalization();
  const [activeTab, setActiveTab] = useState<'overall' | 'productOutput'>('overall');
  const [mockOverallPayrollData, setMockOverallPayrollData] = useState<OverallPayrollRecord[]>(generateMockOverallPayrollData());
  const [mockDailyProductionData, setMockDailyProductionData] = useState<DailyProductProductionByGroups[]>(initialMockDailyProductionData);


  const [isPayrollDetailModalOpen, setIsPayrollDetailModalOpen] = useState(false);
  const [selectedPayrollRecord, setSelectedPayrollRecord] = useState<OverallPayrollRecord | null>(null);
  
  const [isAddProductionModalOpen, setIsAddProductionModalOpen] = useState(false);


  const [filters, setFilters] = React.useState({
    dateRange: new Date().toISOString().slice(0,7), 
    productCode: '',
    workerGroup: '', 
    customer: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
  };
  
  const workerGroupOptions = [{value: '', label: t('all')}, ...initialWorkerGroups.map(wg => ({value: wg.id, label: wg.name}))];
  const productOptions = [{value: '', label: t('all')}, ...initialProducts.map(p => ({value: p.productCode, label: `${p.productCode} (${p.description || t('noDescription')})`}))];
  const customerOptions = [{value: '', label: t('all')}, ...initialCustomers.map(c => ({value: c.id, label: c.name}))];

  const handleViewOverallPayrollDetails = (record: OverallPayrollRecord) => {
    setSelectedPayrollRecord(record);
    setIsPayrollDetailModalOpen(true);
  };

  const handleUpdatePayrollStatus = (recordId: string, newStatus: 'Paid' | 'Pending') => {
    setMockOverallPayrollData(prevData => 
        prevData.map(record => record.id === recordId ? { ...record, status: newStatus } : record)
    );
    // After updating, you might want to close the detail modal or refresh its view if it remains open.
    // For simplicity, we assume the detail modal will be re-rendered with new prop or closed.
    if(selectedPayrollRecord && selectedPayrollRecord.id === recordId) {
        setSelectedPayrollRecord(prev => prev ? {...prev, status: newStatus} : null);
    }
  };
  
  const handleAddNewProductionRecord = (newRecord: DailyProductProductionByGroups) => {
    setMockDailyProductionData(prev => [newRecord, ...prev].sort((a,b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime()));
    // Optionally: show success message
    alert(t('newProductionRecordSuccess'));
  };

  const overallPayrollColumns: Column<OverallPayrollRecord>[] = [
    { header: 'workerGroupName', accessor: 'workerGroupName' },
    { header: 'totalProductsMade', accessor: 'totalProducts'},
    { header: 'totalSalary', accessor: item => formatCurrency(item.totalSalary, 'VND')},
    { header: 'status', accessor: item => item.status === 'Paid' ? t('payrollStatusPaid') : t('payrollStatusPending') },
    { 
        header: 'actions', 
        accessor: 'id', 
        render: (item) => <Button size="sm" variant="outline" onClick={() => handleViewOverallPayrollDetails(item)}>{t('viewDetails')}</Button> 
    }
  ];

  const groupedOverallPayroll = useMemo(() => {
    return mockOverallPayrollData.reduce((acc, record) => {
        (acc[record.month] = acc[record.month] || []).push(record);
        return acc;
    }, {} as Record<string, OverallPayrollRecord[]>);
  }, [mockOverallPayrollData]);


  const productOutputColumns = useMemo((): Column<DailyProductProductionByGroups>[] => {
    const baseColumns: Column<DailyProductProductionByGroups>[] = [
      { header: 'workDate', accessor: item => formatDate(item.workDate, language), className: "min-w-[120px]" },
      { header: 'productCode', accessor: 'productCode', className: "font-semibold min-w-[100px]" },
      { header: 'workerPrice', accessor: item => formatCurrency(item.workerPrice, 'VND'), className: "min-w-[130px]" },
      { header: 'customerName', accessor: 'customerName', className: "min-w-[150px]" },
    ];

    const groupColumns: Column<DailyProductProductionByGroups>[] = initialWorkerGroups.map(group => ({
      header: group.name, 
      accessor: (item) => item.productionByGroup[group.id] || 0, 
      className: "text-center min-w-[80px]",
    }));

    const summaryColumns: Column<DailyProductProductionByGroups>[] = [
      { header: 'totalProductsMade', accessor: 'totalQuantity', className: "font-bold text-center min-w-[120px]" },
      { header: 'totalSalary', accessor: item => formatCurrency(item.totalSalary, 'VND'), className: "font-bold min-w-[150px]" },
      { header: 'absentWorkersGroups', accessor: 'absentees', className: "min-w-[180px]" },
    ];
    return [...baseColumns, ...groupColumns, ...summaryColumns];
  }, [t, language, formatCurrency]);

  const filteredDailyProductionData = useMemo(() => {
    return mockDailyProductionData.filter(item => {
        const itemMonthYear = item.workDate.slice(0,7);
        const filterMonthYear = filters.dateRange; 
        
        const dateMatch = filterMonthYear ? itemMonthYear === filterMonthYear : true;
        const productMatch = filters.productCode ? item.productCode === filters.productCode : true;
        const customerMatch = filters.customer ? item.customerId === filters.customer : true; 
        const groupMatch = filters.workerGroup ? (item.productionByGroup[filters.workerGroup] || 0) > 0 : true;

        return dateMatch && productMatch && customerMatch && groupMatch;
    });
  }, [filters, mockDailyProductionData]);


  return (
    <>
    <Card title={t('workerPayroll')}>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        {t('workerPayrollDescription')}
      </p>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overall')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overall'
                ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
            }`}
          >
            {t('overallPayroll')}
          </button>
          <button
            onClick={() => setActiveTab('productOutput')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'productOutput'
                ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
            }`}
          >
            {t('productSKUOutput')}
          </button>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border dark:border-gray-700 rounded-lg">
        <Input 
          type="month"
          label={t('filterByDateMonth')}
          name="dateRange"
          value={filters.dateRange}
          onChange={handleFilterChange}
        />
        <Select
          label={t('filterByProductCode')}
          name="productCode"
          options={productOptions}
          value={filters.productCode}
          onChange={handleFilterChange}
        />
        <Select
          label={t('filterByWorkerGroup')}
          name="workerGroup"
          options={workerGroupOptions}
          value={filters.workerGroup}
          onChange={handleFilterChange}
        />
        <Select
          label={t('filterByCustomer')}
          name="customer"
          options={customerOptions}
          value={filters.customer}
          onChange={handleFilterChange}
        />
      </div>

      {activeTab === 'overall' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-3">{t('overallPayroll')}</h3>
          {Object.entries(groupedOverallPayroll).length > 0 ? (
            Object.entries(groupedOverallPayroll).map(([month, records]) => (
              <Card key={month} title={`${t('filterByDateMonth')}: ${month}`} className="mb-6">
                <Table columns={overallPayrollColumns} data={records} />
              </Card>
            ))
          ) : (
             <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-md text-center">
                <p className="text-gray-500 dark:text-gray-400">{t('payrollDataDisplayPlaceholder')}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'productOutput' && (
         <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold">{t('productSKUOutput')}</h3>
                <Button onClick={() => setIsAddProductionModalOpen(true)} leftIcon={<PlusIcon className="h-5 w-5"/>}>
                    {t('addProductionQuantity')}
                </Button>
            </div>
          {filteredDailyProductionData.length > 0 ? (
            <Table columns={productOutputColumns} data={filteredDailyProductionData} />
          ) : (
             <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-md text-center">
                <p className="text-gray-500 dark:text-gray-400">{t('payrollDataDisplayPlaceholder')}</p>
            </div>
          )}
        </div>
      )}
      
    </Card>
    {isPayrollDetailModalOpen && selectedPayrollRecord && (
        <OverallPayrollDetailModal
            isOpen={isPayrollDetailModalOpen}
            onClose={() => setIsPayrollDetailModalOpen(false)}
            payrollRecord={selectedPayrollRecord}
            onUpdateStatus={handleUpdatePayrollStatus}
        />
    )}
    {isAddProductionModalOpen && (
        <AddProductionRecordModal
            isOpen={isAddProductionModalOpen}
            onClose={() => setIsAddProductionModalOpen(false)}
            onSave={handleAddNewProductionRecord}
            products={initialProducts}
            customers={initialCustomers}
            workerGroups={initialWorkerGroups}
        />
    )}
    </>
  );
};

export default WorkerPayrollPage;
