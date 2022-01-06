// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const AtomTitle = ({ children, marginBottom = '0px' }) => {
    const Title = styled.div`
        font-size: 22px;
        font-weight: bold;
        margin-bottom: ${marginBottom};
    `;

    return <Title>{children}</Title>
}

AtomTitle.displayName = 'AtomTitle';
AtomTitle.propTypes = {
    children: PropTypes.node,
    marginBottom: PropTypes.string,
};

export default AtomTitle;