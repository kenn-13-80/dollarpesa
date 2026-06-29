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
                <LegacyChartLineIcon iconSize='xs' />
                <Text>{localize('Analysis')}</Text>
            </MenuItem>
        </>
    );
});

export const TradershubLink = observer(() => {
    return null;
});

type MenuItemsType = typeof MenuItems & {
    TradershubLink: typeof TradershubLink;
};

(MenuItems as MenuItemsType).TradershubLink = TradershubLink;

export default MenuItems as MenuItemsType;
