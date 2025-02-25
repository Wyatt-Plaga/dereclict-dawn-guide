import { toast } from "@/hooks/use-toast";

// Types for our error handling
export type ErrorWithMessage = {
  message: string;
};

export type SupabaseError = {
  code: string;
  message: string;
  details?: string;
};

// Function to check if an error has a message property
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

// Function to convert an unknown error to an error with a message
export function toErrorWithMessage(error: unknown): ErrorWithMessage {
  if (isErrorWithMessage(error)) {
    return error;
  }

  try {
    return new Error(
      typeof error === 'string' 
        ? error 
        : 'An unknown error occurred'
    );
  } catch {
    return new Error('An unknown error occurred');
  }
}

// Function to get the error message from an unknown error
export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}

// Function to display an error toast
export function displayErrorToast(error: unknown): void {
  const message = getErrorMessage(error);
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
}

// Function to handle Supabase errors and return a user-friendly message
export function handleSupabaseError(error: SupabaseError): string {
  console.error("Supabase error:", error);

  switch (error.code) {
    case "PGRST116":
      return "Resource not found. Please try again later.";
    case "23505":
      return "This record already exists.";
    case "42P01":
      return "Table does not exist. The system is misconfigured.";
    case "42501":
      return "You do not have permission to perform this action.";
    case "23503":
      return "This operation would violate referential integrity.";
    case "23514":
      return "This value does not satisfy the constraint.";
    default:
      if (error.message) {
        return error.message;
      }
      return "An unexpected error occurred. Please try again later.";
  }
}

// Function to validate game data to ensure integrity
export function validateGameData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if data is not null
  if (!data) {
    errors.push("Game data is null or undefined");
    return { valid: false, errors };
  }

  // Check resources
  if (!data.resources) {
    errors.push("Resources are missing");
  } else {
    // Check energy
    if (data.resources.energy) {
      if (typeof data.resources.energy.amount !== 'number') {
        errors.push("Energy amount must be a number");
      }
      if (typeof data.resources.energy.capacity !== 'number') {
        errors.push("Energy capacity must be a number");
      }
      if (typeof data.resources.energy.autoGeneration !== 'number') {
        errors.push("Energy autoGeneration must be a number");
      }
    }

    // Check insight
    if (data.resources.insight) {
      if (typeof data.resources.insight.amount !== 'number') {
        errors.push("Insight amount must be a number");
      }
      if (typeof data.resources.insight.capacity !== 'number') {
        errors.push("Insight capacity must be a number");
      }
      if (typeof data.resources.insight.autoGeneration !== 'number') {
        errors.push("Insight autoGeneration must be a number");
      }
    }

    // Check crew
    if (data.resources.crew) {
      if (typeof data.resources.crew.amount !== 'number') {
        errors.push("Crew amount must be a number");
      }
      if (typeof data.resources.crew.capacity !== 'number') {
        errors.push("Crew capacity must be a number");
      }
      if (typeof data.resources.crew.workerCrews !== 'number') {
        errors.push("Crew workerCrews must be a number");
      }
    }

    // Check scrap
    if (data.resources.scrap) {
      if (typeof data.resources.scrap.amount !== 'number') {
        errors.push("Scrap amount must be a number");
      }
      if (typeof data.resources.scrap.capacity !== 'number') {
        errors.push("Scrap capacity must be a number");
      }
      if (typeof data.resources.scrap.manufacturingBays !== 'number') {
        errors.push("Scrap manufacturingBays must be a number");
      }
    }
  }

  // Check unlocked logs
  if (!Array.isArray(data.unlockedLogs)) {
    errors.push("unlockedLogs must be an array");
  }

  // Check upgrades
  if (typeof data.upgrades !== 'object' || data.upgrades === null) {
    errors.push("upgrades must be an object");
  }

  return {
    valid: errors.length === 0,
    errors
  };
} 