import { Flag, Info } from 'lucide-react';
import React from 'react';

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/shadcn/components/ui/alert';
import { CardContent } from '@/shadcn/components/ui/card';
import { ScrollArea } from '@/shadcn/components/ui/scroll-area';
import Dashboard from '@/teamized/components/common/dashboard';
import CustomTooltip from '@/teamized/components/common/tooltips/customTooltip';
import SettingsCard from '@/teamized/components/pages/home/settingsCard';
import { CHANGELOG } from '@/teamized/data/changelog';
import { useAppdata } from '@/teamized/utils/appdataProvider';
import { getDateString } from '@/teamized/utils/datetime';
import { toggleDebug } from '@/teamized/utils/general';

export default function HomePage() {
    const appdata = useAppdata();
    const settings = appdata?.settings;

    return (
        <Dashboard.Page>
            <Dashboard.Column sizes={{ lg: 8 }}>
                <Dashboard.CustomCard title="Willkommen">
                    <CardContent>
                        <p>
                            <span>
                                Verwende die Seitenleiste (links), um zu
                                navigieren.
                            </span>
                            <a
                                onClick={() => toggleDebug()}
                                className="tw:ms-1 tw:opacity-0"
                                aria-hidden="true"
                            >
                                DEBUG
                            </a>
                        </p>
                        <Alert
                            variant="warning"
                            className="md:tw:hidden tw:mt-2"
                        >
                            <Info className="tw:size-4" />
                            <AlertTitle>Hinweis</AlertTitle>
                            <AlertDescription>
                                Diese Seite wurde zwar auch für mobile Geräte
                                optimiert, funktioniert aber besser auf
                                grösseren Geräten.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Dashboard.CustomCard>

                <SettingsCard settings={settings} />
            </Dashboard.Column>
            <Dashboard.Column sizes={{ lg: 4 }}>
                <Dashboard.CustomCard
                    className="tw:max-h-150"
                    title="Neuste Updates"
                    help="Neue Funktionen, Bugfixes und Änderungen"
                >
                    <CardContent className="tw:flex-1 tw:overflow-hidden tw:relative">
                        <ScrollArea className="tw:h-full tw:pr-2">
                            <div className="tw:space-y-4">
                                {CHANGELOG.map((item) => (
                                    <div key={item.date}>
                                        <h6 className="tw:font-semibold tw:flex tw:items-center tw:gap-2 tw:mb-2">
                                            {getDateString(new Date(item.date))}
                                            {item.version && (
                                                <span className="tw:text-sm tw:text-muted-foreground">
                                                    {item.version}
                                                </span>
                                            )}
                                            {item.milestone && (
                                                <CustomTooltip title="Meilenstein">
                                                    <Flag className="tw:size-4 tw:text-red-500" />
                                                </CustomTooltip>
                                            )}
                                        </h6>
                                        <ul className="tw:text-sm tw:space-y-1 tw:list-disc tw:list-inside">
                                            {item.changes.map((change, j) => (
                                                <li key={j}>{change}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="tw:pointer-events-none tw:absolute tw:bottom-2 tw:left-0 tw:right-0 tw:h-16 tw:bg-linear-to-t tw:from-card tw:to-transparent" />
                    </CardContent>
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
