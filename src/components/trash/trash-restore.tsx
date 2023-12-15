'use client';
import { appFoldersType, useAppState } from '@/lib/providers/state-provider';
import { deleteFile, deleteFolder } from '@/lib/supabase/queries';
import { File } from '@/lib/supabase/supabase.types';
import { FileIcon, FolderIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';

interface deleteFileHandlerProps {
  dirType: 'file' | 'folder';
  // fileId: string
}

const TrashRestore: React.FC<deleteFileHandlerProps> = ({
  dirType,
  // fileId
}) => {
  const { state, workspaceId, fileId, folderId, dispatch } = useAppState();
  const [folders, setFolders] = useState<appFoldersType[] | []>([]);
  const [files, setFiles] = useState<File[] | []>([]);
  const router = useRouter();

  useEffect(() => {
    const stateFolders =
      state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.filter((folder) => folder.inTrash) || [];
    setFolders(stateFolders);

    let stateFiles: File[] = [];
    state.workspaces
      .find((workspace) => workspace.id === workspaceId)
      ?.folders.forEach((folder) => {
        folder.files.forEach((file) => {
          if (file.inTrash) {
            stateFiles.push(file);
          }
        });
      });
    setFiles(stateFiles);
  }, [state, workspaceId]);

  const deleteFileHandler = async () => {
    if (dirType === 'file') {
      if (!folderId || !workspaceId) return;
      // dispatch({
      //   type: 'DELETE_FILE',
      //   payload: { fileId, folderId, workspaceId },
      // });
      await deleteFile('');
      router.replace(`/dashboard/${workspaceId}`);
    }
    if (dirType === 'folder') {
      if (!workspaceId) return;
      // dispatch({
      //   type: 'DELETE_FOLDER',
      //   payload: { folderId: fileId, workspaceId },
      // });
      await deleteFolder('');
      router.replace(`/dashboard/${workspaceId}`);
    }
  };

  return (
    <section>
      {!!folders.length && (
        <>
          <h3>Folders</h3>
          {folders.map((folder) => (
            <Link
              className="hover:bg-muted
            rounded-md
            p-2
            flex
            item-center
            justify-between"
              href={`/dashboard/${folder.workspaceId}/${folder.id}`}
              key={folder.id}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FolderIcon />
                  {folder.title}
                </aside>
              </article>
            </Link>
          ))}
        </>
      )}
      {!!files.length && (
        <>
          <h3>Files</h3>
          {files.map((file) => (
            <>
              <Link
                key={file.id}
                className=" hover:bg-muted rounded-md p-2 flex items-center justify-between"
                href={`/dashboard/${file.workspaceId}/${file.folderId}/${file.id}`}
              >
                <article>
                  <aside className="flex items-center gap-2">
                    <FileIcon />
                    {file.title}
                  </aside>
                </article>
              </Link>
              <Button onClick={deleteFileHandler}>delete</Button>
            </>
          ))}
        </>
      )}
      {!files.length && !folders.length && (
        <div
          className="
          text-muted-foreground
          absolute
          top-[50%]
          left-[50%]
          transform
          -translate-x-1/2
          -translate-y-1/2

      "
        >
          No Items in trash
        </div>
      )}
    </section>
  );
};

export default TrashRestore;
