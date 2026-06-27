import { test as base } from '@playwright/test';
import { MockApi } from './mock-api';

type Fixtures = {
  mockApi: MockApi;
};

export const test = base.extend<Fixtures>({
  mockApi: async ({ page }, use) => {
    const mockApi = new MockApi(page);
    // Always mock these on every page load — both are called by root layout
    await mockApi.mockServerProviders();
    await mockApi.mockAccessCodeStatus();
    await use(mockApi);
  },
});

export { expect } from '@playwright/test';
