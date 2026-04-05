/**
 * @nirman/provider-sdk
 * Interface contract for all Nirman plug-and-play providers.
 *
 * @example
 * import { BaseProvider, NirmanProvider, ProviderResult } from '@nirman/provider-sdk';
 *
 * export class MyProvider extends BaseProvider {
 *   readonly name = 'my-provider';
 *   readonly category = 'otp';
 *   // ...
 * }
 */

// Core types
export type {
  ProviderCategory,
  CredentialFieldType,
  CredentialField,
  ProviderAction,
  ProviderResult,
  NirmanProvider,
  RegistryEntry,
} from './types';

// Base class
export { BaseProvider } from './base/provider';
