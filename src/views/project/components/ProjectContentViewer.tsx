export function ProjectContentViewer({ data }: { data: any }) {
    if (!data?.blocks) return null;
    return (
        <article className="prose max-w-none">
            {data.blocks.map((b: any, i: number) => {
                switch (b.type) {
                    case "header": {
                        const Tag = `h${b.data.level || 3}` as any;
                        return <Tag key={i} dangerouslySetInnerHTML={{ __html: b.data.text }} />;
                    }
                    case "paragraph":
                        return <p key={i} dangerouslySetInnerHTML={{ __html: b.data.text }} />;
                    case "image":
                        return (
                            <figure key={i} className="my-6">
                                <img src={b.data.file?.url} alt={b.data.caption || ""} loading="lazy" className="w-full rounded-lg" />
                                {b.data.caption && <figcaption className="text-sm text-gray-500 mt-2">{b.data.caption}</figcaption>}
                            </figure>
                        );
                    case "delimiter":
                        return <hr key={i} className="my-8" />;
                    default:
                        return null;
                }
            })}
        </article>
    );
}
