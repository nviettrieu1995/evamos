
import React, { useState } from 'react';
import { ProductionPlan } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table, { Column } from '../components/ui/Table'; // Import Column type
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Changed path
import { generateUniqueId, formatDate } from '../utils/helpers';
import { initialProducts } from '../data/initialProducts';
import { initialCustomers } from '../data/initialCustomers';


const ProductionPlanningPage: React.FC = () => {
  const { t, language } = useLocalization();
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<ProductionPlan> | null>(null);

   const productOptions = initialProducts.map(p => ({ value: p.productCode, label: `${p.productCode} - ${p.description || t('noDescription')}`}));
   const customerOptions = initialCustomers.map(c => ({ value: c.id, label: c.name }));
   const statusOptions = [
     { value: 'pending', label: t('statusPending') },
     { value: 'assigned', label: t('statusAssigned') },
     { value: 'completed', label: t('statusCompleted') },
     { value: 'on_hold', label: t('statusOnHold') },
   ];
   const priorityOptions = [
     { value: 'high', label: t('priorityHigh') },
     { value: 'medium', label: t('priorityMedium') },
     { value: 'low', label: t('priorityLow') },
   ];


  const openAddModal = () => {
    setEditingPlan({ 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Default 1 week later
        status: 'pending', 
        priority: 'medium',
        quantity: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: ProductionPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSave = () => {
    if (!editingPlan || !editingPlan.productCode || !editingPlan.customer || (editingPlan.quantity || 0) <= 0) {
        alert(t('planFieldsRequired') || "Product, customer, and quantity are required.");
        return;
    }
    const planData = {
        productName: initialProducts.find(p => p.productCode === editingPlan.productCode)?.description || editingPlan.productCode,
        planner: 'Current User', // Placeholder for actual user
        ...editingPlan
    } as ProductionPlan;

    if (editingPlan.id) {
        setPlans(plans.map(p => p.id === editingPlan.id ? planData : p));
    } else {
        setPlans([{ ...planData, id: generateUniqueId() }, ...plans]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('areYouSureDelete'))) {
        setPlans(plans.filter(p => p.id !== id));
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setEditingPlan(prev => ({...prev, [name]: name === 'quantity' ? parseInt(value) || 0 : value }));
  };

  const columns: Column<ProductionPlan>[] = [
    { header: 'productCode', accessor: 'productCode', className: "font-semibold" },
    { header: 'productName', accessor: 'productName' },
    { header: 'customer', accessor: (item) => initialCustomers.find(c => c.id === item.customer)?.name || item.customer },
    { header: 'quantityToProduce', accessor: 'quantity' },
    { header: 'startDate', accessor: (item) => formatDate(item.startDate, language) },
    { header: 'endDate', accessor: (item) => formatDate(item.endDate, language) },
    { header: 'status', accessor: (item) => t(`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`) || item.status },
    { header: 'priority', accessor: (item) => t(`priority${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}`) || item.priority },
    {
      header: 'actions',
      accessor: 'id',
      render: (item: ProductionPlan) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} title={t('edit')}><PencilIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title={t('delete')} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <Card title={t('productionPlanning')} actions={
        <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />}>{t('addProductionPlan')}</Button>
    }>
      {/* TODO: Add filters for date, product, customer, priority, status */}
      <Table columns={columns} data={plans} />
      {isModalOpen && editingPlan && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPlan.id ? t('editProductionPlan') : t('addProductionPlan')}
            footer={<><Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button><Button onClick={handleSave}>{t('save')}</Button></>}
            size="xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select label={t('productCode')} name="productCode" value={editingPlan.productCode || ''} onChange={handleInputChange} options={[{value: '', label: t('selectProduct') || 'Select Product'}, ...productOptions]} required />
                <Select label={t('customer')} name="customer" value={editingPlan.customer || ''} onChange={handleInputChange} options={[{value: '', label: t('selectCustomer') || 'Select Customer'},...customerOptions]} required />
                <Input label={t('quantityToProduce')} name="quantity" type="number" value={String(editingPlan.quantity || 0)} onChange={handleInputChange} required min="1"/>
                <Input label={t('startDate')} name="startDate" type="date" value={editingPlan.startDate?.split('T')[0] || ''} onChange={handleInputChange} required />
                <Input label={t('endDate')} name="endDate" type="date" value={editingPlan.endDate?.split('T')[0] || ''} onChange={handleInputChange} required />
                <Select label={t('status')} name="status" value={editingPlan.status || 'pending'} onChange={handleInputChange} options={statusOptions} required />
                <Select label={t('priority')} name="priority" value={editingPlan.priority || 'medium'} onChange={handleInputChange} options={priorityOptions} required />
                <Input label={t('notes')} name="notes" value={editingPlan.notes || ''} onChange={handleInputChange} wrapperClassName="lg:col-span-3" />
            </div>
          </Modal>
      )}
    </Card>
  );
};

// Add to locales.ts
// vi: { planFieldsRequired: 'Sản phẩm, khách hàng và số lượng là bắt buộc.', editProductionPlan: 'Sửa KHSX', selectProduct: 'Chọn sản phẩm', selectCustomer: 'Chọn khách hàng', noDescription: 'Không có mô tả' }
// ru: { planFieldsRequired: 'Продукт, клиент и количество обязательны.', editProductionPlan: 'Изменить план производства', selectProduct: 'Выберите продукт', selectCustomer: 'Выберите клиента', noDescription: 'Нет описания' }

export default ProductionPlanningPage;