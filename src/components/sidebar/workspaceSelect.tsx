'use client'
import { useAppState } from '@/lib/providers/state-provider';
import { workspace } from '@/lib/supabase/supabase.types';
import React, { useEffect, useState } from "react"
import SelectedWorkspace from './selected-workspace';

interface WorkspaceProps {
    privateWorkspaces: workspace[] | [];
    sharedWorkspaces: workspace[] | [];
    collaboratingWorkspaces: workspace[] | [];
    defaultValue: workspace | undefined;
}

const WorkspaceSelect: React.FC<WorkspaceProps> = ({
    privateWorkspaces,
    collaboratingWorkspaces,
    sharedWorkspaces,
    defaultValue,
}) => {
    const { dispatch, state } = useAppState();
    const getInitialShowValue = () => {
        const keysToCheck = ['showPrivate', 'showShared', 'showCollaborating'];
    
        for (const key of keysToCheck) {
            const storedValue = localStorage.getItem(key);
            if (storedValue !== null) {
                return JSON.parse(storedValue);
            }
        }
        return true;
    };
    const [showCollaborating, setShowCollaborating] = useState(getInitialShowValue)
    const [showPrivate, setShowPrivate] = useState(getInitialShowValue)
    const [showShared, setShowShared] = useState(getInitialShowValue)

    useEffect(() => {
        localStorage.setItem('showPrivate', JSON.stringify(showPrivate));
        localStorage.setItem('showShared', JSON.stringify(showShared))
        localStorage.setItem('showCollaborating', JSON.stringify(showCollaborating))
    }, [showPrivate, showShared, showCollaborating]);

    const handleShowPrivate = () => {
        setShowPrivate(!showPrivate)
    }
    const handleShowShared = () => {
        setShowShared(!showShared)
    }

    const handleShowCollaborating = () => {
        setShowCollaborating(!showCollaborating)
    }

    useEffect(() => {
        if (!state.workspaces.length) {
            dispatch({
                type: 'SET_WORKSPACES',
                payload: {
                    workspaces: [
                        ...privateWorkspaces,
                        ...sharedWorkspaces,
                        ...collaboratingWorkspaces,
                    ].map((workspace) => ({ ...workspace, folders: [] })),
                },
            });
        }
    }, [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces]);

    return (
        <div>
            {!!privateWorkspaces.length && (
                <>
                    <span className="text-muted-foreground cursor-pointer rounded-md hover:bg-muted transition-all pl-1 pr-1 inline" onClick={handleShowPrivate}>Private</span>
                    <hr className='opacity-0 pb-2'/>
                    <>
                        {showPrivate && privateWorkspaces.map((option) => (
                            <SelectedWorkspace
                                key={option.id}
                                workspace={option}
                            />
                        ))}
                    </>
                </>
            )}
            {!!sharedWorkspaces.length && (
                <>
                    <span className="text-muted-foreground cursor-pointer rounded-md hover:bg-muted transition-all pl-1 pr-1 inline" onClick={handleShowShared}>Shared</span>
                    <hr className='opacity-0 pb-2'/>
                    {showShared && sharedWorkspaces.map((option) => (
                        <SelectedWorkspace
                            key={option.id}
                            workspace={option}
                        />
                    ))}
                </>
            )}
            {!!collaboratingWorkspaces.length && (
                <>
                    <span className="text-muted-foreground cursor-pointer rounded-md hover:bg-muted transition-all pl-1 pr-1 inline" onClick={handleShowCollaborating}>Collaborating</span>
                    <hr className='opacity-0 pb-2'/>
                    {showCollaborating && collaboratingWorkspaces.map((option) => (
                        <SelectedWorkspace
                            key={option.id}
                            workspace={option}
                        />
                    ))}
                </>
            )}
        </div>
    )

}

export default WorkspaceSelect