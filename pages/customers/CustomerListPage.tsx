import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer, Currency } from '../../types';
import { initialCustomers } from '../../data/initialCustomers';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table, { Column } from '../../components/ui/Table'; 
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'; 
import { generateUniqueId, exportToExcel, printData, debounce } from '../../utils/helpers';

const CustomerListPage: React.FC = () => {
  const { t, formatCurrency, language } = useLocalization();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingCustomer) {
      setEditingCustomer({
        ...editingCustomer,
        [name]: name === 'totalDebt' || name === 'remainingDeposit' ? parseFloat(value) || 0 : value,
      });
    }
  };

  const debouncedSearch = useCallback(debounce((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), [language]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredCustomers = useMemo(() => {
    let sortableItems = [...customers].filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shopNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Customer];
        const valB = b[sortConfig.key as keyof Customer];

        if (valA === null || valA === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (valB === null || valB === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        return sortConfig.direction === 'ascending' 
          ? String(valA).localeCompare(String(valB), language) 
          : String(valB).localeCompare(String(valA), language);
      });
    }
    return sortableItems;
  }, [customers, searchTerm, sortConfig, language]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredCustomers.length / itemsPerPage);

  const openAddModal = () => {
    setEditingCustomer({ id: '', name: '', building: '', shopNumber: '', totalDebt: 0, debtCurrency: 'RUB', remainingDeposit: 0, phone: '', notes: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSaveCustomer = () => {
    if (!editingCustomer || !editingCustomer.name.trim() || !editingCustomer.shopNumber.trim()) {
      alert(t('invalidCustomerData'));
      return;
    }
    if (editingCustomer.id) { 
      setCustomers(customers.map(c => c.id === editingCustomer.id ? editingCustomer : c));
    } else { 
      setCustomers([{ ...editingCustomer, id: generateUniqueId() }, ...customers]);
    }
    closeModal();
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm(t('areYouSureDelete'))) {
      setCustomers(customers.filter(c => c.id !== customerId));
    }
  };

  const handleViewDetails = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };

  const columns: Column<Customer>[] = [
    { header: 'customerName', accessor: 'name', className: "font-semibold", sortKey: 'name' },
    { header: 'customerLocation', accessor: 'building', sortKey: 'building' },
    { header: 'customerShop', accessor: 'shopNumber', sortKey: 'shopNumber' },
    { header: 'customerPhone', accessor: 'phone', sortKey: 'phone' },
    { header: 'totalDebt', accessor: (item: Customer) => formatCurrency(item.totalDebt, item.debtCurrency || 'RUB'), sortKey: 'totalDebt' },
    { header: 'remainingDeposit', accessor: (item: Customer) => formatCurrency(item.remainingDeposit || 0, item.debtCurrency || 'RUB'), sortKey: 'remainingDeposit' },
    { header: 'notes', accessor: 'notes', sortKey: 'notes' },
    {
      header: 'actions',
      accessor: 'id',
      render: (item: Customer) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(item);}} title={t('viewDetails')}>
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(item);}} title={t('edit')}>
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(item.id);}} title={t('delete')} className="text-red-500 hover:text-red-700">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card title={t('customerList')} 
      actions={
        <div className="flex space-x-2">
          <Button onClick={() => exportToExcel(sortedAndFilteredCustomers, 'customers')} variant="outline" size="sm">{t('exportExcel')}</Button>
          <Button onClick={printData} variant="outline" size="sm">{t('print')}</Button>
          <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />} size="sm">{t('addCustomer')}</Button>
        </div>
      }>
      <div className="mb-4">
        <Input 
          placeholder={t('search') + ' ' + t('customerName') + ', ' + t('customerShop') + '...'} 
          onChange={(e) => debouncedSearch(e.target.value)}
        />
      </div>

      <Table 
        columns={columns} 
        data={paginatedCustomers} 
        onRowClick={handleViewDetails} 
        sortConfig={sortConfig}
        requestSort={requestSort}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <Button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>Previous</Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>Next</Button>
        </div>
      )}

      {isModalOpen && editingCustomer && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCustomer.id ? t('editCustomer') : t('addCustomer')}
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button>
              <Button onClick={handleSaveCustomer}>{t('save')}</Button>
            </>
          }
           size="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('customerName')} name="name" value={editingCustomer.name} onChange={handleInputChange} required />
            <Input label={t('customerLocation')} name="building" value={editingCustomer.building} onChange={handleInputChange} />
            <Input label={t('customerShop')} name="shopNumber" value={editingCustomer.shopNumber} onChange={handleInputChange} required />
            <Input label={t('customerPhone')} name="phone" value={editingCustomer.phone || ''} onChange={handleInputChange} />
            <Input label={t('totalDebt')} name="totalDebt" type="number" value={String(editingCustomer.totalDebt)} onChange={handleInputChange} />
            <Input label={t('remainingDeposit')} name="remainingDeposit" type="number" value={String(editingCustomer.remainingDeposit)} onChange={handleInputChange} />
            <Input label={t('notes')} name="notes" value={editingCustomer.notes || ''} onChange={handleInputChange} wrapperClassName="md:col-span-2" />
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default CustomerListPage;
