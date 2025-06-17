
import { DailyProductProductionByGroups } from '../types';
import { initialProducts } from './initialProducts';
import { initialCustomers } from './initialCustomers';
import { initialWorkerGroups } from './initialWorkerGroups'; // To get group IDs and names

const getProductPrice = (code: string): number => initialProducts.find(p => p.productCode === code)?.workerPrice || 0;

export const mockDailyProductionData: DailyProductProductionByGroups[] = [
    {
        id: 'dp1_2024-07-20_2029_cust1',
        workDate: '2024-07-20',
        productCode: '2029',
        productDescription: initialProducts.find(p => p.productCode === '2029')?.description,
        workerPrice: getProductPrice('2029'),
        customerName: initialCustomers[0].name, // Example customer
        productionByGroup: {
            [initialWorkerGroups[0].id]: 25, // Cạ Hạnh
            [initialWorkerGroups[2].id]: 30, // Cạ Hậu
            [initialWorkerGroups[4].id]: 0, // Cạ Liễu - 0 for this product on this day
        },
        totalQuantity: 55,
        totalSalary: 55 * getProductPrice('2029'),
        absentees: `${initialWorkerGroups[9].name} nghỉ` // Cạ Yến nghỉ
    },
    {
        id: 'dp2_2024-07-20_2087_cust2',
        workDate: '2024-07-20', // Same day, different product/customer
        productCode: '2087',
        productDescription: initialProducts.find(p => p.productCode === '2087')?.description,
        workerPrice: getProductPrice('2087'),
        customerName: initialCustomers[1].name,
        productionByGroup: {
            [initialWorkerGroups[0].id]: 15, // Cạ Hạnh
            [initialWorkerGroups[1].id]: 20, // Cạ Hằng
        },
        totalQuantity: 35,
        totalSalary: 35 * getProductPrice('2087'),
        absentees: ''
    },
    {
        id: 'dp3_2024-07-21_2029_cust3',
        workDate: '2024-07-21', // Different day, same product as dp1
        productCode: '2029',
        productDescription: initialProducts.find(p => p.productCode === '2029')?.description,
        workerPrice: getProductPrice('2029'),
        customerName: initialCustomers[2].name,
        productionByGroup: {
            [initialWorkerGroups[2].id]: 40, // Cạ Hậu
            [initialWorkerGroups[9].id]: 20, // Cạ Yến
            [initialWorkerGroups[1].id]: 10, // Cạ Hằng
        },
        totalQuantity: 70,
        totalSalary: 70 * getProductPrice('2029'),
        absentees: `Tuấn Anh (${initialWorkerGroups[0].name}) nghỉ`
    },
    {
        id: 'dp4_2024-07-21_1989_cust1',
        workDate: '2024-07-21', // Same day as dp3, different product
        productCode: '1989',
        productDescription: initialProducts.find(p => p.productCode === '1989')?.description,
        workerPrice: getProductPrice('1989'),
        customerName: initialCustomers[0].name,
        productionByGroup: {
            [initialWorkerGroups[3].id]: 30, // Cạ Hương
            [initialWorkerGroups[4].id]: 25, // Cạ Liễu
            [initialWorkerGroups[5].id]: 10, // Cạ Ngoan
        },
        totalQuantity: 65,
        totalSalary: 65 * getProductPrice('1989'),
        absentees: ''
    },
     {
        id: 'dp5_2024-06-12_2253_cust4_example', 
        workDate: '2024-06-12', 
        productCode: '2253', 
        productDescription: initialProducts.find(p => p.productCode === '2253')?.description || 'Váy 2253 (Thêm vào initialProducts)',
        workerPrice: getProductPrice('2253') || 65000, 
        customerName: '24-103 farid', 
        productionByGroup: { 
            [initialWorkerGroups[0].id]: 50, // Cạ Hạnh
            [initialWorkerGroups[1].id]: 50, // Cạ Hằng
            [initialWorkerGroups[2].id]: 49, // Cạ Hậu
            [initialWorkerGroups[3].id]: 50, // Cạ Hương
        },
        totalQuantity: 199,
        totalSalary: 199 * (getProductPrice('2253') || 65000),
        absentees: 'Thiếu 1 so với đơn hàng chợ'
    },
    {
        id: 'dp6_2024-07-22_2091_cust5',
        workDate: '2024-07-22',
        productCode: '2091', // A product with different worker price
        productDescription: initialProducts.find(p => p.productCode === '2091')?.description,
        workerPrice: getProductPrice('2091'),
        customerName: initialCustomers[3].name,
        productionByGroup: {
            [initialWorkerGroups[6].id]: 30, // Cạ Thủy
            [initialWorkerGroups[7].id]: 35, // Cạ Trang
        },
        totalQuantity: 65,
        totalSalary: 65 * getProductPrice('2091'),
        absentees: `${initialWorkerGroups[8].name} vắng cả cạ`
    },
    {
        id: 'dp7_2024-07-22_2029_cust1', // Same product as dp1, but different day and groups
        workDate: '2024-07-22',
        productCode: '2029',
        productDescription: initialProducts.find(p => p.productCode === '2029')?.description,
        workerPrice: getProductPrice('2029'),
        customerName: initialCustomers[0].name,
        productionByGroup: {
            [initialWorkerGroups[8].id]: 50, // Cạ Việt Anh
            [initialWorkerGroups[5].id]: 20, // Cạ Ngoan
        },
        totalQuantity: 70,
        totalSalary: 70 * getProductPrice('2029'),
        absentees: ''
    }
];

// Ensure product 2253 exists for the demo
const product2253 = initialProducts.find(p => p.productCode === '2253');
if (!product2253) {
    initialProducts.push({
        id: 'p_2253',
        productCode: '2253',
        description: 'Váy Mẫu 2253',
        workerPrice: 65000, // Example price
        customerPrice: 450000,
        fabricType: 'Vải Ren Cao Cấp',
        imageUrl: 'https://picsum.photos/seed/2253/200/200'
    });
    // Update worker price in mock data if it was defaulted
    const dp5 = mockDailyProductionData.find(d => d.productCode === '2253');
    if (dp5 && dp5.workerPrice === 0) { // If it was defaulted due to missing product
      dp5.workerPrice = 65000;
      dp5.totalSalary = dp5.totalQuantity * dp5.workerPrice;
    }
}
