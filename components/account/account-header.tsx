import { User, Shield, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AccountHeaderProps {
  userName?: string;
  userEmail?: string;
}

export function AccountHeader({ userName, userEmail }: AccountHeaderProps) {
  const stats = [
    {
      label: "Profile Status",
      value: "Active",
      icon: User,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Security",
      value: "Protected",
      icon: Shield,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Notifications",
      value: "Enabled",
      icon: Bell,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and profile information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="overflow-hidden border-none shadow-card"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-sm font-semibold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}