import { CircleIcon, Eye, MousePointer2 } from 'lucide-react';
import React from 'react';

import { RadioGroup, RadioGroupItem } from '@/shadcn/components/ui/radio-group';
import { Skeleton } from '@/shadcn/components/ui/skeleton';
import { Switch } from '@/shadcn/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shadcn/components/ui/table';
import IconTooltip from '@/teamized/components/common/tooltips/iconTooltip';

import { Calendar } from '../../../interfaces/calendar/calendar';
import { ID } from '../../../interfaces/common';

interface Props {
    calendars: Calendar[];
    selectedCalendarId: ID | null;
    visibleCalendarIds: Set<ID>;
    onCalendarSelect: (calendarId: ID) => void;
    onVisibilityToggle: (calendarId: ID, visible: boolean) => void;
    loading?: boolean;
}

export default function CalendarTable({
    calendars,
    selectedCalendarId,
    visibleCalendarIds,
    onCalendarSelect,
    onVisibilityToggle,
    loading = false,
}: Readonly<Props>) {
    if (!loading && calendars.length === 0) {
        return (
            <p className="tw:text-muted-foreground">
                Keine Kalender vorhanden.
            </p>
        );
    }

    return (
        <RadioGroup
            value={selectedCalendarId || undefined}
            onValueChange={onCalendarSelect}
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="tw:w-px"></TableHead>
                        <TableHead>Titel</TableHead>
                        <TableHead className="tw:w-px">
                            <IconTooltip icon={Eye} title="Sichtbar?" />
                        </TableHead>
                        <TableHead className="tw:w-px">
                            <IconTooltip
                                icon={MousePointer2}
                                title="Standard für neue Ereignisse"
                            />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => (
                              <TableRow key={i}>
                                  <TableCell>
                                      <Skeleton className="tw:h-6 tw:w-6 tw:rounded-full" />
                                  </TableCell>
                                  <TableCell>
                                      <Skeleton className="tw:h-6 tw:w-full" />
                                  </TableCell>
                                  <TableCell>
                                      <Skeleton className="tw:h-6 tw:w-10" />
                                  </TableCell>
                                  <TableCell>
                                      <Skeleton className="tw:h-6 tw:w-6 tw:rounded-full" />
                                  </TableCell>
                              </TableRow>
                          ))
                        : calendars.map((calendar) => (
                              <TableRow key={calendar.id}>
                                  <TableCell>
                                      <CircleIcon
                                          className="tw:size-4 tw:fill-current"
                                          style={{ color: calendar.color }}
                                      />
                                  </TableCell>
                                  <TableCell>{calendar.name}</TableCell>
                                  <TableCell>
                                      <Switch
                                          id={`show-${calendar.id}`}
                                          checked={visibleCalendarIds.has(
                                              calendar.id
                                          )}
                                          onCheckedChange={(checked) =>
                                              onVisibilityToggle(
                                                  calendar.id,
                                                  checked
                                              )
                                          }
                                      />
                                  </TableCell>
                                  <TableCell>
                                      <RadioGroupItem
                                          value={calendar.id}
                                          id={`select-${calendar.id}`}
                                      />
                                  </TableCell>
                              </TableRow>
                          ))}
                </TableBody>
            </Table>
        </RadioGroup>
    );
}
