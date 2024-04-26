import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";

export interface AlertDialogProps {
    id?: number;
    title: string;
    message: string;
    bullets?: string[];
    handleClose?: (id: number) => void;
    state?: boolean;
}

const AlertDialog = ({ id, title, message, bullets, handleClose, state }: AlertDialogProps) => {
    console.log(`AlertDialog: id: ${id}, title: ${title}, message: ${message}, bullets: ${bullets}, state: ${state}`);
    const onButtonClick = () => {
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
                        <>
                            <Typography variant="body1">{message}</Typography>
                            {bullets && bullets.map((bullet, index) => (
                                <Typography variant="body1" key={index}>{bullet}</Typography>
                            ))}
                        </>
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