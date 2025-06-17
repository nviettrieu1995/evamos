
import { WorkerGroup, WorkerGroupMember } from '../types';

export const initialWorkerGroups: WorkerGroup[] = [
  { id: 'wg1', name: 'Cạ Hạnh', members: [{id: 'w1', name: 'Hạnh'}, {id: 'w2', name: 'Tuấn Anh'}], totalProductsMade: 120, totalSalary: 5400000 },
  { id: 'wg2', name: 'Cạ Hằng', members: [{id: 'w3', name: 'Hằng'}, {id: 'w4', name: 'Trường'}, {id: 'w5', name: 'Giang'}], totalProductsMade: 250, totalSalary: 12500000 },
  { id: 'wg3', name: 'Cạ Hậu', members: [{id: 'w6', name: 'Hậu'}, {id: 'w7', name: 'Mai'}], totalProductsMade: 180, totalSalary: 9000000 },
  { id: 'wg4', name: 'Cạ Hương', members: [{id: 'w8', name: 'Hương'}, {id: 'w9', name: 'Hà'}], totalProductsMade: 150, totalSalary: 7000000 },
  { id: 'wg5', name: 'Cạ Liễu', members: [{id: 'w10', name: 'Liễu'}, {id: 'w11', name: 'Nghĩa'}], totalProductsMade: 90, totalSalary: 4050000 },
  { id: 'wg6', name: 'Cạ Ngoan', members: [{id: 'w12', name: 'Ngoan'}], totalProductsMade: 70, totalSalary: 3500000 },
  { id: 'wg7', name: 'Cạ Thủy', members: [{id: 'w13', name: 'Thúy'}, {id: 'w14', name: 'Thủy'}], totalProductsMade: 210, totalSalary: 9450000 },
  { id: 'wg8', name: 'Cạ Trang', members: [{id: 'w15', name: 'Trang'}, {id: 'w16', name: 'Quân'}], totalProductsMade: 165, totalSalary: 8200000 },
  { id: 'wg9', name: 'Cạ Việt Anh', members: [{id: 'w17', name: 'Việt Anh'}, {id: 'w18', name: 'Châu Anh'}, {id: 'w19', name: 'Quyền'}], totalProductsMade: 300, totalSalary: 15000000 },
  { id: 'wg10', name: 'Cạ Yến', members: [{id: 'w20', name: 'Đức'}, {id: 'w21', name: 'Yến'}], totalProductsMade: 110, totalSalary: 6050000 },
];

// This is intended to be populated dynamically. Ensuring it's an empty array initially.
export const availableWorkersForGroups: WorkerGroupMember[] = [];
