import React from 'react';
import { useState } from 'react';

import SupportContainer from '../header/SupportContainer';
import Header from '../header/header';
import Sidebar from '../sidebar/sidebar';

function HelpAndSupport() {
  const [showSideNavbar, setShowSideNavbar] = useState(true);
  return (
    <>
      <div className="container-fluid mx-auto">
        <div className="fixed left-0 right-0 top-0 z-10 grid grid-cols-1 bg-white">
          <Header
            showSideNavbar={showSideNavbar}
            setShowSideNavbar={setShowSideNavbar}
          />
        </div>
      </div>
      <div className="container-fluid mx-auto">
        <div className="fixed left-0 right-0 top-0 z-10 grid grid-cols-1 bg-white">
          <Header
            showSideNavbar={showSideNavbar}
            setShowSideNavbar={setShowSideNavbar}
          />
        </div>
        <div className="main-box inline-flex">
          <div
            className={`${showSideNavbar ? 'default-sidebar' : 'min-sidebar'} border-black-10 relative border-r`}
          >
            <Sidebar
              showSideNavbar={showSideNavbar}
              setShowSideNavbar={setShowSideNavbar}
            />
          </div>
          <div
            className={[
              `${showSideNavbar ? 'default-rightbar scroll-smooth' : 'max-rightbar scroll-smooth'} `,
            ].join(' ')}
          >
            <div className="col-span-5 pt-7">
              <SupportContainer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HelpAndSupport;
