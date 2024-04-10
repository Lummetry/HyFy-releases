import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

import MainMenuEntries from "./MainMenuEntries";
import { useNavigate } from "react-router-dom";

const ListMenu = () => {
    const navigate = useNavigate();
    const handleListItemClick = (path: string) => {
        navigate(path);
    };

    return (
        <List>
            {MainMenuEntries.map((entry) => (
                <ListItemButton key={entry.title} onClick={() => handleListItemClick(entry.path)}>
                    <ListItemIcon>
                        {entry.icon}
                    </ListItemIcon>
                    <ListItemText primary={entry.title} />
                </ListItemButton>
            ))}
        </List>
    );
};

export default ListMenu;