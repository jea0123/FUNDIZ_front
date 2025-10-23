import { CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Step = { id: number; title: string; description: string };

export function CreatorProjectEditStepper({
    steps, currentStep, progress, title = "프로젝트 만들기"
}: { steps: Step[]; currentStep: number; progress: number, title?: string }) {
    return (
        <div className="space-y-6">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className={
                            `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step.id
                                ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`
                        }>
                            {step.id}
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-16 h-1 mx-2 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            <Progress value={progress} className="h-2" />
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">{steps[currentStep - 1].title}</h2>
                <p className="text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
        </div>
    );
}