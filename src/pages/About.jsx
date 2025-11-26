import React from "react";
import PublicLayout from "../components/layouts/PublicLayout";
import { Card } from "@/components/ui/card";
import { Target, Heart, Users, Zap } from "lucide-react";

export default function About() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                About Us
              </h1>
              <p className="text-xl leading-relaxed mb-6" style={{ color: '#B8C5D6' }}>
                Empowering Healthy Choices<br />through AI Innovation.
              </p>
              <p className="leading-relaxed" style={{ color: '#7B8BA3' }}>
                Flex universal information to create great AI tool that sustains to nutrition technology directly desired consumer through AI personalize is.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
                alt="Team collaboration"
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Commitment */}
      <section className="py-20 px-4" style={{ background: '#141B3D' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-10" 
              style={{ background: '#0A0E27', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center"
                style={{ background: 'rgba(0, 163, 227, 0.1)' }}>
                <Target className="w-8 h-8" style={{ color: '#00A3E3' }} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                Our Mission
              </h3>
              <p className="leading-relaxed" style={{ color: '#7B8BA3' }}>
                Helping a dietitian fit a unique food challenge balanced, providing support and guidance in meal planning and understanding how personalized diet through AI personalization is.
              </p>
            </Card>

            <Card className="p-10" 
              style={{ background: '#0A0E27', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center"
                style={{ background: 'rgba(0, 163, 227, 0.1)' }}>
                <Heart className="w-8 h-8" style={{ color: '#00A3E3' }} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                Our Commitment
              </h3>
              <p className="leading-relaxed" style={{ color: '#7B8BA3' }}>
                Dedication and commitment to establish tools that support healthy learning, best practices for using well-defined strategies and information your user needs to make informed decisions and sustained support.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            What Drives Us
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "User-Centric", description: "Every feature designed with your success" },
              { icon: Zap, title: "Innovation", description: "Cutting-edge AI for personalized nutrition" },
              { icon: Heart, title: "Wellness", description: "Holistic approach to health" },
              { icon: Target, title: "Results", description: "Focused on sustainable goals" },
            ].map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="p-6 text-center feature-card"
                  style={{ background: '#141B3D', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(0, 163, 227, 0.1)' }}>
                    <Icon className="w-7 h-7" style={{ color: '#00A3E3' }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">
                    {value.title}
                  </h3>
                  <p className="text-sm" style={{ color: '#7B8BA3' }}>
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}