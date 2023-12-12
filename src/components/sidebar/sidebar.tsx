import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import React, { useState } from 'react';

import { cookies } from 'next/headers';
import {
  getCollaboratingWorkspaces,
  getFolders,
  getPrivateWorkspaces,
  getSharedWorkspaces,
  getUserSubscriptionStatus,
} from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import WorkspaceDropdown from './workspace-dropdown';
import PlanUsage from './plan-usage';
import NativeNavigation from './native-navigation';
import { ScrollArea } from '../ui/scroll-area';
import FoldersDropdownList from './folders-dropdown-list';
import UserCard from './user-card';
import CustomDialogTrigger from '../global/custom-dialog-trigger';
import WorkspaceCreator from '../global/workspace-creator';
import SelectedWorkspace from './selected-workspace';
import { workspace } from '@/lib/supabase/supabase.types';
import { PlusIcon } from 'lucide-react';
import WorkspaceSelect from './workspaceSelect';

interface SidebarProps {
  params: { workspaceId: string };
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = async ({ params, className }) => {
  const supabase = createServerComponentClient({ cookies });

  //user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  //subscr
  const { data: subscriptionData, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);

  //folders
  const { data: workspaceFolderData, error: foldersError } = await getFolders(
    params.workspaceId
  );
  //error
  if (subscriptionError || foldersError) redirect('/dashboard');

  const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] =
    await Promise.all([
      getPrivateWorkspaces(user.id),
      getCollaboratingWorkspaces(user.id),
      getSharedWorkspaces(user.id),
    ]);

  //get all the different workspaces private collaborating shared
  return (
    <aside
      className={twMerge(
        'hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between',
        className
      )}
    >
      <div>
        <UserCard subscription={subscriptionData} />
        {/* <WorkspaceDropdown
          privateWorkspaces={privateWorkspaces}
          sharedWorkspaces={sharedWorkspaces}
          collaboratingWorkspaces={collaboratingWorkspaces}
          defaultValue={[
            ...privateWorkspaces,
            ...collaboratingWorkspaces,
            ...sharedWorkspaces,
          ].find((workspace) => workspace.id === params.workspaceId)}
        /> */}
        <div className="rounded-md flex flex-col">
          <CustomDialogTrigger
            header="Create A Workspace"
            content={<WorkspaceCreator />}
            description="Workspaces give you the power to collaborate with others. You can change your workspace privacy settings after creating the workspace too."
          >
            <div
              className="flex 
              rounded-md
              transition-all 
              hover:bg-muted 
              items-center 
              gap-5 
              p-2 
              w-full"
            >
              <PlusIcon
                size={18}
                className="
                cursor-pointer
                hover:dark:text-white
              "
              />
              New Page
            </div>
          </CustomDialogTrigger>
          <NativeNavigation myWorkspaceId={params.workspaceId} />
          <WorkspaceSelect
            privateWorkspaces={privateWorkspaces}
            sharedWorkspaces={sharedWorkspaces}
            collaboratingWorkspaces={collaboratingWorkspaces}
            defaultValue={[
              ...privateWorkspaces,
              ...collaboratingWorkspaces,
              ...sharedWorkspaces,
            ].find((workspace) => workspace.id === params.workspaceId)}
          />
        </div>
        
        <ScrollArea
          className="overflow-scroll relative
          h-[450px]
        "
        >
          <div
            className="pointer-events-none 
            w-full 
            absolute 
            bottom-0 
            h-20 
            bg-gradient-to-t 
            from-background 
            to-transparent 
            z-40"
          />
          <FoldersDropdownList
            workspaceFolders={workspaceFolderData || []}
            workspaceId={params.workspaceId}
          />
        </ScrollArea>
      </div>
    </aside>
  );
};

export default Sidebar;
