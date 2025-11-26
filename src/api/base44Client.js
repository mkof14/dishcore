const defaultUser = {
  id: "demo-user",
  email: "demo@dishcore.app",
  name: "Demo User",
  role: "user",
  created_date: new Date().toISOString(),
};

function createEntityApi(entityName) {
  return {
    list: async () => [],
    filter: async () => [],
    create: async (data) => ({
      id: `${entityName.toLowerCase()}_${Date.now()}`,
      ...data,
    }),
    update: async (id, data) => ({
      id,
      ...data,
    }),
    delete: async () => ({ success: true }),
  };
}

const entityNames = [
  "UserProfile",
  "Dish",
  "MealPlan",
  "MealLog",
  "GroceryList",
  "BodyMeasurement",
  "BodyGoal",
  "DishReview",
  "SharedContent",
  "UserProgress",
  "Challenge",
  "ChallengeProgress",
  "StudioProfile",
  "AdaptiveMenu",
  "WearableData",
  "ForumTopic",
  "ForumReply",
  "CommunityGroup",
  "GroupMembership",
  "UserFollowing",
  "ActivityFeed",
  "Goal",
  "AccountabilityPartnership",
  "WaterLog",
  "FavoriteRecipe",
  "BarcodeProduct",
  "NotificationPreference",
  "Notification",
  "UserReport",
  "SupportTicket",
  "ContentSubmission",
  "SLAConfig",
  "TicketAutomation",
  "ChatbotFAQ",
  "ContentTemplate",
  "Webhook",
  "EmailTemplate",
];

const entities = {};
for (const name of entityNames) {
  entities[name] = createEntityApi(name);
}

const asyncNoop = async () => ({ ok: true });

const functions = new Proxy(
  {
    invoke: async () => ({ ok: true }),
  },
  {
    get(target, prop) {
      if (prop in target) return target[prop];
      return asyncNoop;
    },
  }
);

const Core = {
  InvokeLLM: async ({ prompt }) => ({
    ok: true,
    prompt,
    answer:
      "DishCore demo mode is active. This is a placeholder AI response generated without a real backend.",
  }),
  SendEmail: async ({ to, subject }) => ({
    ok: true,
    to,
    subject,
  }),
  UploadFile: async () => ({
    file_url: "https://example.com/demo-upload-file",
  }),
  ExtractDataFromUploadedFile: async () => ({
    ok: true,
    data: {},
  }),
  GenerateImage: async () => ({
    ok: true,
    url: "https://example.com/demo-image",
  }),
  CreateFileSignedUrl: async () => ({
    url: "https://example.com/demo-signed-url",
  }),
  UploadPrivateFile: async () => ({
    file_url: "https://example.com/demo-private-file",
  }),
};

export const base44 = {
  auth: {
    me: async () => defaultUser,
    list: async () => [defaultUser],
    updateMe: async (data) => ({ ...defaultUser, ...data }),
    logout: async () => ({ success: true }),
  },
  entities,
  functions,
  integrations: {
    Core,
  },
};
