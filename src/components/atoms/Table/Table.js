// Third party dependencies
import styled from 'styled-components';

const Table = styled.table`
    border-spacing: 0;
    width: 100%;
`
const AtomTable = (props) => {
    return <Table {...props} />
}

AtomTable.displayName = 'AtomTable';

export default AtomTable;