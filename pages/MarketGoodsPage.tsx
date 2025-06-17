import React, { useState, useMemo } from 'react';
import { MarketGood, Product, Customer } from '../../types';
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
import { initialCustomers } from '../../data/initialCustomers';

const mockProductionData: Record<string, number> = {
    '2253': 199, 
    '1119': 200,
    '2029': 150,
    '2091': 50,
    '1987': 100,
};


const initialMarketGoods: MarketGood[] = [
    {id: 'mg1', shipDate: '2024-06-15', productCode: '2253', productDescription: 'Áo Sơ Mi Lụa', customerId: initialCustomers[1].id, customerName: initialCustomers[1].name, quantityNeeded: 200, quantityProduced: mockProductionData['2253'] || 0, status: (mockProductionData['2253'] || 0) >= 200 ? 'sufficient' : 'deficit' , notes: 'Khách cần gấp'},
    {id: 'mg2', shipDate: '2024-06-15', productCode: '1119', productDescription: 'Quần Jean ống rộng', customerId: initialCustomers[6].id, customerName: initialCustomers[6].name, quantityNeeded: 200, quantityProduced: mockProductionData['1119'] || 0, status: (mockProductionData['1119'] || 0) >= 200 ? 'sufficient' : 'deficit', notes: ''},
    {id: 'mg3', shipDate: '2024-06-18', productCode: '2029', productDescription: 'Váy công sở A', customerId: initialCustomers[0].id, customerName: initialCustomers[0].name, quantityNeeded: 100, quantityProduced: mockProductionData['2029'] || 0, status: 'pending_production', notes: 'Chờ sx thêm'},
    {id: 'mg4', shipDate: '2024-07-01', productCode: '2091', productDescription: 'Váy Lụa Mẫu Mới', customerId: initialCustomers[2].id, customerName: initialCustomers[2].name, quantityNeeded: 50, quantityProduced: mockProductionData['2091'] || 0, status: 'sufficient' , notes: 'Hàng mẫu'},
    {id: 'mg5', shipDate: '2024-07-05', productCode: '1987', productDescription: 'Áo Cotton In Hoa', customerId: initialCustomers[3].id, customerName: initialCustomers[3].name, quantityNeeded: 120, quantityProduced: mockProductionData['1987'] || 0, status: 'deficit' , notes: 'Thiếu 20 cái'},
    {id: 'mg6', shipDate: '2024-05-20', productCode: '2021', productDescription: 'Váy Ren Đặc Biệt', customerId: initialCustomers[4].id, customerName: initialCustomers[4].name, quantityNeeded: 75, quantityProduced: 75, status: 'delivered', notes: 'Đã giao tháng trước'},
];

const MarketGoodsPage: React.FC = () => {
  const { t, language } = useLocalization();
  const [marketGoods, setMarketGoods] = useState<MarketGood[]>(initialMarketGoods);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<MarketGood> | null>(null);

  const [filters, setFilters] = useState({
    monthYear: '', // Default to show all months
    productCode: '',
    customerId: '',
    status: '' as MarketGood['status'] | '',
  });
  
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: 'shipDate', direction: 'descending' });

  const productOptions = [{ value: '', label: t('all')}, ...initialProducts.map(p => ({ value: p.productCode, label: `${p.productCode} - ${p.description || t('noDescription')}`}))];
  const customerOptions = [{ value: '', label: t('all')}, ...initialCustomers.map(c => ({ value: c.id, label: c.name }))];
  const statusOptions: {value: MarketGood['status'] | '', label: string}[] = [
    { value: '', label: t('all')},
    { value: 'pending_production', label: t('statusPendingProduction')},
    { value: 'sufficient', label: t('statusSufficient')},
    { value: 'deficit', label: t('statusDeficit', {shortage: ''}).replace(' ()', '')}, 
    { value: 'delivered', label: t('statusDelivered')},
  ];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setFilters(prev => ({...prev, [name]: value}));
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const processedGoods = useMemo(() => {
    let items = [...marketGoods].filter(item => {
      const itemMonthYear = item.shipDate.slice(0,7); // YYYY-MM
      const monthMatch = filters.monthYear ? itemMonthYear === filters.monthYear : true;
      const productMatch = filters.productCode ? item.productCode === filters.productCode : true;
      const customerMatch = filters.customerId ? item.customerId === filters.customerId : true;
      const statusMatch = filters.status ? item.status === filters.status : true;
      return monthMatch && productMatch && customerMatch && statusMatch;
    });

    if (sortConfig.key) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key as keyof MarketGood];
        const valB = b[sortConfig.key as keyof MarketGood];

        if (valA === null || valA === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (valB === null || valB === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        
        if (['quantityNeeded', 'quantityProduced'].includes(sortConfig.key!)) {
            const numA = Number(valA);
            const numB = Number(valB);
            return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
        }
        if (sortConfig.key === 'shipDate') {
            return sortConfig.direction === 'ascending' 
                ? new Date(valA as string).getTime() - new Date(valB as string).getTime()
                : new Date(valB as string).getTime() - new Date(valA as string).getTime();
        }
        
        return sortConfig.direction === 'ascending' 
          ? String(valA).localeCompare(String(valB), language) 
          : String(valB).localeCompare(String(valA), language);
      });
    }
    return items;
  }, [marketGoods, filters, sortConfig, language]);

  const groupedMarketGoods = useMemo(() => {
    const groups = processedGoods.reduce((acc, item) => {
      const monthYear = item.shipDate.slice(0, 7); // YYYY-MM
      (acc[monthYear] = acc[monthYear] || []).push(item);
      return acc;
    }, {} as Record<string, MarketGood[]>);
    
    return Object.entries(groups).sort(([monthA], [monthB]) => monthB.localeCompare(monthA));
  }, [processedGoods]);


  const openAddModal = () => {
    setEditingEntry({ shipDate: new Date().toISOString().split('T')[0], quantityNeeded: 0, status: 'pending_production' });
    setIsModalOpen(true);
  };

  const openEditModal = (entry: MarketGood) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleSave = () => {
    if (!editingEntry || !editingEntry.productCode || !editingEntry.customerId || (editingEntry.quantityNeeded || 0) <=0 ) {
        alert(t('marketGoodFieldsRequired'));
        return;
    }
    const productInfo = initialProducts.find(p => p.productCode === editingEntry.productCode);
    const customerInfo = initialCustomers.find(c => c.id === editingEntry.customerId);
    const producedQty = mockProductionData[editingEntry.productCode] || 0;
    
    let status: MarketGood['status'] = editingEntry.status || 'pending_production';
    if(status !== 'delivered'){ 
        status = producedQty >= (editingEntry.quantityNeeded || 0) ? 'sufficient' : 'deficit';
    }

    const entryData = { 
        ...editingEntry,
        productDescription: productInfo?.description || editingEntry.productCode,
        customerName: customerInfo?.name || editingEntry.customerId,
        quantityProduced: producedQty,
        status: status,
    } as MarketGood;

    if (editingEntry.id) {
        setMarketGoods(marketGoods.map(p => p.id === editingEntry.id ? entryData : p));
    } else {
        setMarketGoods([{ ...entryData, id: generateUniqueId() }, ...marketGoods]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('areYouSureDelete'))) {
        setMarketGoods(marketGoods.filter(p => p.id !== id));
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setEditingEntry(prev => ({...prev, [name]: (name === 'quantityNeeded' || name === 'quantityProduced') ? parseInt(value) || 0 : value }));
  };

  const columns: Column<MarketGood>[] = [
    { header: 'shipmentDate', accessor: (item) => formatDate(item.shipDate, language), sortKey: 'shipDate'},
    { header: 'productCode', accessor: 'productCode', className: "font-semibold", sortKey: 'productCode' },
    { header: 'productDescription', accessor: 'productDescription', sortKey: 'productDescription' },
    { header: 'customerName', accessor: 'customerName', sortKey: 'customerName' },
    { header: 'quantityNeeded', accessor: 'quantityNeeded', className: "text-center", sortKey: 'quantityNeeded' },
    { header: 'quantityProduced', accessor: (item) => item.quantityProduced ?? t('notAvailable'), className: "text-center", sortKey: 'quantityProduced' },
    { header: 'status', accessor: (item) => {
        if(item.status === 'deficit') {
            const shortage = (item.quantityNeeded || 0) - (item.quantityProduced || 0);
            return <span className="text-red-500 font-semibold">{t('statusDeficit', {shortage: String(shortage)})}</span>;
        }
        if(item.status === 'sufficient') return <span className="text-green-500 font-semibold">{t('statusSufficient')}</span>;
        if(item.status === 'pending_production') return <span className="text-yellow-500 font-semibold">{t('statusPendingProduction')}</span>;
        if(item.status === 'delivered') return <span className="text-blue-500 font-semibold">{t('statusDelivered')}</span>;
        return item.status;
      }, sortKey: 'status'
    },
    { header: 'notes', accessor: 'notes', sortKey: 'notes'},
    {
      header: 'actions',
      accessor: 'id',
      render: (item: MarketGood) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} title={t('edit')}><PencilIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title={t('delete')} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card title={t('marketGoodsManagement')} actions={
          <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />}>{t('addMarketGoodEntry')}</Button>
      }>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          {t('marketGoodsManagementDescription')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border dark:border-gray-700 rounded-lg">
          <Input 
            type="month"
            label={t('filterByShipMonth')}
            name="monthYear"
            value={filters.monthYear}
            onChange={handleFilterChange}
          />
          <Select
            label={t('filterByProductCode')}
            name="productCode"
            options={productOptions}
            value={filters.productCode}
            onChange={handleFilterChange}
          />
          <Select
            label={t('filterByCustomer')}
            name="customerId"
            options={customerOptions}
            value={filters.customerId}
            onChange={handleFilterChange}
          />
          <Select
            label={t('filterByStatus')}
            name="status"
            options={statusOptions}
            value={filters.status}
            onChange={handleFilterChange}
          />
        </div>
      </Card>

      {groupedMarketGoods.length > 0 ? (
        groupedMarketGoods.map(([month, entries]) => (
          <Card key={month} title={`${t('filterByMonth')}: ${month.replace('-', '/')}`} className="mb-6">
            <Table 
                columns={columns} 
                data={entries} 
                sortConfig={sortConfig}
                requestSort={requestSort} // This will re-sort the main list and re-group
            />
          </Card>
        ))
      ) : (
        <Card>
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">{filters.monthYear ? t('noData') + ' ' + t('for') + ' ' + filters.monthYear.replace('-', '/') : t('noData')}</div>
        </Card>
      )}

      {isModalOpen && editingEntry && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingEntry.id ? t('editMarketGoodEntry') : t('addMarketGoodEntry')}
            footer={<><Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button><Button onClick={handleSave}>{t('save')}</Button></>}
            size="lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('shipmentDate')} name="shipDate" type="date" value={editingEntry.shipDate?.split('T')[0] || ''} onChange={handleInputChange} required />
                <Select label={t('productCode')} name="productCode" value={editingEntry.productCode || ''} onChange={handleInputChange} options={[{value:'', label: t('selectProduct')}, ...productOptions]} required />
                <Select label={t('customerName')} name="customerId" value={editingEntry.customerId || ''} onChange={handleInputChange} options={[{value:'', label: t('selectCustomer')}, ...customerOptions]} required/>
                <Input label={t('quantityNeeded')} name="quantityNeeded" type="number" value={String(editingEntry.quantityNeeded || 0)} onChange={handleInputChange} required min="1"/>
                <Select label={t('status')} name="status" value={editingEntry.status || 'pending_production'} onChange={handleInputChange} options={statusOptions.filter(opt => opt.value !== '')} required/>
                <Input label={t('notes')} name="notes" value={editingEntry.notes || ''} onChange={handleInputChange} wrapperClassName="md:col-span-2" />
            </div>
          </Modal>
      )}
    </div>
  );
};

export default MarketGoodsPage;
