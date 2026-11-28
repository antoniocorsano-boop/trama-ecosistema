export type TramaBackgroundSources = {
  lim: string;
  s: string;
  m: string;
  l: string;
};

export type TramaMediaBackdropProps = {
  background: TramaBackgroundSources;
  className?: string;
};

export function TramaMediaBackdrop({ background, className }: TramaMediaBackdropProps) {

  return (
    <div className={className} aria-hidden="true">
      <picture>
        <source media="(min-width: 1024px)" srcSet={background.l} />
        <source media="(min-width: 600px)" srcSet={background.m} />
        <source media="(max-width: 359px)" srcSet={background.lim} />
        <img
          data-testid="trama-media-poster"
          src={background.s}
          alt=""
          className="trama-media-visual absolute inset-0 h-full w-full object-cover"
        />
      </picture>
    </div>
  );
}
