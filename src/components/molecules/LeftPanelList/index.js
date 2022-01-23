// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

const MoleculeLeftPanelList = ({folders, selectedFolder}) => {

    return <>
        {folders.map((folder, index) => 
            <LeftPanelListItem 
                key={`folder-${index}`} 
                data-isactive={(selectedFolder === folder.id)}
            >
                <Link to={`/${folder.id}`}>
                    {folder.name}
                </Link>
            </LeftPanelListItem>
        )}
    </>
}

MoleculeLeftPanelList.displayName = 'MoleculeLeftPanelList';
MoleculeLeftPanelList.propTypes = {
    folders: PropTypes.array,
    selectedFolder: PropTypes.string,
}

export default MoleculeLeftPanelList;