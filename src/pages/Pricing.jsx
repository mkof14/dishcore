import React, { useState } from "react";
import PublicLayout from "../components/layouts/PublicLayout";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: 0,
    period: "Free",
    description: "Forever",
    features: [
      "50 logs per day",
      "Basic Dish Library",
      "Menu Planner",
      "Water tracking",
      "Light analytics",
    ],
  },
  {
    name: "DishCore Plus",
    price: 9.99,
    period: "per month",
    popular: true,
    features: [
      "Unlimited logging",
      "AI-driven Menu",
      "Body Metrics",
      "Progress Tracking",
      "Light analytics",
    ],
  },
  {
    name: "DishCore Studio™ Pro",
    price: 19.99,
    period: "per month",
    features: [
      "AI DishCore Plus",
      "AI Wearable Sync",
      "Restaurant mode",
      "Food Scanner Pro",
      "Full Dish Library",
    ],
  },
];

const faqs = [
  { question: "What is DishCore Studio?", answer: "DishCore Studio is our premium tier with advanced AI features, wearable sync, and comprehensive nutrition tracking." },
  { question: "Can I switch plans at any time?", answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <PublicLayout>
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Choose Your Choose<br />Your Plan Plan
            </h1>
            <p className="text-xl mb-8" style={{ color: '#B8C5D6' }}>
              Find the best plan that fits your needs and goals
            </p>
            
            <Link to={createPageUrl("Dashboard")}>
              <Button className="px-10 py-4 text-lg rounded-full font-semibold text-white border-0"
                style={{ background: '#FF6600' }}>
                Get Started
              </Button>
            </Link>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`p-8 relative ${plan.popular ? 'ring-2' : ''}`}
                style={{ 
                  background: '#141B3D', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  ringColor: plan.popular ? '#00A3E3' : 'transparent'
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #00A3E3, #0080FF)' }}>
                    MOST POPULAR
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-white">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price !== 0 && (
                      <span className="text-sm ml-2" style={{ color: '#7B8BA3' }}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: '#7B8BA3' }}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#00A3E3' }} />
                      <span style={{ color: '#B8C5D6' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={createPageUrl("Dashboard")}>
                  <Button 
                    className="w-full py-6 rounded-full font-semibold"
                    style={{
                      background: plan.popular ? '#FF6600' : 'transparent',
                      border: plan.popular ? 'none' : '2px solid #00A3E3',
                      color: 'white'
                    }}
                  >
                    {plan.price === 0 ? 'Get Started' : plan.popular ? 'Upgrade Now' : 'Unlock Studio'}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">
              Have Questions? Explore Our FAQ
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Card key={idx} 
                  className="p-6 cursor-pointer"
                  style={{ background: '#141B3D', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{faq.question}</h3>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                      style={{ color: '#00A3E3' }}
                    />
                  </div>
                  {openFaq === idx && (
                    <p className="mt-4 text-sm" style={{ color: '#7B8BA3' }}>
                      {faq.answer}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}