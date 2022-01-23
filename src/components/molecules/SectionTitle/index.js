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
const MoleculeSectionTitle = ({title, buttons = []}) => {
    return <SectionTitle>
        <Title>{title}</Title>
        {buttons.map(button => 
            <Button 
                key={button.label} 
                label={button.label} 
                onClick={button.onClick}
                padding="5px"
                color={button.color || 'black'}
                backgroundColor={button.backgroundColor || 'white'}/>
        )}

    </SectionTitle>
}

MoleculeSectionTitle.displayName = 'MoleculeSectionTitle';
MoleculeSectionTitle.propTypes = {
    title: PropTypes.string,
    buttons: PropTypes.arrayOf(PropTypes.shape({
        backgroundColor: PropTypes.string,
        color: PropTypes.string,
        label: PropTypes.string,
        onClick: PropTypes.func,
    })),
};

export default MoleculeSectionTitle;