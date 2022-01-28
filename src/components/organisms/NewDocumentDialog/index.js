import React from 'react';
import PropTypes from 'prop-types';
// Atoms
import SideDialog from '../../atoms/SideDialog/index.js';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';

const NewDocumentDialog = ({onClose}) => {
    return (
        <SideDialog onClose={()=>onClose()}>
            <SectionTitle title="Create new credentials" />
            <button onClick={()=>onClose()}>Close</button>
        </SideDialog>
    )
}

NewDocumentDialog.displayName = 'NewDocumentDialog';
NewDocumentDialog.propTypes = {
    onClose: PropTypes.func,
}

export default NewDocumentDialog;