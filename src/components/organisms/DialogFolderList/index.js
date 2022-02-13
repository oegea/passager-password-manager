// Third party dependencies
import PropTypes from 'prop-types';
// Atoms
import Dialog from '../../atoms/Dialog/Dialog.js';
import Button from '../../atoms/Button/index.js';
import DialogButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
// Organisms
import FoldersListLeftPanel from '../FoldersListLeftPanel/index.js';

const OrganismDialogFolderList = ({onClose = () => null}) => {
    return (
        <Dialog onClose={() => onClose()}>
            <FoldersListLeftPanel onChange={()=> onClose()} />
            <DialogButtonWrapper>
                <Button label="Close" onClick={() => onClose()} />
            </DialogButtonWrapper>
        </Dialog>);

}

OrganismDialogFolderList.displayName = 'OrganismDialogFolderList';
OrganismDialogFolderList.propTypes = {
    onClose: PropTypes.func
};

export default OrganismDialogFolderList; 