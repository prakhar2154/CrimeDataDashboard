import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  borderColor: string;
  change?: {
    value: string;
    type: "positive" | "negative" | "neutral";
  };
  subtitle?: string;
}

function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  borderColor,
  change,
  subtitle
}: StatCardProps) {
  return (
    <Card className={`bg-secondary border-l-4 ${borderColor}`}>
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-white text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className={`h-10 w-10 rounded-full ${iconBgColor} bg-opacity-10 flex items-center justify-center`}>
            <span className={`material-icons ${iconColor}`}>{icon}</span>
          </div>
        </div>
        <div className="mt-4 text-sm">
          {change && (
            <span className={`${change.type === 'positive' ? 'text-green-400' : change.type === 'negative' ? 'text-red-400' : 'text-gray-400'}`}>
              {change.value}{' '}
            </span>
          )}
          {subtitle && <span className="text-gray-400">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCards() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  if (isLoading || !statsData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-secondary animate-pulse">
            <CardContent className="p-5 h-[110px]"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <StatCard
        title="Total Crimes"
        value={statsData.totalCrimes}
        icon="warning"
        iconBgColor="bg-destructive"
        iconColor="text-destructive"
        borderColor="border-destructive"
        change={{ value: "+5%", type: "positive" }}
        subtitle="from last month"
      />
      <StatCard
        title="Arrest Rate"
        value={`${statsData.arrestRate}%`}
        icon="handcuffs"
        iconBgColor="bg-accent"
        iconColor="text-accent"
        borderColor="border-accent"
        change={{ value: "-2%", type: "negative" }}
        subtitle="from last month"
      />
      <StatCard
        title="Most Common Crime"
        value={`${statsData.mostCommonCrime.type} (${statsData.mostCommonCrime.count})`}
        icon="key_off"
        iconBgColor="bg-destructive"
        iconColor="text-destructive"
        borderColor="border-destructive-light"
        subtitle={`${statsData.mostCommonCrime.percentage}% of all crimes`}
      />
      <StatCard
        title="Recent Crimes"
        value={statsData.recentCrimes}
        icon="update"
        iconBgColor="bg-primary"
        iconColor="text-primary"
        borderColor="border-primary"
        subtitle="In the last 30 days"
      />
    </div>
  );
}
