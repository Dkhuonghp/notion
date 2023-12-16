'use client';
import { appFoldersType, useAppState } from '@/lib/providers/state-provider';
import { deleteFile, deleteFolder, updateFile, updateFolder } from '@/lib/supabase/queries';
import { File } from '@/lib/supabase/supabase.types';
import { FileIcon, FolderIcon, Trash, Undo } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const TrashRestore = () => {
    const { state, workspaceId, folderId, dispatch } = useAppState();
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

    const deleteFileHandler = async (fileId: string) => {    
        if (!folderId || !workspaceId) return;
        dispatch({
            type: 'DELETE_FILE',
            payload: { fileId: fileId, folderId, workspaceId },
        });
        await deleteFile(fileId);
        router.replace(`/dashboard/${workspaceId}`);
    };

    const deleteFolderHandler = async (fileId: string) => {
        if (!workspaceId) return;
        dispatch({
            type: 'DELETE_FOLDER',
            payload: { folderId: fileId, workspaceId },
        });
        await deleteFolder(fileId);
        router.replace(`/dashboard/${workspaceId}`);
    }

    const restoreFileHandler = async (fileId: string) => {
        if (!folderId || !workspaceId) return;
        dispatch({
            type: 'UPDATE_FILE',
            payload: { file: { inTrash: '' }, fileId, folderId, workspaceId },
        });
        await updateFile({ inTrash: '' }, fileId);
    };

    const restoreFolderHandler = async(fileId: string) => {
        if (!workspaceId) return;
        dispatch({
            type: 'UPDATE_FOLDER',
            payload: { folder: { inTrash: '' }, folderId: fileId, workspaceId },
        });
        await updateFolder({ inTrash: '' }, fileId);
    }

    return (
        <section>
            {!!folders.length && (
                <>
                    <h3>Folders</h3>
                    {folders.map((folder) => (
                        <div key={folder.id} className='flex justify-between items-center'>
                            <Link
                                className="hover:bg-muted rounded-md p-2 flex item-center justify-between"
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
                            <div className='flex'>
                                <div 
                                    onClick={() => restoreFolderHandler(folder.id)}
                                    role='button'
                                    className='rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                                >
                                    <Undo className='cursor-pointer h-5 w-5'/>
                                </div>
                                <div 
                                    onClick={() => deleteFolderHandler(folder.id)}
                                    role='button'
                                    className='rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                                >
                                    <Trash className="text-[red] cursor-pointer h-5 w-5"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}
            {!!files.length && (
                <>
                    <h3>Files</h3>
                    {files.map((file) => (
                        <div key={file.id} className='flex justify-between items-center'>
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
                            <div className='flex'>
                                <div 
                                    onClick={() => restoreFileHandler(file.id)}
                                    role='button'
                                    className='rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                                >
                                    <Undo className='cursor-pointer h-5 w-5'/>
                                </div>
                                <div 
                                    onClick={() => deleteFileHandler(file.id)}
                                    role='button'
                                    className='rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                                >
                                    <Trash className="text-[red] cursor-pointer h-5 w-5"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}
            {!files.length && !folders.length && (
                <div className="text-muted-foreground absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
                    No Items in trash
                </div>
            )}
        </section>
    );
};

export default TrashRestore;
