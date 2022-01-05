const limits = {   //We recommend importing as LIMITS
    get acceptedFileTypes() { return ["image/png", "image/jpeg"];},
    get maxUplFilesCount() { return 8; },
    get maxFileSize() { return 5242880; },

    get maxGlrItemsOnPage() { return 4; },
    
    get loginMinLength() { return 6; },
    get loginMaxLength() { return 20; },
    get loginValidationRegExp() { return /[^A-Za-z0-9_-]/g; },
    get passwordMinLength() { return 6; },
    get passwordMaxLength() { return 20; },
    get passwordValidationRegExp() { return /[^A-Za-z0-9]/g; },
    get userNameMinLength() { return 6; },
    get userNameMaxLength() { return 20; },
    get userNameValidationRegExp() { return /[^ёЁA-Za-zА-Яа-я0-9 _-]/g;},
    get emailMaxLength() { return 256; },
    get emailValidationRegExp() { return /[^A-Za-z0-9_&@№!~\-\+\{\}\$\?\^\*\.\,]/g; },
    
    get emailPatternRegExp() { return /^[A-Za-z0-9_&№!~\-\+\{\}\$\?\^\*]+@[A-Za-z0-9-]+\.([A-Za-z]{1,6}\.)?[A-Za-z]{2,6}$/i; },

    get downlReportLengthStr_Length() { return 10; },

    get inPopup_liElsMaxCount() { return 5; },
    get inPopup_fNameMaxLength() { return 30; },
    get inPopup_fRenaming_maxNewFNameLength() { return 42; },
};

const defaults = { //We recommend importing as DEFAULTS
    get defaultGlrCurrentPage() { return 1; },

    get defaultGlrImgFolder() { return "Main"; },
};

const namesAndPaths = { //We recommend importing as NAMES_PATHS
    get siteDomain() { return "domain.ru";}, 
    get siteEmail() { return "some@mail.ru";},

    get glrImagesUrlPath() { return "/img/"; },
    get designElementsUrlPath() { return "/graphels/"; },

    get imgArchiveToDownloadBasename() { return "images_"; },

    get backgroundImg() { return "Bg-general-stars.jpg"; },
    get backgroundColor() { return "rgb(0, 14, 31)"; },

    get logoNameImg() { return "Logo-name-default.png"; },
    get logoImg() { return "Logo-ship.png"; },

    get entrancePageCentralImg_Layer1_Picture() { return "Central-img-top-layer.jpg"; },
    get entrancePageCentralImg_Layer2_Picture() { return "Central-img-middle-layer.jpg"; },
    get entrancePageCentralImg_Layer3_Picture() { return "Central-img-bottom-layer.jpg"; },

    get dropzoneBgImg() { return "Bg-dropzone.jpg"; }, //We recommend importing as Dropzone-background.jpg

    get showGalleryItemDefaultImg() { return "Showgallery-item-default-img.jpg"; },

    get regPageCentralImg() { return "RegPage-central-img.jpg"; },
    get regPage_RegistrationTitle_Img() { return "RegPage-registration.png"; },
    get regPage_WelcomeTitle_Img() { return "RegPage-welcome.png"; },

    get regPage_EmailInputTitle_Img() { return "RegPage-email.png"; },
    get regPage_LoginInputTitle_Img() { return "RegPage-login.png"; },
    get regPage_PasswordInputTitle_Img() { return "RegPage-password.png"; },
    get regPage_RepeatPswInputTitle_Img() { return "RegPage-repeat-psw.png"; },
    get regPage_UsernameInputTitle_Img() { return "RegPage-username.png"; },

    get regPage_QuestionIcon_Img() { return "RegPage-question-icon.png"; },
    get regPage_WrongInputValueIcon_Img() { return "RegPage-wrong-val-icon.png"; },

};

const styles = { //We recommend importing as STYLES
    get logoBlockBackground() { return "rgb(0,43,127)";},
    get logoBlockBorder() { return "2px solid #0072c8"; },
    get logoBlockBorderRadius() { return "5px 5px 5px 5px"; }
};

const jwTokenParams = { //We recommend importing as JWTOKEN
    get jwTokenName() { return "usertoken"; },
    get jwTokenValidPeriod() { return "30min"; }, //МОЖНО ОБОЙТИСЬ БЕЗ НЕГО
    get jwTokenLoginSectionName() { return "login"; }, //МОЖНО ОБОЙТИСЬ БЕЗ НЕГО
    get jwTokenIPSectionName() { return "ip"; }, //МОЖНО ОБОЙТИСЬ БЕЗ НЕГО
};

const internalAPI_filesOperationStatusCodes = { //We recommend importing as FO_STATUS
    get noAction() { return 1; },
    get waitingForResults() { return 2; },
    get uploadedSuccessfully() { return 3; },
    get uplFilesAlreadyExist() { return 4; },
    get uplFExistAllSkipped() { return 5; },
    get uploadingFailed() { return 6; },
    get removedSuccessfully() { return 7; },
    get removingFailed() { return 8; },
    get renamedSuccessfully() { return 9; },
    get renamingFailed() { return 10; },
    get downloadedSuccessfully() { return 11; },
    get downloadingFailed() { return 12; },
};

const internalAPI_fetchUrls = { //We recommend importing as F_URL
    get signingIn() { return '/api/authorisation'; },
    get checkAuth() { return '/api/checkauth'; },
    get preRegistration() { return '/api/preregistrat'; },
    get accActivation() { return '/accactivation'; },
    get fileRenaming() { return '/api/renameglrfile'; },
    get readGallery() { return '/api/readgallery'; },
    get flsUploading() { return '/api/upload'; },
    get flsUplOverwriting() { return '/api/overwrite'; },
    get flsRemoving() { return '/api/removeglrfiles'; },
    get changeForgottenPsw() { return '/api/forgotpsw'; },
    get changePsw() { return '/api/changepsw'; },
    get flsDownloading() { return '/api/download'; }  
}

const internalAPI_commandCodes = { //We recommend importing as DO
    get setStateAuthorised() { return 1; },
    get setStateUnauthorised() { return -1; },
    get makeFilesToUploadList() { return 2; },
    get uploadFiles() { return 3; },
    get removeFiles() { return 4; },
    get downloadFiles() { return 5; },
    get selectGlrItem() { return 6; },
    get readGallery() { return 7; },
    get enterImgFullView() { return 8; },
    get exitImgFullView() { return 9; },
    get confirmFilesRemoving() { return 10; },
    get closeOpersReport() { return 11; },
    get renameFile() { return 12; },
    get openFRenamingPopup() { return 13; },
    get register() { return 14; },
    get signIn() { return 15; },
    get signOut() { return 16; },
    get signOutToMainPage() { return 17; },
    get openSignInPopup() { return 18; },
    get closeSignInPopup() { return 19; },
    get openUserProfile() { return 20; },
    get closeUserProfile() { return 21; },
    get openAboutProject() { return 22; },
    get closeAboutProject() { return 23; },
    get goToGallery() { return 24; },
    get goToRegPage() { return 25; },
    get goToRegPageFromSInPopup() { return 26; },
    get goToMainPage() { return 27; },
    get openForgottenPswPopup() { return 28; },
    get closeForgottenPswPopup() { return 29; },
    get changeForgottenPassword() { return 30; },
    get changePassword() { return 31; },
    get clearDisabledItemsTempObject() { return 32; },
    get clearFNamesTempObject() { return 33; },
    get clearFRenamingTempObject() { return 34; },
};

const internalAPI_errorCodes = { //We recommend importing as ERR_ID
    get glrFolderUnaccessable() { return 31; },
    get glrFolderNotReadable() { return 32; },
    get glrUnknownErr() { return 33; }
};

const internalAPI_operationResultCodes = { //We recommend importing as RESULT
    get filesUploaded() { return 1; },
    get filesRemoved() { return 2; },
    get fileRenamed() { return 3; },
    get failedFilesUploading() { return 4; },
    get failedFilesRemoving() { return 5; },
    get failedFileRenaming() { return 6; },
    get failedFilesDownloading() { return 7; },
    get fetchError() { return 8; },
    get filesDownloaded() { return 9; }  //Пока не используется, т.к. нет необходимости выводить какой-либо попап об успешной загрузке файла(ов) - браузер сам об этом сообщает.
};

const internalAPI_flags = { //We recommend importing as FLAG
    get authorised() { return 1; },
    get unauthorised() { return -1; },

    get sInPopup_initialView() {return 2; },
    get sInPopup_sessionEndedView() { return 3; },
    get sInPopup_setEnabled() { return 4; }
};

const internalAPI_cookieNames = { //We recommend importing as COOKIE_NAMES
    get forFlsRemovingRequest() { return "flsRemFolder"; }, 
    get forFlsUploadingRequest() { return "flsUplFolder"; }, 
    get forFlsOverwritingRequest() { return "flsOverwritingFolder"; }, 
    get forFileRenamingRequest() { return "fileRenamFolder"; }, 
    get forFlsDownloadingRequest() { return "flsDownloadFolder"; } 
};

const internalAPI_httpResponseCodes = { //We recommend importing as RESP_CODE
    get internalServerError() { return 500; },
    get badRequest() { return 400; },
    get unauthorised() { return 401; },
    get notAcceptable() { return 406; },
    get ok() { return 200; }
};

const internalAPI_specialUserIDValues = { //We recommend importing as SPECIAL_UID
    get unauthorised() { return -3; },
    get signingIn() { return -2; }
}

module.exports = {limits,
    defaults,
    namesAndPaths,
    styles,
    jwTokenParams,
    internalAPI_filesOperationStatusCodes, 
    internalAPI_fetchUrls, 
    internalAPI_commandCodes, 
    internalAPI_errorCodes, 
    internalAPI_operationResultCodes, 
    internalAPI_flags,
    internalAPI_cookieNames,
    internalAPI_httpResponseCodes,
    internalAPI_specialUserIDValues};

