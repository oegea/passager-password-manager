// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

    &:hover, &[data-isactive='true']{
        cursor: pointer;
        font-weight: bold;
        span {
            display: inline-block;
        }
    }

    & a {
        text-decoration: none;
        color: inherit;
    }
`;

const MoleculeLeftPanelList = ({deleteFolder, folders, selectedFolder}) => {

    return <>
        {folders.map((folder, index) => 
            <LeftPanelListItem 
                key={`folder-${index}`} 
                data-isactive={(selectedFolder === folder.id)}
            >
                <Link to={`/${folder.id}`}>
                    {folder.name}
                </Link>
                
                <DeleteLabel onClick={()=> deleteFolder(folder.id)}> (Delete)</DeleteLabel>
            </LeftPanelListItem>
        )}
    </>
}

MoleculeLeftPanelList.displayName = 'MoleculeLeftPanelList';
MoleculeLeftPanelList.propTypes = {
    deleteFolder: PropTypes.func,
    folders: PropTypes.array,
    selectedFolder: PropTypes.string,
}

export default MoleculeLeftPanelList;