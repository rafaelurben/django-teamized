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
} from '@/shadcn/components/ui/sidebar';
import {
    useNavigationState,
    usePageNavigatorAsEventHandler,
    usePageNavigatorURL,
} from '@/teamized/utils/navigation/navigationProvider';

interface Props {
    groups: Array<{
        id: string;
        label?: string;
        items: Array<{
            label: string;
            icon: LucideIcon;
            small?: boolean;
            page: string;
            isBeta?: boolean;
        }>;
        hidden?: boolean;
    }>;
}

export default function AppSidebarMainNavigation({ groups }: Readonly<Props>) {
    const selectPage = usePageNavigatorAsEventHandler();
    const getPageURL = usePageNavigatorURL();
    const { selectedPage } = useNavigationState();

    return groups
        .filter((g) => !g.hidden)
        .map((group) => (
            <SidebarGroup key={group.id}>
                {group.label && (
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                    <SidebarMenu>
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.page}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={selectedPage === item.page}
                                    size={item.small ? 'sm' : 'default'}
                                >
                                    <a
                                        href={getPageURL(item.page)}
                                        onClick={selectPage(item.page)}
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
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        ));
}
