
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Customer, Transaction, Currency, TransactionType, Product } from '../../types';
import { initialCustomers } from '../../data/initialCustomers'; 
import { initialProducts } from '../../data/initialProducts'; // For product selection
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table'; 
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { formatDate, generateUniqueId } from '../../utils/helpers';

// Mock function to get customer, replace with API call or context
const getCustomerById = (id: string): Customer | undefined => {
  const customer = initialCustomers.find(c => c.id === id);
  if (customer && !customer.transactions) { 
    customer.transactions = [
        { id: generateUniqueId(), date: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'shipment', description: 'Lên hàng mã 2029 (50 cái)', amount: 27000, debtBefore: 10000, debtAfter: 37000, depositDeducted: 0, productCode: '2029', customerPriceForShipment: 540 },
        { id: generateUniqueId(), date: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'payment', description: 'Thanh toán tiền mặt', amount: 20000, paymentMethod: 'cash', debtBefore: 37000, debtAfter: 17000 },
        { id: generateUniqueId(), date: new Date(Date.now() - 86400000 * 1).toISOString(), type: 'deposit', description: 'Cọc thêm cho mã 1989', amount: 5000, paymentMethod: 'card', debtBefore: 17000, debtAfter: 17000, depositChange: 5000, productCode: '1989', shipmentDate: new Date(Date.now() + 86400000 * 7).toISOString() },
    ];
  }
  return customer;
};

const CustomerDetailPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { t, formatCurrency, language } = useLocalization();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0], 
    type: 'payment',
    amount: 0,
  });

  useEffect(() => {
    if (customerId) {
      const fetchedCustomer = getCustomerById(customerId);
      if (fetchedCustomer) {
        setCustomer(fetchedCustomer);
        setNewTransaction(prev => ({ ...prev, debtBefore: fetchedCustomer.totalDebt }));
      } else {
        navigate('/404'); 
      }
    }
  }, [customerId, navigate]);

  const productOptions = initialProducts.map(p => ({
    value: p.productCode,
    label: `${p.productCode} - ${p.description || t('noDescription')}`
  }));

  const handleTxInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let val: string | number | undefined = value;
    if (['amount', 'depositDeducted', 'depositChange', 'customerPriceForShipment'].includes(name)) {
        val = parseFloat(value) || 0;
    }
    
    setNewTransaction(prev => {
        const updatedTx = {...prev, [name]: val};
        // Auto-fill customerPriceForShipment if productCode changes for 'shipment' type
        if (name === 'productCode' && updatedTx.type === 'shipment') {
            const selectedProduct = initialProducts.find(p => p.productCode === value);
            updatedTx.customerPriceForShipment = selectedProduct?.customerPrice || 0;
        }
        return updatedTx;
    });
  };

  const calculateDebtAfter = (currentDebt: number, tx: Partial<Transaction>): number => {
    if (tx.amount === undefined) return currentDebt;
    let debtAfter = currentDebt;
    if (tx.type === 'shipment') debtAfter += tx.amount; // amount here is total value of shipped goods
    else if (tx.type === 'payment') debtAfter -= tx.amount;
    
    if (tx.type === 'shipment' && tx.depositDeducted && tx.depositDeducted > 0) {
      debtAfter -= tx.depositDeducted; 
    }
    return debtAfter;
  };
  
  const debtAfterTransaction = useMemo(() => {
    // For shipment, 'amount' should be quantity * customerPriceForShipment
    let transactionAmount = newTransaction.amount || 0;
    if (newTransaction.type === 'shipment' && newTransaction.customerPriceForShipment) {
        // Assume 'amount' field in modal is for quantity when type is shipment
        transactionAmount = (newTransaction.amount || 0) * (newTransaction.customerPriceForShipment || 0);
    }

    return calculateDebtAfter(newTransaction.debtBefore || customer?.totalDebt || 0, {...newTransaction, amount: transactionAmount});
  }, [newTransaction, customer?.totalDebt]);


  const handleSaveTransaction = () => {
    if (!customer || !newTransaction.type || newTransaction.amount === undefined || !newTransaction.description) {
      alert(t('invalidTransactionData'));
      return;
    }

    let finalAmount = newTransaction.amount || 0;
    if (newTransaction.type === 'shipment') {
        finalAmount = (newTransaction.amount || 0) * (newTransaction.customerPriceForShipment || 0);
    }


    const finalTransaction: Transaction = {
      id: generateUniqueId(),
      date: newTransaction.date || new Date().toISOString(),
      type: newTransaction.type as TransactionType,
      description: newTransaction.description,
      amount: finalAmount, 
      paymentMethod: newTransaction.paymentMethod,
      depositDeducted: newTransaction.depositDeducted,
      depositChange: newTransaction.depositChange,
      debtBefore: newTransaction.debtBefore || customer.totalDebt,
      debtAfter: debtAfterTransaction,
      productCode: newTransaction.productCode,
      shipmentDate: newTransaction.shipmentDate,
      customerPriceForShipment: newTransaction.customerPriceForShipment,
    };
    
    const updatedCustomer = { ...customer };
    updatedCustomer.transactions = [...(customer.transactions || []), finalTransaction].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    updatedCustomer.totalDebt = finalTransaction.debtAfter;
    if (finalTransaction.type === 'deposit' && finalTransaction.depositChange) {
        updatedCustomer.remainingDeposit = (updatedCustomer.remainingDeposit || 0) + finalTransaction.depositChange;
    }
    if (finalTransaction.type === 'shipment' && finalTransaction.depositDeducted) {
        updatedCustomer.remainingDeposit = (updatedCustomer.remainingDeposit || 0) - finalTransaction.depositDeducted;
    }

    setCustomer(updatedCustomer);
    const customerIndex = initialCustomers.findIndex(c => c.id === customer.id);
    if(customerIndex > -1) initialCustomers[customerIndex] = updatedCustomer;

    setIsTxModalOpen(false);
    setNewTransaction({ date: new Date().toISOString().split('T')[0], type: 'payment', amount: 0, debtBefore: updatedCustomer.totalDebt });
  };

  const transactionTypeOptions: {value: TransactionType, label: string}[] = [
    { value: 'payment', label: t('txTypePayment')},
    { value: 'deposit', label: t('txTypeDeposit')},
    { value: 'shipment', label: t('txTypeShipment')},
  ];

  const transactionColumns: Column<Transaction>[] = [
    { header: 'transactionDate', accessor: (item) => formatDate(item.date, language) },
    { header: 'transactionType', accessor: (item) => transactionTypeOptions.find(opt => opt.value === item.type)?.label || item.type },
    { header: 'transactionDesc', accessor: 'description', className: "min-w-[200px]" },
    { header: 'productCode', accessor: 'productCode'},
    { 
      header: 'customerPriceHeader', // Using a generic 'customerPrice' or specific 'customerPriceForShipment' key
      accessor: (item) => item.type === 'shipment' && item.customerPriceForShipment 
                          ? formatCurrency(item.customerPriceForShipment, customer?.debtCurrency || 'RUB') 
                          : '-' 
    },
    { header: 'transactionAmount', accessor: (item) => formatCurrency(item.amount, customer?.debtCurrency || 'RUB') },
    { header: 'paymentMethod', accessor: (item) => item.paymentMethod ? t(item.paymentMethod === 'cash' ? 'paymentCash' : 'paymentCard') : '-' },
    { header: 'depositDeducted', accessor: (item) => item.depositDeducted ? formatCurrency(item.depositDeducted, customer?.debtCurrency || 'RUB') : '-' },
    { header: 'depositChange', accessor: (item) => item.depositChange ? formatCurrency(item.depositChange, customer?.debtCurrency || 'RUB') : '-' },
    { header: 'debtBefore', accessor: (item) => formatCurrency(item.debtBefore, customer?.debtCurrency || 'RUB') },
    { header: 'debtAfter', accessor: (item) => formatCurrency(item.debtAfter, customer?.debtCurrency || 'RUB') },
  ];
  

  if (!customer) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-300">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeftIcon className="h-5 w-5 mr-2" /> {t('backToList')}
      </Button>

      <Card title={`${t('customerDetails')}: ${customer.name}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <p><strong>{t('customerLocation')}:</strong> {customer.building}</p>
          <p><strong>{t('customerShop')}:</strong> {customer.shopNumber}</p>
          <p><strong>{t('customerPhone')}:</strong> {customer.phone || t('notAvailable')}</p>
          <p><strong>{t('notes')}:</strong> {customer.notes || t('notAvailable')}</p>
          <p className="text-lg font-semibold"><strong>{t('totalDebt')}:</strong> {formatCurrency(customer.totalDebt, customer.debtCurrency || 'RUB')}</p>
          <p className="text-lg font-semibold"><strong>{t('remainingDeposit')}:</strong> {formatCurrency(customer.remainingDeposit || 0, customer.debtCurrency || 'RUB')}</p>
        </div>
      </Card>

      <Card title={t('transactionHistory')} actions={
        <Button onClick={() => { 
            setNewTransaction({ date: new Date().toISOString().split('T')[0], type: 'payment', amount: 0, debtBefore: customer.totalDebt });
            setIsTxModalOpen(true);
        }} leftIcon={<PlusIcon className="h-5 w-5" />}>
          {t('addTransaction')}
        </Button>
      }>
        <Table columns={transactionColumns} data={customer.transactions?.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || []} />
      </Card>

      {isTxModalOpen && (
        <Modal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title={t('addTransaction')}
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsTxModalOpen(false)}>{t('cancel')}</Button>
              <Button onClick={handleSaveTransaction}>{t('save')}</Button>
            </>
          }
          size="xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('transactionDate')} name="date" type="date" value={newTransaction.date?.split('T')[0]} onChange={handleTxInputChange} required />
                <Select label={t('transactionType')} name="type" value={newTransaction.type} onChange={handleTxInputChange}
                    options={transactionTypeOptions}
                    required
                />
                <Input label={t('transactionDesc')} name="description" value={newTransaction.description || ''} onChange={handleTxInputChange} required wrapperClassName="md:col-span-2"/>
                
                <Input 
                    label={newTransaction.type === 'shipment' ? t('quantity') : t('transactionAmount')} 
                    name="amount" 
                    type="number" 
                    value={String(newTransaction.amount)} 
                    onChange={handleTxInputChange} 
                    required 
                />
                
                {newTransaction.type === 'payment' && (
                    <Select label={t('paymentMethod')} name="paymentMethod" value={newTransaction.paymentMethod || 'cash'} onChange={handleTxInputChange}
                        options={[ {value: 'cash', label: t('paymentCash')}, {value: 'card', label: t('paymentCard')} ]}
                    />
                )}
                {newTransaction.type === 'deposit' && (
                    <>
                        <Select label={t('productCode')} name="productCode" value={newTransaction.productCode || ''} onChange={handleTxInputChange} options={[{value: '', label: t('selectProduct')}, ...productOptions]} />
                        <Input label={t('shipmentDate')} name="shipmentDate" type="date" value={newTransaction.shipmentDate?.split('T')[0] || ''} onChange={handleTxInputChange}/>
                        <Input label={t('depositChange')} name="depositChange" type="number" value={String(newTransaction.depositChange || 0)} onChange={handleTxInputChange} placeholder="Số tiền cọc thêm/hoàn"/>
                    </>
                 )}
                 {newTransaction.type === 'shipment' && (
                    <>
                        <Select label={t('productCode')} name="productCode" value={newTransaction.productCode || ''} onChange={handleTxInputChange} options={[{value: '', label: t('selectProduct')}, ...productOptions]} required/>
                        <Input label={t('customerPriceForShipment')} name="customerPriceForShipment" type="number" value={String(newTransaction.customerPriceForShipment || 0)} onChange={handleTxInputChange} required />
                        <Input label={t('depositDeducted')} name="depositDeducted" type="number" value={String(newTransaction.depositDeducted || 0)} onChange={handleTxInputChange} />
                    </>
                 )}

                <Input label={t('debtBefore')} name="debtBefore" type="number" value={String(newTransaction.debtBefore)} readOnly disabled wrapperClassName="bg-gray-100 dark:bg-gray-700"/>
                <Input label={t('debtAfter')} name="debtAfter" type="number" value={String(debtAfterTransaction)} readOnly disabled wrapperClassName="bg-gray-100 dark:bg-gray-700"/>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerDetailPage;