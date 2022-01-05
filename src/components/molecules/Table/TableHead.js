// Third party dependencies
import styled from 'styled-components';
import PropTypes from 'prop-types';
// Atoms
import TableHeadData from '../../atoms/Table/TableHeadData.js';
import TableRow from '../../atoms/Table/TableRow.js';

const TableHead = styled.thead`
        text-align: left;
`

const MoleculeTableHead = ({columns}) => {
    return <TableHead>
        <TableRow>
            {columns.map((column) =>  <TableHeadData key={column}>{column}</TableHeadData>)}
        </TableRow>
    </TableHead>
}

MoleculeTableHead.displayName = 'MoleculeTableHead';
MoleculeTableHead.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.string)
}

export default MoleculeTableHead;