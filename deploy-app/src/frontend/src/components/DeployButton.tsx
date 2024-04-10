import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface DeployButtonProps {
    onSelection: (selection: string) => void;
}

export default function DeployButton({ onSelection }: DeployButtonProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const elementSelected = (selection: string) => {
    onSelection(selection);
    handleClose();
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        variant='contained'
      >
        Deploy to
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => elementSelected('staging')}>Staging</MenuItem>
        <MenuItem onClick={() => elementSelected('qa')}>QA</MenuItem>
        <MenuItem onClick={() => elementSelected('pre')}>Pre Prod</MenuItem>
        <MenuItem onClick={() => elementSelected('prod')}>Prod</MenuItem>
      </Menu>
    </div>
  );
}