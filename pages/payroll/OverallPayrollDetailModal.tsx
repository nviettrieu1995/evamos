
import React, { useState } from 'react';
import { OverallPayrollRecord, MonthlyMemberSummary } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import Modal from '../../components/ui/Modal';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select'; // For status change

interface OverallPayrollDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollRecord: OverallPayrollRecord | null;
  onUpdateStatus: (recordId: string, newStatus: 'Paid' | 'Pending') => void;
}

const OverallPayrollDetailModal: React.FC<OverallPayrollDetailModalProps> = ({ isOpen, onClose, payrollRecord, onUpdateStatus }) => {
  const { t, formatCurrency } = useLocalization();
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [newStatusToConfirm, setNewStatusToConfirm] = useState<'Paid' | 'Pending' | null>(null);


  if (!payrollRecord) return null;

  const { id: recordId, workerGroupName, month, memberSummaries, totalProducts, totalSalary, status } = payrollRecord;

  const columns: Column<MonthlyMemberSummary>[] = [
    { header: 'workerName', accessor: 'memberName' },
    { header: 'totalProductsMade', accessor: (item) => item.totalProductsByMember.toFixed(2) },
    { header: 'totalSalary', accessor: (item) => formatCurrency(item.totalSalaryByMember, 'VND') },
  ];

  const handleStatusChangeClick = (newStat: 'Paid' | 'Pending') => {
    if (newStat !== status) {
        setNewStatusToConfirm(newStat);
        setShowStatusConfirm(true);
    }
  };
  
  const confirmStatusChange = () => {
    if (newStatusToConfirm) {
        onUpdateStatus(recordId, newStatusToConfirm);
    }
    setShowStatusConfirm(false);
    setNewStatusToConfirm(null);
    // Optionally close the main modal after status update or keep it open
    // onClose(); 
  };


  const statusDisplay = status === 'Paid' ? t('payrollStatusPaid') : t('payrollStatusPending');

  return (
    <>
    <Modal 
      isOpen={isOpen && !showStatusConfirm} // Main modal hidden when confirm modal is up
      onClose={onClose} 
      title={t('overallPayrollDetailTitle', { groupName: workerGroupName, month: month })} 
      size="lg"
    >
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-md font-semibold mb-2">{t('summary')}</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <p><strong>{t('workerGroup')}:</strong> {workerGroupName}</p>
            <p><strong>{t('filterByDateMonth')}:</strong> {month}</p>
            <p><strong>{t('totalProductsMade')} ({t('group')}):</strong> {totalProducts}</p>
            <p><strong>{t('totalSalary')} ({t('group')}):</strong> {formatCurrency(totalSalary, 'VND')}</p>
            <p><strong>{t('status')}:</strong> <span className={`font-semibold ${status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>{statusDisplay}</span></p>
          </div>
        </div>
        
        <div className="my-4">
            <h4 className="text-md font-semibold mb-1">{t('changeStatus')}:</h4>
            <div className="flex space-x-2">
                <Button 
                    size="sm" 
                    variant={status === 'Pending' ? "primary" : "outline"} 
                    onClick={() => handleStatusChangeClick('Pending')}
                    disabled={status === 'Pending'}
                >
                    {t('markAsPending')}
                </Button>
                <Button 
                    size="sm" 
                    variant={status === 'Paid' ? "primary" : "outline"} 
                    onClick={() => handleStatusChangeClick('Paid')}
                    disabled={status === 'Paid'}
                >
                    {t('markAsPaid')}
                </Button>
            </div>
        </div>

        <h4 className="text-lg font-semibold">{t('groupMembers')} ({t('salaryDistribution')}):</h4>
        {memberSummaries && memberSummaries.length > 0 ? (
            <Table columns={columns} data={memberSummaries} />
        ) : (
            <p className="text-gray-500 dark:text-gray-400">{t('noData')}</p>
        )}
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            {t('note')}: {t('salaryDistributionNoteStatic')}
          </p>
        </div>
      </div>
    </Modal>

    {showStatusConfirm && newStatusToConfirm && (
        <Modal
            isOpen={showStatusConfirm}
            onClose={() => {setShowStatusConfirm(false); setNewStatusToConfirm(null);}}
            title={t('confirmStatusChangeTitle')}
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={() => {setShowStatusConfirm(false); setNewStatusToConfirm(null);}}>{t('cancel')}</Button>
                    <Button onClick={confirmStatusChange}>{t('save')}</Button>
                </>
            }
        >
            <p>{t('confirmStatusChangeMsg', { groupName: workerGroupName, month: month, status: newStatusToConfirm === 'Paid' ? t('payrollStatusPaid') : t('payrollStatusPending') })}</p>
        </Modal>
    )}
    </>
  );
};

export default OverallPayrollDetailModal;