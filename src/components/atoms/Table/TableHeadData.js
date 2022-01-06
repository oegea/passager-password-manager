// Third party dependencies
import styled from 'styled-components';

const TableHeadData = styled.th`
    border-bottom: 1px solid rgb(199, 199, 199);
    padding-bottom: 15px;
`

const AtomTableHeadData = (props) => {
    return <TableHeadData {...props} />
};

AtomTableHeadData.displayName = 'AtomTableHeadData';

export default AtomTableHeadData;