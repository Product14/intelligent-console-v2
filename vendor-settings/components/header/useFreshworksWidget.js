import { useEffect } from 'react';

const useFreshworksWidget = (router, onLoad = true) => {
  const fetchUserData = async () => {
    try {
      const userDetails = localStorage.getItem('userDetails');
      const emailId = userDetails ? JSON.parse(userDetails).emailId : '';
      const defaultEnterprise = localStorage.getItem('defaultEnterprise');
      const selectedEnterprise = sessionStorage.getItem('selectedEnterprise');
      let enterpriseId = '';

      if (selectedEnterprise) {
        enterpriseId = JSON.parse(selectedEnterprise).enterprise_id;
      } else if (defaultEnterprise) {
        enterpriseId = JSON.parse(defaultEnterprise).enterpriseId;
      }
      return { emailId, enterpriseId };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { emailId: '', enterpriseId: '' };
    }
  };

  async function prefillFreshworksWidget() {
    try {
      const userData = await fetchUserData();
      if (window.FreshworksWidget) {
        window.FreshworksWidget(
          'identify',
          'ticketForm',
          {
            email: userData.emailId || '',
            custom_fields: {
              cf_enterprise_id: userData.enterpriseId || '',
            },
          },
          {
            formId: 1234,
          }
        );
      }
    } catch (error) {
      console.error('Error in prefillFreshworksWidget:', error);
    }
  }

  useEffect(() => {
    if (!router) {
      console.warn('Router is not provided to useFreshworksWidget');
      return;
    }

    let isWidgetLoaded = false;

    const loadFreshworksWidget = async () => {
      if (
        isWidgetLoaded ||
        document.getElementById('freshworks-widget-script')
      ) {
        return;
      }

      try {
        const script = document.createElement('script');
        script.id = 'freshworks-widget-script';
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.src =
          'https://ind-widget.freshworks.com/widgets/1070000001618.js';

        const fwSettingsScript = document.createElement('script');
        fwSettingsScript.innerHTML = `
                    window.fwSettings = { 
                      'widget_id': 1070000001618,
                      'hide_widget': true
                    };
                    !function() {
                      if (typeof window.FreshworksWidget !== 'function') {
                        var n = function() { n.q.push(arguments) };
                        n.q = [];
                        window.FreshworksWidget = n;
                      }
                    }();
                `;

        document.head.appendChild(fwSettingsScript);
        document.head.appendChild(script);
        isWidgetLoaded = true;

        // Wait for widget to load before prefilling
        setTimeout(() => {
          if (onLoad) {
            prefillFreshworksWidget();
          }
        }, 500);
      } catch (err) {
        console.error('Error loading Freshworks widget:', err);
      }
    };

    const unloadFreshworksWidget = () => {
      try {
        if (window.FreshworksWidget) {
          window.FreshworksWidget('destroy');
        }

        const container = document.getElementById('freshworks-container');
        if (container) {
          container.remove();
        }

        const scripts = document.querySelectorAll('script');
        scripts.forEach((script) => {
          if (script.id === 'freshworks-widget-script') {
            script.remove();
          }
          if (
            script.innerHTML &&
            script.innerHTML.includes('window.fwSettings') &&
            script.innerHTML.includes('widget_id') &&
            script.innerHTML.includes('FreshworksWidget')
          ) {
            script.remove();
          }
        });

        isWidgetLoaded = false;
      } catch (error) {
        console.error('Error unloading Freshworks widget:', error);
      }
    };

    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleMediaChange = (e) => {
      if (e.matches && !onLoad) {
        unloadFreshworksWidget();
      } else if (onLoad) {
        loadFreshworksWidget();
      }
    };

    const handleRouteChange = (url) => {
      if (!url.includes('login') && !mediaQuery.matches && onLoad) {
        loadFreshworksWidget();
      } else {
        unloadFreshworksWidget();
      }
    };

    // Initial load/unload based on onLoad value
    if (!onLoad) {
      unloadFreshworksWidget();
    } else if (!router.pathname?.includes('login') && !mediaQuery.matches) {
      loadFreshworksWidget();
    }

    mediaQuery.addEventListener('change', handleMediaChange);

    if (router.events) {
      router.events.on('routeChangeComplete', handleRouteChange);
    }

    return () => {
      if (router.events) {
        router.events.off('routeChangeComplete', handleRouteChange);
      }
      mediaQuery.removeEventListener('change', handleMediaChange);
      unloadFreshworksWidget();
    };
  }, [router, onLoad]);
};

export default useFreshworksWidget;
