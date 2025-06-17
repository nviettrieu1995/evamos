
import React from 'react';
import { WorkerGroup, GroupProductionRecord, WorkerIndividualProductSummary } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import Modal from '../../components/ui/Modal';
import Table, { Column } from '../../components/ui/Table';
import { formatDate, generateUniqueId } from '../../utils/helpers';

interface WorkerGroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: WorkerGroup | null;
}

// Mock production data for a group, enhanced for individual contribution demo
const mockGroupProductionRecords: GroupProductionRecord[] = [
  { id: 'gpr1', date: '2024-07-15', productCode: '2029', productDescription: 'Váy công sở A', quantity: 50, workerPrice: 45000, totalSalary: 2250000, activeMemberIds: ['w1', 'w2'] }, // Cả Hạnh (w1) và Tuấn Anh (w2) làm
  { id: 'gpr2', date: '2024-07-16', productCode: '2087', productDescription: 'Áo kiểu B', quantity: 70, workerPrice: 50000, totalSalary: 3500000, activeMemberIds: ['w1'] }, // Chỉ Hạnh (w1) làm, Tuấn Anh (w2) nghỉ (cho Cạ Hạnh)
  { id: 'gpr3', date: '2024-07-17', productCode: '2021', productDescription: 'Váy Ren', quantity: 60, workerPrice: 50000, totalSalary: 3000000 }, // Mặc định chia đều cho các thành viên trong Cạ
  { id: 'gpr4', date: '2024-07-18', productCode: '2029', productDescription: 'Váy công sở A', quantity: 30, workerPrice: 45000, totalSalary: 1350000, activeMemberIds: ['w1'] }, // Hạnh làm thêm mã 2029
];

const WorkerGroupDetailModal: React.FC<WorkerGroupDetailModalProps> = ({ isOpen, onClose, group }) => {
  const { t, formatCurrency, language } = useLocalization();

  if (!group) return null;

  // Process production records to show summarized individual contributions
  const summarizedIndividualProduction: WorkerIndividualProductSummary[] = [];
  let groupOverallTotalSalary = 0;
  let groupOverallTotalProducts = 0;

  const tempWorkerContributions: Record<string, Record<string, { qty: number, salary: number, name: string, desc?: string }>> = {}; // workerId -> productCode -> data

  mockGroupProductionRecords.forEach(record => {
    // This example assumes mockGroupProductionRecords are ALREADY for the selected group.
    groupOverallTotalProducts += record.quantity;
    groupOverallTotalSalary += record.totalSalary;

    const activeMembers = record.activeMemberIds 
        ? group.members.filter(m => record.activeMemberIds!.includes(m.id))
        : group.members;
    
    if (activeMembers.length === 0 && group.members.length > 0) { 
        // Fallback or error, for now, skip if no active members can be determined and record specifies them
        return;
    }

    const quantityPerMember = activeMembers.length > 0 ? record.quantity / activeMembers.length : 0;
    const salaryPerMember = activeMembers.length > 0 ? record.totalSalary / activeMembers.length : 0;

    activeMembers.forEach(member => {
        if (!tempWorkerContributions[member.id]) {
            tempWorkerContributions[member.id] = {};
        }
        if (!tempWorkerContributions[member.id][record.productCode]) {
            tempWorkerContributions[member.id][record.productCode] = { qty: 0, salary: 0, name: member.name, desc: record.productDescription };
        }
        tempWorkerContributions[member.id][record.productCode].qty += quantityPerMember;
        tempWorkerContributions[member.id][record.productCode].salary += salaryPerMember;
    });
  });

  for (const workerId in tempWorkerContributions) {
    for (const productCode in tempWorkerContributions[workerId]) {
        const data = tempWorkerContributions[workerId][productCode];
        summarizedIndividualProduction.push({
            id: `${workerId}-${productCode}`,
            workerId: workerId,
            workerName: data.name,
            productCode: productCode,
            productDescription: data.desc,
            totalQuantityByWorker: data.qty,
            totalSalaryForWorker: data.salary,
        });
    }
  }


  const groupProductionColumns: Column<GroupProductionRecord>[] = [
    { header: 'transactionDate', accessor: (item) => formatDate(item.date, language) },
    { header: 'productCode', accessor: 'productCode' },
    { header: 'productDescription', accessor: 'productDescription' },
    { header: 'quantity', accessor: 'quantity' },
    { header: 'workerPrice', accessor: (item) => formatCurrency(item.workerPrice, 'VND') },
    { header: 'totalSalary', accessor: (item) => formatCurrency(item.totalSalary, 'VND') },
    { header: 'notes', accessor: (item) => item.activeMemberIds ? `${t('activeMembers')}: ${item.activeMemberIds.map(id => group.members.find(m=>m.id === id)?.name || id).join(', ')}` : t('allMembersActive') }
  ];
  
  const summarizedIndividualColumns: Column<WorkerIndividualProductSummary>[] = [
    { header: 'workerName', accessor: 'workerName'},
    { header: 'productCode', accessor: 'productCode'},
    { header: 'productDescription', accessor: 'productDescription'},
    { header: 'quantityByWorker', accessor: (item) => item.totalQuantityByWorker.toFixed(2)}, // Updated key
    { header: 'salaryForWorker', accessor: (item) => formatCurrency(item.totalSalaryForWorker, 'VND')}, // Updated key
  ];


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${t('workerGroupDetails')}: ${group.name}`} size="xl">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">{t('groupMembers')}:</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {group.members.map(m => m.name).join(', ') || t('noData')}
          </p>
        </div>
        <hr className="dark:border-gray-600"/>
        
        <div>
            <h3 className="text-lg font-semibold mb-2">{t('productionRecord')}</h3>
             {mockGroupProductionRecords.length > 0 ? (
                <Table columns={groupProductionColumns} data={mockGroupProductionRecords} />
            ) : (
                <p className="text-gray-500 dark:text-gray-400">{t('noProductionRecords')}</p>
            )}
        </div>
        <hr className="dark:border-gray-600"/>

        <div>
            <h3 className="text-lg font-semibold mb-2">{t('individualProductionRecords')}</h3>
            {summarizedIndividualProduction.length > 0 ? (
                <Table columns={summarizedIndividualColumns} data={summarizedIndividualProduction} />
            ) : (
                 <p className="text-gray-500 dark:text-gray-400">{t('noIndividualProductionData')}</p>
            )}
        </div>
        <hr className="dark:border-gray-600"/>

        <div className="mt-4 grid grid-cols-2 gap-4 text-right">
            <div>
                <p className="text-md font-semibold">{t('totalProductsMade')} ({t('total')}):</p>
                <p className="text-xl text-blue-600 dark:text-blue-400 font-bold">{groupOverallTotalProducts}</p>
            </div>
            <div>
                <p className="text-md font-semibold">{t('totalSalary')} ({t('total')}):</p>
                <p className="text-xl text-green-600 dark:text-green-400 font-bold">{formatCurrency(groupOverallTotalSalary, 'VND')}</p>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default WorkerGroupDetailModal;
