#!flask/bin/python
from flask import Flask, request, jsonify, render_template, make_response, app
import json
import valid
import re
import subprocess
from config import collection, dateRegex

app = Flask(__name__)
app.debug = True

@app.route("/")
def index():
    return render_template("index.html",
                           navbar = [
                                      ("Home","/"),
                                      ("Documentation","https://github.com/KPostOffice/qeWebsite"),
                                      ("Online tool", "/cards")
                                    ],
                                    curr="Home"), 200

"""
    These methods are for dynamically generating valid lists based on current
    input.  Information is located in charts.json
"""
###############################################################################
@app.route("/charts", methods = ["GET"])
def getChart():
    file = open("charts.json")
    return jsonify(json.loads(file.read()))

@app.route("/valid/tests", methods = ["GET"])
def getTestReg():
    return jsonify(list(valid.validTests())), 200

@app.route("/valid/cards", methods = ["GET"])
def getCardsReg():
    return jsonify(list(valid.validCards())), 200

@app.route("/valid/subtests", methods = ["GET"])
def getSubtestReg():
    args = request.args
    return jsonify(list(valid.validSubtests(args["test"]))), 200

@app.route("/valid/types", methods = ["GET"])
def getTypesReg():
    args = request.args
    return jsonify(list(valid.validTypes(args["test"], args["subtest"]))), 200

@app.route("/valid/labels", methods = ["GET"])
def getLabelsReg():
    args = request.args
    return jsonify(list(valid.validLabels(args["test"], args["subtest"], args["type"]))), 200
###############################################################################

"""
    This route takes two dates and runs an update on the collection QE_Test_Data
"""
###############################################################################
@app.route("/update", methods = ["POST"])
def update():
    args = request.form
    if(not "start" in args or not re.match(dateRegex,args["start"]) or ("end" in args and not re.match(dateRegex, args["end"]))):
        return jsonify({"400 error": "Bad request"}), 400

    start = args["start"]
    end = args["start"] if not "end" in args else args["end"]
    subprocess.Popen(["python3.4", "dbUpdate.py", "-s", start, "-e", end])
    return "OK", 200

###############################################################################

"""
    Take any number of kwargs and run a search using them. Fields must match
    those that are in the collection QE_Test_Data to get results
"""
###############################################################################
@app.route("/data", methods = ["GET"])
def getData():
    args = request.args
    query = {}
    if("test" in args):
        query["test"] = args["test"]
    if("type" in args):
        query["type"] = args["type"]
    if("cardName" in args):
        query["cardName"] = args["cardName"]
    if("subtest" in args):
        query["subtest"] = args["subtest"]
    if("epochEnd" in args or "epochStart" in args):
        query["datetime"] = {}
        if("epochEnd" in args):
            query["datetime"]["$lte"] = float(args["epochEnd"])
        if("epochStart" in args):
             query["datetime"]["$gte"] = float(args["epochStart"])
    if("sheetId" in args):
        query["sheetId"] = args["sheetId"]

    data = (collection.find(
        query,
        projection = {
            "_id": False,
            "sheetId": True,
            "data": True,
            "datetime": True,
            "test": True,
            "subtest": True,
            "type": True
        })).sort("datetime", 1)

    return json.dumps(list(data)), 200


###############################################################################


"""These paths are for front end for people looking for interactive graphs"""
###############################################################################
@app.route("/cards", methods = ["GET"])
def genFormCards():
    data = list(valid.validCards())
    data.sort()
    return render_template("card.html", result = data,
                           navbar = [
                                      ("Home", "/"),
                                      ("Cards", "/cards")
                                    ],
                           curr = "Cards"), 200

@app.route("/tests", methods = ["GET"])

def genFormTests():
    cards = request.cookies.get("cards")
    # Validity check/rerouting
    ###########################################################################
    if(not cards):
        return render_template("reroute.html", page= "cards")
    ###########################################################################
    data = list(valid.validTests())
    data.sort()
    response = make_response(render_template("test.html", result = data,
                                             navbar = [
                                                        ("Home", "/"),
                                                        (re.sub(r'[\'\"\[\]]', r'', str(cards)), "/cards"),
                                                        ("Tests", "/tests")
                                                      ],
                                             curr = "Tests"))
    return response, 200

@app.route("/subtests", methods = ["GET"])
def genFormSubtests():
    test = request.cookies.get("test")
    cards = request.cookies.get("cards")
    # Validity check/rerouting
    ###########################################################################
    if(not cards):
        return render_template("reroute.html", page = "cards")
    elif not test:
        return render_template("reroute.html", page = "tests")
    ###########################################################################

    data = list(valid.validSubtests(test))
    data.sort()
    response = make_response(render_template("subtest.html", result = data,
                                             navbar = [
                                                        ("Home", "/"),
                                                        (re.sub(r'[\'\"\[\]]', r'', str(cards)), "/cards"),
                                                        (test, "/tests"),
                                                        ("Subtest", "/subtests")
                                                      ],
                                             curr = "Subtest"))
    return response, 200

@app.route("/types", methods = ["GET"])
def genFormTypes():
    subtest = request.cookies.get("subtest")
    test = request.cookies.get("test")
    cards = request.cookies.get("cards")

    # Validity check/rerouting
    ###########################################################################
    if(not cards):
        return render_template("reroute.html", page = "cards")
    elif not test:
        return render_template("reroute.html", page = "tests")
    elif not subtest or not subtest in valid.validSubtests(test):
        return render_template("reroute.html", page = "subtests")
    ###########################################################################

    data = list(valid.validTypes(test, subtest))
    data.sort()
    response = make_response(render_template("type.html", result = data,
                                             navbar=[
                                                      ("Home", "/"),
                                                      (re.sub(r'[\'\"\[\]]', r'', str(cards)), "/cards"),
                                                      (test, "/tests"),
                                                      (subtest, "/subtests"),
                                                      ("Type", "/types")
                                                    ],
                                            curr = "Type"))
    return response, 200

@app.route("/labels", methods = ["GET"])
def genFormLabels():
    type = request.cookies.get("type")
    subtest = request.cookies.get("subtest")
    test = request.cookies.get("test")
    cards = request.cookies.get("cards")

    # Validity check/rerouting
    ###########################################################################
    if(not cards):
        return render_template("reroute.html", page = "cards")
    elif not test:
        return render_template("reroute.html", page = "tests")
    elif not subtest or not subtest in valid.validSubtests(test):
        return render_template("reroute.html", page = "subtests")
    elif not type or not type in valid.validTypes(test, subtest):
        return render_template("reroute.html", page = "type")
    ###########################################################################

    data = list(valid.validLabels(test, subtest, type))
    data.sort()
    response = make_response(render_template("label.html", result = data,
                                             navbar = [
                                                        ("Home", "/"),
                                                        (re.sub(r'[\'\"\[\]]', r'', str(cards)), "/cards"),
                                                        (test, "/tests"),
                                                        (subtest, "/subtests"),
                                                        (type, "/types"),
                                                        ("Labels", "/labels")
                                                      ],
                                             curr = "Labels"))
    return response, 200

@app.route("/dates", methods = ["GET"])
def genDatePage():
    labels = request.cookies.get("labels")
    type = request.cookies.get("type")
    subtest = request.cookies.get("subtest")
    test = request.cookies.get("test")
    cards = request.cookies.get("cards")
    # Validity check/rerouting
    ###########################################################################
    if(not cards):
        return render_template("reroute.html", page = "cards")
    elif not test:
        return render_template("reroute.html", page = "tests")
    elif not subtest or not subtest in valid.validSubtests(test):
        return render_template("reroute.html", page = "subtests")
    elif not type or not type in valid.validTypes(test,subtest):
        return render_template("reroute.html", page = "type")
    elif not labels or not set(labels) <= set(valid.validLabels(test, subtest, type)):
        return render_template("reroute.html",page = "labels")
    ###########################################################################

    response = make_response(render_template("date.html",
                                             navbar = [
                                                        ("Home", "/"),
                                                        (re.sub(r'[\'\"\[\]]', r'', str(cards)), "/cards"),
                                                        (test, "/tests"),
                                                        (subtest, "/subtests"),
                                                        (type, "/types"),
                                                        (re.sub(r'[\'\"\[\]]', r'', str(labels)), "/labels"),
                                                        ("Dates", "/dates")
                                                      ],
                                             curr = "Dates"))

    return response, 200

@app.route("/graph", methods=["GET"])
def genGraph():
    start = request.cookies.get("start")
    end = request.cookies.get("end")
    update = request.args.get("update") == "on"
    cards=request.cookies.get("cards")
    test=request.cookies.get("test")
    subtest=request.cookies.get("subtest")
    type=request.cookies.get("type")
    labels=request.cookies.get("labels")
    start_month = start[0:7]
    end_month = end[0:7]
    print(start_month)

    if update:
        print(subprocess.Popen(["python3.4", "dbUpdate.py", "-s", start_month, "-e", end_month]))

    response = make_response(render_template("graph.html",
                                             navbar = [
                                                        ("Home","/"),
                                                        (re.sub(r'[\'\"\[\]]',r'',str(cards)), "/cards"),
                                                        (test,"/tests"),
                                                        (subtest,"/subtests"),
                                                        (type,"/types"),
                                                        (re.sub(r'[\'\"\[\]]',r'',str(labels)), "/labels"),
                                                        (start+" to "+end,"/dates"), ("Graph","/graph")
                                                      ],
                                             curr="Graph"))

    return response, 200

@app.route("/includeDates", methods = ["GET"])
def getIncludeDates():
    return 200

###############################################################################


@app.route("/js/<fileName>", methods = ["GET"])
def getJavascript(fileName):
    return render_template("js/" + fileName), 200



@app.route("/css/<fileName>", methods = ["GET"])
def getCss(fileName):
    return render_template("css/" + fileName), 200, {"Content-Type": "text/css"};

"""
    Gets data for interactive graph. Gets all datapoints rather than a range
    because it"s easier to store the extra data than reload everytime the graph
    is changed
"""
###############################################################################
@app.route("/genData", methods=["GET"])
def getSimpleData():
    query = {
        "card": card,
        "test": test,
        "subtest": subtest,
        "type": type,
        "label": label
    }

    date = collection.find(
        query,
        projection = {
            "_id": False,
            "datetime": True,
            "value": True
        }
    ).sort("datetime",1)

    return json.dumps(list(data)), 200
###############################################################################

if __name__ == "__main__":
    app.run(debug=True)
