import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

interface CustomStyles {
  theme: Theme;
}

export const GlobalStyle = createGlobalStyle<CustomStyles>`
  * {
        margin: 0;
        padding: 0;
        font-family: Roboto, Arial, Helvetica, sans-serif !important;
        transition: all 0.3s ease 0s;
        background-color: ${(props) => props.theme.primary};
        color: ${(props) => props.theme.text};
        text-decoration: none;
    }
`;
