This is a Authentication project's backend part in which we created the api's for authentication functionalities.

----------------------------------------------------------------------------------------------------------------------------
| In this we create api for registration of user, login, logout, account verification, password reset by sending the otp.  |
----------------------------------------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
| We uses some packages for backend of the project:                                                                   |
|     - npm i express cors dotenv nodemon jsonwebtoken mongoose bcryptjs nodemailer cookie-parser                     |
-----------------------------------------------------------------------------------------------------------------------     

-----------------------------------------------------------------------------------------------------------------------
|  Packages explained:                                                                                                |
|       - express → Web framework for building APIs/server                                                            |
|       - cors → Allows cross-origin requests (frontend ↔ backend)                                                    |
|       - dotenv → Loads environment variables from .env file                                                         |
|       - nodemon → Auto-restarts server on code changes (dev tool)                                                   |
|       - jsonwebtoken → For creating & verifying JWT tokens (auth)                                                   |
|       - mongoose → MongoDB ODM (database connection & schema)                                                       |
|       - bcryptjs → Password hashing (secure passwords)                                                              |
|       - nodemailer → Send emails (OTP, verification, etc.)                                                          |
|       - cookie-parser → Parse cookies from requests                                                                 |
-----------------------------------------------------------------------------------------------------------------------
