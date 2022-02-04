// Third party dependencies
import PropTypes from 'prop-types';
// Atoms
import Table from '../../atoms/Table/Table.js';
import TableData from '../../atoms/Table/TableData.js';
import TableRow from '../../atoms/Table/TableRow.js';
// Molecules
import TableHead from '../../molecules/Table/TableHead.js';

const OrganismTable = ({columns, onClick = ()=>null, rows}) => {

    return <Table>
        <TableHead columns={columns} />
        <tbody>
            {rows.map((row, rowIndex)=> 
                <TableRow key={rowIndex} onClick={()=>onClick(rowIndex)}>
                    {row.map( (rowData, i) => <TableData key={columns[i]}>{rowData}</TableData>)}
                </TableRow>
            )}
        </tbody>
    </Table>
}

OrganismTable.displayName = 'OrganismTable';
OrganismTable.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.string),
    rows: PropTypes.arrayOf(PropTypes.node),
    onClick: PropTypes.func,
}

export default OrganismTable;