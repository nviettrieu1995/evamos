import React, { useState, useMemo } from 'react';
import { Accessory } from '../types';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select'; 
import Table, { Column } from '../../components/ui/Table';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { generateUniqueId, formatDate } from '../../utils/helpers';
import { initialProducts } from '../../data/initialProducts'; 
const mockSuppliers = [ {id: 'sup1', name: 'NCC Phụ Liệu A'}, {id: 'sup2', name: 'NCC Phụ Liệu B'}];


const initialAccessories: Accessory[] = [
    {id: 'ac1', entryDate: '2024-07-01', accessoryCode: 'PL001', name: 'Cúc áo loại X', productCodeUsed: '2029', supplierId: 'sup1', quantity: 1000, unitPrice: 500, totalCost: 500000, notes: 'Cúc cho váy 2029'},
    {id: 'ac2', entryDate: '2024-07-05', accessoryCode: 'PL002', name: 'Khóa kéo Y', productCodeUsed: '2087', supplierId: 'sup2', quantity: 500, unitPrice: 2000, totalCost: 1000000, notes: 'Khóa cho áo 2087'},
];

const AccessoriesManagementPage: React.FC = () => {
  const { t, formatCurrency, language } = useLocalization();
  const [accessories, setAccessories] = useState<Accessory[]>(initialAccessories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Partial<Accessory> | null>(null);
  
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: 'accessoryCode', direction: 'ascending' });

  const productOptions = initialProducts.map(p => ({ value: p.productCode, label: `${p.productCode} - ${p.description || t('noDescription')}`}));
  const supplierOptions = mockSuppliers.map(s => ({ value: s.id, label: s.name }));

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAccessories = useMemo(() => {
    let sortableItems = [...accessories];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Accessory];
        const valB = b[sortConfig.key as keyof Accessory];

        if (valA === null || valA === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (valB === null || valB === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        
        if (['quantity', 'unitPrice', 'totalCost'].includes(sortConfig.key!)) {
            const numA = Number(valA);
            const numB = Number(valB);
            return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
        }
        if (sortConfig.key === 'entryDate') {
            return sortConfig.direction === 'ascending' 
                ? new Date(valA as string).getTime() - new Date(valB as string).getTime()
                : new Date(valB as string).getTime() - new Date(valA as string).getTime();
        }
        
        return sortConfig.direction === 'ascending' 
          ? String(valA).localeCompare(String(valB), language) 
          : String(valB).localeCompare(String(valA), language);
      });
    }
    return sortableItems;
  }, [accessories, sortConfig, language]);


  const openAddModal = () => {
    setEditingAccessory({ entryDate: new Date().toISOString().split('T')[0], quantity:0, unitPrice:0 });
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Accessory) => {
    setEditingAccessory(acc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccessory(null);
  };

  const handleSave = () => {
    if (!editingAccessory || !editingAccessory.accessoryCode?.trim() || !editingAccessory.name?.trim() || (editingAccessory.quantity || 0) <=0 || (editingAccessory.unitPrice || 0) <=0 ) {
        alert(t('accessoryFieldsRequired'));
        return;
    }
    const accessoryData = {
        ...editingAccessory,
        totalCost: (editingAccessory.quantity || 0) * (editingAccessory.unitPrice || 0)
    } as Accessory;

    if (editingAccessory.id) {
        setAccessories(accessories.map(p => p.id === editingAccessory.id ? accessoryData : p));
    } else {
        setAccessories([{ ...accessoryData, id: generateUniqueId() }, ...accessories]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('areYouSureDelete'))) {
        setAccessories(accessories.filter(p => p.id !== id));
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setEditingAccessory(prev => ({...prev, [name]: (name === 'quantity' || name === 'unitPrice') ? parseFloat(value) || 0 : value }));
  };

  const columns: Column<Accessory>[] = [
    { header: 'entryDate', accessor: (item) => formatDate(item.entryDate, language), sortKey: 'entryDate'},
    { header: 'accessoryCode', accessor: 'accessoryCode', className: "font-semibold", sortKey: 'accessoryCode' },
    { header: 'accessoryName', accessor: 'name', sortKey: 'name' },
    { header: 'productCodeUsed', accessor: 'productCodeUsed', sortKey: 'productCodeUsed' },
    { header: 'supplier', accessor: (item) => mockSuppliers.find(s=>s.id === item.supplierId)?.name || item.supplierId, sortKey: 'supplierId' }, 
    { header: 'quantity', accessor: 'quantity', sortKey: 'quantity' },
    { header: 'unitPrice', accessor: (item) => formatCurrency(item.unitPrice, 'VND'), sortKey: 'unitPrice' },
    { header: 'totalCost', accessor: (item) => formatCurrency(item.totalCost || (item.quantity * item.unitPrice) , 'VND'), sortKey: 'totalCost' },
    { header: 'notes', accessor: 'notes', sortKey: 'notes'},
    {
      header: 'actions',
      accessor: 'id',
      render: (item: Accessory) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} title={t('edit')}><PencilIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title={t('delete')} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <Card title={t('accessoriesManagement')} actions={
        <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />}>{t('addAccessory')}</Button>
    }>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        {t('accessoriesManagementDescription')}
      </p>
      {/* TODO: Add filters for date, code, name, supplier */}
      <Table 
        columns={columns} 
        data={sortedAccessories} 
        sortConfig={sortConfig}
        requestSort={requestSort}
      />
      {isModalOpen && editingAccessory && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingAccessory.id ? t('editAccessory') : t('addAccessory')}
            footer={<><Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button><Button onClick={handleSave}>{t('save')}</Button></>}
            size="lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('entryDate')} name="entryDate" type="date" value={editingAccessory.entryDate?.split('T')[0] || ''} onChange={handleInputChange} required />
                <Input label={t('accessoryCode')} name="accessoryCode" value={editingAccessory.accessoryCode || ''} onChange={handleInputChange} required />
                <Input label={t('accessoryName')} name="name" value={editingAccessory.name || ''} onChange={handleInputChange} required />
                <Select label={t('productCodeUsed')} name="productCodeUsed" value={editingAccessory.productCodeUsed || ''} onChange={handleInputChange} options={[{value:'', label: t('select') + '...'}, ...productOptions]} />
                <Select label={t('supplier')} name="supplierId" value={editingAccessory.supplierId || ''} onChange={handleInputChange} options={[{value:'', label: t('select') + '...'}, ...supplierOptions]} required/>
                <Input label={t('quantity')} name="quantity" type="number" value={String(editingAccessory.quantity || 0)} onChange={handleInputChange} required min="1"/>
                <Input label={t('unitPrice')} name="unitPrice" type="number" value={String(editingAccessory.unitPrice || 0)} onChange={handleInputChange} required min="0"/>
                <Input label={t('notes')} name="notes" value={editingAccessory.notes || ''} onChange={handleInputChange} wrapperClassName="md:col-span-2" />
            </div>
          </Modal>
      )}
    </Card>
  );
};

export default AccessoriesManagementPage;
