/**
 * @meldai/shared
 * 
 * Shared types and utilities for Meld.ai packages
 * This package is never published - it's bundled into other packages
 */

export * from './types';

/**
 * Utility function to get current timestamp in ISO format
 * @returns Current timestamp as ISO string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Check if a value is a valid Mode
 * @param value - Value to check
 * @returns True if value is a valid Mode
 */
export function isValidMode(value: any): value is Mode {
  return value === 'sync' || value === 'async';
}
