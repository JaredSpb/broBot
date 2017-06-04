# broBot

In-browser bot building framework.
broBot is module-based, so all the real job is done by your modules. Framework itself only organizes them, runs certain module actions at the certain time, handles timers, settings and data.

broBot does not provide any end-user interface. If you want user to change setting, observe internal data or manupulate bot behaviour in some way (other than manualy changing internaly stored data), consider creating independant code for that.

## Quick start

1. Download broBot using git:
```
git clone https://github.com/JaredSpb/broBot.git
```
2. Copy 'dummy' dir to your project.
3. Edit 00-header.js file to match your needs.
4. Create your modules using 'dummy' file as a template.
5. Build the bot with 'build.pl' perl script, or manualy. Build process is just a plain concatenation of *.js files in obvious order.
6. Add the bot to your browser:
  * For Firefox: install Greasmonkey extension and just open bot file in browser (File-Open or ctrl-O). NB: file MUST have .user.js extension.
  * For Chrome: install Tampermonkey extension, enable it, move to Settings->Extensions->Tampermonkey->Options. Click the 'Add Script' button and copy-paste bot file contents into edit window.
   
