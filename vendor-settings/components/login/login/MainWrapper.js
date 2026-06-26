/**@format */
import React, { useRef, useState, useEffect } from "react"
import SignInSignUp from "./signInSignUp/SignInSignUp"
import Image from "next/image"
import { useSelector } from "@spyne-console/store"
import { languageChangeIcons } from "@spyne-console/common-config/account/profile";
import { cookie } from "@spyne-console/utils/config";
import CentralAPIHandler from "../../centralAPIHandler/centralAPIHandler";

function MainWrapper({ translate, i18n }) {
    const authReducer = useSelector(state => state.authReducer)
    const videoRef = useRef()
    const [isFetching, setIsFetching] = useState(false)
    const [buttonWidth, setButtonWidth] = useState(null);
    const buttonRef = useRef(null);


    useEffect(() => {
        if (buttonRef.current) {
            setButtonWidth(buttonRef.current.offsetWidth);
        }
    }, [buttonRef.current]);

    const [language, setLanguage] = useState({
        label: "English",
        abbreviation: "Eng",
        value: "en"
    })
    const [showLangSelector, setShowLangSelector] = useState(false);
    const [availableLanguages, setAvailableLanguages] = useState([{
        label: "English",
        abbreviation: "eng",
        value: "en"
    }])


    useEffect(() => {
        if (cookie("language")) {
            let selectedLanguage = availableLanguages.filter(lang => lang?.value == cookie("language"))
            if (selectedLanguage?.length > 0) {
                setLanguage(selectedLanguage[0])
            }
        }
        fetchAvailableLangs();
    }, [])

    useEffect(() => {
        if (cookie("language")) {
            let selectedLanguage = availableLanguages.filter(lang => lang?.value == cookie("language"))
            if (selectedLanguage?.length > 0) {
                setLanguage(selectedLanguage[0])
            }
        }
    }, [availableLanguages])

    const fetchAvailableLangs = async () => {
        try {
            const URL = `${process.env.BACKEND_BASEURL}/api/nv1/multilingual/languages`

            const res = await CentralAPIHandler.handleGetRequest(URL)
            const newAvailableLangList = res?.data?.map((lang, index) => {
                return {
                    label: lang?.language,
                    abbreviation: lang?.language?.substring(0, 3),
                    value: lang?.lang_code
                }
            })
            setAvailableLanguages(newAvailableLangList);

        } catch (err) {
            console.log(err);
        }
    }
    const handleLanguageChange = (lang) => {
        if (document) {
            let now = new Date();
            now.setTime(now.getTime() + 34560000 * 1000) // 34560000 = 400 days in seconds 

            document.cookie = `language=${lang.value};expires=` + now.toUTCString() + ';path=/';
        }
        if (localStorage.getItem(`i18n_${lang.value}`)) {
            i18n.addResourceBundle(lang.value, 'translation', JSON.parse(localStorage.getItem(`i18n_${lang.value}`)), true, true);
        } else {
            fetchTranslationFile(lang)
        }
        i18n.changeLanguage(lang.value);
        setLanguage(lang)
        setShowLangSelector(false)
    }

    const fetchTranslationFile = async (lang) => {
        setIsFetching(true)
        if (cookie("language") && cookie("language") != 'en') {
            try {
                const requestedLanguage = cookie("language")
                const URL = `${process.env.BACKEND_BASEURL}/api/nv1/multilingual/language/data`

                const res = await CentralAPIHandler.handleGetRequest(URL, {
                    lang_code: requestedLanguage
                })
                localStorage.setItem(`i18n_${requestedLanguage}`, JSON.stringify(res))
                i18n.addResourceBundle(lang.value, 'translation', JSON.parse(localStorage.getItem(`i18n_${lang.value}`)), true, true);

                i18n.changeLanguage(lang.value)
            } catch (err) {
                console.log(err);
            }
        }
        setIsFetching(false)
    }

    return (
        <section className="enterprise-selection-area h-screen">
           <div className="container-fluid mx-auto h-full">
                <div className="relative grid h-full gap-0 md:grid-cols-12 ">
                    <Image src={`https://spyne-static.s3.us-east-1.amazonaws.com/console/icons/create_enterprise_org_type/imageloginpage.webp`} width={1440} height={800} className="absolute top-0 left-0 w-full h-full object-cover " />
                    <div className="col-span-12 h-full grid tb:p-10 tb:pb-5 py-6 px-4 relative">
                        <div className="flex justify-between items-center m-0 z-20" style={{ height: '44px' }}>
                            <img
                                src={authReducer?.resellerData?.logo_url || ""}
                                alt="Spyne logo"
                                className="w-44"
                            />
                            <div className="relative">
                                <button
                                    ref={buttonRef}
                                    className="flex justify-between items-center font-semibold rounded-md border border-white text-sm w-[160px] h-[40px] px-4 py-2 m-0 sm:w-[140px] sm:h-[35px] md:w-[160px] md:h-[40px] lg:w-[180px] lg:h-[45px]"
                                    onClick={() => setShowLangSelector(!showLangSelector)}
                                >
                                    <div className="flex items-center gap-2 text-white">
                                        <Image src={languageChangeIcons.globeIcon} height={16} width={16} />
                                        {language.label}
                                    </div>
                                    <Image src={languageChangeIcons.dropdownIcon} height={20} width={20} />
                                </button>

                                {showLangSelector && (
                                    <div className="absolute left-0 mt-1 bg-white shadow-md border border-gray-200 rounded-lg w-[140px] sm:w-[120px] md:w-[160px] z-50" style={{ width: buttonWidth }}>
                                        {availableLanguages.map((lang, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleLanguageChange(lang)}
                                                className="flex justify-between items-center px-2 py-2.5 text-sm font-medium hover:bg-gray-100 hover:text-blue-light cursor-pointer"
                                                style={{ width: '100%' }}
                                            >
                                                <span className={`${language === lang ? 'text-blue-light' : ''}`}>
                                                    {lang.label}
                                                </span>
                                                {language === lang && (
                                                    <Image src={languageChangeIcons.checkIcon} height={16} width={16} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-full tb:w-[520px] mx-auto z-20 bg-white rounded-2xl h-min overflow-y-auto md:px-5 md:py-5">
                            <SignInSignUp translate={translate} />
                        </div>
                    </div>
                </div>
            </div>

        </section>
    )
}
export default MainWrapper
