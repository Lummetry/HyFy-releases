import { Box, Button, Container, CssBaseline, Grid, Paper, TextField, ThemeProvider, Typography, createTheme, styled } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { UserService } from "../services/user.service";
import GlobalContext from "../contexts/GlobalContext";
import { useNavigate } from "react-router-dom";

import { APP_NAME } from "../Constants";

const StyledGridItem = styled(Grid)(() => ({
  height: '100vh', // Ensures the panel takes full viewport height
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}));

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%', // Fix IE 11 issue.
  marginTop: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: 'auto',
}));

const StyledSubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const innerTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const { updateUser, addSnackBar, isLoggedIn } = useContext(GlobalContext);
  const navigate = useNavigate();

  const userService = new UserService();
  // obtain the token from local storage
  useEffect(() => {
      if (isLoggedIn) {
          navigate('/dashboard');
      }
  }, [isLoggedIn, navigate]);

  // validate username
  useEffect(() => {
    if (username.length > 0) {
      setUsernameError(false);
    }
  }, [username]);

  // validate password
  useEffect(() => {
    if (password.length > 0) {
      setPasswordError(false);
    }
  }, [password]);

  // handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username === "") {
      setUsernameError(true);
    }

    if (password === "") {
      setPasswordError(true);
    }

    userService.login(username, password).then((token) => {
      userService.setToken(token.access_token);
      
      const user = {
        username: username,
        token: token.access_token,
        role: token.role,
        name: token.name || '',
        uuid: token.uuid || '',
      };

      updateUser(user);
      if (addSnackBar) addSnackBar({ message: "Welcome back!", type: "success", duration: 4000 });
      navigate("/dashboard");
    }).catch((error) => {
      console.log('login', error.response.data.detail);
      let message = error.response.data.detail || error.message;
      if (addSnackBar) addSnackBar({ message, type: "error", duration: 4000 });
    });
  };

  return (
    <ThemeProvider theme={innerTheme}>
      <Grid container component="main" sx={{ height: '100vh', margin: 0, padding: 0 }}>
        <CssBaseline />
        <StyledGridItem item xs={false} sm={4} md={7} sx={{
          backgroundImage: 'url(assets/hero-bg-276c1fbb.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <StyledGridItem item xs={12} sm={8} md={5} sx={{
          height: '100vh'  // Ensure it takes full viewport height
        }}>
          <Paper elevation={6} square sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: (t) => t.palette.mode === 'light' ? '#FFF' : '#282a3a' }}>
            <StyledForm noValidate onSubmit={handleSubmit}>
              <Container component="main" maxWidth="sm">

                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src='data:image/png;base64,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'
                    alt="Logo" 
                    style={{ marginBottom: '20px' }} />
                  <Typography component="h1" variant="h5">
                    {APP_NAME} - Sign in
                  </Typography>
                </Box>


                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="off"
                  autoFocus
                  error={usernameError}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  value={username}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  error={passwordError}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  value={password}
                />
                <StyledSubmitButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign In
                </StyledSubmitButton>
              </Container>
            </StyledForm>
          </Paper>
          
        </StyledGridItem>
      </Grid>
    </ThemeProvider>
  );
};

export default Login;
