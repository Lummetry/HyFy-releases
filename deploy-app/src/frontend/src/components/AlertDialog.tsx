import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export interface AlertDialogProps {
    id?: number;
    title: string;
    message: string;
    handleClose?: (id: number) => void;
    state?: boolean;
}

const AlertDialog = ({ id, title, message, handleClose, state }: AlertDialogProps) => {
    const onButtonClick = () => {
        console.log(`AlertDialog: onButtonClick: id: ${id}`);
        handleClose && handleClose(id || 0);
    };

    return (
        <>
            <Dialog
                open={state || false}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onButtonClick} autoFocus>OK</Button>
                </DialogActions>
            </Dialog>
        </>
    )
};

export default AlertDialog;