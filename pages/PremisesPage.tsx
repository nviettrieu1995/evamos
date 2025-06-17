
import React, { useState } from 'react';
import { Premises } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Table, { Column } from '../components/ui/Table'; // Import Column type
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Changed path
import { generateUniqueId } from '../utils/helpers';

const initialPremisesData: Premises[] = [
    {id: 'p1', location: 'Xưởng Chính, Quận 1', rentCost: 50000000, area: 500, electricityWaterCost: 5000000, livingCost: 2000000, workerSuppliesCost: 3000000},
    {id: 'p2', location: 'Kho Phụ, Quận 2', rentCost: 20000000, area: 200, electricityWaterCost: 1500000, livingCost: 0, workerSuppliesCost: 500000},
];

const PremisesPage: React.FC = () => {
  const { t, formatCurrency } = useLocalization();
  const [premisesList, setPremisesList] = useState<Premises[]>(initialPremisesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPremises, setEditingPremises] = useState<Partial<Premises> | null>(null);

  const openAddModal = () => {
    setEditingPremises({ location: '', rentCost: 0, area: 0, electricityWaterCost: 0, livingCost: 0, workerSuppliesCost: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (premises: Premises) => {
    setEditingPremises(premises);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPremises(null);
  };

  const handleSave = () => {
    if (!editingPremises || !editingPremises.location?.trim()) {
        alert(t('locationRequired') || "Location is required.");
        return;
    }
    if (editingPremises.id) {
        setPremisesList(premisesList.map(p => p.id === editingPremises.id ? editingPremises as Premises : p));
    } else {
        setPremisesList([{ ...editingPremises, id: generateUniqueId() } as Premises, ...premisesList]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('areYouSureDelete'))) {
        setPremisesList(premisesList.filter(p => p.id !== id));
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setEditingPremises(prev => ({...prev, [name]: name === 'location' ? value : parseFloat(value) || 0 }));
  };


  const columns: Column<Premises>[] = [
    { header: 'location', accessor: 'location', className: "font-semibold" },
    { header: 'rentCost', accessor: (item) => formatCurrency(item.rentCost, 'VND') },
    { header: 'area', accessor: (item) => `${item.area} m²` },
    { header: 'utilitiesCost', accessor: (item) => formatCurrency(item.electricityWaterCost, 'VND') },
    { header: 'livingCost', accessor: (item) => formatCurrency(item.livingCost, 'VND') },
    { header: 'workerSuppliesCost', accessor: (item) => formatCurrency(item.workerSuppliesCost, 'VND') },
    {
      header: 'actions',
      accessor: 'id',
      render: (item: Premises) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} title={t('edit')}><PencilIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title={t('delete')} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <Card title={t('premisesManagement')} actions={
        <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />}>{t('addPremises')}</Button>
    }>
      <Table columns={columns} data={premisesList} />
      {isModalOpen && editingPremises && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPremises.id ? t('editPremises') : t('addPremises')}
            footer={<><Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button><Button onClick={handleSave}>{t('save')}</Button></>}
            size="lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('location')} name="location" value={editingPremises.location || ''} onChange={handleInputChange} required />
                <Input label={t('rentCost')} name="rentCost" type="number" value={String(editingPremises.rentCost || 0)} onChange={handleInputChange} required />
                <Input label={t('area')} name="area" type="number" value={String(editingPremises.area || 0)} onChange={handleInputChange} />
                <Input label={t('utilitiesCost')} name="electricityWaterCost" type="number" value={String(editingPremises.electricityWaterCost || 0)} onChange={handleInputChange} />
                <Input label={t('livingCost')} name="livingCost" type="number" value={String(editingPremises.livingCost || 0)} onChange={handleInputChange} />
                <Input label={t('workerSuppliesCost')} name="workerSuppliesCost" type="number" value={String(editingPremises.workerSuppliesCost || 0)} onChange={handleInputChange} />
            </div>
          </Modal>
      )}
    </Card>
  );
};

// Add to locales.ts
// vi: { locationRequired: 'Địa điểm là bắt buộc.' }
// ru: { locationRequired: 'Местоположение обязательно.' }


export default PremisesPage;