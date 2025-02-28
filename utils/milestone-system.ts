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
  
  // Third milestone - 100 energy - unlocks the first wing selection and a log
  {
    resourceType: 'energy',
    threshold: 100,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      // Unlock the log about the ship wings
      unlockLog(11); // Using new log ID 11
      
      // Unlock first wing, setting the wing count to 1
      unlockUpgrade('unlock-wing-1');
    }
  },
  
  // Fourth milestone - 500 energy - unlocks the second wing and a log
  {
    resourceType: 'energy',
    threshold: 500,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      // Unlock the log about expanding to more wings
      unlockLog(20); // Using new log ID for second wing unlock
      
      // Unlock second wing, setting the wing count to 2
      unlockUpgrade('unlock-wing-2');
    }
  },
  
  // Fifth milestone - 1000 energy - unlocks the third wing and a log
  {
    resourceType: 'energy',
    threshold: 1000,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      // Unlock the log about accessing the final wing
      unlockLog(21); // Using new log ID for third wing unlock
      
      // Unlock third wing, setting the wing count to 3
      unlockUpgrade('unlock-wing-3');
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
  
  // Second milestone - 5 crew (reduced from 10) - unlocks automation and a log
  {
    resourceType: 'crew',
    threshold: 5,
    onReached: (gameProgress, unlockLog, unlockUpgrade) => {
      unlockLog(16);
      unlockUpgrade('crew-generation');
    }
  },
  
  // Third milestone - 15 crew (reduced from 25) - unlocks next wing and a log
  {
    resourceType: 'crew',
    threshold: 15,
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
    // First, check if this milestone was already completed by looking for corresponding upgrade flags
    // For wing unlocks, check the appropriate unlock-wing-X flags
    let milestoneCompleted = false;
    
    // For energy milestones at specific thresholds, check corresponding unlock flags
    if (resourceType === 'energy' && milestone.threshold === 100 && gameProgress.upgrades['unlock-wing-1']) {
      milestoneCompleted = true;
    } else if (resourceType === 'energy' && milestone.threshold === 500 && gameProgress.upgrades['unlock-wing-2']) {
      milestoneCompleted = true;
    } else if (resourceType === 'energy' && milestone.threshold === 1000 && gameProgress.upgrades['unlock-wing-3']) {
      milestoneCompleted = true;
    } 
    // Add other milestone checks as needed
    else if (milestone.completed) {
      milestoneCompleted = true;
    }
    
    // Skip if already marked as completed
    if (milestoneCompleted) {
      milestone.completed = true;
      return;
    }
    
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