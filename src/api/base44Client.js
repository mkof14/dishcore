// Standalone DishCore client for Vercel.
// This replaces the Base44 SDK to avoid any redirects or hard lock-in.
// All calls work in "demo mode": no real backend, no navigation to Base44.

const noop = async (...args) => {
  console.warn('DishCore Base44 stub called:', ...args);
  return {};
};

const makeEntityApi = () => ({
  list: async () => [],
  filter: async () => [],
  create: async () => ({}),
  update: async () => ({}),
  delete: async () => {},
});

// Main stub client
export const base44 = {
  // Auth “emulation”
  auth: {
    me: async () => ({
      email: 'demo@dishcore.app',
      name: 'DishCore Demo User',
      role: 'user',
    }),
    updateMe: noop,
    logout: noop,

    // some code uses base44.entities.User, подстрахуемся:
    list: async () => [],
    update: noop,
  },

  // entities: UserProfile, Dish, MealPlan, etc. — всё через Proxy
  entities: new Proxy(
    {},
    {
      get: () => makeEntityApi(),
    }
  ),

  // AI / Core integrations — работают в “демо режиме”
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt } = {}) => ({
        content: `Demo mode: AI backend is not configured yet.\n\nPrompt was:\n${prompt ?? ''}`,
      }),
      SendEmail: noop,
      UploadFile: async () => ({ file_url: '' }),
      GenerateImage: async () => ({ image_url: '' }),
      ExtractDataFromUploadedFile: async () => ({}),
      CreateFileSignedUrl: async () => ({ url: '' }),
      UploadPrivateFile: async () => ({ file_url: '' }),
    },
  },

  // functions.invoke(...) — тоже заглушка
  functions: {
    invoke: noop,
  },
};
