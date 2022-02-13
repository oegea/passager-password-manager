// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Icon from '@mdi/react'
import { mdiMenu } from '@mdi/js'

const MenuIcon = styled.div`
    cursor: pointer;
    display: none;

    @media (max-width: 768px) {
        display: block;
    }
`;

const AtomAppBarMenuIcon = ({onClick}) => {
    return <MenuIcon>
            <Icon onClick={()=>onClick()} size="30px" path={mdiMenu}/>    
        </MenuIcon>
}

AtomAppBarMenuIcon.displayName = 'AtomAppBarMenuIcon';
AtomAppBarMenuIcon.propTypes = {
    onClick: PropTypes.func,
}

export default AtomAppBarMenuIcon;