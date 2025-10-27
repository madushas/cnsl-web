import { Calendar, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsOverviewProps {
  totalRsvps: number;
  upcomingCount: number;
  pastCount: number;
}

export function StatsOverview({
  totalRsvps,
  upcomingCount,
  pastCount,
}: StatsOverviewProps) {
  const stats = [
    {
      label: "Total RSVPs",
      value: totalRsvps,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Upcoming",
      value: upcomingCount,
      icon: Clock,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Past Events",
      value: pastCount,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="overflow-hidden border-none shadow-card transition-card hover:shadow-card-hover"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}