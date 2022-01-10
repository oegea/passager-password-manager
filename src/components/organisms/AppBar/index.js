// Third party dependencies
import PropTypes from 'prop-types';
// Atoms
import Toolbar from '../../atoms/Toolbar/index.js';
import ToolbarInput from '../../atoms/ToolbarInput/index.js';
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';

const OrganismAppBar = ({signOut, marginBottom}) => {

    return <Toolbar marginBottom={marginBottom}>
        <Title>Passager</Title>
        <ToolbarInput type="text" placeholder="Search"  />
        <Button 
            backgroundColor="black"
            color="white"
            label="Logout" 
            onClick={signOut} />
    </Toolbar>

}

OrganismAppBar.displayName = 'OrganismAppBar';
OrganismAppBar.propTypes = {
    signOut: PropTypes.func,
    marginBottom: PropTypes.string,
}

export default OrganismAppBar;