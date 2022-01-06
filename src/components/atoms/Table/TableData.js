// Third party dependencies
import styled from 'styled-components';

const TableData = styled.td`
    border-bottom: 1px solid rgb(199, 199, 199);
    padding-bottom: 15px;
    padding-top: 15px;
`
const AtomTableData = (props) => {
    return <TableData {...props} />;
}

AtomTableData.displayName = 'AtomTableData';

export default AtomTableData;