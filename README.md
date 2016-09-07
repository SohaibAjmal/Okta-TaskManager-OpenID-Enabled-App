# Okta-TaskManager-OpenID-Enabled-App

This is a demp application that demonstrates using Open ID for logging user into a web app. It uses Okta's sign in widget for
creating a user session and getting id token. There are three columns and 
tasks get added to middle one that is always current date when starting application. Scroll left and right to change date to add task. 
Application is basic with minimal UI for managing tasks and demonstarting that each user (authenticated via Open ID) has his/her own tasks.
This application uses Okta's universal directory, therefore user needs to exist in UD before signing in. 


# Required Libraries

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



