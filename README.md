# QE Website
## About
This website is for internal Red Hat use by the Network QE team.  To access you must be logged onto the Red Hat internal network or have a VPN running. It is hosted at [`http://netqe-infra01.knqe.lab.eng.bos.redhat.com:8009/`](http://netqe-infra01.knqe.lab.eng.bos.redhat.com:8009/). It uses Python Flask in order to handle requests for both API calls and regular website use.  The D3.js library was used to create the interactive graph that is generated after the form is completely filled out. The API calls are for use by the command line tool, however I have listed them below in case anyone else finds them useful.
## Running the Website
This website should automatically run on a server restart. However if it isn't just run the command:
```
$ screen -d -m python3.4 /root/api/app.py
```
This will start they Flask server. If the `mongo-db` server isn't running similarly run the command:

```
$ screen -d -m mongod --dbpath /root/data --auth
```
a
In most cases these two commands should make the website reachable. If it does not however, the most likely scenario is that one of the two is failing. To check if this is the case run the commands without detaching them (remove `screen -d -m`).

## Using the Website
The instructions on each page of the website are fairly straight forward.  There are two things to be mindful of when using it however:

1. On the dates page there is the option to update. This runs a script on the server that updates the current chosen months. It can take up to 10 minutes and won't occur immediately after so you may need to reload the page.  It is not a good idea to update every time because another update subprocess may already be running.

1. The graph only has 12 colors on its palette as of now and `number_of_lines = number_of_cards * number_of_labels` if this number exceeds 12 these points will just be black with no lines connecting them.

1. When updating charts.json you will need to reload the website before the changes take place

1. **To make sure that the website works as intended please use google chrome**

## Creating Your Own Credentials

1. Download the [`auth.py`](js/auth.py) file from the qeWebsite github repo and put it in a directory to work from

1. Go to the Google API Dashboard at [console.developers.google.com](console.developers.google.com)

1. Click `Credentials` at the bottom of the left side-bar

1. Click `Create Credentials` and select `OAuth client ID`

1. Select the `Other` radio button, give it a name and click `Create`

    * You might need to Configure your OAuth consent screen before you can select an option. This consists of entering a `Product name shown to users`

1. It will display your client ID and your client secret. Click `OK` to exit the dialog

1. On the Credentials dashboard click on the download button on the far right of the row for your new credentials

1. Rename the file `client_secret.json` and move it to the same directory as you put the `auth.py` file

1. Run the command

    ```
    $ sudo pip install --upgrade google-api-python-client oauth2client
    ```

1. Run the following commands to create the file `credentials.json`

    ```
    $ python3
    >>> import auth
    >>> auth.authorize()
    ```

1. Log into the website as root and replace the `credentials.json` and `client_secret.json` files with the ones you just created

## Command Line Tool
To install the command line tool first install python3.x, then run the command:
```
$ pip install qeGraphMaker
```
Further documentation of the command line tool can be found [here](https://github.com/KPostOffice/QETool_pip)

## Debugging
Most of the debugging information can be found under the running the website header.  If the website throws an error please submit a ticket and let us know so that we can get someone started on fixing it right away.

## API Endings
* `/charts` : GET JSON data that specifies structure of Google Sheets pages

* `/valid` :
    * `/tests` : GET all possible tests
    * `/cards` : GET all possible cards
    * `/subtests?test=<testName>` : GET all possible subtests given some test
    * `/types?test=<testName>&subtest=<subtestName>` : GET all possible types given some test and subtest
    * `/labels?test=<testName>&subtest=<subtestName>&type=<type>` : GET all possible labels given some test, subtest, and type


* `/update` : POST with arguments for `start` and `end` of form `MM-YYYY`.  Updates database between the two given months

* `/data` : GET request with optional args to queries the database

  **Arguments:**
    * test
    * type
    * cardName
    * subtest
    * epochStart
    * epochEnd
    * sheetId


* `/js/<fileName>` : get a CSS file that is used on the website
* `/css/<fileName>` : get a JS file that is used on the website
