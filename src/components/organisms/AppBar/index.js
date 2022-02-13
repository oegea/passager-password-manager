// Third party dependencies
import { useState } from 'react';
import PropTypes from 'prop-types';
// Atoms
import Toolbar from '../../atoms/Toolbar/index.js';
// import ToolbarInput from '../../atoms/ToolbarInput/index.js';
import Title from '../../atoms/Title/index.js';
import AtomToolbarButton from '../../atoms/ToolbarButton/index';
import AppBarMenuIcon from '../../atoms/AppBarMenuIcon/index.js';
// Organisms
import DialogFolderList from '../DialogFolderList/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';

const OrganismAppBar = ({signOut, marginBottom}) => {
    const [showFolders, setShowFolders] = useState(false);
    const {t} = useTranslation();

    return (<>
        <Toolbar marginBottom={marginBottom}>
            <AppBarMenuIcon onClick={() => setShowFolders(!showFolders)} />
            <Title>Passager</Title>
            {/*<ToolbarInput type="text" placeholder={t('topbar.Search')}  />*/}
            <AtomToolbarButton 
                label={t('common.Logout')}
                onClick={signOut} />
        </Toolbar>
        {showFolders && <DialogFolderList onClose={() => setShowFolders(false)} />}
    </>);


}

OrganismAppBar.displayName = 'OrganismAppBar';
OrganismAppBar.propTypes = {
    signOut: PropTypes.func,
    marginBottom: PropTypes.string,
}

export default OrganismAppBar;