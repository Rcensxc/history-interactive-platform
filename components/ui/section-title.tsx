type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionTitle({
  eyebrow,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-xs font-medium uppercase tracking-[0.35em] text-amber-200/70">
        {eyebrow}
      </p>
      <h1 className="font-display text-4xl leading-tight text-stone-50 md:text-5xl">
        {title}
      </h1>
      <p className="text-base leading-8 text-stone-300 md:text-lg">{description}</p>
    </div>
  );
}
