/** 
 * This file is part of Passager Password Manager.
 * https://github.com/oegea/passager-password-manager
 * 
 * Copyright (C) 2022 Oriol Egea Carvajal
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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