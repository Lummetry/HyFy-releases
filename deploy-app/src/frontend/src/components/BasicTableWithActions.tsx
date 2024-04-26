import { TableContainer, Paper, Table, TableHead, TableCell, TableBody, TableRow } from "@mui/material";

interface BasicTableWithActionsProps {
    columns: { label: string; field: string; renderer?: (value: any) => JSX.Element; style?: React.CSSProperties }[];
    rows: any[];
    keyColumn: string;
    actionColumn?: (row: any) => JSX.Element;
};

const BasicTableWithActions = ({ columns, rows, keyColumn, actionColumn }: BasicTableWithActionsProps) => {
    const getNestedValue = (row: any, field: string) => {
        const keys = field.split('.');
        let value = row;
        for (let key of keys) {
            if (value[key] === undefined) {
                return null; // or a default value if necessary
            }
            value = value[key];
        }
        return value;
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell key={column.label} style={column.style}>{column.label}</TableCell>
                        ))}
                        {actionColumn && <TableCell>Actions</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row[keyColumn]}>
                            {columns.map((column) => (
                                <TableCell key={column.field} style={column.style}>
                                    {column.renderer ? column.renderer(getNestedValue(row, column.field)) : <div dangerouslySetInnerHTML={{ __html: getNestedValue(row, column.field) }} />}
                                </TableCell>
                            ))}
                            {actionColumn && (
                                <TableCell>
                                    {actionColumn(row)}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default BasicTableWithActions;
