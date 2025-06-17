
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import ProductManagementPage from '../pages/products/ProductManagementPage';
import CustomerListPage from '../pages/customers/CustomerListPage';
import CustomerDetailPage from '../pages/customers/CustomerDetailPage'; // Import new page
import WorkerGroupsPage from '../pages/worker-groups/WorkerGroupsPage';
import PremisesPage from '../pages/PremisesPage';
import WorkerPayrollPage from '../pages/WorkerPayrollPage';
import ProductionPlanningPage from '../pages/ProductionPlanningPage';
import ProductionCoordinationPage from '../pages/ProductionCoordinationPage';
import AccessoriesManagementPage from '../pages/AccessoriesManagementPage';
import FabricManagementPage from '../pages/FabricManagementPage';
import SupplierManagementPage from '../pages/SupplierManagementPage';
import InvoiceManagementPage from '../pages/InvoiceManagementPage';
import MarketGoodsPage from '../pages/MarketGoodsPage';
import ReportsPage from '../pages/ReportsPage';
import UserManagementPage from '../pages/UserManagementPage';
import ProfilePage from '../pages/ProfilePage'; // Placeholder for user settings
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import { UserRole } from '../types';

const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute />}> {/* Authenticated users */}
          <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} /> {/* User settings/profile */}
          
          {/* Admin and Manager accessible routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]} />}>
            <Route path="/payroll" element={<MainLayout><WorkerPayrollPage /></MainLayout>} />
            <Route path="/production-coordination" element={<MainLayout><ProductionCoordinationPage /></MainLayout>} />
            <Route path="/accessories" element={<MainLayout><AccessoriesManagementPage /></MainLayout>} />
            <Route path="/fabrics" element={<MainLayout><FabricManagementPage /></MainLayout>} />
            <Route path="/market-goods" element={<MainLayout><MarketGoodsPage /></MainLayout>} />
          </Route>

          {/* Admin only routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route path="/premises" element={<MainLayout><PremisesPage /></MainLayout>} />
            <Route path="/worker-groups" element={<MainLayout><WorkerGroupsPage /></MainLayout>} />
            <Route path="/products" element={<MainLayout><ProductManagementPage /></MainLayout>} />
            <Route path="/customers" element={<MainLayout><CustomerListPage /></MainLayout>} />
            <Route path="/customers/:customerId" element={<MainLayout><CustomerDetailPage /></MainLayout>} />
            <Route path="/production-planning" element={<MainLayout><ProductionPlanningPage /></MainLayout>} />
            <Route path="/suppliers" element={<MainLayout><SupplierManagementPage /></MainLayout>} />
            <Route path="/invoices" element={<MainLayout><InvoiceManagementPage /></MainLayout>} />
            <Route path="/reports" element={<MainLayout><ReportsPage /></MainLayout>} />
            <Route path="/users" element={<MainLayout><UserManagementPage /></MainLayout>} />
          </Route>
        </Route>
        
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default AppRouter;
