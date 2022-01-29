// Third party dependencies
import { useTranslation } from 'react-i18next';

// Wrap the original hook to decouple from the library
const useTranslationHook = () => {
    const { t } = useTranslation();
    return {
        t,
    };
}

export default useTranslationHook;