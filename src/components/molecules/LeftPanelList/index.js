// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const DeleteLabel = styled.span`
    color: red;
    cursor: pointer;
    display: none;
    font-weight: normal;
    margin-left: 15px;

    &:hover{
        font-weight: bold;
    }
`;
const LeftPanelListItem = styled.div`
    align-items: center;
    display: flex;
    margin-bottom: 20px;

    &:hover{
        cursor: pointer;
        font-weight: bold;
        span {
            display: inline-block;
        }
    }
`;

const MoleculeLeftPanelList = ({deleteFolder, folders}) => {

    return <>
        {folders.map((folder, index) => 
            <LeftPanelListItem key={`folder-${index}`}>
                {folder.name}
                <DeleteLabel onClick={()=> deleteFolder(folder.id)}> (Delete)</DeleteLabel>
            </LeftPanelListItem>
        )}
    </>
}

MoleculeLeftPanelList.displayName = 'MoleculeLeftPanelList';
MoleculeLeftPanelList.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func,
}

export default MoleculeLeftPanelList;