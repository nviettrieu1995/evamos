
export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const formatDate = (dateString: string | Date, locale: string = 'en-US'): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return String(dateString); // fallback
  }
};

export const formatDateTime = (dateString: string | Date, locale: string = 'en-US'): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return String(dateString); // fallback
  }
};

export const generateUniqueId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Basic debounce function
export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}

// Function to simulate file export (placeholder)
export const exportToExcel = (data: any[], fileName: string) => {
  console.log(`Exporting data to ${fileName}.xlsx:`, data);
  // In a real app, you'd use a library like 'xlsx' or 'file-saver'
  alert(`Simulating Excel export for ${fileName}. Data logged to console.`);
};

// Function to simulate printing (placeholder)
export const printData = () => {
  console.log("Simulating print action...");
  window.print();
};

