import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { UserService } from "../services/user.service";
import GlobalContext from "../contexts/GlobalContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const { updateUser, addSnackBar } = useContext(GlobalContext);
  const navigate = useNavigate();

  const userService = new UserService();
  // obtain the token from local storage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      userService.setToken(token);
      navigate("/dashboard");
    }
  }, []);

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
        name: '',
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
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 8,
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
