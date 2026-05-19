"use client"

import React from 'react';
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Pie, 
  PieChart, 
  Label, 
  Area, 
  AreaChart,
  LabelList
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart";

interface AnilistStats {
  count: number;
  episodesWatched?: number;
  chaptersRead?: number;
  minutesWatched?: number;
  meanScore: number;
  scores: { score: number; count: number }[];
  statuses: { status: string; count: number }[];
  genres: { genre: string; count: number }[];
  formats: { format: string; count: number }[];
  releaseYears: { releaseYear: number; count: number }[];
}

interface StatsTabProps {
  category: string;
  stats: AnilistStats;
}

const chartConfig = {
  count: {
    label: "Count",
    color: "var(--primary)",
  },
  COMPLETED: {
    label: "Completed",
    color: "var(--chart-1)",
  },
  CURRENT: {
    label: "Active",
    color: "var(--chart-2)",
  },
  PAUSED: {
    label: "Paused",
    color: "var(--chart-3)",
  },
  DROPPED: {
    label: "Dropped",
    color: "var(--chart-4)",
  },
  PLANNING: {
    label: "Planning",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export default function StatsTab({ category, stats }: StatsTabProps) {
  const isAnime = category === 'anime' || category === 'movie';

  // Score Distribution
  const scoreData = [...stats.scores]
    .sort((a, b) => a.score - b.score)
    .map(s => ({
      score: s.score.toString(),
      count: s.count,
    }));

  // Status breakdown
  const statusData = stats.statuses.map(s => ({
    status: s.status,
    count: s.count,
    fill: `var(--color-${s.status})`
  }));
  const totalItems = stats.statuses.reduce((acc, s) => acc + s.count, 0);

  // Top Genres
  const topGenres = [...stats.genres]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(g => ({
      genre: g.genre,
      count: g.count,
    }));

  // Activity by Year
  const yearData = [...stats.releaseYears]
    .sort((a, b) => a.releaseYear - b.releaseYear)
    .slice(-10);

  // Format Breakdown
  const formatData = [...stats.formats]
    .sort((a, b) => b.count - a.count)
    .map(f => ({
      format: f.format,
      count: f.count,
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Row 1: Score Distribution + Status Donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
            <CardDescription>Frequency of ratings from 1-10</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={scoreData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="score"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Donut */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{isAnime ? 'Watch' : 'Read'} Status</CardTitle>
            <CardDescription>Breakdown by current progress</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {totalItems.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-xs uppercase"
                            >
                              Total
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Top Genres (Horizontal Bar) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Genres</CardTitle>
          <CardDescription>Most consumed genres</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart
              accessibilityLayer
              data={topGenres}
              layout="vertical"
              margin={{
                left: 0,
              }}
            >
              <YAxis
                dataKey="genre"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />
              <XAxis dataKey="count" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={5}>
                <LabelList
                  dataKey="genre"
                  position="insideLeft"
                  offset={8}
                  className="fill-[white] font-medium text-[10px]"
                />
                <LabelList
                  dataKey="count"
                  position="right"
                  offset={8}
                  className="fill-foreground font-mono text-[10px]"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Row 3: Activity by Year (Area Chart) + Format (Bar Chart) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Activity by Year</CardTitle>
            <CardDescription>Release year distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <AreaChart
                accessibilityLayer
                data={yearData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="releaseYear"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" hideLabel />}
                />
                <Area
                  dataKey="count"
                  type="natural"
                  fill="var(--color-count)"
                  fillOpacity={0.4}
                  stroke="var(--color-count)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Format Breakdown</CardTitle>
            <CardDescription>TV, Movie, Manga, etc.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={formatData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="format"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" radius={4} fill="var(--color-count)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
