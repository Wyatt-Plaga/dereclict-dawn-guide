import React from 'react';
import { 
  AwardIcon, 
  Brain,
  Zap, 
  Users, 
  Package
} from 'lucide-react';
import { ResourceReward } from '@/app/game/types';

interface ResourceRewardsListProps {
  resources: ResourceReward[];
  title?: string;
  showAnimation?: boolean;
}

// Helper function to get the appropriate icon for resource types
const getResourceIcon = (type: string) => {
  switch (type) {
    case 'energy':
      return <Zap className="h-5 w-5 text-chart-1" />;
    case 'insight':
      return <Brain className="h-5 w-5 text-chart-2" />;
    case 'crew':
      return <Users className="h-5 w-5 text-chart-3" />;
    case 'scrap':
      return <Package className="h-5 w-5 text-chart-4" />;
    default:
      return <AwardIcon className="h-5 w-5 text-primary" />;
  }
};

// Helper function to format resource names for display
const formatResourceName = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const ResourceRewardsList: React.FC<ResourceRewardsListProps> = ({ 
  resources, 
  title = "Acquired Resources",
  showAnimation = true
}) => {
  if (!resources || resources.length === 0) {
    return null;
  }
  
  return (
    <div className={`transition-all duration-700 mt-6 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <h3 className="text-lg font-medium mb-4 terminal-text flex items-center gap-2">
        <AwardIcon className="h-5 w-5 text-chart-1" />
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {resources.map((reward: ResourceReward, index: number) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 system-panel hover:bg-accent/10 transition-colors">
              <div className={`p-2 rounded-full ${
                reward.type === 'energy' ? 'bg-chart-1/10' : 
                reward.type === 'insight' ? 'bg-chart-2/10' : 
                reward.type === 'crew' ? 'bg-chart-3/10' : 
                reward.type === 'scrap' ? 'bg-chart-4/10' : 
                'bg-accent/10'
              }`}>
                {getResourceIcon(reward.type)}
              </div>
              <div>
                <div className={`text-lg font-medium ${
                  reward.type === 'energy' ? 'text-chart-1' : 
                  reward.type === 'insight' ? 'text-chart-2' : 
                  reward.type === 'crew' ? 'text-chart-3' : 
                  reward.type === 'scrap' ? 'text-chart-4' : 
                  'text-primary'
                }`}>{formatResourceName(reward.type)}</div>
                <div className="text-muted-foreground">
                  {reward.amount > 0 ? `+${reward.amount}` : reward.amount} units
                </div>
              </div>
            </div>
            {reward.message && (
              <p className="text-sm italic pl-3">{reward.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceRewardsList; 