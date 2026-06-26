export enum CardColorTheme {
  VIOLET = 'violet',
  SKY = 'sky',
  INDIGO = 'indigo',
  PINK = 'pink',
  YELLOW = 'yellow',
}

export const cardThemesMap: Record<
  CardColorTheme,
  {
    shadow: string;
    gradient: string;
    outline: string;
    bottomSheet: string;
    primaryText: string;
    ripple: string;
  }
> = {
  [CardColorTheme.VIOLET]: {
    shadow: 'shadow-[0px_3.11px_26.47px_0px_rgba(0,0,0,0.05)]',
    gradient: 'bg-[#FDF8FE] bg-gradient-to-b from-violet-700/20 to-white/10',
    outline: 'border border-[0.78px] border-violet-700/10',
    bottomSheet: 'bg-purple-100 border border-violet-800/10',
    primaryText: 'text-violet-900/80',
    ripple: 'bg-violet-900/60',
  },
  [CardColorTheme.SKY]: {
    shadow: 'shadow-[0px_2.81px_23.86px_0px_rgba(0,0,0,0.05)]',
    gradient: ' bg-[#F2FCFF]',
    outline: 'border border-[0.70px] border-sky-500/10',
    bottomSheet: 'bg-blue-50 border border-blue-500/10',
    primaryText: 'text-blue-500',
    ripple: 'bg-blue-500/60',
  },
  [CardColorTheme.INDIGO]: {
    shadow: 'shadow-[0px_2.80px_23.84px_0px_rgba(0,0,0,0.05)]',
    gradient: ' bg-indigo-50',
    outline: 'border border-[0.70px] border-indigo-700/10',
    bottomSheet: 'bg-violet-100 border border-indigo-700/10',
    primaryText: 'text-indigo-700',
    ripple: 'bg-indigo-700/60',
  },
  [CardColorTheme.PINK]: {
    shadow: 'shadow-[0px_2.80px_23.84px_0px_rgba(0,0,0,0.05)]',
    gradient: ' bg-pink-50',
    outline: 'border border-[0.70px] border-pink-700/10',
    bottomSheet: 'bg-pink-100 border border-pink-700/10',
    primaryText: 'text-pink-700',
    ripple: 'bg-pink-700/60',
  },
  [CardColorTheme.YELLOW]: {
    shadow: 'shadow-[0px_2.81px_23.86px_0px_rgba(0,0,0,0.05)]',
    gradient: 'bg-[linear-gradient(180deg,#FFEFB3_0%,#FFF7DA_79.18%)]',
    outline: 'border border-[0.70px] border-yellow-500/10',
    bottomSheet: 'bg-amber-50 border border-yellow-700/10',
    primaryText: 'text-yellow-700',
    ripple: 'bg-yellow-700/60',
  },
};
