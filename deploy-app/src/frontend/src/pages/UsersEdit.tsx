import { Container, Box, Typography, Grid, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { useContext, useEffect, useState } from "react";
import { UserModel } from "../models/User";
import { UserService } from "../services/user.service";
import { useParams } from "react-router-dom";
import GlobalContext from "../contexts/GlobalContext";

const UsersEdit = () => {
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState(''); 
    const [fullName, setFullName] = useState(''); 
    const [fullNameError, setFullNameError] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [role, setRole] = useState('regular');
    const [formIsValid, setFormIsValid] = useState(true);

    const { uuid } = useParams();
    const { addSnackBar } = useContext(GlobalContext);

    useEffect(() => {
        if (uuid) {
            const userService = new UserService();
            userService.getUser(uuid).then((data) => {
                setUsername(atob(data.username));
                setFullName(data.name);
                setRole(data.role);
            });
        }
    }, []);

    useEffect(() => {
        if (password !== confirmPassword) {
            setPasswordError(true);
            setPasswordErrorMessage('Passwords do not match');
            setFormIsValid(false);
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
            setFormIsValid(true);
        }
    }, [confirmPassword]);

    const handleChangePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let formIsValid = true;

        if (password === '') {
            setPasswordError(true);
            setPasswordErrorMessage('Please enter a password');
            formIsValid = false;
        } else {
            setPasswordError(false);
            formIsValid = true;
        }

        if (confirmPassword === '') {
            setConfirmPasswordError(true);
            formIsValid = false;
        } else {
            setConfirmPasswordError(false);
            formIsValid = true;
        }

        if (formIsValid) {
            const userModel = {
                username: username,
                password: password,
                name: fullName,
                role: role
            } as UserModel;

            uuid && updateUser(uuid, userModel);
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (username === '') {
            setUsernameError(true);
            setFormIsValid(false);
        } else {
            setUsernameError(false);
            setFormIsValid(true);
        }

        if (fullName === '') {
            setFullNameError(true);
            setFormIsValid(false);
        } else {
            setFullNameError(false);
            setFormIsValid(true);
        }

        if (formIsValid) {
            const userModel = {
                username: username,
                name: fullName,
                role: role
            } as UserModel;

            uuid && updateUser(uuid, userModel);
        }
    };

    const updateUser = (uuid: string, user: UserModel) => {
        const userService = new UserService();
        userService.updateUser(uuid, {...user, uuid}).then(() => {
            if (addSnackBar) addSnackBar({ message: 'User updated', type: 'success', duration: 4000 });
        }).catch((error) => {
            let message = error.response.data.detail || error.message;
            if (addSnackBar) addSnackBar({ message, type: 'error', duration: 4000 });
        });
    };

    return (
        <MainLayout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box >
                    <Typography variant="h4" component="h1" gutterBottom>
                        Edit User
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>

                            <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            error={usernameError}
                                            helperText={usernameError && "Please enter a username"}
                                            fullWidth
                                            autoComplete="off"
                                            required
                                        />
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Full Name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            error={fullNameError}
                                            helperText={fullNameError && "Please enter a full name"}
                                            fullWidth
                                            autoComplete="off"
                                        />
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Role</InputLabel>
                                            <Select
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                label="Role"
                                            >
                                                <MenuItem value="regular">Regular</MenuItem>
                                                <MenuItem value="admin">Admin</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button fullWidth variant="contained" color="primary" type="submit" size="large">
                                            Update
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>

                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleChangePasswordSubmit}>
                                <Grid container spacing={2}>
                                <Grid item xs={12}>
                                        <TextField
                                            label="Password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            error={passwordError}
                                            helperText={passwordError && passwordErrorMessage}
                                            fullWidth
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Confirm Password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            error={confirmPasswordError}
                                            helperText={confirmPasswordError && "Passwords do not match"}
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Button fullWidth variant="contained" color="error" type="submit" size="large">
                                            Change Password
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </MainLayout>
    );
};

export default UsersEdit;
