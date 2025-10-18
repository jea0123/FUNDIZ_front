import { Button } from "@/components/ui/button";
import type { CreatorProjectListDto } from "@/types/creator"
import type { ProjectStatus } from "@/views/admin/components/ProjectStatusChip";
import { ExternalLink, Eye, Gift, Megaphone, MessageSquareMore, Pencil, XCircle } from "lucide-react";

type Props = {
    project: CreatorProjectListDto;
    deletingId: number | null;
    onDetail: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onAddReward: (id: number) => void;
    onWriteNews?: (id: number) => void;
    onManageReviews?: (id: number) => void;
};

export default function CreatorProjectRowActions({ project, deletingId, onDetail, onEdit, onDelete, onAddReward, onWriteNews, onManageReviews }: Props) {
    const status = project.projectStatus as ProjectStatus;
    const isOpen = status === "OPEN";

    const publicUrl = `${window.location.origin}/project/${(project as any).slug ?? project.projectId}`;

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

                <Button variant="outline" size="sm" onClick={() => onAddReward(project.projectId)}>
                    <Gift className="h-4 w-4 mr-1" /> 리워드 추가
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onWriteNews?.(project.projectId)}
                    disabled={!onWriteNews || !isOpen}
                    title={!isOpen ? "진행 중에서만 새소식 등록 가능" : undefined}
                >
                    <Megaphone className="h-4 w-4 mr-1" /> 새소식 등록
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManageReviews?.(project.projectId)}
                    disabled={!onManageReviews || !isOpen}
                    title={!isOpen ? "진행 중에서만 후기 관리 가능" : undefined}
                >
                    <MessageSquareMore className="h-4 w-4 mr-1" /> 후기 관리
                </Button>
            </>
        );
    }
}