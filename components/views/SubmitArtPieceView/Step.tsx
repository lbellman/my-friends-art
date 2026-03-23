interface StepProps {
  title?: string;
  description?: string;
  stepNumber: number;
  children: React.ReactNode;
}

export default function Step({
  title,
  description,
  stepNumber,
  children,
}: StepProps) {
  return (
    <div className="relative h-full w-full max-w-3xl p-6 ">
      <div className="flex items-center gap-4">
        <div className="bg-primary rounded-full min-w-8 min-h-8 flex items-center justify-center">
          <p className="text-primary-foreground body2">{stepNumber}</p>
        </div>
        <div className="flex flex-col">
          <p className="body1">{title}</p>
          <p className="body2 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-6 border-t pt-6">{children}</div>
    </div>
  );
}
