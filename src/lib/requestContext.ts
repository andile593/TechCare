import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  organizationId: string;
  userId: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();
