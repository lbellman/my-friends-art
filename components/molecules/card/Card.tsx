import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card as ShadCard,
  CardFooter,
} from "@/components/ui/card";

interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  justify?: "left" | "centered";
  icon?: React.ReactNode;
  footerContent?: React.ReactNode;
}

export default function Card({
  title,
  description,
  children,
  icon,
  justify = "left",
  footerContent,
}: CardProps) {
  return (
    <ShadCard>
      <CardHeader>
        {justify === "centered" ? (
          <div className="flex flex-col items-center justify-center">
            {icon && <div className="mx-auto mb-3">{icon}</div>}
            <div className="flex flex-col gap-2">
              <CardTitle className="text-center">{title}</CardTitle>
              <CardDescription className="text-center">
                {description}
              </CardDescription>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-nowrap">
            {icon && <div className="">{icon}</div>}
            <div className="flex flex-col gap-2">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent
        className={
          justify === "centered" ? "flex items-center justify-center" : ""
        }
      >
        {children}
      </CardContent>
      {footerContent && (
        <CardFooter
          className={
            justify === "centered" ? "flex items-center justify-center" : "justify-start"
          }
        >
          {footerContent}
        </CardFooter>
      )}
    </ShadCard>
  );
}
