// Libraries
import styled from 'styled-components';
// Organisms
import AppBar from '../../organisms/AppBar/index.js';

export default function LoggedLayout({children}){

    const ContentWrapper = styled.div`
        width: 70%;
        margin: 0 auto;
        max-width: 70%;
    `;

    return <>
        <AppBar />
        <ContentWrapper>
            {children}
        </ContentWrapper>
    </>

}