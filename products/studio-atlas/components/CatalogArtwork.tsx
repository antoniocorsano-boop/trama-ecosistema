import Image from "next/image";
export function CatalogArtwork({src}:{src:string}) {
  return <Image className="catalog-artwork" src={src} alt="" width={640} height={360}
    unoptimized sizes="(max-width: 650px) 100vw, 360px" />;
}
