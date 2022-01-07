// Third party dependencies
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Icon from '@mdi/react'
// import { mdiFolderAccount, mdiFolder } from '@mdi/js';
import { mdiFolderAccount } from '@mdi/js';
// Atoms
import TableIconWrapper from '../../atoms/Table/TableIconWrapper.js';
import Dialog from '../../atoms/Dialog/Dialog.js';
import Title from '../../atoms/Title/index.js';
import Input from '../../atoms/Input/index.js';
import InputWrapper from '../../atoms/Dialog/DialogInputWrapper.js';
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
// Organisms
import Table from '../../organisms/Table/index.js'
// Templates
import Logged from '../../templates/Logged/index.js';

const PageHome = ({folders, signOut, createFolder}) => {

    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const _generateFolderRow = (icon, name, owner, lastModificationDate) => {
        return [
            <div>
                <TableIconWrapper>
                    <Icon path={icon}></Icon>
                </TableIconWrapper>
                {name}
            </div>,
            owner,
            lastModificationDate
        ];
    } 

    const formatedFolders = [];
    for (let i = 0; i < folders.length; i += 1){
        const folder = folders[i];
        formatedFolders.push(_generateFolderRow(mdiFolderAccount, folder.name, "Me", "Today"));
    }

    return <>
        <Logged signOut={signOut}>
            <SectionTitle title="My Folders" buttonLabel="New Folder" onClick={()=>setShowNewFolderDialog(true)}/>
            <Table
                columns={["Name", "Owner", "Last Modification Date"]}
                rows={formatedFolders}/>
            {showNewFolderDialog && 
            <Dialog onClose={() => setShowNewFolderDialog(false)}>
                <Title marginBottom='20px'>New Folder</Title>
                <InputWrapper>
                    <Input type="text" placeholder="New folder name" onChange={e => setNewFolderName(e.target.value)} />
                </InputWrapper>
                
                <ButtonWrapper>
                    <Button label="Cancel" onClick={() => setShowNewFolderDialog(false)} color="black" backgroundColor="white"/>
                    <Button label="Create" onClick={() => {
                        setShowNewFolderDialog(false); 
                        createFolder({name: newFolderName});
                    }} color="black" backgroundColor="white"/>
                </ButtonWrapper>
            </Dialog>}
        </Logged>
    </>

}

PageHome.displayName = 'PageHome';
PageHome.propTypes = {
    folders: PropTypes.array,
    signOut: PropTypes.func,
    createFolder: PropTypes.func,
}

export default PageHome;