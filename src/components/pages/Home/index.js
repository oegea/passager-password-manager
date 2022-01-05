import React from 'react';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
// Organisms
import Table from '../../organisms/Table/index.js'
// Templates
import LoggedTemplate from '../../templates/LoggedTemplate/index.js';


export default function Home(){

    return <>
        <LoggedTemplate>
            <SectionTitle title="My Folders" buttonLabel="New Folder" onClick={()=>alert("New Folder!")}/>
            <Table />
        </LoggedTemplate>
    </>

}