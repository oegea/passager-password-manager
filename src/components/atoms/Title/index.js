// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const AtomTitle = ({ children }) => {
    const Title = styled.div`
        font-size: 22px;
        font-weight: bold;
    `;

    return <Title>{children}</Title>
}

AtomTitle.displayName = 'AtomTitle';
AtomTitle.propTypes = {
    children: PropTypes.node,
};

export default AtomTitle;