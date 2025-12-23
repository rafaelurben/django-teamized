import { LucideIcon } from 'lucide-react';
import React from 'react';

import { Badge } from '@/shadcn/components/ui/badge';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/shadcn/components/ui/sidebar';
import AppSidebarMenuItemWithSubmenu, {
    ItemWithSubmenu,
} from '@/teamized/components/layout/AppSidebarMenuItemWithSubmenu';
import {
    useNavigationState,
    usePageNavigator,
    usePageNavigatorURL,
} from '@/teamized/utils/navigation/navigationProvider';

interface ItemWithoutSubmenu {
    label: string;
    icon: LucideIcon;
    small?: boolean;
    isBeta?: boolean;
    page: string;
}

interface Props {
    groups: Array<{
        id: string;
        label?: string;
        items: Array<
            | ({
                  isSubmenu?: false;
              } & ItemWithoutSubmenu)
            | ({
                  isSubmenu: true;
              } & ItemWithSubmenu)
        >;
        hidden?: boolean;
    }>;
}

export default function AppSidebarMainNavigation({ groups }: Readonly<Props>) {
    const { setOpenMobile } = useSidebar();
    const selectPage = usePageNavigator();
    const getPageURL = usePageNavigatorURL();
    const { selectedPage } = useNavigationState();

    const pageSelector = (page: string) => (e: React.UIEvent) => {
        e.preventDefault();
        selectPage(page);
        setOpenMobile(false);
    };

    return groups
        .filter((g) => !g.hidden)
        .map((group) => (
            <SidebarGroup key={group.id}>
                {group.label && (
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                    <SidebarMenu>
                        {group.items.map((item) =>
                            item?.isSubmenu ? (
                                <AppSidebarMenuItemWithSubmenu
                                    item={item}
                                    key={item.label}
                                    selectedPage={selectedPage}
                                    getPageURL={getPageURL}
                                    pageSelector={pageSelector}
                                />
                            ) : (
                                <SidebarMenuItem key={item.page}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={selectedPage === item.page}
                                        size={item.small ? 'sm' : 'default'}
                                    >
                                        <a
                                            href={getPageURL(item.page)}
                                            onClick={pageSelector(item.page)}
                                        >
                                            <item.icon />
                                            <span>{item.label}</span>
                                            {item.isBeta && (
                                                <Badge variant="secondary">
                                                    Beta
                                                </Badge>
                                            )}
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        ));
}
