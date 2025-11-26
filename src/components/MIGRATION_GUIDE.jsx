# 🚀 DishCore Migration: Base44 → Production (Vercel)

## 📋 STACK MIGRATION

### Current (Base44)
- Frontend: React SPA
- Backend: Base44 BaaS
- Auth: Base44 built-in
- DB: Base44 entities
- Files: Base44 storage
- AI: Base44 integrations

### Target (Production)
- **Frontend**: Next.js 14 App Router
- **Backend**: Next.js API Routes
- **Auth**: Clerk
- **Database**: Neon (PostgreSQL)
- **Storage**: AWS S3
- **Payments**: Stripe
- **AI**: OpenAI GPT-4o-mini
- **Email**: Resend
- **Deploy**: Vercel

---

## 🔧 ENVIRONMENT VARIABLES (.env.local)

```bash
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Neon Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dishcore?sslmode=require

# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=dishcore-images

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Resend
RESEND_API_KEY=re_...

# App Config
NEXT_PUBLIC_APP_URL=https://dishcore.com
```

---

## 📦 DEPENDENCIES (package.json)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    
    "@clerk/nextjs": "^5.0.0",
    "@neondatabase/serverless": "^0.9.0",
    "drizzle-orm": "^0.30.0",
    
    "stripe": "^14.0.0",
    "@stripe/stripe-js": "^3.0.0",
    
    "openai": "^4.28.0",
    
    "resend": "^3.2.0",
    
    "@aws-sdk/client-s3": "^3.500.0",
    "@aws-sdk/s3-request-presigner": "^3.500.0",
    
    "@tanstack/react-query": "^5.0.0",
    "framer-motion": "^11.0.0",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0"
  }
}
```

---

## 🗄️ DATABASE SCHEMA (Drizzle ORM)

Create: `lib/db/schema.ts`

```typescript
import { pgTable, serial, text, timestamp, integer, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow()
});

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  age: integer('age'),
  sex: text('sex'),
  height: decimal('height'),
  weight: decimal('weight'),
  goal: text('goal'),
  activityLevel: text('activity_level'),
  dietType: text('diet_type'),
  targetCalories: integer('target_calories'),
  targetProtein: integer('target_protein'),
  targetCarbs: integer('target_carbs'),
  targetFat: integer('target_fat'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const dishes = pgTable('dishes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  calories: integer('calories'),
  protein: decimal('protein'),
  carbs: decimal('carbs'),
  fat: decimal('fat'),
  fiber: decimal('fiber'),
  micronutrients: jsonb('micronutrients'),
  ingredients: jsonb('ingredients'),
  cookingInstructions: jsonb('cooking_instructions'),
  isCustom: boolean('is_custom').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export const mealLogs = pgTable('meal_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  date: timestamp('date').notNull(),
  mealType: text('meal_type'),
  dishId: integer('dish_id').references(() => dishes.id),
  dishName: text('dish_name'),
  calories: integer('calories'),
  protein: decimal('protein'),
  carbs: decimal('carbs'),
  fat: decimal('fat'),
  portionSize: decimal('portion_size'),
  createdAt: timestamp('created_at').defaultNow()
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripePriceId: text('stripe_price_id'),
  status: text('status'), // active, canceled, past_due
  tier: text('tier'), // free, pro, studio
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow()
});
```

---

## 🔐 CLERK AUTH SETUP

### middleware.ts
```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/pricing", "/privacy-policy", "/terms"],
  ignoredRoutes: ["/api/webhooks/stripe"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### app/layout.tsx
```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

## 💳 STRIPE INTEGRATION

### app/api/stripe/create-checkout/route.ts
```typescript
import { auth } from "@clerk/nextjs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { priceId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    client_reference_id: userId,
    metadata: { userId }
  });

  return Response.json({ sessionId: session.id });
}
```

### app/api/webhooks/stripe/route.ts
```typescript
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook Error`, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // Create subscription record
      const session = event.data.object;
      await db.insert(subscriptions).values({
        userId: session.client_reference_id,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        status: 'active',
        tier: getPlanTier(session.line_items[0]?.price?.id)
      });
      break;
      
    case 'customer.subscription.deleted':
      // Cancel subscription
      const subscription = event.data.object;
      await db.update(subscriptions)
        .set({ status: 'canceled' })
        .where({ stripeSubscriptionId: subscription.id });
      break;
  }

  return new Response(JSON.stringify({ received: true }));
}
```

---

## 🤖 OPENAI INTEGRATION

### app/api/ai/analyze-food/route.ts
```typescript
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { imageUrl, description } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Analyze this food and return JSON with: name, calories, protein, carbs, fat, fiber, portion_size" },
        { type: "image_url", image_url: { url: imageUrl } }
      ]
    }],
    response_format: { type: "json_object" }
  });

  return Response.json(JSON.parse(response.choices[0].message.content));
}
```

---

## 📧 RESEND EMAIL

### lib/email.ts
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'DishCore <onboarding@dishcore.com>',
    to: email,
    subject: 'Welcome to DishCore! 🎉',
    html: `<h1>Hi ${name}!</h1><p>Welcome to your personalized nutrition journey...</p>`
  });
}
```

---

## 🔐 SECURITY IMPROVEMENTS

Хотите, чтобы я сейчас добавил в Base44:
1. **Feature Gates** (Free/Pro/Studio ограничения)
2. **Security Headers** (CSP, XSS protection)
3. **Audit Logging** (кто что делал)
4. **Age Verification** (13+)
5. **Terms Acceptance Tracking**
6. **GDPR Delete Request**

Это можно сделать прямо сейчас, и потом перенести на Vercel?

Или сначала создать полный **DEPLOYMENT CHECKLIST** для Vercel?