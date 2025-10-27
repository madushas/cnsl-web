"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ChartData = {
  series: Array<{ date: string; count: number }>;
  topEvents: Array<{ slug: string; title: string; count: number }>;
};

export function DashboardCharts({ data }: { data: ChartData }) {
  const chartConfig: ChartConfig = {
    count: { label: "RSVPs", color: "var(--primary)" },
  };

  return (
    <div className="grid gap-6 @3xl/main:grid-cols-3">
      <Card className="@container/card @3xl/main:col-span-2">
        <CardHeader>
          <CardTitle>RSVPs — last 30 days</CardTitle>
          <CardDescription>
            Daily registrations across all events
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={data.series}>
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-count)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="count"
                type="natural"
                fill="url(#fillCount)"
                stroke="var(--color-count)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Events (30d)</CardTitle>
          <CardDescription>Most registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">RSVPs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topEvents.map((e) => (
                  <TableRow key={e.slug}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {e.count}
                    </TableCell>
                  </TableRow>
                ))}
                {data.topEvents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-sm text-muted-foreground"
                    >
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
