class MediaGalleryServer {
    constructor(
        {
            domain, 
            email, 
            indexFile, 
            staticFilesFolder, 
            siteDesignElementsUrlPath, 
            galleryImagesUrlPath,            
            siteDesignElementsFolder,
            defaultCurrentGalleryFolder = "Main",
            galleryFolderRegExp = /[^ёЁA-Za-zА-Яа-я0-9 _-]/g,

            apiUrls: {
                apiUrl_signingIn,
                apiUrl_checkAuth,
                apiUrl_preRegistration,
                apiUrl_accActivation,
                apiUrl_fileRenaming,
                apiUrl_readGallery,
                apiUrl_flsUploading,
                apiUrl_flsUplOverwriting,
                apiUrl_flsRemoving,
                apiUrl_changeForgottenPsw,
                apiUrl_changePsw,
                apiUrl_flsDownloading,
            },

            cookieForFilesRemoving = "flsRemFolder",
            cookieForFilesUploading = "flsUplFolder",
            cookieForFilesOverwriting = "flsOverwritingFolder",
            cookieForFileRenaming = "fileRenamFolder",
            cookieForFilesDownloading = "flsDownloadFolder",

            tokenParams: {
                secretKeyForToken,
                tokenName = "usertoken",
                tokenValidityPeriod = "30min",
            },

            imgArchiveToDownloadBasename = "images_",

            nodeMailerParams: {
                nodemailerHost,
                nodemailerPassword,
                nodemailerPort = 587,
                nodemailerSecure = false,
                nodemailerRejectUnauthorized = false,
            },

            dbConnectionParams: {
                mySQLPath,
                dbConnectionHost,
                dbConnectionUser,
                dbConnectionDataBase,
                dbConnectionPassword,
            },

            usersDir,
            usersTable,
            preUsersTable,
            preUserIDStrLength = 12,
            userLogFile = "log.txt",
            adminLogFile = "_LOG.txt",

            activationLinkValidityPeriodInMillisec = 86400000,
            activationLinkValidityPeriodInDays = 1,

            activationResultCode_success = 1,
            activationResultCode_preUserIDIncorrect = 2,
            activationResultCode_preUserIDNotFound = 3,
            activationResultCode_linkExpired = 4,
            activationResultCode_preUsersTableReadingError = 5,
            activationResultCode_preUsersTableDataDeletionError = 6,
            activationResultCode_usersTableUpdateError = 7,
            activationResultCode_userFolderAlreadyExists = 8,
            activationResultCode_userFolderCreationError = 9,
            activationResultCode_techWorks = 10,

            loginMinLength = 6,
            loginMaxLength = 20,
            loginValidationRegExp = /[^A-Za-z0-9_-]/g,
            passwordMinLength = 6,
            passwordMaxLength = 20,
            passwordValidationRegExp = /[^A-Za-z0-9]/g,
            userNameMinLength = 6,
            userNameMaxLength = 20,
            userNameValidationRegExp = /[^ёЁA-Za-zА-Яа-я0-9 _-]/g,
            emailMaxLength = 256,
            emailPatternRegExp = /^[A-Za-z0-9_&№!~\-\+\{\}\$\?\^\*]+@[A-Za-z0-9-]+\.([A-Za-z]{1,6}\.)?[A-Za-z]{2,6}$/i,
            

            uploading_allowedFileTypes = ["image/png", "image/jpeg"],
            uploading_maxFilesNumber = 8,
            uploading_maxFileSize = 5242880,

            lengthOfSubstringWithLengthOfDownloadingReport = 10,

            hashSaltRounds = 9,
        }) {

        indexFile = this._validateParam_indexFile(indexFile);
        staticFilesFolder = this._validateParam_staticFilesFolder(staticFilesFolder);
        siteDesignElementsUrlPath = this._validateParam_anyImageUrlPath(siteDesignElementsUrlPath, "siteDesignElementsUrlPath");
        siteDesignElementsFolder = this._validateParam_siteDesignElementsFolder(siteDesignElementsFolder);
        galleryImagesUrlPath = this._validateParam_anyImageUrlPath(galleryImagesUrlPath, "galleryImagesUrlPath");

        this._API_URLS = {
            signingIn: this._validateParam_apiUrl(apiUrl_signingIn, "apiUrl_signingIn"),
            checkAuth: this._validateParam_apiUrl(apiUrl_checkAuth, "apiUrl_checkAuth"),
            preRegistration: this._validateParam_apiUrl(apiUrl_preRegistration, "apiUrl_preRegistration"),
            fileRenaming: this._validateParam_apiUrl(apiUrl_fileRenaming, "apiUrl_fileRenaming"),
            readGallery: this._validateParam_apiUrl(apiUrl_readGallery, "apiUrl_readGallery"),
            flsUploading: this._validateParam_apiUrl(apiUrl_flsUploading, "apiUrl_flsUploading"),
            flsUplOverwriting: this._validateParam_apiUrl(apiUrl_flsUplOverwriting, "apiUrl_flsUplOverwriting"),
            flsRemoving: this._validateParam_apiUrl(apiUrl_flsRemoving, "apiUrl_flsRemoving"),
            changeForgottenPsw: this._validateParam_apiUrl(apiUrl_changeForgottenPsw, "apiUrl_changeForgottenPsw"),
            changePsw: this._validateParam_apiUrl(apiUrl_changePsw, "apiUrl_changePsw"),
            flsDownloading: this._validateParam_apiUrl(apiUrl_flsDownloading, "apiUrl_flsDownloading"),
            accActivation: this._validateParam_apiUrl(apiUrl_accActivation, "apiUrl_accActivation"),
        };

        this._domain = this._validateParam_domain(domain);
        this._email = this._validateParam_email(email, emailPatternRegExp);
        this._defaultCurrentGalleryFolder = this._validateParam_galleryFolder(defaultCurrentGalleryFolder, "defaultCurrentGalleryFolder", galleryFolderRegExp);

        this._cookieForFilesRemoving = this._validateParam_cookieName(cookieForFilesRemoving);
        this._cookieForFilesUploading = this._validateParam_cookieName(cookieForFilesUploading);
        this._cookieForFilesOverwriting = this._validateParam_cookieName(cookieForFilesOverwriting);
        this._cookieForFileRenaming = this._validateParam_cookieName(cookieForFileRenaming);
        this._cookieForFilesDownloading = this._validateParam_cookieName(cookieForFilesDownloading);

        this._usersDir = this._validateParam_usersDir(usersDir);
        this._usersTable = usersTable;
        this._preUsersTable = preUsersTable;
        this._userLogFile = userLogFile;
        this._adminLogFile = adminLogFile;

        this._FOR_ACC_ACTIVATION = {
            actLinkValidityPeriodInMillisec: this._validateParam_integerAboveLimit(activationLinkValidityPeriodInMillisec, "_FOR_ACC_ACTIVATION.actLinkValidityPeriodInMillisec", 0),

            actLinkValidityPeriodInDays: this._validateParam_integerAboveLimit(activationLinkValidityPeriodInDays, "_FOR_ACC_ACTIVATION.actLinkValidityPeriodInDays", 0),

            resultCode_success: this._validateParam_integerAboveLimit(activationResultCode_success, "_FOR_ACC_ACTIVATION.resultCode_success", 0),

            resultCode_preUserIDIncorrect: this._validateParam_integerAboveLimit(activationResultCode_preUserIDIncorrect, "_FOR_ACC_ACTIVATION.resultCode_preUserIDIncorrect", 0),

            resultCode_preUserIDNotFound: this._validateParam_integerAboveLimit(activationResultCode_preUserIDNotFound, "_FOR_ACC_ACTIVATION.resultCode_preUserIDNotFound", 0),

            resultCode_linkExpired: this._validateParam_integerAboveLimit(activationResultCode_linkExpired, "_FOR_ACC_ACTIVATION.resultCode_linkExpired", 0),

            resultCode_preUsersTableReadingError: this._validateParam_integerAboveLimit(activationResultCode_preUsersTableReadingError, "_FOR_ACC_ACTIVATION.resultCode_preUsersTableReadingError", 0),

            resultCode_preUsersTableDataDeletionError: this._validateParam_integerAboveLimit(activationResultCode_preUsersTableDataDeletionError, "_FOR_ACC_ACTIVATION.resultCode_preUsersTableDataDeletionError", 0),

            resultCode_usersTableUpdateError: this._validateParam_integerAboveLimit(activationResultCode_usersTableUpdateError, "_FOR_ACC_ACTIVATION.resultCode_usersTableUpdateError", 0),

            resultCode_userFolderAlreadyExists: this._validateParam_integerAboveLimit(activationResultCode_userFolderAlreadyExists, "_FOR_ACC_ACTIVATION.resultCode_userFolderAlreadyExists", 0),

            resultCode_userFolderCreationError: this._validateParam_integerAboveLimit(activationResultCode_userFolderCreationError, "_FOR_ACC_ACTIVATION.resultCode_userFolderCreationError", 0),

            resultCode_techWorks: this._validateParam_integerAboveLimit(activationResultCode_techWorks, "_FOR_ACC_ACTIVATION.resultCode_techWorks", 0),
        }
        
        this._secretKeyForToken = this._validateParam_secretKeyForToken(secretKeyForToken);
        this._tokenName = tokenName;
        this._tokenValidityPeriod = tokenValidityPeriod;

        this._nodemailerHost = nodemailerHost;
        this._nodemailerPassword = nodemailerPassword;
        this._nodemailerPort = this._validateParam_integerAboveLimit(nodemailerPort, "nodemailerPort", 0);
        this._nodemailerSecure = Boolean(nodemailerSecure);
        this._nodemailerRejectUnauthorized = Boolean(nodemailerRejectUnauthorized);

        this._imgArchiveToDownloadBasename = this._validateParam_imgArchiveToDownloadBasename(imgArchiveToDownloadBasename);

        this._LIMITS = {
            hashSaltRounds: this._validateParam_integerAboveLimit(hashSaltRounds, "_LIMITS.hashSaltRounds", 0),

            loginMinLength: this._validateParam_integerAboveLimit(loginMinLength, "_LIMITS.loginMinLength", 0),
            loginMaxLength: this._validateParam_integerAboveLimit(loginMaxLength, "_LIMITS.loginMaxLength", 1),
            loginValidationRegExp: loginValidationRegExp,

            passwordMinLength: this._validateParam_integerAboveLimit(passwordMinLength, "_LIMITS.passwordMinLength", 0),
            passwordMaxLength: this._validateParam_integerAboveLimit(passwordMaxLength, "_LIMITS.passwordMaxLength", 1),
            passwordValidationRegExp: passwordValidationRegExp,

            userNameMinLength: this._validateParam_integerAboveLimit(userNameMinLength, "_LIMITS.userNameMinLength", 0),
            userNameMaxLength: this._validateParam_integerAboveLimit(userNameMaxLength, "_LIMITS.userNameMaxLength", 1),
            userNameValidationRegExp: userNameValidationRegExp,

            emailMaxLength: this._validateParam_integerAboveLimit(emailMaxLength, "_LIMITS.emailMaxLength", 5), //5 - потому что минимальная длина email составляет 6 символов: a@b.ru
            emailPatternRegExp: emailPatternRegExp,

            uploading_allowedFileTypes: this._validateParam_uploading_allowedFileTypes(uploading_allowedFileTypes),
            uploading_maxFilesNumber: this._validateParam_integerAboveLimit(uploading_maxFilesNumber, "_LIMITS.uploading_maxFilesNumber", 0),
            uploading_maxFileSize: this._validateParam_integerAboveLimit(uploading_maxFileSize, "_LIMITS.uploading_maxFileSize", 0),

            lengthOfSubstringWithLengthOfDownloadingReport: this._validateParam_integerAboveLimit(lengthOfSubstringWithLengthOfDownloadingReport, "_LIMITS.lengthOfSubstringWithLengthOfDownloadingReport", 0),

            preUserIDStrLength: this._validateParam_integerAboveLimit(preUserIDStrLength, "_LIMITS.preUserIDStrLength", 0),
        }

        this._express = require('express');
        this._app = this._express();
        this._jwt = require("jsonwebtoken");
        this._cookieParser = require("cookie-parser");
        this._formidable = require('formidable');
        this._fs = require('fs');
        this._bcrypt = require("bcrypt");
        this._multer = require("multer"); //Средство для загрузки файлов
        this._archiver = require('archiver');
        this._nodemailer = require('nodemailer');
        this._ejs = require('ejs');
        this._passfather = require('passfather');


        this._knex = require('knex')({
            client: mySQLPath,
            connection: {
                    host: dbConnectionHost,
                    user: dbConnectionUser,
                    database: dbConnectionDataBase,
                    password: dbConnectionPassword
            },
            pool: { min: 2, max: 10 }
        });               

        this._createUTCDateStr = require("./CreateUTCDateStr.js"); 
        this._myTimeDelay = require("./MyTimeDelay.js"); //Подключаем самодельную ф-ю задержки времени.
        
        //По умолчанию все статические файлы будут разыскиваться в папке staticFilesFolder.
        //Запросы файлов-картинок - пользовательских или элементов дизайна сайта - имеют специальные url, 
        //и им будут назначены далее собственные обработчики.
        this._app.use(this._express.static(staticFilesFolder));

        //Запрос картинок-элементов дизайна сайта.
        const siteDesignElementsUrl = "/" + siteDesignElementsUrlPath + ":name";
        this._setRequestHandler(siteDesignElementsUrl, (req, res) => {
            const options = {root: "./"};
            res.sendFile(siteDesignElementsFolder + "/" + req.params.name, options, (err) => {
                if(err) {
                    res.status(this._RESP_STATUS_NOTFOUND).send();
                }
            }); 
        }, "get");

        //Запрос пользовательских картинок из Галереи.
        const galleryImagesUrl = "/" + galleryImagesUrlPath + ":id/:folder/:name";
        this._setRequestHandler(galleryImagesUrl, (req, res) => {
            const options = {root: "./"};
            res.sendFile(this._usersDir + "/" + req.params.id + "/images/" + req.params.folder + "/" + req.params.name, options, (err) => {
                if(err) {
                    res.status(this._RESP_STATUS_NOTFOUND).send();
                }
            });
        }, "get");


        this._setRequestHandler(this._API_URLS.checkAuth, this._checkAuthorisation.bind(this), "post", this._express.text());
        this._setRequestHandler(this._API_URLS.signingIn, this._signIn.bind(this), "post");
        this._setRequestHandler(this._API_URLS.readGallery, this._readGallery.bind(this), "post", this._express.text());
        this._setRequestHandler(this._API_URLS.fileRenaming, this._renameFile.bind(this), "patch", this._express.text(), this._cookieParser());
        this._setRequestHandler(this._API_URLS.flsRemoving, this._removeFiles.bind(this), "delete", this._express.text(), this._cookieParser());
        this._setRequestHandler(this._API_URLS.flsUploading, (req, res) => this._uploadFiles(req, res), "post", this._cookieParser());
        this._setRequestHandler(this._API_URLS.flsUplOverwriting, (req, res) => this._uploadFiles(req, res, true), "post", this._cookieParser());
        this._setRequestHandler(this._API_URLS.flsDownloading, this._downloadFiles.bind(this), "post", this._express.text(), this._cookieParser());
        this._setRequestHandler(this._API_URLS.changeForgottenPsw, this._changeForgottenPsw.bind(this), "post");
        this._setRequestHandler(this._API_URLS.changePsw, this._changePsw.bind(this), "post", this._cookieParser());
        this._setRequestHandler(this._API_URLS.preRegistration, this._preRegistration.bind(this), "post");
        this._setRequestHandler(apiUrl_accActivation + "/*", this._accActivation.bind(this), "get");
        
        


        //Любые запросы, не перечисленные выше, должны просто отдавать индексный файл. Там в скриптах на стороне 
        //клиента уже будут парсить url и разбираться, что при таком адресе делать. 
        this._setRequestHandler('/*', (_, res) => {     
            const options = {root: "./"};
            res.sendFile(indexFile, options, (err)=>{
                if(err) {
                    res.status(this._RESP_STATUS_NOTFOUND).send();
                }
            });            
        }, "get");        
    }

  
    //Можно было бы обойтись без этого метода, но уж очень он получился технологичным - объединяет в себе назначение и обработчика, и middlewares.
    _setRequestHandler (reqUrl, handler, httpMethod, ...middlewares) {
        if(middlewares.length > 0) this._app.use(reqUrl, ...middlewares);

        const _httpMethod = httpMethod.toLowerCase().trim();

        try {
            this._app[_httpMethod](reqUrl, handler);
            //См. документацию по Express - https://expressjs.com/en/4x/api.html#app.METHOD
        } catch(err) {
            throw err;
        }
    }

//====================================================
//Constructot params validation:

    _validateParam_galleryFolder(paramValue, paramName, folderNameRegExp) {
        if(paramValue===undefined || paramValue===null || paramValue===false) throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, paramName));

        const stringedParam = String(paramValue).trim();
        if(stringedParam.match(folderNameRegExp)) throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, paramName));

        return stringedParam;
    }

    _validateParam_uploading_allowedFileTypes(param) {
        if(!Array.isArray(param)) throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, "uploading_allowedFileTypes"));
        return param;
    }

    _validateParam_integerAboveLimit(paramValue, paramName, limit) {
        if(isNaN(paramValue) || paramValue <= limit || !Number.isInteger(paramValue)) throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, paramName));
        return paramValue;        
    }

    _validateParam_cookieName(paramValue, paramName) {
        if(paramValue===undefined || paramValue===null || paramValue===false) throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, paramName));

        const stringedParam = String(paramValue).trim();
        if(stringedParam.length < 1) throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, paramName));
        else return stringedParam;        
    }

    _validateParam_domain(param) {
        const stringedParam = String(param).trim();
        return stringedParam;
    }

    _validateParam_email(param, emailPatternRegExp) {
        if(param===undefined || param===null || param===false) throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, "email"));

        const stringedParam = String(param).trim();
        if(stringedParam.search(emailPatternRegExp)==-1) throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, "email"));
        else return stringedParam;
    }

    _validateParam_indexFile(param) {
        if(param===undefined || param===null || param===false) throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, "indexFile"));

        const stringedParam = String(param).trim();
        return stringedParam;
    }

    _validateParam_staticFilesFolder(param) {
        if(param===undefined || param===null || param===false) return "";

        const stringedParam = String(param).trim();
        if(stringedParam[0]=="/" || stringedParam[stringedParam.length-1]=="/") throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, "staticFilesFolder"));
        else return stringedParam;
    }

    _validateParam_usersDir(param) {
        if(param===undefined || param===null || param===false) throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, "usersDir"));

        const stringedParam = String(param).trim();
        if(stringedParam.length < 2 || stringedParam[0]=="/" || stringedParam[stringedParam.length-1]=="/") throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, "usersDir"));
        else return stringedParam;        
    }

    _validateParam_anyImageUrlPath(paramValue, paramName) {
        if(paramValue===undefined || paramValue===null || paramValue===false) return "";

        const stringedParam = String(paramValue).trim();
        if(stringedParam.length < 2 || stringedParam[0]=="/" || stringedParam[stringedParam.length-1]!="/") throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, paramName));
        else return stringedParam;
    }

    _validateParam_siteDesignElementsFolder(param) {
        if(param===undefined || param===null || param===false) return "";

        const stringedParam = String(param).trim();
        if(stringedParam[0]=="/" || stringedParam[stringedParam.length-1]=="/") throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, "siteDesignElementsFolder"));
        else return stringedParam;
    }

    _validateParam_apiUrl(paramValue, paramName) {
        if(paramValue===undefined || paramValue===null || paramValue===false) throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, paramName));

        const stringedParam = String(paramValue).trim();
        if(stringedParam.length<=1 || stringedParam[0]!="/") throw new Error(this._createErrorMessage(this._ERR_CONSTRUCTOR_PARAM, paramName));
        return stringedParam;
    }

    _validateParam_secretKeyForToken(param) {
        if(param===undefined || param===null || param===false) throw new Error("The Secret Key for token should be a string!");

        const stringedParam = String(param).trim();
        if(stringedParam.length==0) throw new Error("The length of the Secret Key for token without end whitespaces should be > 0!");
        return stringedParam;
    }

    _validateParam_imgArchiveToDownloadBasename(param) {
        if(param===undefined || param===null || param===false) throw new Error("Param 'imgArchiveToDownloadBasename' should be a string!");

        const stringedParam = String(param).trim();
        if(stringedParam.length==0) throw new Error("The length of param 'imgArchiveToDownloadBasename' without end whitespaces should be > 0!");
        return stringedParam;
    }
//====================================================

    _accActivation (req, res) {
        const date = new Date(); //Текущее время.
    
        const preUserIDValidFaultRegExp = /[^a-z0-9]/g; //Если preUserID соответствует этому выражению (т.е., в
        //нём попадётся хоть один символ, который НЕ a-z0-9), значит, preUserID неправильный.
        const preUserID = req.path.slice((this._API_URLS.accActivation + "/").length);
    
        const reportPageParamsObj = {
            domain: this._domain,
            email: this._email,
            resultVariants: {
              SUCCESS: this._FOR_ACC_ACTIVATION.resultCode_success,
              PRE_USER_ID_INCORRECT: this._FOR_ACC_ACTIVATION.resultCode_preUserIDIncorrect,
              PRE_USER_ID_NOT_FOUND: this._FOR_ACC_ACTIVATION.resultCode_preUserIDNotFound,
              LINK_EXPIRED: this._FOR_ACC_ACTIVATION.resultCode_linkExpired,
              PRE_USERS_TABLE_READING_ERROR: this._FOR_ACC_ACTIVATION.resultCode_preUsersTableReadingError,
              PRE_USERS_TABLE_DATA_DELETION_ERROR: this._FOR_ACC_ACTIVATION.resultCode_preUsersTableDataDeletionError,
              USERS_TABLE_UPDATE_ERROR: this._FOR_ACC_ACTIVATION.resultCode_usersTableUpdateError,
              USER_FOLDER_ALREADY_EXISTS: this._FOR_ACC_ACTIVATION.resultCode_userFolderAlreadyExists,
              USER_FOLDER_CREATION_ERROR: this._FOR_ACC_ACTIVATION.resultCode_userFolderCreationError,
              TECH_WORKS: this._FOR_ACC_ACTIVATION.resultCode_techWorks
            },
            result: this._FOR_ACC_ACTIVATION.resultCode_techWorks //Умолчальное значение.
        };
    
        if(preUserID.length==this._LIMITS.preUserIDStrLength && !preUserID.match(preUserIDValidFaultRegExp)) {
            this._knex(this._preUsersTable).select().where({"PreID": preUserID})
            .then((resultArr) => {
                if(resultArr.length > 0) { //Запись с данным "PreID" нашлась (не найтись она может, если её удалили из-за просрочки).
                    //Поскольку столбцу "PreID" задан UNIQUE, ясно, что длина resultArr м.б. если не 0, то только 1.
                
                    //Проверяем, не истёк ли срок действия активационной ссылки.
                    const newUserDataObject = resultArr[0];
                    const preRegTimestamp = Number(newUserDataObject["Timestamp"]);
                    const timestampsDiff = Date.now() - preRegTimestamp;
                    
                    if(timestampsDiff <= this._FOR_ACC_ACTIVATION.actLinkValidityPeriodInMillisec) {//Ссылка актуальна - срок не истёк.
                        //Удаляем строку из pre_users и добавляем в users. Именно в таком порядке - чтобы ни при
                        //какой ошибке не получилось так, что в двух таблицах окажутся одинаковые записи.
                    
                        const dataToInsertToUsersTable = {
                            "Login": newUserDataObject["Login"],
                            "Password": newUserDataObject["Password"],
                            "Name": newUserDataObject["Name"],
                            "Date": this._createUTCDateStr(date, true),
                            "Email": newUserDataObject["Email"]
                        }                                      
    
                        //Удаляем строку.
                        this._knex.transaction((trx) => {
                            this._knex(this._preUsersTable).where({"PreID": preUserID}).transacting(trx).del()
                            .then(trx.commit)
                            .catch(trx.rollback);    
                        })
                        .then(() => {
                            //Добавляем строку.
                            this._knex(this._usersTable).insert(dataToInsertToUsersTable).returning("uID")
                            //В "uID" содержится т.н. идентификатор вставки - значение поля с автоинкрементом для вставленной строки.
                            .then((uID) => {
                                
                                //Создание папки с Галереей.
                                //Путь к папке:
                                const userFilesDirPath = "./" + this._usersDir + "/" + uID;
    
                                //Ищем, нет ли уже такой папки, и если нет, то создаём её:
                                this._fs.access(userFilesDirPath, (err) => {
                                    if(err) {//Папка не найдена, можно создавать
                                        const userImagesPath = userFilesDirPath + "/images/" + this._defaultCurrentGalleryFolder;
                                        const userLogsPath = userFilesDirPath + "/logs";
                                        const userTempPath = userFilesDirPath + "/temp";
      
                                        const mkImagesDirPromise = new Promise((resolve, reject) => {
                                            this._fs.mkdir(userImagesPath, { recursive: true }, (err) => {
                                                if(err) reject("UserID: " + uID + ". Error of creation user's gallery images folder during account activation");
                                                else resolve();
                                            })
                                        });
                                        
                                        const mkLogsDirPromise = new Promise((resolve, reject) => {
                                            this._fs.mkdir(userLogsPath, { recursive: true }, (err) => {
                                                if(err) reject("UserID: " + uID + ". Error of creation user's logs folder during account activation");
                                                else resolve();
                                            })
                                        });
                                        
                                        const mkTempDirPromise = new Promise((resolve, reject) => {
                                            this._fs.mkdir(userTempPath, { recursive: true }, (err) => {
                                                if(err) reject("UserID: " + uID + ". Error of creation user's temporary files folder during account activation");
                                                else resolve();
                                            })
                                        });
                                        
                                        Promise.all([mkLogsDirPromise, mkImagesDirPromise, mkTempDirPromise])
                                        .then(() => {//Все промисы завершились успешно - папки создались
                                            this._writeToLog("UserID: " + uID + ". Success account activation.");
                                            
                                            reportPageParamsObj.username = dataToInsertToUsersTable["Name"];
                                            reportPageParamsObj.redirTargetPage = "https://" + this._domain;
                                            reportPageParamsObj.result = this._FOR_ACC_ACTIVATION.resultCode_success;
                                            this._ejs.renderFile("accact.ejs", reportPageParamsObj, null, (err, str) => {
                                                if(err) res.send("<font size='6'>Аккаунт успешно активирован. Входная страница: <a href='" + reportPageParamsObj.redirTargetPage + "'>ссылка<a/></font>");
                                                else res.send(str); //str - это строка html-кода, являющаяся результатом рендеринга файла "accact.ejs". Если рендеринг прошёл успешно, то клиенту отправляется она, если же при рендеринге возникла ошибка, то отправляется другая строка, сформированная прямо здесь и содержащая ту же инфу, которую должна была содержать строка из файла.
                                            });                                        
                                        },
                                        (err) => {//Хотя бы один промис вернул ошибку.
                                            this._writeToLog(err);
                                            
                                            reportPageParamsObj.result = this._FOR_ACC_ACTIVATION.resultCode_userFolderCreationError;
                                            this._ejs.renderFile("accact.ejs", reportPageParamsObj, null, (err, str) => {
                                                if(err) res.send("<font size='6' color=#FF0000>Ошибка при создании Галереи!</font><br/><font size='6'>К сожалению, вы временно не сможете загружать файлы в вашу Галерею. Мы постараемся устранить сбой в течение суток. Если проблема не исчезнет, пожалуйста, сообщите с этого же email на <a href='mailto:" + this._email + "'>" +  this._email + "</a></font>");
                                                else res.send(str);
                                            });                                        
                                        });
                                    
                                    }

                                    else {
                                        //КАК ВООБЩЕ может получиться, что такая папка уже существует? - Хз. В случае
                                        //создания аккаунта, который ранее был удалён.
                                        this._writeToLog("PreUserID: " + preUserID + ". Error occured during account activation: folder " + userFilesDirPath + " already exists!");
    
                                        //Сообщение об ошибке делаем такое же, как в случае с ошибкой создания директории.
                                        reportPageParamsObj.result = this._FOR_ACC_ACTIVATION.resultCode_userFolderAlreadyExists;
                                        this._ejs.renderFile("accact.ejs", reportPageParamsObj, null, (err, str) => {
                                            if(err) res.send("<font size='6' color=#FF0000>Ошибка при создании Галереи!</font><br/><font size='6'>К сожалению, вы временно не сможете загружать файлы в вашу Галерею. Мы постараемся устранить сбой в течение суток. Если проблема не исчезнет, пожалуйста, сообщите с этого же email на <a href='mailto:" + this._email + "'>" +  this._email + "</a></font>");
                                            else res.send(str);
                                        });                   
                                    }
                                });
                            }) 
                            .catch((err) => {
                                this._writeToLog("PreUserID: " + preUserID + ". Error of inserting row to users table during account activation: " + err);
    
                                reportPageParamsObj.result = this._FOR_ACC_ACTIVATION.resultCode_usersTableUpdateError;
                                this._ejs.renderFile("accact.ejs", reportPageParamsObj, null, (err, str) => {
                                    if(err) res.send("<font size='6' color=#FF0000>Критическая ошибка базы данных! Регистрационные данные потеряны.</font><br/><font size='6'>К сожалению, вам придётся регистрировать аккаунт заново. Примите наши сожаления...</font>");
                                    else res.send(str);
                                });                            
                               
                            });
                        })
                        .catch((err) => { //Не удалось удалить строку из pre_users.
                            this._writeToLog("PreUserID: " + preUserID + ". Error of deletion row from preUsers table during account activation: " + err);
    
                            reportPageParamsObj.result = this._FOR_ACC_ACTIVATION.resultCode_preUsersTableDataDeletionError;
                            this._ejs.renderFile("accact.ejs", reportPageParamsObj, null, (err, str) => {
                                if(err) res.send("<font size='6' color=#FF0000>Ошибка базы данных!</font><br/><font size='6'>Пожалуйста, повторите попытку активации немного позже.</font>");
                                else res.send(str);
                            });
    
                        });
    
                    }
                    else {//Срок действия активационной ссылки истёк.
                        //В этом случае нам нужно удалить запись из pre_users.
                        //А если произойдёт ошибка удаления? - Ну, тогда будет сделана запись в логи, а юзер не сможет
                        //зарегистрировать аккаунт с теми же данными, пока мы вручную не удалим эту строку.
                    
                        this._knex.transaction((trx) => {
                            This._knex(this._preUsersTable).where({"PreID": preUserID}).transacting(trx).del()
                            .then(trx.commit)
                            .catch(trx.rollback);    
                        })
                        .then(() => {
                            reportPageParamsObj.result = this._FOR_ACC_ACTIVATION.resultCode_linkExpired;
                            this._ejs.renderFile("accact.ejs", reportPageParamsObj, null, (err, str) => {
                                if(err) res.send("<font size='6' color=#FF0000>Активационная ссылка просрочена!</font><br/><font size='6'>Сожалеем, вам придётся зарегистрировать новый аккаунт.</font>");
                                else res.send(str);
                            });             
                        })
                        .catch((err) => {
                            this._writeToLog("PreUserID: " + preUserID + ". Error of deletion row from preUsers table during account activation due to the expired link: " + err);
                            
                            reportPageParamsObj.result = this._FOR_ACC_ACTIVATION.resultCode_linkExpired;
                            this._ejs.renderFile("accact.ejs", reportPageParamsObj, null, (err, str) => {
                                if(err) res.send("<font size='6' color=#FF0000>Активационная ссылка просрочена!</font><br/><font size='6'>Сожалеем, вам придётся зарегистрировать новый аккаунт.</font>");
                                else res.send(str);
                            });                                     
    
                        });
                    }
                    
                }
                else { //Такого значения "PreID" в таблице pre_users не найдено
                    reportPageParamsObj.result = this._FOR_ACC_ACTIVATION.resultCode_preUserIDNotFound;
                    this._ejs.renderFile("accact.ejs", reportPageParamsObj, null, (err, str) => {
                        if(err) res.send("<font size='6' color=#FF0000>Активационная ссылка недействительна.</font><br/><font size='6'>Либо активационная ссылка просрочена, либо аккаунт уже активирован.</font>");
                        else res.send(str);
                    });
                }
    
                
            })
            .catch((err) => { //Не удалось осуществить операцию селекта в таблице pre_users.
                this._writeToLog("PreUserID: " + preUserID + ". Error of deletion row from preUsers table during account activation: " + err);
    
                reportPageParamsObj.result = this._FOR_ACC_ACTIVATION.resultCode_preUsersTableReadingError;
                this._ejs.renderFile("accact.ejs", reportPageParamsObj, null, (err, str) => {
                    if(err) res.send("<font size='6' color=#FF0000>Ошибка чтения из базы данных!</font><br/><font size='6'>Пожалуйста, повторите попытку активации немного позже.</font>");
                    else res.send(str);
                });        
            });
        }
        else { //Почему-то введён некорректный preUserID.
            const errStr1 = "<font size='6' color=#FF0000>Ошибка адреса в активационной ссылке! Активация по этой ссылке невозможна.</font><br/>";
            const errStr2 = "<font size='6'>Зарегистрируйте новый аккаунт с другими данными, либо напишите с этого же email о проблеме на <a href='mailto:" + this._email + "'>" +  this._email + "</a>,<br/>";
            const errStr3 = "полностью процитировав активационное письмо, и мы вышлем вам новую ссылку или активируем аккаунт вручную.</font>";
            
            this._writeToLog("ERROR! Incorrect preUserID in activation link address: " + preUserID);
    
            reportPageParamsObj.result = this._FOR_ACC_ACTIVATION.resultCode_preUserIDIncorrect;
            this._ejs.renderFile("accact.ejs", reportPageParamsObj, null, (err, str) => {
                if(err) res.send(errStr1 + errStr2 + errStr3);
                else res.send(str);
            });        
        }


    }

    _preRegistration (req, res) {
        const form = this._formidable();
        form.parse(req, (err, fields) => {
            let resultObject = {
                formParseError: false, //Не удалось распарсить пришедшую форму с данными юзера.
                incorrectLogin: false, //Недопустимый логин.
                incorrectPassword: false,
                repeatPasswordError: false, //Неправильно повторили пароль
                incorrectUName: false,
                incorrectEmail: false,
                loginExistsError: false, //Такой логин уже есть.
                userNameExistsError: false, //Такое имя юзера уже есть.
                emailExistsError: false, //Такой емейл уже есть.
                preRegDataCreatingError: false, //Ошибка при добавлении данных в таблицу pre_users.
                actMailSendingError: false, //Ошибка при отправке письма с активационной ссылкой.
            };
            let regFormDataError = false;

            //Первая отсечка: если не удалось распарсить форму, то и говорить не о чем.
            if(err) {
                this._writeToLog("Error of form.parse() during pre-registration, req.ip=" + req.ip + ": " + err);
            
                resultObject.formParseError = err;
                res.send(JSON.stringify(resultObject));
                return;
            }


            const login = fields["login"];
            if(login.length < this._LIMITS.loginMinLength || login.length > this._LIMITS.loginMaxLength
            || login.match(this._LIMITS.loginValidationRegExp)) {
                resultObject.incorrectLogin = true;
                regFormDataError = true;
                
                if(login.length < this._LIMITS.loginMinLength)
                    this._writeToLog("Error occured during pre-registration: login length < login minimal length, " + JSON.stringify(fields) + ", req.ip=" + req.ip);
                if(login.length > this._LIMITS.loginMaxLength)
                    this._writeToLog("Error occured during pre-registration: login length > login maximal length, " + JSON.stringify(fields) + ", req.ip=" + req.ip);
                if(login.match(LIMITS.loginValidationRegExp))
                    this._writeToLog("Error occured during pre-registration: login.match(loginValidationRegExp), " + JSON.stringify(fields) + ", req.ip=" + req.ip);
            }

            const password = fields["password"];
            if(password.length < this._LIMITS.passwordMinLength || password.length > this._LIMITS.passwordMaxLength
            || password.match(this._LIMITS.passwordValidationRegExp)) {
                resultObject.incorrectPassword = true;
                regFormDataError = true;
                
                if(password.length < this._LIMITS.passwordMinLength) 
                    this._writeToLog("Error occured during pre-registration: password length < password minimal length, " + JSON.stringify(fields) + ", req.ip=" + req.ip);
                if(password.length > this._LIMITS.passwordMaxLength) 
                    this._writeToLog("Error occured during pre-registration: password length > password maximal length, " + JSON.stringify(fields) + ", req.ip=" + req.ip);
                if(password.match(this._LIMITS.passwordValidationRegExp))
                    this._writeToLog("Error occured during pre-registration: password.match(passwordValidationRegExp), " + JSON.stringify(fields) + ", req.ip=" + req.ip);    
            }    
            
            const repeatedPassword = fields["repeatpassword"];
            if(repeatedPassword.length < this._LIMITS.passwordMinLength || repeatedPassword.length > this._LIMITS.passwordMaxLength
            || repeatedPassword.match(this._LIMITS.passwordValidationRegExp) 
            || repeatedPassword != password) {
                resultObject.repeatPasswordError = true;
                regFormDataError = true;
                
                if(repeatedPassword.length < this._LIMITS.passwordMinLength) 
                    this._writeToLog("Error occured during pre-registration: repeated password length < password minimal length, " + JSON.stringify(fields) + ", req.ip=" + req.ip);
                if(repeatedPassword.length > this._LIMITS.passwordMaxLength) 
                    this._writeToLog("Error occured during pre-registration: repeated password length > password maximal length, " + JSON.stringify(fields) + ", req.ip=" + req.ip);
                if(repeatedPassword.match(this._LIMITS.passwordValidationRegExp))
                    this._writeToLog("Error occured during pre-registration: repeated password match(passwordValidationRegExp), " + JSON.stringify(fields) + ", req.ip=" + req.ip); 
                if(repeatedPassword != newPassword)
                   this._writeToLog("Error occured during pre-registration: repeated password != password, " + JSON.stringify(fields) + ", req.ip=" + req.ip);      
            }

            const userName = fields["username"];
            if(userName.length < this._LIMITS.userNameMinLength || userName.length > this._LIMITS.userNameMaxLength
            || userName.match(this._LIMITS.userNameValidationRegExp)) {
                resultObject.incorrectUName = true;
                regFormDataError = true;
                
                if(userName.length < this._LIMITS.userNameMinLength)
                    this._writeToLog("Error occured during pre-registration: userName length < userName minimal length, " + JSON.stringify(fields) + ", req.ip=" + req.ip);
                if(userName.length > this._LIMITS.userNameMaxLength)
                    this._writeToLog("Error occured during pre-registration: userName length > userName maximal length, " + JSON.stringify(fields) + ", req.ip=" + req.ip);
                if(userName.match(this._LIMITS.userNameValidationRegExp))
                    this._writeToLog("Error occured during pre-registration: userName.match(userNameValidationRegExp), " + JSON.stringify(fields) + ", req.ip=" + req.ip);
            }

            const email = fields["email"];
            if(email.length > this._LIMITS.emailMaxLength || email.search(this._LIMITS.emailPatternRegExp)==-1) {
                resultObject.incorrectEmail = true;
                regFormDataError = true;
                
                if(email.length > this._LIMITS.emailMaxLength)
                    this._writeToLog("Error occured during pre-registration: email length > email maximal length, " + JSON.stringify(fields) + ", req.ip=" + req.ip);
                if(email.search(this._LIMITS.emailPatternRegExp)==-1)
                    this._writeToLog("Error occured during pre-registration: email doesn't match the pattern, " + JSON.stringify(fields) + ", req.ip=" + req.ip);
            }  
            
            //Вторая отсечка: если к этому моменту нашлись ошибки, можно не продолжать.
            if(regFormDataError) {
                res.send(JSON.stringify(resultObject));
                return;
            }

            //Проверяем наличие логина, имени юзера или почты в таблицах "pre_users" и "users". Если находим - 
            //прерываем процесс.
            const checkingIfNewUserParamsAlreadyExist_conditionsObjects = [
                {table: this._preUsersTable, columns: ["Login"], condition: {"Login": login}, doIfFound: () => {resultObject.loginExistsError = true}},
                {table: this._preUsersTable, columns: ["Name"], condition: {"Name": userName}, doIfFound: () => {resultObject.userNameExistsError = true}},
                {table: this._preUsersTable, columns: ["Email"], condition: {"Email": email}, doIfFound: () => {resultObject.emailExistsError = true}},
                {table: this._usersTable, columns: ["Login"], condition: {"Login": login}, doIfFound: () => {resultObject.loginExistsError = true}},
                {table: this._usersTable, columns: ["Name"], condition: {"Name": userName}, doIfFound: () => {resultObject.userNameExistsError = true}},
                {table: this._usersTable, columns: ["Email"], condition: {"Email": email}, doIfFound: () => {resultObject.emailExistsError = true}}
            ];

            let searchInDataBasePromises = checkingIfNewUserParamsAlreadyExist_conditionsObjects.map(conditionsObject => this._knex(conditionsObject.table).select(conditionsObject.columns).where(conditionsObject.condition))

            Promise.all(searchInDataBasePromises)
            .then((searchResults) => {
                this._writeToLog("TABLE ERR" + JSON.stringify(resultObject));

                let iterator = 0;
                for (let arrayOfFoundRows of searchResults) {
                    if(arrayOfFoundRows.length > 0) checkingIfNewUserParamsAlreadyExist_conditionsObjects[iterator].doIfFound();
                    iterator++;
                }

                //Прерываем операцию, если что-то нашлось.
                if(resultObject.loginExistsError || resultObject.userNameExistsError ||
                    resultObject.emailExistsError) {
                        res.send(JSON.stringify(resultObject));
                        return;
                }
                //Если не нашлось ничего, переходим к следующему этапу - заносим данные нового юзера в таблицу
                //pre_users.
        
                 //Источник - https://www.npmjs.com/package/passfather#options
                let preUserID = this._passfather({
                    numbers: false,
                    uppercase: false,
                    lowercase: false,
                    symbols: false,
                    length: this._LIMITS.preUserIDStrLength,
                    ranges: [ 
                        [[0x0030, 0x0039], //Числа 0-9 
                        [0x0061, 0x007A]]  //Латинские буквы в нижнем регистре
                    ]
                });
        
                const date = new Date();
                const dateMillisecs = date.getTime();
        
                let newUserDataObject = {
                    "PreID": preUserID,
                    "Login": login,
                    "Password": this._bcrypt.hashSync(password, this._LIMITS.hashSaltRounds), //Хэшируем пароль.
                    "Name": userName,
                    "Timestamp": String(dateMillisecs),
                    "Email": email
                }
                    
        
                this._knex.transaction((trx) => {
                    this._knex(this._preUsersTable).transacting(trx).insert(newUserDataObject)
                    .then(trx.commit)
                    .catch(trx.rollback);    
                })
                .then((lastInsertID) => { //Результатом транзакции станет последнее значение столбца с auto_increment - 
                //т.е., N в нашей добавившейся строке. Ниже мы его (т.е., lastInsertID) используем.
                       
                    const transporter = this._createNodemailerTransport();            
                       
                    const letterBodyStyleStr = "body {background-color: rgb(201, 223, 248); color: rgb(43, 41, 41); font-size: 23px; }";
                    const letterAncorStyleStr = "a {color: rgb(14, 82, 170); }";
                    const letterDivStyleStr = "div {display: flex; flex-direction: column; align-items: center;}";
                    const letterGreetingStr = "<span>Здравствуйте, " + userName + "! Спасибо за регистрацию. Активируйте ваш аккаунт, перейдя по </span>";
                    const letterAncorStr = "<a href='https://" + this._domain + this._API_URLS.accActivation + "/" + preUserID + "' target='blank'>ссылке.</a><br/>";
        
                    const letterLogPassStr = "<br/>Ваш логин: " + login + "<br/>Ваш пароль: " + password + "<br/>";
                        
                    const datePlusActPeriodMillisecs = dateMillisecs + this._FOR_ACC_ACTIVATION.actLinkValidityPeriodInMillisec;
                    const datePlusActPeriod = new Date(datePlusActPeriodMillisecs);
                    const letterActDeadlineStr = this._createUTCDateStr(datePlusActPeriod);
                        
                    const letterWarningStr = "<br/><span>Ссылка действительна в течение " + this._FOR_ACC_ACTIVATION.actLinkValidityPeriodInDays +  " суток (до " + letterActDeadlineStr + " по UTC+0).</span>";
                        
                    const letterStylesStr = letterBodyStyleStr + letterAncorStyleStr + letterDivStyleStr;
                    const letterContentStr = letterGreetingStr + letterAncorStr + letterLogPassStr + letterWarningStr;
                        
                    const messageObject = {
                        from: this._email,
                        to: email,
                        subject: "Активация аккаунта на " + this._domain,
                        text: "Здравствуйте, " + userName + "! Спасибо за регистрацию. Ваш логин: " + login + ", пароль: " + password + ". Активируйте ваш аккаунт, перейдя на страницу по адресу https://" + this._domain + this._API_URLS.accActivation + "/" + preUserID + ". Адрес действителен в течение " + this._FOR_ACC_ACTIVATION.actLinkValidityPeriodInDays + " суток (до " + letterActDeadlineStr + " по UTC+0).",
                        html: "<html><style type='text/css'>" + letterStylesStr + "</style><body><div>" + letterContentStr + "</div></body></html>"
                    };
                        
                    transporter.sendMail(messageObject, (err) => {
                        if(err) {
                            this._writeToLog("PreUserID: " + preUserID + ". Error of sending verification email during pre-registration: " + err);
        
                            resultObject.actMailSendingError = true;
                            res.send(JSON.stringify(resultObject)); 
                        }
                        else {
                            //Если письмо ушло успешно, нужно в таблице pre_users изменить значение поля VES на true.
                            this._knex(this._preUsersTable).where({"N": lastInsertID}).update({"VES": true})
                            .then(() => {
                                res.send(JSON.stringify(resultObject));
                            })
                            .catch((err) => {
                                this._writeToLog("PreUserID: " + preUserID + ". Error of updating preUsers table column VES during pre-registration: " + err);
                                    
                                res.send(JSON.stringify(resultObject));
                            });
                        }
                    }); 
                        
                })
                .catch((err) => {
                    this._writeToLog("PreUserID: " + preUserID + ". Error of inserting row in preUsers table during pre-registration: " + err);
        
                    resultObject.preRegDataCreatingError = true;
                    res.send(JSON.stringify(resultObject));
                    return;
                });            
                
            })
            .catch((err) => {
                this._writeToLog("Error of selecting rows in preUsers and Users tables during pre-registration when checking client sent form: " + err);
                
                res.status(this._RESP_STATUS_INTERNAL_SERVER_ERROR).send();
                return;
            });
        });
    }

    _changePsw (req, res) {
        const form = this._formidable();
        form.parse(req, (err, fields) => {
            let resultObject = {
                formParseError: false, //Не удалось распарсить пришедшую форму с данными юзера.
                incorrectOldPsw: false, //Недопустимый старый пароль.
                incorrectNewPsw: false,
                repeatNewPswError: false, //Неправильно повторили новый пароль.
                oldPasswordNotFound: false,
                readDBTableError: false,
                updateDBTableError: false, //Ошибка при записи в БД нового пароля.
            };

//Сменить "id" на "userID"
//Почему бы и здесь не получать инфу из токена?
            const userID = fields["id"];
            
            let formDataError = false;

            //Первая отсечка: если не удалось распарсить форму, то и говорить не о чем.
            if(err) {
                resultObject.formParseError = err;
            
                this._writeToLog("Error of form.parse() during change of password : " + err);

                res.send(JSON.stringify(resultObject));
                return;
            }

            const oldPassword = fields["oldpassword"];
            if(oldPassword.length < this._LIMITS.passwordMinLength || oldPassword.length > this._LIMITS.passwordMaxLength
            || oldPassword.match(this._LIMITS.passwordValidationRegExp)) {
                resultObject.incorrectOldPsw = true;
                formDataError = true;
                
                if(oldPassword.length < this._LIMITS.passwordMinLength) 
                    this._writeToLog("UserID: " + userID + ". Error occured during change of password: oldPassword length < passwordMinLength. " + JSON.stringify(fields), userID, true);
                if(oldPassword.length > this._LIMITS.passwordMaxLength) 
                    this._writeToLog("UserID: " + userID + ". Error occured during change of password: oldPassword length > passwordMaxLength. " + JSON.stringify(fields), userID, true);
                if(oldPassword.match(this._LIMITS.passwordValidationRegExp))
                    this._writeToLog("UserID: " + userID + ". Error occured during change of password: oldPassword.match(passwordValidationRegExp). " + JSON.stringify(fields), userID, true);    
            }

            const newPassword = fields["newpassword"];
            if(newPassword.length < this._LIMITS.passwordMinLength || newPassword.length > this._LIMITS.passwordMaxLength
            || newPassword.match(this._LIMITS.passwordValidationRegExp)) {
                resultObject.incorrectNewPsw = true;
                formDataError = true;
                
                if(newPassword.length < this._LIMITS.passwordMinLength) 
                    this._writeToLog("UserID: " + userID + ". Error occured during change of password: newPassword length < passwordMinLength. " + JSON.stringify(fields), userID, true);
                if(newPassword.length > this._LIMITS.passwordMaxLength) 
                    this._writeToLog("UserID: " + userID + ". Error occured during change of password: newPassword length > passwordMaxLength. " + JSON.stringify(fields), userID, true);
                if(newPassword.match(this._LIMITS.passwordValidationRegExp))
                    this._writeToLog("UserID: " + userID + ". Error occured during change of password: newPassword.match(passwordValidationRegExp). " + JSON.stringify(fields), userID, true);    
            }

            const repeatedNewPassword = fields["repeatnewpassword"];
            if(repeatedNewPassword.length < this._LIMITS.passwordMinLength || repeatedNewPassword.length > this._LIMITS.passwordMaxLength
            || repeatedNewPassword.match(this._LIMITS.passwordValidationRegExp)
            || repeatedNewPassword != newPassword) {
                resultObject.repeatNewPswError = true;
                formDataError = true;
                
                if(repeatedNewPassword.length < this._LIMITS.passwordMinLength) 
                    this._writeToLog("UserID: " + userID + ". Error occured during change of password: repeatedNewPassword length < passwordMinLength. " + JSON.stringify(fields), userID, true);
                if(repeatedNewPassword.length > this._LIMITS.passwordMaxLength) 
                    this._writeToLog("UserID: " + userID + ". Error occured during change of password: repeatedNewPassword length > passwordMaxLength. " + JSON.stringify(fields), userID, true);
                if(repeatedNewPassword.match(this._LIMITS.passwordValidationRegExp))
                    this._writeToLog("UserID: " + userID + ". Error occured during change of password: repeatedNewPassword.match(passwordValidationRegExp). " + JSON.stringify(fields), userID, true);
                if(repeatedNewPassword != newPassword)
                    this._writeToLog("UserID: " + userID + ". Error occured during change of password: repeatedNewPassword != newPassword. " + JSON.stringify(fields), userID, true);   
            }

            //Вторая отсечка: если к этому моменту нашлись ошибки, можно не продолжать.
            if(formDataError) {
                res.send(JSON.stringify(resultObject));
                return;
            }

            this._knex(this._usersTable).select().where({"userID": userID})
            .then((dataObjectsArray) => {//Сюда попадаем, если select() благополучно вернула массив с объектами,
            //в которых заключены данные (dataObjectsArray - и есть этот массив).
                if(dataObjectsArray.length==0) {//Получен массив с нулевой длиной - т.е., такой userID в БД не найден.
                    this._writeToLog("Extra!!! User ID " + userID + " not found in database during change of password", userID, true);
                    resultObject.readDBTableError = true;
                    
                    res.send(JSON.stringify(resultObject));
                }
                else { //Всё в порядке, строка с таким userID нашлась в таблице БД.
                    const oldPasswordHash = dataObjectsArray[0]["Password"]; //Извлекаем захешированный старый пароль.
                    
                    if(this._bcrypt.compareSync(oldPassword, oldPasswordHash)) {
                        const newPasswordHash = this._bcrypt.hashSync(newPassword, this._LIMITS.hashSaltRounds);
    
                        this._knex(this._usersTable).where({"userID": userID}).update({"Password": newPasswordHash})
                        .then(() => {//ВСЁ ОК!
                            this._writeToLog("UserID " + userID + ". Successful password change by user.", userID, true);
                            res.send(JSON.stringify(resultObject));
                        })
                        .catch((err) => {
                            this._writeToLog("UserID " + userID + ". Error occured during change of password: " + err, userID, true);
                            resultObject.updateDBTableError = true;
                            res.send(JSON.stringify(resultObject));
                        });
                    }
                    else {
                        resultObject.oldPasswordNotFound = true;
                        res.send(JSON.stringify(resultObject));
                    }
                }
            })
            .catch((err) => {//Какая-то ошибка при обращении к БД.
                this._writeToLog("UserID " + userID + ". Error of selecting row in table during change of password: " + err, userID, true);
    
                resultObject.readDBTableError = true;
                
                res.send(JSON.stringify(resultObject));
            });
        });
    }

    _changeForgottenPsw (req, res) {
        const form = this._formidable();
        form.parse(req, (err, fields) => {
            let resultObject = {
                formParseError: false, //Не удалось распарсить пришедшую форму с данными юзера.
                incorrectLogin: false, //Недопустимый логин.
                incorrectUName: false,
                loginOrUNameNotFound: false,
                readDBTableError: false,
                updateDBTableError: false, //Ошибка при записи в БД нового пароля.
                mailSendingError: false, //Ошибка при отправке письма с паролем.
            };
            
            let formDataError = false;

            //Первая отсечка: если не удалось распарсить форму, то и говорить не о чем.
            if(err) {
                resultObject.formParseError = err;
            
                this._writeToLog("Error of form.parse() during reminding of a forgotten password: " + err);

                res.send(JSON.stringify(resultObject));
                return;
            }

            const login = fields["login"];
            if(login.length < this._LIMITS.loginMinLength || login.length > this._LIMITS.loginMaxLength
            || login.match(this._LIMITS.loginValidationRegExp)) {
                resultObject.incorrectLogin = true;
                formDataError = true;
                
                if(login.length < this._LIMITS.loginMinLength)
                    this._writeToLog("Error occured during reminding of forgotten password: login length < login minimal length, " + JSON.stringify(fields));
                if(login.length > this._LIMITS.loginMaxLength)
                    this._writeToLog("Error occured during reminding of forgotten password: login length > login maximal length, " + JSON.stringify(fields));
                if(login.match(LIMITS.loginValidationRegExp))
                    this._writeToLog("Error occured during reminding of forgotten password: login.match(loginValidationRegExp), " + JSON.stringify(fields));
            }
            
            const userName = fields["username"];
            if(userName.length < this._LIMITS.userNameMinLength || userName.length > this._LIMITS.userNameMaxLength
            || userName.match(this._LIMITS.userNameValidationRegExp)) {
                resultObject.incorrectUName = true;
                formDataError = true;
                
                if(userName.length < this._LIMITS.userNameMinLength)
                    this._writeToLog("Error occured during reminding of forgotten password: userName length < userName minimal length, " + JSON.stringify(fields));
                if(userName.length > this._LIMITS.userNameMaxLength)
                    this._writeToLog("Error occured during reminding of forgotten password: userName length > userName maximal length, " + JSON.stringify(fields));
                if(userName.match(this._LIMITS.userNameValidationRegExp))
                    this._writeToLog("Error occured during reminding of forgotten password: userName.match(userNameValidationRegExp), " + JSON.stringify(fields));
            }

            //Вторая отсечка: если к этому моменту нашлись ошибки, можно не продолжать.
            if(formDataError) {
                res.send(JSON.stringify(resultObject));
                return;
            }

            this._knex(this._usersTable).select().where({"Login":login, "Name":userName})
            .then((dataObjectsArray) => {//Сюда попадаем, если select() благополучно вернула массив с объектами,
            //в которых заключены данные (dataObjectsArray - и есть этот массив).
                if(dataObjectsArray.length==0) { //Получен массив с нулевой длиной - т.е., пара логин + имя юзера в БД не найдена.
                    resultObject.loginOrUNameNotFound = true;
                    res.send(JSON.stringify(resultObject));
                }
                else {//Получен массив, как и полагается, из одного элемента (объект, куда записаны данные из 
                //считанной строки в БД с совпавшим логином).
    
                    //Источник - https://www.npmjs.com/package/passfather#options
                    const newPassword = this._passfather({
                        numbers: false,
                        uppercase: false,
                        lowercase: false,
                        symbols: false,
                        length: this._LIMITS.passwordMinLength, //Берём минимальную длину, т.к. считаем, что это временный 
                        //пароль: мы в попапе ответа посоветуем юзеру его поскорее сменить.
                        ranges: [ 
                            [[0x0030, 0x0039], //Числа 0-9 
                            [0x0061, 0x007A]]  //Латинские буквы в нижнем регистре
                        ]
                    });
                    
                    const newPasswordHash = this._bcrypt.hashSync(newPassword, Number(this._LIMITS.hashSaltRounds));
    
                    const userID = dataObjectsArray[0]["userID"];
                    const email = dataObjectsArray[0]["Email"];
                    
                    this._knex(this._usersTable).where({"userID": userID}).update({"Password": newPasswordHash})
                    .then(() => {
                        //Отправка письма.
    
                        const transporter = this._createNodemailerTransport();
    
                        const messageObject = {
                            from: process.env.EMAIL,
                            to: email,
                            subject: "Новый пароль на " + this._domain,
                            text: "Здравствуйте, " + userName + "! Ваш новый пароль: " + newPassword,
                            html: "<html><body><div>" + "Здравствуйте, " + userName + "! Ваш новый пароль: " + newPassword + "</div></body></html>"
                        };
                    
                        transporter.sendMail(messageObject, (err) => {
                            if(err) {
                                this._writeToLog("UserID: " + userID + ". Error of sending email with password during reminding of forgotten password: " + err, userID, true);
    
                                res.send(JSON.stringify(resultObject));
                            }
                            else res.send(JSON.stringify(resultObject));
                        }); 
                    }) 
                    .catch((err) => {
                        this._writeToLog("UserID " + userID + ". Error of updating password in database during reminding of forgotten password: " + err, userID, true);
    
                        resultObject.updateDBTableError = true;
                        res.send(JSON.stringify(resultObject));
                    }); 
                }
            })
            .catch((err) => {
                this._writeToLog("UserID " + userID + ". Error of selecting row during reminding of forgotten password: " + err, userID, true);
                
                resultObject.readDBTableError = true;
                res.send(JSON.stringify(resultObject));
            });  

        });
    }

    //С помощью токена проверяет, авторизован ли юзер.
    _checkAuthorisation (req, res) {
        try {
            const payload = this._jwt.verify(req.body, this._secretKeyForToken); 
            res.send(payload);
        } catch(err) {//Токен просрочен, недействителен или вообще не получен.
            res.status(this._RESP_STATUS_UNAUTHORISED).send(); //RESP_CODE.unauthorised
        }
    }

    _signIn (req, res) { //Бывшая _checkLoginPassword()
        const form = this._formidable();
        form.parse(req, (err, fields) => {
            let resultObject = {
                formParseError: false, //Не удалось распарсить пришедшую форму с данными юзера.
                incorrectLogin: false, //Недопустимый логин.
                incorrectPassword: false,
                loginNotFound: false,
                passwordNotFound: false,
                readDBTableError: false,
                jwtoken: null
            };
            let signInFormDataError = false;

            if(err) {
                resultObject.formParseError = err;
                //this._writeToLog(err);
                res.status(this._RESP_STATUS_BADREQUEST).send(JSON.stringify(resultObject));
                return;
            }

            const login = fields["login"];
            if(login.length < this._LIMITS.loginMinLength || login.length > this._LIMITS.loginMaxLength
            || login.match(this._LIMITS.loginValidationRegExp)) {
                resultObject.incorrectLogin = true;
                signInFormDataError = true;
            }
    
            const password = fields["password"];
            if(password.length < this._LIMITS.passwordMinLength || password.length > this._LIMITS.passwordMaxLength
            || password.match(this._LIMITS.passwordValidationRegExp)) {
                resultObject.incorrectPassword = true;
                signInFormDataError = true;
            }
            
            if(signInFormDataError) {
                res.status(this._RESP_STATUS_BADREQUEST).send(JSON.stringify(resultObject));
                return;
            }

            //Когда установить соединение с БД не удаётся, система после ряда попыток отправляет клиенту ответ со
            //статусом 500. Поэтому нам здесь, на сервере, не нужно делать ничего, чтобы обработать ситуацию с
            //несоединением - а вот на стороне клиента нужно обрабатывать статус 500.
        
            this._knex(this._usersTable).select().where({"Login":login})
            .then((dataObjectsArray) => {//Сюда попадаем, если select() благополучно вернула массив с объектами,
            //в которых заключены данные (dataObjectsArray - и есть этот массив).
                if(dataObjectsArray.length!=1) { //Получен либо массив с нулевой длиной - т.е., логин в БД не найден,
                //либо длина почему-то больше 1, т.е., нашлись аж 2+ акка с таким логином (чего, конечно, быть не должно).
                    resultObject.loginNotFound = true;
                    res.send(JSON.stringify(resultObject));
                }
                else {//Получен массив, как и полагается, из одного элемента (объект, куда записаны данные из 
                //считанной строки в БД с совпавшим логином).
            
                    //НАША ЗАДАЧА: извлечь из полученных из БД данных захешированный пароль, расшифровать и сравнить с тем, 
                    //что был прислан в запросе. Если совпадут - нужно создать токен, записать в него в качестве пэйлоада
                    //наши данные (удалив из них пароль (он там не нужен) и добавив IP, с которого пришёл запрос (он пригодится))
                    //и записать этот токен в куки ответа, чтоб он установился в куки пославшего запрос браузера. Затем
                    //нужно отправить ответ с этим куки, а в его тело записать наши данные из БД (userID, Login, Email, Name и т.д.).
                    //Они будут использоваться на стороне клиента (в частности, залогинившийся юзер будет их видеть).
          
                    let passwordHash = dataObjectsArray[0]["Password"]; //Извлекаем захешированный пароль.            

                    if(this._bcrypt.compareSync(password, passwordHash)) {//Расшифровка хэша и введённый пароль совпали.
                        const date = new Date(); //Текущее время.
                        let jwt_payload = Object.assign({}, dataObjectsArray[0]); 

                        delete jwt_payload["Password"]; //Удаляем из объекта инфу о пароле.
                
                        //Здесь можно произвести какие-то действия с IP-адресом, с которого пришёл запрос (req.ip).
            
                        const token = this._jwt.sign(jwt_payload, this._secretKeyForToken, { expiresIn: this._tokenValidityPeriod });
            
                        //Добавляем токен в куки ответа.
                        //res.cookie(this._tokenName, token, {sameSite: "Strict", secure: true});
                        res.cookie(this._tokenName, token);
                    
                        //!!От идеи устанавивать для куки атрибуты sameSite и secure пришлось отказаться, т.к.
                        //Google Chrome почему-то не хочет устанавливать у себя куку с этими атрибутами, приходящую
                        //с сервера (Firefox же всё устанавливает нормально). АНАЛОГИЧНО, если пытаться создать куку
                        //с этими атрибутами на стороне клиента, Chrome её не установит (в отличие от Firefox).
                       
                        //Установка атрибута куки sameSite="Strict" позволит этому куки прицепляться к запросам 
                        //только к тому домену, для которого он предназначен.
                        //А атрибут secure=true позволит этому куки прицепляться только к запросам по HTTPS.
                        //Источники:
                        // - https://expressjs.com/en/4x/api.html#res.cookie
                        // - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
                                
            
                        resultObject.jwtoken = jwt_payload;
                    
                        this._knex(this._usersTable).where({"userID": dataObjectsArray[0]["userID"]}).update({"LastVisit": this._createUTCDateStr(date, true)})
                        .then(() => { res.send(JSON.stringify(resultObject)); })
                        .catch((err) => {
                            this._writeToLog("Problem with update of LastVisit: " + login + " " + JSON.stringify(err)); 
                            res.send(JSON.stringify(resultObject));             
                        });
                    }
                    else {
                        resultObject.passwordNotFound = true;
                        res.send(JSON.stringify(resultObject));     
                    }
                }
            })
            .catch((err) => {
                let date = new Date(); 
                if(err) this._writeToLog("Selecting in table 'users' error: " + login + " " + this._createUTCDateStr(date, true) + " "+ JSON.stringify(err)); 
                resultObject.readDBTableError = true;
                res.send(JSON.stringify(resultObject));
            }); 
        });
    }

    _readGallery (req, res) {
        const bodyObj = JSON.parse(req.body);
        const userID = bodyObj.uID;
    
        const path = "./" + this._usersDir + "/" + userID + "/images/" + bodyObj.imgFolder;
        //Если this._fs.readdir() не прочитал директорию, потому что не нашёл её, он не считает это ошибкой - просто отправит
        //пустой массив files. Нам, однако, нужно точно знать, что произошла ошибка. Поэтому мы сперва будем проверять
        //существование папки с помощью this._fs.access().
    
    
        /*   
        //Имитация ошибки.
        let resultObject = {
            dirAccessErr: false,
            readDirErr: true,
            files: null
        };
        this._myTimeDelay(5000);
        res.send(JSON.stringify(resultObject));  
        return;
        */
        
        this._fs.access(path, (error) => {
            let resultObject = {
                dirAccessErr: false,
                readDirErr: false,
                files: null
            };

            if(error) {
                resultObject.dirAccessErr = true;
                //this._writeToLog("UserID: " + userID + ". Error of fs.access, " + path + ", app.post, F_URL.readGallery: " + JSON.stringify(err), userID, true);
                res.send(JSON.stringify(resultObject));  
            }
            else {
                this._fs.readdir(path, (err, files) => {
                    if(err) {
                        resultObject.readDirErr = true;
                        //this._writeToLog("UserID: " + userID + ". Error of fs.readdir, " + path + ", app.post, F_URL.readGallery: " + JSON.stringify(err), userID, true);
                    }
                    else {
                        resultObject.files = files;
                    }
                    res.send(JSON.stringify(resultObject));  
                });
            }
        });
    }

    _renameFile (req, res) {
        const userData = this._getUserDataFromToken(req.cookies[this._tokenName]);
        if(userData===null) { //Токен юзера просрочен или недействителен - в общем, юзер не авторизован.
            res.status(this._RESP_STATUS_UNAUTHORISED).send();
            return;
        }

        const userID = userData["userID"]; 
        const folder = req.cookies[this._cookieForFileRenaming]; //Имя папки с переименуемым файлом прислано в куки.
        const path = "./" + this._usersDir + "/" + userID + "/images/" + folder; //Пока Галерея позволяет оперировать только с файлами-картинками.
        const reqDataObject = JSON.parse(req.body); 
     
        const currentFName = reqDataObject.currentFName;
        const newFName = reqDataObject.newFName;
    
        let renamingError, readDirError;

        const readDirCallbackSendingResponse = (err, files) => {
            if(err) {
                readDirError = JSON.stringify(err);
                this._writeToLog("UserID: " + userID + ". Error of fs.readdir, " + path + " during file renaming operation: " + readDirError, userID, true);
            }

            const resultObject = {
                renamingErr: renamingError,
                readDirErr: readDirError,
                allFileNames: files
            };   

            res.send(JSON.stringify(resultObject));   
        };
      
        this._fs.access(path + "/" + newFName, (error) => {
            if(error) {//Файл с таким именем не найден - можно переименовывать.
                this._fs.rename(path + "/" + currentFName, path + "/" + newFName, (err) => {
                    if(err) {
                        renamingError = JSON.stringify(err);
                        this._writeToLog("UserID: " + userID + ". Error of fs.rename, currentName=" + path + "/" + currentFName + ", newName=" + path + "/" + currentFName + ": " + renamingError, userID, true);
    
                            
                        //Если возникла ошибка переименования, мы считываем и отправляем в ответе весь список файлов. 
                        this._fs.readdir(path, readDirCallbackSendingResponse);                
                    }
                    else {
                        const resultObject = {
                            renamingErr: renamingError,
                            readDirErr: null,
                            allFileNames: null
                        };   
                    
                        res.send(JSON.stringify(resultObject));    
                    }
                });
            }
            else {//Файл с именем newFName найден - значит, переименовывать нельзя
                renamingError = JSON.stringify({"errno": -17, "fname": newFName}); //17 - это код ошибки Linux EEXIST ("Файл существует").
                //Почему-то такие коды система вставляет в объект ошибки отрицательными - сделаю так и я.
    
                //Если файл с таким именем найден, следует считать и отправить весь список файлов. Пусть юзер получше разберётся,
                //что там может быть не так.
                this._fs.readdir(path, readDirCallbackSendingResponse); 
            }
        });
    }

    _removeFiles (req, res) {
        const userData = this._getUserDataFromToken(req.cookies[this._tokenName]);
        if(userData===null) { //Токен юзера просрочен или недействителен - в общем, юзер не авторизован.
            res.status(this._RESP_STATUS_UNAUTHORISED).send();
            return;
        }
        
        const folder = req.cookies[this._cookieForFilesRemoving];
        const fNamesToRemoveArr = JSON.parse(req.body);
        const userID = userData["userID"];
        const path = "./" + this._usersDir + "/" + userID + "/images/" + folder;

        let removingSuccessfulFNamesArr = [];
        let removingErrorsFNamesArr = [];

        let counter = 0;
        const fNamesToRemoveArrLength = fNamesToRemoveArr.length;
        for(let fName of fNamesToRemoveArr) {            
            this._fs.unlink(path + "/" + fName, (err) => {
                counter++;
                if(err) {
                    this._writeToLog("UserID: " + userID + ". Error of fs.unlink, " + path + "/" + fName + ",  during files removing operation: " + JSON.stringify(err), userID, true);
    
                    removingErrorsFNamesArr.push(fName);
                }
                else removingSuccessfulFNamesArr.push(fName);
                
                if(counter==fNamesToRemoveArrLength) {
                    this._fs.readdir(path, (err, files) => {
                        let resultObject;
                        
                        if(err) {
                            this._writeToLog("UserID: " + userID + ". Error of fs.readdir, " + path + ", during files removing operation: " + JSON.stringify(err), userID, true);
                    
                            resultObject = {
                                succRemovedFNames: removingSuccessfulFNamesArr,
                                failedRmvFNames: removingErrorsFNamesArr,
                                readDirErr: JSON.stringify(err),
                                allFileNames: null
                            };
                        }
                        else {    
                            resultObject = {
                                succRemovedFNames: removingSuccessfulFNamesArr,
                                failedRmvFNames: removingErrorsFNamesArr,
                                readDirErr: null,
                                allFileNames: files
                            };
                        }
                        
                        res.send(JSON.stringify(resultObject));
                    });
    
                }
            });
        }
    }

    _downloadFiles (req, res) {
        const userData = this._getUserDataFromToken(req.cookies[this._tokenName]);
        if(userData===null) { //Токен юзера просрочен или недействителен - в общем, юзер не авторизован.
            res.status(this._RESP_STATUS_UNAUTHORISED).send();
            return;
        }

        const userID = userData["userID"];
        const folder = req.cookies[this._cookieForFilesDownloading];
        const pathToUserFolder = "./" + this._usersDir + "/" + userID + "/";
        const pathToUserImgFolder = pathToUserFolder + "images/" + folder + "/";
        const fNamesArr = JSON.parse(req.body); 

        if(fNamesArr.length==0) {
            //Странный случай, но будет правильно его обработать.
            
            const errNote = "UserID: " + userID + ". Error: no filenames to download received.";
            this._writeToLog(errNote, userID, true);
            throw new Error("Error: no filenames to download received."); //Вся обработка запроса прерывается, и клиенту уходит
            //ответ со статусом 500. 
        }
        else if(fNamesArr.length==1) {
            //Нужно скачать картинку, а не архив.
            const fName = fNamesArr[0];
            const fReadStream = this._fs.createReadStream(pathToUserImgFolder + fName);
    
            fReadStream.on('error', (err) => {
                const errNote = "UserID: " + userID + ". Error of readable stream from image file " + folder + "/" + fName + ": " + JSON.stringify(err);
                this._writeToLog(errNote, userID, true);
                
                throw err;
            });        
            
            fReadStream.pipe(res);        
        }
        else if(fNamesArr.length>1) {
            const date = new Date();
            const dateYear = String(date.getUTCFullYear());
            const dateMonth = String(date.getUTCMonth()+1);
            const dateDay = String(date.getUTCDate());
            const dateHours = String(date.getUTCHours());
            const dateMinutes = String(date.getUTCMinutes());
            const dateSeconds = String(date.getUTCSeconds());
            const fullDateStr = dateYear + "-" + dateMonth + "-" + dateDay + "_" + dateHours + "-" + dateMinutes + "-" + dateSeconds;
            
            const zipName = this._imgArchiveToDownloadBasename + fullDateStr + ".zip";
            
            const pathToUserZIPFile = pathToUserFolder + "temp/" + zipName;
        
            const writeZIPStream = this._fs.createWriteStream(pathToUserZIPFile);    
        
            const archive = this._archiver('zip', {zlib: { level: 9 } /* Sets the compression level.*/});
    
            let reportObj = {
                fileName: zipName,
                problemFiles: []
            }        
    
            writeZIPStream.on('close', () => {
                const downloadZIPStream = this._fs.createReadStream(pathToUserZIPFile);
            
                const reportStr = JSON.stringify(reportObj);
                let reportStrLengthStr = String(reportStr.length);
                const rSLSLength = reportStrLengthStr.length;
                for(let i=rSLSLength+1; i<=this._LIMITS.lengthOfSubstringWithLengthOfDownloadingReport; i++) {
                    reportStrLengthStr += " ";
                }
    
                //Удаляем файл архива после того, как он весь скачался.
                downloadZIPStream.on("close", () => {
                    this._fs.unlink(pathToUserZIPFile, (err) => {
                        if(err) this._writeToLog("UserID: " + userID + ". Error of removing archive temp file. " + JSON.stringify(err));
                    });
                })
                res.write(reportStrLengthStr + reportStr);
                downloadZIPStream.pipe(res);  
            });
    
            writeZIPStream.on('error', (err) => {
                const errNote = "UserID: " + userID + ". Error of writable stream to archive temp file " + zipName + ": " + JSON.stringify(err);
                this._writeToLog(errNote, userID, true);
                
                this._fs.unlink(pathToUserZIPFile, (err) => {
                    if(err) this._writeToLog("UserID: " + userID + ". Error of removing archive temp file. " + JSON.stringify(err));
                });
                throw err;//Вся обработка запроса прерывается, и клиенту уходит ответ со статусом 500.
            });
            
            archive.on('error', (err) => {
                const errNote = "UserID: " + userID + ". Archiver error: " + zipName + " " + err.code + ", " + err.message;
                this._writeToLog(errNote, userID, true);
                
                this._fs.unlink(pathToUserZIPFile, (err) => {
                    if(err) this._writeToLog("UserID: " + userID + ". Error of removing archive temp file. " + JSON.stringify(err));
                });
                
                throw err; 
            });
        
            archive.on('warning', (err) => {
                const errNote = "UserID: " + userID + ". Archiver warning: " + zipName + " " + err.code + ", " + err.message;
                this._writeToLog(errNote, userID, true);
                if(err.code === 'ENOENT') {
                    //Нужно сообщить юзеру, что некоторые файлы не добавились.
    
                    //err.message имеет вид 
                    //ENOENT: no such file or directory, lstat '<путь к файлу>'
                    //Нам нужно извлечь имя файла.
                    const errMsg = err.message;
                    const startFNameSubstringIndex = errMsg.lastIndexOf('/') + 1;
                    let problemFileName = errMsg.slice(startFNameSubstringIndex);
                    problemFileName = problemFileName.slice(0, -1); //Срезаем кавычку в самом конце.
                    
                    //Кодируем, чтоб не иметь проблем с русскими буквами. 
                    //На стороне клиента имя файла сначала получат из буфера с переводом в кодировку utf-8, а затем
                    //декодируют с помощью decodeURIComponent().
                    reportObj.problemFiles.push(encodeURIComponent(problemFileName));
                }
                else {
                    const errNote = "UserID: " + userID + ". Archiver error: " + zipName + " " + err.code + ", " + err.message;
                    this._writeToLog(errNote, userID, true);
                
                    this._fs.unlink(pathToUserZIPFile, (err) => {
                        if(err) this._writeToLog("UserID: " + userID + ". Error of removing archive temp file. " + JSON.stringify(err));
                    });
                
                    throw err; 
                }
            });
    
        
            archive.pipe(writeZIPStream);

            for(let fName of fNamesArr) {
                archive.file(pathToUserImgFolder + fName, { name: fName });
            }
        
            //Источник: https://www.archiverjs.com/docs/archiver/#finalize
            //Finalizes the instance and prevents further appending to the archive structure (queue will continue 
            //til drained).
            //The end, close or finish events on the destination stream may fire right after calling this method, 
            //so you should set listeners beforehand to properly detect stream completion.
            //ПЕРЕВОД:
            //Завершает экземпляр и предотвращает дальнейшее добавление в структуру архива (очередь будет 
            //продолжаться до тех пор, пока не будет опустошена).
            //События end, close или finish в целевом потоке могут возникать сразу после вызова этого метода, 
            //поэтому вам следует заранее настроить прослушиватели для правильного определения завершения потока.
            archive.finalize();
    
    //Источник по созданию zip - https://nodejs.org/api/zlib.html#zlib_zlib
    
        }
    }

    _uploadFiles (req, res, overwrite) {
        const userData = this._getUserDataFromToken(req.cookies[this._tokenName]);
        if(userData===null) { //Токен юзера просрочен или недействителен - в общем, юзер не авторизован.
            res.status(this._RESP_STATUS_UNAUTHORISED).send();
            return;
        }

        const userID = userData["userID"];

        let folder;
        if(overwrite) folder = req.cookies[this._cookieForFilesOverwriting];
        else folder = req.cookies[this._cookieForFilesUploading];

        const path = "./" + this._usersDir + "/" + userID + "/images/" + folder;
        let uplResultsObject = {
            faultyUplByFileExistsArr: [],
            faultyUplByBadMimeTypeArr: [],
            successfullyUplFilesArr: [],
            uploadingFilesCount: 0  
        };

        const uploadingHandler = this._createUploadingHandler({uplDestinationDir: path, uplResultsObject, overwrite});
    
        uploadingHandler(req, res, (err) => {
            let uploadingError;
            
            if(err) {
                uploadingError = JSON.stringify(err);
                if(overwrite) this._writeToLog("UserID: " + userID + ". Error of files uploading/overwriting: " + uploadingError, userID, true);
                else this._writeToLog("UserID: " + userID + ". Error of files uploading: " + uploadingError, userID, true);
            }
    
            //Независимо от того, чем кончилась загрузка файлов, считываем директорию, куда они грузились, и 
            //отправляем список файлов в ней клиенту.
            //А ИМЕЕТ ЛИ СМЫСЛ ЭТО СЧИТЫВАНИЕ, если overwrite==true? Зачем оно? Ведь раз мы только перезаписываем 
            //файлы, их имена остаются прежними! ЭТО ИМЕЕТ СМЫСЛ, если одновременно может происходить какая-то 
            //другая файловая операция. Так что можно оставить эту схему, раз она всё равно перспективна.        
            this._fs.readdir(path, (err, files) => {
                let resultObject;
                
                if(err) {
                    const readDirError = JSON.stringify(err);
                    let reportSubStr;
                    if(overwrite) reportSubStr = "overwriting";
                    else reportSubStr = "uploading";
                    
                    this._writeToLog("UserID: " + userID + ". Error of fs.readdir, " + path + ", during files " + reportSubStr +  ": " + readDirError, userID, true);    
                   
                    resultObject = {
                        succUploads: uplResultsObject.successfullyUplFilesArr,
                        uploadingErr: uploadingError, 
                        faultyUploads_mimeType: uplResultsObject.faultyUplByBadMimeTypeArr,
                        faultyUploads_fileExists: uplResultsObject.faultyUplByFileExistsArr,
                        readDirErr: readDirError,
                        allFileNames: null
                    };                
                }
                else {
                    resultObject = {
                        succUploads: uplResultsObject.successfullyUplFilesArr,
                        uploadingErr: uploadingError, 
                        faultyUploads_mimeType: uplResultsObject.faultyUplByBadMimeTypeArr,
                        faultyUploads_fileExists: uplResultsObject.faultyUplByFileExistsArr,
                        readDirErr: null,
                        allFileNames: files
                    };
                }
    
                res.send(JSON.stringify(resultObject)); 
                
            });
    
        });
    }
    
    _createUploadingHandler ({uplDestinationDir, uplResultsObject, overwrite = false}) {
        return this._multer({
            storage: this._createMulterStorageConfig(uplDestinationDir), 
            fileFilter: this._createMulterFFilterFunc({uplDestinationDir, uplResultsObject, overwrite}), //Здесь аргументом,
            //разумеется, объект, а не деструктурирующее присваивание - имена его св-в совпадают с именами переменных, чьи
            //значения им присваиваются, поэтому используется такой синтаксис.
            //limits: {files: this._LIMITS.uploading_maxFilesNumber, fileSize: this._LIMITS.uploading_maxFileSize } 
            //fileSize РАБОТАЕТ НЕНАДЁЖНО!!! При слишком маленьком лимите она просто обрезает файл, вместо чтоб
            //остановить загрузку, и не генерирует при этом ошибку! При большем лимите может случиться то же, если
            //слишком большой файл окажется не первым в очереди на загрузку - тогда он просто подрежется.
            //По кол-ву файлов ограничение, вроде, срабатывает.
            //НУ И НАПЛЕВАТЬ! НА СТОРОНЕ КЛИЕНТА МЫ ПРЕДУПРЕЖДАЕМ, что файл слишком велик. Если юзер как-то обошёл
            //ограничение, а на сервере его файл подрезали - его проблемы!
            limits: {fileSize: this._LIMITS.uploading_maxFileSize }
        }).any(); 
//???
        //Надо будет потом сменить это any() на array(...).

        //Если нарушены limits, то вся загрузка прерывается и генерируется ошибка.
    }

    _createMulterStorageConfig (uplDestinationDir) {
        return this._multer.diskStorage({
            destination: uplDestinationDir,
            filename: (_, file, callback) => {
                callback(null, file.originalname); //Указываем, что при зарузке не нужно изменять имя файла 
                //(если не указать, оно изменится на абракадабру).
            }
        });
    }

    _createMulterFFilterFunc ({uplDestinationDir, uplResultsObject, overwrite = false}) {
        //uplDestinationDir - директория, в которую загружаются файлы.
        //uplResultsObject - объект с массивами, в которые заносятся имена успешно загруженных файлов, а также имена
        //файлов, которые загрузить не удалось - для каждой причины фейла есть свой массив. Также в объекте есть
        //счётчик загружаемого кол-ва файлов. Общий вид этого объекта:
        /*
        {
            faultyUplByFileExistsArr: [],
            faultyUplByBadMimeTypeArr: [],
            successfullyUplFilesArr: [],
            uploadingFilesCount: 0
        }    
        */
        //overwrite - если true, то все файлы грузятся с перезаписью одноимённых, если не true, то при наличии
        //в папке одноимённого файла загружаемый файл не грузится.

        return (req, file, callback) => {
        /*
            Обратите внимание, что req.body, возможно, еще не полностью заполнен. Это зависит от того, в каком 
            порядке клиент передает поля и файлы на сервер.
            (в источнике https://www.npmjs.com/package/multer - Note that req.body might not have been fully 
            populated yet. It depends on the order that the client transmits fields and files to the server.)
        */  
            const filePath = uplDestinationDir + "/" + file.originalname;

            //Казалось бы, в случае, когда overwrite=true, проверять mime-тип смысла не имеет: как файл, уже 
            //содержащийся в Галерее, который мы решили перезаписывать, может быть неправильного типа? Но злоумышленники
            //могут воспользоваться этим адресом для запроса и закачать какое-нибудь непотребство, если не будет
            //проверки.        
            //Если же overwrite===false, проверка, конечно, нужна.
            let isCorrectMimeType = false;
            for(let mimeType of this._LIMITS.uploading_allowedFileTypes) {
                if(file.mimetype==mimeType) {
                    isCorrectMimeType = true;
                    break;
                }
            }

            if(!isCorrectMimeType) {//Файл не принадлежит ни к одному из корректных mime-типов.
                uplResultsObject.faultyUplByBadMimeTypeArr.push(file.fieldname);
                //Возвращать file.fieldname, по большому счёту, нужно лишь для файлов из faultyUplByFileExistsArr, 
                //которые, возможно, будут после согласия юзера перезаписываться. Для успешно загруженных и для тех,
                //что не подошли из-за неверного типа или размера, можно было бы возвращать прямо имена. Но и здесь 
                //я в итоге решил возвращать индексы (т.е., file.fieldname), чтобы уменьшить объём передаваемых 
                //данных. Думаю, это важнее, чем сократить объём работы на стороне юзера.
    //???
                //ВОЗМОЖНО, следует придумать что-то такое же и для удаления файлов - чтоб передавались индексы 
                //какого-то массива, а не имена.
                
                callback(null, false);  //Запрещаем загрузку файла     
            }
            else { //Тип файла корректен.
                if(overwrite) {
                    //Если мы собираемся перезаписывать все файлы, разумеется, не нужно вызывать fs.access().
                    uplResultsObject.successfullyUplFilesArr.push(file.fieldname); 
                    uplResultsObject.uploadingFilesCount++;
                    if(uplResultsObject.uploadingFilesCount <= this._LIMITS.uploading_maxFilesNumber) callback(null, true); //Разрешаем загрузку файла   
                    else callback(null, false); //Запрещаем загрузку файла           
                }
                else {
                    this._fs.access(filePath, (err) => {
                        if (err) {//Файл не найден - т.е., можно загружать.
                            uplResultsObject.successfullyUplFilesArr.push(file.fieldname); 
                            uplResultsObject.uploadingFilesCount++;
                            if(uplResultsObject.uploadingFilesCount <= this._LIMITS.uploading_maxFilesNumber) callback(null, true);
                            else callback(null, false);
                        } 
                        else {
                            uplResultsObject.faultyUplByFileExistsArr.push(file.fieldname);
                            callback(null, false);
                        }
                    });
                }
            }
        }

    }
    

//=====================================
//Вспомогательные методы:

    _createNodemailerTransport() {
        return this._nodemailer.createTransport({
            host: this._nodemailerHost,
            port: this._nodemailerPort,
            secure: this._nodemailerSecure,    
            auth: {
                user: this._email,
                pass: this._nodemailerPassword
            },
            tls: {
                rejectUnauthorized: this._nodemailerRejectUnauthorized
            }
        });  
    }

    _getUserDataFromToken(token) {
        try {
            return this._jwt.verify(token, this._secretKeyForToken); 
        } catch {
            return null;
        }
    }

    _createErrorMessage (errID, strToInsert) {
        if(errID==this._ERR_CONSTRUCTOR_PARAM) {
            return "Constructor params object property '" + strToInsert + "' is not defined or has an invalid value!";
        }
        else return null;
    }
    
    /**
    * 
    * @param {string} message - текст сообщения, записываемого в лог-файл(ы).
    * @param {number} userID 
    * @param {boolean} writeToBothUserAndAdminLog - определяет, записывать ли сообщение в лог-файлы и юзера, и админа, или только админа.
    */
    _writeToLog (message, userID, writeToBothUserAndAdminLogs) {
        const date = new Date();
        const dateStr = this._createUTCDateStr(date, false);
    
        //Если задан userID, а параметр writeToBothUserAndAdminLogs не задан или не равен true, то запись делается только в лог-файл юзера.
        //Если задан userID, а writeToBothUserAndAdminLogs равен true, то запись делается в лог-файлы и юзера, и админа.
        //Если userID и writeToBothUserAndAdminLogs не заданы, то запись делается только в лог-файл админа.
        const numUID = Number(userID);
        if(numUID>0 && Number.isInteger(numUID)) {
            const userLogFName = this._usersDir + "/" + userID + "/logs/" + this._userLogFile;
    
            if(writeToBothUserAndAdminLogs===true) {
                this._fs.appendFileSync(this._adminLogFile, dateStr + " (UTC+0) "  + message + "\n");
                this._fs.appendFileSync(userLogFName, dateStr + " (UTC+0) "  + message + "\n");
            }
            else this._fs.appendFileSync(userLogFName, dateStr + " (UTC+0) "  + message + "\n");
        }
        else this._fs.appendFileSync(this._adminLogFile, dateStr + " (UTC+0) "  + message + "\n");
    }

    get _ERR_CONSTRUCTOR_PARAM() {
        return 1;
    }

    get _RESP_STATUS_OK() {
        return 200;
    }

    get _RESP_STATUS_BADREQUEST() {
        return 400;
    }

    get _RESP_STATUS_UNAUTHORISED() {
        return 401;
    }

    get _RESP_STATUS_NOTFOUND() {
        return 404;
    }

    get _RESP_STATUS_INTERNAL_SERVER_ERROR() {
        return 500;
    }

//=====================================
//Public methods:

    listen(port, callback) {
        this._app.listen(port, callback);
    }

    
}

module.exports = MediaGalleryServer;