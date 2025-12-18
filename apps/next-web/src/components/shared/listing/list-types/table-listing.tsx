import { useState } from 'react';

import { Box, Card } from '@mui/material';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { Pagination } from '@platform/contracts';

// Make T a generic type parameter
interface TableListingProps<T> {
  columns: GridColDef[];
  items: T[]; // Use T[] for items
  pagination: Pagination;
  isLoading: boolean;
  onPagination?: (pageSize: number, page: number) => void;
}

const TableListing = <T,>({ columns, items, pagination, onPagination, isLoading }: TableListingProps<T>) => {

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: pagination?.page - 1,
    pageSize: pagination?.pageSize
  });

  const handlePaginationModelChange = (newPaginationModel: GridPaginationModel) => {
    setPaginationModel(newPaginationModel); // Update model unconditionally
    onPagination && onPagination(newPaginationModel.pageSize, newPaginationModel.page + 1);
  };

  return (
    <Box sx={{ width: '100%', mb: 6 }}>
      <Card sx={{ borderRadius: 1.5, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        <DataGrid
          rows={items}
          pageSizeOptions={[5, 10, 25, 50]}
          autoHeight
          pagination
          rowHeight={64}
          rowCount={pagination?.total}
          columns={columns}
          paginationMode="server"
          disableRowSelectionOnClick
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          loading={isLoading}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#f9fafb' : '#1f2937'),
              color: 'text.secondary',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#f3f4f6' : '#374151'),
                cursor: 'pointer',
                transition: 'background-color 0.2s ease-in-out'
              }
            },
            '& .MuiDataGrid-cell': {
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary'
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              '& .MuiTablePagination-root': {
                color: 'text.secondary'
              }
            }
          }}
        />
      </Card>
    </Box>
  );
};

export default TableListing;
