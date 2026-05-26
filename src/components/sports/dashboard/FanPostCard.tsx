interface FanPostCardProps {
  authorAvatar: string;
  authorName: string;
  authorHandle: string;
  postedAgo: string;
  title: string;
  image: string;
  href: string;
}

export function FanPostCard({
  authorAvatar,
  authorName,
  authorHandle,
  postedAgo,
  title,
  image,
  href,
}: FanPostCardProps) {
  return (
    <a href={href} className="block overflow-hidden rounded-3xl border border-border bg-surface shadow-card transition hover:border-white/15">
      <div className="flex items-center gap-3 p-4">
        <img src={authorAvatar} alt={authorName} className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10" />
        <div className="flex-1 leading-tight">
          <div className="text-sm font-semibold text-foreground">{authorName}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{authorHandle}</div>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">{postedAgo}</span>
      </div>
      <h3 className="px-4 pb-3 font-display text-base font-semibold text-foreground">{title}</h3>
      <div className="aspect-[16/9] w-full overflow-hidden">
        <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover" />
      </div>
    </a>
  );
}
