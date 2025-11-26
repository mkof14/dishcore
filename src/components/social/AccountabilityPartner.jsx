import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, UserPlus, CheckCircle, TrendingUp, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AccountabilityPartner() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const queryClient = useQueryClient();

  const { data: partnerships = [] } = useQuery({
    queryKey: ['partnerships'],
    queryFn: async () => {
      // Custom entity for accountability partnerships
      const sent = await base44.entities.AccountabilityPartnership?.list() || [];
      return sent.filter(p => p.status === 'active');
    }
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const invitePartnerMutation = useMutation({
    mutationFn: async (email) => {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `${currentUser?.full_name} invited you to be their accountability partner on DishCore!`,
        body: `
          <h2>You've been invited to DishCore!</h2>
          <p>${currentUser?.full_name} wants you to be their accountability partner for their health journey.</p>
          <p>As accountability partners, you can:</p>
          <ul>
            <li>See each other's daily progress</li>
            <li>Send motivational messages</li>
            <li>Celebrate wins together</li>
            <li>Keep each other on track</li>
          </ul>
          <a href="${window.location.origin}" style="background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">Join DishCore</a>
        `
      });
      
      // Create partnership record
      if (base44.entities.AccountabilityPartnership) {
        await base44.entities.AccountabilityPartnership.create({
          inviter_email: currentUser?.email,
          invitee_email: email,
          status: 'pending'
        });
      }
    },
    onSuccess: () => {
      toast.success('Invitation sent!');
      setShowInviteDialog(false);
      setPartnerEmail("");
      queryClient.invalidateQueries(['partnerships']);
    }
  });

  const { data: partnerProgress = [] } = useQuery({
    queryKey: ['partnerProgress'],
    queryFn: async () => {
      if (partnerships.length === 0) return [];
      
      // Get progress from partners
      const progress = [];
      for (const partner of partnerships) {
        const email = partner.inviter_email === currentUser?.email 
          ? partner.invitee_email 
          : partner.inviter_email;
        
        // Would fetch their recent logs here
        // Simplified for now
        progress.push({
          email,
          streak: 7,
          lastLog: new Date().toISOString()
        });
      }
      return progress;
    },
    enabled: partnerships.length > 0
  });

  return (
    <>
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Accountability Partners
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Stay motivated together
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowInviteDialog(true)}
            className="gradient-accent text-white border-0"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </div>

        {partnerships.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No partners yet
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Invite friends or family to keep you accountable
            </p>
            <Button onClick={() => setShowInviteDialog(true)} variant="outline">
              Invite Partner
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {partnerProgress.map((partner, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{ background: 'var(--bg-surface-alt)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {partner.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {partner.email.split('@')[0]}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {partner.streak} day streak 🔥
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(0, 163, 227, 0.1)' }}>
          <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Why Accountability Works
          </h4>
          <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <li>• 65% more likely to achieve goals with a partner</li>
            <li>• Stay motivated on tough days</li>
            <li>• Celebrate wins together</li>
            <li>• Mutual support system</li>
          </ul>
        </div>
      </Card>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="gradient-card border-0">
          <DialogHeader>
            <DialogTitle>Invite Accountability Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="partner@email.com"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => invitePartnerMutation.mutate(partnerEmail)}
                disabled={!partnerEmail || invitePartnerMutation.isPending}
                className="gradient-accent text-white border-0 flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
              <Button
                onClick={() => {
                  const shareText = `Join me on DishCore! Let's be accountability partners for our health journey. ${window.location.origin}`;
                  if (navigator.share) {
                    navigator.share({ text: shareText });
                  } else {
                    navigator.clipboard.writeText(shareText);
                    toast.success('Link copied!');
                  }
                }}
                variant="outline"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}