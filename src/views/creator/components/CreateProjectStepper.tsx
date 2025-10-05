import { Progress } from "@/components/ui/progress";

type Step = { id: number; title: string; description: string };

export function CreateProjectStepper({
    steps, currentStep, progress
}: { steps: Step[]; currentStep: number; progress: number }) {
    return (
        <div className="mb-8">
            <h1 className="text-3xl mb-6">프로젝트 만들기</h1>
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
            <div className="mt-4">
                <h2 className="text-xl font-semibold">{steps[currentStep - 1].title}</h2>
                <p className="text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
        </div>
    );
}