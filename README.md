# Media Gallery:
Media Gallery is a repository of media files (currently only images) with registration system and simple interface for viewing, uploading, downloading and renaming of files. This is a single page application. Its backend is written in Node.js and uses MySQL, frontend is written in JS + React and requires module bundler, by default, Webpack 4.

[![Demo](https://res.cloudinary.com/marcomontalbano/image/upload/v1637067004/video_to_markdown/images/youtube--Bxeotln4xIg-c05b58ac6eb4c4700831b2b3070cd403.jpg)](https://youtu.be/Bxeotln4xIg "Demo")

# It's important!
  - your host should be configured to work over https. Otherwise, there will be difficulties with confirming registration of a new user by the link in the confirmation e-mail;  
  - the frontend code is adapted for bundling by Webpack 4. Using a different Webpack version (for example, Webpack 5) may cause bugs in the built product. This version of Webpack is set in package.json, and the default configuration file `webpack-config.js` is adapted for her as well.

# Getting started:
 1. Place the repository content in your project's folder.  

 2. Install dependencies specified in `package.json`, using "npm install" or "yarn install" commands.

 3. You have to create a folder for where media files uploaded by users, as well as users log files and temporary files will be stored. Within the framework of this README text let's call it `usersContent`. This folder should be located in the same place as the "src" and "public" folders and the rest of the repository content obtained when executing step 1.  
 Inner structure of `usersContent`:  
![Inner structure of users content folder](https://user-images.githubusercontent.com/58402455/142694035-78b59148-83f7-45da-8544-2e23a712d537.png)  
 You **should not** create all these subfolders in `usersContent` folder - they will be created automatically when new user's account is activated. You are just creating an empty folder.

4. You also have to create a MySQL database and 2 tables in it. One table (conventionally referred to as `pre_users`) is intended for users, who have pre-registered; the other (conventionally referred to as `users`) is for those, who have finally registered, i.e., confirmed registration by clicking on the link in confirmation e-mail.  
SQL commands to create these tables via phpMyAdmin interface:  

    >CREATE TABLE pre_users  
    (  
    N INT PRIMARY KEY AUTO_INCREMENT,  
    PreID VARCHAR(12) UNIQUE,  
    Login VARCHAR(20) UNIQUE,   
    Password VARCHAR(60),  
    Name VARCHAR(20) UNIQUE,  
    Email VARCHAR(256) UNIQUE,  
    Timestamp VARCHAR(15),  
    VES boolean NOT NULL DEFAULT false  
    ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci AUTO_INCREMENT=1;  

    >CREATE TABLE users  
    (  
    userID INT PRIMARY KEY AUTO_INCREMENT,  
    Login VARCHAR(20) UNIQUE,  
    Password VARCHAR(60),  
    Name VARCHAR(20) UNIQUE,  
    Email VARCHAR(256) UNIQUE,  
    Date VARCHAR(20),  
    LastVisit VARCHAR(20)  
    ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci AUTO_INCREMENT=1;  

5. Next, you should customize parameters in src/ControlsAndAPI.js - domain name of your site, your e-mail, and so on. Pay special attention to the params that are used both on the client side and on the server side - their values must be identical. For example, the allowed lengths of password and login, regular expressions that define the allowed characters in these params. The params required on the server side are described in the section `MediaGalleryServer API`.

6. Configure the server part of the application. The functionality of the Media Gallery itself is concentrated in the MediaGalleryServer class, which must be exported from the module `MediaGalleryServer.js `. You need to create an instance of this class in the code that will accept client requests (let's call it conditionally `server.js `). As an argument to the MediaGalleryServer constructor, you need to pass an object with configuration parameters (see the detailed description below, in the section `MediaGalleryServer API`). Then let the created instance of MediaGalleryServer listening your port using the MediaGalleryServer.listen() method.
    ><span style="color:#8B4513"><em>server.js:</em></span>  
    const MediaGalleryServer = require("./MediaGalleryServer.js");  
    const mediaGalleryParams = {  
    &nbsp;&nbsp;domain: "anydomain.com",  
    &nbsp;&nbsp;email: "any@any.ru",  
    &nbsp;&nbsp;<span style="color:green">//...other params listed in the section "MediaGalleryServer API"</span>  
    }  
    const mglrServer = new MediaGalleryServer(mediaGalleryParams);  
    mglrServer.listen(<span style="color:green">/\*your port\*/</span>);  

7. Build the front of application.


## MediaGalleryServer API.
### Properties of the object to be passed to the constructor as an argument:
 - **domain** - the domain name of your site (without path, just like "domain.com");
 - **email** - the email address, from which emails, contained account activation links, will be sent;
 - **indexFile** - the basic html-file of your Single Page Application with a relative path. It should not start with "/". For example, "FolderName/index.html";
 - **staticFilesFolder** - the folder in which (or in whose subfolders) static files will be searched by default when a request for them comes from the client (for some static files, for example, for design element images, other, special folders are specified in the parameters). It should not start or end with "/". Includes a relative path to the folder. For example, "IntermediateFolder1/../IntermediateFolderN/staticFilesFolder";
 - **siteDesignElementsUrlPath** - the "path"-part of the url of the client request for a site design static element (a picture). It should end with "/" and should not start with it. **We don't recommend** making this parameter match the actual folder where the design elements are located (this folder is set in the `siteDesignElementsFolder` parameter): there is no need to show the client the internal structure of the site. The request handler in the MediaGalleryServer code allows you to extract the design elements from a folder that is not associated with the "path" from the request url;
 - **galleryImagesUrlPath** - the "path"-part of the url of the client request for a user's image stored in the Gallery. It should end with "/" and should not start with it. Since a separate folder is created for images of each registered user, the galleryImagesUrlPath cannot match all such folders - however, for security reasons, **we don't recommend** making it match any part of the path to them that is the same for all folders. The site visitor should not know anything about the folders where the private content of registered users is stored;
 - **siteDesignElementsFolder** - the folder (with a relative path) containing the site design elements. It should not start or end with "/";
 - **userInitialAlbum** - the name of the Gallery album that is created by default for each registered user. Each user has at least one album containing their content. He can create other albums as well. Currently, the functionality of working with albums has not yet been created, however, one album is already being created for each user during registration with the name specified in userInitialAlbum;
 - **userAlbumInvalidCharsRegExp** - a regular expression that specifies invalid characters in the album name;
 - **apiUrls** - a subobject with urls of client api requests. Urls should start with "/";
   - **apiUrl_signingIn** - url of request for logging in;
   - **apiUrl_checkAuth** - url of request for checking of authorisation;
   - **apiUrl_preRegistration** - url of request for preliminary registration;
   - **apiUrl_accActivation** - url of request for account activation;
   - **apiUrl_fileRenaming** - url of request for file renaming
   - **apiUrl_readAlbum** - url of request for reading of the Gallery album;
   - **apiUrl_flsUploading** - url of request for uploading files to the Gallery;
   - **apiUrl_flsUplOverwriting** - url of request for uploading files with overwriting files with the same name;
   - **apiUrl_flsRemoving** - url of request for deletion of files from the Gallery;
   - **apiUrl_changeForgottenPsw** - url of request for generation of a new password to replace the forgotten one;
   - **apiUrl_changePsw** - url of request for changing the password by user;
   - **apiUrl_flsDownloading** - url of request for downloading files from the Gallery;
 - Cookies, used in file operations (uploading, deletion, renaming, downloading), contain the name of the Gallery album, where the files are located. It is desirable that the cookie names indicate the operation being performed and the essence of this cookie content. 
   - **cookieForFilesRemoving** - the name of the cookie used in the file deletion operation;
   - **cookieForFilesUploading** - the name of the cookie used when uploading files;
   - **cookieForFilesOverwriting** - the name of the cookie used in the files uploading+overwriting operation;
   - **cookieForFileRenaming** - the name of the cookie used when renaming the file;
   - **cookieForFilesDownloading** - the name of the cookie used when downloading files;
 - **tokenParams** - a subobject with authorization JW-token parameters;
   - **secretKeyForToken** - string-the key for generating the token;
   - **tokenName** - the name of the token;
   - **tokenValidityPeriod** - token validity period, by default, `"30min"`;
 - **imgArchiveToDownloadBasename** - the base part of the name of the archive with files that is created and downloaded from the Gallery when you need to download more than one file. The full name of the archive looks something like this: basenameYear-Month-Day_Hours-Minutes-Seconds. The default value is `"images_"`;
 - **nodeMailerParams** - a subobject with parameters, used by the `nodemailer` Node module, which is intended for sending emails. These parameters are used as property values in the argument object of the `createTransport()` method;
   - **nodemailerHost** - as the value of the `host` property;
   - **nodemailerPassword** - as the value of the `auth.pass` property;
   - **nodemailerPort** - as the value of the `port` property (by default, `587`);
   - **nodemailerSecure** - as the value of the `secure` property (by default, `false`);
   - **nodemailerRejectUnauthorized** - as the value of the `tls.rejectUnauthorized` property (by default, `false`);
 - **dbConnectionParams** - a subobject with parameters for connecting the MySQL database. These parameters are used as property values in the configuration object passed to [Knex](https://knexjs.org/#Installation-browser "Knex"):  
    >const knex = require('knex')({  
  &nbsp;&nbsp;client: 'mysql',  
  &nbsp;&nbsp;connection: {  
  &nbsp;&nbsp;&nbsp;&nbsp;host : '127.0.0.1',  
  &nbsp;&nbsp;&nbsp;&nbsp;port : 3306,  
  &nbsp;&nbsp;&nbsp;&nbsp;user : 'your_database_user',  
  &nbsp;&nbsp;&nbsp;&nbsp;password : 'your_database_password',  
  &nbsp;&nbsp;database : 'myapp_test'  
  &nbsp;&nbsp;}  
  });
   - **mySQLPath** - as the value of the `client` property;
   - **dbConnectionHost** - as the value of the `connection.host` property;
   - **dbConnectionUser** - as the value of the `connection.user` property;
   - **dbConnectionDataBase** - as the value of the `connection.database` property;
   - **dbConnectionPassword** - as the value of the `connection.password` property;
 - **usersDir** - the name of the folder, where the content uploaded by users is stored, as well as their temporary files and log files. Should not start or end with "/";
 - **usersTable** - the name of the table in the MySQL database, where information about users who have confirmed registration (i.e., activated their accounts) is stored;
 - **preUsersTable** - the name of the table in the MySQL database, where information about preliminary registered users is stored;
 - **preUserIDStrLength** - the length of the ID-string of the pre-registered user. This ID is randomly generated and used in the `preUsersTable` table. By default, `12`;
 - **userLogFile** - an universal name for personal log files, that are created for users who have confirmed registration. Such a log file is intended for recording events directly related to this user. `userLogFile` should not include the path to the file. The default value is `"log.txt "`;
 - **adminLogFile** - the name (without path) of the log file for event records concerning the entire site. The default value is `"_LOG.txt"`;
 - **activationLinkValidityPeriodInMillisec** - the validity period in milliseconds of the account activation link, contained in the email, that is sent to the pre-registered user. By default, `86400000`;
 - **activationLinkValidityPeriodInDays** - the same validity period in days. By default, `1`;
 - The following are the parameters, that should contain numeric codes of account activation results. These codes are used to generate an activation report, which is shown to the user after he clicks on the activation link in the email.
   - **activationResultCode_success** - a code corresponding to successful activation;
   - **activationResultCode_preUserIDIncorrect** - a code corresponding to the situation, when the pre-registered user ID in the table `preUsersTable`, passed through the activation link url, is incorrect;
   - **activationResultCode_preUserIDNotFound** - a code corresponding to the situation, when the pre-registered user ID was not found in the table `preUsersTable`;
   - **activationResultCode_linkExpired** - a code corresponding to the situation, when the activation link has expired;
   - **activationResultCode_preUsersTableReadingError** - a code corresponding to the situation, when it was not possible to read user data from the table `preUsersTable`;
   - **activationResultCode_preUsersTableDataDeletionError** - a code corresponding to the situation, when it was not possible to delete user data from the table `preUsersTable` (this data becomes unnecessary after the account activation and should be deleted);
   - **activationResultCode_usersTableUpdateError** - a code corresponding to the situation, when it was not possible to add user data to the table of users, who confirmed registration (`usersTable`);
   - **activationResultCode_userFolderAlreadyExists** - a code corresponding to the situation, when, trying to create a subfolder for a user in the users folder (see the `usersDir` parameter), it turned out that such a subfolder already exists;
   - **activationResultCode_userFolderCreationError** - a code corresponding to the situation, when it was not possible to create a subfolder for the user in the folder `usersDir`;
   - **activationResultCode_techWorks** - a code corresponding to the situation, when the site is undergoing technical work, and accounts should not be activated at the moment;
 - **loginMinLength** - minimum user login length. By default, `6`;
 - **loginMaxLength** - maximum user login length. By default, `20`;
 - **loginValidationRegExp** - a regular expression to check the correctness of the user login. By default, `/[^A-Za-z0-9_-]/g`;
 - **passwordMinLength** - minimum user password length. By default, `6`;
 - **passwordMaxLength** - maximum user password length. By default, `20`;
 - **passwordValidationRegExp** - a regular expression to check the correctness of the user password. By default, `/[^A-Za-z0-9]/g`;
 - **userNameMinLength** - minimum username length. By default, `6`;
 - **userNameMaxLength** - maximum username length. By default, `20`;
 - **userNameValidationRegExp** - a regular expression to check the correctness of the username. By default, `/[^ёЁA-Za-zА-Яа-я0-9 _-]/g`;
 - **emailMaxLength** - maximum user email length. By default, `256`;
 - **emailPatternRegExp** - a regular expression to check the correctness of the email address. By default, `/^[A-Za-z0-9_&№!~\-\+\{\}\$\?\^\*]+@[A-Za-z0-9-]+\.([A-Za-z]{1,6}\.)?[A-Za-z]{2,6}$/i`;
 - **uploading_allowedFileTypes** - an array of file types allowed for uploading by user to the Gallery. By default, `["image/png", "image/jpeg"]`;
 - **uploading_maxFilesNumber** - the maximum number of files, that a user is allowed to upload to the Gallery at one time. By default, `8`;
 - **uploading_maxFileSize** - the maximum allowable size of a file to upload to the Gallery. By default, `5242880` bytes;
 - **lengthOfSubstringWithLengthOfDownloadingReport** - the length (in characters) of the substring, containing the length of the report string about the user downloading files from the Gallery. When a user wants to download more than one file, these files are placed in an archive (the `imgArchiveToDownloadBasename` parameter is used when naming it), which is sent to the user in the response stream. At the beginning of this stream, the report string and the substring, containing the length of this report string, are placed. Finally, the `lengthOfSubstringWithLengthOfDownloadingReport` param specifies the length of that substring. By default, `10`;
 - **hashSaltRounds** - the number of password hash iterations. By default, `9`.

### Public methods:
 - **listen(port, callback)** - start the MediaGalleryServer instance listening for connections; 
   - **port** - specifies the port we want to listen to;
   - **callback** - specifies a function to be executed when the listener has been added.
# License

Copyright (c) 2022, Aleksandr A. Kochnev rocketkite@yandex.ru

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.