"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendInvitation, InvitationRole } from "@/lib/services/invitations";
import { PlusIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitationRole>("member");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    startTransition(async () => {
      try {
        await sendInvitation(email, role);
        toast.success(`Invitation sent to ${email}`);
        setEmail("");
        setRole("member");
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to send invitation"
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon data-icon="inline-start" className="mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-lg">
        <DialogHeader>
          <DialogTitle>Invite a new member</DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new member to your organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as InvitationRole)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue>
                    {role === "member" ? "Member" : "Admin"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member" className="py-2">
                    <div className="flex flex-col items-start">
                      <span>Member</span>
                      <span className="text-muted-foreground text-xs">
                        Can access the organization
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin" className="py-2">
                    <div className="flex flex-col items-start">
                      <span>Admin</span>
                      <span className="text-muted-foreground text-xs">
                        Can invite and manage members
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
