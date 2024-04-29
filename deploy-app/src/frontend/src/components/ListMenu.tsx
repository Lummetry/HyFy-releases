import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import MainMenuEntries from "./MainMenuEntries";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import GlobalContext from "../contexts/GlobalContext";

const ListMenu = () => {
  const navigate = useNavigate();
  const { user } = useContext(GlobalContext);

  const handleListItemClick = (path: string) => {
    const entry = MainMenuEntries.find((entry) => entry.path === path);
    if (entry?.guard && user?.role !== entry.guard) {
      return;
    }

    navigate(path);
  };

  return (
    <List>
      {MainMenuEntries.filter((item) => {
        if (!item.guard) {
          return true;
        }

        return user?.role === item.guard;
      }).map((entry) => (
        <ListItemButton
          key={entry.title}
          onClick={() => handleListItemClick(entry.path)}
        >
          <ListItemIcon>{entry.icon}</ListItemIcon>
          <ListItemText primary={entry.title} />
        </ListItemButton>
      ))}
    </List>
  );
};

export default ListMenu;
