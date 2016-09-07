# Okta-TaskManager-OpenID-Enabled-App

This is a demp application that demonstrates using Open ID for logging user into a web app. It uses Okta's sign in widget for
creating a user session and getting id token. There are three columns and 
tasks get added to middle one that is always current date when starting application. Scroll left and right to change date to add task. 
Application is basic with minimal UI for managing tasks and demonstarting that each user (authenticated via Open ID) has his/her own tasks.
This application uses Okta's universal directory, therefore user needs to exist in UD before signing in. 


# Requirements

Server code is written in node js and following libraries need to be installed via npm.

1) http

2) express

3) express-session

4) sqlite3

5) url

6) uuid

7) body-parser

8) jsonwebtoken

9) fs

Make sure Open ID is enabled for your org and you have created the open id app in Okta, by going to Applications -> Add Applications
-> Create New App -> Select Open ID and Web App from drop down. Set the redirect uri to "http://localhost:8081/"

Also, make sure that CORS is enabeld for http://localhost:8081/ in your org. Go to Security -> API -> CORS and add http://localhost:8081/

# Update Files to Your Environment 

Checkout the code and before you run change everything in <> to your environment. 

In login-widget.html change <org-name> to your Okta's org name and <clientId> to client id of your app you created in Okta. 

You would need to get the keys for your org to validate the signature of id token. Go to https://github.com/jpf/okta-jwks-to-pem and get keys using script in there. 

Once you have the keys, update pemKeys in server.js under endpoint /sso/oidc. For example.

