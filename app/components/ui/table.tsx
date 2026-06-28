"use client";

import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes, type ReactNode } from "react";

/**
 * Table column definition
 */
export interface TableColumn<T> {
  key: string;
  label: string;
  className?: string;
  render?: (item: T, index: number) => ReactNode;
}

/**
 * Table props
 */
export interface TableProps<T> extends HTMLAttributes<HTMLTableElement> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  emptyMessage?: string | ReactNode;
  onRowClick?: (item: T) => void;
  selectedKey?: string | number;
  className?: string;
}

/**
 * TableHeader component
 */
export function TableHeader<T>({
  columns,
  className = "",
  ...props
}: {
  columns: TableColumn<T>[];
  className?: string;
} & HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={className} {...props}>
      <tr className="border-b border-white/8">
        {columns.map((column) => (
          <th
            key={column.key}
            className={`pb-3 px-4 pt-4 font-semibold text-white/80 text-left ${column.className || ""}`}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/**
 * TableCell component
 */
export function TableCell({
  children,
  className = "",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`py-4 px-4 ${className}`} {...props}>
      {children}
    </td>
  );
}

/**
 * TableRow component
 */
export function TableRow({
  children,
  className = "",
  onClick,
  selected = false,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { onClick?: () => void; selected?: boolean }) {
  return (
    <tr
      className={`border-b border-white/8 hover:bg-white/8 transition-colors ${selected ? "bg-white/8" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
}

/**
 * TableBody component
 */
export function TableBody<T>({
  columns,
  data,
  keyExtractor = (_, index) => index.toString(),
  emptyMessage = "No data available",
  onRowClick,
  selectedKey,
  renderRow,
  className = "",
  ...props
}: {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  emptyMessage?: string | ReactNode;
  onRowClick?: (item: T) => void;
  selectedKey?: string | number;
  renderRow?: (item: T, index: number) => ReactNode;
  className?: string;
} & HTMLAttributes<HTMLTableSectionElement>) {
  if (data.length === 0) {
    return (
      <tbody className={className} {...props}>
        <tr>
          <td colSpan={columns.length} className="py-8 text-center text-white/46">
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className={className} {...props}>
      {data.map((item, index) => {
        const key = keyExtractor(item, index);
        const isSelected = selectedKey !== undefined && key === String(selectedKey);

        if (renderRow) {
          return (
            <TableRow
              key={key}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              selected={isSelected}
            >
              {renderRow(item, index)}
            </TableRow>
          );
        }

        return (
          <TableRow
            key={key}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            selected={isSelected}
          >
            {columns.map((column) => (
              <TableCell key={`${key}-${column.key}`}>
                {column.render ? column.render(item, index) : (item as any)[column.key]}
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </tbody>
  );
}

/**
 * TableFooter component
 */
export function TableFooter({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot className={className} {...props}>
      {children}
    </tfoot>
  );
}

/**
 * Table component - Standardized table with consistent styling
 */
export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage,
  onRowClick,
  selectedKey,
  className = "",
  ...props
}: TableProps<T>) {
  return (
    <table className={`w-full text-left text-sm ${className}`} {...props}>
      <TableHeader columns={columns} />
      <TableBody
        columns={columns}
        data={data}
        keyExtractor={keyExtractor}
        emptyMessage={emptyMessage}
        onRowClick={onRowClick}
        selectedKey={selectedKey}
      />
    </table>
  );
}
