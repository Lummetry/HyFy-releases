import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

interface TwoButtonsDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

const TwoButtonsDialog = ({ open, title, message, onConfirm, onCancel }: TwoButtonsDialogProps) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
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
                <Button onClick={onCancel}>Disagree</Button>
                <Button onClick={onConfirm} autoFocus>
                    Agree
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TwoButtonsDialog;