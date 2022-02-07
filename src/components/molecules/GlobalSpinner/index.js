// Third party dependencies
import React from 'react';
// Atoms 
import AtomSpinner from '../../atoms/Spinner';
import AtomOverlayBackground from '../../atoms/OverlayBackground';

const MoleculeGlobalSpinner = () => {

    return (
        <AtomOverlayBackground>
            <AtomSpinner />
        </AtomOverlayBackground>
    );
};

MoleculeGlobalSpinner.displayName = 'MoleculeGlobalSpinner';
MoleculeGlobalSpinner.propTypes = {};

export default MoleculeGlobalSpinner;