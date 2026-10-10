export function TramaSegnoVivo() {
  return (
    <div
      data-testid="trama-segno-vivo"
      aria-hidden="true"
      className="trama-segno-vivo pointer-events-none absolute inset-0 z-[5] overflow-hidden"
    >
      <svg
        className="hidden h-full w-full sm:block"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          data-testid="trama-copper-curve"
          data-zone="peripheral"
          className="trama-copper-curve trama-copper-curve-soft"
          d="M-130 180 C 150 95, 390 105, 655 238"
        />
        <path
          data-testid="trama-copper-curve"
          data-zone="peripheral"
          className="trama-copper-curve"
          d="M930 78 C 1190 15, 1450 70, 1715 255"
        />
        <path
          data-testid="trama-copper-curve"
          data-zone="peripheral"
          className="trama-copper-curve"
          d="M430 955 C 780 785, 1115 770, 1360 585 S 1540 365, 1715 285"
        />
        <path
          data-testid="trama-copper-curve"
          data-zone="peripheral"
          className="trama-copper-curve trama-copper-curve-soft"
          d="M1265 690 C 1450 585, 1555 455, 1700 330"
        />
        <circle className="trama-copper-node" cx="1360" cy="585" r="3.6" />
        <circle className="trama-copper-node" cx="1510" cy="430" r="2.8" />
      </svg>

      <svg
        className="h-full w-full sm:hidden"
        viewBox="0 0 390 844"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          data-testid="trama-copper-curve"
          data-zone="peripheral"
          className="trama-copper-curve trama-copper-curve-soft"
          d="M-60 185 C 25 150, 75 170, 125 235"
        />
        <path
          data-testid="trama-copper-curve"
          data-zone="peripheral"
          className="trama-copper-curve"
          d="M430 185 C 365 275, 365 390, 430 515"
        />
        <path
          data-testid="trama-copper-curve"
          data-zone="peripheral"
          className="trama-copper-curve"
          d="M-45 795 C 90 715, 235 760, 430 635"
        />
        <path
          data-testid="trama-copper-curve"
          data-zone="peripheral"
          className="trama-copper-curve trama-copper-curve-soft"
          d="M350 715 C 390 660, 405 590, 435 535"
        />
        <circle className="trama-copper-node" cx="355" cy="684" r="3" />
      </svg>
    </div>
  );
}
