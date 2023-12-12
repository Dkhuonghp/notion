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
                    <p className="text-muted-foreground cursor-pointer rounded-md hover:bg-muted transition-all pl-1 pr-1 inline">Private</p>
                    <hr/>
                    <>
                        {privateWorkspaces.map((option) => (
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
                    <p className="text-muted-foreground cursor-pointer rounded-md hover:bg-muted transition-all pl-1 pr-1 inline">Shared</p>
                    <hr/>
                    {sharedWorkspaces.map((option) => (
                        <SelectedWorkspace
                            key={option.id}
                            workspace={option}
                        />
                    ))}
                </>
            )}
            {!!collaboratingWorkspaces.length && (
                <>
                    <span className="text-muted-foreground cursor-pointer rounded-md hover:bg-muted transition-all pl-1 pr-1 inline">Collaborating</span>
                    <hr/>
                    {collaboratingWorkspaces.map((option) => (
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