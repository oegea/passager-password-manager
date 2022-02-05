// Third party dependencies
import PropTypes from 'prop-types';
// Atoms
import Toolbar from '../../atoms/Toolbar/index.js';
// import ToolbarInput from '../../atoms/ToolbarInput/index.js';
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';

const OrganismAppBar = ({signOut, marginBottom}) => {

    const {t} = useTranslation();

    return <Toolbar marginBottom={marginBottom}>
        <Title>Passager</Title>
        {/*<ToolbarInput type="text" placeholder={t('topbar.Search')}  />*/}
        <Button 
            backgroundColor="black"
            color="white"
            label={t('topbar.Logout')}
            onClick={signOut} />
    </Toolbar>

}

OrganismAppBar.displayName = 'OrganismAppBar';
OrganismAppBar.propTypes = {
    signOut: PropTypes.func,
    marginBottom: PropTypes.string,
}

export default OrganismAppBar;