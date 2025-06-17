
import React, { useState, useEffect } from 'react';
import { DailyProductProductionByGroups, Product, Customer, WorkerGroup } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { generateUniqueId } from '../../utils/helpers';

interface AddProductionRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: DailyProductProductionByGroups) => void;
  products: Product[];
  customers: Customer[];
  workerGroups: WorkerGroup[];
}

const AddProductionRecordModal: React.FC<AddProductionRecordModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave,
    products,
    customers,
    workerGroups
}) => {
  const { t } = useLocalization();
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [groupQuantities, setGroupQuantities] = useState<Record<string, number>>({});
  const [absentees, setAbsentees] = useState('');

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId); // Assuming product ID is used for selection value
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [selectedProductId, products]);

  const handleGroupQuantityChange = (groupId: string, quantity: string) => {
    setGroupQuantities(prev => ({
      ...prev,
      [groupId]: parseInt(quantity) || 0,
    }));
  };

  const resetForm = () => {
    setWorkDate(new Date().toISOString().split('T')[0]);
    setSelectedProductId('');
    setSelectedProduct(null);
    setSelectedCustomerId('');
    setGroupQuantities({});
    setAbsentees('');
  };

  const handleSubmit = () => {
    if (!selectedProduct || !selectedCustomerId) {
      alert(t('newProductionRecordError') || 'Please select product and customer.'); // Simple validation
      return;
    }

    const totalQuantity = Object.values(groupQuantities).reduce((sum, qty) => sum + qty, 0);
    if (totalQuantity <= 0) {
        alert(t('newProductionRecordError') || 'Total quantity must be greater than 0.');
        return;
    }
    const customer = customers.find(c => c.id === selectedCustomerId);

    const newRecord: DailyProductProductionByGroups = {
      id: generateUniqueId(),
      workDate: workDate,
      productCode: selectedProduct.productCode,
      productDescription: selectedProduct.description,
      workerPrice: selectedProduct.workerPrice,
      customerName: customer?.name || 'N/A',
      customerId: selectedCustomerId,
      productionByGroup: groupQuantities,
      totalQuantity: totalQuantity,
      totalSalary: totalQuantity * selectedProduct.workerPrice,
      absentees: absentees,
    };
    onSave(newRecord);
    resetForm();
    onClose();
  };

  const productOptions = products.map(p => ({ value: p.id, label: `${p.productCode} - ${p.description || t('noDescription')}` }));
  const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose();}}
      title={t('addProductQuantityTitle')}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={() => { resetForm(); onClose();}}>{t('cancel')}</Button>
          <Button onClick={handleSubmit}>{t('save')}</Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <Input
          label={t('workDate')}
          type="date"
          value={workDate}
          onChange={(e) => setWorkDate(e.target.value)}
          required
        />
        <Select
          label={t('productCode')}
          options={[{ value: '', label: t('selectProduct') }, ...productOptions]}
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          required
        />
        {selectedProduct && (
          <Input
            label={t('workerPrice')}
            type="number"
            value={selectedProduct.workerPrice.toString()}
            readOnly
            disabled
            className="bg-gray-100 dark:bg-gray-700"
          />
        )}
        <Select
          label={t('customerName')}
          options={[{ value: '', label: t('selectCustomer') }, ...customerOptions]}
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          required
        />
        
        <h4 className="text-md font-semibold mt-4 mb-2">{t('quantitiesByGroup')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workerGroups.map(group => (
                <Input
                    key={group.id}
                    label={`${group.name} (${t('quantity')})`}
                    type="number"
                    min="0"
                    value={String(groupQuantities[group.id] || 0)}
                    onChange={(e) => handleGroupQuantityChange(group.id, e.target.value)}
                />
            ))}
        </div>

        <Input
          label={t('absentWorkersGroups')}
          value={absentees}
          onChange={(e) => setAbsentees(e.target.value)}
          placeholder={t('note') + '...'}
        />
      </div>
    </Modal>
  );
};

export default AddProductionRecordModal;
// Add to locales.ts
// vi: { quantitiesByGroup: 'Số lượng theo từng Cạ', addProductQuantityTitle: 'Thêm Sản Lượng Mã Sản Phẩm Mới', newProductionRecordSuccess: 'Đã thêm bản ghi sản lượng mới thành công.', newProductionRecordError: 'Lỗi khi thêm bản ghi sản lượng. Vui lòng thử lại.' }
// ru: { quantitiesByGroup: 'Количество по Бригадам', addProductQuantityTitle: 'Добавить Новую Запись о Выпуске Продукции', newProductionRecordSuccess: 'Новая запись о выпуске продукции успешно добавлена.', newProductionRecordError: 'Ошибка при добавлении записи о выпуске. Пожалуйста, попробуйте снова.' }
