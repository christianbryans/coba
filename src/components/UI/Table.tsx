import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className || ''}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<TableProps> = ({ children, className }) => {
  return (
    <thead className={`bg-gray-50 ${className || ''}`}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableProps> = ({ children, className }) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className || ''}`}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableProps> = ({ children, className }) => {
  return (
    <tr className={`hover:bg-gray-50 ${className || ''}`}>
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
  colSpan?: number;
}

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className, 
  isHeader = false,
  colSpan
}) => {
  const Component = isHeader ? 'th' : 'td';
  const baseClasses = isHeader 
    ? 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
    : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
  
  return (
    <Component className={`${baseClasses} ${className || ''}`} colSpan={colSpan}>
      {children}
    </Component>
  );
};
