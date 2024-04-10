import { TableContainer, Paper, Table, TableHead, TableCell, TableBody, TableRow } from "@mui/material";

interface BasicTableWithActionsProps {
    columns: any[];
    rows: any[];
    keyColumn: string;
    actionColumn?: (row: any) => JSX.Element;
};

const BasicTableWithActions = ({ columns, rows, keyColumn, actionColumn }: BasicTableWithActionsProps) => {

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    {columns.map((column) => (
                        <TableCell key={column.label}>{column.label}</TableCell>
                    ))}
                    <TableCell>Actions</TableCell>
                </TableHead>
                <TableBody>
                    {rows.map((row: any) => (
                        <TableRow key={row[keyColumn]}>
                            {columns.map((column) => (
                                <TableCell key={column.field}>{row[column.field]}</TableCell>
                            ))}
                            <TableCell>
                                {actionColumn ? actionColumn(row): ''}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default BasicTableWithActions;