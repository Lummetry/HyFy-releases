import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography } from "@mui/material";
import { TagDataDTO } from "../pages/Dashboard";

interface TwoButtonsDialogProps {
    open: boolean;
    title: string;
    changeList: TagDataDTO[];
    onConfirm: () => void;
    onCancel: () => void;
};

const ChangeListDialog = ({ open, title, changeList, onConfirm, onCancel }: TwoButtonsDialogProps) => {
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
                    {changeList.map((change, index) => (
                        <Typography key={index} variant='body1'>
                            Promoting {change.environment}: {change.fromVersion} → {change.toVersion}
                        </Typography>
                    ))}
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

export default ChangeListDialog;