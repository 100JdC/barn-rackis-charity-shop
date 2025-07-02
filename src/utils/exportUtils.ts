
import * as XLSX from 'xlsx';
import type { Item } from '@/types/item';

export const exportItemsToExcel = (items: Item[]) => {
  // Calculate sold items count and total sold quantities
  const soldItemsCount = items.filter(item => item.status === 'sold').length;
  const totalSoldQuantity = items
    .filter(item => item.status === 'sold')
    .reduce((sum, item) => sum + item.quantity, 0);
  
  // Transform items data for Excel export
  const excelData = items.map(item => ({
    'Item ID': item.id,
    'Name': item.name,
    'Description': item.description || '',
    'Category': item.category,
    'Subcategory': item.subcategory,
    'Condition': item.condition,
    'Quantity': item.quantity,
    'Sold Quantity': item.status === 'sold' ? item.quantity : 0,
    'Original Price (SEK)': item.original_price,
    'Suggested Price (SEK)': item.suggested_price,
    'Final Price (SEK)': item.final_price || '',
    'Status': item.status,
    'Reserved By': item.reserved_by || '',
    'Location': item.location || '',
    'Internal Notes': item.internal_notes || '',
    'Donor Name': item.donor_name || '',
    'Created By': item.created_by,
    'Updated By': item.updated_by,
    'Created At': new Date(item.created_at).toLocaleString(),
    'Updated At': new Date(item.updated_at).toLocaleString(),
    'Photos Count': item.photos.length
  }));

  // Add summary row at the beginning
  const summaryData = [{
    'Item ID': 'SUMMARY',
    'Name': `Total Items: ${items.length}`,
    'Description': `Sold Items: ${soldItemsCount}`,
    'Category': `Available: ${items.filter(i => i.status === 'available').length}`,
    'Subcategory': `Reserved: ${items.filter(i => i.status === 'reserved').length}`,
    'Condition': `Total Sold Quantity: ${totalSoldQuantity}`,
    'Quantity': '',
    'Sold Quantity': totalSoldQuantity,
    'Original Price (SEK)': '',
    'Suggested Price (SEK)': '',
    'Final Price (SEK)': '',
    'Status': '',
    'Reserved By': '',
    'Location': '',
    'Internal Notes': '',
    'Donor Name': '',
    'Created By': '',
    'Updated By': '',
    'Created At': '',
    'Updated At': '',
    'Photos Count': ''
  }, {}]; // Empty row for separation

  // Combine summary and items data
  const allData = [...summaryData, ...excelData];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(allData);

  // Auto-size columns
  const colWidths = Object.keys(excelData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Items');

  // Generate filename with current date
  const date = new Date().toISOString().split('T')[0];
  const filename = `rackis-inventory-backup-${date}.xlsx`;

  // Write and download file
  XLSX.writeFile(workbook, filename);
};
