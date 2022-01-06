// Atoms
import Toolbar from '../../atoms/Toolbar/index.js';
import ToolbarInput from '../../atoms/ToolbarInput/index.js';
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';

const OrganismAppBar = () => {

    return <Toolbar>
        <Title>Passager</Title>
        <ToolbarInput type="text" placeholder="Search" />
        <Button 
            backgroundColor="black"
            color="white"
            label="Logout" 
            onClick={()=>window.location.href = '/login'} />
    </Toolbar>

}

OrganismAppBar.displayName = 'OrganismAppBar';

export default OrganismAppBar;