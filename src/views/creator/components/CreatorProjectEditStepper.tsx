import { Check } from "lucide-react";
import { CardTitle } from "@/components/ui/card";

type Step = { id: number; title: string; description?: string };
type Size = "sm" | "md";

const PALETTE: Record<
    string,
    { solid: string; on: string; text: string; ring: string; activeRing: string }
> = {
    blue: { solid: "bg-blue-600", on: "bg-blue-300", text: "text-blue-700", ring: "ring-gray-300", activeRing: "ring-blue-400" },
    green: { solid: "bg-green-600", on: "bg-green-300", text: "text-green-700", ring: "ring-gray-300", activeRing: "ring-green-400" },
    violet: { solid: "bg-violet-600", on: "bg-violet-300", text: "text-violet-700", ring: "ring-gray-300", activeRing: "ring-violet-400" },
};

export function CreatorProjectEditStepper({ steps, currentStep, progress, title = "프로젝트 만들기", colorClass = "blue", size = "sm" }: {
    steps: Step[];
    currentStep: number;
    progress?: number;
    title?: string;
    colorClass?: string;
    size?: Size;
}) {
    const isDone = (id: number) => currentStep > id;
    const isActive = (id: number) => currentStep === id;

    const palette = PALETTE[colorClass] ?? PALETTE.blue;
    const tone = {
        solid: palette.solid,
        lineOn: palette.on,
        lineOff: "bg-gray-200",
        ring: palette.ring,
    };

    const SZ = size === "sm"
        ? {
            node: "h-7 w-7 text-[11px]",
            gap: "gap-2",
            title: "text-[14px]",
            desc: "text-[12px]",
            connector: "h-0.5 mx-2",
            progressH: "h-2",
            stack: "space-y-4",
        }
        : {
            node: "h-9 w-9 text-sm",
            gap: "gap-3",
            title: "text-sm",
            desc: "text-xs",
            connector: "h-1 mx-3",
            progressH: "h-3",
            stack: "space-y-6",
        };

    const computedProgress =
        typeof progress === "number"
            ? Math.max(0, Math.min(100, progress))
            : Math.round((Math.max(1, Math.min(currentStep, steps.length)) / steps.length) * 100);

    return (
        <div className={SZ.stack}>
            <CardTitle className="text-2xl">{title}</CardTitle>

            <div className="hidden md:block">
                <ol className="flex items-center w-full" role="list" aria-label="진행 단계">
                    {steps.map((s, idx) => (
                        <li
                            key={s.id}
                            className={idx === steps.length - 1 ? "flex items-center flex-none" : "flex-1 flex items-center"}
                            aria-current={isActive(s.id) ? "step" : undefined}
                        >
                            <div className={`flex items-center ${SZ.gap}`}>
                                <StepNode sizeClass={SZ.node} done={isDone(s.id)} active={isActive(s.id)} palette={palette} />
                                <div className="min-w-0">
                                    {/* ❗ 하드코딩/템플릿 제거 → palette.text 사용 */}
                                    <div className={`${SZ.title} font-semibold truncate ${isActive(s.id) ? palette.text : "text-gray-800"}`}>
                                        {s.title}
                                    </div>
                                    {s.description && (
                                        <div className={`${SZ.desc} text-gray-500 truncate mt-0.5`}>{s.description}</div>
                                    )}
                                </div>
                            </div>

                            {idx < steps.length - 1 && (
                                <div
                                    className={`${SZ.connector} rounded-full flex-1 transition-colors ${currentStep > s.id ? tone.lineOn : tone.lineOff}`}
                                />
                            )}
                        </li>
                    ))}
                </ol>
            </div>

            <div className="w-full">
                <div className={`w-full ${SZ.progressH} rounded-full bg-gray-200 overflow-hidden`}>
                    <div
                        className={`h-full rounded-full transition-all ${tone.solid}`}
                        style={{ width: `${computedProgress}%` }}
                        role="progressbar"
                        aria-valuenow={computedProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="프로젝트 생성 진행률"
                    />
                </div>
            </div>
        </div>
    );
}

function StepNode({ done, active, sizeClass, palette }: {
    done: boolean;
    active: boolean;
    sizeClass: string;
    palette: { text: string; ring: string; activeRing: string };
}) {
    return (
        <div
            className={`relative flex items-center justify-center rounded-full ${sizeClass} ring-1 ${palette.ring} ${done
                ? "text-white " + palette.text.replace("text-", "bg-").replace("700", "600")
                : active
                    ? `bg-white ${palette.text}`
                    : "bg-gray-100 text-gray-600"
                }`}
        >
            {done && <Check className="h-4 w-4" />}
            {active && <span className={`absolute inset-0 rounded-full pointer-events-none ring-2 ${palette.activeRing}`} />}
        </div>
    );
}
