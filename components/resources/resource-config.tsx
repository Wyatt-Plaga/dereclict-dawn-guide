import { Zap, ArrowUpCircle, CircuitBoard, Brain, Users, CpuIcon, Home, Wrench, CircleDollarSign, ShieldCheck } from "lucide-react";
import { ResourceUpgrade } from "./resource-page";

// Energy (Reactor) resource configuration
export const energyConfig = {
  resourceType: 'energy' as const,
  pageName: 'reactor',
  resourceIcon: <Zap className="h-5 w-5 text-chart-1 mr-2" />,
  resourceName: 'Energy',
  pageTitle: 'Quantum Reactor',
  pageDescription: 'Manage ship\'s energy production. Generate Energy to power ship systems and upgrades.',
  iconClassName: 'text-chart-1',
  generateButtonLabel: 'Generate Energy',
  manualGenerationAmount: 1,
  autoGenerationLabel: 'per second',
  autoGenerationMultiplier: 1,
  generateResourceLabel: '+',
  upgrades: [
    {
      id: 'energy-capacity',
      name: 'Energy Storage',
      description: 'Expand energy storage capacity to {value}',
      icon: ArrowUpCircle,
      costMultiplier: 0.8,
      getCost: (current) => current * 0.8,
      getNextValue: (current) => current * 1.5,
      propertyToUpgrade: 'capacity'
    },
    {
      id: 'energy-generation',
      name: 'Reactor Core',
      description: 'Add +1 automatic energy generation per second',
      icon: CircuitBoard,
      costMultiplier: 20,
      getCost: (current) => (current + 1) * 20,
      getNextValue: (current) => current + 1,
      propertyToUpgrade: 'autoGeneration'
    }
  ] as ResourceUpgrade[]
};

// Insight (Processor) resource configuration
export const insightConfig = {
  resourceType: 'insight' as const,
  pageName: 'processor',
  resourceIcon: <Brain className="h-5 w-5 text-chart-2 mr-2" />,
  resourceName: 'Insight',
  pageTitle: 'Quantum Processor',
  pageDescription: 'Manage ship\'s computational resources. Generate Insight to unlock advanced ship capabilities.',
  iconClassName: 'text-chart-2',
  generateButtonLabel: 'Process Data',
  manualGenerationAmount: 0.5,
  autoGenerationLabel: 'per second',
  autoGenerationMultiplier: 0.2,
  generateResourceLabel: '+',
  upgrades: [
    {
      id: 'insight-capacity',
      name: 'Mainframe Expansion',
      description: 'Expand insight storage capacity to {value}',
      icon: ArrowUpCircle,
      costMultiplier: 0.7,
      getCost: (current) => current * 0.7,
      getNextValue: (current) => current * 1.5,
      propertyToUpgrade: 'capacity'
    },
    {
      id: 'insight-generation',
      name: 'Processing Thread',
      description: 'Add +0.2 automatic insight generation per second',
      icon: CpuIcon,
      costMultiplier: 15,
      getCost: (current) => (current + 1) * 15,
      getNextValue: (current) => current + 1,
      propertyToUpgrade: 'autoGeneration'
    }
  ] as ResourceUpgrade[]
};

// Crew (Crew Quarters) resource configuration
export const crewConfig = {
  resourceType: 'crew' as const,
  pageName: 'crew-quarters',
  resourceIcon: <Users className="h-5 w-5 text-chart-3 mr-2" />,
  resourceName: 'Crew',
  pageTitle: 'Crew Quarters',
  pageDescription: 'Manage your ship\'s crew. Train new workers to maintain ship functions and gather resources.',
  iconClassName: 'text-chart-3',
  generateButtonLabel: 'Train Crew',
  manualGenerationAmount: 0.2,
  autoGenerationLabel: 'per second',
  autoGenerationMultiplier: 0.1,
  generateResourceLabel: '+',
  upgrades: [
    {
      id: 'crew-capacity',
      name: 'Living Quarters',
      description: 'Expand crew quarters to house up to {value} crew members',
      icon: Home,
      costMultiplier: 1,
      getCost: (current) => current * 2,
      getNextValue: (current) => current + 5,
      propertyToUpgrade: 'capacity'
    },
    {
      id: 'crew-generation',
      name: 'Worker Crew',
      description: 'Add a new worker crew generating +0.1 crew per second',
      icon: Users,
      costMultiplier: 10,
      getCost: (current) => (current + 1) * 10,
      getNextValue: (current) => current + 1,
      propertyToUpgrade: 'workerCrews'
    }
  ] as ResourceUpgrade[]
};

// Scrap (Manufacturing) resource configuration
export const scrapConfig = {
  resourceType: 'scrap' as const,
  pageName: 'manufacturing',
  resourceIcon: <Wrench className="h-5 w-5 text-chart-4 mr-2" />,
  resourceName: 'Scrap',
  pageTitle: 'Manufacturing Bay',
  pageDescription: 'Manage ship\'s manufacturing capabilities. Generate Scrap to build and repair ship components.',
  iconClassName: 'text-chart-4',
  generateButtonLabel: 'Salvage Components',
  manualGenerationAmount: 2,
  autoGenerationLabel: 'per second',
  autoGenerationMultiplier: 0.5,
  generateResourceLabel: '+',
  upgrades: [
    {
      id: 'scrap-capacity',
      name: 'Storage Expansion',
      description: 'Expand scrap storage capacity to {value}',
      icon: ArrowUpCircle,
      costMultiplier: 0.5,
      getCost: (current) => current * 0.5,
      getNextValue: (current) => current * 1.5,
      propertyToUpgrade: 'capacity'
    },
    {
      id: 'scrap-generation',
      name: 'Manufacturing Bay',
      description: 'Add a manufacturing bay generating +0.5 scrap per second',
      icon: Wrench,
      costMultiplier: 25,
      getCost: (current) => (current + 1) * 25,
      getNextValue: (current) => current + 1,
      propertyToUpgrade: 'manufacturingBays'
    }
  ] as ResourceUpgrade[]
}; 