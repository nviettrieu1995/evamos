import React, { useState, useMemo } from 'react';
import { Invoice } from '../types';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table, { Column } from '../../components/ui/Table';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { generateUniqueId, formatDate } from '../../utils/helpers';
import { initialCustomers } from '../../data/initialCustomers';

const mockSuppliers = [ {id: 'sup1', name: 'NCC Vải ABC'}, {id: 'sup2', name: 'Công ty Phụ Liệu XYZ'}];


const initialInvoices: Invoice[] = [
    {id: 'inv1', invoiceNumber: 'HDM001', creationDate: '2024-07-01', dueDate: '2024-07-15', type: 'purchase', partyId: 'sup1', partyName: 'NCC Vải ABC', totalAmount: 30000000, amountPaid: 30000000, status: 'paid', notes: 'Mua vải Cotton Lụa lô 1'},
    {id: 'inv2', invoiceNumber: 'HDB001', creationDate: '2024-07-05', dueDate: '2024-08-05', type: 'sale', partyId: initialCustomers[0].id, partyName: initialCustomers[0].name, totalAmount: 5400000, amountPaid: 0, status: 'unpaid', notes: 'Bán hàng váy 2029 (10 cái)'},
    {id: 'inv3', invoiceNumber: 'HDM002', creationDate: '2024-07-10', dueDate: '2024-07-25', type: 'purchase', partyId: 'sup2', partyName: 'Công ty Phụ Liệu XYZ', totalAmount: 1000000, amountPaid: 500000, status: 'partially_paid', notes: 'Mua cúc áo'},
];

const InvoiceManagementPage: React.FC = () => {
  const { t, formatCurrency, language } = useLocalization();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Partial<Invoice> | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: 'invoiceNumber', direction: 'ascending' });

  const partyOptions = [
      ...initialCustomers.map(c => ({value: `customer-${c.id}`, label: `${t('customer')}: ${c.name}`})),
      ...mockSuppliers.map(s => ({value: `supplier-${s.id}`, label: `${t('supplier')}: ${s.name}`})),
  ];
  const typeOptions = [
    { value: 'purchase', label: t('invoiceTypePurchase')},
    { value: 'sale', label: t('invoiceTypeSale')},
    { value: 'debt_payment', label: t('invoiceTypeDebtPayment')},
    { value: 'other', label: t('invoiceTypeOther')},
  ];
  const statusOptions = [
    { value: 'paid', label: t('invoiceStatusPaid')},
    { value: 'unpaid', label: t('invoiceStatusUnpaid')},
    { value: 'partially_paid', label: t('invoiceStatusPartiallyPaid')},
    { value: 'overdue', label: t('invoiceStatusOverdue')},
  ];

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedInvoices = useMemo(() => {
    let sortableItems = [...invoices];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Invoice];
        const valB = b[sortConfig.key as keyof Invoice];

        if (valA === null || valA === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (valB === null || valB === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        
        if (['totalAmount', 'amountPaid'].includes(sortConfig.key!)) {
            const numA = Number(valA);
            const numB = Number(valB);
            return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
        }
        if (['creationDate', 'dueDate'].includes(sortConfig.key!) && valA && valB) {
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
  }, [invoices, sortConfig, language]);


  const openAddModal = () => {
    setEditingInvoice({ creationDate: new Date().toISOString().split('T')[0], type: 'purchase', status: 'unpaid', totalAmount: 0, amountPaid: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (inv: Invoice) => {
    setEditingInvoice(inv);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInvoice(null);
  };

  const handleSave = () => {
    if (!editingInvoice || !editingInvoice.invoiceNumber?.trim() || !editingInvoice.partyId || (editingInvoice.totalAmount || 0) <=0 ) {
        alert(t('invoiceFieldsRequired'));
        return;
    }
    const partyInfo = partyOptions.find(p => p.value === editingInvoice.partyId);
    const invoiceData = { 
        ...editingInvoice,
        partyName: partyInfo ? partyInfo.label.substring(partyInfo.label.indexOf(': ') + 2) : 'N/A' 
    } as Invoice;

    if (editingInvoice.id) {
        setInvoices(invoices.map(p => p.id === editingInvoice.id ? invoiceData : p));
    } else {
        setInvoices([{ ...invoiceData, id: generateUniqueId() }, ...invoices]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('areYouSureDelete'))) {
        setInvoices(invoices.filter(p => p.id !== id));
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setEditingInvoice(prev => ({...prev, [name]: (name === 'totalAmount' || name === 'amountPaid') ? parseFloat(value) || 0 : value }));
  };

  const columns: Column<Invoice>[] = [
    { header: 'invoiceNumber', accessor: 'invoiceNumber', className: "font-semibold", sortKey: 'invoiceNumber' },
    { header: 'creationDate', accessor: (item) => formatDate(item.creationDate, language), sortKey: 'creationDate'},
    { header: 'dueDate', accessor: (item) => item.dueDate ? formatDate(item.dueDate, language) : '-', sortKey: 'dueDate' },
    { header: 'invoiceType', accessor: (item) => typeOptions.find(opt => opt.value === item.type)?.label || item.type, sortKey: 'type'},
    { header: 'invoiceParty', accessor: 'partyName', sortKey: 'partyName' },
    { header: 'invoiceTotalAmount', accessor: (item) => formatCurrency(item.totalAmount, 'VND'), sortKey: 'totalAmount' }, 
    { header: 'invoiceAmountPaid', accessor: (item) => formatCurrency(item.amountPaid || 0, 'VND'), sortKey: 'amountPaid' },
    { header: 'invoiceStatus', accessor: (item) => statusOptions.find(opt => opt.value === item.status)?.label || item.status, sortKey: 'status' },
    { header: 'notes', accessor: 'notes', sortKey: 'notes'},
    {
      header: 'actions',
      accessor: 'id',
      render: (item: Invoice) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} title={t('edit')}><PencilIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title={t('delete')} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <Card title={t('invoiceManagement')} actions={
        <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />}>{t('addInvoice')}</Button>
    }>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        {t('invoiceManagementDescription')}
      </p>
      {/* TODO: Add filters for date, type, party, status */}
      <Table 
        columns={columns} 
        data={sortedInvoices} 
        sortConfig={sortConfig}
        requestSort={requestSort}
      />
      {isModalOpen && editingInvoice && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingInvoice.id ? t('editInvoice') : t('addInvoice')}
            footer={<><Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button><Button onClick={handleSave}>{t('save')}</Button></>}
            size="xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input label={t('invoiceNumber')} name="invoiceNumber" value={editingInvoice.invoiceNumber || ''} onChange={handleInputChange} required />
                <Input label={t('creationDate')} name="creationDate" type="date" value={editingInvoice.creationDate?.split('T')[0] || ''} onChange={handleInputChange} required />
                <Input label={t('dueDate')} name="dueDate" type="date" value={editingInvoice.dueDate?.split('T')[0] || ''} onChange={handleInputChange} />
                <Select label={t('invoiceType')} name="type" value={editingInvoice.type || 'purchase'} onChange={handleInputChange} options={typeOptions} required/>
                <Select label={t('invoiceParty')} name="partyId" value={editingInvoice.partyId || ''} onChange={handleInputChange} options={[{value:'', label: t('select') + '...'}, ...partyOptions]} required/>
                <Input label={t('invoiceTotalAmount')} name="totalAmount" type="number" value={String(editingInvoice.totalAmount || 0)} onChange={handleInputChange} required min="0"/>
                <Input label={t('invoiceAmountPaid')} name="amountPaid" type="number" value={String(editingInvoice.amountPaid || 0)} onChange={handleInputChange} min="0"/>
                <Select label={t('invoiceStatus')} name="status" value={editingInvoice.status || 'unpaid'} onChange={handleInputChange} options={statusOptions} required/>
                <Input label={t('notes')} name="notes" value={editingInvoice.notes || ''} onChange={handleInputChange} wrapperClassName="lg:col-span-3" />
            </div>
          </Modal>
      )}
    </Card>
  );
};

export default InvoiceManagementPage;
