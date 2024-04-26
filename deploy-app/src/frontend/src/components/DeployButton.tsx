import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface EnvInfo {
    info: string;
    name: string;
    version: string;
}

interface DeployButtonProps {
    currentVersions: EnvInfo[];
    possibleVersion: string;
    excludeEnvs: string[];
    onSelection: (selection: string, fromVersion: string, toVersion: string) => void;
}

export default function DeployButton({ currentVersions, possibleVersion, excludeEnvs, onSelection }: DeployButtonProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);

    const handleMenuOpenClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const elementSelected = (env: EnvInfo) => {
        onSelection(env.name, env.version, possibleVersion);
        handleMenuClose();
    };

    return (
        <div>
            <Button
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleMenuOpenClick}
                variant='contained'
            >
                Deploy to
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {currentVersions.map((env) => (
                    excludeEnvs && excludeEnvs.includes(env.name) ? null :
                    <MenuItem key={env.name} onClick={() => elementSelected(env)}>{env.info} ({env.name})</MenuItem>
                ))}
            </Menu>
        </div>
    );
}
