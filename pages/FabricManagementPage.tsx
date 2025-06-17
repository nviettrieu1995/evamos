import React, { useState, useMemo } from 'react';
import { Fabric } from '../types';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select'; 
import Table, { Column } from '../../components/ui/Table';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { generateUniqueId, formatDate } from '../../utils/helpers';
import { initialProducts } from '../data/initialProducts';
const mockSuppliers = [ {id: 'sup1', name: 'NCC Vải A'}, {id: 'sup2', name: 'NCC Vải B'}];


const initialFabrics: Fabric[] = [
    {id: 'fb1', entryDate: '2024-06-20', fabricType: 'Cotton Lụa', color: 'Trắng', productCodeUsed: '2029', supplierId: 'sup1', quantity: 200, unitPrice: 150000, totalCost: 30000000, notes: 'Vải may váy 2029'},
    {id: 'fb2', entryDate: '2024-06-25', fabricType: 'Kate Mỹ', color: 'Xanh Navy', productCodeUsed: '1989', supplierId: 'sup2', quantity: 150, unitPrice: 120000, totalCost: 18000000, notes: 'Vải may quần 1989'},
];

const FabricManagementPage: React.FC = () => {
  const { t, formatCurrency, language } = useLocalization();
  const [fabrics, setFabrics] = useState<Fabric[]>(initialFabrics);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<Partial<Fabric> | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: 'fabricType', direction: 'ascending' });

  const productOptions = initialProducts.map(p => ({ value: p.productCode, label: `${p.productCode} - ${p.description || t('noDescription')}`}));
  const supplierOptions = mockSuppliers.map(s => ({ value: s.id, label: s.name }));

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedFabrics = useMemo(() => {
    let sortableItems = [...fabrics];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Fabric];
        const valB = b[sortConfig.key as keyof Fabric];

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
  }, [fabrics, sortConfig, language]);


  const openAddModal = () => {
    setEditingFabric({ entryDate: new Date().toISOString().split('T')[0], quantity:0, unitPrice:0 });
    setIsModalOpen(true);
  };

  const openEditModal = (fab: Fabric) => {
    setEditingFabric(fab);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFabric(null);
  };

  const handleSave = () => {
    if (!editingFabric || !editingFabric.fabricType?.trim() || (editingFabric.quantity || 0) <=0 || (editingFabric.unitPrice || 0) <=0 ) {
        alert(t('fabricFieldsRequired'));
        return;
    }
    const fabricData = {
        ...editingFabric,
        totalCost: (editingFabric.quantity || 0) * (editingFabric.unitPrice || 0)
    } as Fabric;

    if (editingFabric.id) {
        setFabrics(fabrics.map(p => p.id === editingFabric.id ? fabricData : p));
    } else {
        setFabrics([{ ...fabricData, id: generateUniqueId() }, ...fabrics]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('areYouSureDelete'))) {
        setFabrics(fabrics.filter(p => p.id !== id));
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setEditingFabric(prev => ({...prev, [name]: (name === 'quantity' || name === 'unitPrice') ? parseFloat(value) || 0 : value }));
  };

  const columns: Column<Fabric>[] = [
    { header: 'entryDate', accessor: (item) => formatDate(item.entryDate, language), sortKey: 'entryDate'},
    { header: 'fabricType', accessor: 'fabricType', className: "font-semibold", sortKey: 'fabricType' },
    { header: 'fabricColor', accessor: 'color', sortKey: 'color' },
    { header: 'productCodeUsed', accessor: 'productCodeUsed', sortKey: 'productCodeUsed' },
    { header: 'supplier', accessor: (item) => mockSuppliers.find(s=>s.id === item.supplierId)?.name || item.supplierId, sortKey: 'supplierId' },
    { header: 'quantity', accessor: (item) => `${item.quantity} (m/kg)`, sortKey: 'quantity' }, 
    { header: 'unitPrice', accessor: (item) => formatCurrency(item.unitPrice, 'VND'), sortKey: 'unitPrice' },
    { header: 'totalCost', accessor: (item) => formatCurrency(item.totalCost || (item.quantity * item.unitPrice) , 'VND'), sortKey: 'totalCost' },
    { header: 'notes', accessor: 'notes', sortKey: 'notes'},
    {
      header: 'actions',
      accessor: 'id',
      render: (item: Fabric) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} title={t('edit')}><PencilIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title={t('delete')} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <Card title={t('fabricManagement')} actions={
        <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />}>{t('addFabric')}</Button>
    }>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        {t('fabricManagementDescription')}
      </p>
      {/* TODO: Add filters for date, type, color, supplier */}
      <Table 
        columns={columns} 
        data={sortedFabrics} 
        sortConfig={sortConfig}
        requestSort={requestSort}
      />
      {isModalOpen && editingFabric && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingFabric.id ? t('editFabric') : t('addFabric')}
            footer={<><Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button><Button onClick={handleSave}>{t('save')}</Button></>}
            size="lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('entryDate')} name="entryDate" type="date" value={editingFabric.entryDate?.split('T')[0] || ''} onChange={handleInputChange} required />
                <Input label={t('fabricType')} name="fabricType" value={editingFabric.fabricType || ''} onChange={handleInputChange} required />
                <Input label={t('fabricColor')} name="color" value={editingFabric.color || ''} onChange={handleInputChange} />
                <Select label={t('productCodeUsed')} name="productCodeUsed" value={editingFabric.productCodeUsed || ''} onChange={handleInputChange} options={[{value:'', label: t('select') + '...'}, ...productOptions]} />
                <Select label={t('supplier')} name="supplierId" value={editingFabric.supplierId || ''} onChange={handleInputChange} options={[{value:'', label: t('select') + '...'}, ...supplierOptions]} required/>
                <Input label={t('quantity')} name="quantity" type="number" value={String(editingFabric.quantity || 0)} onChange={handleInputChange} required min="1"/>
                <Input label={t('unitPrice')} name="unitPrice" type="number" value={String(editingFabric.unitPrice || 0)} onChange={handleInputChange} required min="0"/>
                <Input label={t('notes')} name="notes" value={editingFabric.notes || ''} onChange={handleInputChange} wrapperClassName="md:col-span-2" />
            </div>
          </Modal>
      )}
    </Card>
  );
};

export default FabricManagementPage;
