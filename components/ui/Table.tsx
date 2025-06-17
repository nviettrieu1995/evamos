import React, { ReactNode } from 'react';
import { classNames } from '../../utils/helpers';
import { useLocalization } from '../../hooks/useLocalization';
import { ArrowUpIcon, ArrowDownIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

export interface Column<T> {
  header: string; // Will be passed to t() for localization
  accessor: keyof T | ((item: T) => ReactNode);
  render?: (item: T) => ReactNode; // Custom render function for the cell
  className?: string; // class for th/td
  sortKey?: string; // Explicit key for sorting, esp. if accessor is a function or keyof T is not directly sortable
}

interface TableProps<T extends { id: string | number } > {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyStateMessage?: string; // Will be passed to t()
  sortConfig?: { key: string | null; direction: 'ascending' | 'descending'; };
  requestSort?: (sortKey: string) => void;
}

function Table<T extends { id: string | number } >({ 
  columns, 
  data, 
  onRowClick, 
  isLoading = false, 
  emptyStateMessage = "noData",
  sortConfig,
  requestSort 
}: TableProps<T>): React.ReactElement {
  const { t } = useLocalization();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-300">{t('loading')}</p>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-gray-500 dark:text-gray-400">{t(emptyStateMessage)}</div>;
  }

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((col, index) => {
              const columnSortKey = col.sortKey || (typeof col.accessor === 'string' ? col.accessor : null);
              const isSortable = !!requestSort && !!columnSortKey;
              const isActiveSortColumn = sortConfig && sortConfig.key === columnSortKey;
              
              let titleText = t(col.header);
              if (isSortable && columnSortKey) {
                if (isActiveSortColumn && sortConfig) {
                  titleText = `${t(col.header)} (${sortConfig.direction === 'descending' ? t('clickToSortAsc') : t('clickToSortDesc')})`;
                } else {
                  // Default action implies sorting ascending first or toggling if already sorted by this key.
                  // For simplicity, always suggest ascending if not currently active or if sortConfig is not set for this key.
                  titleText = `${t(col.header)} (${t('clickToSortAsc')})`;
                }
              }

              return (
              <th
                key={index}
                scope="col"
                className={classNames(
                  "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider",
                  col.className,
                  isSortable ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" : ""
                )}
                onClick={() => isSortable && requestSort && columnSortKey && requestSort(columnSortKey)}
                aria-sort={isActiveSortColumn && sortConfig ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'}
                title={titleText}
              >
                <div className="flex items-center">
                  {t(col.header)}
                  {isSortable && isActiveSortColumn && sortConfig && (
                    <span className="ml-1 flex-shrink-0">
                      {sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                    </span>
                  )}
                  {isSortable && (!isActiveSortColumn || !sortConfig) && columnSortKey && ( 
                      <ChevronUpDownIcon className="h-4 w-4 ml-1 opacity-30 flex-shrink-0" />
                  )}
                </div>
              </th>
            )})}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item) => (
            <tr 
              key={item.id} 
              className={classNames(onRowClick ? "hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" : "")}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={classNames("px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", col.className)}>
                  {col.render 
                    ? col.render(item) 
                    : typeof col.accessor === 'function' 
                      ? col.accessor(item)
                      : item[col.accessor as keyof T] !== null && item[col.accessor as keyof T] !== undefined ? String(item[col.accessor as keyof T]) : '-'} 
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
