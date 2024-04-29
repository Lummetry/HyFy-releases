import { Box, Button, Container, Grid, Paper, Switch, Typography } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import GlobalContext from "../contexts/GlobalContext";
import { useContext, useEffect, useState } from "react";
import UpdateIcon from "@mui/icons-material/Update";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [drawerOpenPreference, setDrawerOpenPreference] = useState(false);
  const { user, setUserPreferences, getUserPreferences } = useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (getUserPreferences) {
      const preferences = getUserPreferences();
      setDrawerOpenPreference(preferences.hideMenuDrawer || false);
    }
  }, []);

  const handleUpdateProfileButtonClick = () => {
    if (user?.uuid) {
      navigate(`/users/update/${user.uuid}`);
    }
    return;
  };

  const handleHideMenuDrawerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (setUserPreferences) { 
      setUserPreferences({ hideMenuDrawer: event.target.checked });
      setDrawerOpenPreference(event.target.checked);
    }
  };

  return (
    <MainLayout>
      <Container>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4">Profile</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5">User Information</Typography>
                </Box>
                <Typography variant="body1">
                  <strong>Username:</strong> {user?.username}
                </Typography>
                <Typography variant="body1">
                  <strong>Name:</strong> {user?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Role:</strong> {user?.role}
                </Typography>

                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => handleUpdateProfileButtonClick()}>
                  <UpdateIcon />
                  &nbsp;Update profile
                </Button>
              </Paper>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5">Preferences</Typography>
                </Box>
                <Box sx={{ mb: 2}} display='flex' justifyContent='space-between'>
                  <Typography variant="body1">Hide menu drawer (default open)</Typography>
                  <Switch 
                    checked={drawerOpenPreference} 
                    onChange={handleHideMenuDrawerChange} 
                    inputProps={{ 'aria-label': 'controlled' }} />
                </Box>
              </Paper>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </MainLayout>
  );
};

export default Profile;
