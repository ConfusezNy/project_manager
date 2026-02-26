"use client";

// PendingInvites Component - Shows pending team invitations
import React from "react";
import { Mail } from "lucide-react";
import Button from "@/shared/components/Button";
import { PendingInvite } from "../services/teamService";

interface Props {
  invites: PendingInvite[];
  onAccept: (notificationId: number) => void;
  onReject: (notificationId: number) => void;
  joiningTeam: boolean;
  rejectingTeam: boolean;
}

export const PendingInvites: React.FC<Props> = ({
  invites,
  onAccept,
  onReject,
  joiningTeam,
  rejectingTeam,
}) => {
  if (invites.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl shadow-sm border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Mail size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            คำเชิญเข้ากลุ่ม ({invites.length})
          </h3>
          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.notification_id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {invite.actor?.firstname} {invite.actor?.lastname}{" "}
                      เชิญคุณเข้ากลุ่ม
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invite.team?.section?.section_code} - {invite.team?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      สมาชิก: {invite.team?.members?.length || 0} คน
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      className="!py-2.5 !px-5 !text-base"
                      onClick={() => onAccept(invite.notification_id)}
                      disabled={joiningTeam}
                    >
                      {joiningTeam ? "กำลังเข้าร่วม..." : "รับคำเชิญ"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="!py-2.5 !px-5 !text-base"
                      onClick={() => onReject(invite.notification_id)}
                      disabled={joiningTeam || rejectingTeam}
                    >
                      {rejectingTeam ? "กำลังปฏิเสธ..." : "ปฏิเสธ"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
