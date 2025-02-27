import { toast } from "@/hooks/use-toast";

// Define error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Base error type
export interface AppError {
  message: string;
  code?: string;
  details?: string;
  severity: ErrorSeverity;
  timestamp: Date;
  handled: boolean;
}

// Error types for different sources
export interface SupabaseError extends AppError {
  source: 'supabase';
  supabaseCode?: string;
}

export interface NetworkError extends AppError {
  source: 'network';
  status?: number;
}

export interface ValidationError extends AppError {
  source: 'validation';
  field?: string;
}

export interface UnknownError extends AppError {
  source: 'unknown';
}

// Union type of all error types
export type ApplicationError = 
  | SupabaseError 
  | NetworkError 
  | ValidationError 
  | UnknownError;

// Error service singleton
class ErrorService {
  private static instance: ErrorService;
  private errors: ApplicationError[] = [];
  private errorHandlers: ((error: ApplicationError) => void)[] = [];

  private constructor() {}

  // Get singleton instance
  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  // Report a new error
  public reportError(error: unknown): ApplicationError {
    const appError = this.convertToApplicationError(error);
    this.errors.push(appError);
    
    // Notify all registered error handlers
    this.errorHandlers.forEach(handler => handler(appError));
    
    // Display error in UI if not already handled
    if (!appError.handled) {
      this.displayErrorToast(appError);
      appError.handled = true;
    }
    
    return appError;
  }

  // Register an error handler
  public registerErrorHandler(handler: (error: ApplicationError) => void): void {
    this.errorHandlers.push(handler);
  }

  // Get all errors
  public getErrors(): ApplicationError[] {
    return [...this.errors];
  }

  // Clear all errors
  public clearErrors(): void {
    this.errors = [];
  }

  // Display an error toast
  private displayErrorToast(error: ApplicationError): void {
    const title = this.getErrorTitle(error);
    const variant = this.getErrorVariant(error.severity);
    
    toast({
      title,
      description: error.message,
      variant,
    });
  }

  // Get error title based on source and severity
  private getErrorTitle(error: ApplicationError): string {
    const { source, severity } = error;
    
    if (severity === ErrorSeverity.CRITICAL) {
      return 'Critical Error';
    }
    
    switch (source) {
      case 'supabase':
        return 'Database Error';
      case 'network':
        return 'Network Error';
      case 'validation':
        return 'Validation Error';
      default:
        return 'Error';
    }
  }

  // Map error severity to toast variant
  private getErrorVariant(severity: ErrorSeverity): 'default' | 'destructive' {
    return severity === ErrorSeverity.INFO || severity === ErrorSeverity.WARNING
      ? 'default'
      : 'destructive';
  }

  // Convert any error to an ApplicationError
  private convertToApplicationError(error: unknown): ApplicationError {
    // Handle Supabase errors
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      typeof (error as any).message === 'string'
    ) {
      const supabaseError = error as any;
      return {
        source: 'supabase',
        message: supabaseError.message,
        code: supabaseError.code,
        details: supabaseError.details,
        supabaseCode: supabaseError.code,
        severity: this.mapSupabaseErrorSeverity(supabaseError.code),
        timestamp: new Date(),
        handled: false,
      };
    }
    
    // Handle network errors (e.g., fetch responses)
    if (error instanceof Response) {
      return {
        source: 'network',
        message: `HTTP ${error.status}: ${error.statusText}`,
        code: `HTTP_${error.status}`,
        status: error.status,
        severity: error.status >= 500 ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
        timestamp: new Date(),
        handled: false,
      };
    }
    
    // Handle standard errors
    if (error instanceof Error) {
      return {
        source: 'unknown',
        message: error.message,
        code: error.name,
        severity: ErrorSeverity.ERROR,
        timestamp: new Date(),
        handled: false,
      };
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return {
        source: 'unknown',
        message: error,
        severity: ErrorSeverity.ERROR,
        timestamp: new Date(),
        handled: false,
      };
    }
    
    // Default case for truly unknown errors
    return {
      source: 'unknown',
      message: 'An unknown error occurred',
      severity: ErrorSeverity.ERROR,
      timestamp: new Date(),
      handled: false,
    };
  }

  // Map Supabase error codes to severity
  private mapSupabaseErrorSeverity(code: string): ErrorSeverity {
    const criticalCodes = ['PGRST301', '23505', '42P01'];
    const warningCodes = ['PGRST204', 'PGRST116'];
    
    if (criticalCodes.includes(code)) {
      return ErrorSeverity.CRITICAL;
    }
    
    if (warningCodes.includes(code)) {
      return ErrorSeverity.WARNING;
    }
    
    return ErrorSeverity.ERROR;
  }
}

// Export the error service instance
export const errorService = ErrorService.getInstance();

// Helper functions for common use cases
export function reportError(error: unknown): ApplicationError {
  return errorService.reportError(error);
}

export function createValidationError(message: string, field?: string): ValidationError {
  const error: ValidationError = {
    source: 'validation',
    message,
    field,
    severity: ErrorSeverity.WARNING,
    timestamp: new Date(),
    handled: false,
  };
  
  return errorService.reportError(error) as ValidationError;
}

// Function to validate data using a schema
export function validateData<T>(data: unknown, validator: (data: unknown) => { valid: boolean; errors: string[] }): { 
  valid: boolean; 
  errors: ValidationError[]; 
  validatedData: T | null; 
} {
  const result = validator(data);
  
  if (result.valid) {
    return {
      valid: true,
      errors: [],
      validatedData: data as T,
    };
  }
  
  const errors = result.errors.map(message => 
    createValidationError(message)
  );
  
  return {
    valid: false,
    errors,
    validatedData: null,
  };
} 