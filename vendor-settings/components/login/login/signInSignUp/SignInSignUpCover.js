import React, { useEffect, useState } from 'react';

import Image from 'next/image';

// import useEmblaCarousel from 'embla-carousel-react'
// import Autoplay from 'embla-carousel-autoplay'

const SignInSignUpCover = (props) => {
  const { translate: t } = props;
  // const [emblaRef] = useEmblaCarousel(
  //     { loop: true },
  //     [Autoplay({ delay: 2000, stopOnInteraction: false })]
  // )
  // const [mounted, setMounted] = useState(false)

  // useEffect(() => {
  //     setMounted(true)
  // }, [])

  // if (!mounted) return null
  // const images = [
  //     "https://spyne-static.s3.us-east-1.amazonaws.com/console/icons/create_enterprise_org_type/crousel+img1.svg",
  //     "https://spyne-static.s3.us-east-1.amazonaws.com/console/icons/create_enterprise_org_type/crousel+img3.svg",
  // ]
  return (
    <div className="relative top-0 h-full w-full rounded-2xl">
      <div className="absolute inset-0 h-full w-full rounded-2xl">
        <Image
          src="https://spyne-static.s3.amazonaws.com/ai+tool/log+in+sign+up/viktor-theo-EJkEGRMQ6Ig-unsplash+2.webp"
          alt="Login background"
          fill
          className="rounded-r-2xl object-cover object-bottom"
        />
      </div>
      {/* text over image */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between px-8 pb-9 pt-[72px]">
        <div className="text-3xl text-white/90">
          {t(`console.screens.rightSideTextLoginModal.rightSideText1`)}
        </div>
        <div className="mb-8 -translate-y-10">
          <div className="text-sm font-normal text-white/80">
            {t(`console.screens.rightSideTextLoginModal.rightSideText2`)}
          </div>
          <div className="mt-0.5 text-sm font-normal text-white/80">
            {t(`console.screens.rightSideTextLoginModal.rightSideText2.2`)}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <Image
              src="https://spyne-static.s3.us-east-1.amazonaws.com/console/icons/create_enterprise_org_type/logoforvirtualstudio.svg"
              alt="Karvi"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <h3 className="text-base font-semibold text-white/80">
                {t(`console.screens.rightSideTextLoginModal.rightSideText3`)}
              </h3>
              <p className="text-sm text-white/80">
                {t(`console.screens.rightSideTextLoginModal.rightSideText4`)}
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="mx-auto mb-2 flex items-center justify-center gap-2 2xl:mb-4">
            <p className="whitespace-nowrap text-sm text-white/80">
              {t(`console.screens.rightSideTextLoginModal.rightSideText5`)}
            </p>
            <div className="mt-0.5 h-px w-full rounded-full bg-white/40"></div>
          </div>
          <div className="mt-7 flex justify-center gap-2">
            <Image
              src="https://spyne-static.s3.us-east-1.amazonaws.com/console/icons/create_enterprise_org_type/flagbannerfinal.png"
              alt="Image"
              width={437}
              height={120}
              className="w-[90%] object-cover"
            />
          </div>
          {/* <div ref={emblaRef} className="overflow-hidden">
                        <div className="flex">
                            {[...images, ...images, ...images].map((slide, index) => (
                                <div
                                    className="flex-[0_0_25%] px-5 py-3"
                                    key={index}
                                >
                                    <Image
                                        src={slide}
                                        alt="Carousel Image"
                                        width={100}
                                        height={24}
                                        className=""
                                    />
                                </div>
                            ))}
                        </div>
                    </div> */}
        </div>
      </div>
    </div>
  );
};

export default SignInSignUpCover;
