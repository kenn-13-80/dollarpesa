import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { useTranslations } from '@deriv-com/translations';
import { MenuItem, Text } from '@deriv-com/ui';
import { LegacyChartLineIcon } from '@deriv/quill-icons/Legacy';

export const MenuItems = observer(() => {
    const { localize } = useTranslations();
    const store = useStore();
    const navigate = useNavigate();
    const is_logged_in = store?.client?.is_logged_in ?? false;

    const handleAnalysisClick = () => {
        navigate('/analysis');
    };

    if (!is_logged_in) return null;

    return (
        <>
            <MenuItem
                as='button'
                className='app-header__menu'
                onClick={handleAnalysisClick}
            >
                <LegacyChartLineIcon iconSize='xs' className='mr-8' />
                <Text>{localize('Analysis')}</Text>
            </MenuItem>
        </>
    );
});

export const TradershubLink = observer(() => {
    // No default Traders Hub link - add your custom navigation here if needed
    return null;
});

// Create a namespace for MenuItems to include TradershubLink
type MenuItemsType = typeof MenuItems & {
    TradershubLink: typeof TradershubLink;
};

// Assign TradershubLink to MenuItems
(MenuItems as MenuItemsType).TradershubLink = TradershubLink;

export default MenuItems as MenuItemsType;
