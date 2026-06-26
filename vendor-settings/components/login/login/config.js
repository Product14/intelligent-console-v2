export const GUEST_DEMO_SAMPLE = {
    video: 'https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/video+compressed+home.mp4',
    beforeImg: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/imagesHome/withoutbg.webp`,
    hand360: `https://d20uiuzezo3er4.cloudfront.net/console/icons/raUFXQXzkM.gif`,
    customCursor: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tools-landing-360/Frame+1000004662.svg`,
    afterImg: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/imagesHome/withbg.webp`,
    forward: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/forward.svg`,
    backward: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/backward.svg`,
    playButton: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/ai-tool-home/play.svg`,
    pauseButton: `https://d20uiuzezo3er4.cloudfront.net/AI-tools/pause+arrow.svg`,
    INTERACTIVE_DEMO: {
        IMAGES: {
            common_demo_images: `https://d20uiuzezo3er4.cloudfront.net/console/images_common_demo.svg`,
            ITEM_NAME: "console.screens.virtualStudio.commonGuest.featurePage.image.images",
            ITEM_DESCRIPTION: "console.screens.virtualStudio.commonGuest.featurePage.image.accelerateSale",
            BUTTON_DESCRIPTION: "console.screens.virtualStudio.commonGuest.featurePage.image.generateImages"
        },
        _360: {
            common_demo_360: `https://d20uiuzezo3er4.cloudfront.net/console/360_common_demo.svg`,
            ITEM_NAME: "console.screens.virtualStudio.commonGuest.featurePage.spin_360.360",
            ITEM_DESCRIPTION: "console.screens.virtualStudio.commonGuest.featurePage.spin_360.walkarounds",
            BUTTON_DESCRIPTION: "console.screens.virtualStudio.commonGuest.featurePage.spin_360.generate360"
        },
        VIDEO: {
            common_demo_video: `https://d20uiuzezo3er4.cloudfront.net/console/videos_common_demo.svg`,
            ITEM_NAME: "console.screens.virtualStudio.commonGuest.featurePage.video.videoTour",
            ITEM_DESCRIPTION: "console.screens.virtualStudio.commonGuest.featurePage.video.replaceBrochures",
            BUTTON_DESCRIPTION: "console.screens.virtualStudio.commonGuest.featurePage.video.generateVideo"

        },


    },
    imagesRedirectionLink: "/virtualstudio/demo",
    demo360RedirectionLink: "/virtualstudio/demo360",
    videoRedirectionLink: "/video",
}

export const TAB_ENUM = {
    images: "images",
    video: "videoTour",
    demo360: "360spin"
};

export const getDemoFlowType = (mainRoute, childRoute, queryParam) => {
  if (mainRoute === "virtualstudio") {
      if (childRoute) {
          switch (childRoute) {
              case "demo-catalog":
                  return "images_vs";
              case "demo360":
                  return "360_vs";
              default:
                  return "other";
          }
      } else if (queryParam) {
          switch (queryParam) {
              case "images":
                  return "demo_flow_images";
              case "360spin":
                  return "demo_flow_360";
              case "videoTour":
                  return "demo_flow_video";
              default:
                  return "other";
          }
      }
  } else if (mainRoute === "video") {
      return "videos_vs";
  }
  return "other";
};

export const getSelectedVinFeatureData = (data, selectedVin) => {
    return {
        [TAB_ENUM.images]: data.images.find(item => item.vin === selectedVin) || {},
        [TAB_ENUM.demo360]: data[TAB_ENUM.demo360].find(item => item.vin === selectedVin) || {},
        [TAB_ENUM.video]: data.videotour.find(item => item.vin === selectedVin) || {}
    };
};

export const getDemoItemsConfig = (demoData) => {
    return [
      {
        type: TAB_ENUM.images,
        data: {
          beforeImg: demoData?.[TAB_ENUM.images]?.thumbnail_url,
          afterImg: demoData?.[TAB_ENUM.images]?.output_thumbnail_url,
          icon: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO.IMAGES.common_demo_images,
          itemName: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO.IMAGES.ITEM_NAME,
          itemDescription: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO.IMAGES.ITEM_DESCRIPTION,
          redirectTo: TAB_ENUM.images,
          buttonDescription: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO.IMAGES.BUTTON_DESCRIPTION
        },
        hoveredKey: TAB_ENUM.images,
      },
      {
        type: TAB_ENUM.demo360,
        data: {
          imageUrls: demoData?.[TAB_ENUM.demo360]?.['360_frames'],
          icon: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO._360.common_demo_360,
          itemName: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO._360.ITEM_NAME,
          itemDescription: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO._360.ITEM_DESCRIPTION,
          redirectTo: TAB_ENUM.demo360,
          buttonDescription: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO._360.BUTTON_DESCRIPTION
        },
        hoveredKey: TAB_ENUM.demo360,
      },
      {
        type: TAB_ENUM.video,
        data: {
          videoSrc: demoData?.[TAB_ENUM.video]?.demo_video_url,
          icon: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO.VIDEO.common_demo_video,
          itemName: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO.VIDEO.ITEM_NAME,
          itemDescription: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO.VIDEO.ITEM_DESCRIPTION,
          redirectTo: TAB_ENUM.video,
          buttonDescription: GUEST_DEMO_SAMPLE.INTERACTIVE_DEMO.VIDEO.BUTTON_DESCRIPTION
        },
        hoveredKey: TAB_ENUM.video,
      },
    ];
  };