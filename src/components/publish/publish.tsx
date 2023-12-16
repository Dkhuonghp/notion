"use client"

import { useOrigin } from "@/lib/hooks/useOrigin"
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Check, Copy, Globe } from "lucide-react";
import { updateFile, updateFolder, updateWorkspace } from "@/lib/supabase/queries";
import { useAppState } from "@/lib/providers/state-provider";
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import {
  PopoverTrigger,
  Popover,
  PopoverContent
} from "@/components/ui/popover"
import { usePathname } from "next/navigation";


interface PublishProps {
    dirDetails: File | Folder | workspace;
    fileId: string;
    dirType: 'workspace' | 'folder' | 'file';
}

export const  Publish = ({
    dirDetails,
    dirType,
    fileId,
}: PublishProps) => {
    const [copied, setCopied] = useState(false);
    const { state, workspaceId, folderId, dispatch } = useAppState();
    const origin = useOrigin()
    const pathname = usePathname()
    const url = `${origin}/preview/${pathname}`
    const urlParts = url.split('/dashboard/');
    const parts = urlParts[urlParts.length - 1];

    const details = useMemo(() => {
        let selectedDir;
        if (dirType === 'file') {
            selectedDir = state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.id === folderId)
                ?.files.find((file) => file.id === fileId);
        }
        if (dirType === 'folder') {
            selectedDir = state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.id === fileId);
        }
        if (dirType === 'workspace') {
            selectedDir = state.workspaces.find(
                (workspace) => workspace.id === fileId
            );
        }
    
        if (selectedDir) {
            return selectedDir;
        }
    
        return {
            title: dirDetails.title,
            iconId: dirDetails.iconId,
            createdAt: dirDetails.createdAt,
            data: dirDetails.data,
            inTrash: dirDetails.inTrash,
            bannerUrl: dirDetails.bannerUrl,
            published: dirDetails.published    
        } as workspace | Folder | File;
    }, [state, workspaceId, folderId]);      

    const onPublish = async() => {
        if (dirType === 'workspace') {
            if (!fileId) return;
            try {
                dispatch({
                    type: 'UPDATE_WORKSPACE',
                    payload: { workspace: { published: true }, workspaceId: fileId },
                });
                await updateWorkspace({ published: true }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
        if (dirType === 'folder') {
            if (!workspaceId) return;
            try {
                dispatch({
                    type: 'UPDATE_FOLDER',
                    payload: { folder: { published: true }, workspaceId, folderId: fileId },
                });
                await updateFolder({ published: true }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
        if (dirType === 'file') {
            if (!folderId || !workspaceId) return;
            try {
                dispatch({
                    type: 'UPDATE_FILE',
                    payload: { file: { published: true }, folderId, workspaceId, fileId },
                });
                await updateFile({ published: true }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
    }

    const onUnpublish = async() => {
        if (dirType === 'workspace') {
            if (!fileId) return;
            try {
                dispatch({
                    type: 'UPDATE_WORKSPACE',
                    payload: { workspace: { published: false }, workspaceId: fileId },
                });
                await updateWorkspace({ published: false }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
        if (dirType === 'folder') {
            if (!workspaceId) return;
            try {
                dispatch({
                    type: 'UPDATE_FOLDER',
                    payload: { folder: { published: false }, workspaceId, folderId: fileId },
                });
                await updateFolder({ published: false }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
        if (dirType === 'file') {
            if (!folderId || !workspaceId) return;
            try {
                dispatch({
                    type: 'UPDATE_FILE',
                    payload: { file: { published: false }, folderId, workspaceId, fileId },
                });
                await updateFile({ published: false }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
    }


    const onCopy = () => {
        navigator.clipboard.writeText(`${origin}/preview/${parts}`)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 1000)
    }
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="sm" variant="ghost">
                Publish 
                {details.published && (
                    <Globe className="text-sky-500 w-4 h-4 ml-2"/>
                )}
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-72" 
                align="end"
                alignOffset={8}
                forceMount
            >
                {details.published ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-x-2">
                            <Globe className="text-sky-500 animate-pulse h-4 w-4" />
                            <p className="text-xs font-medium text-sky-500">
                                This note is live on web.
                            </p>
                        </div>
                        <div className="flex items-center">
                            <input 
                                className="flex-1 px-2 text-xs border rounded-l-md h-8 bg-muted truncate"
                                value={`${origin}/preview/${parts}`}
                                disabled
                            />
                            <Button
                                onClick={onCopy}
                                disabled={copied}
                                className="h-8 rounded-l-none"
                            >
                                {copied ? (
                                <Check className="h-4 w-4" />
                                ) : (
                                <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <Button
                            size="sm"
                            className="w-full text-xs"
                            onClick={onUnpublish}
                        >
                            Unpublish
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <Globe className="h-8 w-8 text-muted-foreground mb-2"/>
                        <p className="text-sm font-medium mb-2">
                            Publish this note
                        </p>
                        <span className="text-xs text-muted-foreground mb-4">
                            Share your work with others.
                        </span>
                        <Button
                            onClick={onPublish}
                            className="w-full text-xs"
                            size="sm"
                        >
                        Publish
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

