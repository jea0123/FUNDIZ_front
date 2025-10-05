import { Button } from "@/components/ui/button";
import type { CreatorProjectListDto } from "@/types/creator"
import type { Status } from "@/views/admin/tabs/ProjectsTab";
import { ExternalLink, Eye, Gift, Pencil, XCircle } from "lucide-react";

type Props = {
    project: CreatorProjectListDto;
    deletingId: number | null;
    onDetail: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
};

export default function QuickActions({ project, deletingId, onDetail, onEdit, onDelete }: Props) {
    const status = project.projectStatus as Status;

    const publicUrl = `${window.location.origin}/projects/${(project as any).slug ?? project.projectId}`;

    if (status === "DRAFT") {
        return (
            <>
                <Button variant="outline" size="sm" onClick={() => onEdit(project.projectId)}>
                    <Pencil className="h-4 w-4 mr-1" /> 수정
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(project.projectId)}
                    disabled={deletingId === project.projectId}
                >
                    <XCircle className="h-4 w-4 mr-1" /> {deletingId === project.projectId ? "삭제중" : "삭제"}
                </Button>
            </>
        );
    }

    if (status === "VERIFYING") {
        return (
            <>
                <Button variant="outline" size="sm" onClick={() => onDetail(project.projectId)}>
                    <Eye className="h-4 w-4 mr-1" /> 상세보기
                </Button>
            </>
        );
    }

    if (status === "UPCOMING" || status === "OPEN") {
        return (
            <>
                <Button asChild variant="default" size="sm">
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" /> 라이브 페이지
                    </a>
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(project.projectId)}>
                    <Gift className="h-4 w-4 mr-1" /> 리워드 추가
                </Button>
            </>
        );
    }
}