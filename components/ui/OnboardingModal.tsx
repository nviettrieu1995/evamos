import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { useLocalization } from '../../hooks/useLocalization';
import {
  HomeIcon, ListBulletIcon, CubeIcon, UsersIcon, ShoppingCartIcon, CurrencyDollarIcon,
  LanguageIcon, SunIcon, MoonIcon, UserCircleIcon, MagnifyingGlassIcon, PlusCircleIcon, PencilIcon, TrashIcon,
  UserGroupIcon, DocumentMagnifyingGlassIcon, CalendarDaysIcon, AdjustmentsHorizontalIcon, IdentificationIcon
} from '@heroicons/react/24/outline';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: (skippedOrFinished: boolean) => void;
}

interface OnboardingStep {
  titleKey: string;
  contentKey: string;
  icon?: React.ElementType; // Heroicon component
  illustration?: React.ReactNode; // For more complex visuals if needed
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocalization();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    { titleKey: 'onboardingWelcomeTitle', contentKey: 'onboardingWelcomeText', icon: HomeIcon },
    { titleKey: 'onboardingSidebarTitle', contentKey: 'onboardingSidebarText', icon: ListBulletIcon },
    { titleKey: 'onboardingDashboardTitle', contentKey: 'onboardingDashboardText', icon: HomeIcon },
    { titleKey: 'onboardingWorkerGroupsTitle', contentKey: 'onboardingWorkerGroupsText', icon: UserGroupIcon },
    { titleKey: 'onboardingPayrollTitle', contentKey: 'onboardingPayrollText', icon: CurrencyDollarIcon },
    { titleKey: 'onboardingProductsTitle', contentKey: 'onboardingProductsText', icon: CubeIcon },
    { titleKey: 'onboardingCustomersTitle', contentKey: 'onboardingCustomersText', icon: UsersIcon },
    { titleKey: 'onboardingCustomerDetailTitle', contentKey: 'onboardingCustomerDetailText', icon: IdentificationIcon },
    { titleKey: 'onboardingProdPlanningTitle', contentKey: 'onboardingProdPlanningText', icon: CalendarDaysIcon },
    { titleKey: 'onboardingProdCoordinationTitle', contentKey: 'onboardingProdCoordinationText', icon: AdjustmentsHorizontalIcon },
    { titleKey: 'onboardingMarketGoodsTitle', contentKey: 'onboardingMarketGoodsText', icon: ShoppingCartIcon },
    { 
      titleKey: 'onboardingHeaderControlsTitle', 
      contentKey: 'onboardingHeaderControlsText',
      illustration: (
        <div className="flex space-x-2 text-gray-600 dark:text-gray-400 justify-center my-2">
          <LanguageIcon className="h-6 w-6" />
          <CurrencyDollarIcon className="h-6 w-6" />
          <SunIcon className="h-6 w-6" />
          <UserCircleIcon className="h-6 w-6" />
        </div>
      )
    },
    { 
      titleKey: 'onboardingDataInteractionTitle', 
      contentKey: 'onboardingDataInteractionText',
      illustration: (
         <div className="flex space-x-2 text-gray-600 dark:text-gray-400 justify-center my-2">
          <MagnifyingGlassIcon className="h-6 w-6" title={t('search')} />
          <PlusCircleIcon className="h-6 w-6 text-green-500" title={t('add')} />
          <PencilIcon className="h-6 w-6 text-blue-500" title={t('edit')} />
          <TrashIcon className="h-6 w-6 text-red-500" title={t('delete')} />
        </div>
      )
    },
    { titleKey: 'onboardingCompletionTitle', contentKey: 'onboardingCompletionText' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(true); // Finished
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose(true); // Skipped
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)} title={t('onboarding')} size="lg">
      <div className="text-center p-2">
        {IconComponent && <IconComponent className="h-16 w-16 text-primary mx-auto mb-4" />}
        {currentStepData.illustration && <div className="my-4">{currentStepData.illustration}</div>}
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
          {t(currentStepData.titleKey)}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
          {t(currentStepData.contentKey)}
        </p>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          {currentStep > 0 && currentStep < steps.length -1 && ( // Show skip only on intermediate steps
            <Button variant="ghost" onClick={handleSkip}>
              {t('onboardingSkip')}
            </Button>
          )}
        </div>
        <div className="flex space-x-3">
          {currentStep > 0 && (
            <Button variant="secondary" onClick={handlePrevious}>
              {t('onboardingPrevious')}
            </Button>
          )}
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? t('onboardingStartUsing') : t('onboardingNext')}
          </Button>
        </div>
      </div>
       <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Step {currentStep + 1} of {steps.length}
        </div>
    </Modal>
  );
};

export default OnboardingModal;