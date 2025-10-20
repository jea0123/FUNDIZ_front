import { endpoints, getData } from "@/api/apis";
import { useEffect, useMemo, useState } from "react";

type Props = { creatorId: number };

type CreatorBio = {
    creatorId: number;
    creatorName: string;
    bio: string | null;
}

export default function CreatorProfile({ creatorId }: Props) {
    const [loading, setLoading] = useState(false);
    const [bio, setBio] = useState<CreatorBio | null>(null);

    const fetchBio = useMemo(() => {
        return async () => {
            setLoading(true);
            const res = await getData(endpoints.getCreatorBio(creatorId));
            if (res.status === 200) {
                setBio(res.data as CreatorBio);
            }
            setLoading(false);
        }
    }, [creatorId]);

    useEffect(() => {
        fetchBio();
    }, [fetchBio]);

    return (
        <div>
            {loading && <p>로딩 중...</p>}
            {!loading && bio && (
                <div>
                    <p className="whitespace-pre-wrap">{bio.bio}</p>
                </div>
            )}
            {!loading && bio && bio.bio === null && <p>소개 정보가 없습니다.</p>}
            {!loading && !bio && <p>소개 정보를 불러올 수 없습니다.</p>}
        </div>
    )
}
