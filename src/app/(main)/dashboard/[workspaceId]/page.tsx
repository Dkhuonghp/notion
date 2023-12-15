export const dynamic = 'force-dynamic';

import { Publish } from '@/components/publish/publish';
import QuillEditor from '@/components/quill-editor/quill-editor';
import { getWorkspaceDetails } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import React from 'react';

const Workspace = async ({ params }: { params: { workspaceId: string } }) => {
  const { data, error } = await getWorkspaceDetails(params.workspaceId);
  if (error || !data.length) redirect('/dashboard');
  return (
    <div className="relative">
      <Publish
        dirType="workspace"
        fileId={params.workspaceId}
        dirDetails={data[0] || {}}
      />
      <QuillEditor
        dirType="workspace"
        fileId={params.workspaceId}
        dirDetails={data[0] || {}}
      />
    </div>
  );
};

export default Workspace;
