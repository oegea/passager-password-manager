// Third party dependencies
import styled from 'styled-components';
import PropTypes from 'prop-types';
// Atoms
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';

const SectionTitle = styled.div`
    align-items: auto;
    display: flex;
    margin-bottom: 30px;
    gap: 25px;
`;
const MoleculeSectionTitle = ({title, buttonLabel, onClick}) => {
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

MoleculeSectionTitle.displayName = 'MoleculeSectionTitle';
MoleculeSectionTitle.propTypes = {
    title: PropTypes.string,
    buttonLabel: PropTypes.string,
    onClick: PropTypes.func,
};

export default MoleculeSectionTitle;