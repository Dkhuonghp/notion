'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import 'quill/dist/quill.bubble.css';
import {BlockNoteEditor, PartialBlock} from '@blocknote/core'
import {BlockNoteView, useBlockNote} from '@blocknote/react'
import '@blocknote/core/style.css'
import { Button } from '../ui/button';
import {
  deleteFile,
  deleteFolder,
  findUser,
  getFileDetails,
  getFolderDetails,
  getWorkspaceDetails,
  updateFile,
  updateFolder,
  updateWorkspace,
} from '@/lib/supabase/queries';
import { usePathname, useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import EmojiPicker from '../global/emoji-picker';
import BannerUpload from '../banner-upload/banner-upload';
import { XCircleIcon } from 'lucide-react';
import { useSocket } from '@/lib/providers/socket-provider';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { Publish } from '../publish/publish';
import Error from '../ui/error';

interface PreviewEditorPageProps {
  dirDetails: File | Folder | workspace;
  fileId: string;
  dirType: 'workspace' | 'folder' | 'file';
}

const PreviewEditorPage: React.FC<PreviewEditorPageProps> = ({
  dirDetails,
  dirType,
  fileId,
}) => {
  const supabase = createClientComponentClient();
  const { state, workspaceId, folderId, dispatch } = useAppState();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const { user } = useSupabaseUser();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const pathname = usePathname();
  const [quill, setQuill] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<
    { id: string; email: string; avatarUrl: string }[]
  >([]);
  const [deletingBanner, setDeletingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localCursors, setLocalCursors] = useState<any>([]);  

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

  const wrapperRef = useCallback(async (wrapper: any) => {
    if (typeof window !== 'undefined') {
      if (wrapper === null) return;
      wrapper.innerHTML = '';
      const editor = document.createElement('div');
      wrapper.append(editor);
      const Quill = (await import('quill')).default;
      const QuillCursors = (await import('quill-cursors')).default;
      Quill.register('modules/cursors', QuillCursors);
      const q = new Quill(editor);
      q.enable(false)
      setQuill(q);
    }
  }, []);

  useEffect(() => {
    if (!fileId) return;
    let selectedDir;
    const fetchInformation = async () => {
      if (dirType === 'file') {
        const { data: selectedDir, error } = await getFileDetails(fileId);
        if (error || !selectedDir) {
          return router.replace('/dashboard');
        }

        if (!selectedDir[0]) {
          if (!workspaceId) return;
          return router.replace(`/dashboard/${workspaceId}`);
        }
        if (!workspaceId || quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_FILE',
          payload: {
            file: { data: selectedDir[0].data },
            fileId,
            folderId: selectedDir[0].folderId,
            workspaceId,
          },
        });
      }
      if (dirType === 'folder') {
        const { data: selectedDir, error } = await getFolderDetails(fileId);
        if (error || !selectedDir) {
          return router.replace('/dashboard');
        }

        if (!selectedDir[0]) {
          router.replace(`/dashboard/${workspaceId}`);
        }
        if (quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_FOLDER',
          payload: {
            folderId: fileId,
            folder: { data: selectedDir[0].data },
            workspaceId: selectedDir[0].workspaceId,
          },
        });
      }
      if (dirType === 'workspace') {
        const { data: selectedDir, error } = await getWorkspaceDetails(fileId);
        if (error || !selectedDir) {
          return router.replace('/dashboard');
        }
        if (!selectedDir[0] || quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_WORKSPACE',
          payload: {
            workspace: { data: selectedDir[0].data },
            workspaceId: fileId,
          },
        });
      }
    };
    fetchInformation();
  }, [fileId, workspaceId, quill, dirType]);  

  useEffect(() => {
    if (quill === null || socket === null || !fileId || !localCursors.length)
      return;
    const socketHandler = (range: any, roomId: string, cursorId: string) => {
      if (roomId === fileId) {
        const cursorToMove = localCursors.find(
          (c: any) => c.cursors()?.[0].id === cursorId
        );
        if (cursorToMove) {
          cursorToMove.moveCursor(cursorId, range);
        }
      }
    };
    socket.on('receive-cursor-move', socketHandler);
    return () => {
      socket.off('receive-cursor-move', socketHandler);
    };
  }, [quill, socket, fileId, localCursors]);

  //rooms
  useEffect(() => {
    if (socket === null || quill === null || !fileId) return;
    socket.emit('create-room', fileId);
  }, [socket, quill, fileId]);

  //Send quill changes to all clients
  useEffect(() => {
    if (quill === null || socket === null || !fileId || !user) return;

    const selectionChangeHandler = (cursorId: string) => {
      return (range: any, oldRange: any, source: any) => {
        if (source === 'user' && cursorId) {
          socket.emit('send-cursor-move', range, fileId, cursorId);
        }
      };
    };
    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== 'user') return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async () => {
        if (contents && quillLength > 0 && fileId) {
          if (dirType == 'workspace') {
            dispatch({
              type: 'UPDATE_WORKSPACE',
              payload: {
                workspace: { data: JSON.stringify(contents) },
                workspaceId: fileId,
              },
            });
            await updateWorkspace({ data: JSON.stringify(contents) }, fileId);
          }
          if (dirType == 'folder') {
            if (!workspaceId) return;
            dispatch({
              type: 'UPDATE_FOLDER',
              payload: {
                folder: { data: JSON.stringify(contents) },
                workspaceId,
                folderId: fileId,
              },
            });
            await updateFolder({ data: JSON.stringify(contents) }, fileId);
          }
          if (dirType == 'file') {
            if (!workspaceId || !folderId) return;
            dispatch({
              type: 'UPDATE_FILE',
              payload: {
                file: { data: JSON.stringify(contents) },
                workspaceId,
                folderId: folderId,
                fileId,
              },
            });
            await updateFile({ data: JSON.stringify(contents) }, fileId);
          }
        }
        setSaving(false);
      }, 850);
      socket.emit('send-changes', delta, fileId);
    };
    quill.on('text-change', quillHandler);
    quill.on('selection-change', selectionChangeHandler(user.id));

    return () => {
      quill.off('text-change', quillHandler);
      quill.off('selection-change', selectionChangeHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [quill, socket, fileId, user, details, folderId, workspaceId, dispatch]);

  useEffect(() => {
    if (quill === null || socket === null) return;
    const socketHandler = (deltas: any, id: string) => {
      if (id === fileId) {
        quill.updateContents(deltas);
      }
    };
    socket.on('receive-changes', socketHandler);
    return () => {
      socket.off('receive-changes', socketHandler);
    };
  }, [quill, socket, fileId]);

  useEffect(() => {
    if (!fileId || quill === null) return;
    const room = supabase.channel(fileId);
    const subscription = room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState();
        const newCollaborators = Object.values(newState).flat() as any;
        setCollaborators(newCollaborators);
        if (user) {
          const allCursors: any = [];
          newCollaborators.forEach(
            (collaborator: { id: string; email: string; avatar: string }) => {
              if (collaborator.id !== user.id) {
                const userCursor = quill.getModule('cursors');
                userCursor.createCursor(
                  collaborator.id,
                  collaborator.email.split('@')[0],
                  `#${Math.random().toString(16).slice(2, 8)}`
                );
                allCursors.push(userCursor);
              }
            }
          );
          setLocalCursors(allCursors);
        }
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED' || !user) return;
        const response = await findUser(user.id);
        if (!response) return;

        room.track({
          id: user.id,
          email: user.email?.split('@')[0],
          avatarUrl: response.avatarUrl
            ? supabase.storage.from('avatars').getPublicUrl(response.avatarUrl)
                .data.publicUrl
            : '',
        });
      });
    return () => {
      supabase.removeChannel(room);
    };
  }, [fileId, quill, supabase, user]);  

    return (
        <>
            {details.published === true ?
                <>
                    {details.bannerUrl && (
                        <div className="relative w-full h-[200px]">
                            <Image
                                src={
                                supabase.storage
                                    .from('file-banners')
                                    .getPublicUrl(details.bannerUrl).data.publicUrl
                                }
                                fill
                                className="w-full md:h-48 h-20 object-cover"
                                alt="Banner Image"
                            />
                        </div>
                    )}
                    <div className="flex justify-center items-center flex-col mt-2 relative">
                        <div className="w-full self-center max-w-[1100px] flex flex-col px-[15px] lg:my-8">
                            <div className="text-[80px]">
                                <div className="w-[100px] transition-colors h-[100px] flex items-center justify-center rounded-xl">
                                    {details.iconId}
                                </div>
                            </div>
                            <span className="font-bold text-[40px] bg-transparent">{details.title}</span>
                        </div>
                        <div id="container" className="w-full" ref={wrapperRef}></div>
                    </div> 
                </>
            : <Error/>}
        </>
    );
};

export default PreviewEditorPage;
