import styled from 'styled-components';
import { mdiFolderAccount, mdiFolder } from '@mdi/js';
import Icon from '@mdi/react'

const OrganismTable = () => {

    const Table = styled.table`
        border-spacing: 0;
        width: 100%;
    `

    const TableHead = styled.thead`
        text-align: left;
    `

    const TableRow = styled.tr`

    `

    const TableData = styled.td`
        border-bottom: 1px solid rgb(199, 199, 199);
        padding-bottom: 15px;
        padding-top: 15px;
    `
    const TableHeadData = styled.th`
        border-bottom: 1px solid rgb(199, 199, 199);
        padding-bottom: 15px;
    `

    const IconWrapper = styled.div`
        display: inline;
        height: 21px;
        position: relative;
        top: 4px;
        margin-right: 7px;

        & svg{
            height: 21px;
        }
    `
    return <Table>
        <TableHead>
            <TableRow>
                <TableHeadData>Name</TableHeadData>
                <TableHeadData>Owner</TableHeadData>
                <TableHeadData>Last modification date</TableHeadData>
            </TableRow>
        </TableHead>
        <tbody>
            <TableRow>
                <TableData>
                    <IconWrapper>
                        <Icon path={mdiFolderAccount} color="black"/>
                    </IconWrapper>
                    Personal passwords
                </TableData>
                <TableData>Me</TableData>
                <TableData>Today</TableData>
            </TableRow>

            <TableRow>
                <TableData>
                    <IconWrapper>
                        <Icon path={mdiFolder} color="black"/>
                    </IconWrapper>
                    Side project 1
                </TableData>
                <TableData>Me</TableData>
                <TableData>Today</TableData>
            </TableRow>

            <TableRow>
                <TableData>My daily team</TableData>
                <TableData>Me</TableData>
                <TableData>Today</TableData>
            </TableRow>


            <TableRow>
                <TableData>Marketing Team</TableData>
                <TableData>Me</TableData>
                <TableData>Today</TableData>
            </TableRow>

            <TableRow>
                <TableData>Other team</TableData>
                <TableData>Me</TableData>
                <TableData>Today</TableData>
            </TableRow>

            <TableRow>
                <TableData>Archive</TableData>
                <TableData>Me</TableData>
                <TableData>Today</TableData>
            </TableRow>

            <TableRow>
                <TableData>Super Important And Secret Project</TableData>
                <TableData>Me</TableData>
                <TableData>Today</TableData>
            </TableRow>
        </tbody>
    </Table>
}

export default OrganismTable;