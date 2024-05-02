import { Box, Button, Container, Fab, Grid, Typography } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import AddIcon from '@mui/icons-material/Add';
import { useContext, useEffect, useState } from "react";
import { UserService } from "../services/user.service";
import TwoButtonsDialog from "../components/TwoButtonsDialog";
import BasicTableWithActions from "../components/BasicTableWithActions";
import { useNavigate } from "react-router-dom";
import  GlobalContext  from "../contexts/GlobalContext";

const userService = new UserService();

const Users = () => {
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState('');
    const [configDelete, setConfigDelete] = useState(false);

    const navigate = useNavigate();
    const { addSnackBar } = useContext(GlobalContext);

    useEffect(() => {
        userService.getUsers().then((data) => {
            const users = data.map((row: any) => {
                return {...row, username: atob(row.username)};
            });
            setUsers(users);
        });
    }, []);

    useEffect(() => {
        if (configDelete && userToDelete !== '') {
            const userService = new UserService();
            userService.deleteUser(userToDelete).then(() => {
                const newUsers = users.filter((row: any) => row.uuid !== userToDelete);
                setUsers(newUsers);
                setOpen(false);
                if (addSnackBar) addSnackBar({ message: 'User deleted successfully', type: 'success', duration: 3000 });
            }).catch((error) => {
                let message = error.response.data.detail || error.message;
                if (addSnackBar) addSnackBar({ message, type: 'error', duration: 3000 });
            });
        }
    }, [configDelete]);

    const handleFabClick = () => {
        navigate('/users/create');
    };

    const handleDeleteButtonClick = (uuid: string) => {
        console.log('Delete button clicked', uuid);
        setOpen(true);
        setUserToDelete(uuid);
    };

    const handleEditButtonClick = (uuid: string) => {
        console.log('Edit button clicked', uuid);
        navigate(`/users/update/${uuid}`);
    };

    const handleOnDialogCancel = () => {
        console.log('Close button clicked');
        setOpen(false);
    };

    const handleOnDialogConfirm = () => {
        console.log('Confirm button clicked');
        setConfigDelete(true);
    };

    /**
     * Table columns
     */
    const tableColumns = [
        { label: 'UUID', field: 'uuid' },
        { label: 'Name', field: 'name' },
        { label: 'Username', field: 'username'},
        { label: 'Role', field: 'role'},
    ];

    /**
     * Handle table actions
     * @param row 
     * @returns 
     */
    const tableActions = (row: any) => {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} md='auto'>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary" 
                        onClick={() => handleEditButtonClick(row.uuid)}>
                        Edit
                    </Button>
                </Grid>
                <Grid item xs={12} md="auto">
                    <Button 
                        fullWidth 
                        variant="contained" 
                        color="error" 
                        onClick={() => handleDeleteButtonClick(row.uuid)}>
                        Delete
                    </Button>
                </Grid>
            </Grid>
        );
    };


    return (
        <MainLayout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box >
                    <Typography variant="h4" component="h1" gutterBottom>
                        Users
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <BasicTableWithActions keyColumn="uuid" columns={tableColumns} rows={users} actionColumn={tableActions} />
                    </Grid>
                </Grid>

                <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 16, right: 16 }} onClick={handleFabClick}>
                    <AddIcon />
                </Fab>

                <TwoButtonsDialog 
                            open={open} 
                            onCancel={handleOnDialogCancel} 
                            onConfirm={handleOnDialogConfirm} 
                            title="Delete User" 
                            message="Are you sure you want to delete this user?" />
                
            </Container>
        </MainLayout>
    );
};

export default Users;