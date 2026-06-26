import { createNewImage } from '@spyne-console/utils/config';

import { allIcons } from './icon';

export const LandingVideoConfig = {
  meeting_txt: {
    banner_img: createNewImage(
      'https://d20uiuzezo3er4.cloudfront.net/AI-tools/landing-partnership/bannermeeting.png',
      '720x'
    ),
    dummyman: createNewImage(
      'https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/icons-home/Frame+1984077311.png',
      '720x'
    ),
    spynelogomasked: `https://spyne-static.s3.us-east-1.amazonaws.com/landing-pages/landing-video/spynemasked.png`,
    spynelogomasked_alt: 'spynemasked',
    meetingConfirmed: 'Meeting confirmed!',
    txtend: 'We are looking forward to talking to you!',
    filldetails: 'Please fill in the following details',
    head_txt: 'Not convinced yet? Talk to us!',
    left_txt1: 'Discovery Call',
    left_txt2: 'Schedule a call to get started!',
    poweredby: 'Powered by',
    back_to_calendar: '← Back to Calendar',
    right_txt2: 'Timezone',
    right_txt1: 'Select a Date & Time',
    cancel_txt: 'Cancel',
    schedule_txt: 'Schedule meeting',
    confirm_txt: 'Confirm',
    date: 'Date: ',
    time: 'Time: ',
    scheduling_txt: 'Scheduling...',
    locationWhite: `https://spyne-static.s3.us-east-1.amazonaws.com/landing-pages/landing-video/prople/locationwhite.svg`,
    locationWhite_alt: 'location white',
    clockwhite: `https://spyne-static.s3.us-east-1.amazonaws.com/landing-pages/landing-video/prople/clockwhite.svg`,
    clockwhite_alt: 'clock white',
    select_timezone: 'Select Time',
    left_txt3: [
      {
        img: `https://spyne-static.s3.us-east-1.amazonaws.com/AI-tools/landing-partnership/meeting+accets/logo1.svg`,
        txt: 'Jessica ',
      },
      {
        img: `https://spyne-static.s3.us-east-1.amazonaws.com/AI-tools/landing-partnership/meeting+accets/logo2.svg`,
        txt: '30 minutes',
      },
      {
        img: `https://spyne-static.s3.us-east-1.amazonaws.com/AI-tools/landing-partnership/meeting+accets/logo3.svg`,
        txt: 'Google Meet',
      },
    ],
    giftick: allIcons.giftick,
    thunder_img: allIcons.thunder_icon,
    right_img: allIcons.calender_icon,
    left_arrow: allIcons.LEFT_ARROW_black,
    left_arrow_alt: 'left arrow',
    leftarrowwithouttail: allIcons.arrowleft,
    leftarrowwithouttail_alt: 'left arrow without tail',
    calender_faded: allIcons.calender_faded,
    calender_faded_alt: 'calender faded',
    clockfaded: allIcons.clockfaded,
    clockfaded_alt: 'clock faded',
    logo1: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/headerimg/yourname.svg`,
    logo2: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/headerimg/youremail.svg`,
    logo3: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/headerimg/company.svg`,
  },
};

export const contactFormModalCommonData = {
  hazardIcon: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/formasset/hazard.svg`,
  clock: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/formasset/clock.svg`,
  dummyman: createNewImage(
    'https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/icons-home/Frame+1984077311.png',
    '720x'
  ),
  weblogo: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/formasset/weblogo.svg`,
  calLogo: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/formasset/calunderlogo.svg`,
  arrowDown: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/formasset/downarrow.svg`,
  arrowLeft: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/formasset/leftarrow.svg`,
  arrowRight: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/formasset/rightarrow.svg`,
  logoWhite: createNewImage(
    'https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/HeaderNew/Spyne+Logo+white.png',
    '720x'
  ),
  giftick: `https://www.spyne.ai/wp-content/uploads/2023/01/thank-you-page.gif`,
  tickIcon: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/headerimg/tickvector.svg`,
  starIcon: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/headerimg/starlogo.svg`,
  ICON_CLOSE: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/cross-icon.svg`,
  rightArrow: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/formasset/solar_arrow-up-linear.svg`,
  MODAL_BG: createNewImage(
    'https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/HeaderNew/headerimg/restforming.png',
    '720x'
  ),
  MODAL_BG_Website: createNewImage(
    'https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/HeaderNew/headerimg/webforming.png',
    '720x'
  ),
  MODAL_BG_MOBILE: createNewImage(
    'https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/HeaderNew/headerimg/mobileforming.png',
    '720x'
  ),
  SPYNE_LOGO: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/spyne-logo-white.svg`,
  logo: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/headerimg/homeheadersliderlogo.svg`,
  logo1: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/headerimg/yourname.svg`,
  logo2: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/headerimg/youremail.svg`,
  logo3: `https://spyne-static.s3.amazonaws.com/AI-tools/ai-tool-home/HeaderNew/headerimg/company.svg`,
  spantxt1: 'Get a ',
  spantxt2: '7 days free trial',
  FormFillingtxt1: 'START YOUR',
  FormFillingtxt2: 'Free Trial Now!',
  FormFillingtxt3: "I'm Interested in",
  FormFillingtxt4: 'You can select more than one product',
  FormFillingtxt5: 'Book your trial',
  BookAppointmenttxt1: 'Thanks for reaching out!',
  BookAppointmenttxt2: "We'll get back to you shortly.",
  BookAppointmenttxt3: '30 min',
  BookAppointmenttxt4: 'Original meeting time was scheduled for',
  meetingModaltxt1: 'Just, one last thing!',
  meetingModaltxt2: 'Your meeting is confirmed with',
  meetingModaltxt3: 'PARTICIPANTS',
  meetingModaltxt4: 'Reschedule',
  meetingModaltxt5: 'Invite Guest',
  finalPagetxt1: 'Meeting confirmed!',
  finalPagetxt2: 'We are looking forward to',
  finalPagetxt3: ' talking to you!',
  finalPagetxt4: 'Start exploring Spyne today',
  finalPagetxt5: 'Try for free',
  finalPagetxt6: 'Closing in ',
  carouselData: {
    chips: [
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(1).png`,
        stickerAlt: 'twin slider flag 1',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(2).png`,
        stickerAlt: 'twin slider flag 2',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(3).png`,
        stickerAlt: 'twin slider flag 3',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(4).png`,
        stickerAlt: 'twin slider flag 4',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(5).png`,
        stickerAlt: 'twin slider flag 5',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(6).png`,
        stickerAlt: 'twin slider flag 6',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(8).png`,
        stickerAlt: 'twin slider flag 8',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(9).png`,
        stickerAlt: 'twin slider flag 9',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(10).png`,
        stickerAlt: 'twin slider flag 10',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(11).png`,
        stickerAlt: 'twin slider flag 11',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(13).png`,
        stickerAlt: 'twin slider flag 13',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(14).png`,
        stickerAlt: 'twin slider flag 14',
      },
      {
        sticker: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-pricing/logo/blakie/logo+(15).png`,
        stickerAlt: 'twin slider flag 15',
      },
    ],
  },
  buttontxt: [
    {
      buttonName1: 'Image ',
      buttonName2: 'Studio',
    },
    {
      buttonName1: '360 ',
      buttonName2: 'Spin',
    },
    {
      buttonName1: 'Video ',
      buttonName2: 'Tour',
    },
    {
      buttonName1: 'Website ',
      buttonName2: 'Builder',
    },
  ],
};
