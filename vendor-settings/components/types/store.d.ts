declare module '@spyne-console/store' {
  // Re-export hooks from react-redux
  export const useSelector: any;
  export const useDispatch: any;
  export const useStore: any;
  export const connect: any;

  // Store provider and instance
  export const ReduxProvider: any;
  export const store: any;

  // Auth related actions
  export function setAuth(payload: any): void;
  export function updateAuthProp(payload: any): void;
  export function resetAuth(): void;
  export function updateResellerData(payload: any): void;
  export function resetAuthExceptResellersData(): void;

  // Enterprise Team related actions
  export function setEnterpriseTeam(payload: any): void;
  export function updateEnterpriseTeamProperty(payload: any): void;
  export function resetEnterpriseTeam(): void;
  export function setEnterpriseStage(payload: any): void;
  export function setTeamList(payload: any): void;

  // Virtual Studio related actions
  export function setVirtualStudio(payload: any): void;
  export function updateVirtualStudioProperty(payload: any): void;
  export function setVinForSingleSKU(payload: any): void;
  export function setVinForMultiSKU(payload: any): void;
  export function setInventoryStatus(payload: any): void;
  export function setVinMandatoryStatus(payload: any): void;
  export function setRestrictiveStatus(payload: any): void;
  export function setIsImagesEnabled(payload: any): void;
  export function setIs360Enabled(payload: any): void;
  export function setIsVideoTourEnabled(payload: any): void;
  export function resetVirtualStudio(): void;
  export function setIsExposureEnabled(payload: any): void;
  export function setSettings(payload: any): void;
  export function setApplyToMaskOnly(payload: any): void;
  export function setWelcomeModal(payload: any): void;
  export function setCreditConsumedModal(payload: any): void;
  export function setUpgradeNowModal(payload: any): void;
  export function setCreditExhaustedModal(payload: any): void;
  export function setShowDeductCreditAnimation(payload: any): void;
  export function setHideCreditButtonTemporary(payload: any): void;

  // Mobile Drawer related actions
  export function setMobileDrawer(payload: any): void;
  export function updateMobileDrawerProp(payload: any): void;
  export function resetMobileDrawer(): void;

  // Credit related actions
  export function setCredit(payload: any): void;
  export function updateCredit(payload: any): void;
  export function updateFreeCredit(payload: any): void;
  export function resetCredit(): void;
  export function updateV5Credit(payload: any): void;
  export function resetV5Credit(): void;

  // Website Builder related actions
  export function setWebsiteBuilder(payload: any): void;
  export function updateWebsiteBuilderProp(payload: any): void;
  export function resetWebsiteBuilder(): void;

  // Inventory related actions
  export function setInventoryData(payload: any): void;
  export function setShowInventoryCoachMarks(payload: any): void;
  export function setInventoryCoachMarkCompletedSteps(payload: any): void;
  export function nextInventoryCoachMark(): void;
  export function prevInventoryCoachMark(): void;
  export function completeAllInventoryCoachMarks(): void;
  export function setStickerTemplates(payload: any): void;
  export function setToggleStatus(payload: any): void;
  export function fetchInventoryListingStatus(payload: any): void;

  // Website Migration related actions
  export function setWebsiteMigration(payload: any): void;
  export function setMigrationStep(payload: any): void;
  export function resetWebsiteMigration(): void;

  // Video Tool related actions
  export function setVideoTool(payload: any): void;
  export function updateVideoTool(payload: any): void;
  export function resetVideoTool(): void;
  export function setRedisDataForDemo(payload: any): void;
  export function setVdpCached(payload: any): void;
  export function setInputValue(payload: any): void;
  export function setImportVDPClicked(payload: any): void;
  export function setTemplateLanguage(payload: any): void;

  // Virtual Studio 360 related actions
  export function setVirtualStudio360(payload: any): void;
  export function updateVirtualStudio360Property(payload: any): void;
  export function resetVirtualStudio360(): void;
  export function updateDemoVideoId(payload: any): void;
  export function updateDemoThumbnailUrl(payload: any): void;
  export function updateVdpUrl(payload: any): void;
  export function updateIsInsideDemo(payload: any): void;
  export function updateIsVdpDemo(payload: any): void;

  // Plugin related actions
  export function getPluginStats(payload: any): void;
  export function getPluginPageList(payload: any): void;
  export function getPluginLandingList(payload: any): void;
  export function addLandingPage(payload: any): void;
  export function updateLandingPage(payload: any): void;
  export function getPluginData(payload: any): void;
  export function getCuratedTypesData(payload: any): void;

  // Management Sync Data related actions
  export function getManagementSyncData(payload: any): void;

  // Static Data related actions
  export function fetchPageAndSeoData(payload: any): void;

  // Enterprise Dashboard related actions
  export function setOpenEnterpriseInfoModal(payload: any): void;
  export function setOpenEnterpriseWebsiteLinksModal(payload: any): void;
  export function setRejectExceptionModal(payload: any): void;
  export function setUpdateContractModal(payload: any): void;
  export function setOpenNpsModal(payload: any): void;
  export function setOpenCallSchedule(payload: any): void;
  export function setOpenHandover(payload: any): void;
  export function setOpenCancelCall(payload: any): void;
  export function setOpenCallDone(payload: any): void;
  export function setOpenDispute(payload: any): void;
  export function setOpenOnBoarding(payload: any): void;
  export function setOpenLiveModal(payload: any): void;
  export function setOpenChurned(payload: any): void;

  // Facebook Ads related actions
  export function setCampaignStepsData(payload: any): void;
  export function setCampaignCurrentScreen(payload: any): void;
  export function campaignCurrentScreen(payload: any): void;
  export function setFacebookFormData(payload: any): void;
  export function setCampaignsList(payload: any): void;
  export function campaignsList(payload: any): void;
  export function setStaticData(payload: any): void;

  // Analytics related actions
  export function setAnalyticsImages(payload: any): void;
  export function setAnalyticsApisData(payload: any): void;

  // VDP related actions
  export function updateVdpCaraouselIndex(payload: any): void;
  export function updateVdpFocusArray(payload: any): void;
  export function updateVdpIntArray(payload: any): void;

  // Demo 360 related actions
  export function updateDemo360CaraouselIndex(payload: any): void;
  export function updateDemo360Array(payload: any): void;
  export function updateDemo360IntUrl(payload: any): void;

  // Global API Call related actions
  export function setApisData(payload: any): void;
  export function setSubscribe(payload: any): void;
  export function setUnsubscribe(payload: any): void;
  export function setForceFetching(payload: any): void;

  // Contracting related actions
  export function setUserDetails(payload: any): void;
  export function setBillingDetails(payload: any): void;
  export function setHeaderDetails(payload: any): void;
  export function setSeletedTab(payload: any): void;
  export function setValidatorData(payload: any): void;
  export function setDefaultValidatorData(payload: any): void;

  // Image Studio related actions
  export function setImageStudio(payload: any): void;
  export function updateImageStudioProperty(payload: any): void;
  export function setOutputData(payload: any): void;
  export function updateProcessedImagesFailed(payload: any): void;
  export function setDeleteData(payload: any): void;
  export function setDownload(payload: any): void;
  export function setImagesList(payload: any): void;
  export function setShowDeductCreditAnimationImageStudio(payload: any): void;
  export function setHideCreditButtonTemporaryImageStudio(payload: any): void;
  export function setProjectDetails(payload: any): void;
  export function setVideosList(payload: any): void;
  export function setVDPData(payload: any): void;
  export function updateImageStatus(payload: any): void;
  export function updateVideoStatus(payload: any): void;
  export function appendImagesList(payload: any): void;
  export function updateImage(payload: any): void;
  export function videoFramesExtracted(payload: any): void;
  export function deleteImage(payload: any): void;
  export function deleteVideo(payload: any): void;
  export function resetImageStudio(): void;
  export function updateVideo(payload: any): void;
  export function updateInventoryDetails(payload: any): void;
  export function updateVinData(payload: any): void;
  export function updateImageProcessingStatus(payload: any): void;
  export function updateVideoProcessingStatus(payload: any): void;
  export function updateProcessingStatus(payload: any): void;
  export function setProcessedImages(payload: any): void;
  export function updateProcessedImages(payload: any): void;
  export function setSpinIframeUrl(payload: any): void;
  export function setVideoIframeUrl(payload: any): void;
  export function setSpinIframeThumbnailUrl(payload: any): void;
  export function setOutputProcessingList(payload: any): void;
  export function setCurrentSelectedToggle(payload: any): void;
  export function setLearnMore(payload: any): void;
  export function setLearnMoreSelectedItem(payload: any): void;
  export function setIsFamilyDemo(payload: any): void;
  export function setInputMediaToDelete(payload: any): void;
  export function removeInputMediaToDelete(payload: any): void;
  export function clearInputMediaToDelete(): void;
  export function deleteProcessedImage(payload: any): void;
  export function setSidebarConfig(payload: any): void;

  // Bulk Upload related actions
  export function resetBulkUpload(): void;
  export function setBulkGlobalIdentifier(payload: any): void;
  export function setBulkSubfolderMap(payload: any): void;
  export function setBulkFolderUploadStatus(payload: any): void;
  export function setMediaItems(payload: any): void;
  export function setMediaItemUploadStatus(payload: any): void;
  export function setFolderPendingAction(payload: any): void;
  export function setIdentifier(payload: any): void;
  export function setVinDetails(payload: any): void;
  export function setOptionalColumnValue(payload: any): void;
  export function handleDeleteFolder(payload: any): void;
  export function updateMediaItem(payload: any): void;
  export function setOverallUploadStatus(payload: any): void;
  export function setSubfolderAction(payload: any): void;

  // Demo Image related actions
  export function setDemoImages(payload: any): void;
  export function setDemoVideos(payload: any): void;
  export function setModals(payload: any): void;
  export function setDemoVinData(payload: any): void;
  export function setDemoLoading(payload: any): void;
  export function setProcessConfig(payload: any): void;
  export function setSelectedDemo(payload: any): void;
  export function setMediaState(payload: any): void;
  export function setValidationData(payload: any): void;
  export function setHtmlVideoData(payload: any): void;
  export function setDemoWindowSticker(payload: any): void;
  // Enterprise Assets related actions
  export function setNumberPlates(payload: any): void;
  export function setBanners(payload: any): void;
  export function setBackgrounds(payload: any): void;
  export function setEnterpriseAssets(payload: any): void;
  export function setImagesListMultiSku(payload: any): void;
  export function updateEnterpriseAssetsProperty(payload: any): void;
  export function setPlate(payload: any): void;
  export function setBg(payload: any): void;
  export function setBanner(payload: any): void;
  export function setTemplateLanguageAssets(payload: any): void;
  export function setThreeSixtyHotspot(payload: any): void;
  export function setSelectedTemplateId(payload: any): void;
  export function setSelectedFont(payload: any): void;
  export function setSelectedVoiceId(payload: any): void;
  export function setSelectedMusicUrl(payload: any): void;
  export function setSelectedTheme(payload: any): void;
  export function setSelectedVoiceLanguage(payload: any): void;
  export function updateAppliedConfig(payload: any): void;
  export function setSelectedAudio(payload: any): void;
  export function setSelectedTemplateThumbnail(payload: any): void;
  export function setSelectedTemplateConfig(payload: any): void;
  export function setSelectedBgMusic(payload: any): void;

  // Retail Coach Marks related actions
  export function setStepCoaches(payload: any): void;
  export function setSteps(payload: any): void;
  export function setshowDemoCoach(payload: any): void;
  export function setPreviousStep(payload: any): void;

  // Media Kit related actions
  export function setIsAvailable(payload: any): void;
  export function setActiveSidebar(payload: any): void;
  export function resetActiveSidebar(payload: any): void;
  export function resetMediaKit(payload: any): void;
  export function setimagesSelectedForOverlay(payload: any): void;
  export function updateisPreProcessing(payload: any): void;
  export function setBillboardImages(payload: any): void;
  export function setHighlightBillboardImages(payload: any): void;
  export function setDefaultBillboardImages(payload: any): void;
  export function setDefaultHighlightBillboardImages(payload: any): void;
  export function setBannerDetails(payload: any): void;
  export function setHighlightsBannerDetails(payload: any): void;
  export function setHighlightOverlay(payload: any): void;
  export function removeOverlaysImageId(): void;
  export function setEditTopFeatures(payload: any): void;
  export function setSidebarAssets(payload: any): void;
  export function setBannerToBeAppliedOnIds(payload: any): void;
  export function setActiveSidebar(payload: any): void;
  export function setActiveFlow(payload: any): void;
  export function resetBannerToBeAppliedOnIds(): void;
  export function setToggleState(payload: any): void;
  export function setOverlayBannerImageIds(payload: any): void;
  export function addOverlayBannerImageIds(payload: any): void;
  export function removeOverlayBannerSelections(payload: any): void;
  export function setDefaultSidebarConfig(payload: any): void;
  export function setApplyDefaultMediaKit(payload: any): void;
  export function updateThreeSixtyHotspotFromActiveFlow(payload: any): void;
  export function removeHighlightsBannerIds(payload: any): void;
  export function setAppliedHighlightOverlay(payload: any): void;
  export function removeHighlightsOverlaysImageId(): void;
  export function setHighlightsOverlayImageId(payload: any): void;
  export function setAppliedHighlightOverlay(payload: any): void;
  export function removeHighlightsOverlaysImageId(): void;
  export function setHighlightsOverlayImageId(payload: any): void;
  export function setAppliedHighlightOverlay(payload: any): void;
  export function removeHighlightsOverlaysImageId(): void;
  export function setChangeHighlightsBanner(payload: any): void;
  export function resetHighlightBillboardImages(): void;
  export function resetHighlightsBannerToBeAppliedOnIds(): void;
  export function setAvailableBrandingProducts(payload: any): void;
  export function setDemoData(payload: any): void;
  export function setLoading(payload: any): void;
  export function setError(payload: any): void;
  export function setExtractedData(payload: any): void;
  export function setVehicleCategory(payload: any): void;

  export function setSelectedVehicle(payload: any): void;
  export function setSelectedBackground(payload: any): void;
  export function setSelectedNumberPlate(payload: any): void;
  export function setSelectedTemplate(payload: any): void;
  export function setSelectedFamily(payload: any): void;
  export function updateRequestData(payload: any): void;
  export function resetSidebarSelections(): void;
  export function clearTemplateSelections(): void;
  export function clearAllSelections(): void;
  export function clearAllSelectionsIncludingVehicle(): void;
  export function setProductErrorLogs(payload: any): void;
  export function setFeatureVideoAssets(payload: any): void;
  export function setSpinAssets(payload: any): void;
  export function setHotspot(payload: any): void;
  export function setSelectedAudio(payload: any): void;
  export function setSelectedBgMusic(payload: any): void;
  export function setSidebarSelectedAudio(payload: any): void;
  export function setSidebarSelectedBgMusic(payload: any): void;
  export function setWindowStickerTemplateData(payload: any): void;
  export function setShowBannerModal(payload: any): void;
  export function setNumberplateMaskingEnabled(payload: any): void;
  export function setAssetType(payload: any): void;
  export function setReplacingMedia(payload: any): void;
  export function setProcessingStatus(payload: any): void;
}

declare module '@spyne-console/store/auth' {
  const authStore: any;
  export default authStore;
}

declare module '@spyne-console/store/user' {
  const userStore: any;
  export default userStore;
}

declare module '@spyne-console/store/app' {
  const appStore: any;
  export default appStore;
}

declare module '@spyne-console/store/analytics' {
  const analyticsStore: any;
  export default analyticsStore;
}

declare module '@spyne-console/store/notifications' {
  const notificationsStore: any;
  export default notificationsStore;
}
