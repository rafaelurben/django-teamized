import { Loader2Icon } from 'lucide-react';
import React, { useState } from 'react';

import {
    Field,
    FieldDescription,
    FieldLabel,
    FieldSet,
} from '@/shadcn/components/ui/field';
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
        <Dashboard.CustomCard
            title={
                <>
                    <span>Einstellungen</span>
                    {isSavingSettings && (
                        <Loader2Icon className="tw:size-4 tw:animate-spin tw:text-muted-foreground" />
                    )}
                </>
            }
            wrapInCardContent
        >
            {settings ? (
                <FieldSet>
                    <Field>
                        <FieldLabel htmlFor="appearance">
                            Erscheinungsbild
                        </FieldLabel>
                        <FieldDescription>
                            &quot;Automatisch&quot; = Browser/System-Einstellung
                            verwenden
                        </FieldDescription>
                        <RadioGroup
                            value={getAppearanceValue(settings.darkmode)}
                            onValueChange={applyAppearance}
                            orientation="vertical"
                            disabled={isSavingSettings}
                        >
                            <Field orientation="horizontal">
                                <RadioGroupItem
                                    value="dark"
                                    id="appearance_dark"
                                    disabled={isSavingSettings}
                                />
                                <FieldLabel htmlFor="appearance_dark">
                                    Dunkel
                                </FieldLabel>
                            </Field>
                            <Field orientation="horizontal">
                                <RadioGroupItem
                                    value="auto"
                                    id="appearance_auto"
                                    disabled={isSavingSettings}
                                />
                                <FieldLabel htmlFor="appearance_auto">
                                    Automatisch
                                </FieldLabel>
                            </Field>
                            <Field orientation="horizontal">
                                <RadioGroupItem
                                    value="light"
                                    id="appearance_light"
                                    disabled={isSavingSettings}
                                />
                                <FieldLabel htmlFor="appearance_light">
                                    Hell
                                </FieldLabel>
                            </Field>
                        </RadioGroup>
                    </Field>
                </FieldSet>
            ) : (
                <div className="tw:space-y-4">
                    <Skeleton className="tw:h-10 tw:w-full" />
                    <Skeleton className="tw:h-4 tw:w-3/4" />
                </div>
            )}
        </Dashboard.CustomCard>
    );
}
