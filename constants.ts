
import { NavItem, UserRole, Currency, ExchangeRate } from './types';
import {
  ChartBarIcon, UserGroupIcon, CurrencyDollarIcon, CubeIcon, UsersIcon,
  CalendarIcon, SquaresPlusIcon, PuzzlePieceIcon, RectangleStackIcon, DocumentChartBarIcon,
  AdjustmentsHorizontalIcon, ShoppingCartIcon, TruckIcon, Cog6ToothIcon, HomeIcon, LockClosedIcon, DocumentTextIcon
} from '@heroicons/react/24/outline'; // Changed path

export const APP_NAME = "Evamos";

export const DEFAULT_LANGUAGE = 'vi';
export const DEFAULT_THEME = 'light';
export const DEFAULT_CURRENCY: Currency = 'VND';

export const EXCHANGE_RATES: ExchangeRate = {
  VND_TO_RUB: 0.0035, // Example rate: 1 VND = 0.0035 RUB. This should be updatable.
};

export const ROLES_CONFIG = {
  [UserRole.ADMIN]: { nameKey: 'roleAdmin' },
  [UserRole.MANAGER]: { nameKey: 'roleManager' },
  [UserRole.WORKER]: { nameKey: 'roleWorker' },
};

export const NAVIGATION_ITEMS: NavItem[] = [
  { path: '/', labelKey: 'dashboard', icon: HomeIcon, roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: '/premises', labelKey: 'premisesManagement', icon: SquaresPlusIcon, roles: [UserRole.ADMIN] }, // Changed icon
  { path: '/worker-groups', labelKey: 'workerGroupManagement', icon: UserGroupIcon, roles: [UserRole.ADMIN] },
  { path: '/payroll', labelKey: 'workerPayroll', icon: CurrencyDollarIcon, roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: '/products', labelKey: 'productManagement', icon: CubeIcon, roles: [UserRole.ADMIN] },
  { path: '/customers', labelKey: 'customerList', icon: UsersIcon, roles: [UserRole.ADMIN] },
  { path: '/production-planning', labelKey: 'productionPlanning', icon: CalendarIcon, roles: [UserRole.ADMIN] },
  { path: '/production-coordination', labelKey: 'productionCoordination', icon: AdjustmentsHorizontalIcon, roles: [UserRole.ADMIN, UserRole.MANAGER] }, // Changed icon
  { path: '/accessories', labelKey: 'accessoriesManagement', icon: PuzzlePieceIcon, roles: [UserRole.ADMIN, UserRole.MANAGER] }, // Changed icon
  { path: '/fabrics', labelKey: 'fabricManagement', icon: RectangleStackIcon, roles: [UserRole.ADMIN, UserRole.MANAGER] }, // Changed icon
  { path: '/suppliers', labelKey: 'supplierManagement', icon: TruckIcon, roles: [UserRole.ADMIN] },
  { path: '/invoices', labelKey: 'invoiceManagement', icon: DocumentTextIcon, roles: [UserRole.ADMIN] },
  { path: '/market-goods', labelKey: 'marketGoodsManagement', icon: ShoppingCartIcon, roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: '/reports', labelKey: 'statisticalReports', icon: DocumentChartBarIcon, roles: [UserRole.ADMIN] }, // Changed icon
  { path: '/users', labelKey: 'userManagement', icon: Cog6ToothIcon, roles: [UserRole.ADMIN] }, // Changed icon
];

export const AUTH_KEY = 'evamosAuth';
export const THEME_KEY = 'evamosTheme';
export const LANGUAGE_KEY = 'evamosLang';
export const CURRENCY_KEY = 'evamosCurrency';
export const ONBOARDING_COMPLETED_KEY = 'evamosOnboardingCompleted';

export const MOCK_API_KEY = process.env.API_KEY || "mock_api_key_not_set_in_env";