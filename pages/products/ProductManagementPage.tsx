import React, { useState, useMemo, useCallback } from 'react';
import { Product } from '../../types';
import { initialProducts } from '../../data/initialProducts';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table, { Column } from '../../components/ui/Table'; 
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'; 
import { classNames, generateUniqueId, exportToExcel, printData, debounce } from '../../utils/helpers';

const ProductManagementPage: React.FC = () => {
  const { t, formatCurrency, language } = useLocalization();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ productCode: '', minWorkerPrice: '', maxWorkerPrice: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: 'productCode', direction: 'ascending' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [name]: (name === 'workerPrice' || name === 'customerPrice') ? (value === '' ? null : parseFloat(value)) : value,
      });
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingProduct) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setEditingProduct({ ...editingProduct, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const debouncedSearch = useCallback(debounce((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), [language]); // Added language to ensure t() inside debounce is fresh if language changes, though unlikely for search

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFilters(prev => ({...prev, [name]: value}));
    setCurrentPage(1);
  }

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredProducts = useMemo(() => {
    let sortableItems = [...products]
    .filter(p => p.productCode.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => filters.productCode ? p.productCode.toLowerCase().includes(filters.productCode.toLowerCase()) : true)
    .filter(p => filters.minWorkerPrice ? p.workerPrice >= parseFloat(filters.minWorkerPrice) : true)
    .filter(p => filters.maxWorkerPrice ? p.workerPrice <= parseFloat(filters.maxWorkerPrice) : true);

    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Product];
        const valB = b[sortConfig.key as keyof Product];

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
  }, [products, searchTerm, filters, sortConfig, language]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredProducts.length / itemsPerPage);


  const openAddModal = () => {
    let newCode;
    do {
      newCode = Math.floor(1000 + Math.random() * 9000).toString();
    } while (products.some(p => p.productCode === newCode));

    setEditingProduct({ id: '', productCode: newCode, workerPrice: 0, description: '', fabricType: '', customerPrice: null, imageUrl: '' });
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setImagePreview(product.imageUrl || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImagePreview(null);
  };

  const handleSaveProduct = () => {
    if (!editingProduct || !editingProduct.productCode.trim() || editingProduct.workerPrice < 0) {
        alert(t('invalidProductData'));
        return;
    }
    if (products.some(p => p.productCode === editingProduct.productCode && p.id !== editingProduct.id)) {
        alert(t('duplicateProductCode'));
        return;
    }

    if (editingProduct.id) { 
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    } else { 
      setProducts([{ ...editingProduct, id: generateUniqueId() }, ...products]);
    }
    closeModal();
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm(t('areYouSureDelete'))) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const columns: Column<Product>[] = [
    { header: 'productImage', accessor: (item: Product) => item.imageUrl ? <img src={item.imageUrl} alt={item.productCode} className="h-10 w-10 rounded object-cover"/> : <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400">No Img</div>, className: "w-16" },
    { header: 'productCode', accessor: 'productCode', className: "font-semibold", sortKey: 'productCode' },
    { header: 'productDescription', accessor: 'description', sortKey: 'description' },
    { header: 'workerPrice', accessor: (item: Product) => formatCurrency(item.workerPrice, 'VND'), sortKey: 'workerPrice' },
    { header: 'customerPrice', accessor: (item: Product) => item.customerPrice ? formatCurrency(item.customerPrice, 'VND') : '-', sortKey: 'customerPrice' },
    { header: 'fabricType', accessor: 'fabricType', sortKey: 'fabricType' },
    {
      header: 'actions',
      accessor: 'id',
      render: (item: Product) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(item);}} title={t('edit')}>
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteProduct(item.id);}} title={t('delete')} className="text-red-500 hover:text-red-700">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <Card title={t('productManagement')} 
      actions={
        <div className="flex space-x-2">
          <Button onClick={() => exportToExcel(sortedAndFilteredProducts, 'products')} variant="outline" size="sm">{t('exportExcel')}</Button>
          <Button onClick={printData} variant="outline" size="sm">{t('print')}</Button>
          <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />} size="sm">{t('addNewProduct')}</Button>
        </div>
      }>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input 
            placeholder={t('search') + '...'} 
            onChange={(e) => debouncedSearch(e.target.value)} 
            className="w-full"
            wrapperClassName="mb-0"
        />
        <Input name="productCode" placeholder={t('filterByProductCode')} value={filters.productCode} onChange={handleFilterChange} wrapperClassName="mb-0"/>
        <Input name="minWorkerPrice" type="number" placeholder={t('minWorkerPrice')} value={filters.minWorkerPrice} onChange={handleFilterChange} wrapperClassName="mb-0"/>
        <Input name="maxWorkerPrice" type="number" placeholder={t('maxWorkerPrice')} value={filters.maxWorkerPrice} onChange={handleFilterChange} wrapperClassName="mb-0"/>
      </div>

      <Table 
        columns={columns} 
        data={paginatedProducts} 
        sortConfig={sortConfig}
        requestSort={requestSort}
        // onRowClick might be useful if navigating to a product detail page in future
      />

       {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <Button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>Previous</Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>Next</Button>
        </div>
      )}

      {isModalOpen && editingProduct && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct.id ? t('editProduct') : t('addNewProduct')}
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button>
              <Button onClick={handleSaveProduct}>{t('save')}</Button>
            </>
          }
          size="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('productCode')} name="productCode" value={editingProduct.productCode} onChange={handleInputChange} required />
            <Input label={t('productDescription')} name="description" value={editingProduct.description || ''} onChange={handleInputChange} />
            <Input label={t('workerPrice')} name="workerPrice" type="number" value={String(editingProduct.workerPrice)} onChange={handleInputChange} required min="0" step="1000" />
            <Input label={t('customerPrice')} name="customerPrice" type="number" value={editingProduct.customerPrice === null ? '' : String(editingProduct.customerPrice)} onChange={handleInputChange} min="0" step="1000" />
            <Input label={t('fabricType')} name="fabricType" value={editingProduct.fabricType || ''} onChange={handleInputChange} />
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('productImage')}</label>
              <div className="mt-1 flex items-center space-x-4">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded object-cover" />
                ) : (
                  <div className="h-24 w-24 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                    <ArrowUpTrayIcon className="h-10 w-10" />
                  </div>
                )}
                <input type="file" id="imageUrl" name="imageUrl" accept="image/*" onChange={handleImageChange} className="hidden" />
                <Button type="button" variant="outline" onClick={() => document.getElementById('imageUrl')?.click()}>
                  {t('uploadImage')}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default ProductManagementPage;
