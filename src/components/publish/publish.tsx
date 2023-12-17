"use client"

import { useOrigin } from "@/lib/hooks/useOrigin"
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Check, Copy, Globe, Search } from "lucide-react";
import { addCollaborators, getUsersFromSearch, updateFile, updateFolder, updateWorkspace } from "@/lib/supabase/queries";
import { useAppState } from "@/lib/providers/state-provider";
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import { PopoverTrigger, Popover, PopoverContent } from "@/components/ui/popover"
import { usePathname } from "next/navigation";
import { Input } from '../ui/input';
import { User } from '@/lib/supabase/supabase.types';
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { useRouter } from "next/navigation";


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
    const [isToggled, setIsToggled] = useState(false);
    const { state, workspaceId, folderId, dispatch } = useAppState();
    const [searchResults, setSearchResults] = useState<User[] | []>([]);
    const origin = useOrigin()
    const pathname = usePathname()
    const url = `${origin}/preview/${pathname}`
    const urlParts = url.split('/dashboard/');
    const parts = urlParts[urlParts.length - 1];
    const [activeTab, setActiveTab] = useState('tab1');
    const timerRef = useRef<ReturnType<typeof setTimeout>>();
    const [collaborators, setCollaborators] = useState<User[] | []>([]);
    const { user, subscription } = useSupabaseUser();
    const { open, setOpen } = useSubscriptionModal();
    const router = useRouter();


    const addCollaborator = async (profile: User) => {
        if (!workspaceId) return;
        if (subscription?.status !== 'active' && collaborators.length >= 2) {
          setOpen(true);
          return;
        }
        await addCollaborators([profile], workspaceId);
        setCollaborators([...collaborators, profile]);
        router.refresh();
    };
    
    useEffect(() => {
        return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
        };
      }, []);

    const handleTabClick = (tab: any) => {
        setActiveTab(tab);
    };

    console.log(searchResults);
    

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
            published: dirDetails.published,
            editActive: dirDetails.editActive,
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

    const unPublish = async() => {
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

    const handleOnEditActive = async() => {
        if (dirType === 'workspace') {
            if (!fileId) return;
            try {
                dispatch({
                    type: 'UPDATE_WORKSPACE',
                    payload: { workspace: { editActive: true }, workspaceId: fileId },
                });
                await updateWorkspace({ editActive: true }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
        if (dirType === 'folder') {
            if (!workspaceId) return;
            try {
                dispatch({
                    type: 'UPDATE_FOLDER',
                    payload: { folder: { editActive: true }, workspaceId, folderId: fileId },
                });
                await updateFolder({ editActive: true }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
        if (dirType === 'file') {
            if (!folderId || !workspaceId) return;
            try {
                dispatch({
                    type: 'UPDATE_FILE',
                    payload: { file: { editActive: true }, folderId, workspaceId, fileId },
                });
                await updateFile({ editActive: true }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
    }

    const handleUnEditActive = async() => {
        if (dirType === 'workspace') {
            if (!fileId) return;
            try {
                dispatch({
                    type: 'UPDATE_WORKSPACE',
                    payload: { workspace: { editActive: false }, workspaceId: fileId },
                });
                await updateWorkspace({ editActive: false }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
        if (dirType === 'folder') {
            if (!workspaceId) return;
            try {
                dispatch({
                    type: 'UPDATE_FOLDER',
                    payload: { folder: { editActive: false }, workspaceId, folderId: fileId },
                });
                await updateFolder({ editActive: false }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
        if (dirType === 'file') {
            if (!folderId || !workspaceId) return;
            try {
                dispatch({
                    type: 'UPDATE_FILE',
                    payload: { file: { editActive: false }, folderId, workspaceId, fileId },
                });
                await updateFile({ editActive: false }, fileId)
            } catch (error) {
                console.log(error);
            }
        }
    }

    const handleToggle = () => {
        setIsToggled((prev) => !prev);
        if(!isToggled) {
            handleOnEditActive()
        } else {
            handleUnEditActive()
        }
    };

    const onCopy = () => {
        navigator.clipboard.writeText(`${origin}/preview/${parts}`)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 1000)
    }

    const handleUnPublishAndUnEditActive = async() => {
        await unPublish()
        await handleUnEditActive()
    }

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (timerRef) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            const res = await getUsersFromSearch(e.target.value);
            setSearchResults(res);
        }, 450);
    };
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="sm" variant="ghost">
                    Share
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[30rem]"
                align="end"
                alignOffset={8}
                forceMount
            >
                <div>
                    <div className="flex">
                        <div className="hover:bg-muted rounded-md">
                            <div
                                className={`cursor-pointer p-2 flex items-center text-[14px] ${activeTab === 'tab1' ? 'border-b-2 border-blue-500 transition' : 'text-gray-500'}`}
                                onClick={() => handleTabClick('tab1')}
                            >
                                Share
                            </div>
                        </div>
                        <button className="hover:bg-muted rounded-md ml-3">
                            <div
                                className={`cursor-pointer p-2 flex items-center text-[14px] ${activeTab === 'tab2' ? 'border-b-2 border-blue-500 transition' : 'text-gray-500'}`}
                                onClick={() => handleTabClick('tab2')}
                            >
                                Publish
                                {details.published && (
                                    <Globe className="text-sky-500 animate-pulse w-4 h-4 ml-2"/>
                                )}
                            </div>
                        </button>
                    </div>

                    <div className="mt-4">
                        {activeTab === 'tab1' && (
                            <>
                                <div className="flex justify-center items-center gap-2 mt-2">  
                                    <Search className="absolute z-10 right-8"/>
                                    <Input
                                        name="name"
                                        className="dark:bg-background"
                                        placeholder="Email"
                                        onChange={onChangeHandler}
                                    />
                                </div>
                                <ScrollArea className="mt-6 overflow-y-scroll w-full rounded-md">
                                    {searchResults.filter((result) => result.id !== user?.id).map((user) => (
                                        <div
                                            key={user.id}
                                            className="py-4 flex justify-between items-center"
                                        >
                                            <div className="flex gap-4 items-center">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>{user.email?.slice(0, 1)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm gap-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                                                    {user.email}
                                                </div>
                                            </div>
                                            <Button variant="secondary" onClick={() => addCollaborator(user)}>
                                                Add
                                            </Button>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </>
                        )}
                        {activeTab === 'tab2' && (
                            <>
                                {details.published ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-x-2">
                                            <Globe className="text-sky-500 animate-pulse h-4 w-4" />
                                            <p className="text-xs font-medium text-sky-500">
                                                This note is live on web.
                                            </p>
                                        </div>
                                        <div className="text-[12px] white-space text-muted-foreground font-medium">Direct site link</div>
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
                                        <div>
                                            <div className="text-[12px] mb-3 white-space text-muted-foreground font-medium">Site actions</div>
                                            <div className="flex items-center justify-between cursor-pointer" onClick={handleToggle}>
                                                <div className="text-[14px]">Allow editing</div>
                                                <label className="cursor-pointer">
                                                    <div className={`relative rounded-full w-8 h-4 transition ${details.editActive ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                        <div className={`toggle-circle absolute w-4 h-4 bg-white rounded-full shadow-md transition ${details.editActive ? 'transform translate-x-full' : ''}`}></div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="flex items-center justify-between">
                                            <Button
                                                size="sm"
                                                className="w-full text-xs mr-2"
                                                onClick={handleUnPublishAndUnEditActive}
                                            >
                                                Unpublish
                                            </Button>
                                            <a href={`${origin}/preview/${parts}`} target="_blank" className="w-full ml-2">
                                                <Button
                                                    size="sm"
                                                    className="w-full text-xs"
                                                >
                                                    View site
                                                </Button>
                                            </a>
                                        </div>
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
                            </>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

