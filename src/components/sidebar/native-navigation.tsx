import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import CypressHomeIcon from '../icons/cypressHomeIcon';
import CypressSettingsIcon from '../icons/cypressSettingsIcon';
import CypressTrashIcon from '../icons/cypressTrashIcon';
import Settings from '../settings/settings';
import Trash from '../trash/trash';

interface NativeNavigationProps {
  myWorkspaceId: string;
  className?: string;
}

const NativeNavigation: React.FC<NativeNavigationProps> = ({
  myWorkspaceId,
  className,
}) => {
  return (
    <nav className={twMerge('my-2', className)}>
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            className="flex items-center group/native text-Neutrals/neutrals-7 rounded-md transition-all hover:bg-muted gap-5 p-2 w-full"
            href={`/dashboard/${myWorkspaceId}`}
          >
            <CypressHomeIcon />
            <span>My Workspace</span>
          </Link>
        </li>

        <Settings>
          <li
            className="flex items-center group/native text-Neutrals/neutrals-7 rounded-md transition-all hover:bg-muted gap-5 p-2 w-full"
          >
            <CypressSettingsIcon />
            <span>Settings</span>
          </li>
        </Settings>

        <Trash>
          <li
            className="flex items-center group/native text-Neutrals/neutrals-7 rounded-md transition-all hover:bg-muted gap-5 p-2 w-full"
          >
            <CypressTrashIcon />
            <span>Trash</span>
          </li>
        </Trash>
      </ul>
    </nav>
  );
};

export default NativeNavigation;
