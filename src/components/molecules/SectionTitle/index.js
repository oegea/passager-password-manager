// Dependencies
import styled from 'styled-components';
// Atoms
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';

const MoleculeSectionTitle = ({title, buttonLabel, onClick}) => {
    const SectionTitle = styled.div`
        align-items: auto;
        display: flex;
        margin-bottom: 23px;
        gap: 25px;
    `;

    return <SectionTitle>
        <Title>{title}</Title>
        <Button 
            backgroundColor="white"
            color="black"
            label={buttonLabel} 
            onClick={onClick}
            padding="5px" />
    </SectionTitle>
}

export default MoleculeSectionTitle;