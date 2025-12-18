import type { MouseEvent } from 'react';
import { useState } from 'react';

import { IconButton, Menu, MenuItem } from '@mui/material';

import toast from 'react-hot-toast';

import type { AbilityRule } from '@/types/general/permission';


import DeleteConfirmationDialog from '../dialog/delete-confirmation-dialog';
import Can from '../layouts/other/Can';

interface RowOption {
  name: string;
  icon: string;
  onClick: () => void;
  permission: AbilityRule;
}

interface RowOptionsProps<T extends { id?: string }> {
  item: T;
  options?: RowOption[];
  onEdit?: (item: T) => void;
  onDelete?: () => Promise<void> | void;
  deletePermissionRule?: AbilityRule;
  editPermissionRule?: AbilityRule;
}

const RowOptions = <T extends { id?: string }>({
  item,
  options,
  onEdit,
  onDelete,
  deletePermissionRule,
  editPermissionRule,
}: RowOptionsProps<T>) => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
  const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      await onDelete();
      toast.success('Item successfully deleted');
      handleCloseDeleteDialog();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleRowOptionsClose = () => setAnchorEl(null);

  const handleEdit = () => {
    if (!onEdit) return;
    onEdit(item);
    handleRowOptionsClose();
  };

  const rowOptionsOpen = Boolean(anchorEl);

  return (
    <>
      <IconButton
        size="small"
        onClick={handleRowOptionsClick}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: (theme) => `rgba(${theme.palette.primary.mainChannel} / 0.08)`,
            color: 'primary.main'
          }
        }}
      >
        <i className="tabler-dots-vertical text-[22px]" />
      </IconButton>

      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        {options?.map((option, index) => (
          <MenuItem
            key={index}
            onClick={option.onClick}
            sx={{
              gap: 3,
              '& i': { color: 'text.secondary' },
              '&:hover i': { color: 'primary.main' }
            }}
          >
            <i className={option.icon + ' text-[20px]'} />
            {option.name}
          </MenuItem>
        ))}

        {onEdit && editPermissionRule && (
          <MenuItem
            onClick={handleEdit}
            sx={{
              gap: 3,
              '& i': { color: 'text.secondary' },
              '&:hover i': { color: 'primary.main' }
            }}
          >
            <i className="tabler:edit text-[20px]" />
            Edit
          </MenuItem>
        )}

        {onDelete && (
          <MenuItem
            onClick={handleOpenDeleteDialog}
            sx={{
              gap: 3,
              '& i': { color: 'text.secondary' },
              '&:hover i': { color: 'error.main' },
              '&:hover': { color: 'error.main' }
            }}
          >
            <i className="tabler:trash text-[20px]" />
            Delete
          </MenuItem>
        )}
      </Menu>

      <DeleteConfirmationDialog
        handleClose={handleCloseDeleteDialog}
        open={isDeleteDialogOpen}
        onCancel={handleCloseDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default RowOptions;
