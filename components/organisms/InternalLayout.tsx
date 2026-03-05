interface InternalLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function InternalLayout({
  children,
  title,
  description,
}: InternalLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center ">
      {title && (
        <header className="max-w-7xl px-6 w-full pb-6 pt-12">
          <h2>{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </header>
      )}
      <main className="flex-1 max-w-6xl mx-auto px-6 w-full py-12">
        {children}
      </main>
    </div>
  );
}
