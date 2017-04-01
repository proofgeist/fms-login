# Login page For FileMaker Server 16

This handles all the OAuth dance for you, provided you have the FileMaker Server setup to allow login through one of the OAuth providers. Users can also login with a normal FileMaker username and password.

### Credits
This work relies heavily on the Sample Tableau connector that ships with FileMaker 16. I rippied out as much as could to get it down to whats needed to do perform it's function. But the styles and some of the code are essentially unchanged. I needed to get something working fast. I couldn't take the time to write it from scratch.

Overtime, I'll likely get rid of all the old code, and base it on a more modern framework.  But for now, this works.

### Installation
First, if you plan to use OAuth, set your FileMaker Server to use AOuth for logging in. If you can't log with the regular client using AOuth, you won't be able to with this.

Next drop this folder into the node-wip/public folder on FileMaker Server 16. Rename the folder to "login"

Navigate to https://<your-filemaker-server.com>/fmi/rest/login

You should get an error message telling you that the parameters are missing. That means you have it installed correctly

### Usage

Here is how it works. When you want to let somebody login to the server, you send the to the following URL:

https://<your-filemaker-server.com>/fmi/rest/login?callBack=<your-server/auth>&database=<db-to-login-to>&layout=<layout-to-login-to>

Notice the three query params. You use those to config the login
* callBack - the url where you will receive the results of the login.
* database - the fileMaker db you are using
* layout - the layout you want to use for logging in.

All of them are required.

After the person logs in, your callBackURL will get called with a bunch of query params. You need to parse those out. They will include the FM-DATA_TOKEN you need to make requests to FileMaker server's Data API. They will also include the oAuthIdentifier, and oAuthRequestID that you can use to 're-login' and get a new data token. If the user just used a regular user name and password you will get those back as well. This lets you get new Data-Tokens without haveing to send the user back through the AOuth procedure.

Frankly, getting the User Name and Password baack and holding on to them is not a good idea. But at this stage of experimentation, we need the flexibility. Hopefully someday we can get rid of the need to do that.

### Example
not done yet