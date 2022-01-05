// Atoms
import Toolbar from '../../atoms/Toolbar/index.js';
import Input from '../../atoms/Input/index.js';
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';

const OrganismAppBar = () => {

    return <Toolbar>
        <Title>Passager</Title>
        <Input type="text" placeholder="Search" />
        <Button 
            backgroundColor="black"
            color="white"
            label="Logout" 
            onClick={()=>alert('Goodbye!')} />
    </Toolbar>

}

OrganismAppBar.displayName = 'OrganismAppBar';

export default OrganismAppBar;