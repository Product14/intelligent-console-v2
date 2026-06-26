module.exports = {
  content: ['./**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: '#000000',
          light: '#121212',
          1: 'rgba(0, 0, 0, 0.01)',
          4: 'rgba(0, 0, 0, 0.04)',
          5: 'rgba(0, 0, 0, 0.05)',
          8: 'rgba(0, 0, 0, 0.08)',
          10: 'rgba(0, 0, 0, 0.1)',
          12: 'rgba(0, 0, 0, 0.12)',
          16: 'rgba(0, 0, 0, 0.16)',
          18: 'rgba(0, 0, 0, 0.18)',
          20: 'rgba(0, 0, 0, 0.2)',
          40: 'rgba(0, 0, 0, 0.4)',
          50: 'rgba(0, 0, 0, 0.5)',
          60: 'rgba(0, 0, 0, 0.6)',
          80: 'rgba(0, 0, 0, 0.8)',
          87: 'rgba(0, 0, 0, 0.87)',
          90: 'rgba(0, 0, 0, 0.9)',
          dark: '#101828',
          lighter: 'rgba(16, 24, 40, 0.6)',
        },
        gray: {
          light: '#F9FAFB',
          lighter: '#F8F9FC', //rgba(248, 249, 252, 1)
          DEFAULT: 'rgba(196,196,196,1.000)',
          2: 'rgba(74, 58, 255, 0.02)',
          4: 'rgba(70, 0, 242, 0.04)',
          8: 'rgba(145, 158, 171, 0.08)',
          40: 'rgba(208, 213, 221, 0.4)',
          1: 'rgb(145 158 171 / 80%)',
          60: 'rgba(18, 18, 18, 0.6)',
          lightest: '#F2F4F7',
          bright: '#ECEEF1',
          80: 'var(--typography40)',
          dark_80: 'rgba(58, 71, 78, 0.8)',
          light_60: ' rgba(8, 8, 8, 0.60)',
          snow_drift: 'rgba(248, 248, 248, 1)',
          light_mercury: 'rgba(229, 229, 229, 0.8)',
          dark_mercury: 'rgba(248, 245, 254, 0.40)',
          dark_3: 'rgba(246, 246, 250, 1)',
          dark: 'rgba(150, 147, 145, 1)', //#969391
          text: 'rgba(0, 0, 0, 0.6)',
          'light-4': '#F4F4F5',
        },
        green: {
          DEFAULT: 'rgba(3, 152, 85, 1)', //#039855
          dark: '#007B55',
          darker: '#027A48',
          8: 'rgba(0, 171, 85, 0.08)',
          lighter: '#ECFDF3',
          light: 'rgba(45, 255, 104, 0.08)',
          lime_green: '#3C981F', //rgba(60, 152, 31, 1)
          leafy_green: 'rgba(0, 191, 29, 1)', //rgba(0, 191, 29, 1)
        },
        blue: {
          DEFAULT: 'rgba(29,0,102,1.000)', // #1D0066
          dark: '#4F25B7', // #4F25B7
          darker: '#363F72', // #363F72
          darkest: '#344054', // #344054
          darkD: '#3538CD', // #3538CD
          0: 'rgba(70, 0, 242, 0)', //#4600F200
          1: 'rgba(208,213,221,1.000)', // #D0D5DD
          2: ' rgba(70, 0, 242, 0.02)', // #4600F2
          4: 'rgba(70, 0, 242, 0.04)', // #4600F2
          6: 'rgba(70, 0, 242, 0.06)', // #4600F2
          8: 'rgba(70, 0, 242, 0.08)', // #4600F2
          10: 'rgba(70, 0, 242, 0.10)', // #4600F2
          12: 'rgba(74, 58, 255, 0.12)', // #4A3AFF
          16: 'rgba(70, 0, 242, 0.16)', // #4600F2
          20: 'rgba(70, 0, 242, 0.20)', // #4600F2
          32: 'rgba(69 0 242 / 32%)', // #4600F2
          40: 'rgba(70, 0, 242, 0.40)', // #4600F2
          24: 'rgba(70, 0, 242, 0.24)', // #4600F2
          60: 'rgba(54, 63, 114, 0.6)', // #363F72
          80: 'rgba(70, 0, 242, 0.8)', // #4600F2

          // '100': 'rgba(70, 0, 242, 1)',
          blueGray700: '#363F72',
          light: '#4600F2', //'rgba(70, 0, 242, 1)
          lighter: '#EEF4FF',
          lightest: '#4A3AFF3D',
          bright: '#1E40AF',
          brighter: '#EFF6FF',
          brightest: '#4600f20f',
          errorBoundary: '#674ee7',
          ultraLight: '#40238733',
          ultraLight2: '#402387CC',
          ultraLight3: '#402387',
          ultraBright: 'rgba(70, 0, 242, 0.4)',
          'blue-16': 'rgba(0, 61, 219, 0.16)', //#003DDB29
          'light-1': 'rgba(234, 240, 255, 1)', //#EAF0FF
          'light-2': '#2A0488', //#EAF0FF
          royal_blue: '#175CD3', //rgba(23, 92, 211, 1)
          azure: 'rgba(22, 144, 255, 1)', //#1690FF',
        },
        reddish_orange: {
          DEFAULT: '#B54708',
          lightest: '#FFFAEB',
        },
        red: {
          DEFAULT: 'rgba(195, 24, 18, 1)',
          lightest: '#FEF3F2',
          1: 'rgba(217, 45, 32, 1)',
          4: 'rgba(255, 0, 0, 0.04)', //#FF00000A
          light: 'rgba(242, 0, 0, 1)',
          warningRed: '#C31812',
          warningRedDark: '#C4320A',
          pinkish_red: '#EC1731', //rgba(236, 23, 49, 1)
        },
        white: {
          DEFAULT: '#ffffff',
          light: '#F0F9FF',
          lighter: '#f9f7ff',
          gray: '#F4F5F8',
          15: 'rgba(255, 255, 255, 0.15)',
          16: 'rgba(255, 255, 255, 0.16)',
          8: 'rgba(255, 255, 255, 0.08)',
          6: 'rgba(255, 255, 255, 0.6)', //TODO:this should be 60 not 6
          10: 'rgba(255, 255, 255, 0.10)',
          20: 'rgba(255, 255, 255, 0.20)',
          60: 'rgba(255, 255, 255, 0.60)',
          24: 'rgba(255, 255, 255, 0.24)',
          70: 'rgba(255, 255, 255, 0.70)',
          80: 'rgba(255, 255, 255, 0.80)',
          100: 'rgba(248, 248, 248, 1)',
        },
        yellow: {
          80: 'rgba(255, 250, 235, 0.8)',
          'light-fade': 'rgba(255, 247, 205, 1)',
          'light-full': 'rgba(255, 243, 181, 1)',
        },
        blue_purple: {
          DEFAULT: '#402387', //rgba(64, 35, 135, 1)
          1: '#1D0066',
          4: 'rgba(70, 0, 242, 0.04)',
          8: 'rgba(70, 0, 242, 0.08)',
          12: 'rgba(70, 0, 242, 0.12)',
          20: 'rgba(70, 0, 242, 0.2)',
          40: 'rgba(64, 35, 135, 0.4)',
          60: '#40238799',
          70: 'rgba(64, 35, 135, 0.7)',
          80: 'rgba(64, 35, 135, 0.8)',
          '4-gradiant':
            'linear-gradient(0deg, rgba(70, 0, 242, 0.04), rgba(70, 0, 242, 0.04)), #FFFFFF',
          90: 'rgba(64, 35, 135, 0.9)',
          100: 'rgba(29, 0, 102, 1)',
          dark: 'rgba(70, 0, 242, 0.5)',
        },
        aqua_haze: {
          DEFAULT: '#EEF2FF', //rgba(238, 242, 255, 1),
          1: 'rgba(239, 248, 255, 1)', //#EFF8FF
        },
        cyan_blue: {
          DEFAULT: '#F0F4F9', //rgba(240, 244, 249, 1)
        },
        navy_blue: {
          DEFAULT: '#35197A',
          1: '#f6f8fb',
          2: '#026AA2',
        },
        orange: {
          DEFAULT: '#B54708',
          lighter: '#FFFAEB',
          20: 'rgba(220, 104, 3, 0.2)',
          light: '#FFF6ED',
          dark: '#D97706',
          10: '#FFA48D',
          100: 'rgba(196, 50, 10, 1)',
          sunrise_orange: '#E17141', //rgba(225, 113, 65, 1)
        },
        pink: {
          DEFAULT: '#C11574',
          lightest: '#FDF2FA',
        },
        purple: {
          DEFAULT: '#BF2E84',
          DEFAULT_RGBA: 'rgba(191, 46, 132, 0.04)',
          dark: '#402387CC',
          light: '#4600F214',
          lightPlus: '#4600F2',
          60: '#40238799', //rgba(64, 35, 135, 0.6),
          80: 'rgba(64, 35, 135, 0.80)',
          20: 'rgba(64, 35, 135, 0.20)',
          banner: '#402387',
          coachMark: '#2D1E52',
          fade: 'rgba(70, 0, 242, 0.4)',
        },
        black_04_white: {
          DEFAULT:
            'linear-gradient(0deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.04)), #FFFFFF',
        },
        'wisp-pink': {
          DEFAULT: 'rgba(254, 243, 242, 1)  ',
        },
        'orange-red': {
          DEFAULT: 'rgba(180, 35, 24, 1) ',
        },
        'floral-white': {
          DEFAULT: 'rgba(255, 250, 235, 1) ',
        },
        'green-cyan': {
          DEFAULT: 'rgba(236, 253, 243, 1)',
        },
        'reddish-orange': {
          DEFAULT: 'rgba(181, 71, 8, 1)',
          8: 'rgba(181, 71, 8, 0.8)',
        },
        'spring-green': {
          DEFAULT: 'rgba(2, 122, 72, 1)',
        },
        'warning-yellow': {
          DEFAULT: 'rgba(244, 193, 62, 1)',
        },
        'website-primary': {
          DEFAULT: 'rgba(107, 51, 245, 1)',
        },
        'fade-yellow': {
          DEFAULT: 'rgba(255, 250, 230, 1)',
        },
        'light-brown': {
          DEFAULT: 'rgba(122, 79, 1, 1)',
          dark: 'rgba(101, 66, 1, 1)',
          darker: 'rgba(122, 2, 2, 1)',
        },
        brown: {
          DEFAULT: 'rgba(122, 2, 2, 1)',
        },
        pinkGradient: 'rgba(255, 115, 157, 1)',
        purpleGradient: 'rgba(98, 9, 187, 1)',
        purpleLight: {
          DEFAULT: 'rgba(141, 78, 243, 1)', //#8D4EF3
          40: 'rgba(54, 63, 114, 0.4)',
          80: 'rgba(54, 35, 114 , 0.8)',
        },
      },
      screens: {
        xs: '321px',
        // => @media (min-width: 321px) { ... }
        sm: '640px',
        // => @media (min-width: 640px) { ... }
        lsm: '767px',
        // => @media (min-width: 767px) { ... }
        md: '960px',
        // => @media (min-width: 960px) { ... }
        mtb: '768px',
        // => @media (min-width: 768px) { ... } //for mini tablet landscape view
        lmd: '825px',
        // => @media (min-width: 825px) { ... } //for iphone 12 n more phone landscape view
        tb: '1020px',
        // => @media (min-width: 1020px) { ... }
        tpro: '1024px',
        // =>@media (min-width: 1024px)
        tlpro: '1025px',
        // =>@media (min-width: 1025px)
        ltm: '1080px',
        // =>@media (min-width: 1080px) //for tablet mini landscape view
        ltAir: '1180px',
        // => @media (min-width: 1180px) { ... } //for ipad air landscape view
        ltb: '1280px',
        // =>@media (min-width: 1280px)

        ltpro: '1350px',
        // =>@media (min-width: 1350px)
        lg: '1440px',
        // => @media (min-width: 1440px) { ... }
        xl: '1536px',
        // => @media (min-width: 1536px) { ... }
        '2xl': '1600px',
        // => @media (min-width: 1600px) { ... }
        '3xl': '1800px',
        // => @media (min-width: 1800px) { ... }
        '4xl': '1900px',
        // => @media (min-width: 1900px) { ... }
      },
    },
  },
};
