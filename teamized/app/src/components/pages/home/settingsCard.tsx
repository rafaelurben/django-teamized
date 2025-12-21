import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import {
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shadcn/components/ui/card';
import { Label } from '@/shadcn/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shadcn/components/ui/radio-group';
import { Skeleton } from '@/shadcn/components/ui/skeleton';
import Dashboard from '@/teamized/components/common/dashboard';
import { Settings } from '@/teamized/interfaces/settings';
import * as SettingsService from '@/teamized/service/settings.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';

interface Props {
    settings: Settings | undefined;
}

export default function SettingsCard({ settings }: Readonly<Props>) {
    const refreshData = useAppdataRefresh();
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const getAppearanceValue = (setting: boolean | null) => {
        if (setting) return 'dark';
        if (setting === false) return 'light';
        return 'auto';
    };

    const getAppearanceApiValue = (value: string) => {
        if (value === 'dark') return true;
        if (value === 'light') return false;
        return null;
    };

    const applyAppearance = (value: string) => {
        if (isSavingSettings) return;

        const darkmode = getAppearanceApiValue(value);
        setIsSavingSettings(true);

        SettingsService.editSettings({ darkmode })
            .then(refreshData)
            .finally(() => setIsSavingSettings(false));
    };

    return (
        <Dashboard.CustomCard>
            <CardHeader>
                <CardTitle className="tw:flex tw:items-center tw:gap-2">
                    Einstellungen
                    {isSavingSettings && (
                        <Loader2 className="tw:size-4 tw:animate-spin tw:text-muted-foreground" />
                    )}
                </CardTitle>
            </CardHeader>

            {settings ? (
                <CardContent>
                    <div className="tw:space-y-4">
                        <div className="tw:space-y-2">
                            <Label htmlFor="appearance">Erscheinungsbild</Label>
                            <RadioGroup
                                value={getAppearanceValue(settings.darkmode)}
                                onValueChange={applyAppearance}
                                orientation="horizontal"
                                className="tw:flex tw:flex-row tw:gap-4"
                                disabled={isSavingSettings}
                            >
                                <div className="tw:flex tw:items-center tw:gap-2">
                                    <RadioGroupItem
                                        value="dark"
                                        id="appearance_dark"
                                        disabled={isSavingSettings}
                                    />
                                    <Label htmlFor="appearance_dark">
                                        Dunkel
                                    </Label>
                                </div>
                                <div className="tw:flex tw:items-center tw:gap-2">
                                    <RadioGroupItem
                                        value="auto"
                                        id="appearance_auto"
                                        disabled={isSavingSettings}
                                    />
                                    <Label htmlFor="appearance_auto">
                                        Automatisch
                                    </Label>
                                </div>
                                <div className="tw:flex tw:items-center tw:gap-2">
                                    <RadioGroupItem
                                        value="light"
                                        id="appearance_light"
                                        disabled={isSavingSettings}
                                    />
                                    <Label htmlFor="appearance_light">
                                        Hell
                                    </Label>
                                </div>
                            </RadioGroup>
                            <p className="tw:text-sm tw:text-muted-foreground">
                                Bei &quot;Automatisch&quot; wird das
                                Erscheinungsbild automatisch dem des Systems
                                oder Browsers angepasst.
                            </p>
                        </div>
                    </div>
                </CardContent>
            ) : (
                <CardContent>
                    <div className="tw:space-y-4">
                        <Skeleton className="tw:h-10 tw:w-full" />
                        <Skeleton className="tw:h-4 tw:w-3/4" />
                    </div>
                </CardContent>
            )}
        </Dashboard.CustomCard>
    );
}
