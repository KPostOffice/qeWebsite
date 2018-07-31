# QE Website
## About
This website is for internal Red Hat use by the Network QE team.  To access you must be logged onto the Red Hat internal network or have a VPN running. It is hosted at [`http://netqe-infra01.knqe.lab.eng.bos.redhat.com:8009/`](http://netqe-infra01.knqe.lab.eng.bos.redhat.com:8009/). It uses Python Flask in order to handle requests for both API calls and regular website use.  The D3.js library was used to create the interactive graph that is generated after the form is completely filled out. The API calls are for use by the command line tool, however I have listed them below in case anyone else finds them useful.
## Running the Website
This website should automatically run on a server restart. However if it isn't just run the command:
```bash
screen -d -m python3.4 /root/api/app.py
```
This will start they Flask server. If the `mongo-db` server isn't running similarly run the command:

```bash
screen -d -m mongod --dbpath /root/data --auth
```

In most cases these two commands should make the website reachable. If it does not however, the most likely scenario is that one of the two is failing. To check if this is the case run the commands without detaching them (remove `screen -d -m`).

## Using the Website
The instructions on each page of the website are fairly straight forward.  There are two things to be mindful of when using it however:

1. On the dates page there is the option to update. This runs a script on the server that updates the current chosen months. It can take up to 10 minutes and won't occur immediately after so you may need to reload the page.  It is not a good idea to update every time because another update subprocess may already be running.

1. The graph only has 12 colors on its palette as of now and `number_of_lines = number_of_cards * number_of_labels` if this number exceeds 12 these points will just be black with no lines connecting them.

## Command Line Tool
To install the command line tool first install python3.x, then run the command:
```
pip install qeGraphMaker
```
Further documentation of the command line tool can be found [here]()

## Debugging

## API Endings
