import { ChevronRight, LucideIcon } from 'lucide-react';
import React from 'react';

import { Badge } from '@/shadcn/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/shadcn/components/ui/collapsible';
import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/shadcn/components/ui/sidebar';

export interface ItemWithSubmenu {
    label: string;
    icon: LucideIcon;
    small?: boolean;
    isBeta?: boolean;
    subitems: Array<{
        label: string;
        page: string;
        small?: boolean;
        isBeta?: boolean;
    }>;
}

interface Props {
    item: ItemWithSubmenu;
    selectedPage: string;
    getPageURL: (page: string) => string;
    pageSelector: (page: string) => (e: React.MouseEvent) => void;
}

export default function AppSidebarMenuItemWithSubmenu({
    item,
    selectedPage,
    getPageURL,
    pageSelector,
}: Readonly<Props>) {
    return (
        <Collapsible asChild className="tw:group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton size={item.small ? 'sm' : 'default'}>
                        <item.icon />
                        <span>{item.label}</span>
                        {item.isBeta && <Badge variant="secondary">Beta</Badge>}
                        <ChevronRight className="tw:ml-auto tw:transition-transform tw:duration-200 tw:group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.subitems.map((subitem) => (
                            <SidebarMenuSubItem key={subitem.page}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={selectedPage === subitem.page}
                                    size={subitem.small ? 'sm' : 'md'}
                                >
                                    <a
                                        href={getPageURL(subitem.page)}
                                        onClick={pageSelector(subitem.page)}
                                    >
                                        <span>{subitem.label}</span>
                                        {subitem.isBeta && (
                                            <Badge variant="secondary">
                                                Beta
                                            </Badge>
                                        )}
                                    </a>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}
