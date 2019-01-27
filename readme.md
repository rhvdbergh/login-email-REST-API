# REST API: Login System with Email Validation (Backend)

## Introduction
This repo contains a login system REST API created with Express Generator using MongoDB. The response is in JSON. Passwords are hashed.

## Installation and Setup
Fork this repo and run `npm install`. ENV variables need to be set OR replaced in the code. 
* Change the neccessary info in `SESSION_SECRET='YOUR_SECRET_HERE' EMAIL_ACCOUNT='ACCOUNT_USED_TO_SEND_HERE@SOMEWHERE.COM' EMAIL_PASS='EMAIL_PASS'` and copy/paste before the command `npm start`. 
* Next, open routes/users.js and changes the consts `APP_NAME` and `DOMAIN_URL` to the appropriate properties. 
* Delete the UTILITIES section at the bottom of users.js if this will not be needed.
* Change email messages if desired.
* Open routes/sendMail.js and set `SENDER_EMAIL_ADDRESS` to the correct address. (It is only necessary to change the name - e.g. "Signie"; it is best to leave the process.env.EMAIL_ACCOUNT to set the sending email account.)
* Change the `HOST` and `PORT` properties to the appropriate values.

## Use
The login system works by submitting GET and POST requests to the API.

### Create User
Send a POST request to `/users/create` with the following object (use JSON.stringify()):
* userName
* email
* password
* passwordConf

On success, a user will be created, automatically logged in, and the response will be JSON: 
```
{
  message: 'success',
  userName: 'user's name will be here',
  userId: 'user's unique id will be here - for use in e.g. keys'
}
```

### Log User In
Send a POST request to `/users/login` with the following object (use JSON.stringify()):
* email
* password
On success, the user will be logged in and the response will be JSON:
```
{
  message: 'success',
  userName: 'user's name will be here',
  userId: 'user's unique id will be here - for use in e.g. keys'
}
```

### Log User Out
Send a GET request to `/users/logout`. On success, the response will be JSON:
```
{
  message: 'success - user logged out'
}
```

### Authenticate User
If the frontend needs to test whether the user is logged in or not, send a GET request to `/users/auth`. On success, the response will be JSON:
```
{
  message: 'success',
  userName: 'user's name will be here',
  userId: 'user's unique id will be here - for use in e.g. keys'
}
```

### User Password Request
A user password request can be made by sending a request to `/users/reset` with the following object (use JSON.stringify()):
* email
On success, a token will be created and the response will be JSON:
```
{
  message: 'Password reset email sent',
  userName: 'anonymous
}
```
A link will be sent to the user's email with a token in the URL. Tokens are valid for 15 minutes. The link will be `/users/reset/token/[random token]`. On success, an email will be sent to the user informing them of the change and the response will be in JSON:
```
{
  message: 'success',
  user: 'anonymous'
}
Users are NOT logged in automatically after a password reset.


