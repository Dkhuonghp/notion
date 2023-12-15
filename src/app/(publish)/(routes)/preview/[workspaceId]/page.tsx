import { getWorkspaceDetails } from "@/lib/supabase/queries";
import dynamic from "next/dynamic";


const PreviewPage = async({ params }: { params: { workspaceId: string } }) => {

    const { data, error } = await getWorkspaceDetails(params.workspaceId);
    
    const Editor = dynamic(() => import("@/components/preview-editor/preview-editor"), { ssr: false })

    if(data === undefined) {
        return <div>Not found</div>
    }
    
    return (
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
            <Editor
                dirType="workspace"
                fileId={params.workspaceId}
                dirDetails={data[0] || {}}
            />
        </div>
    )
}

export default PreviewPage