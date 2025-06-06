import { Avatar } from '@heroui/avatar';
import React, { useState } from 'react';
import { ProjectMember, Role, TeamMember } from '@/app/lib/types/definitions';
import RoleCard from '@/app/lib/components/members/roleCard';
import clsx from 'clsx';
import { el_animation, team_tile } from '@/app/lib/types/styles';
import { IdCardIcon, LogOutIcon, UserRoundXIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import userStore from '@/app/stores/userStore';
import settingsStore from '@/app/stores/settingsStore';
import Link from 'next/link';
import AreYouSureModal from '@/app/lib/components/modals/areYouSureModal';
import { useMembersContext } from '@/app/lib/components/projects/allProjectMembers';
import RemoveTeamMemberModal from '@/app/lib/components/members/removeTeamMemberModal';
import SelectOwnerModal from '@/app/lib/components/members/selectOwnerModal';
import { useMemberModals } from '@/app/lib/hooks/useMemberModals';
import CheckAccess from '@/app/lib/utils/checkAccess';
import ChangeRoleModal from '@/app/lib/components/members/changeRoleModal';

export default function MemberCard(member: ProjectMember | TeamMember) {
  const { currentStep, nextStep, resetSequence } = useMemberModals();
  const { myRole, updateMemberRole, removeMember } = useMembersContext();

  const areYouSureModalText = {
    newOwner: {
      header: settingsStore.t.members.areYouSure.newOwner.modalHeader,
      sure: settingsStore.t.members.areYouSure.newOwner.modalSure,
    },
    leave: {
      header: settingsStore.t.members.areYouSure.leave.modalHeader,
      sure: settingsStore.t.members.areYouSure.leave.modalSure,
    },
    removeMember: {
      header:
        settingsStore.t.members.areYouSure.removeMember.modalHeader.replace(
          '_',
          member.nickname,
        ),
      sure: settingsStore.t.members.areYouSure.removeMember.modalSure,
    },
    dismiss: settingsStore.t.members.areYouSure.modalDismiss,
  };

  const [removeTeamMemberType, setRemoveTeamMemberType] = useState<
    'breakup' | 'entire' | null
  >(null);
  const [newRole, setNewRole] = useState<Role | null>(null);
  const [newRoleType, setNewRoleType] = useState<
    'override' | 'updateMax' | null
  >(null);
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);

  const handleChangeRole = () => {
    if (myRole === 'owner' && member.role === 'owner') nextStep('selectOwner');
    else handleSubmit();
  };

  const handleRemoveMember = () => {
    if ('team' in member && member.team) nextStep('removeTeamMember');
    else nextStep('areYouSure');
  };

  const handleLeave = () => {
    if ('team' in member && member.team) nextStep('removeTeamMember');
    else if (myRole === 'owner') nextStep('selectOwner');
    else nextStep('areYouSure');
  };

  const handleSubmit = () => {
    if (currentStep === 'changeRole' && newRole)
      updateMemberRole(member.id, newRole, newRoleType);
    else if (currentStep !== 'changeRole')
      removeMember(member.id, newOwnerId, removeTeamMemberType);
    closeModal();
  };

  const closeModal = () => {
    setNewOwnerId(null);
    setNewRole(null);
    setNewRoleType(null);
    setRemoveTeamMemberType(null);
    resetSequence();
  };

  return (
    <>
      <div
        className={clsx(
          'box-border flex items-center justify-between gap-1 rounded-2xl bg-white px-3 py-2 shadow-container hover:bg-default-50',
          el_animation,
          'h-16 w-[98%] max-w-[379px]',
          team_tile,
        )}
      >
        <div className="flex h-full w-full items-center justify-start gap-2">
          <Avatar
            size="md"
            color="primary"
            className="min-h-10 min-w-10"
            name={member.nickname.toUpperCase()}
            src={member.avatar}
          />
          <div className="flex h-full w-full flex-col items-start justify-between">
            <div className="flex items-center gap-1">
              <h1 className="max-w-32 truncate text-nowrap font-medium">
                {/* TODO: navigate to member page */}
                <Link href="/" className="accent-link">
                  {member.nickname}
                </Link>
              </h1>
              {userStore.user?.id === member.id && (
                <p className="text-xs text-default-700">
                  {settingsStore.t.main.you}
                </p>
              )}
            </div>
            <div className="flex items-center justify-start gap-2">
              <RoleCard role={member.role} />
              {'team' in member && member.team && (
                <RoleCard role={member.team} />
              )}
            </div>
          </div>
        </div>

        <div className="flex h-full w-fit items-center justify-start gap-2">
          <>
            {CheckAccess(['admin', 'owner']) && (
              <Button
                isDisabled={
                  (member.role === 'owner' && myRole !== 'owner') ||
                  !(myRole === 'owner' || myRole === 'admin')
                }
                onPress={() => nextStep('changeRole')}
                isIconOnly
                variant="light"
                size="sm"
              >
                <IdCardIcon className="stroke-default-300" />
              </Button>
            )}
            {userStore.user?.id === member.id ? (
              <Button
                isDisabled={
                  !!(
                    'team' in member &&
                    member.team &&
                    member.role in ['reader', 'editor']
                  )
                }
                onPress={handleLeave}
                isIconOnly
                color="danger"
                variant="light"
                size="sm"
              >
                <LogOutIcon className="stroke-danger" />
              </Button>
            ) : (
              CheckAccess(['admin', 'owner']) && (
                <Button
                  isDisabled={
                    member.role === 'owner' ||
                    !(myRole === 'owner' || myRole === 'admin')
                  }
                  onPress={handleRemoveMember}
                  isIconOnly
                  color="danger"
                  variant="light"
                  size="sm"
                >
                  <UserRoundXIcon className="stroke-danger" />
                </Button>
              )
            )}
          </>
        </div>
      </div>
      {currentStep === 'changeRole' && (
        <ChangeRoleModal
          member={member}
          submitRole={setNewRole}
          submitRoleType={setNewRoleType}
          isOpen={true}
          onOpenChange={closeModal}
          action={handleChangeRole}
        />
      )}

      {currentStep === 'selectOwner' && (
        <SelectOwnerModal
          member={member}
          teamFilter={
            (removeTeamMemberType === 'entire' &&
              'team' in member &&
              member.team) ||
            undefined
          }
          isOpen={true}
          onOpenChange={closeModal}
          action={() => nextStep('areYouSure')}
          submitOwnerId={setNewOwnerId}
        />
      )}

      {currentStep === 'removeTeamMember' && (
        <RemoveTeamMemberModal
          member={member}
          isOpen={true}
          onOpenChange={closeModal}
          action={() => nextStep('areYouSure')}
          submitRemoveType={setRemoveTeamMemberType}
        />
      )}

      {currentStep === 'areYouSure' && (
        <AreYouSureModal
          isOpen={true}
          onOpenChange={closeModal}
          action={handleSubmit}
          dismiss={areYouSureModalText.dismiss}
          header={
            (newOwnerId && areYouSureModalText.newOwner.header) ||
            (member.id === userStore.user?.id &&
              areYouSureModalText.leave.header) ||
            areYouSureModalText.removeMember.header
          }
          sure={
            (newOwnerId && areYouSureModalText.newOwner.sure) ||
            (member.id === userStore.user?.id &&
              areYouSureModalText.leave.sure) ||
            areYouSureModalText.removeMember.sure
          }
        />
      )}
    </>
  );
}
