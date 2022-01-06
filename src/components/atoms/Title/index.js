// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Title = styled.div`
    font-size: 22px;
    font-weight: bold;
    margin-bottom: ${props => props.marginBottom};
`;

const AtomTitle = ({ children, marginBottom = '0px' }) => {
    return <Title marginBottom={marginBottom}>{children}</Title>
}

AtomTitle.displayName = 'AtomTitle';
AtomTitle.propTypes = {
    children: PropTypes.node,
    marginBottom: PropTypes.string,
};

export default AtomTitle;