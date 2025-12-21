import { LucideIcon } from 'lucide-react';
import React from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/shadcn/components/ui/sidebar';

interface Props {
    items: Array<{
        label: string;
        icon: LucideIcon;
        onClick?: () => void;
        dropdownItems?: Array<{
            label: string;
            icon: LucideIcon;
            onClick: () => void;
        }>;
        className?: string;
    }>;
}

export default function AppSidebarSecondaryNavigation({
    items,
}: Readonly<Props>) {
    const { isMobile } = useSidebar();

    return (
        <SidebarGroup className="tw:mt-auto">
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem
                            key={item.label}
                            className={item?.className}
                            onClick={item.onClick}
                        >
                            <SidebarMenuButton size="sm">
                                <item.icon />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                            {item.dropdownItems && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuAction showOnHover>
                                            <span className="tw:sr-only">
                                                Mehr
                                            </span>
                                        </SidebarMenuAction>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="tw:w-48"
                                        side={isMobile ? 'bottom' : 'right'}
                                        align={isMobile ? 'end' : 'start'}
                                    >
                                        {item.dropdownItems.map(
                                            (dropdownItem) => (
                                                <DropdownMenuItem
                                                    key={dropdownItem.label}
                                                    onClick={
                                                        dropdownItem.onClick
                                                    }
                                                >
                                                    <dropdownItem.icon className="tw:mr-2 tw:size-4" />
                                                    <span>
                                                        {dropdownItem.label}
                                                    </span>
                                                </DropdownMenuItem>
                                            )
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
