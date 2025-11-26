import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import ProgressWidget from "../components/gamification/ProgressWidget";
import BadgesDisplay from "../components/gamification/BadgesDisplay";
import ChallengesPanel from "../components/gamification/ChallengesPanel";
import LeaderboardPanel from "../components/gamification/LeaderboardPanel";
import FriendsCompetition from "../components/gamification/FriendsCompetition";

export default function Achievements() {
  const { data: progress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const progressList = await base44.entities.UserProgress.list();
      return progressList[0] || null;
    },
  });

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = createPageUrl('Dashboard')}
            className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Achievements & Progress
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Track your progress, earn badges, and compete with the community
            </p>
          </div>
        </div>

        <ProgressWidget progress={progress} />

        <Tabs defaultValue="badges">
          <TabsList style={{ background: 'var(--surface)' }}>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="mt-6">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Your Badges
              </h3>
              <BadgesDisplay badges={progress?.badges || []} />
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="mt-6">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Active Challenges
              </h3>
              <ChallengesPanel />
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6" style={{ color: 'var(--accent-from)' }} />
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Community Leaderboard
                </h3>
              </div>
              <LeaderboardPanel />
            </Card>
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <FriendsCompetition />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}