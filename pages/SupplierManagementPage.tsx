import React, { useState, useMemo } from 'react';
import { Supplier } from '../types';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select'; 
import Table, { Column } from '../../components/ui/Table';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { generateUniqueId } from '../../utils/helpers';

const initialSuppliers: Supplier[] = [
    {id: 'sup1', name: 'Nhà Cung Cấp Vải ABC', address: '123 Đường Vải, Q.Tân Bình', contactPerson: 'Chị Lan', phone: '0908123456', email: 'lan@nccabc.com', suppliesType: 'fabric', totalOrderValue: 150000000, notes: 'Chuyên vải cotton'},
    {id: 'sup2', name: 'Công ty Phụ Liệu XYZ', address: '456 Đường Cúc, Q.1', contactPerson: 'Anh Ba', phone: '0909987654', email: 'ba@plxyz.com', suppliesType: 'accessories', totalOrderValue: 75000000, notes: 'Cúc, khóa kéo, chỉ'},
];

const SupplierManagementPage: React.FC = () => {
  const { t, formatCurrency, language } = useLocalization();
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });

  const suppliesTypeOptions = [
    { value: 'fabric', label: t('fabricType') }, 
    { value: 'accessories', label: t('accessoriesManagement') }, 
    { value: 'general', label: t('generalSupplies') || 'Vật tư chung'}, 
  ];

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedSuppliers = useMemo(() => {
    let sortableItems = [...suppliers];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Supplier];
        const valB = b[sortConfig.key as keyof Supplier];

        if (valA === null || valA === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (valB === null || valB === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        
        if (sortConfig.key === 'totalOrderValue') {
            const numA = Number(valA);
            const numB = Number(valB);
            return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
        }
        
        return sortConfig.direction === 'ascending' 
          ? String(valA).localeCompare(String(valB), language) 
          : String(valB).localeCompare(String(valA), language);
      });
    }
    return sortableItems;
  }, [suppliers, sortConfig, language]);


  const openAddModal = () => {
    setEditingSupplier({ name: '', suppliesType: 'general' });
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleSave = () => {
    if (!editingSupplier || !editingSupplier.name?.trim()) {
        alert(t('supplierNameRequired'));
        return;
    }
    const supplierData = { ...editingSupplier } as Supplier;

    if (editingSupplier.id) {
        setSuppliers(suppliers.map(p => p.id === editingSupplier.id ? supplierData : p));
    } else {
        setSuppliers([{ ...supplierData, id: generateUniqueId() }, ...suppliers]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('areYouSureDelete'))) {
        setSuppliers(suppliers.filter(p => p.id !== id));
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setEditingSupplier(prev => ({...prev, [name]: (name === 'totalOrderValue') ? parseFloat(value) || 0 : value }));
  };

  const columns: Column<Supplier>[] = [
    { header: 'supplierName', accessor: 'name', className: "font-semibold", sortKey: 'name' },
    { header: 'address', accessor: 'address', sortKey: 'address' },
    { header: 'contactPerson', accessor: 'contactPerson', sortKey: 'contactPerson' },
    { header: 'customerPhone', accessor: 'phone', sortKey: 'phone' }, 
    { header: 'emailAddress', accessor: 'email', sortKey: 'email'},
    { header: 'suppliesType', accessor: (item) => suppliesTypeOptions.find(opt => opt.value === item.suppliesType)?.label || item.suppliesType, sortKey: 'suppliesType' },
    { header: 'totalOrderValue', accessor: (item) => formatCurrency(item.totalOrderValue || 0, 'VND'), sortKey: 'totalOrderValue' },
    { header: 'notes', accessor: 'notes', sortKey: 'notes'},
    {
      header: 'actions',
      accessor: 'id',
      render: (item: Supplier) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} title={t('edit')}><PencilIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title={t('delete')} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <Card title={t('supplierManagement')} actions={
        <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />}>{t('addSupplier')}</Button>
    }>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        {t('supplierManagementDescription')}
      </p>
      {/* TODO: Add filters for name, type */}
      <Table 
        columns={columns} 
        data={sortedSuppliers} 
        sortConfig={sortConfig}
        requestSort={requestSort}
      />
      {isModalOpen && editingSupplier && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSupplier.id ? t('editSupplier') : t('addSupplier')}
            footer={<><Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button><Button onClick={handleSave}>{t('save')}</Button></>}
            size="xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('supplierName')} name="name" value={editingSupplier.name || ''} onChange={handleInputChange} required wrapperClassName="md:col-span-2"/>
                <Input label={t('address')} name="address" value={editingSupplier.address || ''} onChange={handleInputChange} wrapperClassName="md:col-span-2"/>
                <Input label={t('contactPerson')} name="contactPerson" value={editingSupplier.contactPerson || ''} onChange={handleInputChange} />
                <Input label={t('customerPhone')} name="phone" value={editingSupplier.phone || ''} onChange={handleInputChange} />
                <Input label={t('emailAddress')} name="email" type="email" value={editingSupplier.email || ''} onChange={handleInputChange} />
                <Select label={t('suppliesType')} name="suppliesType" value={editingSupplier.suppliesType || 'general'} onChange={handleInputChange} options={suppliesTypeOptions} required/>
                <Input label={t('totalOrderValue')} name="totalOrderValue" type="number" value={String(editingSupplier.totalOrderValue || 0)} onChange={handleInputChange} />
                <Input label={t('notes')} name="notes" value={editingSupplier.notes || ''} onChange={handleInputChange} wrapperClassName="md:col-span-2" />
            </div>
          </Modal>
      )}
    </Card>
  );
};

export default SupplierManagementPage;
