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
          className="trama-copper-curve"
          d="M-120 145 C 260 165, 430 290, 690 390 S 1190 450, 1710 70"
        />
        <path
          data-testid="trama-copper-curve"
          className="trama-copper-curve trama-copper-curve-soft"
          d="M-80 250 C 340 305, 500 390, 780 520 S 1230 585, 1690 330"
        />
        <path
          data-testid="trama-copper-curve"
          className="trama-copper-curve"
          d="M430 930 C 790 710, 1090 770, 1320 550 S 1500 270, 1660 160"
        />
        <circle className="trama-copper-node" cx="1320" cy="550" r="4" />
        <circle className="trama-copper-node" cx="1445" cy="410" r="3" />
      </svg>

      <svg
        className="h-full w-full sm:hidden"
        viewBox="0 0 390 844"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          data-testid="trama-copper-curve"
          className="trama-copper-curve"
          d="M-55 205 C 70 260, 125 345, 220 405 S 355 405, 455 290"
        />
        <path
          data-testid="trama-copper-curve"
          className="trama-copper-curve trama-copper-curve-soft"
          d="M-40 340 C 105 390, 170 470, 245 545 S 355 620, 435 585"
        />
        <path
          data-testid="trama-copper-curve"
          className="trama-copper-curve"
          d="M85 900 C 205 770, 270 740, 325 625 S 365 470, 430 395"
        />
        <circle className="trama-copper-node" cx="325" cy="625" r="3.5" />
      </svg>
    </div>
  );
}
