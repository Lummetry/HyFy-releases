import React, { useContext, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Button from "@mui/material/Button";

import ListMenu from "../components/ListMenu";
import GlobalContext from "../contexts/GlobalContext";
import Snackbar from '@mui/material/Snackbar';
import { Alert } from "@mui/material";
import { APP_NAME } from "../Constants";


interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [open, setOpen] = useState(true);
  const { logout, getSnackBars, removeSnackBar } = useContext(GlobalContext);
  const drawerWidth = 240;

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    logout && logout();
  };

  const RenderSnackbar = () => {

    if (!getSnackBars) return null;
    const snackBars = getSnackBars();

    const handleClose = (id: number) => {
      console.log('Close button clicked');
      if (removeSnackBar) {
        removeSnackBar(id);
      }
    };

    return (
      <>
        {snackBars.map((snack) => (
          <Snackbar key={snack.id} anchorOrigin={{ vertical: 'bottom', horizontal: 'right'}} open={snack.state} autoHideDuration={snack.duration} onClose={() => handleClose(snack.id || 0)}>
            <Alert
              key={snack.id}
              onClose={() => handleClose(snack.id || 0)}
              severity={ snack.type === 'error' ? 'error' : 'success'}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snack.message}
            </Alert>
        </Snackbar>
        ))}
      </>
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, mb: 5}}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {APP_NAME}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <ListMenu />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: open ? 0 : `-${drawerWidth}px`,
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
        }}
      >
        {/* <Toolbar /> */}
        <Box sx={{ marginTop: `60px`}}>
          {children}
        </Box>

        <RenderSnackbar />
      </Box>
    </Box>
  );
};

export default MainLayout;
