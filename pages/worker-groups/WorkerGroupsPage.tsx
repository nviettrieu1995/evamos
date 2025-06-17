import React, { useState, useMemo, useEffect } from 'react';
import { WorkerGroup, WorkerGroupMember, UserRole } from '../../types';
import { initialWorkerGroups } from '../../data/initialWorkerGroups';
import { useLocalization } from '../../hooks/useLocalization';
import { useAuth } from '../../hooks/useAuth'; 
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table, { Column } from '../../components/ui/Table';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { generateUniqueId } from '../../utils/helpers';
import WorkerGroupDetailModal from './WorkerGroupDetailModal'; 

const getMockSystemUsers = () => {
    return [
      { id: 'user-admin-id', username: 'admin', role: UserRole.ADMIN, name: 'Admin User' },
      { id: 'user-manager-id', username: 'quanly', role: UserRole.MANAGER, name: 'Manager User' },
      { id: 'w1', username: 'hanh_worker', role: UserRole.WORKER, name: 'Hạnh' },
      { id: 'w2', username: 'tuananh_worker', role: UserRole.WORKER, name: 'Tuấn Anh' },
      { id: 'w3', username: 'hang_worker', role: UserRole.WORKER, name: 'Hằng' },
      { id: 'w4', username: 'truong_worker', role: UserRole.WORKER, name: 'Trường' },
      { id: 'w5', name: 'Giang', role: UserRole.WORKER, username: 'giang_w' },
      { id: 'w6', name: 'Hậu', role: UserRole.WORKER, username: 'hau_w' },
      { id: 'w7', name: 'Mai', role: UserRole.WORKER, username: 'mai_w' },
      { id: 'w8', name: 'Hương', role: UserRole.WORKER, username: 'huong_w' },
      { id: 'w9', name: 'Hà', role: UserRole.WORKER, username: 'ha_w' },
      { id: 'w10', name: 'Liễu', role: UserRole.WORKER, username: 'lieu_w' },
      { id: 'w11', name: 'Nghĩa', role: UserRole.WORKER, username: 'nghia_w' },
      { id: 'w12', name: 'Ngoan', role: UserRole.WORKER, username: 'ngoan_w' },
      { id: 'w13', name: 'Thúy', role: UserRole.WORKER, username: 'thuy_w_1' },
      { id: 'w14', name: 'Thủy', role: UserRole.WORKER, username: 'thuy_w_2' },
      { id: 'w15', name: 'Trang', role: UserRole.WORKER, username: 'trang_w' },
      { id: 'w16', name: 'Quân', role: UserRole.WORKER, username: 'quan_w' },
      { id: 'w17', name: 'Việt Anh', role: UserRole.WORKER, username: 'vietanh_w' },
      { id: 'w18', name: 'Châu Anh', role: UserRole.WORKER, username: 'chauanh_w' },
      { id: 'w19', name: 'Quyền', role: UserRole.WORKER, username: 'quyen_w' },
      { id: 'w20', name: 'Đức', role: UserRole.WORKER, username: 'duc_w' },
      { id: 'w21', name: 'Yến', role: UserRole.WORKER, username: 'yen_w' },
      { id: 'new_worker_1', name: 'Công Nhân Mới 1', role: UserRole.WORKER, username: 'cnmoi1' },
      { id: 'new_worker_2', name: 'Công Nhân Mới 2', role: UserRole.WORKER, username: 'cnmoi2' },
    ];
};


const WorkerGroupsPage: React.FC = () => {
  const { t, formatCurrency, language } = useLocalization();
  const [groups, setGroups] = useState<WorkerGroup[]>(initialWorkerGroups);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Partial<WorkerGroup> | null>(null);
  const [viewingGroup, setViewingGroup] = useState<WorkerGroup | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<WorkerGroupMember[]>([]);
  
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    const systemUsers = getMockSystemUsers();
    const workerUsers = systemUsers
        .filter(user => user.role === UserRole.WORKER)
        .map(user => ({ id: user.id, name: user.name || user.username }));
    setAvailableWorkers(workerUsers);
  }, []); 

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedGroups = useMemo(() => {
    let sortableItems = [...groups];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof WorkerGroup];
        const valB = b[sortConfig.key as keyof WorkerGroup];

        if (valA === null || valA === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (valB === null || valB === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        
        if (sortConfig.key === 'totalProductsMade' || sortConfig.key === 'totalSalary') {
             const numA = Number(valA) || 0;
             const numB = Number(valB) || 0;
             return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
        }
        
        // Default string sort
        return sortConfig.direction === 'ascending' 
          ? String(valA).localeCompare(String(valB), language) 
          : String(valB).localeCompare(String(valA), language);
      });
    }
    return sortableItems;
  }, [groups, sortConfig, language]);


  const openAddModal = () => {
    setEditingGroup({ name: '', members: [] });
    setSelectedMembers([]);
    setIsModalOpen(true);
  };

  const openEditModal = (group: WorkerGroup) => {
    setEditingGroup(group);
    setSelectedMembers(group.members.map(m => m.id));
    setIsModalOpen(true);
  };

  const openDetailModal = (group: WorkerGroup) => {
    setViewingGroup(group);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
    setSelectedMembers([]);
  };
  
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewingGroup(null);
  };

  const handleSaveGroup = () => {
    if (!editingGroup || !editingGroup.name?.trim()) {
      alert(t('groupNameRequired'));
      return;
    }
    
    const finalMembers = availableWorkers.filter(w => selectedMembers.includes(w.id));
    const mockTotalProducts = finalMembers.length * 50 + Math.floor(Math.random() * 50); 
    const mockTotalSalary = mockTotalProducts * (50000 + Math.floor(Math.random() * 10000)); 

    if (editingGroup.id) { 
      setGroups(groups.map(g => g.id === editingGroup.id ? { ...g, name: editingGroup.name!, members: finalMembers, totalProductsMade: mockTotalProducts, totalSalary: mockTotalSalary } : g));
    } else { 
      setGroups([{ id: generateUniqueId(), name: editingGroup.name!, members: finalMembers, totalProductsMade: mockTotalProducts, totalSalary: mockTotalSalary }, ...groups]);
    }
    closeModal();
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm(t('areYouSureDelete'))) {
      setGroups(groups.filter(g => g.id !== groupId));
    }
  };
  
  const handleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const columns: Column<WorkerGroup>[] = [
    { 
      header: 'workerGroupName', 
      accessor: 'name', 
      className: "font-semibold",
      sortKey: 'name',
      render: (item: WorkerGroup) => (
        <button onClick={(e) => { e.stopPropagation(); openDetailModal(item);}} className="text-primary hover:underline">
            {item.name}
        </button>
      )
    },
    { header: 'groupMembers', accessor: (item: WorkerGroup) => item.members.map(m => m.name).join(', ') },
    { header: 'totalProductsMade', accessor: (item: WorkerGroup) => item.totalProductsMade || 0, sortKey: 'totalProductsMade' },
    { header: 'totalSalary', accessor: (item: WorkerGroup) => formatCurrency(item.totalSalary || 0, 'VND'), sortKey: 'totalSalary' },
    {
      header: 'actions',
      accessor: 'id',
      render: (item: WorkerGroup) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetailModal(item);}} title={t('viewDetails')}>
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(item);}} title={t('edit')}>
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(item.id);}} title={t('delete')} className="text-red-500 hover:text-red-700">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
    <Card title={t('workerGroupManagement')} actions={
      <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />}>
        {t('addWorkerGroup')}
      </Button>
    }>
      <Table 
        columns={columns} 
        data={sortedGroups} 
        sortConfig={sortConfig}
        requestSort={requestSort}
        onRowClick={openDetailModal}
      />

      {isModalOpen && editingGroup && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={editingGroup.id ? t('editWorkerGroup') : t('addWorkerGroup')}
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button>
              <Button onClick={handleSaveGroup}>{t('save')}</Button>
            </>
          }
          size="md"
        >
          <Input label={t('workerGroupName')} name="name" value={editingGroup.name || ''} 
            onChange={(e) => setEditingGroup(prev => ({...prev, name: e.target.value}))} 
            required 
          />
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('selectMembers')}</h4>
            {availableWorkers.length > 0 ? (
                <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 space-y-1">
                {availableWorkers.map(worker => (
                    <label key={worker.id} className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input 
                        type="checkbox"
                        className="rounded text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                        checked={selectedMembers.includes(worker.id)}
                        onChange={() => handleMemberSelection(worker.id)}
                    />
                    <span>{worker.name}</span>
                    </label>
                ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('noAvailableWorkers')}</p>
            )}
          </div>
        </Modal>
      )}
    </Card>
    {viewingGroup && <WorkerGroupDetailModal isOpen={isDetailModalOpen} onClose={closeDetailModal} group={viewingGroup} />}
    </>
  );
};

export default WorkerGroupsPage;
