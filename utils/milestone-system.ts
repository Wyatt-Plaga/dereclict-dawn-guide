import { GameProgress } from '@/types/game.types';
import { ResourceType } from '@/components/resources/resource-page';
import { resourceToPageMap } from './page-helpers';

// Interface for milestone definition
export interface ResourceMilestone {
  resourceType: ResourceType;
  threshold: number;
  onReached: (gameProgress: GameProgress, 
    unlockLog: (logId: number) => void,
    unlockUpgrade: (upgradeId: string) => void) => void;
  completed?: boolean;
}

// Energy milestones for the reactor
export const energyMilestones: ResourceMilestone[] = [
  // First milestone - 10 energy - unlocks energy storage and the first log
  {
    resourceType: 'energy',
    threshold: 10,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      // Unlock the first log - AI waking up
      unlockLog(9); // Using new log ID 9
      
      // Unlock first energy upgrade
      unlockUpgrade('energy-capacity');
    }
  },
  
  // Second milestone - 50 energy - unlocks automation and the second log
  {
    resourceType: 'energy',
    threshold: 50,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      // Unlock the log about automation and exploring the ship
      unlockLog(10); // Using new log ID 10
      
      // Unlock automation
      unlockUpgrade('energy-generation');
    }
  },
  
  // Third milestone - 1000 energy - unlocks the next wing selection and a log
  {
    resourceType: 'energy',
    threshold: 1000,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      // Unlock the log about the ship wings
      unlockLog(11); // Using new log ID 11
      
      // Unlock special upgrade for selecting the next wing
      unlockUpgrade('unlock-wing');
    }
  }
];

// Insight milestones for the processor (will be unlocked later)
export const insightMilestones: ResourceMilestone[] = [
  // First milestone - 5 insight - unlocks capacity and a log
  {
    resourceType: 'insight',
    threshold: 5,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      unlockLog(12); // New log ID for processor
      unlockUpgrade('insight-capacity');
    }
  },
  
  // Second milestone - 20 insight - unlocks automation and a log
  {
    resourceType: 'insight',
    threshold: 20,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      unlockLog(13); 
      unlockUpgrade('insight-generation');
    }
  },
  
  // Third milestone - 100 insight - unlocks next wing and a log
  {
    resourceType: 'insight',
    threshold: 100,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      unlockLog(14);
      unlockUpgrade('unlock-next-wing');
    }
  }
];

// Crew milestones for the crew quarters
export const crewMilestones: ResourceMilestone[] = [
  // First milestone - 3 crew - unlocks capacity and a log
  {
    resourceType: 'crew',
    threshold: 3,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      unlockLog(15);
      unlockUpgrade('crew-capacity');
    }
  },
  
  // Second milestone - 10 crew - unlocks automation and a log
  {
    resourceType: 'crew',
    threshold: 10,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      unlockLog(16);
      unlockUpgrade('crew-generation');
    }
  },
  
  // Third milestone - 25 crew - unlocks next wing and a log
  {
    resourceType: 'crew',
    threshold: 25,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      unlockLog(17);
      unlockUpgrade('unlock-final-wing');
    }
  }
];

// Scrap milestones for manufacturing
export const scrapMilestones: ResourceMilestone[] = [
  // First milestone - 20 scrap - unlocks capacity and a log
  {
    resourceType: 'scrap',
    threshold: 20,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      unlockLog(18);
      unlockUpgrade('scrap-capacity');
    }
  },
  
  // Second milestone - 75 scrap - unlocks automation and a log
  {
    resourceType: 'scrap',
    threshold: 75,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      unlockLog(19);
      unlockUpgrade('scrap-generation');
    }
  },
  
  // Third milestone - 200 scrap - unlocks special project and a log
  {
    resourceType: 'scrap',
    threshold: 200,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      unlockLog(20);
      unlockUpgrade('special-project');
    }
  }
];

// Combine all milestones
export const allMilestones: ResourceMilestone[] = [
  ...energyMilestones,
  ...insightMilestones,
  ...crewMilestones,
  ...scrapMilestones
];

// Check all milestones for a specific resource
export function checkResourceMilestones(
  gameProgress: GameProgress,
  resourceType: ResourceType,
  unlockLog: (logId: number) => void,
  unlockUpgrade: (upgradeId: string) => void
) {
  // Get the resource amount
  const amount = gameProgress.resources[resourceType]?.amount || 0;
  
  // Get milestones for this resource type
  const milestones = allMilestones.filter(m => m.resourceType === resourceType);
  
  // Check each milestone
  milestones.forEach(milestone => {
    // Skip if already marked as completed
    if (milestone.completed) return;
    
    // Check if we've reached the threshold
    if (amount >= milestone.threshold) {
      console.log(`Resource milestone reached: ${resourceType} reached ${milestone.threshold}`);
      
      // Trigger the milestone callback
      milestone.onReached(gameProgress, unlockLog, unlockUpgrade);
      
      // Mark as completed
      milestone.completed = true;
    }
  });
} 